import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "Contact Us | Fathom AI",
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
          <ContactForm />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

