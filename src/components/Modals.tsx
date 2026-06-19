import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Send, Zap, Video, Users, X } from "lucide-react";
import logo from "@/assets/sportsz-logo.png";

export function EntryModals() {
  const { state } = useStore();
  const [step, setStep] = useState<"update" | "telegram" | "done">("done");
  useEffect(() => {
    if (sessionStorage.getItem("sportsz-modals") !== "seen") setStep("update");
  }, []);
  const finish = () => { sessionStorage.setItem("sportsz-modals", "seen"); setStep("done"); };
  if (step === "done") return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-5 shadow-[var(--shadow-glow)] animate-scale-in">
        {step === "update" ? (
          <>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-10 w-10" />
              <h2 className="text-lg font-bold">{state.updateNotice.title}</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{state.updateNotice.body}</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>✨ Improved UI — cleaner, smoother experience</li>
              <li>⚡ Faster servers — better performance</li>
              <li>🔗 Broken links fixed</li>
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-primary py-3 text-sm font-bold text-primary">UPDATE NOW</button>
              <button className="rounded-lg border border-border py-3 text-sm font-bold">WEBSITE</button>
            </div>
            <button onClick={() => setStep("telegram")} className="mt-2 w-full rounded-lg border border-border py-3 text-sm font-bold">UPDATE LATER</button>
          </>
        ) : (
          <>
            <button aria-label="close" onClick={finish} className="ml-auto block text-muted-foreground"><X className="h-5 w-5" /></button>
            <div className="-mt-8 flex flex-col items-center gap-2">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-7 w-7" /></div>
              <h2 className="text-lg font-bold tracking-wider">JOIN SPORTS Z</h2>
              <p className="text-center text-sm text-muted-foreground">Get exclusive access to live links, highlights and instant updates.</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-3"><Zap className="h-5 w-5 text-accent" /> Fastest Live Score Updates</li>
              <li className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-3"><Video className="h-5 w-5 text-accent" /> Exclusive HD Match Links</li>
              <li className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-3"><Users className="h-5 w-5 text-accent" /> Join 50k+ Sports Fans</li>
            </ul>
            <a href={state.telegramUrl} target="_blank" rel="noreferrer" onClick={finish} className="mt-4 block rounded-full bg-[var(--gradient-brand)] py-3 text-center font-bold text-primary-foreground">JOIN CHANNEL FREE</a>
            <button onClick={finish} className="mt-2 block w-full py-2 text-center text-sm text-muted-foreground">Maybe Later</button>
          </>
        )}
      </div>
    </div>
  );
}