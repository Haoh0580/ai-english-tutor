import Link from "next/link";
import Logo, { LogoMark } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { SCENARIOS } from "@/lib/scenarios";

// 首頁示範對話（純展示，不打 API）
const DEMO = {
  ai: "Good morning! Can I see your passport, please?",
  user: "Sure, here is. I want a window seat.",
  corrected: "Sure, here it is. I'd like a window seat, please.",
  note: "「here is」後面要接 it；點位子時用 I'd like 比 I want 更有禮貌。",
};

const STEPS = [
  { title: "選一個情境", body: "點餐、面試、機場、會議……8 種真實生活場景，AI 會扮演對應的角色。" },
  { title: "用英文回答", body: "AI 先開口，你輸入英文回應，就像跟真人聊天一樣自然地來回對話。" },
  { title: "一鍵看怎麼說更好", body: "每一句都能查文法錯誤、看更完整道地的說法，附上中文解釋。" },
];

const FEATURES = [
  {
    title: "文法糾正",
    body: "只改真正錯的地方，保留你的原意，並用中文說明為什麼。",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    icon: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z M13.5 7.5l3 3",
  },
  {
    title: "更好完整的回答",
    body: "示範母語人士在這個情境會怎麼說，順便學 1–2 個實用片語。",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    icon: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z",
  },
  {
    title: "練習紀錄",
    body: "每場對話和每一筆糾錯都自動保存，隨時回來複習自己的進步。",
    tone: "bg-brand-soft text-brand",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primary = user
    ? { href: "/practice", label: "進入練習" }
    : { href: "/signup", label: "免費註冊，開始練習" };

  return (
    <div className="relative overflow-x-clip">
      {/* 背景光暈 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
        <div className="absolute right-[-120px] top-[220px] h-[320px] w-[420px] rounded-full bg-amber-300/20 blur-[110px] dark:bg-amber-500/10" />
      </div>

      {/* 導覽列 */}
      <header className="sticky top-0 z-20 border-b border-transparent bg-paper/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Logo />
          <div className="ml-10 hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#scenarios" className="hover:text-ink">情境</a>
            <a href="#how" className="hover:text-ink">怎麼運作</a>
            <a href="#features" className="hover:text-ink">功能</a>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            {user ? (
              <Link
                href="/practice"
                className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition hover:opacity-90"
              >
                進入練習
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2 text-muted transition hover:text-ink">
                  登入
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition hover:opacity-90"
                >
                  免費註冊
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              AI 英文口說家教 · 8 種真實情境
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Speak English
              <br />
              like you <em className="text-brand">mean it.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              選一個生活情境，和 AI 角色即時對話。每說一句，都能一鍵糾正文法、看更道地完整的說法——
              你會清楚知道<span className="text-ink">下次該怎麼講得更好</span>。
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={primary.href}
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-medium text-white shadow-lg shadow-brand/25 transition hover:bg-brand-strong"
              >
                {primary.label}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              {!user && (
                <Link href="/login" className="rounded-full px-5 py-3.5 text-muted transition hover:text-ink">
                  已經有帳號？登入
                </Link>
              )}
            </div>
            <p className="mt-6 text-xs text-muted">不用下載 · 打開瀏覽器就能練 · 紀錄自動保存</p>
          </div>

          <DemoCard />
        </section>

        {/* 情境 */}
        <section id="scenarios" className="scroll-mt-20 border-t border-line bg-surface/50">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <SectionHeading
              eyebrow="Scenarios"
              title="從今天會遇到的對話開始"
              body="每個情境都有專屬的 AI 角色，陪你把課本上的英文變成說得出口的英文。"
            />
            <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {SCENARIOS.map((s) => (
                <Link
                  key={s.id}
                  href={user ? `/practice/${s.id}` : "/signup"}
                  className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="mt-4 font-semibold">{s.label}</div>
                  <div className="mt-1 text-sm text-muted">{s.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 怎麼運作 */}
        <section id="how" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-24">
          <SectionHeading eyebrow="How it works" title="三個步驟，把錯誤變成進步" />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-line bg-surface p-7">
                <span className="font-display text-5xl text-brand/30">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 功能 */}
        <section id="features" className="scroll-mt-20 border-t border-line bg-surface/50">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <SectionHeading eyebrow="Features" title="不只陪你聊，還告訴你怎麼說更好" />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-line bg-surface p-7">
                  <span className={`inline-flex size-11 items-center justify-center rounded-xl ${f.tone}`}>
                    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                      <path d={f.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 最後的 CTA */}
        <section className="mx-auto max-w-6xl px-5 py-24">
          <div className="relative overflow-hidden rounded-3xl bg-[#15141c] px-8 py-16 text-center text-white sm:px-16">
            <div aria-hidden className="absolute left-1/2 top-0 h-64 w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/40 blur-[100px]" />
            <h2 className="relative font-display text-4xl leading-tight sm:text-5xl">
              Your next conversation
              <br />
              <em className="text-indigo-300">starts here.</em>
            </h2>
            <p className="relative mx-auto mt-5 max-w-md text-white/70">
              註冊只要 30 秒，馬上開始你的第一場英文對話。
            </p>
            <Link
              href={primary.href}
              className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-medium text-[#15141c] transition hover:bg-indigo-50"
            >
              {primary.label} →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-8 text-sm text-muted">
          <LogoMark className="size-6" />
          <span>AI English Tutor</span>
          <span className="ml-auto">Practice makes progress.</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

// Hero 右側：示範一段對話和糾錯卡片
function DemoCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-transparent to-amber-300/20 blur-2xl" />
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-2xl shadow-black/5">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-paper text-xl">✈️</span>
          <div>
            <div className="text-sm font-semibold">機場報到</div>
            <div className="text-xs text-muted">Check-in agent · 對話中</div>
          </div>
          <span className="ml-auto size-2 rounded-full bg-emerald-500" />
        </div>

        <div className="space-y-4 pt-5 text-[15px]">
          <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-paper px-4 py-2.5">{DEMO.ai}</div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-brand to-brand-strong px-4 py-2.5 text-white">
            {DEMO.user}
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-1 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              ✓ 糾正文法
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 text-muted">更好完整的回答</span>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              文法糾正
            </div>
            <div className="mt-1.5 font-medium">{DEMO.corrected}</div>
            <div className="mt-1.5 text-sm text-muted">{DEMO.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
