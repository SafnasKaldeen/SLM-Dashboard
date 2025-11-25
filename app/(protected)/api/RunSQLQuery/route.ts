// app/api/RunSQLQuery/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import snowflake from "snowflake-sdk";

// Map user email to Snowflake username
function mapEmailToSnowflakeUsername(email: string): string | null {
  const emailToSnowflakeMap: Record<string, string> = {
    'safnas@slmobility.com': 'SAFNAS',
    'hansika@slmobility.com': 'HANSIKA',
    'janaka@ascensionit.com': 'JANAKA',
    'rifkhan@slmobility.com': 'RIFKHAN',
    'zaid@slmobility.com': 'ZAID',
    'udara@slmobility.com': 'UDARA',
    'rasika@slmobility.com': 'RASIKA',
    'oshani@slmobility.com': 'OSHANI',
    'zainab@slmobility.com': 'ZAINAB',
  };

  return emailToSnowflakeMap[email.toLowerCase()] || null;
}

// Load your private key PEM string once
const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function POST(request: NextRequest) {
  try {
    // Get logged-in user session (THIS WAS MISSING!)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { sql, warehouse, database, schema } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { error: "SQL query is required" },
        { status: 400 }
      );
    }

    // Map user email to Snowflake username
    const snowflakeUsername = mapEmailToSnowflakeUsername(session.user.email || '');

    if (!snowflakeUsername) {
      return NextResponse.json(
        { error: "Unable to map user to Snowflake account" },
        { status: 403 }
      );
    }

    console.log(`[RunSQLQuery] Executing as Snowflake user: ${snowflakeUsername}`);

    // Snowflake config
    const config = {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: snowflakeUsername,
      privateKey: privateKey,
      warehouse: warehouse || "ADHOC",
      database: database || "ADHOC",
      schema: schema || "PUBLIC",
      role: "ACCOUNTADMIN",
      authenticator: "SNOWFLAKE_JWT",
    };

    // Execute SQL query on Snowflake
    const result = await executeSnowflakeQuery(config, sql);

    return NextResponse.json({ 
      success: true, 
      result,
      executedBy: snowflakeUsername 
    });
  } catch (error: any) {
    console.error("[RunSQLQuery] Query execution failed:", error);
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
    privateKey: config.privateKey,
    warehouse: config.warehouse,
    database: config.database,
    schema: config.schema,
    role: config.role,
    authenticator: config.authenticator,
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