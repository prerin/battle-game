import fs from "fs";
import path from "path";

export type Monster = {
  name: string;
  hp: number;
  moveName: string;
  movePower: number;
  speed: number;
  imageUrl?: string;      // 追加
  moveVideoUrl?: string;  // 追加
};

const MONSTER_DIR = path.join(process.cwd(), "data", "monsters");
const PUBLIC_DIR  = path.join(process.cwd(), "public");

function firstExistingFile(baseDir: string, basename: string, exts: string[]): string | null {
  for (const ext of exts) {
    const p = path.join(baseDir, `${basename}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function resolveMediaUrls(name: string): { imageUrl?: string; moveVideoUrl?: string } {
  const base = path.join(PUBLIC_DIR, "monsters", name);
  const img = firstExistingFile(base, "image", ["png","jpg","jpeg","webp","gif"]);
  const mov = firstExistingFile(base, "move",  ["mp4","webm","gif"]);
  return {
    imageUrl: img ? `/monsters/${name}/image.${path.extname(img).slice(1)}` : undefined,
    moveVideoUrl: mov ? `/monsters/${name}/move.${path.extname(mov).slice(1)}` : undefined,
  };
}

export function getMonsterNames(): string[] {
  return fs.readdirSync(MONSTER_DIR)
    .filter((f) => f.endsWith(".csv"))
    .map((f) => f.replace(/\.csv$/i, ""));
}

export function readMonster(name: string): Monster | null {
  const filepath = path.join(MONSTER_DIR, `${name}.csv`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf8").trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;

  const header = lines[0].split(",").map((s) => s.trim());
  const data   = lines[1].split(",").map((s) => s.trim());
  const idx = (key: string) => header.findIndex((h) => h.toLowerCase() === key.toLowerCase());

  const hpIdx = idx("hp");
  const moveNameIdx = idx("moveName");
  const movePowerIdx = idx("movePower");
  const speedIdx = idx("speed");

  if (hpIdx < 0 || moveNameIdx < 0 || movePowerIdx < 0) return null;

  const hp = Number(data[hpIdx]);
  const moveName = data[moveNameIdx];
  const movePower = Number(data[movePowerIdx]);
  const speed = speedIdx >= 0 ? Number(data[speedIdx]) : 10;

  if (![hp, movePower, speed].every(Number.isFinite)) return null;

  const media = resolveMediaUrls(name);
  return { name, hp, moveName, movePower, speed, ...media };
}
