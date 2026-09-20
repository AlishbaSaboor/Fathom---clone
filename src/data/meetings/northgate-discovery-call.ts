import type { Meeting } from "@/types/meeting";

// Normal 3-person call. Sales-shaped: the Sales template fits naturally here,
// while the Standup template is honest about this not being a status meeting
// (see the summaries at the bottom).

export const northgateDiscoveryCall: Meeting = {
  id: "northgate-discovery-call",
  shareToken: "Qw4rZ9pL2xHb",
  title: "Northgate Freight: discovery call",
  date: "2026-09-10T15:00:00Z",
  durationSec: 1920,
  platform: "zoom",
  poster: { from: "#0f766e", to: "#0369a1" },

  attendees: [
    { id: "dana", name: "Dana Whitfield", email: "dana@lumenapp.io", role: "Account Executive, Lumen", avatarColor: "#0d9488", isHost: true },
    { id: "rafael", name: "Rafael Moreno", email: "rafael.moreno@northgatefreight.com", role: "VP Operations, Northgate Freight", avatarColor: "#d97706" },
    { id: "keiko", name: "Keiko Tanaka", email: "keiko.tanaka@northgatefreight.com", role: "IT Manager, Northgate Freight", avatarColor: "#9333ea" },
  ],

  transcript: [
    { id: "d01", speakerId: "dana", start: 0, text: "Thanks both for making time. The plan for today is to understand how your ops team handles shipment exceptions right now, what a good outcome would look like, and then talk timeline. I'll hold the demo for a second call. Does that work?" },
    { id: "d02", speakerId: "rafael", start: 34, text: "That works. Some quick context: we run about four hundred trucks across the Midwest, and the ops team is eighteen dispatchers plus a couple of managers." },
    { id: "d03", speakerId: "dana", start: 62, text: "Great. So when a shipment is delayed or damaged, how do you find out, and who acts on it?" },
    { id: "d04", speakerId: "rafael", start: 80, text: "Honestly, spreadsheets and phone calls. A driver texts the dispatcher, the dispatcher updates a shared sheet, and every Monday my team reconciles everything to work out what was late and why. That takes about six hours. And by the time we've done it, the customer has usually already called us." },
    { id: "d05", speakerId: "dana", start: 140, text: "Six hours every Monday. And what does it cost you when a delay doesn't get caught in time?" },
    { id: "d06", speakerId: "rafael", start: 165, text: "A couple of our contracts have on-time clauses. Last year we paid around forty thousand dollars in penalties we could have avoided if we'd known sooner. That's the number my CFO cares about." },
    { id: "d07", speakerId: "dana", start: 215, text: "That's a clear cost, thank you. Keiko, from the IT side, how are those sheets shared today?" },
    { id: "d08", speakerId: "keiko", start: 232, text: "Google Sheets and email. There's no audit trail and people share links outside the company, which makes IT uncomfortable. Anything new that touches customer data has to go through a security review, and we're on Okta, so single sign-on is required." },
    { id: "d09", speakerId: "dana", start: 292, text: "Okay, so SAML with Okta is a must-have. Today we support Google sign-in. SAML is on our roadmap and we're scoping it now, but I don't want to guess at a date. I'll get you a firm answer from engineering." },
    { id: "d10", speakerId: "keiko", start: 335, text: "Please do, that's a hard requirement. We'd also need your SOC 2 report." },
    { id: "d11", speakerId: "dana", start: 355, text: "We have a Type I report, and Type II is in its observation window that finishes in December. I'll send the Type I today along with our security questionnaire answers." },
    { id: "d12", speakerId: "keiko", start: 395, text: "That's fine for a pilot. Procurement may push for the Type II before a full rollout, but we can cross that bridge later." },
    { id: "d13", speakerId: "rafael", start: 420, text: "One more thing on context. We've looked at two other tools in the last couple of months, Trackwise and Cadence. Trackwise is much heavier than we want. Cadence has decent alerts but no shared timeline." },
    { id: "d14", speakerId: "dana", start: 470, text: "What did you like about the Cadence alerts?" },
    { id: "d15", speakerId: "rafael", start: 488, text: "They push a notification when a shipment status changes, which is good, but it's noisy. Every scan triggers something. What we want is to be told only about exceptions, the late ones, the damaged ones, not every time a pallet moves." },
    { id: "d16", speakerId: "dana", start: 540, text: "That's the core of how our notifications work. They're rule-based, so you define what counts as an exception and only those fire. We're also rebuilding the delivery service underneath for reliability, so I'll make sure that's part of the demo." },
    { id: "d17", speakerId: "keiko", start: 585, text: "How do the notifications reach people? Email only? Our dispatchers live in their chat tool all day." },
    { id: "d18", speakerId: "dana", start: 605, text: "Email and Slack today. What chat tool are you on?" },
    { id: "d19", speakerId: "keiko", start: 640, text: "Teams. Slack is only used by our sales group." },
    { id: "d20", speakerId: "dana", start: 660, text: "Good to know. Teams isn't supported yet, so I'll note that as a gap and check with our product team what's planned rather than promise anything." },
    { id: "d21", speakerId: "rafael", start: 700, text: "It wouldn't be a deal-breaker for a pilot. The dispatchers check email constantly anyway." },
    { id: "d22", speakerId: "dana", start: 735, text: "Let's talk success. If the pilot works, what does good look like to you?" },
    { id: "d23", speakerId: "rafael", start: 755, text: "Three things. The Monday reconciliation goes from six hours to under one. We catch at least ninety percent of delays before the customer calls us. And the dispatchers actually use it, because if they go back to the spreadsheet it's worthless." },
    { id: "d24", speakerId: "dana", start: 815, text: "How many people would be using it?" },
    { id: "d25", speakerId: "rafael", start: 830, text: "The pilot would be the Midwest region only, twenty seats. That's eighteen dispatchers and two managers. A full rollout across regions would be around sixty." },
    { id: "d26", speakerId: "dana", start: 870, text: "Is there a budget range you're working within?" },
    { id: "d27", speakerId: "rafael", start: 892, text: "We've set aside thirty to thirty-five thousand a year for a tool like this. I'd go higher if it clearly saves us penalties." },
    { id: "d28", speakerId: "dana", start: 940, text: "Understood. Who else is involved in the decision?" },
    { id: "d29", speakerId: "rafael", start: 955, text: "Me, Keiko for security, and our CFO, Grace, has final sign-off. She'll want the ROI, which is the penalties number. We want a decision by the end of Q4, with the pilot starting in October if security clears." },
    { id: "d30", speakerId: "keiko", start: 1030, text: "The security review takes about three weeks once I have all the documents." },
    { id: "d31", speakerId: "dana", start: 1080, text: "So if I get you documents this week, you're done around the first of October, and a pilot could start mid-October." },
    { id: "d32", speakerId: "rafael", start: 1120, text: "Ideally, yes. Mid-October works." },
    { id: "d33", speakerId: "dana", start: 1140, text: "Let me recap next steps. I'll send the SOC 2 Type I report and questionnaire answers today. I'll get you a proposal for the twenty-seat pilot and the sixty-seat rollout by next Thursday, the seventeenth, and confirm SAML timing with engineering. Keiko, could you send a sample of the exception sheet and your Okta details? And Rafael, if you could line up two dispatchers for a demo next week, that would be great." },
    { id: "d34", speakerId: "rafael", start: 1215, text: "Sounds right. I'll find two people who'll be honest with us." },
    { id: "d35", speakerId: "keiko", start: 1235, text: "I'll send a sanitized export of the exception sheet tomorrow, and the Okta tenant details after that." },
    { id: "d36", speakerId: "dana", start: 1265, text: "Perfect. Any questions for me before we wrap up?" },
    { id: "d37", speakerId: "rafael", start: 1280, text: "Roughly what does pricing look like, so I'm not surprised by the proposal?" },
    { id: "d38", speakerId: "dana", start: 1302, text: "The Team plan is twelve dollars per seat per month. Single sign-on would sit in a higher tier we're finalizing, so I'll put both options in the proposal and you can compare." },
    { id: "d39", speakerId: "rafael", start: 1358, text: "Fine. Sixty seats on the higher tier is well inside our range, so I don't see an issue as long as security clears." },
    { id: "d40", speakerId: "dana", start: 1400, text: "Great. Thanks, both. I'll talk to you again next week for the demo." },
  ],

  highlights: [
    {
      id: "h1",
      timestamp: 165,
      note: "The business case: about six hours of manual reconciliation every Monday and roughly $40k in avoidable on-time penalties last year. This is the number the CFO will care about.",
      createdById: "dana",
    },
  ],

  actionItems: [
    { id: "a1", text: "Send the SOC 2 Type I report and security questionnaire answers", assigneeId: "dana", timestamp: 355, done: true },
    { id: "a2", text: "Get a firm SAML / Okta date from engineering", assigneeId: "dana", timestamp: 292, done: false },
    { id: "a3", text: "Check with product on Teams notification support", assigneeId: "dana", timestamp: 660, done: false },
    { id: "a4", text: "Send pricing proposal for the 20-seat pilot and 60-seat rollout by Sept 17", assigneeId: "dana", timestamp: 1140, done: true },
    { id: "a5", text: "Line up two dispatchers for a demo next week", assigneeId: "rafael", timestamp: 1140, done: false },
    { id: "a6", text: "Send a sanitized export of the exception sheet and Okta tenant details", assigneeId: "keiko", timestamp: 1235, done: true },
  ],

  summaries: {
    general: [
      {
        id: "purpose",
        title: "Meeting Purpose",
        kind: "paragraph",
        body: "First discovery call with Northgate Freight to understand how their operations team handles shipment exceptions today, what success looks like for a pilot, and whether Lumen fits their security requirements and timeline.",
      },
      {
        id: "takeaways",
        title: "Key Takeaways",
        kind: "bullets",
        items: [
          "Northgate reconciles shipment exceptions by hand in shared spreadsheets, about six hours every Monday, and paid roughly $40k in avoidable on-time penalties last year.",
          "Single sign-on through Okta (SAML) is a hard requirement. Lumen does not support SAML yet; Dana will get a firm date from engineering.",
          "They want alerts for exceptions only, not every status change. Their current alternative, Cadence, is too noisy.",
          "Their dispatchers use Teams, which Lumen does not support. Email is acceptable for a pilot.",
          "Proposed pilot: 20 seats in the Midwest region starting mid-October, growing to about 60 seats. Budget is $30k to $35k a year, with the CFO signing off by end of Q4.",
        ],
      },
      {
        id: "topics",
        title: "Topics",
        kind: "topics",
        topics: [
          { title: "Current exception-handling process", summary: "Spreadsheets and phone calls, with a six-hour weekly reconciliation and about $40k in avoidable penalties.", timestamp: 80 },
          { title: "Security and SSO requirements", summary: "Okta SAML is required, along with a SOC 2 report. Lumen has Type I now, Type II finishing in December.", timestamp: 232 },
          { title: "Competitor evaluation", summary: "Trackwise judged too heavy; Cadence has decent alerts but is noisy and lacks a shared timeline.", timestamp: 420 },
          { title: "Notifications and channels", summary: "Rule-based exception alerts fit their need. Teams support is a gap; email is enough for a pilot.", timestamp: 540 },
          { title: "Success criteria and scope", summary: "Reconciliation under one hour, 90% of delays caught before customers call, real adoption. 20-seat pilot, about 60 at full rollout.", timestamp: 735 },
          { title: "Budget, decision process and timeline", summary: "$30k to $35k budget. Rafael, Keiko and the CFO decide. Security review takes about three weeks; pilot could start mid-October.", timestamp: 870 },
        ],
      },
      {
        id: "next-steps",
        title: "Next Steps",
        kind: "bullets",
        items: [
          "Dana sends the SOC 2 Type I report and questionnaire answers, then a pricing proposal for the pilot and full rollout by September 17.",
          "Dana gets a firm SAML/Okta date from engineering and checks the Teams roadmap.",
          "Keiko sends a sanitized exception sheet and Okta tenant details.",
          "Rafael lines up two dispatchers for a demo next week.",
        ],
      },
    ],

    sales: [
      {
        id: "signals",
        title: "Customer & Revenue Signals",
        kind: "bullets",
        items: [
          "Quantified pain: about 6 hours of manual reconciliation every Monday and roughly $40k in avoidable penalties last year.",
          "Budget of $30k to $35k a year, with room to go higher if it demonstrably saves penalties.",
          "Pilot of 20 seats in one region, growing to about 60 seats. Rafael said 60 seats on the higher SSO tier is well inside their range.",
          "Decision by end of Q4; pilot targeted for mid-October if security clears.",
          "Buying group: Rafael (sponsor), Keiko (security), Grace, the CFO (final sign-off).",
        ],
      },
      {
        id: "risks",
        title: "Deal Risks",
        kind: "bullets",
        items: [
          "Okta SAML is a hard requirement and Lumen does not support it yet. No date has been committed.",
          "The security review takes about three weeks, so any slip in documents pushes the pilot past mid-October.",
          "Procurement may ask for the SOC 2 Type II before a full rollout; it is not due until December.",
          "Cadence is already in their evaluation and has working alerts; Trackwise was ruled out as too heavy.",
        ],
      },
      {
        id: "requests",
        title: "Customer Requests",
        kind: "bullets",
        items: [
          "SAML single sign-on with Okta (required).",
          "Alerts only for exceptions, not every status change.",
          "Microsoft Teams notifications (nice to have; email is fine for the pilot).",
          "A shared timeline view, which they say Cadence lacks.",
        ],
      },
      {
        id: "follow-ups",
        title: "Recommended Follow-ups",
        kind: "bullets",
        items: [
          "Send the SOC 2 Type I report and questionnaire answers now to start the three-week security clock.",
          "Confirm SAML timing with engineering before the proposal goes out, and avoid committing to a date until then.",
          "Send the pilot and rollout proposal by September 17, with and without the SSO tier.",
          "Run the demo with two dispatchers next week, focused on exception-only alerts.",
        ],
      },
    ],

    // This was a discovery call, not a status meeting. The sections keep the
    // Standup structure but only report what was actually said.
    standup: [
      {
        id: "done",
        title: "Done",
        kind: "byPerson",
        entries: [
          { attendeeId: "dana", items: ["Completed discovery: process, security needs, success criteria, budget and decision makers."] },
          { attendeeId: "rafael", items: ["Reviewed two competing tools (Trackwise, Cadence) over the last two months."] },
          { attendeeId: "keiko", items: ["No progress update given; described current tooling and security requirements."] },
        ],
      },
      {
        id: "next",
        title: "Doing Next",
        kind: "byPerson",
        entries: [
          { attendeeId: "dana", items: ["Send the SOC 2 Type I report and questionnaire answers.", "Get a firm SAML date and check Teams plans.", "Send the pricing proposal by September 17."] },
          { attendeeId: "rafael", items: ["Line up two dispatchers for a demo next week."] },
          { attendeeId: "keiko", items: ["Send a sanitized exception sheet and Okta details."] },
        ],
      },
      {
        id: "blockers",
        title: "Blockers",
        kind: "bullets",
        items: [
          "No blockers were raised as such. Open dependency: SAML support has no committed date and is a hard requirement for Northgate's security review.",
        ],
      },
    ],
  },
};
