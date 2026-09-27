"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import Logo from "@/components/Logo";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition placeholder:text-muted/60 focus:border-brand/60 focus:bg-surface focus:ring-4 focus:ring-brand/10";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(isSignup ? signup : login, undefined);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-200px] -z-10 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />

      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-5">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center font-display text-4xl tracking-tight">
            {isSignup ? (
              <>
                Start <em className="text-brand">speaking.</em>
              </>
            ) : (
              <>
                Welcome <em className="text-brand">back.</em>
              </>
            )}
          </h1>
          <p className="mt-2 text-center text-muted">
            {isSignup ? "建立帳號，開始你的第一場英文對話" : "登入繼續你的英文練習"}
          </p>

          <form
            action={action}
            className="mt-8 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-black/5"
          >
            {isSignup && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">名字</span>
                <input name="name" required defaultValue={state?.values?.name} placeholder="你的名字" className={inputClass} />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                defaultValue={state?.values?.email}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">密碼</span>
              <input
                name="password"
                type="password"
                required
                minLength={isSignup ? 8 : undefined}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={isSignup ? "至少 8 個字元" : "••••••••"}
                className={inputClass}
              />
            </label>

            {state?.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-brand py-2.5 font-medium text-white shadow-md shadow-brand/20 transition hover:bg-brand-strong disabled:opacity-60"
            >
              {pending ? "處理中…" : isSignup ? "建立帳號" : "登入"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? "已經有帳號了？" : "還沒有帳號？"}{" "}
            <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-brand hover:underline">
              {isSignup ? "登入" : "免費註冊"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
