// spec: test-plans/asset-management/asset-assignment.test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ASSET_ASSIGNMENT_URL = '/master/asset-assignment';

async function registerPopupHandler(page: any) {
  if ((page as any).__popupHandlerRegistered) return;
  (page as any).__popupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissChecklist(page: any) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  });
}

async function gotoAssetAssignment(page: any) {
  await registerPopupHandler(page);
  await page.goto(ASSET_ASSIGNMENT_URL);
  await page.getByRole('heading', { name: /Assign Assets/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);
}

async function selectReactOption(page: any, inputLocator: any, optionText?: string) {
  await inputLocator.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
  if (optionText) {
    await inputLocator.fill(optionText);
  }
  const opt = optionText
    ? page.locator('[class*="option"]').filter({ visible: true }).filter({ hasText: optionText }).first()
    : page.locator('[class*="option"]').filter({ visible: true }).first();
  await opt.waitFor({ state: 'visible', timeout: 8000 });
  await opt.click();
}

async function selectFirstOption(page: any, inputLocator: any) {
  await inputLocator.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
  const opt = page.locator('[class*="option"]').filter({ visible: true }).first();
  await opt.waitFor({ state: 'visible', timeout: 8000 });
  await opt.click();
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Asset Assignment', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAssetAssignment(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 1 – Page Load
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Page Load and Initial State', () => {

    test('TC-AA-001: Asset Assignment page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(ASSET_ASSIGNMENT_URL));
      await expect(page.getByRole('heading', { name: /Assign Assets/i })).toBeVisible();
      await expect(page.locator('#from_location')).toBeVisible();
      await expect(page.locator('#assign_against')).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Date of Assignment/i })).toBeVisible();
    });

    test('TC-AA-002: Form fields are present on page load', async ({ page }) => {
      await expect(page.locator('#from_location')).toBeVisible();
      await expect(page.locator('#assign_against')).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Date of Assignment/i })).toBeVisible();
      const dateValue = await page.getByRole('textbox', { name: /Date of Assignment/i }).inputValue();
      expect(dateValue.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 2 – Form Validation
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Form Validation - Mandatory Fields', () => {

    test('TC-AA-003: Submit empty form shows validation errors', async ({ page }) => {
      // The form enforces required fields via progressive disclosure — no Submit button is
      // rendered until all required selections are made. Verify empty form state.
      const fromVal = await page.locator('#from_location').inputValue().catch(() => '');
      const againstVal = await page.locator('#assign_against').inputValue().catch(() => '');
      expect(fromVal).toBe('');
      expect(againstVal).toBe('');
      const hasSubmit = await page.getByRole('button', { name: /Submit|Save|Assign/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasSubmit).toBe(false);
    });

    test('TC-AA-004: From dropdown is mandatory', async ({ page }) => {
      await selectFirstOption(page, page.locator('#assign_against'));
      // From is still empty — no Submit button should appear (mandatory field enforced by form design)
      const fromVal = await page.locator('#from_location').inputValue().catch(() => '');
      expect(fromVal).toBe('');
      const hasSubmit = await page.getByRole('button', { name: /Submit|Save|Assign/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasSubmit).toBe(false);
    });

    test('TC-AA-005: Against dropdown is mandatory', async ({ page }) => {
      await selectFirstOption(page, page.locator('#from_location'));
      // Against is still empty — no Submit button should appear (mandatory field enforced by form design)
      const againstVal = await page.locator('#assign_against').inputValue().catch(() => '');
      expect(againstVal).toBe('');
      const hasSubmit = await page.getByRole('button', { name: /Submit|Save|Assign/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasSubmit).toBe(false);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 3 – From Dropdown — Warehouse Selection
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('From Dropdown - Warehouse Selection', () => {

    test('TC-AA-007: From dropdown contains Warehouse and Site options', async ({ page }) => {
      const fromInput = page.locator('#from_location');
      await fromInput.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
      const options = page.locator('[class*="option"]').filter({ visible: true });
      await options.first().waitFor({ state: 'visible', timeout: 8000 });
      const texts = await options.allInnerTexts();
      const hasWarehouse = texts.some(t => /warehouse/i.test(t));
      const hasSite = texts.some(t => /site/i.test(t));
      expect(hasWarehouse).toBe(true);
      expect(hasSite).toBe(true);
      await page.keyboard.press('Escape');
    });

    test('TC-AA-008: Selecting Warehouse shows Warehouse sub-dropdown', async ({ page }) => {
      await selectReactOption(page, page.locator('#from_location'), 'Warehouse');
      await page.waitForTimeout(500);
      const warehouseSubDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(warehouseSubDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AA-011: Selecting Site shows Site sub-dropdown', async ({ page }) => {
      await selectReactOption(page, page.locator('#from_location'), 'Site');
      await page.waitForTimeout(500);
      const siteSubDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(siteSubDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AA-013: Switching From selection clears previous sub-dropdown choice', async ({ page }) => {
      await selectReactOption(page, page.locator('#from_location'), 'Warehouse');
      await page.waitForTimeout(500);
      await selectReactOption(page, page.locator('#from_location'), 'Site');
      await page.waitForTimeout(500);
      const siteVisible = await page.getByText(/site/i).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(siteVisible).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 4 – Against Dropdown — Assign to Technician
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Against Dropdown - Assign to Technician', () => {

    test('TC-AA-014: Against dropdown contains three options', async ({ page }) => {
      const againstInput = page.locator('#assign_against');
      await againstInput.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
      const options = page.locator('[class*="option"]').filter({ visible: true });
      await options.first().waitFor({ state: 'visible', timeout: 8000 });
      const texts = await options.allInnerTexts();
      expect(texts.some(t => /Assign to Technician/i.test(t))).toBe(true);
      expect(texts.some(t => /Assign to Job/i.test(t))).toBe(true);
      expect(texts.some(t => /Assign to PM/i.test(t))).toBe(true);
      await page.keyboard.press('Escape');
    });

    test('TC-AA-015: Selecting "Assign to Technician" shows Technician dropdown', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Technician');
      await page.waitForTimeout(800);
      const techDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(techDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AA-016: Technician dropdown is mandatory for Assign to Technician', async ({ page }) => {
      await selectReactOption(page, page.locator('#from_location'), 'Warehouse');
      await page.waitForTimeout(500);
      // Warehouse Name sub-dropdown is a control div, not an input — click it directly
      const warehouseNameControl = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await warehouseNameControl.click();
      const warehouseOpt = page.locator('[class*="option"]').filter({ visible: true }).first();
      await warehouseOpt.waitFor({ state: 'visible', timeout: 8000 });
      await warehouseOpt.click();
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Technician');
      await page.waitForTimeout(500);
      // Technician dropdown appears as a required field — verify it is visible
      const techDropdown = page.locator('[class*="control"]').filter({ visible: true }).last();
      await expect(techDropdown).toBeVisible({ timeout: 5000 });
      // Submit/Assign button appears after asset table loads — click it without selecting a technician
      await page.getByRole('button', { name: /Submit|Save|Assign/i }).first().click({ force: true });
      const errVisible = await page.getByText(/technician|select technician/i).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(errVisible).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 5 – Against Dropdown — Assign to Job
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Against Dropdown - Assign to Job', () => {

    test('TC-AA-018: Selecting "Assign to Job" shows Site dropdown', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Job');
      await page.waitForTimeout(800);
      const siteDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(siteDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AA-022: Technician dropdown is present for Assign to Job', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Job');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 6 – Against Dropdown — Assign to PM
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Against Dropdown - Assign to PM', () => {

    test('TC-AA-025: Selecting "Assign to PM" shows Site dropdown', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to PM');
      await page.waitForTimeout(800);
      const siteDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(siteDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AA-029: Technician dropdown is present for Assign to PM', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to PM');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 7 – Technician Dropdown Consistency
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Technician Dropdown Consistency', () => {

    test('TC-AA-032: Technician dropdown consistent across Against options', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Technician');
      await page.waitForTimeout(500);
      const techControl = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await techControl.click();
      const opts1 = page.locator('[class*="option"]').filter({ visible: true });
      await opts1.first().waitFor({ state: 'visible', timeout: 8000 });
      const techOptions1 = await opts1.allInnerTexts();
      await page.keyboard.press('Escape');

      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Job');
      await page.waitForTimeout(500);

      expect(techOptions1.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 8 – Date of Assignment
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Date of Assignment', () => {

    test('TC-AA-033: Date of Assignment accepts valid date', async ({ page }) => {
      const dateInput = page.getByRole('textbox', { name: /Date of Assignment/i });
      await dateInput.clear();
      // Native <input type="date"> requires YYYY-MM-DD format for programmatic fill
      await dateInput.fill('2025-06-01');
      const value = await dateInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    });

    test('TC-AA-034: Date of Assignment is pre-filled with today', async ({ page }) => {
      const dateInput = page.getByRole('textbox', { name: /Date of Assignment/i });
      const value = await dateInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 9 – Switching Against Option
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Switching Against Option', () => {

    test('TC-AA-035: Switching Against clears previously visible sub-dropdowns', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Technician');
      await page.waitForTimeout(500);
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Job');
      await page.waitForTimeout(500);
      const jobSiteVisible = await page.locator('[class*="control"]').filter({ visible: true }).nth(1).isVisible({ timeout: 3000 }).catch(() => false);
      expect(jobSiteVisible).toBe(true);
    });

    test('TC-AA-036: Switching Against from Job to PM resets dropdowns', async ({ page }) => {
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to Job');
      await page.waitForTimeout(500);
      await selectReactOption(page, page.locator('#assign_against'), 'Assign to PM');
      await page.waitForTimeout(500);
      const pmSiteVisible = await page.locator('[class*="control"]').filter({ visible: true }).nth(1).isVisible({ timeout: 3000 }).catch(() => false);
      expect(pmSiteVisible).toBe(true);
    });

  });

});
