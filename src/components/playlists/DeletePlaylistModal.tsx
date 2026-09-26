"use client";

import { Modal } from "@/components/ui/Modal";

/** Confirms deleting a playlist, via the same Modal.tsx used by the other playlist dialogs — not window.confirm. */
export function DeletePlaylistModal({
  open,
  name,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title="Delete playlist">
      <p className="text-sm text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
        Delete &ldquo;{name}&rdquo;? The recordings in it aren&rsquo;t affected, but the share link stops working.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#201D1A]/70 transition hover:bg-[#201D1A]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:text-[#F3F4F6]/70 dark:hover:bg-white/10 dark:focus-visible:outline-[#3EC79A]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:hover:bg-rose-500"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
