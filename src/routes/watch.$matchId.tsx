import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import logo from "@/assets/sportsz-logo.png";
import { Download, Send, Info, RotateCw, MousePointer2 } from "lucide-react";

export const Route = createFileRoute("/watch/$matchId")({
  component: Watch,
});

function Watch() {
  const { matchId } = Route.useParams();
  const { state } = useStore();
  const nav = useNavigate();
  const [seconds, setSeconds] = useState(15);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (seconds <= 0) { nav({ to: "/play/$matchId", params: { matchId } }); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, started, matchId, nav]);

  const onClick = () => {
    window.open(state.adRedirectUrl, "_blank", "noopener");
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7" />
          <span className="font-bold text-primary">Sports Z</span>
        </div>
        <Link to="/" className="flex items-center gap-1 text-sm text-primary"><Download className="h-4 w-4" /> Get APP</Link>
      </header>

      <div className="mx-auto max-w-md space-y-5 px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-yellow-300">We Need Your Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Help us keep the app running</p>
          <p className="mt-1 text-xs text-muted-foreground">Wait time: 15s • Auto close: ON</p>
        </div>

        <button onClick={onClick} disabled={started} className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-8 text-center shadow-[0_0_30px_rgba(244,63,94,0.4)] disabled:opacity-60">
          <MousePointer2 className="absolute left-3 bottom-2 h-8 w-8 -rotate-45 text-white/90" />
          <MousePointer2 className="absolute right-3 bottom-2 h-8 w-8 rotate-45 -scale-x-100 text-white/90" />
          <div className="text-2xl font-bold text-white">{started ? `Wait ${seconds}s…` : "Click Here"}</div>
          <div className="mt-1 text-xs font-semibold text-yellow-200">Open 1 AD to unlock stream</div>
        </button>

        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="text-sm font-bold">Instructions:</div>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1: Click the button Above 👆</li>
            <li>2: Wait for ad page to load 🙏</li>
            <li>3: Check ads page for 15 seconds ❤️</li>
            <li>4: After 15s ads close automatically 😊</li>
            <li>5: Enjoy ads-free streaming next 12 hours 📺</li>
          </ol>
        </div>

        <a href={state.telegramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
          <Send className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <div className="font-bold text-primary">Join us on Telegram</div>
            <div className="text-xs text-muted-foreground">Get updates, support & more</div>
          </div>
        </a>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs text-emerald-300">
          <Info className="mx-auto mb-1 h-5 w-5" />
          We know ads can be annoying. But without them, we can't keep the app running. Your support means everything to us!
        </div>

        <button onClick={() => location.reload()} className="mx-auto flex items-center gap-2 text-sm text-muted-foreground"><RotateCw className="h-4 w-4" /> Reload</button>
      </div>
    </div>
  );
}