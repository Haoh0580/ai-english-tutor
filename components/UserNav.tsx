import Link from "next/link";
import { logout } from "@/app/actions/auth";
import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/practice", label: "練習" },
  { href: "/history", label: "History" },
  { href: "/corrections", label: "糾錯紀錄" },
];

export default async function UserNav() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 text-sm sm:gap-2">
        <Logo href="/practice" />
        <div className="ml-4 hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-muted">{user.name}</span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface hover:text-ink"
            >
              登出
            </button>
          </form>
        </div>
      </nav>

      {/* 手機版：連結放第二排 */}
      <div className="flex gap-1 border-t border-line px-4 py-1.5 text-sm sm:hidden">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1 text-muted hover:text-ink">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
