"use client";

import { useState } from "react";
import { CheckIcon, MailIcon } from "@/components/ui/icons";

const REAL_CONTACT_EMAIL = "alishbasaboor005@gmail.com";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Could not submit your message. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
    setError(null);
  }

  return (
    <div className="rounded-2xl border border-[#201D1A]/10 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
      {submitted ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/20 dark:text-[#3EC79A]">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#201D1A] dark:text-[#F3F4F6]">Message sent!</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Thank you, <strong className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{name}</strong>. Your message has been saved in our database. We will reply to{" "}
            <strong className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{email}</strong> soon.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-[#0F6E56] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
            >
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:border-red-400/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={submitting}
              className="w-full rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm text-[#201D1A] outline-none transition focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] disabled:opacity-50 dark:border-white/15 dark:text-[#F3F4F6] dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              disabled={submitting}
              className="w-full rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm text-[#201D1A] outline-none transition focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] disabled:opacity-50 dark:border-white/15 dark:text-[#F3F4F6] dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-xs font-semibold text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-[#201D1A]/15 bg-transparent px-3 py-2 text-sm text-[#201D1A] outline-none transition focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] disabled:opacity-50 dark:border-white/15 dark:text-[#F3F4F6] dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition hover:bg-[#0c5945] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
          >
            {submitting ? "Saving to database..." : "Send Message"}
          </button>
        </form>
      )}

      <div className="mt-6 border-t border-[#201D1A]/10 pt-4 text-center text-xs text-[#201D1A]/60 dark:border-white/10 dark:text-[#F3F4F6]/60">
        <div className="flex items-center justify-center gap-1.5">
          <MailIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" />
          <span>Direct email:</span>
          <a
            href={`mailto:${REAL_CONTACT_EMAIL}`}
            className="font-medium text-[#0F6E56] underline decoration-1 underline-offset-2 hover:opacity-80 dark:text-[#3EC79A]"
          >
            {REAL_CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}

