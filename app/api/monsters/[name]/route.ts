import { NextResponse } from "next/server";
import { readMonster } from "@/lib/monsters";

export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const monster = readMonster(params.name);
  if (!monster) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ monster }); // imageUrl, moveVideoUrl含む
}
