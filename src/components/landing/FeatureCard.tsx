/** One of the three feature cards: a small accent dot instead of an icon, a bold title, a short description. */
export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#2B241C]/15 p-6 dark:border-[#F2EDDD]/15">
      <span aria-hidden className="block h-2.5 w-2.5 rounded-full bg-[#0F6E56] dark:bg-[#3EC79A]" />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#2B241C]/70 dark:text-[#F2EDDD]/70">{description}</p>
    </div>
  );
}
