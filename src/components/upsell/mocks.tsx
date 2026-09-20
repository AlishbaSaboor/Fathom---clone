// Decorative stand-ins for the product screenshots on the real upsell pages.
// They are drawn with plain markup (no images), use the seed data's colors and
// names, and are hidden from assistive tech because they carry no information.

const GRADS = [
  ["#4f46e5", "#7c3aed"],
  ["#b45309", "#7c2d12"],
  ["#0f766e", "#0369a1"],
  ["#be185d", "#9d174d"],
  ["#4338ca", "#0e7490"],
  ["#7c3aed", "#be185d"],
];

function Shell({ tabs, active, children }: { tabs: string[]; active: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-[10px] leading-tight text-zinc-300 shadow-2xl"
    >
      <div className="mb-3 flex gap-3 border-b border-zinc-800 pb-2 text-[9px]">
        {tabs.map((t) => (
          <span key={t} className={t === active ? "font-semibold text-violet-300" : "text-zinc-500"}>
            {t}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

function Thumb({ i, label }: { i: number; label?: string }) {
  const [a, b] = GRADS[i % GRADS.length];
  return (
    <div>
      <div className="h-12 rounded-md" style={{ backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }} />
      {label && <p className="mt-1 truncate text-[8px] text-zinc-400">{label}</p>}
    </div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name.split(" ").map((p) => p[0]).join("")}
    </span>
  );
}

export function TeamCallsMock() {
  const members = [
    { name: "Priya Nair", role: "Product", color: "#7c3aed", calls: 15, talk: "11%" },
    { name: "Marcus Chen", role: "Engineering", color: "#0891b2", calls: 29, talk: "27%" },
    { name: "Dana Whitfield", role: "Sales", color: "#0d9488", calls: 26, talk: "58%" },
  ];
  return (
    <Shell tabs={["My Calls", "Team Calls"]} active="Team Calls">
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Today</p>
      <div className="grid grid-cols-3 gap-2">
        <Thumb i={0} label="Weekly product standup" />
        <Thumb i={2} label="Northgate: discovery" />
        <Thumb i={3} label="Onboarding research" />
      </div>
      <div className="mt-3 rounded-lg bg-zinc-800 p-3">
        <div className="mb-2 flex justify-between text-[9px]">
          <span>
            Recent calls <b className="ml-1 text-sm text-white">68</b>
          </span>
          <span>
            Talk time <b className="ml-1 text-sm text-white">42%</b>
          </span>
        </div>
        <p className="mb-1 text-[9px] font-semibold text-zinc-100">Team members</p>
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-2 border-t border-zinc-700 py-1.5">
            <Avatar name={m.name} color={m.color} />
            <span className="flex-1 truncate text-zinc-200">
              {m.name} <span className="text-zinc-500">{m.role}</span>
            </span>
            <span className="w-8 text-right tabular-nums">{m.calls}</span>
            <span className="w-8 text-right tabular-nums">{m.talk}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function PlaylistsMock() {
  const lists = [
    { title: "Northgate: security questions", meta: "3 highlights · updated Sep 12", start: 0 },
    { title: "Onboarding research clips", meta: "2 highlights · updated Sep 9", start: 3 },
    { title: "Launch review decisions", meta: "4 highlights · updated Sep 11", start: 1 },
  ];
  return (
    <Shell tabs={["My Calls", "Team Calls", "Playlists", "Alerts"]} active="Playlists">
      {lists.map((l) => (
        <div key={l.title} className="mb-3 last:mb-0">
          <p className="text-[10px] font-semibold text-zinc-100">{l.title}</p>
          <p className="mb-1.5 text-[8px] text-zinc-500">{l.meta}</p>
          <div className="grid grid-cols-3 gap-2">
            <Thumb i={l.start} />
            <Thumb i={l.start + 1} />
            <Thumb i={l.start + 2} />
          </div>
        </div>
      ))}
    </Shell>
  );
}

export function AlertsMock() {
  const alerts = [
    { rule: "Keyword: “SAML”", hits: "3 calls this week", on: true },
    { rule: "Competitor: Cadence", hits: "2 mentions", on: true },
    { rule: "Topic: pricing objection", hits: "No matches yet", on: false },
    { rule: "Keyword: “renewal”", hits: "1 call this week", on: true },
  ];
  return (
    <Shell tabs={["My Calls", "Team Calls", "Playlists", "Alerts"]} active="Alerts">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Your alerts</p>
      {alerts.map((a) => (
        <div key={a.rule} className="flex items-center gap-2 border-t border-zinc-800 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium text-zinc-100">{a.rule}</p>
            <p className="text-[8px] text-zinc-500">{a.hits}</p>
          </div>
          <span className={`h-3.5 w-7 rounded-full p-0.5 ${a.on ? "bg-violet-500" : "bg-zinc-700"}`}>
            <span className={`block h-2.5 w-2.5 rounded-full bg-white ${a.on ? "ml-3.5" : ""}`} />
          </span>
        </div>
      ))}
    </Shell>
  );
}

const DEALS = [
  ["Northgate Freight - Pilot", "$17.2K", "Evaluation", "Oct 12, 2026"],
  ["Acme Corp - Renewal", "$42.0K", "Negotiation", "Oct 31, 2026"],
  ["Brightside - Team upsell", "$9.6K", "At risk", "Nov 3, 2026"],
  ["Fernwood Studio - 14 seats", "$2.0K", "Closed won", "Sep 30, 2026"],
  ["Harbor & Vale - Business tier", "$28.8K", "Discovery", "Nov 14, 2026"],
  ["Cadence Labs - Evaluation", "$12.5K", "Evaluation", "Nov 20, 2026"],
  ["Lumen partner referral", "$6.0K", "Proposal", "Dec 2, 2026"],
  ["Trackwise switch - 60 seats", "$21.6K", "Discovery", "Dec 9, 2026"],
];

/** Dimmed deal table shown behind the Deals upsell card, like the real page. */
export function DealsBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none select-none opacity-40 blur-[1.5px]">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base font-semibold">Deals</span>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] dark:bg-zinc-800">145</span>
      </div>
      <div className="min-w-[36rem] text-xs">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-zinc-200 pb-2 text-[10px] uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
          <span>Deal</span>
          <span>Amount</span>
          <span>Stage</span>
          <span>Close date</span>
        </div>
        {DEALS.map((row) => (
          <div
            key={row[0]}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-zinc-100 py-3 dark:border-zinc-900"
          >
            {row.map((cell, i) => (
              <span key={i} className="truncate">
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DealsCardMock() {
  return (
    <div
      aria-hidden
      className="mx-auto mt-5 w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-[9px] text-zinc-300"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-semibold text-zinc-100">Northgate Freight - Pilot</span>
        <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-300">$17.2K</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Thumb i={2} label="Discovery call" />
        <Thumb i={0} label="Security review" />
      </div>
      <div className="mt-2 flex gap-3 text-zinc-500">
        <span>Recap</span>
        <span>Key people</span>
        <span className="text-violet-300">Ask Fathom</span>
      </div>
    </div>
  );
}
