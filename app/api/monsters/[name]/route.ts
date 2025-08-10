import { NextResponse } from "next/server";
import { readMonster } from "@/lib/monsters";

type Params = { params: { name: string } };

export async function GET(_req: Request, { params }: Params) {
  const monster = readMonster(params.name);
  if (!monster) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ monster });
}
