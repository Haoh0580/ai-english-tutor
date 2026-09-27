"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FeedbackCard, { type FeedbackKind as CardKind } from "@/components/FeedbackCard";

type FeedbackKind = "correct" | "improve";

type Feedback = {
  originalText: string;
  correctedText: string;
  explanation?: string;
};

type FeedbackState = {
  loading?: boolean;
  error?: string;
  data?: Feedback;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  // 使用者訊息存進 DB 後的 id，拿來打糾錯 / 建議 API
  id?: string;
  feedback?: Partial<Record<FeedbackKind, FeedbackState>>;
};

// 按鈕 → 對應的 API 路徑（/api/correct、/api/improve）和存進 DB 的 kind
const FEEDBACK_LABELS: Record<FeedbackKind, { button: string; cardKind: CardKind }> = {
  correct: { button: "糾正文法", cardKind: "correction" },
  improve: { button: "更好完整的回答", cardKind: "suggestion" },
};

const FEEDBACK_ICONS: Record<FeedbackKind, string> = {
  correct: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z M13.5 7.5l3 3",
  improve: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z",
};

function AiAvatar({ emoji }: { emoji: string }) {
  return (
    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-lg shadow-sm">
      {emoji}
    </span>
  );
}

export default function Chat({ scenarioId, scenarioEmoji }: { scenarioId: string; scenarioEmoji: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  async function send(message?: string) {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioId, conversationId, message }),
      });
      // 登入過期：回登入頁
      if (res.status === 401) return router.push("/login");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConversationId(data.conversationId);
      setMessages((prev) => {
        const next = [...prev];
        // 把 DB 的 id 補到剛送出的那句使用者訊息上
        if (data.userMessageId) {
          const last = next.at(-1);
          if (last?.role === "user") next[next.length - 1] = { ...last, id: data.userMessageId };
        }
        return [...next, { role: "assistant", content: data.reply }];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function updateFeedback(messageId: string, kind: FeedbackKind, state: FeedbackState) {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: { ...m.feedback, [kind]: state } } : m))
    );
  }

  async function requestFeedback(messageId: string, kind: FeedbackKind) {
    updateFeedback(messageId, kind, { loading: true });
    try {
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, messageId }),
      });
      // 登入過期：回登入頁
      if (res.status === 401) return router.push("/login");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateFeedback(messageId, kind, { data });
    } catch (err) {
      updateFeedback(messageId, kind, {
        error: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  // 進到畫面時讓 AI 先開口（ref 避免 dev 模式 StrictMode 跑兩次）
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || !conversationId) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    send(text);
  }

  return (
    <>
      {/* 對話區 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="rise-in flex flex-col items-end gap-2.5">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-brand to-brand-strong px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-md shadow-brand/20 sm:max-w-[75%]">
                  {m.content}
                </div>

                {m.id && (
                  <div className="flex flex-wrap justify-end gap-2">
                    {(Object.keys(FEEDBACK_LABELS) as FeedbackKind[]).map((kind) => {
                      const state = m.feedback?.[kind];
                      const done = !!state?.data;
                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => requestFeedback(m.id!, kind)}
                          disabled={state?.loading || done}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                            done
                              ? kind === "correct"
                                ? "border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                : "border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "border-line bg-surface text-muted hover:border-brand/40 hover:text-brand disabled:opacity-60"
                          }`}
                        >
                          {state?.loading ? (
                            <span className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                          ) : done ? (
                            <span aria-hidden>✓</span>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
                              <path d={FEEDBACK_ICONS[kind]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {state?.loading ? "分析中…" : FEEDBACK_LABELS[kind].button}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(Object.keys(FEEDBACK_LABELS) as FeedbackKind[]).map((kind) => {
                  const fb = m.feedback?.[kind];
                  if (!fb?.data && !fb?.error) return null;
                  return (
                    <div key={kind} className="w-full max-w-[85%] sm:max-w-[75%]">
                      <FeedbackCard
                        kind={FEEDBACK_LABELS[kind].cardKind}
                        correctedText={fb.data?.correctedText}
                        explanation={fb.data?.explanation}
                        error={fb.error}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div key={i} className="rise-in flex items-start gap-3">
                <AiAvatar emoji={scenarioEmoji} />
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-2.5 text-[15px] leading-relaxed shadow-sm sm:max-w-[75%]">
                  {m.content}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="rise-in flex items-start gap-3" aria-label="AI is typing">
              <AiAvatar emoji={scenarioEmoji} />
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3.5 shadow-sm">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="typing-dot size-1.5 rounded-full bg-muted"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 輸入框 */}
      <div className="border-t border-line bg-paper/80 backdrop-blur">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4 pb-4 pt-3">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-4 shadow-sm transition focus-within:border-brand/50 focus-within:shadow-md focus-within:shadow-brand/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your reply in English…"
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted/70"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={loading || !input.trim() || !conversationId}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-strong disabled:bg-line disabled:text-muted"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            按 Enter 送出 · 每一句都可以查「糾正文法」和「更好完整的回答」
          </p>
        </form>
      </div>
    </>
  );
}
