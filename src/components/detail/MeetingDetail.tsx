"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DEFAULT_TEMPLATE } from "@/data/templates";
import { transcriptToText } from "@/lib/export";
import { segmentIdAt } from "@/lib/transcript";
import type { Meeting, TemplateId } from "@/types/meeting";
import { AskFathomTab } from "./AskFathomTab";
import { MediaPlayer, type PlayerHandle } from "./MediaPlayer";
import { MeetingSidebar } from "./MeetingSidebar";
import { SummaryTab } from "./summary/SummaryTab";
import { TranscriptTab } from "./transcript/TranscriptTab";
import { VideoPlaceholder } from "./VideoPlaceholder";

export type TabId = "summary" | "transcript" | "ask";
/**
 * Real playback for an uploaded recording. `unavailable` means the file was not
 * kept in this browser (its storage was blocked when it was saved), so only the
 * transcript and summary can be shown.
 */
export type MediaSource = { kind: "audio" | "video"; url: string } | { kind: "unavailable" };
export interface JumpRequest {
  time: number;
  /** Changes on every request so jumping to the same time twice still scrolls. */
  nonce: number;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "transcript", label: "Transcript" },
  { id: "ask", label: "Ask Fathom" },
];
const isTab = (v: string | null): v is TabId => TABS.some((t) => t.id === v);

/**
 * The meeting detail layout: video and tabs on the left, action items and
 * annotations in a right sidebar. Shared by the signed-in page and the public
 * share page; `readOnly` removes every edit control for the latter.
 *
 * Client state only (no persistence): the active tab, selected summary
 * template, and action item checkboxes reset on reload. That is intentional
 * for this build, which has no database.
 */
export function MeetingDetail({
  meeting,
  readOnly = false,
  media,
  onDelete,
}: {
  meeting: Meeting;
  readOnly?: boolean;
  /** Set for uploaded recordings, which have a real player. Seeded meetings keep the stubbed one. */
  media?: MediaSource;
  /** Set for uploaded recordings: lets the owner remove it from this browser. */
  onDelete?: () => void;
}) {
  const [tab, setTab] = useState<TabId>("summary");
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [jump, setJump] = useState<JumpRequest | null>(null);
  const player = useRef<PlayerHandle>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>();
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(meeting.actionItems.map((a) => [a.id, a.done])),
  );

  // Deep links like ?tab=transcript. Read after mount rather than during render
  // so the statically prerendered HTML and first client render always match, and
  // without useSearchParams, which would force a Suspense boundary.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL sync after hydration
    if (isTab(requested)) setTab(requested);
  }, []);

  function changeTab(next: TabId) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "summary") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  function jumpTo(time: number) {
    setJump({ time, nonce: Date.now() });
    changeTab("transcript");
    player.current?.seek(time); // no-op for seeded meetings (no real player)
  }

  // Uploaded recordings have a real player; clicking a transcript timestamp plays from that moment.
  const hasPlayer = !!media && media.kind !== "unavailable";
  function playFrom(t: number) {
    player.current?.seek(t, true);
  }

  // Only re-render when playback moves into a different transcript segment.
  function onPlaybackTime(t: number) {
    const id = segmentIdAt(meeting.transcript, t);
    setActiveSegmentId((prev) => (prev === id ? prev : id));
  }

  function onTabKeyDown(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    changeTab(TABS[next].id);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  }

  return (
    <div className="grid gap-6 [grid-template-areas:'video'_'head'_'tabs'_'side'] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'video_side'_'tabs_side']">
      <div className="[grid-area:video]">
        {media && media.kind !== "unavailable" ? (
          <MediaPlayer ref={player} url={media.url} kind={media.kind} poster={meeting.poster} onTime={onPlaybackTime} />
        ) : (
          <VideoPlaceholder
            meeting={meeting}
            note={
              media?.kind === "unavailable"
                ? "The original recording isn't stored in this browser, so it can't be played. The transcript and summary are unaffected."
                : undefined
            }
          />
        )}
      </div>

      <aside className="max-lg:contents lg:self-start lg:[grid-area:side] lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
        <MeetingSidebar
          meeting={meeting}
          done={done}
          onToggle={(id) => setDone((prev) => ({ ...prev, [id]: !prev[id] }))}
          onJump={jumpTo}
          readOnly={readOnly}
          onDelete={onDelete}
        />
      </aside>

      <div className="min-w-0 [grid-area:tabs]">
        <div className="mb-5 flex flex-wrap items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div role="tablist" aria-label="Meeting sections" onKeyDown={onTabKeyDown} className="flex gap-1">
            {TABS.map((t) => {
              const selected = tab === t.id;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => changeTab(t.id)}
                  className={`-mb-px whitespace-nowrap border-b-2 px-2.5 py-2.5 text-xs sm:px-3 font-semibold uppercase tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-600 ${
                    selected
                      ? "border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-300"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {tab === "transcript" && (
            <CopyButton
              label="Copy Transcript"
              shortLabel="Copy"
              getText={() => transcriptToText(meeting)}
              className="mb-1.5 shrink-0"
            />
          )}
        </div>

        {/* Panels stay mounted and are only hidden, so the transcript search
            text and scroll position survive switching tabs. */}
        <div role="tabpanel" id="panel-summary" aria-labelledby="tab-summary" hidden={tab !== "summary"}>
          <SummaryTab meeting={meeting} template={template} onTemplateChange={setTemplate} onJump={jumpTo} />
        </div>
        <div role="tabpanel" id="panel-transcript" aria-labelledby="tab-transcript" hidden={tab !== "transcript"}>
          <TranscriptTab
            meeting={meeting}
            jump={jump}
            readOnly={readOnly}
            activeSegmentId={hasPlayer ? activeSegmentId : undefined}
            onSeek={hasPlayer ? playFrom : undefined}
          />
        </div>
        <div role="tabpanel" id="panel-ask" aria-labelledby="tab-ask" hidden={tab !== "ask"}>
          <AskFathomTab meeting={meeting} onJump={jumpTo} />
        </div>
      </div>
    </div>
  );
}
