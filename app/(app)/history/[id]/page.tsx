import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import FeedbackCard from "@/components/FeedbackCard";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";
import { Correction } from "@/models/Correction";

export default async function ConversationDetailPage({ params }: PageProps<"/history/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDB();
  // 條件帶 userId：別人的對話在這裡會查不到，直接 404
  const conversation = await Conversation.findOne({ _id: id, userId: user.id }).lean();
  if (!conversation) notFound();

  const corrections = await Correction.find({ conversationId: conversation._id, userId: user.id })
    .sort({ kind: 1 })
    .lean();
  const byMessage = Map.groupBy(corrections, (c) => String(c.messageId));

  const scenario = getScenario(conversation.topic ?? "");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/history" className="text-sm text-muted transition hover:text-ink">
        ← History
      </Link>
      <div className="mt-5 flex items-center gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-xl border border-line bg-surface text-2xl">
          {scenario?.emoji ?? "💬"}
        </span>
        <h1 className="font-display text-3xl tracking-tight">{scenario?.label ?? conversation.title}</h1>
      </div>
      <p className="mt-2 text-sm text-muted">{new Date(conversation.startedAt).toLocaleString("zh-TW")}</p>

      <div className="mt-8 space-y-5 rounded-3xl border border-line bg-surface/50 p-4 sm:p-6">
        {conversation.messages.map((m) => {
          const key = String(m._id);
          if (m.role === "assistant") {
            return (
              <div key={key} className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-lg">
                  {scenario?.emoji ?? "💬"}
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-2.5 leading-relaxed shadow-sm">
                  {m.content}
                </div>
              </div>
            );
          }
          if (m.role !== "user") return null;
          return (
            <div key={key} className="flex flex-col items-end gap-2.5">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-brand to-brand-strong px-4 py-2.5 leading-relaxed text-white shadow-md shadow-brand/20">
                {m.content}
              </div>
              {byMessage.get(key)?.map((c) => (
                <div key={String(c._id)} className="w-full max-w-[85%]">
                  <FeedbackCard kind={c.kind} correctedText={c.correctedText} explanation={c.explanation} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
