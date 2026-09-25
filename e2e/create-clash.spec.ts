import { expect, test } from "@playwright/test";
import { E2E_USER } from "./support/credentials";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The value format of <input type="datetime-local">, in the browser's timezone. */
function datetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Critical path: a logged-in host publishes a Clash. Covers login, the create
// form, the domain rule "start must be in the future", the write to the
// database and the redirect to the freshly rendered Clash page.
test("host creates a clash: a past start is refused, a future start is published", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(E2E_USER.username);
  await page.getByLabel("Password").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/clashes/new");
  await page.getByLabel("Title").fill("E2E Yoga");
  await page.getByLabel("Latitude").fill("52.52");
  await page.getByLabel("Longitude").fill("13.405");

  // A start in the past is refused: the form shows an error and stays put.
  await page
    .getByLabel("Start", { exact: true })
    .fill(datetimeLocal(new Date(Date.now() - 3 * DAY_MS)));
  await page.getByRole("button", { name: "Create Clash" }).click();
  // Waiting for the error (not just checking the URL) keeps this from passing
  // in the instant before a wrongly accepted submit redirects away.
  await expect(page.locator("form p.text-destructive").first()).toBeVisible();
  await expect(page).toHaveURL(/\/clashes\/new$/);

  // A start in the future is accepted and lands on the new Clash's page.
  await page
    .getByLabel("Start", { exact: true })
    .fill(datetimeLocal(new Date(Date.now() + 3 * DAY_MS)));
  await page.getByRole("button", { name: "Create Clash" }).click();
  await expect(page).toHaveURL(/\/clashes\/(?!new$)[^/]+$/);
  await expect(page.getByRole("heading", { name: "E2E Yoga" })).toBeVisible();
});
