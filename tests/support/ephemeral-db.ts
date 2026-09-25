import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export type EphemeralDb = {
  /** Temp directory owning the database file(s); safe to delete as a whole. */
  dir: string;
  /** Absolute path of the migrated SQLite file. */
  file: string;
  /** Value for DATABASE_URL. */
  url: string;
  dispose: () => void;
};

/**
 * Creates a fresh SQLite file in the OS temp dir and applies every migration
 * from prisma/migrations to it. It never touches the development database:
 * DATABASE_URL is overridden for the child process only.
 */
export function createMigratedDatabase(): EphemeralDb {
  const dir = mkdtempSync(path.join(realpathSync(tmpdir()), "clash-test-"));
  const file = path.join(dir, "template.db");
  const url = `file:${file}`;

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  return {
    dir,
    file,
    url,
    dispose: () => rmSync(dir, { recursive: true, force: true }),
  };
}
