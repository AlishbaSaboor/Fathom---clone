"use client";

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

// Auth and accounts are out of scope for this build, so this is a static
// stand-in for the real account menu, laid out like Fathom's: help links, legal
// links, then app actions. Every entry is a stub that answers "Not part of this
// build". There is deliberately no "Logged in as" line: with no account system,
// showing an email would be misleading.
const icon = "h-4 w-4 text-zinc-500 dark:text-zinc-400";

const ENTRIES: { id: string; label: string; icon?: React.ReactNode; separatorBefore?: boolean }[] = [
  { id: "start-test-call", label: "Start Test Call", icon: <VideoIcon className={icon} /> },
  { id: "tutorial", label: "Tutorial", icon: <BookIcon className={icon} /> },
  { id: "faqs", label: "FAQs", icon: <HelpCircleIcon className={icon} /> },
  { id: "developers", label: "Developers", icon: <CodeIcon className={icon} /> },
  { id: "privacy", label: "Privacy Policy", separatorBefore: true },
  { id: "terms", label: "Terms of Service" },
  { id: "security", label: "Security & Compliance" },
  { id: "status", label: "System Status" },
  { id: "download-app", label: "Download App", icon: <DownloadIcon className={icon} />, separatorBefore: true },
  { id: "logout", label: "Logout", icon: <LogOutIcon className={icon} /> },
];

export function AccountMenu() {
  const { show, toast } = useToast();

  const items: MenuItem[] = ENTRIES.map((e) => ({
    ...e,
    onSelect: () => show("Not part of this build", "info"),
  }));

  return (
    <>
      <DropdownMenu
        items={items}
        ariaLabel="Account menu"
        align="right"
        menuClassName="w-60"
        triggerClassName="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        triggerChildren="DU"
      />
      {toast}
    </>
  );
}
