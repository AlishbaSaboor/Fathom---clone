import type { Meeting } from "@/types/meeting";

// Normal 2-person call. Deliberately a poor fit for the Sales and Standup
// templates: those summaries say plainly when nothing relevant surfaced
// rather than inventing content to fill the section.

export const onboardingResearchInterview: Meeting = {
  id: "onboarding-research-interview",
  shareToken: "Hy7sB3nVd5Lc",
  title: "Onboarding research: Daniel Osei",
  date: "2026-09-08T18:00:00Z",
  durationSec: 1500,
  platform: "zoom",
  poster: { from: "#be185d", to: "#9d174d" },

  attendees: [
    { id: "sofia", name: "Sofia Alvarez", email: "sofia@lumenapp.io", role: "Product Designer, Lumen", avatarColor: "#db2777", isHost: true },
    { id: "daniel", name: "Daniel Osei", email: "daniel@fernwoodstudio.co", role: "Operations Manager, Fernwood Studio", avatarColor: "#2563eb" },
  ],

  transcript: [
    { id: "r01", speakerId: "sofia", start: 0, text: "Thanks for joining, Daniel. Just so you know, we're testing the product, not you, so there are no wrong answers. Is it okay if I record this, and could you think out loud as we go?" },
    { id: "r02", speakerId: "daniel", start: 28, text: "Sure, no problem." },
    { id: "r03", speakerId: "sofia", start: 38, text: "To start, tell me about your role and what you use Lumen for." },
    { id: "r04", speakerId: "daniel", start: 52, text: "I'm the operations manager at Fernwood Studio. We're a fourteen-person design agency. We use Lumen to keep client project updates and the team's weekly status in one place. We've been on it about three months." },
    { id: "r05", speakerId: "sofia", start: 100, text: "Take me back to your very first day. What do you remember?" },
    { id: "r06", speakerId: "daniel", start: 118, text: "Honestly, a bit of a blank. I signed up, landed on an empty workspace and just stared at it. I remember thinking, okay, where do I even start?" },
    { id: "r07", speakerId: "sofia", start: 165, text: "And what did you do next?" },
    { id: "r08", speakerId: "daniel", start: 180, text: "I clicked around for a bit and then found the checklist on the side, which helped. The first two steps were create a project and add a status. I did those in maybe five minutes." },
    { id: "r09", speakerId: "sofia", start: 235, text: "How about the steps after that?" },
    { id: "r10", speakerId: "daniel", start: 250, text: "The third one was invite your teammates, and that's where I got stuck. I typed in emails, it said invites sent, but two people never got them. It turned out they'd gone to spam. I didn't know that, so I sent them again and then they got duplicates." },
    { id: "r11", speakerId: "sofia", start: 320, text: "That sounds frustrating." },
    { id: "r12", speakerId: "daniel", start: 335, text: "It was. In the end I found an invite link buried in settings and pasted it into our team chat, and that worked. That should be the first thing you see." },
    { id: "r13", speakerId: "sofia", start: 395, text: "If inviting by link was front and center, how would that feel?" },
    { id: "r14", speakerId: "daniel", start: 412, text: "Perfect. Honestly we'd never type emails again." },
    { id: "r15", speakerId: "sofia", start: 440, text: "Great. I'm going to share my screen with the new checklist prototype. Take a moment and tell me what you notice." },
    { id: "r16", speakerId: "daniel", start: 480, text: "I like that invite is at the top now. But I'd want to hide the checklist once I've done the first two steps. After that it's just in the way, I don't need it sitting there while I work." },
    { id: "r17", speakerId: "sofia", start: 545, text: "Would you want to be able to bring it back if you needed it?" },
    { id: "r18", speakerId: "daniel", start: 560, text: "Somewhere in the help menu, sure. I wouldn't go looking for it on the dashboard again." },
    { id: "r19", speakerId: "sofia", start: 600, text: "Okay. Now let's look at an empty state. This is the projects page before anything's been created." },
    { id: "r20", speakerId: "daniel", start: 640, text: "That one's fine, it's clear. Though I'll say, on the updates page there was a line, something like your board is feeling lonely, that I found a little patronizing. I'm running a business, not a pet shelter." },
    { id: "r21", speakerId: "sofia", start: 700, text: "That's really useful. Which page was that?" },
    { id: "r22", speakerId: "daniel", start: 718, text: "The updates page. I'll send you a screenshot." },
    { id: "r23", speakerId: "sofia", start: 760, text: "Thank you. Did you ever want to start from a template rather than a blank project?" },
    { id: "r24", speakerId: "daniel", start: 780, text: "Yes, absolutely. We run the same structure for every client: kickoff, design, review, handoff. If I could have started from a template I'd have been set up in minutes instead of an hour." },
    { id: "r25", speakerId: "sofia", start: 850, text: "So how long did setup take you in the end?" },
    { id: "r26", speakerId: "daniel", start: 868, text: "About an hour, including all the mess with the invites." },
    { id: "r27", speakerId: "sofia", start: 920, text: "Let's talk about notifications. Do you get them, and do they work for you?" },
    { id: "r28", speakerId: "daniel", start: 940, text: "The weekly digest is good, I read it every Monday. The real-time ones are hit and miss. Sometimes I get the same notification twice, and once it showed up a full day late." },
    { id: "r29", speakerId: "sofia", start: 1010, text: "That's helpful, and I'll pass it on to our engineers, who are actually working on that area right now." },
    { id: "r30", speakerId: "sofia", start: 1050, text: "Would you recommend Lumen to another agency?" },
    { id: "r31", speakerId: "daniel", start: 1068, text: "Yes, actually I already did, to a friend who runs a studio. I told her to expect a slow first day, but that it's worth it." },
    { id: "r32", speakerId: "sofia", start: 1130, text: "Last question. If you could change one thing about getting started, what would it be?" },
    { id: "r33", speakerId: "daniel", start: 1150, text: "Make the first ten minutes obvious. That's it. Once I was over that hump I had no complaints." },
    { id: "r34", speakerId: "sofia", start: 1200, text: "That's a great place to end. Thank you so much. I'll send you the updated prototype when it's ready, and I'd love your reaction to it." },
    { id: "r35", speakerId: "daniel", start: 1240, text: "Happy to. Good luck with it." },
  ],

  highlights: [
    {
      id: "h1",
      timestamp: 480,
      note: "Wants to hide the checklist after the first two steps, then restore it from the help menu. Supports making it dismissible.",
      createdById: "sofia",
    },
  ],

  actionItems: [
    { id: "a1", text: "Send Daniel the updated checklist prototype when it is ready", assigneeId: "sofia", timestamp: 1200, done: false },
    { id: "a2", text: "Send a screenshot of the updates page empty state that felt patronizing", assigneeId: "daniel", timestamp: 718, done: true },
    { id: "a3", text: "Pass the duplicate and late notification reports to engineering", assigneeId: "sofia", timestamp: 1010, done: false },
  ],

  summaries: {
    general: [
      {
        id: "purpose",
        title: "Meeting Purpose",
        kind: "paragraph",
        body: "User research interview with an existing customer about his first-week experience with Lumen, plus a first reaction to the redesigned onboarding checklist prototype.",
      },
      {
        id: "takeaways",
        title: "Key Takeaways",
        kind: "bullets",
        items: [
          "Daniel landed on an empty workspace with no clear starting point. The checklist helped, and he finished the first two steps in about five minutes.",
          "Inviting teammates was the pain point. Emailed invites went to spam, he re-sent them and people received duplicates. He solved it with an invite link he found buried in settings.",
          "He wants the checklist to be hideable after the first two steps, with a way to restore it from the help menu.",
          "One empty state on the updates page read as patronizing. A starter template for repeat project structures would have cut his hour-long setup to minutes.",
          "Real-time notifications sometimes arrive twice or a day late; the weekly digest works well.",
        ],
      },
      {
        id: "topics",
        title: "Topics",
        kind: "topics",
        topics: [
          { title: "First-day experience", summary: "An empty workspace with no obvious starting point; the checklist steps one and two went smoothly.", timestamp: 100 },
          { title: "Inviting teammates", summary: "Email invites went to spam and were re-sent as duplicates; an invite link in settings finally worked.", timestamp: 250 },
          { title: "Checklist prototype feedback", summary: "Likes invite at the top; wants to dismiss the checklist after two steps and restore it from help.", timestamp: 440 },
          { title: "Empty states and templates", summary: "One empty state copy line felt patronizing. Wants starter project templates.", timestamp: 600 },
          { title: "Notifications", summary: "Digest is useful; real-time alerts are sometimes duplicated or late.", timestamp: 920 },
          { title: "Overall impression", summary: "Would recommend Lumen and already has, with a warning about a slow first day.", timestamp: 1050 },
        ],
      },
      {
        id: "next-steps",
        title: "Next Steps",
        kind: "bullets",
        items: [
          "Sofia sends Daniel the updated prototype for another look.",
          "Daniel sends a screenshot of the updates page empty state.",
          "Sofia passes the duplicate and late notification reports to engineering.",
        ],
      },
    ],

    // Not a sales conversation. Sections say so plainly instead of inventing signals.
    sales: [
      {
        id: "signals",
        title: "Customer & Revenue Signals",
        kind: "bullets",
        items: [
          "No pricing, renewal or expansion signals surfaced in this conversation.",
          "One soft positive: Daniel has already recommended Lumen to a friend who runs a studio.",
        ],
      },
      {
        id: "risks",
        title: "Deal Risks",
        kind: "bullets",
        items: [
          "No deal or churn risks surfaced. The friction Daniel described was in the first week, and he said he had no complaints after that.",
        ],
      },
      {
        id: "requests",
        title: "Customer Requests",
        kind: "bullets",
        items: [
          "Invite by link as the first onboarding step.",
          "A dismissible checklist that can be restored from the help menu.",
          "Starter project templates for repeat client structures.",
          "Reliable, non-duplicated real-time notifications.",
        ],
      },
      {
        id: "follow-ups",
        title: "Recommended Follow-ups",
        kind: "bullets",
        items: [
          "No sales follow-up needed. Sofia will send the updated prototype for feedback.",
        ],
      },
    ],

    // Not a status meeting: this is a two-person research interview.
    standup: [
      {
        id: "done",
        title: "Done",
        kind: "byPerson",
        entries: [
          { attendeeId: "sofia", items: ["Walked Daniel through the checklist prototype and empty states."] },
          { attendeeId: "daniel", items: ["Described his first week, including the invite problem.", "Recommended Lumen to a friend who runs a studio."] },
        ],
      },
      {
        id: "next",
        title: "Doing Next",
        kind: "byPerson",
        entries: [
          { attendeeId: "sofia", items: ["Send the updated prototype to Daniel.", "Pass the notification issues to engineering."] },
          { attendeeId: "daniel", items: ["Send a screenshot of the updates page empty state."] },
        ],
      },
      {
        id: "blockers",
        title: "Blockers",
        kind: "bullets",
        items: [
          "No blockers were raised. This was a research interview, not a status meeting.",
        ],
      },
    ],
  },
};
