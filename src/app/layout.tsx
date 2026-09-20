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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
