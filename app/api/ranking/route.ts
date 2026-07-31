import { NextResponse } from "next/server";

type ScoreRow = {
  player_id: string;
  player_name: string;
  score: number;
  duration_seconds: number;
  hints_used: number;
};

function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, key, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

async function getRanking(challengeDate: string, playerId: string) {
  const { url, headers } = config();
  const query = new URLSearchParams({
    select: "player_id,player_name,score,duration_seconds,hints_used",
    challenge_date: `eq.${challengeDate}`,
    order: "score.desc,duration_seconds.asc,completed_at.asc",
    limit: "1000",
  });
  const response = await fetch(`${url}/rest/v1/daily_scores?${query}`, { headers, cache: "no-store" });
  if (!response.ok) throw new Error("Could not load ranking");
  const rows = await response.json() as ScoreRow[];
  const position = rows.findIndex(row => row.player_id === playerId) + 1;
  return {
    position,
    total: rows.length,
    top: rows.slice(0, 5).map(row => ({
      playerName: row.player_name,
      score: row.score,
      durationSeconds: row.duration_seconds,
      isCurrentPlayer: row.player_id === playerId,
    })),
  };
}

export async function POST(request: Request) {
  const { url, key, headers } = config();
  if (!url || !key) return NextResponse.json({ error: "Ranking is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const playerId = typeof body?.playerId === "string" ? body.playerId.slice(0, 80) : "";
  const playerName = typeof body?.playerName === "string" ? body.playerName.slice(0, 30) : "";
  const challengeDate = typeof body?.challengeDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.challengeDate) ? body.challengeDate : "";
  const score = Number(body?.score);
  const durationSeconds = Number(body?.durationSeconds);
  const hintsUsed = Number(body?.hintsUsed);
  if (!playerId || !playerName || !challengeDate || !Number.isInteger(score) || score < 0 || score > 5000 || !Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 86400 || !Number.isInteger(hintsUsed) || hintsUsed < 0) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const existingQuery = new URLSearchParams({ select: "score,duration_seconds", player_id: `eq.${playerId}`, challenge_date: `eq.${challengeDate}`, limit: "1" });
  const existingResponse = await fetch(`${url}/rest/v1/daily_scores?${existingQuery}`, { headers, cache: "no-store" });
  if (!existingResponse.ok) return NextResponse.json({ error: "Could not verify score" }, { status: 502 });
  const existing = await existingResponse.json() as Pick<ScoreRow, "score" | "duration_seconds">[];
  const previous = existing[0];
  const isBetter = !previous || score > previous.score || (score === previous.score && durationSeconds < previous.duration_seconds);

  if (isBetter) {
    const upsert = await fetch(`${url}/rest/v1/daily_scores?on_conflict=challenge_date,player_id`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ player_id: playerId, player_name: playerName, challenge_date: challengeDate, score, duration_seconds: durationSeconds, hints_used: hintsUsed, completed_at: new Date().toISOString() }),
    });
    if (!upsert.ok) return NextResponse.json({ error: "Could not save score" }, { status: 502 });
  }

  return NextResponse.json(await getRanking(challengeDate, playerId));
}
