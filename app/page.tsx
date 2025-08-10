"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/monsters")
      .then((r) => r.json())
      .then((d) => setNames(d.names ?? []))
      .catch(() => setNames([]));
  }, []);

  const toggle = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 2) return prev; // 最大2体
      return [...prev, name];
    });
  };

  const start = () => {
    if (selected.length === 2) {
      router.push(`/battle?m1=${encodeURIComponent(selected[0])}&m2=${encodeURIComponent(selected[1])}`);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">対戦するモンスターを2体選んでください</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-3xl">
        {names.map((n) => {
          const checked = selected.includes(n);
          return (
            <li key={n}>
              <label className="flex items-center gap-2 border rounded-xl p-4">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(n)}
                  disabled={!checked && selected.length >= 2}
                />
                <span className="text-lg">{n}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        onClick={start}
        disabled={selected.length !== 2}
        className="px-6 py-3 rounded-xl border shadow disabled:opacity-50"
      >
        対戦開始
      </button>

      <p className="text-sm text-gray-500">※ CSVは <code>data/monsters/</code> に置きます（1体=1CSV）。</p>
    </main>
  );
}
