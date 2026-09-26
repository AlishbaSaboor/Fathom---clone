import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAF9F5] px-4 py-12 text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6] transition-colors">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-8">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
        <h1 className="text-xl font-bold tracking-tight text-[#201D1A] dark:text-[#F3F4F6]">{title}</h1>
        <div className="mt-5">{children}</div>
      </div>
      <p className="mt-6 text-sm text-[#201D1A]/70 dark:text-[#F3F4F6]/70">{footer}</p>
    </div>
  );
}
