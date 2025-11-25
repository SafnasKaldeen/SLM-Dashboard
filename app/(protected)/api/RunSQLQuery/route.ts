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
    // ✅ Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      console.log("[RunSQLQuery] ❌ Authentication failed - no session or email");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { error: "SQL query is required" },
        { status: 400 }
      );
    }

    // ✅ Map logged-in user email to Snowflake username
    const snowflakeUsername = mapEmailToSnowflakeUsername(session.user.email);

    if (!snowflakeUsername) {
      console.log("[RunSQLQuery] ❌ No Snowflake mapping found for:", session.user.email);
      return NextResponse.json(
        { error: `No Snowflake account mapping found for ${session.user.email}` },
        { status: 403 }
      );
    }

    console.log(`[RunSQLQuery] ✅ Executing query as Snowflake user: ${snowflakeUsername} (${session.user.email})`);

    // ✅ Use the dynamically mapped username
    const config = {
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: snowflakeUsername, // ← Dynamic username based on logged-in user
      privateKey: privateKey,
      warehouse: "ADHOC",
      database: "ADHOC",
      schema: "PUBLIC",
      role: "ACCOUNTADMIN",
      authenticator: "SNOWFLAKE_JWT",
    };

    // Execute SQL query on Snowflake
    const result = await executeSnowflakeQuery(config, sql);

    return NextResponse.json({ 
      success: true, 
      result,
      executedBy: snowflakeUsername // ← Return who executed the query
    });
  } catch (error: any) {
    console.error("[RunSQLQuery] ❌ Query execution failed:", error);
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
      if (err) {
        console.error("[Snowflake] Connection failed:", err);
        reject(err);
      } else {
        console.log("[Snowflake] ✅ Connected successfully as:", config.username);
        resolve();
      }
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
          console.error("[Snowflake] Query failed:", err);
          reject(err);
        } else {
          const columns = stmt.getColumns().map((col) => col.getName());
          console.log("[Snowflake] ✅ Query succeeded, rows:", rows?.length || 0);
          resolve({
            columns,
            rows: rows || [],
            executionTime: (Date.now() - startTime) / 1000,
            rowCount: rows?.length || 0,
          });
        }
      },
    });
  });
}