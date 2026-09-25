import { randomUUID } from "node:crypto";
import { copyFileSync } from "node:fs";
import path from "node:path";
import { inject } from "vitest";

// Runs before each test file's imports, so lib/prisma.ts (which reads
// DATABASE_URL on import) always opens this file's private copy.
const template = inject("templateDbFile");
const own = path.join(path.dirname(template), `${randomUUID()}.db`);
copyFileSync(template, own);

process.env.DATABASE_URL = `file:${own}`;
process.env.SESSION_SECRET = "test-only-session-secret";
