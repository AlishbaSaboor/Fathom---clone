"use client";

import { Modal } from "@/components/ui/Modal";

/** Real, accurate privacy content — reused Modal.tsx, not a stub toast. Describes what this app actually does, not boilerplate. */
export function PrivacyPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Privacy Policy">
      <div className="space-y-4 text-sm leading-relaxed text-[#2B241C]/80 dark:text-[#F2EDDD]/80">
        <p>
          <strong className="font-semibold text-[#2B241C] dark:text-[#F2EDDD]">What we collect.</strong> Your name and
          email — from Google sign-in, or the ones you provide when creating an account — and whatever you upload: the
          recording file itself, plus the transcript, summary, and action items generated from it.
        </p>
        <p>
          <strong className="font-semibold text-[#2B241C] dark:text-[#F2EDDD]">How recordings are processed and
          stored.</strong> Uploaded recordings are stored in Vercel Blob. When a recording is processed, a temporary
          copy is sent to Google&rsquo;s Gemini API to generate its transcript and summary; Google automatically
          deletes files uploaded to Gemini within 48 hours. The transcript, summary, and action items produced from it
          are stored in MongoDB, tied to your account.
        </p>
        <p>
          <strong className="font-semibold text-[#2B241C] dark:text-[#F2EDDD]">Sharing.</strong> A recording&rsquo;s
          share link lets anyone who has it view that recording — that&rsquo;s the point of the link, not a leak.
          Beyond that, we don&rsquo;t sell your data or share it with third parties, other than the services that run
          the app itself: Google&rsquo;s Gemini API for analysis, and MongoDB Atlas / Vercel Blob for storage.
        </p>
        <p>
          <strong className="font-semibold text-[#2B241C] dark:text-[#F2EDDD]">Your control.</strong> You can delete
          any recording or playlist at any time from My Calls or Playlists. Deleting a recording removes its stored
          file and turns its share link off immediately.
        </p>
      </div>
    </Modal>
  );
}
