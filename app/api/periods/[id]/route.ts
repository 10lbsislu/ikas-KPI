import { NextResponse } from "next/server";

// Bu endpoint kullanım dışı — yeni endpoint: /api/entries/[month]
export async function GET() {
  return NextResponse.json({ error: "Bu endpoint kullanım dışı. /api/entries/[month] kullanın." }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: "Bu endpoint kullanım dışı. /api/entries/[month] kullanın." }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Bu endpoint kullanım dışı. /api/entries/[month] kullanın." }, { status: 410 });
}
