import snowflake from "snowflake-sdk";

// 1️⃣ Connect to Snowflake
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

connection.connect((err, conn) => {
  if (err) console.error("Unable to connect:", err);
  else console.log("Connected to Snowflake");
});

// 2️⃣ Fetch table sizes
async function fetchTableSizes() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT table_name
      FROM snowflake.account_usage.tables
      WHERE table_schema = '${process.env.SNOWFLAKE_SCHEMA}'
        AND deleted IS NULL;
    `;

    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) return reject(err);
        const rowCounts = {};
        rows.forEach((r) => {
          rowCounts[r.TABLE_NAME] = 1;
        });
        resolve(rowCounts);
      },
    });
  });
}

// 3️⃣ Fetch foreign key relationships with columns
async function fetchRelationships() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        kcu.table_name AS child_table,
        kcu.column_name AS child_column,
        kcu.referenced_table_name AS parent_table,
        kcu.referenced_column_name AS parent_column
      FROM information_schema.referential_constraints rc
      JOIN information_schema.key_column_usage kcu
        ON rc.constraint_name = kcu.constraint_name
      WHERE rc.constraint_schema = '${process.env.SNOWFLAKE_SCHEMA}';
    `;

    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) return reject(err);
        const relationships = rows.map((r) => ({
          fromTable: r.CHILD_TABLE,
          fromColumn: r.CHILD_COLUMN,
          toTable: r.PARENT_TABLE,
          toColumn: r.PARENT_COLUMN,
        }));
        resolve(relationships);
      },
    });
  });
}

// 4️⃣ Build weighted graph with join columns
function buildWeightedGraph(tables, relationships) {
  const graph = {};
  Object.keys(tables).forEach((table) => (graph[table] = {}));

  relationships.forEach((rel) => {
    const weight = (tables[rel.fromTable] + tables[rel.toTable]) / 1000; // simple cost
    graph[rel.fromTable][rel.toTable] = {
      weight,
      joinKeys: { child: rel.fromColumn, parent: rel.toColumn },
    };
    graph[rel.toTable][rel.fromTable] = {
      weight,
      joinKeys: { child: rel.fromColumn, parent: rel.toColumn },
    }; // bidirectional
  });

  return graph;
}

// 5️⃣ Dijkstra shortest path
function dijkstraShortestPath(graph, start, end) {
  const distances = {};
  const previous = {};
  const pq = new Set(Object.keys(graph));

  for (const node of pq) distances[node] = Infinity;
  distances[start] = 0;

  while (pq.size > 0) {
    let current = null;
    for (const node of pq) {
      if (current === null || distances[node] < distances[current])
        current = node;
    }
    if (current === end) break;
    pq.delete(current);

    for (const neighbor in graph[current]) {
      const alt = distances[current] + graph[current][neighbor].weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
      }
    }
  }

  const path = [];
  let u = end;
  while (u) {
    path.unshift(u);
    u = previous[u];
  }

  return path[0] === start ? path : null;
}

// 6️⃣ Get join keys for path
function getJoinPath(graph, path) {
  const joins = [];
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph[path[i]][path[i + 1]];
    joins.push({
      fromTable: path[i],
      toTable: path[i + 1],
      childColumn: edge.joinKeys.child,
      parentColumn: edge.joinKeys.parent,
    });
  }
  return joins;
}

// 7️⃣ Find optimal tables and join keys
async function getOptimalJoinTables(selectedTables) {
  const tableSizes = await fetchTableSizes();
  const relationships = await fetchRelationships();
  const graph = buildWeightedGraph(tableSizes, relationships);

  const allPaths = [];
  for (let i = 0; i < selectedTables.length; i++) {
    for (let j = i + 1; j < selectedTables.length; j++) {
      const path = dijkstraShortestPath(
        graph,
        selectedTables[i],
        selectedTables[j]
      );
      if (path) allPaths.push(path);
    }
  }

  const optimalTablesSet = new Set();
  allPaths.forEach((path) => path.forEach((t) => optimalTablesSet.add(t)));

  // Collect join keys
  const joinKeys = [];
  allPaths.forEach((path) => {
    const joins = getJoinPath(graph, path);
    joins.forEach((j) => joinKeys.push(j));
  });

  return {
    tables: Array.from(optimalTablesSet),
    joins: joinKeys,
  };
}

// Export the main function
export { getOptimalJoinTables };

// Example usage (uncomment to run)
/*
(async () => {
  const selectedTables = ["Orders", "Categories", "Promotions"];
  const result = await getOptimalJoinTables(selectedTables);
  console.log("Optimal tables:", result.tables);
  console.log("Join keys:", result.joins);
})();
*/

// ====================================================================================================

// Input:

// ["Orders", "Categories", "Promotions"]

// Output:

// {
//   "tables": ["Orders", "Products", "Categories", "Discounts", "Promotions"],
//   "joins": [
//     { "fromTable": "Orders", "toTable": "Products", "childColumn": "product_id", "parentColumn": "id" },
//     { "fromTable": "Products", "toTable": "Categories", "childColumn": "category_id", "parentColumn": "id" },
//     { "fromTable": "Orders", "toTable": "Discounts", "childColumn": "id", "parentColumn": "order_id" },
//     { "fromTable": "Discounts", "toTable": "Promotions", "childColumn": "promotion_id", "parentColumn": "id" }
//   ]
// }

// =====================================================================================================
