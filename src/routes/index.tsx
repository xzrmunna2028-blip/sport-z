import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout, AdSlot } from "@/components/Layout";
import { EntryModals } from "@/components/Modals";
import { useStore, type MatchStatus } from "@/lib/store";
import { Trophy, Radio } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sports Z — Home" },
      { name: "description", content: "Live sports streaming home — Recent, Live and Upcoming matches." },
    ],
  }),
  component: Home,
});

const SPORTS = ["All", "Cricket", "Football", "MotorSports", "Wrestling"];

function Home() {
  const { state } = useStore();
  const [sport, setSport] = useState("All");
  const [tab, setTab] = useState<MatchStatus | "all">("all");

  const filtered = state.matches.filter((m) => {
    if (sport !== "All" && m.sport !== sport) return false;
    if (tab !== "all" && m.status !== tab) return false;
    return true;
  });
  const count = (s: MatchStatus) => state.matches.filter((m) => m.status === s).length;

  return (
    <AppLayout>
      <EntryModals />
      {state.sectionToggles?.sportPills && (
      <div className="-mx-1 flex gap-3 overflow-x-auto pb-2">
        {SPORTS.map((s, i) => (
          <button key={s} onClick={() => setSport(s)} className={`relative flex shrink-0 flex-col items-center gap-1 rounded-2xl border ${sport === s ? "border-primary shadow-[var(--shadow-glow)]" : "border-border"} bg-card/60 px-4 py-3 text-xs`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg">
              {["🏟️","🏏","⚽","🏎️","🥊"][i]}
            </span>
            <span className="font-semibold text-foreground">{s}</span>
            {(() => {
              const n = s === "All" ? state.matches.length : state.matches.filter((m) => m.sport === s).length;
              return n > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{n}</span> : null;
            })()}
          </button>
        ))}
      </div>
      )}

      <Link to="/fifa" className="mt-3 flex items-center justify-between rounded-xl border border-primary/40 bg-gradient-to-r from-yellow-500/15 via-card to-emerald-600/15 p-3 shadow-[var(--shadow-glow)]">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Trophy className="h-4 w-4 text-yellow-400" /> FIFA World Cup 2026 — Live Dashboard
        </span>
        <span className="rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">LIVE</span>
      </Link>

      {state.sectionToggles?.statusTabs && (
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {([
          ["recent", `Recent (${count("recent")})`],
          ["live", `Live (${count("live")})`],
          ["upcoming", `Upcoming (${count("upcoming")})`],
          ["all", `All (${state.matches.length})`],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold ${tab === k ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{label}</button>
        ))}
      </div>
      )}

      <div className="mt-4 space-y-3">
        {filtered.map((m, i) => (
          <div key={m.id} className="space-y-3">
            <MatchCard m={m} />
            {i === 0 && <AdSlot placement="inline" />}
          </div>
        ))}
        {!filtered.length && <p className="py-12 text-center text-sm text-muted-foreground">No matches in this category.</p>}
      </div>
    </AppLayout>
  );
}

function useLiveMinutes(startedAt?: string) {
  const [m, setM] = useState<number | null>(null);
  useEffect(() => {
    if (!startedAt) { setM(null); return; }
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
      setM(diff < 0 ? 0 : diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return m;
}

function MatchCard({ m }: { m: ReturnType<typeof useStore>["state"]["matches"][number] }) {
  const target = m.status === "upcoming" ? `/play/${m.id}` : `/watch/${m.id}`;
  const liveMinutes = useLiveMinutes(m.status === "live" ? m.liveStartedAt : undefined);
  return (
    <Link to={target} className="block rounded-xl border border-border bg-card/60 p-3 transition hover:border-primary/60">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-semibold text-foreground"><Trophy className="h-3.5 w-3.5 text-primary" /> {m.sport} ‖ {m.league}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary">{m.time}</span>
          {m.status === "live" && (
            <span className="flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE{liveMinutes !== null && ` ${liveMinutes}'`}
            </span>
          )}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-2xl ring-1 ring-border">{m.flagA}</span>
        <span className="truncate text-center text-sm font-semibold">{m.teamA}</span>
        <span className="text-xs font-black text-muted-foreground">VS</span>
        <span className="truncate text-center text-sm font-semibold">{m.teamB}</span>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-2xl ring-1 ring-border">{m.flagB}</span>
      </div>
    </Link>
  );
}
