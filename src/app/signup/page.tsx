import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SignupForm } from "@/components/auth/SignupForm";
import { getUser, isSafeRedirect } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign up | Fathom Clone" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const fromParam = typeof params.from === "string" ? params.from : undefined;
  const from = isSafeRedirect(fromParam) ? fromParam : "/calls";

  if (await getUser()) redirect(from);

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?from=${encodeURIComponent(from)}`} className="font-semibold text-[#0F6E56] underline dark:text-[#3EC79A]">
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <GoogleButton from={from} />
        <div className="flex items-center gap-3 text-xs text-[#2B241C]/50 dark:text-[#F2EDDD]/50">
          <span className="h-px flex-1 bg-[#2B241C]/15 dark:bg-[#F2EDDD]/15" />
          or
          <span className="h-px flex-1 bg-[#2B241C]/15 dark:bg-[#F2EDDD]/15" />
        </div>
        <SignupForm from={from} />
      </div>
    </AuthCard>
  );
}
