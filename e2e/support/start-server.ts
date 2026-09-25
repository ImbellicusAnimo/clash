import { spawn } from "node:child_process";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../lib/generated/prisma/client";
import { createMigratedDatabase } from "../../tests/support/ephemeral-db";
import { E2E_USER } from "./credentials";

// Started by Playwright (see playwright.config.ts): builds a throw-away
// database, seeds the test account and serves the production build on top of
// it. Requires a prior `next build`. Never touches the development database.
const PORT = process.env.E2E_PORT ?? "3100";

async function main() {
  const db = createMigratedDatabase();

  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: db.url }),
  });
  await prisma.user.create({
    data: {
      username: E2E_USER.username,
      name: E2E_USER.name,
      passwordHash: await bcrypt.hash(E2E_USER.password, 10),
    },
  });
  await prisma.$disconnect();

  const server = spawn("npx", ["next", "start", "-p", PORT], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: db.url,
      SESSION_SECRET: "e2e-only-session-secret",
    },
  });

  const stop = () => server.kill("SIGTERM");
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  server.on("exit", (code) => {
    db.dispose();
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
