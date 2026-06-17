import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/Layout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/highlights")({
  head: () => ({ meta: [{ title: "Sports Z — Highlights" }, { name: "description", content: "Match highlights and recent games." }] }),
  component: Highlights,
});

function Highlights() {
  const { state } = useStore();
  const items = state.matches.filter((m) => m.status === "recent");
  return (
    <AppLayout title="Highlights">
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card/60 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>🏆 {m.sport} | {m.league}</span><span>{m.time}</span>
            </div>
            <div className="mt-2 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
              <span className="text-2xl">{m.flagA}</span>
              <span className="truncate text-center text-sm">{m.teamA}</span>
              <span className="text-xs font-bold">VS</span>
              <span className="truncate text-center text-sm">{m.teamB}</span>
              <span className="text-2xl">{m.flagB}</span>
            </div>
          </div>
        ))}
        {!items.length && <p className="py-12 text-center text-sm text-muted-foreground">No highlights yet.</p>}
      </div>
    </AppLayout>
  );
}