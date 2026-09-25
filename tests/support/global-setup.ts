import type { TestProject } from "vitest/node";
import { createMigratedDatabase } from "./ephemeral-db";

declare module "vitest" {
  export interface ProvidedContext {
    templateDbFile: string;
  }
}

// Migrates one template database per test run; every test file gets its own
// copy (see setup-env.ts), so files never share rows.
export default function setup(project: TestProject) {
  const db = createMigratedDatabase();
  project.provide("templateDbFile", db.file);
  return db.dispose;
}
