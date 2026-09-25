import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import {
  analyticsSummary,
  processingModeCounts,
  recentAudit,
  retentionOverview,
  translationHealth,
} from "@/lib/analytics";
import { toolRegistry } from "@/data/tools";
import { INITIAL_LOCALES, localeRegistry, PREPARED_LOCALES } from "@/data/locales";
import { logoutAction } from "./actions";
import { messages } from "@/i18n/messages";
import { extras } from "@/i18n/extras";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin · Freela",
};

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  let user = null;
  try {
    user = await currentAdmin();
  } catch {
    user = null;
  }
  if (!user) redirect("/admin/login");
  const { range = "7d" } = await searchParams;
  const stats = analyticsSummary(range);
  const modes = processingModeCounts();
  const translations = translationHealth();
  const retention = retentionOverview();
  const audit = recentAudit();
  const published = toolRegistry.filter((t) => t.status === "published");
  const broken = toolRegistry.filter((t) => t.status === "disabled" || t.status === "deprecated");
  const seoIssues = toolRegistry.flatMap((tool) => {
    const issues: string[] = [];
    const en = tool.copy.en;
    if (!en.title) issues.push("missing title");
    if (!en.description) issues.push("missing description");
    if (!en.h1) issues.push("missing h1");
    if (!tool.processingMode) issues.push("missing processingMode");
    if (tool.status !== "published") issues.push(tool.status);
    return issues.length ? [{ id: tool.id, issues }] : [];
  });
  const requiredKeys = Object.keys(messages.en).length + Object.keys(extras.en).length;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Freela admin</h1>
          <p className="text-sm text-muted-foreground">
            {user.email} · role {user.role} (owner, admin, editor, analyst)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Public contact for all questions: <a className="font-medium text-primary" href="mailto:tools@freela.store">tools@freela.store</a>
          </p>
          {stats.storage === "none" ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Usage counters are empty on this host: analytics SQLite is ephemeral or unavailable on serverless. Login still works.
            </p>
          ) : null}
        </div>
        <form action={logoutAction}>
          <button className="rounded-lg border px-3 py-1.5 text-sm" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {["today", "7d", "30d", "90d"].map((r) => (
          <a key={r} href={`/admin?range=${r}`} className={`rounded-full border px-3 py-1 ${range === r ? "bg-primary text-primary-foreground" : ""}`}>
            {r}
          </a>
        ))}
        <a className="rounded-full border px-3 py-1" href={`/api/admin/export?range=${range}`}>
          Export CSV
        </a>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <Card label="Visits" value={stats.visits} />
        <Card label="Sessions" value={stats.uniqueSessions} />
        <Card label="Opens" value={stats.opens} />
        <Card label="Starts" value={stats.starts} />
        <Card label="Success" value={stats.completions} />
        <Card label="Errors" value={stats.errors} />
        <Card label="Downloads" value={stats.downloads} />
        <Card label="Searches" value={stats.searches} />
      </dl>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Top tools by usage</h2>
          <AdminTable
            rows={stats.topTools.map((row) => [row.id, String(row.opens), String(row.completions), String(row.errors)])}
            heads={["Tool", "Opens", "OK", "Err"]}
          />
        </div>
        <div>
          <h2 className="font-semibold">Top by success rate</h2>
          <AdminTable
            rows={stats.bySuccess.map((row) => [row.id, `${Math.round(row.rate * 100)}%`, String(row.starts)])}
            heads={["Tool", "Success", "Starts"]}
          />
        </div>
        <div>
          <h2 className="font-semibold">Top by error rate</h2>
          <AdminTable
            rows={stats.byError.map((row) => [row.id, String(row.errors), String(row.starts)])}
            heads={["Tool", "Errors", "Starts"]}
          />
        </div>
        <div>
          <h2 className="font-semibold">Usage by locale</h2>
          <ul className="mt-3 text-sm">
            {stats.byLocale.map((row) => (
              <li key={row.locale} className="flex justify-between border-b py-2">
                <span>{row.locale}</span>
                <span>
                  {row.opens} opens / {row.success} ok
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-semibold">Usage trends</h2>
        <ul className="mt-3 grid gap-1">
          {stats.byDay.map((row) => (
            <li key={row.day} className="flex items-center gap-3 text-sm">
              <span className="w-28 text-muted-foreground">{row.day}</span>
              <span className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, row.n)}%` }} />
              <span>{row.n}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Traffic sources (referrer host)</h2>
          <ul className="mt-3 text-sm">
            {stats.sources.map((row) => (
              <li key={row.source} className="flex justify-between border-b py-2">
                <span>{row.source}</span>
                <span>{row.n}</span>
              </li>
            ))}
            {stats.sources.length === 0 ? <li>No referrer hosts in this range.</li> : null}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Processing modes</h2>
          <ul className="mt-3 text-sm">
            <li>LOCAL_ONLY: {modes.LOCAL_ONLY}</li>
            <li>SERVER_PROCESSING: {modes.SERVER_PROCESSING}</li>
            <li>THIRD_PARTY_PROCESSING: {modes.THIRD_PARTY_PROCESSING}</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">Vendors enabled: {retention.vendors.filter((v) => v.enabled).length}</p>
        </div>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Translation completeness</h2>
          <p className="text-sm text-muted-foreground">UI keys required: {requiredKeys}. Prepared locales (no URLs): {PREPARED_LOCALES.length}.</p>
          <ul className="mt-3 text-sm">
            {translations.map((row) => (
              <li key={row.locale} className="flex justify-between border-b py-2">
                <span>
                  {row.name} ({row.locale})
                </span>
                <span>
                  {row.uiKeys}/{row.required} UI · {row.toolsWithCopy}/{row.toolsTotal} tools ·{" "}
                  {row.reviewed ? "reviewed" : "draft / noindex"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">SEO health</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {toolRegistry.length} registry tools · {published.length} published · sitemap includes English only until other locales pass QA.
          </p>
          <ul className="mt-3 max-h-64 overflow-auto text-sm">
            {seoIssues.slice(0, 20).map((row) => (
              <li key={row.id}>
                {row.id}: {row.issues.join(", ")}
              </li>
            ))}
            {seoIssues.length === 0 ? <li>No missing title/description/H1 on published English copy.</li> : null}
          </ul>
        </div>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Tool health</h2>
          <p className="text-sm text-muted-foreground">Disabled/deprecated: {broken.length}. Published: {published.length}.</p>
          <ul className="mt-3 columns-2 text-sm">
            {toolRegistry.map((tool) => (
              <li key={tool.id}>
                {tool.id} · {tool.status} · {tool.processingMode}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Data retention</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {retention.inventory.map((row) => (
              <li key={row.data}>
                <strong className="text-foreground">{row.data}</strong> — {row.retention}. {row.deletion}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-semibold">Audit log</h2>
        <ul className="mt-3 max-h-64 overflow-auto text-sm">
          {audit.map((row) => (
            <li key={row.id} className="border-b py-2">
              {row.created_at} · {row.action} · {row.entity} {row.entity_id ?? ""} {row.details ?? ""}
            </li>
          ))}
          {audit.length === 0 ? <li>No audit rows yet.</li> : null}
        </ul>
      </section>
      <p className="mt-8 text-xs text-muted-foreground">
        Routed locales: {INITIAL_LOCALES.join(", ")}. Indexable:{" "}
        {INITIAL_LOCALES.filter((c) => localeRegistry[c].indexable).join(", ") || "none"}.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function AdminTable({ heads, rows }: { heads: string[]; rows: string[][] }) {
  return (
    <table className="mt-3 w-full text-left text-sm">
      <thead>
        <tr className="border-b">
          {heads.map((h) => (
            <th key={h} className="py-2">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")} className="border-b">
            {row.map((cell, i) => (
              <td key={i} className="py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
