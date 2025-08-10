import fs from "fs";
import path from "path";

export type Monster = {
  name: string;
  hp: number;
  moveName: string;
  movePower: number;
  speed: number;
};

const MONSTER_DIR = path.join(process.cwd(), "data", "monsters");

export function getMonsterNames(): string[] {
  const files = fs.readdirSync(MONSTER_DIR);
  return files
    .filter((f) => f.endsWith(".csv"))
    .map((f) => f.replace(/\.csv$/i, ""));
}

export function readMonster(name: string): Monster | null {
  const filepath = path.join(MONSTER_DIR, `${name}.csv`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf8").trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  // 期待フォーマット: 1行目ヘッダ, 2行目データ
  if (lines.length < 2) return null;

  const header = lines[0].split(",").map((s) => s.trim());
  const data = lines[1].split(",").map((s) => s.trim());

  const idx = (key: string) => header.findIndex((h) => h.toLowerCase() === key.toLowerCase());
  const hpIdx = idx("hp");
  const moveNameIdx = idx("moveName");
  const movePowerIdx = idx("movePower");
  const speedIdx = idx("speed");

  if (hpIdx < 0 || moveNameIdx < 0 || movePowerIdx < 0) return null;

  const hp = Number(data[hpIdx]);
  const moveName = data[moveNameIdx];
  const movePower = Number(data[movePowerIdx]);
  const speed = speedIdx >= 0 ? Number(data[speedIdx]) : 10; // ← 既存CSVとの後方互換: 未指定は10

  if (![hp, movePower, speed].every(Number.isFinite)) return null;

  return { name, hp, moveName, movePower, speed };
}

export function listMonsters(): Monster[] {
  return getMonsterNames()
    .map((n) => readMonster(n))
    .filter((m): m is Monster => m !== null);
}
