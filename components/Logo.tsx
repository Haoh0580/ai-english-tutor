import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-brand to-brand-strong text-white shadow-sm shadow-brand/30`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[60%]" aria-hidden>
        <path
          d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 4v-4h0.5A2.5 2.5 0 0 1 5 12.5v-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 9.5h6M9 12h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        English Tutor<span className="text-brand">.</span>
      </span>
    </Link>
  );
}
