import Link from "next/link";
import FeedbackCard from "@/components/FeedbackCard";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Correction } from "@/models/Correction";

export default async function CorrectionsPage() {
  const user = await requireUser();
  await connectDB();

  // 只查自己的糾錯 / 建議紀錄
  const corrections = await Correction.find({ userId: user.id }).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Corrections</div>
      <h1 className="mt-3 font-display text-4xl tracking-tight">糾錯紀錄</h1>
      <p className="mt-2 text-muted">你在練習中查過的文法糾正和更好的說法</p>

      {corrections.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          還沒有紀錄。練習時按「糾正文法」或「更好完整的回答」就會存在這裡。
        </p>
      ) : (
        <ul className="mt-8 space-y-5">
          {corrections.map((c) => (
            <li key={String(c._id)}>
              <FeedbackCard
                kind={c.kind}
                originalText={c.originalText}
                correctedText={c.correctedText}
                explanation={c.explanation}
              />
              <div className="mt-2 flex justify-between px-1 text-xs text-muted">
                <span>{new Date(c.createdAt).toLocaleString("zh-TW")}</span>
                <Link href={`/history/${c.conversationId}`} className="font-medium text-brand hover:underline">
                  看整段對話 →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
