"use client";

import { useEffect, useRef, useState } from "react";
import { AskFathomButton } from "@/components/AskFathomButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { UsersIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { summaryToText } from "@/lib/export";
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
  nonce: number;
}

export function MeetingDetail({
  meeting,
  readOnly = false,
  onDelete,
  onDownload,
  onToggleAction,
}: {
  meeting: Meeting;
  readOnly?: boolean;
  onDelete?: () => void;
  onDownload?: () => void;
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

  const media = meeting.media;
  function playFrom(t: number) {
    player.current?.seek(t, true);
  }

  function onPlaybackTime(t: number) {
    const id = segmentIdAt(meeting.transcript, t);
    setActiveSegmentId((prev) => (prev === id ? prev : id));
  }

  const doneCount = meeting.actionItems.filter((a) => done[a.id]).length;
  const speakerCount = meeting.attendees.length;

  return (
    <div className="relative">
      <div className={`transition-[padding] duration-200 ${askOpen ? "lg:pr-[404px]" : ""}`}>
        {media ? (
          <div className="rounded-2xl border border-[#201D1A]/10 bg-white shadow-xs overflow-hidden dark:border-white/10 dark:bg-white/[0.03]">
            <MediaPlayer
              ref={player}
              url={media.url}
              kind={media.mimeType.startsWith("video/") ? "video" : "audio"}
              poster={meeting.poster}
              onTime={onPlaybackTime}
            />
            <div className="px-4 py-2 border-t border-[#201D1A]/8 dark:border-white/10 flex items-center justify-between text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
              <span className="flex items-center gap-1.5 font-medium">
                <UsersIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" />
                {speakerCount} {speakerCount === 1 ? "speaker" : "speakers"} identified
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#0F6E56] dark:text-[#3EC79A]">Ready for analysis</span>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#201D1A]/15 p-10 text-center text-sm text-[#201D1A]/60 dark:border-white/10 dark:text-[#F3F4F6]/60">
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
            className="mt-6 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <span aria-hidden>⚠</span>
            <span>{meeting.notice}</span>
          </p>
        )}

        {/* Executive Summary */}
        <section id="summary" className="mt-8 scroll-mt-24 rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#201D1A]/8 pb-3 dark:border-white/8">
            <h2 className="text-base font-bold text-[#201D1A] dark:text-[#F3F4F6]">Executive Summary</h2>
            <CopyButton label="Copy Summary" shortLabel="Copy" getText={() => summaryToText(meeting.summaries.general)} />
          </div>
          {meeting.summaries.general.map((section) => (
            <SectionRenderer key={section.id} section={section} onJump={jumpTo} />
          ))}
        </section>

        {/* Action Items */}
        <section
          id="action-items"
          className="mt-8 scroll-mt-24 rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#201D1A]/8 pb-3 dark:border-white/8">
            <div>
              <h2 className="text-base font-bold text-[#201D1A] dark:text-[#F3F4F6]">
                Action items
              </h2>
              <span className="text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
                {doneCount} of {meeting.actionItems.length} completed
              </span>
            </div>
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

        {/* Full Transcript */}
        <section id="transcript" className="mt-8 mb-16 scroll-mt-24 rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
          <TranscriptTab meeting={meeting} jump={jump} activeSegmentId={activeSegmentId} onSeek={playFrom} />
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
