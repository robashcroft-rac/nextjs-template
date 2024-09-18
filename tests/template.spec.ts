import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    //ensure localstorage is cleared before each test
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.clear();
    });
    console.log(process.env.NEXT_PUBLIC_API_KEY);
  });

  test("Page has header home icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: "RAC Logo" })).toBeVisible();
  });

  test("Page has footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("This website is created by")).toBeVisible();
  });
});
