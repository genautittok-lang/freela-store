import { expansionReport } from "../src/lib/catalog-expansion";

const report = expansionReport();
console.log(`Published: ${report.published}`);
console.log(`Deferred: ${report.deferred.map((d) => d.id).join(", ") || "(none in pool)"}`);
console.log("Top missing LOCAL_ONLY candidates:");
for (const row of report.missingCandidates.slice(0, 20)) {
  console.log(`  ${row.score.toFixed(1)} ${row.id} (${row.category}) — ${row.reason}`);
}
