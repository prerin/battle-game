"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MonsterCard = { name: string; imageUrl?: string };

export default function Page() {
  const [list, setList] = useState<MonsterCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const names = (await (await fetch("/api/monsters")).json()).names as string[];
      const details = await Promise.all(
        names.map(async (n) => {
          const r = await fetch(`/api/monsters/${encodeURIComponent(n)}`);
          const d = await r.json();
          return { name: n, imageUrl: d.monster?.imageUrl } as MonsterCard;
        })
      );
      setList(details);
    })();
  }, []);

  const toggle = (name: string) => {
    setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name)
                      : prev.length >= 2 ? prev : [...prev, name]);
  };
  const start = () => selected.length === 2 && router.push(`/battle?m1=${selected[0]}&m2=${selected[1]}`);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">2体選択</h1>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {list.map(({ name, imageUrl }) => {
          const checked = selected.includes(name);
          return (
            <li key={name}>
              <button onClick={() => toggle(name)} className={`w-full border rounded-xl p-3 text-left shadow ${checked ? "ring-2" : ""}`}>
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={name} className="w-full h-36 object-contain mb-2" />
                ) : (
                  <div className="w-full h-36 bg-gray-100 grid place-items-center mb-2">No Image</div>
                )}
                <div className="text-lg">{name}</div>
              </button>
            </li>
          );
        })}
      </ul>
      <button onClick={start} disabled={selected.length !== 2} className="px-6 py-3 rounded-xl border shadow disabled:opacity-50">
        対戦開始
      </button>
    </main>
  );
}
