import { useState } from "react";
import { Bell, Sparkles, X, PartyPopper } from "lucide-react";
import logo from "@/assets/sportsz-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToPush } from "@/lib/onesignal";
import { useStore } from "@/lib/store";

export function SubscribeModal({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const subscribe = async () => {
    setLoading(true); setErr("");
    // Optimistic: show success immediately, do push + DB in background.
    localStorage.setItem("sportsz-subscribed", "1");
    setSuccess(true);
    setLoading(false);
    (async () => {
      let playerId: string | null = null;
      try { playerId = await subscribeToPush(); }
      catch (e) { console.warn("[subscribe] push register failed", e); }
      try {
        const { error } = await supabase.from("subscribers").insert({
          email: email.trim() || null,
          onesignal_player_id: playerId,
          user_agent: navigator.userAgent.slice(0, 200),
        });
        if (error) console.error("[subscribe] insert error", error);
      } catch (e) {
        console.error("[subscribe] insert threw", e);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-[#0a1f15] to-[#04140d] p-6 shadow-[0_0_60px_rgba(16,185,129,.35)] animate-scale-in">
        <button onClick={onClose} aria-label="close" className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-emerald-300/80 hover:bg-white/10"><X className="h-4 w-4" /></button>
        {success ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative grid h-24 w-24 place-items-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,.7)] animate-scale-in">
              <PartyPopper className="h-12 w-12 text-emerald-300" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold tracking-wider text-emerald-300">CONGRATULATIONS!</h2>
            <p className="mt-3 text-base font-semibold text-white">You are now a Sports Z Partner 🎉</p>
            <p className="mt-2 text-sm text-emerald-100/80">{state.subscribeSuccessMsg}</p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 py-3 font-extrabold tracking-wider text-black shadow-[0_0_25px_rgba(16,185,129,.6)] hover-scale">
              START WATCHING
            </button>
          </div>
        ) : (
        <div className="flex flex-col items-center text-center">
          <div className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-400/70 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,.5)]">
            <img src={logo} alt="" className="h-10 w-10" />
            <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-400 text-black"><Bell className="h-4 w-4" /></span>
          </div>
          <h2 className="mt-5 text-xl font-extrabold tracking-wider text-white">Subscribe to Watch Live</h2>
          <p className="mt-2 text-sm text-emerald-100/70">Get exclusive access to live sports in crystal clear <span className="font-bold text-emerald-300">4K / HD</span> and never miss a match.</p>
          <ul className="mt-4 w-full space-y-2 text-left text-sm">
            <li className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-emerald-100/90"><Sparkles className="h-4 w-4 text-emerald-300" /> 4K / HD live streams</li>
            <li className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-emerald-100/90"><Bell className="h-4 w-4 text-emerald-300" /> Push alerts for every match</li>
          </ul>
          <input
            type="email"
            placeholder="your@email.com (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 w-full rounded-xl border border-emerald-400/30 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-emerald-100/30 focus:border-emerald-400 focus:outline-none"
          />
          {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
          <button
            onClick={subscribe}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 py-3 font-extrabold tracking-wider text-black shadow-[0_0_25px_rgba(16,185,129,.6)] disabled:opacity-60"
          >
            {loading ? "Subscribing…" : "SUBSCRIBE & WATCH NOW"}
          </button>
          <button onClick={onClose} className="mt-2 text-xs text-emerald-100/40 hover:text-emerald-100/70">Maybe later</button>
        </div>
        )}
      </div>
    </div>
  );
}