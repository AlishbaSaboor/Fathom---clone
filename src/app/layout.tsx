import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fathom Clone",
  description: "AI meeting notetaker: a one-day clone of fathom.video",
};

// Root layout carries no chrome. The app shell lives in the (app) route group
// and the share view in (share), so the public share page never renders an
// account menu.
//
// suppressHydrationWarning on <html> and <body>: browser extensions (Grammarly,
// password managers, dark-mode tools) add attributes such as
// data-new-gr-c-s-check-loaded to these two elements before React hydrates,
// which React reports as a hydration mismatch. This silences that one-level
// attribute check only; it does not hide mismatches anywhere inside the app.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
