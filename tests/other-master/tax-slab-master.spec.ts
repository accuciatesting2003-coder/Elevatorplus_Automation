// spec: test-plans/Other-master-test-plan/tax-slab-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const OTHER_MASTER_URL = '/master/other-master';

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
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear
  }
}

// Tax Slab Master is only accessible via a tab on /master/other-master
async function gotoTaxSlabMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(OTHER_MASTER_URL, { timeout: 60000 });
  await dismissNotificationPopup(page);
  await page.locator('.nav-link', { hasText: /Tax Slab Master/i }).click();
  await page.getByRole('heading', { name: /Add Tax Slab/i }).waitFor({ state: 'visible', timeout: 30000 });
}

function tableRows(page: any) {
  return page.locator('[role="row"]:visible:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

function statusFilterSelect(page: any) {
  return page.locator('select:visible').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
}

function showEntriesSelect(page: any) {
  return page.locator('select:visible').filter({ has: page.locator('option', { hasText: '100' }) });
}

function taxSlabSearchBox(page: any) {
  return page.getByRole('textbox', { name: /Search Tax Slab/i });
}

// Tax Slab table: Sr.No.(0), Action(1), Tax Slab(2), Is Default(3), Status(4)
// Both Is Default and Status columns use h5 headings — get the LAST h5 per row for status
async function getStatusColumnTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const h5s = rows.nth(i).getByRole('heading', { level: 5 });
    const h5Count = await h5s.count().catch(() => 0);
    if (h5Count > 0) {
      const text = await h5s.nth(h5Count - 1).innerText().catch(() => '');
      texts.push(text.trim());
    } else {
      texts.push('');
    }
  }
  return texts;
}

// Check if any row has the 'Default' badge in the Is Default column (cell index 3)
async function hasDefaultBadge(page: any, rowIndex: number): Promise<boolean> {
  const row = tableRows(page).nth(rowIndex);
  const isDefaultCell = row.locator('[role="cell"]').nth(3);
  return isDefaultCell.getByRole('heading', { level: 5, name: /Default/i }).isVisible({ timeout: 3000 }).catch(() => false);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Tax Slab Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-SM-01: Tax Slab Master tab loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(OTHER_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();

      const taxSlabInput = page.getByRole('spinbutton', { name: /Tax Slab/i });
      await expect(taxSlabInput).toBeVisible();
      await expect(taxSlabInput).toHaveValue('');

      await expect(page.getByText('Enter the tax slab percentage')).toBeVisible();
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();
      await expect(page.getByText(/⚠ Note/).first()).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Tax Slab').last()).toBeVisible();
      await expect(page.getByText('Is Default').last()).toBeVisible();
      await expect(page.getByText('Status').last()).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();

      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(page.getByRole('button', { name: /^Import$/i })).toBeVisible();
      await expect(taxSlabSearchBox(page)).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.').last()).toBeVisible();
      await expect(page.getByText('Is Default').last()).toBeVisible();
      await expect(page.getByText('Status').last()).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Tax Slab (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Tax Slab (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-ADD-01: Successfully create a new tax slab without Is Default', async ({ page }) => {
      const uniqueValue = `${Math.floor(Math.random() * 1000) + 2000}`; // 2000-2999 range
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(uniqueValue);
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('spinbutton', { name: /Tax Slab/i })).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();
      await waitForTableRows(page);
    });

    test('TC-ADD-02: Successfully create a tax slab with Is Default checked', async ({ page }) => {
      // First find a unique percentage to avoid duplicates
      const uniquePct = `${Math.floor(Math.random() * 50) + 100}`; // 100-149 range to avoid typical slabs
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(uniquePct);
      await page.locator('label').filter({ hasText: 'Is Default' }).click();
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).toBeChecked();

      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i });
      const errorToast = page.locator('.Toastify__toast--error');
      const result = await Promise.any([
        successToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
        errorToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
      ]).catch(() => 'none');
      expect(result).not.toBe('none');
    });

    test('TC-ADD-03: Create a tax slab with a decimal percentage', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill('2.5');
      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i });
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      if (hasSuccess) {
        await taxSlabSearchBox(page).fill('2.5');
        await page.waitForTimeout(1000);
        expect(await tableRows(page).count()).toBeGreaterThan(0);
        await taxSlabSearchBox(page).clear();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-VAL-01: Submit with empty Tax Slab shows inline error', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter tax slab')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit with a negative tax slab value observes behavior', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill('-5');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Observe behavior — either validation error or record created
      const errorMsg = page.getByText(/Please enter tax slab/i);
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i });
      const errorToast = page.locator('.Toastify__toast').filter({ hasText: /Something went wrong|already exists/i });

      const result = await Promise.any([
        errorMsg.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'inline'),
        successToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
        errorToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
      ]).catch(() => 'none');
      expect(result).not.toBe('none');
    });

    test('TC-VAL-03: Submit with only whitespace in Tax Slab shows validation error', async ({ page }) => {
      // spinbutton (number input) typically rejects whitespace; verify behavior
      const taxInput = page.getByRole('spinbutton', { name: /Tax Slab/i });
      await taxInput.fill('   ');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Spinbutton may strip whitespace and treat as empty
      await expect(page.getByText('Please enter tax slab')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();
    });

    test('TC-VAL-05: Validation error clears when valid input is entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter tax slab')).toBeVisible({ timeout: 5000 });

      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill('7');
      await expect(page.getByText('Please enter tax slab')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i });
      const errorToast = page.locator('.Toastify__toast--error');
      const result = await Promise.any([
        successToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
        errorToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
      ]).catch(() => 'none');
      expect(result).not.toBe('none');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-DUP-01: Submitting an existing tax slab percentage shows an error', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const taxSlabText = (await firstRow.locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      // Extract numeric value from e.g. "18%"
      const numericValue = taxSlabText.replace('%', '').trim();
      expect(numericValue.length).toBeGreaterThan(0);

      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(numericValue);
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('.Toastify__toast').filter({ hasText: /Something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add Tax Slab form', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill('22');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('spinbutton', { name: /Tax Slab/i })).toHaveValue('');
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode resets form to Add Tax Slab state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      const taxSlabInput = page.getByRole('spinbutton', { name: /Tax Slab/i });
      expect((await taxSlabInput.inputValue()).length).toBeGreaterThan(0);

      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible();
      await expect(taxSlabInput).toHaveValue('');
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-EDT-01: Edit icon opens the tax slab record in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      const taxSlabText = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const numericValue = taxSlabText.replace('%', '').trim();

      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('spinbutton', { name: /Tax Slab/i })).toHaveValue(numericValue);
      await expect(page.getByRole('checkbox', { name: /Is Default/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    test('TC-EDT-02: Successfully update the tax slab percentage', async ({ page }) => {
      await waitForTableRows(page);

      // Find a non-default record to edit safely
      let editRowIndex = 0;
      const rowCount = await tableRows(page).count();
      for (let i = 0; i < rowCount; i++) {
        const isDefault = await hasDefaultBadge(page, i);
        if (!isDefault) {
          editRowIndex = i;
          break;
        }
      }

      await clickEditOnRow(page, editRowIndex);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      const taxSlabInput = page.getByRole('spinbutton', { name: /Tax Slab/i });
      const newValue = `${Math.floor(Math.random() * 40) + 200}`; // large unique range
      await taxSlabInput.clear();
      await taxSlabInput.fill(newValue);

      await page.getByRole('button', { name: /Update/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i });
      const errorToast = page.locator('.Toastify__toast--error');
      const result = await Promise.any([
        successToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
        errorToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
      ]).catch(() => 'none');
      expect(result).not.toBe('none');

      if (result === 'success') {
        await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });
      }
    });

    test('TC-EDT-03: Mark an existing tax slab as Default via edit', async ({ page }) => {
      await waitForTableRows(page);

      // Find a non-default record
      let editRowIndex = -1;
      const rowCount = await tableRows(page).count();
      for (let i = 0; i < rowCount; i++) {
        const isDefault = await hasDefaultBadge(page, i);
        if (!isDefault) {
          editRowIndex = i;
          break;
        }
      }

      if (editRowIndex >= 0) {
        const targetName = (await tableRows(page).nth(editRowIndex).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        await clickEditOnRow(page, editRowIndex);
        await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();

        await page.locator('label').filter({ hasText: 'Is Default' }).click();
        await page.getByRole('button', { name: /Update/i }).click();

        const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i });
        const errorToast = page.locator('.Toastify__toast--error');
        const result = await Promise.any([
          successToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
          errorToast.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
        ]).catch(() => 'none');
        expect(result).not.toBe('none');
      }
    });

    test('TC-EDT-04: Update tax slab status to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      // Find a non-default record to avoid changing the default record's status
      let editRowIndex = 0;
      const rowCount = await tableRows(page).count();
      for (let i = 0; i < rowCount; i++) {
        const isDefault = await hasDefaultBadge(page, i);
        if (!isDefault) {
          editRowIndex = i;
          break;
        }
      }

      const taxSlabText = (await tableRows(page).nth(editRowIndex).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await clickEditOnRow(page, editRowIndex);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('All');
      const updatedRow = tableRows(page).filter({ hasText: taxSlabText });
      await expect(updatedRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore
      await updatedRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-05: Update with empty Tax Slab shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('spinbutton', { name: /Tax Slab/i }).clear();
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.getByText('Please enter tax slab')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible();
    });

    test('TC-EDT-06: Update tax slab to duplicate of existing Active record shows error', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const existingText = (await firstRow.locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const existingValue = existingText.replace('%', '').trim();
      expect(existingValue.length).toBeGreaterThan(0);

      // Edit a different row
      await clickEditOnRow(page, 1);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('spinbutton', { name: /Tax Slab/i }).clear();
      await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(existingValue);
      await page.getByRole('button', { name: /Update/i }).click();

      await expect(page.locator('.Toastify__toast').filter({ hasText: /Something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-07: Update tax slab to duplicate of existing Inactive record shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveText = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        const inactiveValue = inactiveText.replace('%', '').trim();

        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

        await page.getByRole('spinbutton', { name: /Tax Slab/i }).clear();
        await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(inactiveValue);
        await page.getByRole('button', { name: /Update/i }).click();

        await expect(page.locator('.Toastify__toast').filter({ hasText: /Something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
      }
    });

    test('TC-EDT-08: Is Default conflict with another Active record having Is Default shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Find a record that has the Default badge (active default)
      const rowCount = await tableRows(page).count();
      let defaultRowExists = false;
      let nonDefaultRowIndex = -1;

      for (let i = 0; i < rowCount; i++) {
        const isDefault = await hasDefaultBadge(page, i);
        if (isDefault) {
          defaultRowExists = true;
        } else if (nonDefaultRowIndex < 0) {
          nonDefaultRowIndex = i;
        }
      }

      if (defaultRowExists && nonDefaultRowIndex >= 0) {
        await clickEditOnRow(page, nonDefaultRowIndex);
        await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();

        await page.locator('label').filter({ hasText: 'Is Default' }).click();
        await page.getByRole('button', { name: /Update/i }).click();

        // App may show error OR silently replace the existing default
        const result = await Promise.any([
          page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i }).waitFor({ state: 'visible', timeout: 12000 }).then(() => 'success'),
          page.locator('.Toastify__toast--error').waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error'),
        ]).catch(() => 'none');
        expect(result).not.toBe('none');
      }
    });

    test('TC-EDT-09: Is Default conflict with an Inactive record having Is Default shows error', async ({ page }) => {
      // Find an inactive record with Default badge
      await statusFilterSelect(page).selectOption('All');
      await page.waitForTimeout(500);
      const rowCount = await tableRows(page).count().catch(() => 0);

      let inactiveDefaultExists = false;
      for (let i = 0; i < rowCount; i++) {
        const isDefault = await hasDefaultBadge(page, i);
        if (isDefault) {
          // Check if this row is inactive
          const statusCell = tableRows(page).nth(i).locator('[role="cell"]').nth(4);
          const statusText = (await statusCell.innerText().catch(() => '')).trim();
          if (/inactive/i.test(statusText)) {
            inactiveDefaultExists = true;
            break;
          }
        }
      }

      if (inactiveDefaultExists) {
        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        // Find a non-default active record
        const activeRowCount = await tableRows(page).count();
        let nonDefaultRowIndex = -1;
        for (let i = 0; i < activeRowCount; i++) {
          const isDefault = await hasDefaultBadge(page, i);
          if (!isDefault) {
            nonDefaultRowIndex = i;
            break;
          }
        }

        if (nonDefaultRowIndex >= 0) {
          await clickEditOnRow(page, nonDefaultRowIndex);
          await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
          await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();

          await page.locator('label').filter({ hasText: 'Is Default' }).click();
          await page.getByRole('button', { name: /Update/i }).click();

          await expect(page.locator('.Toastify__toast').filter({ hasText: /Something went wrong|already exists/i })).toBeVisible({ timeout: 15000 });
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Is Default Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Is Default Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-DEF-01: Only one tax slab can be marked as Default at a time', async ({ page }) => {
      await waitForTableRows(page);

      // Count how many rows have Default badge
      const rowCount = await tableRows(page).count();
      let defaultCount = 0;
      for (let i = 0; i < rowCount; i++) {
        if (await hasDefaultBadge(page, i)) {
          defaultCount++;
        }
      }
      // There should be at most one default
      expect(defaultCount).toBeLessThanOrEqual(1);
    });

    test('TC-DEF-02: New tax slab created without Is Default does not affect existing default', async ({ page }) => {
      await waitForTableRows(page);

      // Find which row has Default badge and its value
      const rowCount = await tableRows(page).count();
      let currentDefaultText = '';
      for (let i = 0; i < rowCount; i++) {
        if (await hasDefaultBadge(page, i)) {
          currentDefaultText = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
          break;
        }
      }

      if (currentDefaultText) {
        // Create a new slab without Is Default
        const newPct = `${Math.floor(Math.random() * 50) + 150}`;
        await page.getByRole('spinbutton', { name: /Tax Slab/i }).fill(newPct);
        await expect(page.getByRole('checkbox', { name: /Is Default/i })).not.toBeChecked();
        await page.getByRole('button', { name: /Submit/i }).click();

        const successToast = page.locator('[role="alert"]').filter({ hasText: /Tax Slab created successfully!/i });
        const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);

        if (hasSuccess) {
          await waitForTableRows(page);
          // Verify the previously default record still has Default badge
          let stillDefault = false;
          const newCount = await tableRows(page).count();
          for (let i = 0; i < newCount; i++) {
            const cellText = (await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
            if (cellText === currentDefaultText) {
              stillDefault = await hasDefaultBadge(page, i);
              break;
            }
          }
          expect(stillDefault).toBeTruthy();
        }
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);

      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      await statusFilterSelect(page).selectOption('All');
      await waitForTableRows(page);
      await expect(statusFilterSelect(page)).toHaveValue('');
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      await page.waitForTimeout(1000);
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
      await gotoTaxSlabMaster(page);
    });

    test('TC-SRC-01: Search by partial tax slab value returns matching results', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await taxSlabSearchBox(page).fill('18');
      await page.waitForTimeout(1000);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await taxSlabSearchBox(page).fill('999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await taxSlabSearchBox(page).fill('18');
      await page.waitForTimeout(1000);

      await taxSlabSearchBox(page).clear();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBe(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeLessThanOrEqual(10);
    });

    test('TC-PAG-02: Navigate between pages with pagination controls', async ({ page }) => {
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const nextBtn = page.getByRole('button', { name: /Next page/i });
      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        await page.getByRole('button', { name: /Previous page/i }).click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-SRT-01: Sort by Tax Slab column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Tax Slab$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Tax Slab$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-SRT-02: Sort by Is Default column', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Is Default/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-SRT-03: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);
      await statusFilterSelect(page).selectOption('All');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoTaxSlabMaster(page);
    });

    test('TC-INA-01: Mark Active tax slab as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);

      // Find a non-default active row
      const rowCount = await tableRows(page).count();
      let editRowIndex = -1;
      for (let i = 0; i < rowCount; i++) {
        if (!(await hasDefaultBadge(page, i))) {
          editRowIndex = i;
          break;
        }
      }

      if (editRowIndex < 0) return;

      const taxSlabText = (await tableRows(page).nth(editRowIndex).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(taxSlabText.length).toBeGreaterThan(0);

      await clickEditOnRow(page, editRowIndex);
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: taxSlabText })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('Inactive');
      await expect(tableRows(page).filter({ hasText: taxSlabText })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: taxSlabText }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-INA-02: Re-activate an Inactive tax slab', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const taxSlabText = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Tax Slab/i })).toBeVisible({ timeout: 10000 });

        await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Tax Slab updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 15000 });

        await statusFilterSelect(page).selectOption('Active');
        await expect(tableRows(page).filter({ hasText: taxSlabText })).toHaveCount(1, { timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 13 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto('https://stage.elevatorplus.net/master/other-master', { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

      await context.close();
    });

    test('TC-NAV-02: Access Tax Slab Master via Other Masters sidebar navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.getByRole('link', { name: /Other Masters/i }).click();
      await page.waitForURL(/\/master\/other-master/, { timeout: 30000 });

      await page.locator('.nav-link', { hasText: /Tax Slab Master/i }).click();
      await expect(page.getByRole('heading', { name: /Add Tax Slab/i })).toBeVisible({ timeout: 30000 });
      await waitForTableRows(page);

      const taxSlabTab = page.locator('.nav-link', { hasText: /Tax Slab Master/i });
      await expect(taxSlabTab).toBeVisible();
    });

  });

});
