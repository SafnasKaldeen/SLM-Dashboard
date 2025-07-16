// app/api/query-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = "adhoc_analysis";

export async function GET(req: NextRequest) {
  try {
    const connectionId = req.nextUrl.searchParams.get("connectionId");
    if (!connectionId) return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("query_history");

    const history = await collection.find({ connectionId }).sort({ timestamp: -1 }).limit(100).toArray();
    const formatted = history.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const timestamp = new Date(body.timestamp);
    const item = { ...body, timestamp };

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("query_history");

    const result = await collection.insertOne(item);

    return NextResponse.json({ ...item, _id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
