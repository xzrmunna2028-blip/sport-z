import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/Layout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Sports Z — Categories" }, { name: "description", content: "Browse sports channels and networks." }] }),
  component: Categories,
});

function Categories() {
  const { state } = useStore();
  return (
    <AppLayout title="Categories">
      <div className="grid grid-cols-2 gap-3">
        {state.categories.map((c) => (
          <Link key={c.id} to="/categories/$id" params={{ id: c.id }} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 transition hover:border-primary/60">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-2xl">{c.icon}</span>
            <span className="truncate text-sm font-medium">{c.name}</span>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}