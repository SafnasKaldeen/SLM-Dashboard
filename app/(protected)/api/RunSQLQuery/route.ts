// app/api/RunSQLQuery/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SnowflakeConnectionManager from "@/lib/snowflake_adhoc";

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { error: "SQL query is required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated (optional, for logging/auditing)
    const session = await getServerSession(authOptions);
    const requestingUser = session?.user?.email || session?.user?.username || "system";
    
    console.log(`[RunSQLQuery] User ${requestingUser} executing SQL query`);

    // Execute the query (connection manager handles everything)
    const result = await SnowflakeConnectionManager.executeQuery(sql, true);
    const status = await SnowflakeConnectionManager.getConnectionStatus();

    return NextResponse.json({ 
      success: true, 
      result,
      executedBy: requestingUser,
      snowflakeUser: status.username
    });
  } catch (error: any) {
    console.error("[RunSQLQuery] Query execution failed:", error);
    
    // Handle authentication errors specifically
    if (error.message?.includes('Authentication required')) {
      return NextResponse.json(
        { error: "Authentication required", details: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: "Query execution failed", 
        details: error.message || error.toString() 
      },
      { status: 500 }
    );
  }
}