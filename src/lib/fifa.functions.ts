import { createServerFn } from "@tanstack/react-start";

export interface FifaMatch {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "SUSPENDED" | "CANCELLED";
  minute?: number | null;
  stage?: string;
  group?: string | null;
  homeTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
    winner?: string | null;
  };
}

export const getFifaMatches = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return { matches: [] as FifaMatch[], error: "FOOTBALL_DATA_API_KEY not configured" };
  }
  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": apiKey },
    });
    if (!res.ok) {
      return { matches: [] as FifaMatch[], error: `Upstream ${res.status}` };
    }
    const data = (await res.json()) as { matches?: FifaMatch[] };
    return { matches: data.matches ?? [], error: null as string | null };
  } catch (e: any) {
    return { matches: [] as FifaMatch[], error: e?.message ?? "fetch failed" };
  }
});