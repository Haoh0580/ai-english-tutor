import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getScenario } from "@/lib/scenarios";
import Chat from "./Chat";

export default async function PracticePage({ params }: PageProps<"/practice/[scenario]">) {
  await requireUser();
  const { scenario: id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  return (
    <main className="relative flex min-h-0 flex-1 flex-col">
      {/* 情境標題列 */}
      <div className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/practice"
            aria-label="換場景"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-paper text-xl">
            {scenario.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-semibold leading-tight">{scenario.label}</h1>
            <p className="truncate text-xs text-muted">{scenario.description}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            練習中
          </span>
        </div>
      </div>

      <Chat scenarioId={scenario.id} scenarioEmoji={scenario.emoji} />
    </main>
  );
}
