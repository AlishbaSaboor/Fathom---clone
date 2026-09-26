"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";

const icon = "h-4 w-4 text-zinc-500 dark:text-zinc-400";

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

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
    {
      id: "pricing",
      label: "Pricing",
      icon: <CreditCardIcon className={icon} />,
      separatorBefore: true,
      onSelect: () => router.push("/pricing"),
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: <HelpCircleIcon className={icon} />,
      onSelect: () => router.push("/#faq"),
    },
    {
      id: "privacy",
      label: "Privacy Policy",
      icon: <ShieldCheckIcon className={icon} />,
      onSelect: () => setPrivacyOpen(true),
    },
    {
      id: "logout",
      label: loggingOut ? "Logging out…" : "Logout",
      icon: <LogOutIcon className={icon} />,
      separatorBefore: true,
      onSelect: logout,
    },
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
      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}

