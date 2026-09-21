import type { Meeting } from "@/types/meeting";

// Format sample: a normal 5-person call. No chapters, no action item groups,
// one highlight. The large launch-readiness call deliberately uses more of the
// model (chapters, grouped/dated action items, many highlights).
//
// Speaker and assignee fields are attendee ids. Timestamps are seconds.

export const productStandup: Meeting = {
  id: "weekly-product-standup",
  shareToken: "k3vN8xQ2mT7d",
  title: "Weekly product standup",
  date: "2026-09-17T09:30:00Z",
  durationSec: 480,
  platform: "meet",
  poster: { from: "#1e40af", to: "#2563eb" },

  attendees: [
    { id: "priya", name: "Priya Nair", email: "priya@lumenapp.io", role: "Product Manager", avatarColor: "#7c3aed", isHost: true },
    { id: "marcus", name: "Marcus Chen", email: "marcus@lumenapp.io", role: "Engineering Lead", avatarColor: "#0891b2" },
    { id: "sofia", name: "Sofia Alvarez", email: "sofia@lumenapp.io", role: "Product Designer", avatarColor: "#db2777" },
    { id: "tom", name: "Tom Okafor", email: "tom@lumenapp.io", role: "Backend Engineer", avatarColor: "#ea580c" },
    { id: "hannah", name: "Hannah Lee", email: "hannah@lumenapp.io", role: "Customer Support", avatarColor: "#16a34a" },
  ],

  transcript: [
    { id: "t01", speakerId: "priya", start: 0, text: "Okay, let's get started. It's Thursday, so a quick round on where everything stands before we start the beta. Marcus, want to kick us off?" },
    { id: "t02", speakerId: "marcus", start: 14, text: "Sure. Since Tuesday I finished moving the notifications service off the old queue. It's running in staging and I've been replaying about a week of production traffic through it, no dropped messages so far. Today I'm writing the rollback runbook, and after that I'm blocked on one thing, which is the load test environment. Tom, did that get provisioned?" },
    { id: "t03", speakerId: "tom", start: 52, text: "Not yet, sorry. The infra ticket is still sitting in their queue. I pinged them this morning and they said end of day tomorrow." },
    { id: "t04", speakerId: "marcus", start: 68, text: "That's the only thing between us and signing off on the migration, so let's flag it. If it slips to Monday we push the cutover." },
    { id: "t05", speakerId: "priya", start: 84, text: "Noted, I'll escalate the ticket. Tom, go ahead with yours." },
    { id: "t06", speakerId: "tom", start: 96, text: "So I shipped the export API changes, the pagination fix that was causing timeouts for larger workspaces. Two customers reported it, Acme being one of them, and I confirmed with their admin yesterday that exports now complete. Today I'm picking up the SSO ticket. Acme asked for SAML support again on their renewal call, so I want to at least scope it." },
    { id: "t07", speakerId: "priya", start: 148, text: "How big is SAML, do you think? Hannah mentioned Acme's renewal is at the end of October." },
    { id: "t08", speakerId: "tom", start: 160, text: "Honestly, two to three weeks if we use a library instead of rolling our own. I'll have a proper estimate by Monday." },
    { id: "t09", speakerId: "priya", start: 178, text: "Okay, great. Sofia?" },
    { id: "t10", speakerId: "sofia", start: 184, text: "I finished the new onboarding checklist designs and they're in Figma, linked in the channel. I'd like feedback by Friday so I can hand off to Marcus's team on Monday. One open question is whether the checklist should be dismissible. In the research sessions, three of five people said they'd want to hide it once they'd finished the first two steps." },
    { id: "t11", speakerId: "marcus", start: 236, text: "I'd lean toward dismissible. If it isn't, someone's going to ask for a setting to hide it within a week." },
    { id: "t12", speakerId: "priya", start: 248, text: "Agreed. Let's make it dismissible. Sofia, can you add a way to bring it back from the help menu?" },
    { id: "t13", speakerId: "sofia", start: 262, text: "Yes, easy, I'll update it today. I also need someone from support to look at the empty state copy, because I'm not sure the tone is right." },
    { id: "t14", speakerId: "hannah", start: 282, text: "I can do that. Send it over and I'll go through it this afternoon." },
    { id: "t15", speakerId: "priya", start: 292, text: "Thanks. Hannah, your update?" },
    { id: "t16", speakerId: "hannah", start: 298, text: "Two things. Support volume is up about fifteen percent this week, mostly people asking how to invite teammates, which is a good argument for Sofia's checklist. And there's one customer, Brightside, who has told us twice they're evaluating alternatives because of the slow exports. Tom's fix should help, but I'd like to reach out to them personally and let them know it's shipped." },
    { id: "t17", speakerId: "priya", start: 352, text: "Please do. Tom, can you write up a short note Hannah can send them, what changed and what they should see?" },
    { id: "t18", speakerId: "tom", start: 366, text: "Sure, I'll draft it right after standup." },
    { id: "t19", speakerId: "hannah", start: 374, text: "Perfect. The other thing is the beta invite list. We have forty-two requests and I'd like to know if we're sending them all at once or in batches." },
    { id: "t20", speakerId: "priya", start: 394, text: "Batches, definitely. Ten first, and we watch the notifications service like a hawk. That's my update too, actually. I'm finalizing the beta scope doc and I'll share it by end of day. Marcus, I'll need your sign-off on the cutover date in there." },
    { id: "t21", speakerId: "marcus", start: 432, text: "Fine, as long as the load test happens like I said. I'd tentatively say Wednesday the 23rd." },
    { id: "t22", speakerId: "priya", start: 446, text: "Wednesday the 23rd, contingent on the load test. Anything else? Any blockers I haven't heard?" },
    { id: "t23", speakerId: "sofia", start: 458, text: "Not from me." },
    { id: "t24", speakerId: "tom", start: 462, text: "Just the infra ticket." },
    { id: "t25", speakerId: "priya", start: 466, text: "Right, that one's mine. Thanks everyone, talk tomorrow." },
  ],

  highlights: [
    {
      id: "h1",
      timestamp: 298,
      note: "Churn risk: Brightside has said twice they're evaluating alternatives over slow exports. Follow up once the fix is confirmed shipped.",
      createdById: "priya",
    },
  ],

  actionItems: [
    { id: "a1", text: "Escalate the infra ticket for the load test environment", assigneeId: "priya", timestamp: 84, done: false },
    { id: "a2", text: "Write the rollback runbook for the notifications migration", assigneeId: "marcus", timestamp: 14, done: false },
    { id: "a3", text: "Scope SAML SSO and share an estimate by Monday", assigneeId: "tom", timestamp: 160, done: false },
    { id: "a4", text: "Make the onboarding checklist dismissible, with a way to restore it from the help menu", assigneeId: "sofia", timestamp: 262, done: false },
    { id: "a5", text: "Draft a note for Brightside explaining the export fix", assigneeId: "tom", timestamp: 366, done: true },
    { id: "a6", text: "Share the beta scope doc, including the cutover date", assigneeId: "priya", timestamp: 394, done: true },
  ],

  summaries: {
    general: [
      {
        id: "purpose",
        title: "Meeting Purpose",
        kind: "paragraph",
        body: "Weekly product standup to check progress ahead of the beta launch, unblock the notifications migration, and align on the onboarding checklist and customer follow-ups.",
      },
      {
        id: "takeaways",
        title: "Key Takeaways",
        kind: "bullets",
        items: [
          "The notifications service migration is clean in staging (a week of replayed production traffic, no dropped messages), but sign-off is blocked on the load test environment, expected end of day Friday.",
          "The export pagination fix has shipped and Acme's admin confirmed exports now complete.",
          "The onboarding checklist will be dismissible, with a way to bring it back from the help menu.",
          "Beta invites go out in batches of ten. Cutover is tentatively Wednesday, September 23, contingent on the load test.",
        ],
      },
      {
        id: "topics",
        title: "Topics",
        kind: "topics",
        topics: [
          { title: "Notifications migration and load test blocker", summary: "Migration is stable in staging; the load test environment is the only remaining dependency for sign-off.", timestamp: 14 },
          { title: "Export fix and Acme's SAML request", summary: "Pagination fix shipped. Acme asked for SAML again ahead of an end-of-October renewal; estimate of two to three weeks using a library.", timestamp: 96 },
          { title: "Onboarding checklist decisions", summary: "Designs are in Figma. Decided to make the checklist dismissible and add a restore option to the help menu.", timestamp: 184 },
          { title: "Support volume and Brightside churn risk", summary: "Support volume is up 15%, mostly invite questions. Brightside is evaluating alternatives over slow exports.", timestamp: 298 },
          { title: "Beta rollout plan", summary: "42 invite requests, sent in batches of ten. Scope doc due today; cutover date pending Marcus's sign-off.", timestamp: 374 },
        ],
      },
      {
        id: "next-steps",
        title: "Next Steps",
        kind: "bullets",
        items: [
          "Priya escalates the infra ticket and shares the beta scope doc by end of day.",
          "Marcus writes the rollback runbook and confirms the cutover date once the load test runs.",
          "Tom scopes SAML SSO (estimate Monday) and drafts the Brightside note.",
          "Sofia updates the checklist design, collects feedback by Friday and hands off Monday.",
          "Hannah reviews the empty state copy and reaches out to Brightside.",
        ],
      },
    ],

    sales: [
      {
        id: "signals",
        title: "Customer & Revenue Signals",
        kind: "bullets",
        items: [
          "Acme asked for SAML SSO on their renewal call, which is due end of October.",
          "Acme's admin confirmed the export fix works.",
          "Support volume is up about 15% this week, mostly questions about inviting teammates.",
          "42 people are waiting on beta invites.",
        ],
      },
      {
        id: "risks",
        title: "Deal Risks",
        kind: "bullets",
        items: [
          "Brightside has said twice they are evaluating alternatives because of slow exports.",
          "Acme's renewal could be affected if SAML slips past its scoped two to three weeks.",
        ],
      },
      {
        id: "requests",
        title: "Customer Requests",
        kind: "bullets",
        items: [
          "SAML SSO (Acme).",
          "Faster, more reliable exports (Acme, Brightside).",
          "An easier way to invite teammates (support trend).",
        ],
      },
      {
        id: "follow-ups",
        title: "Recommended Follow-ups",
        kind: "bullets",
        items: [
          "Hannah reaches out to Brightside personally once Tom's note on the export fix is ready.",
          "Tom shares a SAML estimate by Monday so Priya can give Acme a date before renewal.",
          "Send beta invites in batches of ten, starting after the cutover.",
        ],
      },
    ],

    standup: [
      {
        id: "done",
        title: "Done",
        kind: "byPerson",
        entries: [
          { attendeeId: "priya", items: ["Drafted the beta scope doc and invite plan."] },
          { attendeeId: "marcus", items: ["Moved the notifications service off the old queue into staging.", "Replayed about a week of production traffic with no dropped messages."] },
          { attendeeId: "tom", items: ["Shipped the export pagination fix.", "Confirmed with Acme's admin that exports now complete."] },
          { attendeeId: "sofia", items: ["Finished the onboarding checklist designs in Figma."] },
          { attendeeId: "hannah", items: ["Tracked support trends: volume up 15%, mostly invite questions.", "Flagged Brightside as a churn risk."] },
        ],
      },
      {
        id: "next",
        title: "Doing Next",
        kind: "byPerson",
        entries: [
          { attendeeId: "priya", items: ["Escalate the infra ticket.", "Share the beta scope doc by end of day."] },
          { attendeeId: "marcus", items: ["Write the rollback runbook.", "Sign off on the cutover date after the load test."] },
          { attendeeId: "tom", items: ["Scope SAML SSO, estimate by Monday.", "Draft the Brightside note."] },
          { attendeeId: "sofia", items: ["Make the checklist dismissible with a help menu restore.", "Get feedback by Friday, hand off Monday."] },
          { attendeeId: "hannah", items: ["Review the empty state copy this afternoon.", "Reach out to Brightside."] },
        ],
      },
      {
        id: "blockers",
        title: "Blockers",
        kind: "bullets",
        items: [
          "Load test environment is not provisioned; the infra ticket is due end of day Friday (owner: Priya to escalate).",
          "If the environment slips to Monday, the beta cutover moves.",
        ],
      },
    ],
  },
};
