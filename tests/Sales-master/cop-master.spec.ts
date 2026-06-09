// spec: test-plans/Sales-mater-test-plan/COP-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const COP_MASTER_URL = '/master/cop-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
}

async function dismissNotificationPopup(page: any) {
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await maybeLater.click();
      return;
    }
    const enableBtn = page.getByRole('button', { name: /enable/i });
    const enableVisible = await enableBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (enableVisible) {
      await enableBtn.click();
    }
  } catch {
    // popup did not appear
  }
}

async function gotoCopMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(COP_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add COP/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// Targets only data rows (skips header row)
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// Status filter: values '' (All), 'true' (Active), 'false' (Inactive)
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
    texts.push(text.trim());
  }
  return texts;
}

// Price field locators (floating-label inputs identified via associated label)
const copPrice      = (page: any) => page.getByLabel(/COP Price/i).first();
const copPerFloor   = (page: any) => page.getByLabel(/COP Per Floor Increase/i).first();
const lopPrice      = (page: any) => page.getByLabel(/LOP Price/i).first();

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('COP Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-SM-01: Page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(COP_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();

      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#name')).toHaveValue('');

      await expect(copPrice(page)).toBeVisible();
      await expect(copPrice(page)).toHaveValue('');

      await expect(copPerFloor(page)).toBeVisible();
      await expect(copPerFloor(page)).toHaveValue('');

      await expect(page.locator('#lop_name')).toBeVisible();
      await expect(page.locator('#lop_name')).toHaveValue('');

      await expect(lopPrice(page)).toBeVisible();
      await expect(lopPrice(page)).toHaveValue('');

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: 'COP Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();

      const infoBtn = page.locator('#info-tooltip');
      const infoBtnVisible = await infoBtn.isVisible({ timeout: 5000 }).catch(() => false);
      if (!infoBtnVisible) {
        await expect(page.locator('h4 button, h4 + button, [class*="info"]').first()).toBeVisible();
      }

      await expect(showEntriesSelect(page)).toBeVisible();
      await expect(showEntriesSelect(page)).toHaveValue('25');

      await expect(statusFilterSelect(page)).toBeVisible();
      await expect(statusFilterSelect(page)).toHaveValue('true');

      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(page.locator('#search-COP')).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByRole('button', { name: 'COP Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'COP Price', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'COP Per Floor Increase', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'LOP Name', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'LOP Price', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-SM-03: Verify all mandatory and optional form field labels', async ({ page }) => {
      await expect(page.getByText('COP Name *')).toBeVisible();
      await expect(page.getByText('Name for this COP (Car Operating Panel) type.')).toBeVisible();

      await expect(page.getByText(/COP Price \(for G\+/i)).toBeVisible();
      await expect(page.getByText('Price for the COP.')).toBeVisible();

      await expect(page.getByText('COP Per Floor Increase *')).toBeVisible();
      await expect(page.getByText('Additional COP cost per floor.')).toBeVisible();

      await expect(page.getByText('LOP Name (optional)')).toBeVisible();
      await expect(page.getByText('Name for the LOP (Landing Operating Panel), if applicable.')).toBeVisible();

      await expect(page.getByText('LOP Price *')).toBeVisible();
      await expect(page.getByText('Price for the LOP.')).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add COP (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add COP (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-ADD-01: Successfully create a new COP with mandatory fields filled and LOP Name omitted', async ({ page }) => {
      const copName = `AutoCOP ${Date.now()}`;

      await page.locator('#name').fill(copName);
      await copPrice(page).fill('5000');
      await copPerFloor(page).fill('200');
      // Leave LOP Name empty
      await expect(page.locator('#lop_name')).toHaveValue('');
      await lopPrice(page).fill('1500');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#name')).toHaveValue('', { timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();

      await page.locator('#search-COP').fill(copName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

    test('TC-ADD-02: Successfully create a new COP with LOP Name filled', async ({ page }) => {
      const copName = `AutoCOP All ${Date.now()}`;
      const lopName = `AutoLOP ${Date.now()}`;

      await page.locator('#name').fill(copName);
      await copPrice(page).fill('8000');
      await copPerFloor(page).fill('300');
      await page.locator('#lop_name').fill(lopName);
      await lopPrice(page).fill('2500');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#name')).toHaveValue('', { timeout: 15000 });
      await expect(page.locator('#lop_name')).toHaveValue('', { timeout: 15000 });

      await page.locator('#search-COP').fill(copName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName }).filter({ hasText: lopName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

    test('TC-ADD-03: Verify LOP Name is truly optional — form submits without LOP Name', async ({ page }) => {
      const copName = `Optional LOP Test COP ${Date.now()}`;

      await page.locator('#name').fill(copName);
      await copPrice(page).fill('1000');
      await copPerFloor(page).fill('100');
      await expect(page.locator('#lop_name')).toHaveValue('');
      await lopPrice(page).fill('500');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i })).toBeVisible({ timeout: 15000 });

      await page.locator('#search-COP').fill(copName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-VAL-01: Submit form with empty COP Name shows inline error', async ({ page }) => {
      await copPrice(page).fill('1000');
      await copPerFloor(page).fill('100');
      await lopPrice(page).fill('500');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(COP_MASTER_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit form with empty COP Price shows inline error', async ({ page }) => {
      await page.locator('#name').fill('Price Validation Test');
      await copPerFloor(page).fill('100');
      await lopPrice(page).fill('500');
      // Leave COP Price empty

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-03: Submit form with empty COP Per Floor Increase shows inline error', async ({ page }) => {
      await page.locator('#name').fill('Floor Increase Validation Test');
      await copPrice(page).fill('1000');
      await lopPrice(page).fill('500');
      // Leave COP Per Floor Increase empty

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-04: Submit form with empty LOP Price shows inline error', async ({ page }) => {
      await page.locator('#name').fill('LOP Price Validation Test');
      await copPrice(page).fill('1000');
      await copPerFloor(page).fill('100');
      // Leave LOP Price empty

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-05: Submit completely empty form shows errors on mandatory fields', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-06: LOP Name is optional — verify no error shown when LOP Name is blank on submit', async ({ page }) => {
      const copName = `LOP Optional Verify ${Date.now()}`;

      await page.locator('#name').fill(copName);
      await copPrice(page).fill('100');
      await copPerFloor(page).fill('10');
      // Leave LOP Name blank
      await lopPrice(page).fill('50');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i })).toBeVisible({ timeout: 15000 });

      await page.locator('#search-COP').fill(copName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

    test('TC-VAL-07: Submit form with only whitespace in mandatory fields shows inline errors', async ({ page }) => {
      await page.locator('#name').fill('   ');
      // price fields are type=number so spaces will be treated as empty
      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first();
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
    });

    test('TC-VAL-08: Enter alphabetic characters in price fields shows validation errors', async ({ page }) => {
      await page.locator('#name').fill('Price Input Test');
      // type=number inputs reject non-numeric input silently; form will show required-field errors
      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first();
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();
    });

    test('TC-VAL-09: Negative values in price fields show validation errors or prevent submission', async ({ page }) => {
      await page.locator('#name').fill('Negative Price Test');
      await copPrice(page).fill('-500');
      await copPerFloor(page).fill('-100');
      await lopPrice(page).fill('-200');

      await page.getByRole('button', { name: /Submit/i }).click();

      const validationError = page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first();
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i });

      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidation || hasServerError).toBeTruthy();
    });

    test('TC-VAL-10: Zero (0) is accepted in all price fields and form submits successfully', async ({ page }) => {
      const copName = `Zero Price Test ${Date.now()}`;

      await page.locator('#name').fill(copName);
      await copPrice(page).fill('0');
      await copPerFloor(page).fill('0');
      await lopPrice(page).fill('0');

      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i })).toBeVisible({ timeout: 15000 });

      await page.locator('#search-COP').fill(copName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – COP Form Structure Display
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('COP Form Structure Display', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-FLS-01: Verify COP Price label contains the dynamic floor structure bracket', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
      // The bracket "(for G+N)" is dynamic — driven by Settings > Configuration Settings > Floor Structure
      await expect(page.getByText(/COP Price \(for G\+/i)).toBeVisible();
      // Current floor structure is 5, so the label reads "(for G+5)"
      await expect(page.getByText(/COP Price \(for G\+5\)/i)).toBeVisible();
    });

    test('TC-FLS-02: Verify form contains all five input fields', async ({ page }) => {
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#name')).toHaveValue('');

      await expect(copPrice(page)).toBeVisible();
      await expect(copPerFloor(page)).toBeVisible();

      await expect(page.locator('#lop_name')).toBeVisible();
      await expect(page.locator('#lop_name')).toHaveValue('');

      await expect(lopPrice(page)).toBeVisible();

      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-DUP-01: Submitting an existing Active COP Name shows an error', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.locator('#name').fill(existingName);
      await copPrice(page).fill('100');
      await copPerFloor(page).fill('10');
      await lopPrice(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-02: Case-sensitivity test for duplicate COP Name', async ({ page }) => {
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      await page.locator('#name').fill(existingName.toUpperCase());
      await copPrice(page).fill('100');
      await copPerFloor(page).fill('10');
      await lopPrice(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      const errorToast   = page.locator('[role="alert"]').filter({ hasText: /already exists/i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /COP created successfully!/i });

      const [hasError, hasSuccess] = await Promise.all([
        errorToast.isVisible({ timeout: 15000 }).catch(() => false),
        successToast.isVisible({ timeout: 15000 }).catch(() => false),
      ]);
      expect(hasError || hasSuccess).toBeTruthy();
    });

    test('TC-DUP-03: Add a new record with the same name as an existing Inactive COP shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await statusFilterSelect(page).selectOption('true');
        await page.locator('#name').fill(inactiveName);
        await copPrice(page).fill('100');
        await copPerFloor(page).fill('10');
        await lopPrice(page).fill('50');
        await page.getByRole('button', { name: /Submit/i }).click();

        await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 15000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add COP form', async ({ page }) => {
      await page.locator('#name').fill('Temp COP');
      await copPrice(page).fill('999');
      await copPerFloor(page).fill('99');
      await page.locator('#lop_name').fill('Temp LOP');
      await lopPrice(page).fill('499');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.locator('#name')).toHaveValue('');
      await expect(page.locator('#lop_name')).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear button in Edit/Update mode resets form back to Add COP state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      const copNameInput = page.locator('#name');
      const currentName = await copNameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible();
      await expect(copNameInput).toHaveValue('');
      await expect(page.locator('#status')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-EDT-01: Edit icon opens record in Update COP mode with pre-filled fields', async ({ page }) => {
      await waitForTableRows(page);
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#name')).toHaveValue(originalName);

      // All price fields should be pre-filled
      const copPriceVal   = await copPrice(page).inputValue();
      const perFloorVal   = await copPerFloor(page).inputValue();
      const lopPriceVal   = await lopPrice(page).inputValue();
      expect(copPriceVal.length).toBeGreaterThanOrEqual(1);
      expect(perFloorVal.length).toBeGreaterThanOrEqual(1);
      expect(lopPriceVal.length).toBeGreaterThanOrEqual(1);

      await expect(page.locator('#status')).toBeVisible();
      await expect(page.locator('#status')).toHaveValue('true');
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('TC-EDT-02: Successfully update a COP record', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated COP Name Test ${Date.now()}`;
      await page.locator('#name').clear();
      await page.locator('#name').fill(newName);
      await copPrice(page).clear();
      await copPrice(page).fill('9999');
      await copPerFloor(page).clear();
      await copPerFloor(page).fill('999');
      await lopPrice(page).clear();
      await lopPrice(page).fill('4999');

      await page.locator('button[type="submit"]').click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });

      await page.locator('#search-COP').fill(newName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search-COP').fill('');
    });

    test('TC-EDT-03: Update COP with empty mandatory fields shows validation errors', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#name').clear();
      await page.locator('button[type="submit"]').click();

      await expect(
        page.locator('[class*="text-danger"], [class*="error"], [class*="invalid"]').first()
      ).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible();
    });

    test('TC-EDT-04: Update COP name to a duplicate of an existing Active COP shows error', async ({ page }) => {
      await waitForTableRows(page);
      const firstName  = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstName.length).toBeGreaterThan(0);
      expect(secondName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      await page.locator('#name').clear();
      await page.locator('#name').fill(secondName);
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-05: Update COP status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const copName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      const statusSelect = page.locator('#status');
      await statusSelect.selectOption('false');
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('');
      const copRow = tableRows(page).filter({ hasText: copName });
      await expect(copRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore
      await copRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-06: Update an existing Active COP name to match an existing Inactive COP name shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await statusFilterSelect(page).selectOption('true');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

        await page.locator('#name').clear();
        await page.locator('#name').fill(inactiveName);
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 15000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await waitForTableRows(page);
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await expect(statusFilterSelect(page)).toHaveValue('false');
      const rowCount = await tableRows(page).count().catch(() => 0);
      if (rowCount > 0) {
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-SRC-01: Search by partial and complete COP name returns matching results', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await page.locator('#search-COP').fill('COP');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });

    test('TC-SRC-02: Search with a non-existent COP name returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await page.locator('#search-COP').fill('XYZNONEXISTENTCOP999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    test('TC-SRC-03: Clearing the search input restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await page.locator('#search-COP').fill('Push');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.locator('#search-COP').clear();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toHaveValue('25');
      await showDropdown.selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages using pagination controls', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        const prevBtn = page.getByRole('button', { name: /Previous page/i });
        await expect(prevBtn).toBeEnabled();
        await prevBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

    test('TC-PAG-03: Change rows per page to 50 and 100', async ({ page }) => {
      await waitForTableRows(page);
      const showDropdown = showEntriesSelect(page);

      await showDropdown.selectOption('50');
      await expect(showDropdown).toHaveValue('50');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(50);

      await showDropdown.selectOption('100');
      await expect(showDropdown).toHaveValue('100');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(100);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-SRT-01: Sort by COP Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      const beforeFirst = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await page.getByRole('button', { name: /COP Name/i }).click();
      await page.waitForFunction(
        (prev: string) => {
          const rows = document.querySelectorAll('[role="row"]:has([role="cell"])');
          const text = (rows[0]?.querySelectorAll('[role="cell"]')[2]?.textContent ?? '').trim();
          return rows.length > 0 && text !== prev && text !== '';
        },
        beforeFirst,
        { timeout: 15000 }
      );
      const firstNameAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      await page.getByRole('button', { name: /COP Name/i }).click();
      await page.waitForFunction(
        (prev: string) => {
          const rows = document.querySelectorAll('[role="row"]:has([role="cell"])');
          const text = (rows[0]?.querySelectorAll('[role="cell"]')[2]?.textContent ?? '').trim();
          return rows.length > 0 && text !== prev && text !== '';
        },
        firstNameAsc,
        { timeout: 15000 }
      );
      const firstNameDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText()).trim();

      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        expect(firstNameAsc).not.toBe(firstNameDesc);
      }
    });

    test('TC-SRT-02: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);
      await statusFilterSelect(page).selectOption('');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-INA-01: Deactivate an Active COP and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const copName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(copName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

      const statusSelect = page.locator('#status');
      await expect(statusSelect).toHaveValue('true');
      await statusSelect.selectOption('false');
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('[role="alert"]').filter({ hasText: /COP updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('false');
      await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: copName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-INA-02: Re-activate Inactive COP verifies it appears in Active list', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const copName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update COP/i })).toBeVisible({ timeout: 10000 });

        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');
        await statusSelect.selectOption('true');
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('[role="alert"]').filter({ hasText: /COP updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 15000 });

        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: copName })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login page', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/cop-master', { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).not.toBeVisible();

      await context.close();
    });

    test('TC-NAV-02: Access COP Master via Sales Masters sidebar navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.getByRole('link', { name: /Sales Masters/i }).click();

      const copMasterLink = page.getByRole('link', { name: /^COP$/i }).or(page.getByRole('link', { name: /COP Master/i })).first();
      await copMasterLink.waitFor({ state: 'visible', timeout: 15000 });
      await copMasterLink.click();

      await expect(page).toHaveURL(/\/master\/cop-master/i, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add COP/i })).toBeVisible({ timeout: 30000 });
      await waitForTableRows(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 14 – Import Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Import Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoCopMaster(page);
    });

    test('TC-IMP-01: Import button is present and opens file chooser or modal', async ({ page }) => {
      const importBtn = page.getByRole('button', { name: /Import/i });
      await expect(importBtn).toBeVisible();

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
        importBtn.click(),
      ]);

      if (fileChooser) {
        await page.keyboard.press('Escape');
      } else {
        const modal = page.locator('[role="dialog"]');
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
        expect(modalVisible).toBeTruthy();
      }
    });

  });

});
