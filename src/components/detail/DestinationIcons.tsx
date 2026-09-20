import type { Destination } from "@/lib/actionItemExport";

// Small stand-ins for each tool's mark, drawn inline. They are simple shapes in
// each tool's usual color, not the official logos.
export function DestinationIcon({ id }: { id: Destination }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (id) {
    case "asana":
      return (
        <svg {...common}>
          <circle cx="12" cy="7.5" r="3.6" fill="#f06a6a" />
          <circle cx="6.6" cy="16.2" r="3.6" fill="#f06a6a" />
          <circle cx="17.4" cy="16.2" r="3.6" fill="#f06a6a" />
        </svg>
      );
    case "google-docs":
      return (
        <svg {...common}>
          <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#4285f4" />
          <path d="M14 2v5h5" fill="#a1c2fa" />
          <path d="M8 12h8M8 15h8M8 18h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "gmail":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" fill="#fff" stroke="#dadce0" />
          <path d="M3.5 7.2v10.3h3.3v-6.8L12 14.6l5.2-3.9v6.8h3.3V7.2l-1.4-.9L12 11.5 4.9 6.3l-1.4.9Z" fill="#ea4335" />
        </svg>
      );
    case "todoist":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#e44332" />
          <path d="M7 9.5h10M7 12.5h7M7 15.5h4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "word":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#2b579a" />
          <path d="m7 9 1.6 6.2L12 10l3.4 5.2L17 9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
  }
}
