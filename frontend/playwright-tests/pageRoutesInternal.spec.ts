import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('Resources Tab Loads', async ({ page }) => {
    await page.goto('/resources', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Health Equity']);
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Methodology Tab Loads', async ({ page }) => {
    await page.goto('/methodology', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Recommended citation (APA) for the Health Equity Tracker:']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Age-Adjustment Tab Loads', async ({ page }) => {
    await page.goto('/ageadjustment', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText(['Calculating Age-Adjusted Ratios']);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('About Us Page / Project Tab Loads', async ({ page }) => {
    await page.goto('/aboutus', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're focused on equitable data.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Our Team Tab Loads', async ({ page }) => {
    await page.goto('/ourteam', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`We're working towards a better tomorrow.`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});

test('Contact Tab Loads', async ({ page }) => {
    await page.goto('/contact', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toContainText([`Let's move`], { useInnerText: true });
    // @ts-ignore
    await expect(page).toPassAxe()
});


test('Terms of Use Page Loads', async ({ page }) => {
    await page.goto('/termsofuse', { waitUntil: "networkidle" });
    const mainHeading = page.locator('#main');
    await expect(mainHeading).toHaveText([`Terms of Use`]);
    // @ts-ignore
    await expect(page).toPassAxe()
});
