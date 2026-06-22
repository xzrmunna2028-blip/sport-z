import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdmin, useStore, type Match, type AdSlot as AdSlotT, type SidebarItem } from "@/lib/store";
import { FIFA_PRESET } from "@/lib/fifaPreset";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const { authed, login, logout } = useAdmin();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <form
          onSubmit={(e) => { e.preventDefault(); if (!login(pw)) setErr("Wrong password"); }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6"
        >
          <h1 className="text-xl font-bold">Sports Z — Admin</h1>
          <p className="mt-1 text-xs text-muted-foreground">Restricted area</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
          <button className="mt-3 w-full rounded-full bg-[var(--gradient-brand)] py-3 font-bold text-primary-foreground">Sign in</button>
        </form>
      </div>
    );
  }
  return <Dashboard onLogout={logout} />;
}

const TABS = ["Matches", "Categories", "Ads", "Sidebar", "Toggles", "Settings"] as const;

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { state, setState } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Matches");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-primary">Sports Z Admin</h1>
        <button onClick={onLogout} className="rounded-full border border-border px-3 py-1 text-xs">Logout</button>
      </header>
      <nav className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs ${tab === t ? "bg-primary text-primary-foreground" : "border border-border"}`}>{t}</button>
        ))}
      </nav>
      <main className="mx-auto max-w-4xl p-4">
        {tab === "Matches" && <MatchesAdmin state={state} setState={setState} />}
        {tab === "Categories" && <CategoriesAdmin state={state} setState={setState} />}
        {tab === "Ads" && <AdsAdmin state={state} setState={setState} />}
        {tab === "Sidebar" && <SidebarAdmin state={state} setState={setState} />}
        {tab === "Toggles" && <TogglesAdmin state={state} setState={setState} />}
        {tab === "Settings" && <SettingsAdmin state={state} setState={setState} />}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function MatchesAdmin({ state, setState }: any) {
  const empty: Match = { id: crypto.randomUUID(), sport: "Football", league: "", teamA: "", teamB: "", flagA: "🏳️", flagB: "🏳️", time: "", status: "upcoming", servers: [] };
  const [draft, setDraft] = useState<Match>(empty);
  const save = () => {
    const exists = state.matches.find((m: Match) => m.id === draft.id);
    const matches = exists ? state.matches.map((m: Match) => m.id === draft.id ? draft : m) : [...state.matches, draft];
    setState({ ...state, matches });
    setDraft({ ...empty, id: crypto.randomUUID() });
  };
  const del = (id: string) => setState({ ...state, matches: state.matches.filter((m: Match) => m.id !== id) });
  const importFifa = () => {
    const additions = FIFA_PRESET.map((m) => ({ ...m, id: crypto.randomUUID() }));
    setState({ ...state, matches: [...state.matches, ...additions] });
  };
  const addServer = () => setDraft({ ...draft, servers: [...draft.servers, { name: `Server ${draft.servers.length + 1}`, url: "" }] });
  const updateServer = (i: number, patch: Partial<{ name: string; url: string }>) =>
    setDraft({ ...draft, servers: draft.servers.map((s, j) => j === i ? { ...s, ...patch } : s) });
  const removeServer = (i: number) => setDraft({ ...draft, servers: draft.servers.filter((_, j) => j !== i) });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
        <span className="text-sm">🏆 FIFA World Cup 2026 pre-list — {FIFA_PRESET.length} matches</span>
        <button onClick={importFifa} className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-bold text-black">Import all</button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-bold">Add / Edit Match</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sport"><input className={inputCls} value={draft.sport} onChange={(e) => setDraft({ ...draft, sport: e.target.value })} /></Field>
          <Field label="League"><input className={inputCls} value={draft.league} onChange={(e) => setDraft({ ...draft, league: e.target.value })} /></Field>
          <Field label="Team A"><input className={inputCls} value={draft.teamA} onChange={(e) => {
            const v = e.target.value; const auto = flagForTeam(v);
            setDraft({ ...draft, teamA: v, flagA: auto ?? draft.flagA });
          }} /></Field>
          <Field label="Team B"><input className={inputCls} value={draft.teamB} onChange={(e) => {
            const v = e.target.value; const auto = flagForTeam(v);
            setDraft({ ...draft, teamB: v, flagB: auto ?? draft.flagB });
          }} /></Field>
          <Field label="Flag A (emoji)"><input className={inputCls} value={draft.flagA} onChange={(e) => setDraft({ ...draft, flagA: e.target.value })} /></Field>
          <Field label="Flag B (emoji)"><input className={inputCls} value={draft.flagB} onChange={(e) => setDraft({ ...draft, flagB: e.target.value })} /></Field>
          <Field label="Time / Date"><input className={inputCls} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></Field>
          <Field label="Status">
            <select className={inputCls} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}>
              <option value="live">live</option><option value="upcoming">upcoming</option><option value="recent">recent</option>
            </select>
          </Field>
          <Field label="Coming Soon Video URL"><input className={inputCls} value={draft.upcomingVideoUrl || ""} onChange={(e) => setDraft({ ...draft, upcomingVideoUrl: e.target.value })} /></Field>
        </div>
        {draft.status === "live" && (
          <div className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3">
            <Field label="Live started at (real-time minute counter starts here)">
              <input
                type="datetime-local"
                className={inputCls}
                value={draft.liveStartedAt ? new Date(draft.liveStartedAt).toISOString().slice(0,16) : ""}
                onChange={(e) => setDraft({ ...draft, liveStartedAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </Field>
            <button onClick={() => setDraft({ ...draft, liveStartedAt: new Date().toISOString() })} className="mt-2 rounded bg-emerald-400 px-3 py-1 text-xs font-bold text-black">Start Now</button>
          </div>
        )}
        <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">M3U / HLS Servers for this match</span>
            <button onClick={addServer} className="rounded bg-secondary px-2 py-1 text-xs">+ Add server</button>
          </div>
          {draft.servers.length === 0 && <p className="text-xs text-muted-foreground">No per-match servers — global Server 1/2/3 from Settings will be used.</p>}
          <div className="space-y-2">
            {draft.servers.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} w-28`} placeholder="Label" value={s.name} onChange={(e) => updateServer(i, { name: e.target.value })} />
                <input className={inputCls} placeholder="https://…/stream.m3u8" value={s.url} onChange={(e) => updateServer(i, { url: e.target.value })} />
                <button onClick={() => removeServer(i)} className="rounded border border-destructive px-2 text-xs text-destructive">×</button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={save} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
      </div>
      <div className="space-y-2">
        {state.matches.map((m: Match) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
            <span>{m.flagA} {m.teamA} vs {m.teamB} {m.flagB} <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs">{m.status}</span> {m.servers.length > 0 && <span className="ml-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">{m.servers.length} srv</span>}</span>
            <span className="flex gap-2">
              <button onClick={() => setDraft(m)} className="rounded border border-border px-2 py-1 text-xs">Edit</button>
              <button onClick={() => del(m.id)} className="rounded border border-destructive px-2 py-1 text-xs text-destructive">Delete</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesAdmin({ state, setState }: any) {
  const [name, setName] = useState(""); const [icon, setIcon] = useState("📺");
  const add = () => { if (!name) return; setState({ ...state, categories: [...state.categories, { id: crypto.randomUUID(), name, icon, channels: [] }] }); setName(""); };
  const del = (id: string) => setState({ ...state, categories: state.categories.filter((c: any) => c.id !== id) });
  const addChannel = (catId: string, n: string, url: string) => {
    setState({ ...state, categories: state.categories.map((c: any) => c.id === catId ? { ...c, channels: [...c.channels, { id: crypto.randomUUID(), name: n, logo: "📺", url }] } : c) });
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-bold">Add Category</h2>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={`${inputCls} w-20`} value={icon} onChange={(e) => setIcon(e.target.value)} />
          <button onClick={add} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Add</button>
        </div>
      </div>
      {state.categories.map((c: any) => (
        <details key={c.id} className="rounded-lg border border-border bg-card p-3">
          <summary className="flex cursor-pointer items-center justify-between"><span>{c.icon} {c.name} ({c.channels.length})</span><button onClick={(e) => { e.preventDefault(); del(c.id); }} className="text-xs text-destructive">Delete</button></summary>
          <ul className="mt-2 space-y-1 text-sm">
            {c.channels.map((ch: any) => <li key={ch.id} className="text-muted-foreground">• {ch.name} — {ch.url || "(no url)"}</li>)}
          </ul>
          <ChannelForm onAdd={(n, u) => addChannel(c.id, n, u)} />
        </details>
      ))}
    </div>
  );
}
function ChannelForm({ onAdd }: { onAdd: (n: string, u: string) => void }) {
  const [n, setN] = useState(""); const [u, setU] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input className={inputCls} placeholder="Channel name" value={n} onChange={(e) => setN(e.target.value)} />
      <input className={inputCls} placeholder="Stream URL" value={u} onChange={(e) => setU(e.target.value)} />
      <button onClick={() => { if (n) { onAdd(n, u); setN(""); setU(""); } }} className="rounded bg-secondary px-3 text-xs">Add</button>
    </div>
  );
}

function AdsAdmin({ state, setState }: any) {
  const [placement, setPlacement] = useState<AdSlotT["placement"]>("inline");
  const [html, setHtml] = useState("");
  const add = () => { if (!html) return; setState({ ...state, ads: [...state.ads, { id: crypto.randomUUID(), placement, html, enabled: true }] }); setHtml(""); };
  const toggle = (id: string) => setState({ ...state, ads: state.ads.map((a: AdSlotT) => a.id === id ? { ...a, enabled: !a.enabled } : a) });
  const del = (id: string) => setState({ ...state, ads: state.ads.filter((a: AdSlotT) => a.id !== id) });
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-bold">Add Ad Block (HTML / JS)</h2>
        <select className={inputCls} value={placement} onChange={(e) => setPlacement(e.target.value as any)}>
          {(["header","footer","inline","player","popunder"] as const).map((p) => <option key={p}>{p}</option>)}
        </select>
        <textarea className={`${inputCls} mt-2 min-h-32 font-mono text-xs`} placeholder="<script src='...adsterra...'></script>" value={html} onChange={(e) => setHtml(e.target.value)} />
        <button onClick={add} className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Add Ad</button>
      </div>
      <div className="space-y-2">
        {state.ads.map((a: AdSlotT) => (
          <div key={a.id} className="rounded-lg border border-border bg-card p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-secondary px-2 py-0.5">{a.placement}</span>
              <div className="flex gap-2">
                <button onClick={() => toggle(a.id)} className="rounded border border-border px-2 py-1">{a.enabled ? "Disable" : "Enable"}</button>
                <button onClick={() => del(a.id)} className="rounded border border-destructive px-2 py-1 text-destructive">Delete</button>
              </div>
            </div>
            <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-muted-foreground">{a.html}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsAdmin({ state, setState }: any) {
  const update = (patch: any) => setState({ ...state, ...patch });
  const [subCount, setSubCount] = useState<number | null>(null);
  useEffect(() => {
    supabase.from("subscribers").select("id", { count: "exact", head: true }).then(({ count }) => setSubCount(count ?? 0));
  }, []);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <h2 className="font-bold">Push Subscribers (OneSignal)</h2>
        <p className="mt-1 text-2xl font-black text-emerald-300">{subCount ?? "…"}</p>
        <p className="text-xs text-muted-foreground">Send broadcasts from your OneSignal dashboard (App ID 6fc4b9cc-…).</p>
      </div>
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-3">
        <h2 className="font-bold">🛠 Maintenance Mode</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.maintenance.enabled} onChange={(e) => update({ maintenance: { ...state.maintenance, enabled: e.target.checked } })} /> Put the site in maintenance mode</label>
        <Field label="Title"><input className={inputCls} value={state.maintenance.title} onChange={(e) => update({ maintenance: { ...state.maintenance, title: e.target.value } })} /></Field>
        <Field label="Message"><textarea className={inputCls} value={state.maintenance.message} onChange={(e) => update({ maintenance: { ...state.maintenance, message: e.target.value } })} /></Field>
        <Field label="APK Download URL"><input className={inputCls} value={state.maintenance.apkUrl} onChange={(e) => update({ maintenance: { ...state.maintenance, apkUrl: e.target.value } })} /></Field>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Marquee / Notice Bar</h2>
        <input className={inputCls} value={state.marquee} onChange={(e) => update({ marquee: e.target.value })} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Global Fallback Server Links (M3U8)</h2>
        {(["server1","server2","server3"] as const).map((k) => (
          <Field key={k} label={k}><input className={inputCls} value={(state.servers as any)[k]} onChange={(e) => update({ servers: { ...state.servers, [k]: e.target.value } })} /></Field>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Monetization & Onboarding</h2>
        <Field label="Ad Redirect URL"><input className={inputCls} value={state.adRedirectUrl} onChange={(e) => update({ adRedirectUrl: e.target.value })} /></Field>
        <Field label="Telegram URL"><input className={inputCls} value={state.telegramUrl} onChange={(e) => update({ telegramUrl: e.target.value })} /></Field>
        <Field label="Premium Code"><input className={inputCls} value={state.premiumCode} onChange={(e) => update({ premiumCode: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.gateEnabled} onChange={(e) => update({ gateEnabled: e.target.checked })} /> Enable pre-entry gate</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.subscribePopupEnabled} onChange={(e) => update({ subscribePopupEnabled: e.target.checked })} /> Show "Subscribe for 4K/HD" popup on entry</label>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Update Notice</h2>
        <Field label="Title"><input className={inputCls} value={state.updateNotice.title} onChange={(e) => update({ updateNotice: { ...state.updateNotice, title: e.target.value } })} /></Field>
        <Field label="Body"><textarea className={inputCls} value={state.updateNotice.body} onChange={(e) => update({ updateNotice: { ...state.updateNotice, body: e.target.value } })} /></Field>
        <Field label="Version"><input className={inputCls} value={state.updateNotice.version} onChange={(e) => update({ updateNotice: { ...state.updateNotice, version: e.target.value } })} /></Field>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Subscribe Success Popup</h2>
        <Field label="Congratulations message shown after subscribing">
          <textarea className={inputCls} value={state.subscribeSuccessMsg} onChange={(e) => update({ subscribeSuccessMsg: e.target.value })} />
        </Field>
      </div>
      <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-3">
        <h2 className="font-bold">📦 Download Source Code (ZIP)</h2>
        <p className="text-xs text-muted-foreground">Connect this project to GitHub from Lovable settings (top-right → GitHub), then paste your repo URL here. The download button will fetch the latest ZIP archive in one click.</p>
        <Field label="GitHub repo URL (e.g. https://github.com/you/sports-z)"><input className={inputCls} value={state.sourceRepoUrl} onChange={(e) => update({ sourceRepoUrl: e.target.value })} /></Field>
        <a
          href={state.sourceRepoUrl ? `${state.sourceRepoUrl.replace(/\/$/, "")}/archive/refs/heads/main.zip` : "#"}
          onClick={(e) => { if (!state.sourceRepoUrl) { e.preventDefault(); alert("Set your GitHub repo URL first."); } }}
          className="inline-block rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-black"
        >⬇ Download full source as ZIP</a>
      </div>
    </div>
  );
}

const ICON_CHOICES = ["Settings","Bell","MessageSquare","Copyright","Share2","Mail","RefreshCw","LogOut","Trophy","Tv","Heart","Zap","Globe","Video","Tag"];
const ICON_HINTS: Record<string,string> = {
  ad: "Tag", advertisement: "Tag", notice: "Bell", alert: "Bell", chat: "MessageSquare",
  telegram: "MessageSquare", share: "Share2", mail: "Mail", email: "Mail", update: "RefreshCw",
  exit: "LogOut", logout: "LogOut", quality: "Settings", setting: "Settings", trophy: "Trophy",
  channel: "Tv", live: "Video", world: "Globe", love: "Heart", fast: "Zap",
};
function suggestIcon(label: string) {
  const lc = label.toLowerCase();
  for (const k of Object.keys(ICON_HINTS)) if (lc.includes(k)) return ICON_HINTS[k];
  return "Tag";
}

function SidebarAdmin({ state, setState }: any) {
  const [draft, setDraft] = useState<SidebarItem>({ id: "", label: "", icon: "Tag", url: "", color: "#22d3ee", enabled: true });
  const save = () => {
    if (!draft.label) return;
    const item = { ...draft, id: draft.id || crypto.randomUUID() };
    const exists = state.sidebarItems.find((s: SidebarItem) => s.id === item.id);
    const sidebarItems = exists ? state.sidebarItems.map((s: SidebarItem) => s.id === item.id ? item : s) : [...state.sidebarItems, item];
    setState({ ...state, sidebarItems });
    setDraft({ id: "", label: "", icon: "Tag", url: "", color: "#22d3ee", enabled: true });
  };
  const del = (id: string) => setState({ ...state, sidebarItems: state.sidebarItems.filter((s: SidebarItem) => s.id !== id) });
  const toggle = (id: string) => setState({ ...state, sidebarItems: state.sidebarItems.map((s: SidebarItem) => s.id === id ? { ...s, enabled: !s.enabled } : s) });
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Add / Edit Sidebar Item</h2>
        <p className="text-xs text-muted-foreground">Type a label like "Ad" or "Telegram" — the icon will be auto-suggested.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label">
            <input className={inputCls} value={draft.label} onChange={(e) => {
              const label = e.target.value;
              setDraft({ ...draft, label, icon: draft.icon === "Tag" || !draft.id ? suggestIcon(label) : draft.icon });
            }} />
          </Field>
          <Field label="Icon">
            <select className={inputCls} value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
              {ICON_CHOICES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="URL (optional)"><input className={inputCls} value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></Field>
          <Field label="Color"><input type="color" className={`${inputCls} h-10 p-1`} value={draft.color || "#22d3ee"} onChange={(e) => setDraft({ ...draft, color: e.target.value })} /></Field>
        </div>
        <button onClick={save} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{draft.id ? "Update" : "Add"} item</button>
      </div>
      <div className="space-y-2">
        {state.sidebarItems.map((s: SidebarItem) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color || "var(--color-primary)" }} />
              <strong>{s.label}</strong>
              <span className="text-xs text-muted-foreground">{s.icon}{s.url ? ` · ${s.url}` : ""}</span>
              {!s.enabled && <span className="rounded bg-muted px-2 py-0.5 text-xs">off</span>}
            </span>
            <span className="flex gap-2">
              <button onClick={() => toggle(s.id)} className="rounded border border-border px-2 py-1 text-xs">{s.enabled ? "Disable" : "Enable"}</button>
              <button onClick={() => setDraft(s)} className="rounded border border-border px-2 py-1 text-xs">Edit</button>
              <button onClick={() => del(s.id)} className="rounded border border-destructive px-2 py-1 text-xs text-destructive">Delete</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TogglesAdmin({ state, setState }: any) {
  const t = state.sectionToggles;
  const set = (k: string, v: boolean) => setState({ ...state, sectionToggles: { ...t, [k]: v } });
  const rows: [keyof typeof t, string, string][] = [
    ["marquee", "Marquee / Notice bar", "The scrolling text under the header"],
    ["sportPills", "Sport category pills", "All / Cricket / Football pills on home"],
    ["statusTabs", "Status tabs (Recent / Live / Upcoming)", "Filter chips on home"],
    ["categoriesSection", "Categories tab in bottom nav", "Hides the Categories page link"],
    ["highlightsSection", "Highlights tab in bottom nav", "Hides the Highlights page link"],
    ["shareButton", "Share button in header", "Shown only when enabled"],
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Turn any homepage section on or off in real time. Changes sync instantly to every visitor.</p>
      {rows.map(([k, label, hint]) => (
        <label key={k as string} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <span>
            <span className="block font-semibold">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
          <input type="checkbox" className="h-5 w-10" checked={!!t[k]} onChange={(e) => set(k as string, e.target.checked)} />
        </label>
      ))}
    </div>
  );
}