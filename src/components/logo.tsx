import Link from "next/link";
import type { Locale } from "@/data/locales";

export function Logo({ locale, compact = false }: { locale: string; compact?: boolean }) {
  return (
    <Link href={`/${locale}`} className="group inline-flex items-center gap-2" aria-label="Freela home">
      <span className="relative inline-flex items-baseline font-semibold tracking-tight text-primary">
        <span className="text-xl leading-none sm:text-[1.35rem]">Freela</span>
        <span
          className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary"
          aria-hidden
        />
        <span
          className="absolute -bottom-1 start-0 h-0.5 w-[calc(100%-0.4rem)] rounded-full bg-primary/80"
          aria-hidden
        />
      </span>
      {compact ? null : (
        <span className="hidden text-sm font-normal text-muted-foreground sm:inline">.store</span>
      )}
    </Link>
  );
}

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#3d9a5a" />
      <text x="6" y="22" fontSize="16" fontFamily="ui-sans-serif, system-ui" fill="white" fontWeight="700">
        F
      </text>
      <circle cx="24" cy="10" r="2.2" fill="white" />
    </svg>
  );
}
