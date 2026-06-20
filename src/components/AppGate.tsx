import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Splash } from "./Splash";
import { SubscribeModal } from "./SubscribeModal";
import logo from "@/assets/sportsz-logo.png";

export function AppGate({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const [splashDone, setSplashDone] = useState(false);
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sportsz-splashed") === "1") setSplashDone(true);
  }, []);

  useEffect(() => {
    if (!splashDone) return;
    sessionStorage.setItem("sportsz-splashed", "1");
    if (state.subscribePopupEnabled && !localStorage.getItem("sportsz-subscribed")) {
      const t = setTimeout(() => setShowSub(true), 400);
      return () => clearTimeout(t);
    }
  }, [splashDone, state.subscribePopupEnabled]);

  // Allow admins to always reach /admin even when maintenance is ON,
  // so they can turn it back off.
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isAdminRoute = path.startsWith("/admin");
  if (state.maintenance.enabled && !isAdminRoute) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#04140d] p-6 text-emerald-200">
        <div className="max-w-md text-center">
          <img src={logo} alt="" className="mx-auto h-20 w-20 drop-shadow-[0_0_20px_rgba(16,185,129,.6)]" />
          <h1 className="mt-5 text-2xl font-black tracking-wider">{state.maintenance.title}</h1>
          <p className="mt-2 text-sm text-emerald-100/70">{state.maintenance.message}</p>
          {state.maintenance.apkUrl && (
            <a href={state.maintenance.apkUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-full bg-emerald-400 px-6 py-3 font-bold text-black shadow-[0_0_25px_rgba(16,185,129,.6)]">Download Latest APK</a>
          )}
        </div>
      </div>
    );
  }

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />;

  return (
    <>
      {children}
      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
    </>
  );
}