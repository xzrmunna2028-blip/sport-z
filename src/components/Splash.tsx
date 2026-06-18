import { useEffect, useState } from "react";
import logo from "@/assets/sportsz-logo.png";
import { useStore } from "@/lib/store";

export function Splash({ onDone }: { onDone: () => void }) {
  const { state } = useStore();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) { p = 100; clearInterval(t); setTimeout(onDone, 350); }
      setPct(Math.min(100, Math.round(p)));
    }, 140);
    return () => clearInterval(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#04140d] text-emerald-300">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(16,185,129,.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(16,185,129,.18), transparent 45%)" }} />
      <div className="relative grid h-32 w-32 place-items-center rounded-full border-2 border-emerald-400/70 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,.45)]">
        <img src={logo} alt="" className="h-16 w-16 drop-shadow-[0_0_10px_rgba(16,185,129,.6)]" />
      </div>
      <h1 className="mt-6 text-2xl font-black tracking-[0.35em] text-emerald-300">{state.brand.name}</h1>
      <p className="mt-2 text-[10px] font-mono tracking-[0.3em] text-emerald-400/70">BOOTSTRAPPING MULTI-SERVERS PIPELINE</p>
      <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-emerald-500/10">
        <div className="h-full bg-emerald-400 transition-all duration-150 shadow-[0_0_12px_rgba(16,185,129,.8)]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-xs font-mono text-emerald-400">{pct}% COMPLETE</p>
      <div className="absolute bottom-6 text-center text-[10px] font-mono tracking-[0.25em] text-emerald-500/60">
        <div>SECURED MULTI-CDN PIPELINE ACTIVE</div>
        <div>{state.brand.name} • {state.brand.tagline}</div>
      </div>
    </div>
  );
}