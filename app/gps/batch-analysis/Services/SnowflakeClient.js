import snowflake from "snowflake-sdk";

const connectionConfig = {
  account: "ANGWRUH-ZI90300",
  username: "UsmaaN",
  password: "@Snowflake33340",
  warehouse: "COMPUTE_WH",
  database: "REPORT_DB",
  schema: "GPS_DASHBOARD",
};

// Remove all type annotations for JavaScript compatibility
export async function runQuery(query) {
  const connection = snowflake.createConnection(connectionConfig);

  return new Promise((resolve, reject) => {
    connection.connect((connErr) => {
      if (connErr) {
        console.error("❌ Snowflake connection error:", connErr);
        reject(connErr);
        return;
      }

      connection.execute({
        sqlText: query,
        complete: (execErr, stmt, rows) => {
          if (execErr) {
            console.error("❌ Snowflake query error:", execErr);
            reject(execErr);
          } else {
            resolve(rows);
          }
        },
      });
    });
  });
}
