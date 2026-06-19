import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useStore } from "@/lib/store";
import { ArrowLeft, Maximize, Pause, Play, RotateCcw, RotateCw, Settings, Share2, Lock, PictureInPicture2 } from "lucide-react";

export const Route = createFileRoute("/play/$matchId")({
  component: Player,
});

function Player() {
  const { matchId } = Route.useParams();
  const { state } = useStore();
  const match = state.matches.find((m) => m.id === matchId);
  const isUpcoming = match?.status === "upcoming";
  // Prefer per-match servers if defined, else fall back to global settings
  const matchServers = match?.servers?.filter((s) => s.url) ?? [];
  const servers = matchServers.length > 0 ? matchServers : [
    { name: "SP-1", url: state.servers.server1 },
    { name: "SP-2", url: state.servers.server2 },
    { name: "SP-3", url: state.servers.server3 },
    { name: "Server 1", url: state.servers.server1 },
    { name: "Server 2", url: state.servers.server2 },
    { name: "Server 3", url: state.servers.server3 },
  ];
  const [server, setServer] = useState(0);
  const [showPrompt, setShowPrompt] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string>("");
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const url = isUpcoming
    ? (match?.upcomingVideoUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")
    : servers[server]?.url || "";

  useEffect(() => { if (videoRef.current) videoRef.current.volume = Math.max(0, Math.min(1, volume)); }, [volume]);

  // HLS.js setup — supports M3U8/M3U streams + auto failover on fatal error
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    setStreamError("");
    let hls: Hls | null = null;
    const isM3U8 = /\.m3u8?($|\?)/i.test(url);

    if (isM3U8 && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean }) => {
        if (data.fatal) {
          setStreamError("Stream error — try another server");
          // Auto-advance to next server on fatal failure
          if (!isUpcoming && server < servers.length - 1) setServer((s) => s + 1);
        }
      });
    } else {
      video.src = url;
    }
    return () => { if (hls) hls.destroy(); };
  }, [url, isUpcoming]);

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
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = startY.current - e.touches[0].clientY;
    const delta = dy / 200;
    const v = Math.max(0, Math.min(1, startVal.current + delta));
    if (startSide.current === "L") setBrightness(v); else setVolume(v);
  };
  const onTouchEnd = () => { startY.current = null; };

  return (
    <div ref={wrapRef} className="relative min-h-screen bg-black text-white" style={{ filter: `brightness(${brightness})` }}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        playsInline
        controls={false}
      />
      <div className="absolute inset-0" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-3">
        <Link to="/" className="rounded-full bg-black/40 p-2"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="text-sm font-semibold">{match ? `${match.teamA} vs ${match.teamB}` : "Stream"}</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full bg-black/40 p-2"><Lock className="h-4 w-4" /></button>
          <button className="rounded-full bg-black/40 p-2"><PictureInPicture2 className="h-4 w-4" /></button>
          <button onClick={enterFullscreen} className="rounded-full bg-black/40 p-2"><Maximize className="h-4 w-4" /></button>
          <button className="rounded-full bg-black/40 p-2"><Settings className="h-4 w-4" /></button>
        </div>
      </div>

      {!isUpcoming && (
        <div className="absolute left-0 right-0 top-14 z-10 flex gap-2 overflow-x-auto px-3 pb-2">
          {servers.map((s, i) => (
            <button key={s.name} onClick={() => setServer(i)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs ${i === server ? "border-cyan-400 bg-cyan-400/20 text-cyan-300" : "border-white/30 bg-black/30 text-white/80"}`}>{s.name}</button>
          ))}
        </div>
      )}
      {streamError && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-bold text-white">{streamError}</div>
      )}

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-6">
        <button className="pointer-events-auto rounded-full bg-black/40 p-3"><RotateCcw className="h-6 w-6" /></button>
        <button onClick={() => { if (playing) { videoRef.current?.pause(); setPlaying(false); } else { videoRef.current?.play(); setPlaying(true); } }} className="pointer-events-auto rounded-full bg-white/90 p-4 text-black">
          {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </button>
        <button className="pointer-events-auto rounded-full bg-black/40 p-3"><RotateCw className="h-6 w-6" /></button>
      </div>

      <button className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3"><Share2 className="h-5 w-5" /></button>

      {showPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="text-lg font-bold">Tap for Fullscreen Mode</h3>
            <p className="mt-2 text-sm text-muted-foreground">Enjoy the live stream in landscape, full screen.</p>
            <button onClick={enterFullscreen} className="mt-5 w-full rounded-full bg-[var(--gradient-brand)] px-6 py-3 font-bold text-primary-foreground">Enter Fullscreen</button>
            <button onClick={() => setShowPrompt(false)} className="mt-2 w-full py-2 text-sm text-muted-foreground">Skip</button>
          </div>
        </div>
      )}

      {isUpcoming && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-yellow-500/90 px-4 py-1 text-xs font-bold text-black">Coming Soon Preview</div>
      )}
    </div>
  );
}