import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "Contact Us | Fathom Clone",
  description: "Get in touch with the Fathom team for questions, feedback, or support.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <LandingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact us.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Have questions, feedback, or need help with a recording? We’d love to hear from you.
          </p>
        </section>

        <section className="mx-auto max-w-xl px-4 pb-20 sm:px-6">
          <div className="rounded-2xl border border-[#201D1A]/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
            <form className="space-y-4" action="mailto:support@fathom.video" method="GET">
              <div>
                <label htmlFor="name" className="mb-1 block text-xs font-semibold text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#0F6E56] dark:border-white/15 dark:focus:border-[#3EC79A]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#0F6E56] dark:border-white/15 dark:focus:border-[#3EC79A]"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-xs font-semibold text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
                  Message
                </label>
                <textarea
                  id="message"
                  name="body"
                  rows={4}
                  required
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#0F6E56] dark:border-white/15 dark:focus:border-[#3EC79A]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#0B0F19]"
              >
                Send Message
              </button>
            </form>

            <div className="mt-6 border-t border-[#201D1A]/10 pt-4 text-center text-xs text-[#201D1A]/60 dark:border-white/10 dark:text-[#F3F4F6]/60">
              Direct email:{" "}
              <a href="mailto:support@fathom.video" className="font-medium text-[#0F6E56] underline dark:text-[#3EC79A]">
                support@fathom.video
              </a>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
