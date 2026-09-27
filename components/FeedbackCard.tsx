// 顯示一筆糾錯 / 建議；對話畫面和歷史紀錄共用
export type FeedbackKind = "correction" | "suggestion";

export const FEEDBACK_TITLES: Record<FeedbackKind, string> = {
  correction: "文法糾正",
  suggestion: "更好完整的回答",
};

const STYLES: Record<FeedbackKind, { card: string; label: string; bar: string }> = {
  correction: {
    card: "border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30",
    label: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-400",
  },
  suggestion: {
    card: "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    label: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-400",
  },
};

export default function FeedbackCard({
  kind,
  correctedText,
  explanation,
  originalText,
  error,
}: {
  kind: FeedbackKind;
  correctedText?: string;
  explanation?: string | null;
  // 有傳才顯示原句（例如在糾錯紀錄列表裡）
  originalText?: string;
  error?: string;
}) {
  const style = STYLES[kind];
  return (
    <div className={`rise-in relative w-full overflow-hidden rounded-2xl border p-4 pl-5 text-sm ${style.card}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${style.label}`}>{FEEDBACK_TITLES[kind]}</div>
      {error ? (
        <div className="mt-1.5 text-red-600">{error}</div>
      ) : (
        <>
          {originalText && <div className="mt-1.5 text-muted line-through decoration-muted/60">{originalText}</div>}
          <div className="mt-1.5 text-[15px] font-medium leading-relaxed text-ink">{correctedText}</div>
          {explanation && <div className="mt-2 whitespace-pre-line leading-relaxed text-muted">{explanation}</div>}
        </>
      )}
    </div>
  );
}
