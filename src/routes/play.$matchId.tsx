import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useStore } from "@/lib/store";
import { ArrowLeft, Maximize, Pause, Play, RotateCcw, RotateCw, Settings, Share2, Lock, PictureInPicture2, Sun, Volume2 } from "lucide-react";

export const Route = createFileRoute("/play/$matchId")({
  component: Player,
});

function Player() {
  const { matchId } = Route.useParams();
  const { state } = useStore();
  const match = state.matches.find((m) => m.id === matchId);
  const isUpcoming = match?.status === "upcoming";
  const matchServers = match?.servers?.filter((s) => s.url) ?? [];
  const servers = matchServers.length > 0 ? matchServers : [
    { name: "SP-1", url: state.servers.server1 },
    { name: "SP-2", url: state.servers.server2 },
    { name: "SP-3", url: state.servers.server3 },
  ].filter((s) => s.url);
  const [server, setServer] = useState(0);
  const [showPrompt, setShowPrompt] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string>("");
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [levels, setLevels] = useState<{ height: number; bitrate: number; index: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = auto
  const [overlay, setOverlay] = useState<{ kind: "vol" | "bri"; value: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = isUpcoming
    ? (match?.upcomingVideoUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")
    : servers[server]?.url || "";

  useEffect(() => { if (videoRef.current) videoRef.current.volume = Math.max(0, Math.min(1, volume)); }, [volume]);

  // HLS.js setup with quality-level reporting + auto failover
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    setStreamError("");
    setLevels([]);
    setCurrentLevel(-1);
    let hls: Hls | null = null;
    const isM3U8 = /\.m3u8?($|\?)/i.test(url);
    if (isM3U8 && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls!.levels.map((l, i) => ({ height: l.height, bitrate: l.bitrate, index: i })));
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data: { level: number }) => {
        setCurrentLevel(hls!.autoLevelEnabled ? -1 : data.level);
      });
      hls.on(Hls.Events.ERROR, (_e, data: { fatal: boolean; type?: string }) => {
        if (!data.fatal) return;
        // Try in-place recovery first for non-network errors
        if (data.type === "mediaError") {
          try { hls!.recoverMediaError(); return; } catch {}
        }
        // Auto-failover: cycle to next server (loop back to 0)
        if (!isUpcoming && servers.length > 1) {
          setStreamError("Switching server…");
          setServer((s) => (s + 1) % servers.length);
        } else {
          setStreamError("Stream unavailable");
        }
      });
      hlsRef.current = hls;
    } else {
      video.src = url;
    }
    return () => { if (hls) hls.destroy(); hlsRef.current = null; };
  }, [url, isUpcoming]);

  // Auto-hide controls after 3s of no interaction
  const bumpControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  };
  useEffect(() => { bumpControls(); return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, []);

  const pickLevel = (idx: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = idx; // -1 = auto
      setCurrentLevel(idx);
    }
    setShowSettings(false);
  };

  const enterFullscreen = async () => {
    setShowPrompt(false);
    try {
      await wrapRef.current?.requestFullscreen?.();
      // @ts-ignore
      await screen.orientation?.lock?.("landscape").catch(() => {});
    } catch {}
    videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
  };

  const startY = useRef<number | null>(null);
  const startSide = useRef<"L" | "R">("L");
  const startVal = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]; startY.current = t.clientY;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    startSide.current = t.clientX - rect.left < rect.width / 2 ? "L" : "R";
    startVal.current = startSide.current === "L" ? brightness : volume;
    bumpControls();
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = startY.current - e.touches[0].clientY;
    const delta = dy / 200;
    const v = Math.max(0, Math.min(1, startVal.current + delta));
    if (startSide.current === "L") { setBrightness(v); setOverlay({ kind: "bri", value: v }); }
    else { setVolume(v); setOverlay({ kind: "vol", value: v }); }
  };
  const onTouchEnd = () => { startY.current = null; setTimeout(() => setOverlay(null), 600); };

  return (
    <div ref={wrapRef} onClick={bumpControls} className="relative min-h-screen bg-black text-white" style={{ filter: `brightness(${brightness})` }}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        playsInline
        controls={false}
      />
      <div className="absolute inset-0" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />

      {overlay && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-black/70 px-5 py-3 text-center text-white">
          {overlay.kind === "vol" ? <Volume2 className="mx-auto h-6 w-6" /> : <Sun className="mx-auto h-6 w-6" />}
          <div className="mt-1 text-xs font-bold">{Math.round(overlay.value * 100)}%</div>
        </div>
      )}

      <div className={`absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <Link to="/" className="rounded-full bg-black/40 p-2"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="text-sm font-semibold text-white">{match ? `${match.teamA} vs ${match.teamB}` : "Stream"}</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full bg-black/40 p-2"><Lock className="h-4 w-4" /></button>
          <button className="rounded-full bg-black/40 p-2"><PictureInPicture2 className="h-4 w-4" /></button>
          <button onClick={enterFullscreen} className="rounded-full bg-black/40 p-2"><Maximize className="h-4 w-4" /></button>
          <button onClick={() => setShowSettings((v) => !v)} className="rounded-full bg-black/40 p-2"><Settings className="h-4 w-4" /></button>
        </div>
      </div>

      {!isUpcoming && (
        <div className={`absolute left-0 right-0 top-14 z-10 flex gap-2 overflow-x-auto px-3 pb-2 transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {servers.map((s, i) => (
            <button key={s.name} onClick={() => setServer(i)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs ${i === server ? "border-cyan-400 bg-cyan-400/20 text-cyan-300" : "border-white/30 bg-black/30 text-white/80"}`}>{s.name}</button>
          ))}
        </div>
      )}
      {streamError && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-bold text-white">{streamError}</div>
      )}

      <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-6 transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <button className="pointer-events-auto rounded-full bg-black/40 p-3"><RotateCcw className="h-6 w-6" /></button>
        <button onClick={() => { if (playing) { videoRef.current?.pause(); setPlaying(false); } else { videoRef.current?.play(); setPlaying(true); } bumpControls(); }} className="pointer-events-auto rounded-full bg-white/90 p-4 text-black">
          {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </button>
        <button className="pointer-events-auto rounded-full bg-black/40 p-3"><RotateCw className="h-6 w-6" /></button>
      </div>

      <button className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}><Share2 className="h-5 w-5" /></button>

      {showSettings && (
        <div className="absolute right-3 top-14 z-30 w-56 rounded-xl border border-white/20 bg-black/90 p-3 text-white shadow-xl">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Quality</div>
          <button onClick={() => pickLevel(-1)} className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm ${currentLevel === -1 ? "bg-emerald-500/30 text-emerald-200" : "hover:bg-white/10"}`}>Auto</button>
          {levels.length === 0 && <div className="px-3 py-2 text-xs text-white/50">No quality levels reported</div>}
          {levels.slice().sort((a, b) => b.height - a.height).map((l) => {
            const label = l.height >= 4320 ? "8K" : l.height >= 2160 ? "4K" : l.height >= 1440 ? "2K" : l.height >= 1080 ? "1080p" : l.height >= 720 ? "720p" : l.height >= 480 ? "480p" : `${l.height}p`;
            const mbps = (l.bitrate / 1_000_000).toFixed(1);
            return (
              <button key={l.index} onClick={() => pickLevel(l.index)} className={`block w-full rounded px-3 py-2 text-left text-sm ${currentLevel === l.index ? "bg-emerald-500/30 text-emerald-200" : "hover:bg-white/10"}`}>
                <span className="font-bold">{label}</span>
                <span className="ml-2 text-xs text-white/60">{mbps} Mbps</span>
              </button>
            );
          })}
        </div>
      )}

      {showPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-400/40 bg-[#04140d] p-6 text-center text-white">
            <h3 className="text-lg font-bold text-white">Tap for Fullscreen Mode</h3>
            <p className="mt-2 text-sm text-emerald-100/80">Enjoy the live stream in landscape, full screen.</p>
            <button onClick={enterFullscreen} className="mt-5 w-full rounded-full bg-[var(--gradient-brand)] px-6 py-3 font-bold text-primary-foreground">Enter Fullscreen</button>
            <button onClick={() => setShowPrompt(false)} className="mt-2 w-full py-2 text-sm text-emerald-100/60">Skip</button>
          </div>
        </div>
      )}

      {isUpcoming && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-yellow-500/90 px-4 py-1 text-xs font-bold text-black">Coming Soon Preview</div>
      )}
    </div>
  );
}