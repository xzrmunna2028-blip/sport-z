import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Star, Home, LayoutGrid, Play, Share2, Mail, RefreshCw, LogOut, Bell, Copyright, MessageSquare, Settings, X, Trophy, Tv, Heart, Zap, Globe, Video, Tag, Link as LinkIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import logo from "@/assets/sportsz-logo.png";
import { useStore } from "@/lib/store";

const ICONS: Record<string, any> = {
  Settings, Bell, MessageSquare, Copyright, Share2, Mail, RefreshCw, LogOut,
  Trophy, Tv, Heart, Zap, Globe, Video, Tag, Home, LayoutGrid, Play, Star,
};

export function AdSlot({ placement }: { placement: "header" | "footer" | "inline" | "player" | "popunder" }) {
  const { state } = useStore();
  // Hide legacy placeholder ads ("Header Ad — 728x90", "Inline Banner Ad", "Footer Ad")
  // so the homepage never shows "place ad here" boxes — only real admin-added ads render.
  const isPlaceholder = (html: string) =>
    /Header Ad —|Inline Banner Ad|^\s*<div[^>]*>\s*Footer Ad\s*<\/div>\s*$/i.test(html);
  const ads = state.ads.filter(
    (a) => a.enabled && a.placement === placement && a.html?.trim() && !isPlaceholder(a.html),
  );
  if (!ads.length) return null;
  return (
    <div className="space-y-2">
      {ads.map((a) => (
        <div key={a.id} className="rounded-lg border border-border/60 bg-card/40" dangerouslySetInnerHTML={{ __html: a.html }} />
      ))}
    </div>
  );
}

function Marquee() {
  const { state } = useStore();
  if (!state.sectionToggles?.marquee) return null;
  return (
    <div className="mx-3 mt-2 overflow-hidden rounded-lg border border-primary/40 bg-card/40">
      <div className="whitespace-nowrap py-2 text-sm font-semibold text-primary [animation:marquee_30s_linear_infinite]">
        {state.marquee} &nbsp;•&nbsp; {state.marquee}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(100%);} to { transform: translateX(-100%);} }`}</style>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const items = (state.sidebarItems || []).filter((i) => i.enabled);
  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed left-0 top-0 z-50 h-full w-72 bg-card border-r border-border transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <img src={logo} alt="Sports Z" className="h-10 w-10" />
          <div>
            <div className="font-display text-lg font-black tracking-widest text-primary">SPORTS Z</div>
            <div className="text-xs text-muted-foreground">v{state.updateNotice.version} • Ads Free</div>
          </div>
          <button onClick={onClose} className="ml-auto text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-2">
          {items.map((it) => {
            const Icon = ICONS[it.icon] || Tag;
            const inner = (
              <>
                <Icon className="h-5 w-5" style={{ color: it.color || "var(--color-primary)" }} /> {it.label}
              </>
            );
            return it.url ? (
              <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-secondary">{inner}</a>
            ) : (
              <button key={it.id} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-secondary">{inner}</button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useStore();
  const tabs = ([
    { to: "/", icon: Home, label: "Home" },
    state.sectionToggles?.categoriesSection !== false ? { to: "/categories", icon: LayoutGrid, label: "Categories" } : null,
    state.sectionToggles?.highlightsSection !== false ? { to: "/highlights", icon: Play, label: "Highlights" } : null,
  ].filter(Boolean)) as Array<{ to: "/" | "/categories" | "/highlights"; icon: any; label: string }>;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-2xl" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}>
        {tabs.map((t) => {
          const active = t.to === "/" ? path === "/" : path.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to} className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
              <t.icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_var(--neon-cyan)]" : ""}`} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-3">
          <button aria-label="menu" onClick={() => setOpen(true)} className="rounded p-1 text-foreground"><Menu className="h-6 w-6" /></button>
          {title ? (
            <h1 className="ml-2 font-display text-lg font-bold tracking-wider">{title}</h1>
          ) : (
            <div className="mx-auto flex items-center gap-2">
              <img src={logo} alt="Sports Z" className="h-8 w-8" />
              <span className="bg-[var(--gradient-brand)] bg-clip-text font-display text-2xl font-black tracking-[0.2em] text-transparent">SPORTS Z</span>
            </div>
          )}
          <button aria-label="search" className="ml-auto rounded-full border border-border p-2"><Search className="h-4 w-4" /></button>
          {state.sectionToggles?.shareButton && (
            <button aria-label="share" className="rounded-full border border-border p-2"><Share2 className="h-4 w-4" /></button>
          )}
        </div>
        <Marquee />
        <div className="px-3 pt-2"><AdSlot placement="header" /></div>
      </header>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="px-3 py-4">{children}</main>
      <div className="px-3 pb-4"><AdSlot placement="footer" /></div>
      <BottomNav />
    </div>
  );
}