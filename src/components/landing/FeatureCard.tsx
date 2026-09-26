/** One of the three feature cards: a small accent dot, bold title, short description, unified palette. */
export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
      <span aria-hidden className="block h-2.5 w-2.5 rounded-full bg-[#0F6E56] dark:bg-[#3EC79A]" />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">{description}</p>
    </div>
  );
}
