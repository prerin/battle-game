"use client";

import { useEffect, useMemo, useState, useRef } from "react";

type Monster = {
  name: string;
  hp: number;
  moveName: string;
  movePower: number;
  speed: number; // 素早さで先手判定
  imageUrl?: string;
  moveVideoUrl?: string;
};

async function fetchMonster(name: string): Promise<Monster> {
  const res = await fetch(`/api/monsters/${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.monster as Monster;
}

export default function Battle({
  searchParams,
}: {
  searchParams: { m1?: string; m2?: string };
}) {
  const m1Name = searchParams.m1 ?? "";
  const m2Name = searchParams.m2 ?? "";

  const [p1, setP1] = useState<Monster | null>(null);
  const [p2, setP2] = useState<Monster | null>(null);
  const [p1Hp, setP1Hp] = useState<number | null>(null);
  const [p2Hp, setP2Hp] = useState<number | null>(null);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [log, setLog] = useState<string[]>([]);
  const [finished, setFinished] = useState<string | null>(null);

  const p1VideoRef = useRef<HTMLVideoElement>(null);
  const p2VideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      if (!m1Name || !m2Name) return;
      const [m1, m2] = await Promise.all([fetchMonster(m1Name), fetchMonster(m2Name)]);
      setP1(m1);
      setP2(m2);
      setP1Hp(m1.hp);
      setP2Hp(m2.hp);

      const firstTurn: 1 | 2 = m1.speed > m2.speed ? 1 : m1.speed < m2.speed ? 2 : 1;
      setTurn(firstTurn);
      setLog([`対戦開始！ ${m1.name}（S:${m1.speed}） vs ${m2.name}（S:${m2.speed}） / 先手: ${firstTurn === 1 ? m1.name : m2.name}`]);
      setFinished(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m1Name, m2Name]);

  const canAct = useMemo(() => p1 && p2 && p1Hp !== null && p2Hp !== null && !finished, [p1, p2, p1Hp, p2Hp, finished]);

  const playMoveVideo = async (which: 1 | 2) => {
    const v = which === 1 ? p1VideoRef.current : p2VideoRef.current;
    const m = which === 1 ? p1 : p2;
    if (!v || !m?.moveVideoUrl) return;
    if (v.src !== location.origin + m.moveVideoUrl) v.src = m.moveVideoUrl;
    v.currentTime = 0;
    try { await v.play(); } catch {}
  };

  // P1 or P2 が自分の技ボタンを押したときに呼ぶ
  const attack = async (actor: 1 | 2) => {
    if (!canAct || !p1 || !p2 || p1Hp === null || p2Hp === null) return;
    if (actor !== turn) return; // 自分の手番じゃなければ無効

    await playMoveVideo(actor); // 先に再生開始（UI映え）

    if (actor === 1) {
      const nextHp = Math.max(0, p2Hp - p1.movePower);
      setP2Hp(nextHp);
      setLog((l) => [...l, `P1: ${p1.name} の ${p1.moveName}!  → ${p2.name} に ${p1.movePower} ダメージ（残りHP ${nextHp}）`]);
      if (nextHp <= 0) setFinished(`勝者: ${p1.name}`);
      else setTurn(2);
    } else {
      const nextHp = Math.max(0, p1Hp - p2.movePower);
      setP1Hp(nextHp);
      setLog((l) => [...l, `P2: ${p2.name} の ${p2.moveName}!  → ${p1.name} に ${p2.movePower} ダメージ（残りHP ${nextHp}）`]);
      if (nextHp <= 0) setFinished(`勝者: ${p2.name}`);
      else setTurn(1);
    }
  };

  const reset = () => {
    if (p1 && p2) {
      setP1Hp(p1.hp);
      setP2Hp(p2.hp);
      const firstTurn: 1 | 2 = p1.speed > p2.speed ? 1 : p1.speed < p2.speed ? 2 : 1;
      setTurn(firstTurn);
      setLog([`対戦開始！ ${p1.name}（S:${p1.speed}） vs ${p2.name}（S:${p2.speed}） / 先手: ${firstTurn === 1 ? p1.name : p2.name}`]);
      setFinished(null);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col gap-6 items-center">
      <h1 className="text-2xl font-bold">対戦</h1>

      {!p1 || !p2 ? (
        <p>読み込み中…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <Card
              title={`Player 1: ${p1.name}`}
              hp={p1Hp ?? 0}
              maxHp={p1.hp}
              move={`${p1.moveName} (${p1.movePower})`}
              active={turn === 1 && !finished}
              onAttack={() => attack(1)}
              imageUrl={p1.imageUrl}
              videoRef={p1VideoRef}
            />
            <Card
              title={`Player 2: ${p2.name}`}
              hp={p2Hp ?? 0}
              maxHp={p2.hp}
              move={`${p2.moveName} (${p2.movePower})`}
              active={turn === 2 && !finished}
              onAttack={() => attack(2)}
              imageUrl={p2.imageUrl}
              videoRef={p2VideoRef}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="px-6 py-3 rounded-xl border shadow">
              リセット
            </button>
          </div>

          {finished && <p className="text-xl font-semibold">{finished}</p>}

          <div className="w-full max-w-3xl">
            <h2 className="font-semibold mb-2">ログ</h2>
            <ul className="border rounded-xl p-4 space-y-1">
              {log.map((line, i) => (
                <li key={i} className="text-sm">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}

function Card({
  title,
  hp,
  maxHp,
  move,
  active,
  onAttack,
  imageUrl,
  videoRef
}: {
  title: string;
  hp: number;
  maxHp: number;
  move: string;
  active: boolean;
  onAttack: () => void;
  imageUrl?: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  return (
    <div className={`rounded-2xl border p-4 shadow ${active ? "ring-2" : ""}`}>
      <div className="flex items-center gap-3 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {imageUrl ? <img src={imageUrl} alt={title} className="w-16 h-16 object-contain" /> : <div className="w-16 h-16 bg-gray-100" />}
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="text-sm">HP: {hp} / {maxHp}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded mt-1">
            <div className="h-3 rounded" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6ee7b7, #34d399)" }} />
          </div>
        </div>
      </div>

      {/* 攻撃ボタン */}
      <button
        onClick={onAttack}
        disabled={!active}
        className="mt-2 px-4 py-2 rounded-xl border shadow disabled:opacity-50"
        title={active ? "この技を繰り出す" : "相手の手番です"}
      >
        {move}
      </button>

      {/* 技動画（自動再生・ミュート・ループ無し・非表示から一時表示） */}
      <video ref={videoRef} className="mt-3 w-full rounded-lg" playsInline muted preload="auto" />
    </div>
  );
}
