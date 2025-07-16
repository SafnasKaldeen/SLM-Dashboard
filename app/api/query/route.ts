import { NextRequest, NextResponse } from 'next/server';
import SnowflakeConnectionManager from '@/lib/snowflake';

export async function POST(req: NextRequest) {
  try {
    const { sql } = await req.json();

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid SQL' }, { status: 400 });
    }

    await SnowflakeConnectionManager.connect();

    const connection = SnowflakeConnectionManager.getConnection();

    const rows = await new Promise<any[]>((resolve, reject) => {
      connection.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          if (err) {
            console.error('Snowflake query error:', err);
            return reject(err);
          }
          resolve(rows);
        },
      });
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No records found' }, { status: 404 });
    }

    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error('Snowflake connection or query error:', err);
    return NextResponse.json([{ error: "snowflake connection failed" }], { status: 500 });
  }
}
