import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { analyticsSummary } from "@/lib/analytics";
import { toolRegistry } from "@/data/tools";
import { INITIAL_LOCALES, localeRegistry } from "@/data/locales";
import { logoutAction } from "./actions";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin · Freela",
};

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const { range = "7d" } = await searchParams;
  const stats = analyticsSummary(range);
  const missing = INITIAL_LOCALES.flatMap((locale) =>
    localeRegistry[locale].translationReviewed
      ? []
      : [{ locale, reason: "Locale translation not QA-reviewed" }],
  );
  const seoIssues = toolRegistry.flatMap((tool) => {
    const issues: string[] = [];
    const en = tool.copy.en;
    if (!en.title) issues.push("missing title");
    if (!en.description) issues.push("missing description");
    if (!en.h1) issues.push("missing h1");
    if (tool.status !== "published") issues.push(tool.status);
    return issues.length ? [{ id: tool.id, issues }] : [];
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Freela admin</h1>
          <p className="text-sm text-muted-foreground">
            {user.email} · {user.role}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="rounded-lg border px-3 py-1.5 text-sm" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className="mt-4 flex gap-2 text-sm">
        {["today", "7d", "30d", "90d"].map((r) => (
          <a key={r} href={`/admin?range=${r}`} className={`rounded-full border px-3 py-1 ${range === r ? "bg-foreground text-background" : ""}`}>
            {r}
          </a>
        ))}
        <a className="rounded-full border px-3 py-1" href={`/api/admin/export?range=${range}`}>
          Export CSV
        </a>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card label="Visits" value={stats.visits} />
        <Card label="Tool opens" value={stats.opens} />
        <Card label="Completions" value={stats.completions} />
        <Card label="Errors" value={stats.errors} />
        <Card label="Downloads" value={stats.downloads} />
        <Card label="Sessions" value={stats.uniqueSessions} />
      </dl>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Top tools</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Tool</th>
                <th>Opens</th>
                <th>OK</th>
                <th>Err</th>
              </tr>
            </thead>
            <tbody>
              {stats.topTools.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2">{row.id}</td>
                  <td>{row.opens}</td>
                  <td>{row.completions}</td>
                  <td>{row.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="font-semibold">Usage by language</h2>
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
        <h2 className="font-semibold">Usage over time</h2>
        <ul className="mt-3 grid gap-1">
          {stats.byDay.map((row) => (
            <li key={row.day} className="flex items-center gap-3 text-sm">
              <span className="w-28 text-muted-foreground">{row.day}</span>
              <span className="h-2 rounded bg-foreground" style={{ width: `${Math.min(100, row.n)}%` }} />
              <span>{row.n}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold">Translation QA</h2>
          <ul className="mt-3 text-sm">
            {INITIAL_LOCALES.map((locale) => (
              <li key={locale} className="flex justify-between border-b py-2">
                <span>
                  {localeRegistry[locale].nativeName} ({locale})
                </span>
                <span>{localeRegistry[locale].translationReviewed ? "reviewed" : "machine draft / noindex"}</span>
              </li>
            ))}
          </ul>
          {missing.length ? <p className="mt-2 text-amber-800">Publish indexable locales only after QA.</p> : null}
        </div>
        <div>
          <h2 className="font-semibold">SEO health</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {toolRegistry.length} registry tools · {toolRegistry.filter((t) => t.status === "published").length} published ·
            sitemap includes English only until other locales pass QA.
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
      <section className="mt-10">
        <h2 className="font-semibold">Errors by tool</h2>
        <ul className="mt-3 text-sm">
          {stats.errorTools.map((row) => (
            <li key={row.id} className="flex justify-between border-b py-2">
              <span>{row.id}</span>
              <span>{row.n}</span>
            </li>
          ))}
          {stats.errorTools.length === 0 ? <li>No errors in this range.</li> : null}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-semibold">Registry</h2>
        <p className="text-sm text-muted-foreground">Statuses live in the tool registry. Overrides can be added in SQLite.</p>
        <ul className="mt-3 columns-2 text-sm sm:columns-3">
          {toolRegistry.map((tool) => (
            <li key={tool.id}>
              {tool.id} · {tool.status}
            </li>
          ))}
        </ul>
      </section>
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
