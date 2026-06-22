import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Send, Info, MousePointer2, Home } from "lucide-react";
import logo from "@/assets/sportsz-logo.png";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/ad")({
  head: () => ({
    meta: [
      { title: "Supporting Ad — Sports Z" },
      { name: "description", content: "Quick 15-second supporting ad. Auto returns to the home page." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdPage,
});

function AdPage() {
  const { state } = useStore();
  const nav = useNavigate();
  const [seconds, setSeconds] = useState(15);
  const [started, setStarted] = useState(false);
  const openedRef = useRef(false);

  // Countdown — runs on both mobile and desktop using requestAnimationFrame-safe setInterval
  useEffect(() => {
    if (!started) return;
    if (seconds <= 0) {
      nav({ to: "/", replace: true });
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, seconds, nav]);

  const openAd = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    const url = state.adRedirectUrl || "https://www.adsterra.com";
    // Pop-up blockers: open within the user gesture
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
      // Fallback for mobile browsers that block window.open
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      document.body.appendChild(a); a.click(); a.remove();
    }
    setStarted(true);
  };

  const pct = ((15 - seconds) / 15) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sports Z" className="h-7 w-7" />
          <span className="font-bold text-primary">Sports Z</span>
        </Link>
        <Link to="/" className="flex items-center gap-1 text-sm text-primary">
          <Home className="h-4 w-4" /> Home
        </Link>
      </header>

      <div className="mx-auto max-w-md space-y-5 px-4 py-6 sm:max-w-xl">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-yellow-300 sm:text-3xl">We Need Your Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">A quick 15-second ad keeps Sports Z free for everyone.</p>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
        </div>

        <button
          onClick={openAd}
          disabled={started}
          className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-8 text-center shadow-[0_0_30px_rgba(244,63,94,0.4)] transition active:scale-[0.98] disabled:opacity-60"
        >
          <MousePointer2 className="absolute left-3 bottom-2 h-8 w-8 -rotate-45 text-white/90" />
          <MousePointer2 className="absolute right-3 bottom-2 h-8 w-8 rotate-45 -scale-x-100 text-white/90" />
          <div className="text-2xl font-bold text-white sm:text-3xl">
            {started ? `Returning home in ${seconds}s…` : "Click Here to Open Ad"}
          </div>
          <div className="mt-1 text-xs font-semibold text-yellow-200">
            {started ? "Please keep this tab open" : "Opens our sponsor in a new tab"}
          </div>
        </button>

        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="text-sm font-bold">How it works:</div>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1. Tap the button above 👆</li>
            <li>2. Sponsor page opens in a new tab 🌐</li>
            <li>3. Wait 15 seconds on the ad page ⏱️</li>
            <li>4. We bring you back to the home page automatically 🏠</li>
          </ol>
        </div>

        <a href={state.telegramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
          <Send className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <div className="font-bold text-primary">Join us on Telegram</div>
            <div className="text-xs text-muted-foreground">Updates, support and more</div>
          </div>
        </a>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs text-emerald-300">
          <Info className="mx-auto mb-1 h-5 w-5" />
          Ads keep Sports Z free. Thanks for supporting us!
        </div>

        {started && (
          <button onClick={() => nav({ to: "/", replace: true })} className="mx-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Download className="h-4 w-4" /> Skip to Home
          </button>
        )}
      </div>
    </div>
  );
}