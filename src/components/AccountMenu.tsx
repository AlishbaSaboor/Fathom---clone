"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import {
  BookIcon,
  CodeIcon,
  DownloadIcon,
  HelpCircleIcon,
  LogOutIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";

// Everything below Logout is still out of scope for this build: honest stubs,
// laid out like Fathom's own menu (help links, legal links, then app actions).
const icon = "h-4 w-4 text-zinc-500 dark:text-zinc-400";

const STUB_ENTRIES: { id: string; label: string; icon?: React.ReactNode; separatorBefore?: boolean }[] = [
  { id: "start-test-call", label: "Start Test Call", icon: <VideoIcon className={icon} /> },
  { id: "tutorial", label: "Tutorial", icon: <BookIcon className={icon} /> },
  { id: "faqs", label: "FAQs", icon: <HelpCircleIcon className={icon} /> },
  { id: "developers", label: "Developers", icon: <CodeIcon className={icon} /> },
  { id: "privacy", label: "Privacy Policy", separatorBefore: true },
  { id: "terms", label: "Terms of Service" },
  { id: "security", label: "Security & Compliance" },
  { id: "status", label: "System Status" },
  { id: "download-app", label: "Download App", icon: <DownloadIcon className={icon} />, separatorBefore: true },
];

const DEFAULT_TRIGGER_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

/** The first letters of up to two words, for the avatar; "?" if there's nothing to work with. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function AccountMenu({
  user,
  triggerClassName = DEFAULT_TRIGGER_CLASS,
}: {
  user: { email: string; name: string } | null;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  const items: MenuItem[] = [
    ...(user
      ? [{ id: "identity", label: user.name, hint: user.email, disabled: true, onSelect: () => {} } satisfies MenuItem]
      : []),
    { id: "pricing", label: "Pricing", separatorBefore: true, onSelect: () => router.push("/pricing") },
    ...STUB_ENTRIES.map((e) => ({ ...e, onSelect: () => show("Not part of this build", "info") })),
    { id: "logout", label: loggingOut ? "Logging out…" : "Logout", icon: <LogOutIcon className={icon} />, separatorBefore: true, onSelect: logout },
  ];

  return (
    <>
      <DropdownMenu
        items={items}
        ariaLabel="Account menu"
        align="right"
        menuClassName="w-60"
        triggerClassName={triggerClassName}
        triggerChildren={user ? initials(user.name) : "?"}
      />
      {toast}
    </>
  );
}
