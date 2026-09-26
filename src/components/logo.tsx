import Link from "next/link";
import Image from "next/image";

export function Logo({ locale, compact = false, homeLabel = "home" }: { locale: string; compact?: boolean; homeLabel?: string }) {
  const word = locale === "uk" ? "Фрелла" : "Freela";
  return (
    <Link href={`/${locale}`} className="group inline-flex items-center gap-2" aria-label={`${word} ${homeLabel}`}>
      <Image
        src="/brand/mark-64.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0"
        priority
      />
      <span className="inline-flex items-baseline font-semibold tracking-tight text-foreground">
        <span className="text-xl leading-none sm:text-[1.35rem]">{word}</span>
        {compact ? null : (
          <span className="ms-0.5 hidden text-sm font-normal text-muted-foreground sm:inline">.store</span>
        )}
      </span>
    </Link>
  );
}

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <Image src="/brand/mark-64.png" alt="" width={32} height={32} className={className} />;
}
