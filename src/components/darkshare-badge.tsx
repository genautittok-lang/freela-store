export function DarkshareBadge() {
  return (
    <a
      href="https://www.darkshare.store"
      target="_blank"
      rel="noopener noreferrer"
      className="darkshare-badge"
      aria-label="Verified by DARKSHARE"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m9 12 2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Verified by DARKSHARE</span>
    </a>
  );
}
