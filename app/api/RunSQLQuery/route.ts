// app/api/RunSQLQuery/route.ts  (Next.js 13+ app router example)

import { type NextRequest, NextResponse } from "next/server";
import MongoDBManager from "@/lib/mongodb"; // Your MongoDB manager singleton
import snowflake from "snowflake-sdk";

export async function POST(request: NextRequest) {
  try {
    const { connectionId, sql } = await request.json();

    if (!connectionId || !sql) {
      return NextResponse.json(
        { error: "Connection ID and SQL query are required" },
        { status: 400 }
      );
    }

    // Fetch connection info from MongoDB
    const connection = await MongoDBManager.getConnectionById(connectionId);
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    if (connection.type !== "snowflake") {
      return NextResponse.json(
        { error: `Unsupported connection type: ${connection.type}` },
        { status: 400 }
      );
    }

    // Execute SQL query on Snowflake
    const result = await executeSnowflakeQuery(connection.config, sql);
    
    // console.log("Query excecuted successfully:" , result)

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Query execution failed:", error);
    return NextResponse.json(
      { error: "Query execution failed", details: error.message || error.toString() },
      { status: 500 }
    );
  }
}

async function executeSnowflakeQuery(config: any, sql: string) {
  const connection = snowflake.createConnection({
    account: config.account,
    username: config.username,
    password: config.password,
    warehouse: config.warehouse,
    database: config.database,
    schema: config.schema || "PUBLIC",
  });

  // Connect to Snowflake
  await new Promise<void>((resolve, reject) => {
    connection.connect((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Execute query and return results
  return new Promise<{
    columns: string[];
    rows: any[];
    executionTime: number;
    rowCount: number;
  }>((resolve, reject) => {
    const startTime = Date.now();

    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        connection.destroy();

        if (err) {
          reject(err);
        } else {
          const columns = stmt.getColumns().map((col) => col.getName());
          resolve({
            columns,
            rows,
            executionTime: (Date.now() - startTime) / 1000,
            rowCount: rows.length,
          });
        }
      },
    });
  });
}
