import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdmin, useStore, type Match, type AdSlot as AdSlotT } from "@/lib/store";

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

const TABS = ["Matches", "Categories", "Ads", "Settings"] as const;

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
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-bold">Add / Edit Match</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sport"><input className={inputCls} value={draft.sport} onChange={(e) => setDraft({ ...draft, sport: e.target.value })} /></Field>
          <Field label="League"><input className={inputCls} value={draft.league} onChange={(e) => setDraft({ ...draft, league: e.target.value })} /></Field>
          <Field label="Team A"><input className={inputCls} value={draft.teamA} onChange={(e) => setDraft({ ...draft, teamA: e.target.value })} /></Field>
          <Field label="Team B"><input className={inputCls} value={draft.teamB} onChange={(e) => setDraft({ ...draft, teamB: e.target.value })} /></Field>
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
        <button onClick={save} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
      </div>
      <div className="space-y-2">
        {state.matches.map((m: Match) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
            <span>{m.flagA} {m.teamA} vs {m.teamB} {m.flagB} <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs">{m.status}</span></span>
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
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Marquee / Notice Bar</h2>
        <input className={inputCls} value={state.marquee} onChange={(e) => update({ marquee: e.target.value })} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Server Links</h2>
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
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-bold">Update Notice</h2>
        <Field label="Title"><input className={inputCls} value={state.updateNotice.title} onChange={(e) => update({ updateNotice: { ...state.updateNotice, title: e.target.value } })} /></Field>
        <Field label="Body"><textarea className={inputCls} value={state.updateNotice.body} onChange={(e) => update({ updateNotice: { ...state.updateNotice, body: e.target.value } })} /></Field>
        <Field label="Version"><input className={inputCls} value={state.updateNotice.version} onChange={(e) => update({ updateNotice: { ...state.updateNotice, version: e.target.value } })} /></Field>
      </div>
    </div>
  );
}