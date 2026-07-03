import { NextResponse } from "next/server";

// Bu endpoint kullanım dışı — yeni endpoint: /api/entries
export async function GET() {
  return NextResponse.json({ error: "Bu endpoint kullanım dışı. /api/entries kullanın." }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Bu endpoint kullanım dışı. /api/entries kullanın." }, { status: 410 });
}
