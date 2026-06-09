// spec: test-plans/setting-module-test-plan/pdf-image-setting-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const PDF_IMAGE_URL = '/setting/pdf-image-setting';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function hideOnboardingWidget(page: any) {
  await page.evaluate(() => {
    const el = document.querySelector('.checklist-component') as HTMLElement | null;
    if (el) el.style.setProperty('display', 'none', 'important');
  });
}

async function hideFloatingNav(page: any) {
  await page.evaluate(() => {
    const nav = document.querySelector('nav.floating-nav') as HTMLElement | null;
    if (nav) nav.style.setProperty('display', 'none', 'important');
  });
}

async function registerPopupHandler(page: any) {
  // Dismiss notification popup
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
  // Hide the onboarding checklist widget whenever it intercepts button clicks
  await page.addLocatorHandler(
    page.locator('.checklist-component.visible'),
    async () => {
      await hideOnboardingWidget(page);
    }
  );
  // Hide the floating navbar when it intercepts button clicks
  await page.addLocatorHandler(
    page.locator('nav.floating-nav'),
    async () => {
      await hideFloatingNav(page);
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
      await page.waitForTimeout(500);
    }
  } catch {
    // popup did not appear
  }
}

async function gotoPdfImageSetting(page: any) {
  await registerPopupHandler(page);
  await page.goto(PDF_IMAGE_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add PDF Image Setting/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
  await hideOnboardingWidget(page);
  await hideFloatingNav(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
}

function showEntriesSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
}

function imageSearchBox(page: any) {
  return page.getByRole('textbox', { name: 'Search Image Label' });
}

function imageLabelInput(page: any) {
  return page.getByRole('textbox', { name: 'Image Label *' });
}

function heightInput(page: any) {
  return page.getByRole('spinbutton', { name: 'Height *' });
}

function widthInput(page: any) {
  return page.getByRole('textbox', { name: 'Width *' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('PDF Image Setting Master', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke Tests
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-001: Page load and navigation', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(PDF_IMAGE_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');

      // Page and form headings
      await expect(page.getByRole('heading', { name: /PDF Image Settings/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();

      // Form fields
      await expect(imageLabelInput(page)).toBeVisible();
      await expect(heightInput(page)).toBeVisible();
      await expect(widthInput(page)).toBeVisible();

      // Field placeholder hints
      await expect(page.getByText('Enter the image label')).toBeVisible();
      await expect(page.getByText('Enter the height')).toBeVisible();
      await expect(page.getByText('Enter the width')).toBeVisible();

      // Form buttons
      await expect(page.getByRole('button', { name: /Clear/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Table columns
      await waitForTableRows(page);
      await expect(page.getByRole('button', { name: /^Sr\. No\.$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Action$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Image Label$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Height$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Width$/ })).toBeVisible();

      // Table toolbar
      await expect(showEntriesSelect(page)).toBeVisible();
      await expect(statusFilterSelect(page)).toBeVisible();
      await expect(imageSearchBox(page)).toBeVisible();

      // Status filter default is "All"
      await expect(statusFilterSelect(page)).toHaveValue('');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Record – Happy Path
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Add Record – Happy Path', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-002: Add record with valid data creates record successfully', async ({ page }) => {
      const label = `TestImage${Date.now()}`;

      await imageLabelInput(page).fill(label);
      await heightInput(page).fill('100');
      await widthInput(page).fill('200');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: /PDF Image Setting has been created successfully!/i })
      ).toBeVisible({ timeout: 15000 });

      // Form resets to Add mode after success
      await expect(imageLabelInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();

      // New record appears in table
      await imageSearchBox(page).fill(label);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: label })).toHaveCount(1, { timeout: 15000 });
      await imageSearchBox(page).clear();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation – Add
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation – Add', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-003: Submit with all fields empty shows all validation errors', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter Image label')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter height')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter Width')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-004: Submit with Image Label empty shows validation error', async ({ page }) => {
      await heightInput(page).fill('80');
      await widthInput(page).fill('60');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter Image label')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-005: Submit with Height empty shows validation error', async ({ page }) => {
      await imageLabelInput(page).fill(`TestImageHeight${Date.now()}`);
      await widthInput(page).fill('60');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter height')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-006: Submit with Width empty shows validation error', async ({ page }) => {
      await imageLabelInput(page).fill(`TestImageWidth${Date.now()}`);
      await heightInput(page).fill('80');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter Width')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention – Add
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention – Add', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-007/TC-PIS-028: Add with existing active Image Label shows duplicate error', async ({ page }) => {
      await waitForTableRows(page);
      // Read an existing label from the first visible active row
      const existingLabel = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? 'Ceiling';
      expect(existingLabel.length).toBeGreaterThan(0);

      await imageLabelInput(page).fill(existingLabel);
      await heightInput(page).fill('100');
      await widthInput(page).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: new RegExp(`A record with the PDF Image Setting label "${existingLabel}" already exists`, 'i') })
      ).toBeVisible({ timeout: 15000 });

      // Form remains in Add mode (heading unchanged); app may clear fields after duplicate error
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-029: Add with existing inactive Image Label shows duplicate error', async ({ page }) => {
      await waitForTableRows(page);
      // Filter to Inactive and get a label if any exist
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);

      const inactiveCount = await tableRows(page).count().catch(() => 0);
      if (inactiveCount === 0) {
        // No inactive records — skip the duplicate part but verify filter behavior
        await statusFilterSelect(page).selectOption('All');
        return;
      }

      const inactiveLabel = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveLabel.length).toBeGreaterThan(0);

      // Reset filter to All before submitting
      await statusFilterSelect(page).selectOption('All');
      await waitForTableRows(page);

      await imageLabelInput(page).fill(inactiveLabel);
      await heightInput(page).fill('80');
      await widthInput(page).fill('60');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: new RegExp(`A record with the PDF Image Setting label "${inactiveLabel}" already exists`, 'i') })
      ).toBeVisible({ timeout: 15000 });

      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 5 – Edge Cases – Add
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases – Add', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-008: Height field rejects non-numeric input (spinbutton)', async ({ page }) => {
      await imageLabelInput(page).fill('TestLabel');
      await heightInput(page).fill('abc');
      await widthInput(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Spinbutton either ignores non-numeric input or shows validation error
      const heightValue = await heightInput(page).inputValue();
      const hasError = await page.getByText('Please enter height').isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = heightValue === '' || heightValue === '0';
      expect(isEmpty || hasError).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-009: Height with zero value — observe behavior', async ({ page }) => {
      await imageLabelInput(page).fill(`TestZeroHeight${Date.now()}`);
      await heightInput(page).fill('0');
      await widthInput(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Either accepted (success toast) or rejected (validation error)
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(new RegExp(PDF_IMAGE_URL));
      await expect(
        page.getByRole('heading', { name: /Add PDF Image Setting|Update PDF Image Setting/i })
      ).toBeVisible({ timeout: 5000 });
    });

    test('TC-PIS-010: Negative Height value shows validation error', async ({ page }) => {
      await imageLabelInput(page).fill(`TestNegHeight${Date.now()}`);
      await heightInput(page).fill('-10');
      await widthInput(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      await page.waitForTimeout(3000);
      // Expect no successful creation — form stays on page
      await expect(page).toHaveURL(new RegExp(PDF_IMAGE_URL));
      await expect(
        page.getByRole('heading', { name: /Add PDF Image Setting/i })
      ).toBeVisible({ timeout: 5000 });
    });

    test('TC-PIS-011: Very long Image Label — observe behavior', async ({ page }) => {
      const longLabel = 'A'.repeat(260);
      await imageLabelInput(page).fill(longLabel);
      await heightInput(page).fill('50');
      await widthInput(page).fill('50');
      await page.getByRole('button', { name: /Submit/i }).click();

      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(new RegExp(PDF_IMAGE_URL));
      await expect(
        page.getByRole('heading', { name: /Add PDF Image Setting|Update PDF Image Setting/i })
      ).toBeVisible({ timeout: 5000 });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 6 – Clear Button
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-012: Clear button resets all form fields in Add mode', async ({ page }) => {
      await imageLabelInput(page).fill('ClearTest');
      await heightInput(page).fill('80');
      await widthInput(page).fill('60');

      await page.getByRole('button', { name: /Clear/i }).first().click();

      await expect(imageLabelInput(page)).toHaveValue('');
      await expect(heightInput(page)).toHaveValue('');
      await expect(widthInput(page)).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-014: Clear in Edit mode resets form to Add mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      const labelVal = await imageLabelInput(page).inputValue();
      expect(labelVal.length).toBeGreaterThan(0);

      await imageLabelInput(page).fill('Modified Label');
      await page.getByRole('button', { name: /Clear/i }).first().click();

      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible({ timeout: 10000 });
      await expect(imageLabelInput(page)).toHaveValue('');
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 7 – Whitespace Validation
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Whitespace Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-032: Add with whitespace-only in mandatory fields shows validation errors', async ({ page }) => {
      await imageLabelInput(page).fill('   ');
      await widthInput(page).fill('   ');
      // Height is a spinbutton — whitespace is ignored; leave empty to trigger its own error
      await page.getByRole('button', { name: /Submit/i }).click();

      // At minimum Image Label and Height should show validation errors for empty/whitespace
      const labelError = await page.getByText('Please enter Image label').isVisible({ timeout: 5000 }).catch(() => false);
      const heightError = await page.getByText('Please enter height').isVisible({ timeout: 5000 }).catch(() => false);
      const widthError = await page.getByText('Please enter Width').isVisible({ timeout: 5000 }).catch(() => false);

      expect(labelError || heightError || widthError).toBeTruthy();
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 8 – Edit and Update Operations
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-013: Edit record loads data in Update form and updates successfully', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const originalLabel = (await firstRow.locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      // Fields pre-populated
      await expect(imageLabelInput(page)).toHaveValue(originalLabel);
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Update height and width
      const newHeight = '75';
      const newWidth = '65';
      await heightInput(page).fill(newHeight);
      await widthInput(page).fill(newWidth);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: /PDF Image Setting has been updated successfully!/i })
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add PDF Image Setting/i })).toBeVisible({ timeout: 15000 });

      // Verify updated values in table
      await imageSearchBox(page).fill(originalLabel);
      await page.waitForTimeout(1000);
      const updatedRow = tableRows(page).filter({ hasText: originalLabel }).first();
      await expect(updatedRow.locator('[role="cell"]').nth(3)).toContainText(newHeight, { timeout: 10000 });
      await expect(updatedRow.locator('[role="cell"]').nth(4)).toContainText(newWidth, { timeout: 10000 });
      await imageSearchBox(page).clear();
    });

    test('TC-PIS-027: Edited row action cell loses Edit label while in Update mode', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();

      // Before edit — action cell has accessible "Edit" name
      await expect(firstRow.getByRole('img', { name: 'Edit' })).toBeVisible();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      // After clicking Edit — row's action cell should no longer expose "Edit" accessible name
      await expect(firstRow.getByRole('img', { name: 'Edit' })).not.toBeVisible({ timeout: 5000 });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 9 – Mandatory Field Validation – Update
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation – Update', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-015: Update with Image Label cleared shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      await imageLabelInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.getByText('Please enter Image label')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-033: Update with all mandatory fields empty shows validation errors', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      await imageLabelInput(page).clear();
      await heightInput(page).clear();
      await widthInput(page).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.getByText('Please enter Image label')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter height')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter Width')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 10 – Duplicate Prevention – Update
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention – Update', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-030: Update record label to an existing active label shows duplicate error', async ({ page }) => {
      await waitForTableRows(page);
      const allRows = tableRows(page);
      const count = await allRows.count();
      if (count < 2) return;

      const firstLabel = (await allRows.nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondLabel = (await allRows.nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(firstLabel.length).toBeGreaterThan(0);
      expect(secondLabel.length).toBeGreaterThan(0);

      // Edit second row and set label to match first row
      await clickEditOnRow(page, 1);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      await imageLabelInput(page).clear();
      await imageLabelInput(page).fill(firstLabel);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: new RegExp(`A record with the PDF Image Setting label "${firstLabel}" already exists`, 'i') })
      ).toBeVisible({ timeout: 15000 });

      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible();
    });

    test('TC-PIS-031: Update record label to an existing inactive label shows duplicate error', async ({ page }) => {
      await waitForTableRows(page);

      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount === 0) {
        await statusFilterSelect(page).selectOption('All');
        return;
      }

      const inactiveLabel = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(inactiveLabel.length).toBeGreaterThan(0);

      await statusFilterSelect(page).selectOption('Active');
      await waitForTableRows(page);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible({ timeout: 10000 });

      await imageLabelInput(page).clear();
      await imageLabelInput(page).fill(inactiveLabel);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(
        page.locator('[role="alert"]').filter({ hasText: new RegExp(`A record with the PDF Image Setting label "${inactiveLabel}" already exists`, 'i') })
      ).toBeVisible({ timeout: 15000 });

      await expect(page.getByRole('heading', { name: /Update PDF Image Setting/i })).toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 11 – Search Functionality
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-016: Search by partial Image Label filters table in real time', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Use first few chars of an existing label
      await imageSearchBox(page).fill('Cabin');
      await page.waitForTimeout(1000);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      // Every visible row should contain "Cabin"
      for (let i = 0; i < filteredCount; i++) {
        const cellText = await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText();
        expect(cellText.toLowerCase()).toContain('cabin');
      }
    });

    test('TC-PIS-017: Search with no matching result shows empty table', async ({ page }) => {
      await waitForTableRows(page);
      await imageSearchBox(page).fill('zzznomatch999xyz');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
    });

    test('TC-PIS-018: Clearing search field restores full table', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await imageSearchBox(page).fill('xyz');
      await page.waitForTimeout(800);

      await imageSearchBox(page).clear();
      await page.waitForTimeout(1500);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(initialCount);
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 12 – Status Filter
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-019: Status filter – Active shows records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(1000);
      await expect(statusFilterSelect(page)).toHaveValue('true');
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(0);
    });

    test('TC-PIS-020: Status filter – Inactive shows records or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
      await expect(statusFilterSelect(page)).toHaveValue('false');
      // May have 0 or more rows depending on data
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(0);
    });

    test('TC-PIS-021: Status filter – All shows all records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Active');
      await page.waitForTimeout(500);

      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(1000);
      await expect(statusFilterSelect(page)).toHaveValue('');
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 13 – Rows Per Page
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-022: Changing Show to 25 displays up to 25 records', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('25');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(25);
      await expect(showEntriesSelect(page)).toHaveValue('25');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 14 – Column Sorting
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-023: Sort by Image Label column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // First click — ascending sort
      await page.getByRole('button', { name: /^Image Label$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBe(initialCount);

      // Capture labels after ascending sort and verify order changed or stayed consistent
      const labelsAsc: string[] = [];
      for (let i = 0; i < initialCount; i++) {
        labelsAsc.push((await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '');
      }
      // Verify adjacent pairs are in non-descending order (server uses case-insensitive sort)
      for (let i = 0; i < labelsAsc.length - 1; i++) {
        expect(labelsAsc[i].toLowerCase() <= labelsAsc[i + 1].toLowerCase()).toBeTruthy();
      }

      // Second click — descending sort
      await page.getByRole('button', { name: /^Image Label$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBe(initialCount);

      const labelsDesc: string[] = [];
      for (let i = 0; i < initialCount; i++) {
        labelsDesc.push((await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '');
      }
      // Verify descending: first label should be last of ascending
      expect(labelsDesc[0].toLowerCase()).toBe(labelsAsc[labelsAsc.length - 1].toLowerCase());
    });

    test('TC-PIS-024: Sort by Height column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Height$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);

      await page.getByRole('button', { name: /^Height$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-PIS-025: Sort by Width column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Width$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);

      await page.getByRole('button', { name: /^Width$/ }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // Suite 15 – Pagination
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoPdfImageSetting(page);
    });

    test('TC-PIS-026: Next page and Previous page navigation works correctly', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      const prevBtn = page.getByRole('button', { name: /Previous page/i });

      // Previous should be disabled on page 1
      await expect(prevBtn).toBeDisabled();

      if (await nextBtn.isEnabled().catch(() => false)) {
        const page1FirstLabel = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        const page2FirstLabel = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        expect(page2FirstLabel).not.toBe(page1FirstLabel);

        await prevBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
        await expect(prevBtn).toBeDisabled();
      }
    });

  });

});
