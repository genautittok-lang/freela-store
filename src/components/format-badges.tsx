export function FormatBadges({ formats }: { formats: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Supported formats">
      {formats.map((format) => (
        <li
          key={format}
          className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground"
        >
          {format.replace("jpeg", "jpg")}
        </li>
      ))}
    </ul>
  );
}
