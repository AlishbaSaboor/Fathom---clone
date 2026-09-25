"use client";

import { useEffect, useRef, useState } from "react";
import { AskFathomButton } from "@/components/AskFathomButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToast } from "@/components/ui/Toast";
import { summaryToText, transcriptToText } from "@/lib/export";
import { segmentIdAt } from "@/lib/transcript";
import type { Meeting } from "@/types/meeting";
import { ActionItemActions } from "./ActionItemActions";
import { ActionItemList } from "./ActionItemList";
import { AskFathomPanel } from "./AskFathomPanel";
import { JumpNav } from "./JumpNav";
import { MediaPlayer, type PlayerHandle } from "./MediaPlayer";
import { MeetingInfoHeader } from "./MeetingInfoHeader";
import { SectionRenderer } from "./summary/SectionRenderer";
import { TranscriptTab } from "./transcript/TranscriptTab";

export interface JumpRequest {
  time: number;
  /** Changes on every request so jumping to the same time twice still scrolls. */
  nonce: number;
}

// The Ask Fathom panel is 380px wide (lg:w-[380px] below); the content reserves
// 404px (380 + a 24px gap) so the panel never sits flush against it. Tailwind's
// class scanner needs these as literal strings, not a computed one, so the two
// numbers must be kept in sync by hand if the panel's width ever changes.

/**
 * The meeting detail page: video, then title/meta/actions, then Summary,
 * Transcript and Action items as one continuous scroll (jump-to pills, not
 * tabs). Shared by the owner's page and the public share page; `readOnly`
 * removes every edit control for the latter. Both play the real recording
 * from its stored URL, and both get the floating Ask Fathom chat.
 *
 * Action item checkboxes are saved through `onToggleAction` (the owner's page
 * provides it).
 */
export function MeetingDetail({
  meeting,
  readOnly = false,
  onDelete,
  onDownload,
  onToggleAction,
}: {
  meeting: Meeting;
  readOnly?: boolean;
  /** Owner only: deletes the recording, its file and its share link. */
  onDelete?: () => void;
  /** Owner only: saves the original file. */
  onDownload?: () => void;
  /** Owner only: saves an action item's checkbox. Resolves false if it could not be saved, and the checkbox is put back. */
  onToggleAction?: (id: string, done: boolean) => Promise<boolean>;
}) {
  const [jump, setJump] = useState<JumpRequest | null>(null);
  const player = useRef<PlayerHandle>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>();
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(meeting.actionItems.map((a) => [a.id, a.done])),
  );
  const [askOpen, setAskOpen] = useState(false);
  const { show, toast } = useToast();

  // Closing on Escape matches how a slide-in panel is expected to behave.
  useEffect(() => {
    if (!askOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAskOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [askOpen]);

  function jumpTo(time: number) {
    setJump({ time, nonce: Date.now() });
    player.current?.seek(time);
  }

  function toggleAction(id: string) {
    const next = !done[id];
    setDone((prev) => ({ ...prev, [id]: next }));
    void onToggleAction?.(id, next).then((saved) => {
      if (!saved) setDone((prev) => ({ ...prev, [id]: !next }));
    });
  }

  // Clicking a transcript timestamp plays the recording from that moment.
  const media = meeting.media;
  function playFrom(t: number) {
    player.current?.seek(t, true);
  }

  // Only re-render when playback moves into a different transcript segment.
  function onPlaybackTime(t: number) {
    const id = segmentIdAt(meeting.transcript, t);
    setActiveSegmentId((prev) => (prev === id ? prev : id));
  }

  const doneCount = meeting.actionItems.filter((a) => done[a.id]).length;
  const speakerCount = meeting.attendees.length;

  return (
    <div className="relative">
      {/* Pushed left, not covered, while the panel is open — the rest of the page stays reachable. */}
      <div className={`transition-[padding] duration-200 ${askOpen ? "lg:pr-[404px]" : ""}`}>
        {media ? (
          <>
            <MediaPlayer
              ref={player}
              url={media.url}
              kind={media.mimeType.startsWith("video/") ? "video" : "audio"}
              poster={meeting.poster}
              onTime={onPlaybackTime}
            />
            <p className="mt-2 text-xs text-[#2B241C]/50 dark:text-[#F2EDDD]/50">
              {speakerCount} {speakerCount === 1 ? "speaker" : "speakers"} identified
            </p>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-[#2B241C]/20 p-10 text-center text-sm text-[#2B241C]/60 dark:border-[#F2EDDD]/20 dark:text-[#F2EDDD]/60">
            The recording isn&rsquo;t available.
          </p>
        )}

        <div className="mt-6">
          <MeetingInfoHeader meeting={meeting} readOnly={readOnly} onDelete={onDelete} onDownload={onDownload} />
        </div>

        <JumpNav />

        {meeting.notice && (
          <p
            role="note"
            className="mt-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <span aria-hidden>⚠</span>
            <span>{meeting.notice}</span>
          </p>
        )}

        <section id="summary" className="mt-8 scroll-mt-20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Summary</h2>
            <CopyButton label="Copy Summary" shortLabel="Copy" getText={() => summaryToText(meeting.summaries.general)} />
          </div>
          {meeting.summaries.general.map((section) => (
            <SectionRenderer key={section.id} section={section} onJump={jumpTo} />
          ))}
        </section>

        <section id="transcript" className="mt-10 scroll-mt-20 border-t border-[#2B241C]/10 pt-8 dark:border-[#F2EDDD]/10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <CopyButton label="Copy Transcript" shortLabel="Copy" getText={() => transcriptToText(meeting)} />
          </div>
          <TranscriptTab meeting={meeting} jump={jump} activeSegmentId={activeSegmentId} onSeek={playFrom} />
        </section>

        <section
          id="action-items"
          className="mt-10 scroll-mt-20 border-t border-[#2B241C]/10 pb-16 pt-8 dark:border-[#F2EDDD]/10"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Action items
              <span className="ml-2 text-sm font-normal text-[#2B241C]/50 dark:text-[#F2EDDD]/50">
                {doneCount} of {meeting.actionItems.length} done
              </span>
            </h2>
            {meeting.actionItems.length > 0 && <ActionItemActions meeting={meeting} done={done} onNotify={show} />}
          </div>
          <ActionItemList
            items={meeting.actionItems}
            attendees={meeting.attendees}
            done={done}
            onToggle={toggleAction}
            onJump={jumpTo}
            readOnly={readOnly}
          />
        </section>
      </div>

      {!askOpen && <AskFathomButton onClick={() => setAskOpen(true)} className="flex" />}

      <AskFathomPanel
        meeting={meeting}
        onJump={jumpTo}
        onClose={() => setAskOpen(false)}
        className={
          "fixed z-30 " +
          (askOpen
            ? "inset-4 lg:inset-auto lg:bottom-4 lg:right-4 lg:top-[calc(3.5rem+1rem)] lg:w-[380px]"
            : "hidden")
        }
      />
      {toast}
    </div>
  );
}
