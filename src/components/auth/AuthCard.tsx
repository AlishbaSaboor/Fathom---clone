import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";

/** The shared shell for /login and /signup: centered card, app wordmark, a title and a footer link to switch between them. */
export function AuthCard({
  title,
  footer,
  children,
}: {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <Link href="/" className="mb-8">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-[#2B241C]/15 p-6 dark:border-[#F2EDDD]/15">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <div className="mt-5">{children}</div>
      </div>
      <p className="mt-6 text-sm text-[#2B241C]/70 dark:text-[#F2EDDD]/70">{footer}</p>
    </div>
  );
}
