import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  liveStartedAt?: string;
}
export interface Channel { id: string; name: string; logo: string; url: string; }
export interface Category { id: string; name: string; icon: string; channels: Channel[]; }
export interface AdSlot { id: string; placement: "header" | "footer" | "inline" | "player" | "popunder"; html: string; enabled: boolean; }
export interface SidebarItem { id: string; label: string; icon: string; url?: string; color?: string; enabled: boolean; }
export interface SectionToggles {
  marquee: boolean;
  sportPills: boolean;
  statusTabs: boolean;
  categoriesSection: boolean;
  highlightsSection: boolean;
  shareButton: boolean;
}

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
  maintenance: { enabled: boolean; title: string; message: string; apkUrl: string };
  subscribePopupEnabled: boolean;
  brand: { name: string; tagline: string };
  sidebarItems: SidebarItem[];
  sectionToggles: SectionToggles;
  sourceRepoUrl: string;
  subscribeSuccessMsg: string;
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
  maintenance: { enabled: false, title: "Under Maintenance", message: "We're upgrading our servers. Please check back soon.", apkUrl: "" },
  subscribePopupEnabled: true,
  brand: { name: "SPORTS Z", tagline: "LIVE HUB SYSTEM • SECURED MULTI-CDN PIPELINE" },
  sourceRepoUrl: "",
  subscribeSuccessMsg: "🎉 Congratulations! You are now a Sports Z Partner. Enjoy 4K live streaming!",
  sidebarItems: [
    { id: "s1", label: "Video Quality", icon: "Settings", enabled: true },
    { id: "s2", label: "Notice", icon: "Bell", enabled: true },
    { id: "s3", label: "Join Us", icon: "MessageSquare", enabled: true, url: "https://t.me/sportsz" },
    { id: "s4", label: "Copyright", icon: "Copyright", enabled: true },
    { id: "s5", label: "Update App", icon: "RefreshCw", enabled: true },
    { id: "s6", label: "Exit", icon: "LogOut", enabled: true },
  ],
  sectionToggles: {
    marquee: true,
    sportPills: true,
    statusTabs: true,
    categoriesSection: true,
    highlightsSection: true,
    shareButton: false,
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

function merge(base: AppState, patch: Partial<AppState>): AppState {
  return { ...base, ...patch };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage immediately for snappy paint
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStateRaw(merge(DEFAULT_STATE, JSON.parse(raw)));
    } catch {}
    setHydrated(true);

    // Then pull from cloud + subscribe to realtime updates
    let mounted = true;
    supabase.from("app_settings").select("data").eq("id", 1).maybeSingle().then(({ data }) => {
      if (!mounted || !data?.data) return;
      const next = merge(DEFAULT_STATE, data.data as Partial<AppState>);
      setStateRaw(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    });
    const channel = supabase
      .channel("app_settings_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, (payload: any) => {
        const d = payload.new?.data;
        if (!d) return;
        const next = merge(DEFAULT_STATE, d);
        setStateRaw(next);
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const setState = (s: AppState) => {
    setStateRaw(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
    // Push to cloud (fire-and-forget). Realtime broadcasts back to other tabs/devices.
    supabase.from("app_settings").upsert({ id: 1, data: s as any, updated_at: new Date().toISOString() }).then(() => {});
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