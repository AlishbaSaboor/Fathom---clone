import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload/UploadForm";

export const metadata: Metadata = { title: "Upload a recording | Fathom Clone" };

export default function UploadPage() {
  return (
    <>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <UploadForm />
    </>
  );
}
