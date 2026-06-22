import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Radio, Trophy, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { getFifaMatches, type FifaMatch } from "@/lib/fifa.functions";

export const Route = createFileRoute("/fifa")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 — Live Dashboard" },
      { name: "description", content: "Real-time FIFA World Cup 2026 fixtures, live scores and results." },
    ],
  }),
  component: FifaDashboard,
});

function FifaDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fifa-matches"],
    queryFn: () => getFifaMatches(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const matches = data?.matches ?? [];
  const buckets = useMemo(() => {
    const today = new Date().toDateString();
    const live: FifaMatch[] = [];
    const todayList: FifaMatch[] = [];
    const finished: FifaMatch[] = [];
    const upcoming: FifaMatch[] = [];
    for (const m of matches) {
      const isToday = new Date(m.utcDate).toDateString() === today;
      if (m.status === "IN_PLAY" || m.status === "PAUSED") live.push(m);
      else if (m.status === "FINISHED") finished.push(m);
      else upcoming.push(m);
      if (isToday) todayList.push(m);
    }
    return { live, today: todayList, finished: finished.slice(-12).reverse(), upcoming: upcoming.slice(0, 12) };
  }, [matches]);

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Auto-refresh • 60s</span>
      </div>

      <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-yellow-500/10 via-card to-emerald-600/10 p-5 shadow-[var(--shadow-glow)]">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">FIFA World Cup 2026</h1>
            <p className="text-xs text-muted-foreground">Live dashboard • powered by football-data.org</p>
          </div>
        </div>
      </div>

      {data?.error && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {data.error.includes("not configured")
            ? "Add your FOOTBALL_DATA_API_KEY secret to enable live data."
            : `Couldn't load matches: ${data.error}`}
        </div>
      )}

      {isLoading && <SkeletonList />}

      <Section title={`🔴 Live Now (${buckets.live.length})`} highlight>
        {buckets.live.length === 0 ? <Empty msg="No live matches right now." /> : buckets.live.map((m) => <MatchRow key={m.id} m={m} live />)}
      </Section>

      <Section title={`📅 Today (${buckets.today.length})`}>
        {buckets.today.length === 0 ? <Empty msg="No matches scheduled today." /> : buckets.today.map((m) => <MatchRow key={m.id} m={m} />)}
      </Section>

      <Section title="⏭️ Upcoming">
        {buckets.upcoming.length === 0 ? <Empty msg="No upcoming fixtures." /> : buckets.upcoming.map((m) => <MatchRow key={m.id} m={m} />)}
      </Section>

      <Section title="✅ Completed">
        {buckets.finished.length === 0 ? <Empty msg="No completed matches yet." /> : buckets.finished.map((m) => <MatchRow key={m.id} m={m} />)}
      </Section>
    </AppLayout>
  );
}

function Section({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <section className="mt-6">
      <h2 className={`mb-2 text-sm font-bold uppercase tracking-wider ${highlight ? "text-destructive" : "text-foreground"}`}>{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="rounded-lg border border-dashed border-border bg-card/40 p-3 text-center text-xs text-muted-foreground">{msg}</p>;
}

function MatchRow({ m, live }: { m: FifaMatch; live?: boolean }) {
  const date = new Date(m.utcDate);
  const timeStr = date.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  const homeScore = m.score.fullTime.home;
  const awayScore = m.score.fullTime.away;
  const showScore = m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "FINISHED";
  return (
    <div className={`rounded-xl border bg-card/60 p-3 ${live ? "border-destructive/60" : "border-border"}`}>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{m.stage?.replaceAll("_", " ") ?? "World Cup"}{m.group ? ` • ${m.group}` : ""}</span>
        {live ? (
          <span className="flex items-center gap-1 rounded bg-destructive px-2 py-0.5 font-bold text-destructive-foreground">
            <Radio className="h-3 w-3 animate-pulse" /> LIVE{m.minute ? ` ${m.minute}'` : ""}
          </span>
        ) : (
          <span className="font-mono font-bold text-primary">{m.status === "FINISHED" ? "FT" : timeStr}</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Team name={m.homeTeam.shortName ?? m.homeTeam.name} crest={m.homeTeam.crest} align="right" />
        <div className="min-w-16 text-center">
          {showScore ? (
            <span className="text-xl font-black tracking-tight text-foreground">{homeScore ?? 0} <span className="text-muted-foreground">-</span> {awayScore ?? 0}</span>
          ) : (
            <span className="text-xs font-black text-muted-foreground">VS</span>
          )}
        </div>
        <Team name={m.awayTeam.shortName ?? m.awayTeam.name} crest={m.awayTeam.crest} align="left" />
      </div>
    </div>
  );
}

function Team({ name, crest, align }: { name: string; crest?: string; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {align === "left" && crest && <img src={crest} alt="" className="h-7 w-7 object-contain" loading="lazy" />}
      <span className="truncate text-sm font-semibold">{name}</span>
      {align === "right" && crest && <img src={crest} alt="" className="h-7 w-7 object-contain" loading="lazy" />}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="mt-4 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-card/60" />
      ))}
    </div>
  );
}