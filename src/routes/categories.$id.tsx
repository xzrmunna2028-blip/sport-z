import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout } from "@/components/Layout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/categories/$id")({
  component: CategoryDetail,
});

function CategoryDetail() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const cat = state.categories.find((c) => c.id === id);
  if (!cat) throw notFound();
  return (
    <AppLayout title={cat.name}>
      <div className="space-y-3">
        {cat.channels.map((ch) => (
          <Link key={ch.id} to="/watch/$matchId" params={{ matchId: `ch_${ch.id}` }} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-2xl">{ch.logo}</span>
            <span className="text-sm font-medium">{ch.name}</span>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}