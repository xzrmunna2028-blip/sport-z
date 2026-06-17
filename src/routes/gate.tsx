import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import logo from "@/assets/sportsz-logo.png";

export const Route = createFileRoute("/gate")({
  component: Gate,
});

function Gate() {
  const { state } = useStore();
  const nav = useNavigate();
  const [s, setS] = useState(15);
  const [code, setCode] = useState("");
  useEffect(() => {
    if (s <= 0) return;
    const t = setTimeout(() => setS((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [s]);
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        <img src={logo} alt="Sports Z" className="mx-auto h-20 w-20" />
        <h1 className="mt-3 text-xl font-black tracking-wider text-primary">SPORTS Z</h1>
        <p className="mt-3 text-sm text-muted-foreground">Wait <span className="font-bold text-primary">{s}s</span> or enter your premium code to skip ads.</p>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Premium code" className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={() => { if (code === state.premiumCode) nav({ to: "/" }); }} className="mt-3 w-full rounded-full bg-[var(--gradient-brand)] py-3 font-bold text-primary-foreground">Verify Code</button>
        <button onClick={() => nav({ to: "/" })} disabled={s > 0} className="mt-2 w-full rounded-full border border-border py-3 text-sm disabled:opacity-50">Free Continue ({s})</button>
      </div>
    </div>
  );
}