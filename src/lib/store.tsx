import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type MatchStatus = "live" | "upcoming" | "recent";
export interface Match {
  id: string;
  sport: string;
  league: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  time: string;
  status: MatchStatus;
  servers: { name: string; url: string }[];
  upcomingVideoUrl?: string;
}
export interface Channel { id: string; name: string; logo: string; url: string; }
export interface Category { id: string; name: string; icon: string; channels: Channel[]; }
export interface AdSlot { id: string; placement: "header" | "footer" | "inline" | "player" | "popunder"; html: string; enabled: boolean; }

export interface AppState {
  marquee: string;
  matches: Match[];
  categories: Category[];
  ads: AdSlot[];
  servers: { server1: string; server2: string; server3: string };
  gateEnabled: boolean;
  premiumCode: string;
  telegramUrl: string;
  adRedirectUrl: string;
  updateNotice: { title: string; body: string; version: string };
}

const FLAGS: Record<string, string> = {
  QA: "🇶🇦", CH: "🇨🇭", WI: "🏴‍☠️", NZ: "🇳🇿", BR: "🇧🇷", MA: "🇲🇦",
  MX: "🇲🇽", ZA: "🇿🇦", KR: "🇰🇷", CZ: "🇨🇿", CA: "🇨🇦", BA: "🇧🇦",
  US: "🇺🇸", PY: "🇵🇾",
};

const DEFAULT_STATE: AppState = {
  marquee: "🔥 Welcome to Sports Z — Live HD streams • Ads-Free Premium available • Join our Telegram for instant updates!",
  servers: {
    server1: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    server2: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    server3: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  gateEnabled: false,
  premiumCode: "SPORTSZ2026",
  telegramUrl: "https://t.me/sportsz",
  adRedirectUrl: "https://www.adsterra.com",
  updateNotice: {
    title: "Update Sports Z App",
    body: "A newer version is available with improved UI, faster servers and bug fixes.",
    version: "22.0",
  },
  ads: [
    { id: "a1", placement: "header", html: "<div style='padding:8px;text-align:center;color:#9ad;'>Header Ad — 728x90</div>", enabled: true },
    { id: "a2", placement: "inline", html: "<div style='padding:14px;text-align:center;color:#9ad;'>Inline Banner Ad — 320x100</div>", enabled: true },
    { id: "a3", placement: "footer", html: "<div style='padding:8px;text-align:center;color:#9ad;'>Footer Ad</div>", enabled: true },
  ],
  matches: [
    { id: "m1", sport: "Football", league: "FIFA World Cup", teamA: "Qatar", teamB: "Switzerland", flagA: FLAGS.QA, flagB: FLAGS.CH, time: "00:20:00", status: "live", servers: [] },
    { id: "m2", sport: "Cricket", league: "ICC Women World T20", teamA: "WI-W", teamB: "NZ-W", flagA: FLAGS.WI, flagB: FLAGS.NZ, time: "01:50:00", status: "live", servers: [] },
    { id: "m3", sport: "Football", league: "FIFA World Cup", teamA: "Brazil", teamB: "Morocco", flagA: FLAGS.BR, flagB: FLAGS.MA, time: "04:00 AM 14/06/2026", status: "upcoming", servers: [], upcomingVideoUrl: "" },
    { id: "m4", sport: "Football", league: "FIFA World Cup", teamA: "Mexico", teamB: "South Africa", flagA: FLAGS.MX, flagB: FLAGS.ZA, time: "11/06/2026", status: "recent", servers: [] },
    { id: "m5", sport: "Football", league: "FIFA World Cup", teamA: "South Korea", teamB: "Czechia", flagA: FLAGS.KR, flagB: FLAGS.CZ, time: "12/06/2026", status: "recent", servers: [] },
    { id: "m6", sport: "Football", league: "FIFA World Cup", teamA: "Canada", teamB: "BiH", flagA: FLAGS.CA, flagB: FLAGS.BA, time: "12/06/2026", status: "recent", servers: [] },
  ],
  categories: [
    { id: "c1", name: "FIFA World Cup 2026", icon: "🏆", channels: [{ id: "ch1", name: "FIFA HD", logo: "🏆", url: "" }] },
    { id: "c2", name: "Live Events - HD", icon: "📡", channels: [{ id: "ch2", name: "Live HD 1", logo: "📺", url: "" }] },
    { id: "c3", name: "Sports Channels", icon: "⚽", channels: [{ id: "ch3", name: "Sky Sports", logo: "🛰️", url: "" }] },
    { id: "c4", name: "ICC TV", icon: "🏏", channels: [{ id: "ch4", name: "ICC Live", logo: "🏏", url: "" }] },
    { id: "c5", name: "Willow Live", icon: "🌿", channels: [{ id: "ch5", name: "Willow", logo: "🌿", url: "" }] },
    { id: "c6", name: "KIDS", icon: "🧒", channels: [{ id: "ch6", name: "Kids TV", logo: "🎈", url: "" }] },
    { id: "c7", name: "News Channels", icon: "📰", channels: [{ id: "ch7", name: "BBC News", logo: "📰", url: "" }] },
    { id: "c8", name: "Bangladesh", icon: "🇧🇩", channels: [{ id: "ch8", name: "T Sports", logo: "🇧🇩", url: "" }] },
    { id: "c9", name: "Pakistan", icon: "🇵🇰", channels: [{ id: "ch9", name: "PTV Sports", logo: "🇵🇰", url: "" }] },
    { id: "c10", name: "DAZN", icon: "🥊", channels: [{ id: "ch10", name: "DAZN Main", logo: "🥊", url: "" }] },
  ],
};

const KEY = "sportsz-state-v1";

const Ctx = createContext<{ state: AppState; setState: (s: AppState) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStateRaw({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);
  const setState = (s: AppState) => {
    setStateRaw(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  };
  if (!hydrated) return null;
  return <Ctx.Provider value={{ state, setState }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export function useAdmin() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(sessionStorage.getItem("sportsz-admin") === "1"); }, []);
  return {
    authed,
    login: (pw: string) => {
      if (pw === "MUNNA12061") { sessionStorage.setItem("sportsz-admin", "1"); setAuthed(true); return true; }
      return false;
    },
    logout: () => { sessionStorage.removeItem("sportsz-admin"); setAuthed(false); },
  };
}