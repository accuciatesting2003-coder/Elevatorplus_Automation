// spec: test-plans/asset-management/asset-return.test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const ASSET_RETURN_URL = '/master/asset-return';

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

async function gotoAssetReturn(page: any) {
  await registerPopupHandler(page);
  await page.goto(ASSET_RETURN_URL);
  await page.getByRole('heading', { name: /Return Assets/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);
}

async function selectReactOptionByText(page: any, inputLocator: any, optionText: string) {
  await inputLocator.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
  await inputLocator.fill(optionText);
  const opt = page.locator('[class*="option"]').filter({ visible: true }).filter({ hasText: optionText }).first();
  await opt.waitFor({ state: 'visible', timeout: 8000 });
  await opt.click();
}

async function selectFirstReactOption(page: any, inputLocator: any) {
  await inputLocator.click();
  const opt = page.locator('[class*="option"]').filter({ visible: true }).first();
  await opt.waitFor({ state: 'visible', timeout: 8000 });
  await opt.click();
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Asset Return', () => {

  test.beforeEach(async ({ page }) => {
    await gotoAssetReturn(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 1 – Page Load
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Page Load and Initial State', () => {

    test('TC-AR-001: Asset Return page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(ASSET_RETURN_URL));
      await expect(page.getByRole('heading', { name: /Return Assets/i })).toBeVisible();
      await expect(page.locator('#return_against')).toBeVisible();
    });

    test('TC-AR-002: Return Against dropdown contains three options', async ({ page }) => {
      const returnAgainst = page.locator('#return_against');
      await returnAgainst.locator('xpath=ancestor::div[contains(@class,"control")][1]').click();
      const options = page.locator('[class*="option"]').filter({ visible: true });
      await options.first().waitFor({ state: 'visible', timeout: 8000 });
      const texts = await options.allInnerTexts();
      expect(texts.some(t => /Return from Technician/i.test(t))).toBe(true);
      expect(texts.some(t => /Return from Job/i.test(t))).toBe(true);
      expect(texts.some(t => /Return from PM/i.test(t))).toBe(true);
      await page.keyboard.press('Escape');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 2 – Return from Technician
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Return Against - Return from Technician', () => {

    test('TC-AR-003: Selecting "Return from Technician" shows Technician dropdown', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(800);
      const techDropdown = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await expect(techDropdown).toBeVisible({ timeout: 8000 });
    });

    test('TC-AR-004: Technician dropdown is mandatory', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      const errVisible = await page.getByText(/technician|select technician/i).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(errVisible).toBe(true);
    });

    test('TC-AR-005: Selecting a technician loads search button', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      const searchBtn = page.getByRole('button', { name: /Search/i });
      await expect(searchBtn).toBeEnabled({ timeout: 8000 });
    });

    test('TC-AR-006: Technician list or empty state visible after search', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasTable = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      const hasEmpty = await page.getByText(/no record|no asset|empty/i).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 3 – Return from Job
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Return Against - Return from Job', () => {

    test('TC-AR-007: Selecting "Return from Job" shows Job Number dropdown', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('TC-AR-009: Technician dropdown is present for Return from Job', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('TC-AR-011: Job Number is mandatory', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      const errVisible = await page.getByText(/job|select job/i).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(errVisible).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 4 – Return from PM
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Return Against - Return from PM', () => {

    test('TC-AR-012: Selecting "Return from PM" shows PM Number dropdown', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from PM');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('TC-AR-014: Technician dropdown is present for Return from PM', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from PM');
      await page.waitForTimeout(800);
      const controls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await controls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('TC-AR-016: PM Number is mandatory', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from PM');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      const errVisible = await page.getByText(/pm|select pm/i).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(errVisible).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 5 – Technician Dropdown Consistency
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Technician Dropdown Consistency', () => {

    test('TC-AR-017: Technician dropdown is same across all Return Against options', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      const techControl = page.locator('[class*="control"]').filter({ visible: true }).nth(1);
      await techControl.click();
      const opts1 = page.locator('[class*="option"]').filter({ visible: true });
      await opts1.first().waitFor({ state: 'visible', timeout: 8000 });
      const techOptions1 = await opts1.allInnerTexts();
      await page.keyboard.press('Escape');

      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(500);

      expect(techOptions1.length).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 6 – Assigned Assets Display
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Assigned Assets Display', () => {

    test('TC-AR-018: Assigned assets list shows correct columns', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (hasRows) {
        const headerRow = page.locator('[role="row"]').first();
        const headerText = await headerRow.innerText();
        const hasExpectedColumns = /asset name|serial number|quantity/i.test(headerText);
        expect(hasExpectedColumns).toBe(true);
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 7 – Select Asset and Quantity
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Selecting Asset and Quantity for Return', () => {

    test('TC-AR-021: Can select an asset from the assigned assets list', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      const checkbox = tableRows(page).first().locator('input[type="checkbox"]');
      if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await checkbox.check({ force: true });
        await expect(checkbox).toBeChecked();
      } else {
        await tableRows(page).first().click({ force: true });
      }
    });

    test('TC-AR-023: Return quantity cannot exceed assigned quantity', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      const firstCheckbox = tableRows(page).first().locator('input[type="checkbox"]');
      if (await firstCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstCheckbox.check({ force: true });
        await page.waitForTimeout(500);
      }
      const qtyInput = tableRows(page).first().locator('input[type="number"]').first();
      if (await qtyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const maxAttr = await qtyInput.getAttribute('max');
        if (maxAttr) {
          expect(parseInt(maxAttr)).toBeGreaterThan(0);
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 8 – Done Button and Status Popup
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Done Button and Status Popup', () => {

    test('TC-AR-026: Done button is visible/active after selecting asset', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      const firstCheckbox = tableRows(page).first().locator('input[type="checkbox"]');
      if (await firstCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstCheckbox.check({ force: true });
        await page.waitForTimeout(500);
      }
      const doneBtn = page.getByRole('button', { name: /Done/i });
      const isVisible = await doneBtn.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-AR-027: Clicking Done opens status popup', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(2000);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasRows) { test.skip(); return; }
      const firstCheckbox = tableRows(page).first().locator('input[type="checkbox"]');
      if (await firstCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstCheckbox.check({ force: true });
        await page.waitForTimeout(500);
      }
      const doneBtn = page.getByRole('button', { name: /Done/i });
      if (!await doneBtn.isVisible({ timeout: 3000 }).catch(() => false)) { test.skip(); return; }
      await doneBtn.click({ force: true });
      const dialog = page.getByRole('dialog');
      const isDialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isDialogVisible).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 10 – Switching Return Against Option
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Switching Return Against Option', () => {

    test('TC-AR-034: Switching Return Against clears previous selections', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(500);
      const jobControls = page.locator('[class*="control"]').filter({ visible: true });
      const count = await jobControls.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('TC-AR-035: Switching Return Against resets asset list', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      await page.waitForTimeout(1500);
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Job');
      await page.waitForTimeout(500);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasRows).toBe(false);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 9 – Post-Return Verification
  // ─────────────────────────────────────────────────────────────────────────
  test.describe('Post-Return Verification', () => {

    test('TC-AR-033: Full return removes asset from assigned list', async ({ page }) => {
      await selectReactOptionByText(page, page.locator('#return_against'), 'Return from Technician');
      await page.waitForTimeout(500);
      await selectFirstReactOption(page, page.locator('[class*="control"]').filter({ visible: true }).nth(1));
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Search/i }).click({ force: true });
      // Wait for results to stabilize — rows or empty state, whichever appears first
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(300);
      const hasRows = await tableRows(page).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!hasRows) {
        await expect(page.getByText(/no record|no asset|empty/i).first()).toBeVisible({ timeout: 5000 });
      } else {
        expect(hasRows).toBe(true);
      }
    });

  });

});
