import { afterEach, describe, expect, it } from "vitest";
import { isServerlessRuntime, resetDbForTests, resolveDatabasePath, tryGetDb } from "./db";

describe("admin sqlite path", () => {
  afterEach(() => {
    delete process.env.VERCEL;
    delete process.env.DATABASE_PATH;
    resetDbForTests();
  });

  it("uses /tmp on Vercel when DATABASE_PATH is unset", () => {
    process.env.VERCEL = "1";
    expect(isServerlessRuntime()).toBe(true);
    expect(resolveDatabasePath()).toBe("/tmp/freela.db");
  });

  it("honors DATABASE_PATH", () => {
    process.env.DATABASE_PATH = "/tmp/custom-freela.db";
    expect(resolveDatabasePath()).toBe("/tmp/custom-freela.db");
  });

  it("opens sqlite without throwing", () => {
    process.env.DATABASE_PATH = ":memory:";
    resetDbForTests();
    const db = tryGetDb();
    expect(db).not.toBeNull();
    db!.prepare("INSERT INTO events (name, session_id, created_at) VALUES (?, ?, ?)").run(
      "page_view",
      "s1",
      new Date().toISOString(),
    );
    const n = db!.prepare("SELECT COUNT(*) as n FROM events").get() as { n: number };
    expect(n.n).toBe(1);
  });
});
