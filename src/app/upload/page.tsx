import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload/UploadForm";

export const metadata: Metadata = { title: "Upload a recording | Fathom Clone" };

export default function UploadPage() {
  return (
    <>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#2B241C]/60 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:text-[#F2EDDD]"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <UploadForm />
    </>
  );
}
