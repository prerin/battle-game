import { NextResponse } from "next/server";
import { getMonsterNames } from "@/lib/monsters";

export async function GET() {
  const names = getMonsterNames();
  return NextResponse.json({ names });
}
