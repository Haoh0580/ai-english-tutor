import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";
import { Correction } from "@/models/Correction";

export default async function HistoryPage() {
  const user = await requireUser();
  await connectDB();

  // 只查自己的對話
  const conversations = await Conversation.find({ userId: user.id })
    .sort({ startedAt: -1 })
    .select({ topic: 1, title: 1, startedAt: 1, messages: 1 })
    .lean();

  // 每場對話有幾筆糾錯 / 建議
  const counts = await Correction.aggregate<{ _id: unknown; count: number }>([
    { $match: { userId: user.id } },
    { $group: { _id: "$conversationId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">History</div>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Your conversations</h1>
      <p className="mt-2 text-muted">你練習過的每一場對話</p>

      {conversations.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          還沒有練習紀錄，
          <Link href="/practice" className="font-medium text-brand hover:underline">
            去選一個場景開始吧
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversations.map((c) => {
            const scenario = getScenario(c.topic ?? "");
            const userTurns = c.messages.filter((m) => m.role === "user");
            const feedbackCount = countMap.get(String(c._id)) ?? 0;
            return (
              <li key={String(c._id)}>
                <Link
                  href={`/history/${c._id}`}
                  className="block rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-paper text-xl">
                      {scenario?.emoji ?? "💬"}
                    </span>
                    <span className="font-semibold">{scenario?.label ?? c.title}</span>
                    <span className="ml-auto text-xs text-muted">
                      {new Date(c.startedAt).toLocaleString("zh-TW")}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-[15px]">
                    {userTurns.at(-1)?.content ?? "（還沒有回答）"}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    你說了 {userTurns.length} 句 · 糾錯 / 建議 {feedbackCount} 筆
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
