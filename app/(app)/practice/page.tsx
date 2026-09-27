import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SCENARIOS } from "@/lib/scenarios";

export default async function PracticeHome() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:py-16">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Practice</div>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        Hi, {user.name}. <em className="text-muted">Ready to talk?</em>
      </h1>
      <p className="mt-3 text-muted">選一個情境，AI 會先開口，你用英文回應就好。</p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {SCENARIOS.map((s) => (
          <Link
            key={s.id}
            href={`/practice/${s.id}`}
            className="group relative flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-paper text-2xl transition group-hover:scale-105">
              {s.emoji}
            </span>
            <span className="mt-5 font-semibold">{s.label}</span>
            <span className="mt-1 text-sm text-muted">{s.description}</span>
            <span className="mt-4 text-sm font-medium text-brand opacity-0 transition group-hover:opacity-100">
              開始練習 →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
