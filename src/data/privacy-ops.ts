export type Vendor = {
  id: string;
  name: string;
  category: string;
  whatIsSent: string;
  why: string;
  retention: string;
  region: string;
  enabled: boolean;
};

/** No production third-party file processors in this release. */
export const vendors: Vendor[] = [];

export type DataInventoryRow = {
  data: string;
  why: string;
  where: string;
  retention: string;
  processor: string;
  deletion: string;
};

export const dataInventory: DataInventoryRow[] = [
  {
    data: "Admin email + password hash",
    why: "Authenticate the owner dashboard",
    where: "SQLite (local/host volume)",
    retention: "Until the account is removed",
    processor: "Freela (first party)",
    deletion: "Delete the admin_users row or wipe the database file",
  },
  {
    data: "Admin session token hash",
    why: "Keep an authenticated session",
    where: "SQLite + httpOnly cookie",
    retention: "12 hours",
    processor: "Freela",
    deletion: "Logout or expiry deletes the session row",
  },
  {
    data: "Privacy-safe analytics events (tool id, locale, session UUID, success/error, path)",
    why: "Understand which tools work and fail",
    where: "SQLite",
    retention: "Configurable; default keep until export/wipe",
    processor: "Freela (only with analytics consent)",
    deletion: "Wipe events table or request deletion via /contact",
  },
  {
    data: "Preferred locale cookie",
    why: "Remember language for returning visitors",
    where: "Browser cookie + localStorage",
    retention: "1 year",
    processor: "User device",
    deletion: "Clear site data / cookies",
  },
  {
    data: "User files and pasted document contents",
    why: "Run the selected tool",
    where: "Browser memory only for LOCAL_ONLY tools",
    retention: "Until the tab is closed or a new file is chosen",
    processor: "None (LOCAL_ONLY)",
    deletion: "Object URLs are revoked; memory is released on navigation",
  },
];
