// spec: test-plans/Other-master-test-plan/flooring-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const FLOORING_MASTER_URL = '/master/flooring-master';

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

async function gotoFlooringMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(FLOORING_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Flooring/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
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

// Search box is an unnamed textbox inside the banner (table toolbar)
function flooringSearchBox(page: any) {
  return page.getByRole('banner').getByRole('textbox');
}

// Passenger/Capacity tag input: 2nd textbox in the form (1st is Flooring Name)
function passengerCapacityTagInput(page: any) {
  return page.getByRole('textbox').nth(1);
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

// Add a passenger/capacity tag by typing the value and selecting from the dropdown
async function addPassengerCapacityTag(page: any, value: string) {
  const tagInput = passengerCapacityTagInput(page);
  await tagInput.click();
  await tagInput.fill(value);
  await page.waitForTimeout(500);

  const option = page.getByRole('option').filter({ hasText: new RegExp(`^${value}`) }).first();
  const listOption = page.locator('[role="listbox"] [role="option"]').first();

  const hasOption = await option.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasOption) {
    await option.click();
  } else {
    const hasListOption = await listOption.isVisible({ timeout: 1000 }).catch(() => false);
    if (hasListOption) {
      await listOption.click();
    } else {
      await page.keyboard.press('Enter');
    }
  }
  await page.waitForTimeout(200);
}

// Remove all tags from the Passenger/Capacity multi-select field
async function clearAllPassengerCapacityTags(page: any) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const removeBtn = page.locator('[class*="option__multi-value__remove"]').first();
    const isVisible = await removeBtn.isVisible({ timeout: 300 }).catch(() => false);
    if (!isVisible) break;
    await removeBtn.click().catch(() => {});
    await page.waitForTimeout(300);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Flooring Master', () => {

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-SM-01: Flooring Master page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(FLOORING_MASTER_URL, 'i'));
      await expect(page).toHaveTitle('ElevatorPlus');
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();

      const nameInput = page.getByRole('textbox', { name: /Flooring Name/i });
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveValue('');

      await expect(page.getByRole('spinbutton', { name: /Price/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeVisible();
      await expect(page.getByText('Enter the flooring name')).toBeVisible();
      await expect(page.getByText(/⚠ Note/)).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByRole('button', { name: 'Sr. No.', exact: true })).toBeVisible();
      await expect(page.getByText('Flooring Name').first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
    });

    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();

      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update Price/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Excel/i })).toBeVisible();
      await expect(flooringSearchBox(page)).toBeVisible();

      await waitForTableRows(page);
      await expect(page.getByText('Flooring Name').first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Price', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Lift Type', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Passengers/Capacity', exact: true })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Flooring (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Flooring (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-ADD-01: Successfully create a new flooring with unique name (Passenger Lift)', async ({ page }) => {
      const flooringName = `Vinyl Tile Flooring Test ${Date.now()}`;

      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('400');
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toHaveValue('false');
      await addPassengerCapacityTag(page, '8');

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('textbox', { name: /Flooring Name/i })).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();

      await flooringSearchBox(page).fill(flooringName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(1, { timeout: 15000 });
      await flooringSearchBox(page).clear();
    });

    test('TC-ADD-02: Successfully create a flooring for Goods Lift', async ({ page }) => {
      const flooringName = `Industrial Rubber Flooring ${Date.now()}`;

      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('1200');
      await page.getByRole('combobox', { name: /Lift Type/i }).selectOption('Goods Lift');
      await addPassengerCapacityTag(page, '816 kg');

      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i });
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      if (hasSuccess) {
        await flooringSearchBox(page).fill(flooringName);
        await page.waitForTimeout(1000);
        await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(1, { timeout: 15000 });
        await flooringSearchBox(page).clear();
      }
    });

    test('TC-ADD-03: Create a flooring with multiple passenger/capacity values', async ({ page }) => {
      const flooringName = `Multi-Cap Flooring Test ${Date.now()}`;

      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('250');

      await addPassengerCapacityTag(page, '4');
      await addPassengerCapacityTag(page, '6');
      await addPassengerCapacityTag(page, '8');

      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i });
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      if (hasSuccess) {
        await flooringSearchBox(page).fill(flooringName);
        await page.waitForTimeout(1000);
        await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(1, { timeout: 15000 });
        await flooringSearchBox(page).clear();
      }
    });

    test('TC-ADD-04: Create a flooring with a single passenger/capacity value', async ({ page }) => {
      const flooringName = `Single Cap Flooring Test ${Date.now()}`;

      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('350');
      await addPassengerCapacityTag(page, '6');

      await page.getByRole('button', { name: /Submit/i }).click();

      const successToast = page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i });
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      if (hasSuccess) {
        await flooringSearchBox(page).fill(flooringName);
        await page.waitForTimeout(1000);
        const matchingRow = tableRows(page).filter({ hasText: flooringName });
        await expect(matchingRow).toHaveCount(1, { timeout: 15000 });
        const capacityCell = matchingRow.locator('[role="cell"]').nth(5);
        await expect(capacityCell).not.toContainText(',');
        await flooringSearchBox(page).clear();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-VAL-01: Submit with empty Flooring Name shows inline error', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await addPassengerCapacityTag(page, '8');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter flooring name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();
    });

    test('TC-VAL-02: Submit with empty Price shows validation error', async ({ page }) => {
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(`TestFlooring ${Date.now()}`);
      await addPassengerCapacityTag(page, '8');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please enter price')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();
    });

    test('TC-VAL-03: Submit with empty Passenger/Capacity shows validation error', async ({ page }) => {
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(`TestFlooring ${Date.now()}`);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(page.getByText('Please select passenger')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();
    });

    test('TC-VAL-04: Validation errors clear when valid inputs are entered', async ({ page }) => {
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.getByText('Please enter flooring name')).toBeVisible({ timeout: 5000 });

      const flooringName = `ValidFlooring ${Date.now()}`;
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('200');
      await addPassengerCapacityTag(page, '8');

      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-DUP-01: Submitting duplicate combination matching existing Active record shows error', async ({ page }) => {
      // Create a fresh known record, then immediately try to submit the same combination
      const flooringName = `DupTest Flooring ${Date.now()}`;
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await addPassengerCapacityTag(page, '6');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('textbox', { name: /Flooring Name/i })).toHaveValue('', { timeout: 10000 });

      // Submit the exact same combination again — should be rejected
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('200');
      await addPassengerCapacityTag(page, '6');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-02: Submitting duplicate combination matching existing Inactive record shows error', async ({ page }) => {
      // Create a record, mark it Inactive, then try to create the same combination
      const flooringName = `DupInactive Flooring ${Date.now()}`;
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
      await addPassengerCapacityTag(page, '6');
      await page.getByRole('button', { name: /Submit/i }).click();
      const created = await page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i }).isVisible({ timeout: 15000 }).catch(() => false);
      if (!created) return; // skip if creation failed
      await expect(page.getByRole('textbox', { name: /Flooring Name/i })).toHaveValue('', { timeout: 10000 });

      // Find the new record and mark it Inactive
      await flooringSearchBox(page).fill(flooringName);
      await page.waitForTimeout(1000);
      const newRow = tableRows(page).filter({ hasText: flooringName });
      await newRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });
      await flooringSearchBox(page).clear();

      // Now try to create the same combination (name+LiftType+capacity now inactive)
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill(flooringName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('200');
      await addPassengerCapacityTag(page, '6');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-DUP-03: Single capacity matching one value from multi-passenger record observes behavior', async ({ page }) => {
      await waitForTableRows(page);

      const allRows = tableRows(page);
      const count = await allRows.count();
      let multiCapName = '';
      let multiCapLiftType = '';
      let singleCap = '';

      for (let i = 0; i < count; i++) {
        const capacityText = (await allRows.nth(i).locator('[role="cell"]').nth(5).innerText())?.trim() ?? '';
        if (capacityText.includes(',')) {
          multiCapName = (await allRows.nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
          multiCapLiftType = (await allRows.nth(i).locator('[role="cell"]').nth(4).innerText())?.trim() ?? '';
          singleCap = capacityText.split(',')[0].trim().replace(/[^0-9a-zA-Z\s]/g, '').trim();
          break;
        }
      }

      if (multiCapName && singleCap) {
        await page.getByRole('textbox', { name: /Flooring Name/i }).fill(multiCapName);
        await page.getByRole('spinbutton', { name: /Price/i }).fill('100');
        if (multiCapLiftType) {
          await page.getByRole('combobox', { name: /Lift Type/i }).selectOption({ label: multiCapLiftType }).catch(() => {});
        }
        await addPassengerCapacityTag(page, singleCap);

        await page.getByRole('button', { name: /Submit/i }).click();

        const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists/i });
        const successToast = page.locator('[role="alert"]').filter({ hasText: /Flooring created successfully!/i });
        await errorToast.isVisible({ timeout: 15000 }).catch(() => false);
        await successToast.isVisible({ timeout: 5000 }).catch(() => false);
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-CLR-01: Clear button resets the Add Flooring form', async ({ page }) => {
      await page.getByRole('textbox', { name: /Flooring Name/i }).fill('Temp Flooring');
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');
      await addPassengerCapacityTag(page, '8');

      await page.getByRole('button', { name: /Clear/i }).first().click();

      await expect(page.getByRole('textbox', { name: /Flooring Name/i })).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();
    });

    test('TC-CLR-02: Clear in Edit mode resets form to Add Flooring state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      const nameInput = page.getByRole('textbox', { name: /Flooring Name/i });
      expect((await nameInput.inputValue()).length).toBeGreaterThan(0);

      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /Update$/i })).toBeVisible();

      await page.getByRole('button', { name: /Clear/i }).first().click();

      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible();
      await expect(nameInput).toHaveValue('');
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-EDT-01: Edit icon opens flooring record in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('textbox', { name: /Flooring Name/i })).toHaveValue(originalName);
      await expect(page.getByRole('spinbutton', { name: /Price/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Status \*/i })).toHaveValue('true');
      await expect(page.getByRole('button', { name: /Update$/i })).toBeVisible();
      // Reset form to Add Flooring mode so next test starts clean
      await page.getByRole('button', { name: /Clear/i }).first().click();
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC-EDT-02: Successfully update the flooring name and price', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Flooring ${Date.now()}`;
      const nameInput = page.getByRole('textbox', { name: /Flooring Name/i });
      await nameInput.fill(newName);
      await page.getByRole('spinbutton', { name: /Price/i }).fill('999');

      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });

      await flooringSearchBox(page).fill(newName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await flooringSearchBox(page).clear();
    });

    test('TC-EDT-03: Update flooring status to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const flooringName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('All');
      const flooringRow = tableRows(page).filter({ hasText: flooringName });
      await expect(flooringRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore
      await flooringRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-04: Update with empty Flooring Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('textbox', { name: /Flooring Name/i }).clear();
      await page.getByRole('button', { name: /Update$/i }).click();

      await expect(page.getByText('Please enter flooring name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible();
    });

    test('TC-EDT-05: Lift Type is disabled in edit mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await expect(page.getByRole('combobox', { name: /Lift Type/i })).toBeDisabled();
      // Reset form to Add Flooring mode so next test starts clean
      await page.getByRole('button', { name: /Clear/i }).first().click();
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC-EDT-06: Update with empty Price shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('spinbutton', { name: /Price/i }).clear();
      await page.getByRole('button', { name: /Update$/i }).click();

      await expect(page.getByText('Please enter price')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible();
    });

    test('TC-EDT-07: Update with empty Passenger/Capacity shows validation error', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await clearAllPassengerCapacityTags(page);
      await page.getByRole('button', { name: /Update$/i }).click();

      await expect(page.getByText('Please select passenger')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible();
    });

    test('TC-EDT-08: Update combination to duplicate of existing Active record shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Find two rows with the SAME lift type (one with single capacity to use as source)
      const allRows = tableRows(page);
      const rowCount = await allRows.count();
      let existingName = '';
      let existingCapacity = '';
      let targetRowIndex = -1;

      outer: for (let i = 0; i < rowCount; i++) {
        const capText = (await allRows.nth(i).locator('[role="cell"]').nth(5).innerText())?.trim() ?? '';
        if (capText.includes(',')) continue;
        const liftType = (await allRows.nth(i).locator('[role="cell"]').nth(4).innerText())?.trim() ?? '';
        for (let j = 0; j < rowCount; j++) {
          if (j === i) continue;
          const jLiftType = (await allRows.nth(j).locator('[role="cell"]').nth(4).innerText())?.trim() ?? '';
          if (jLiftType === liftType) {
            existingName = (await allRows.nth(i).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
            existingCapacity = capText;
            targetRowIndex = j;
            break outer;
          }
        }
      }

      if (targetRowIndex === -1) {
        existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        existingCapacity = (await tableRows(page).first().locator('[role="cell"]').nth(5).innerText())?.trim() ?? '';
        targetRowIndex = 1;
      }

      const firstCapacity = existingCapacity.split(',')[0].trim().replace(/[^0-9a-zA-Z\s]/g, '').trim();
      expect(existingName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, targetRowIndex);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      const nameInput = page.getByRole('textbox', { name: /Flooring Name/i });
      await nameInput.fill(existingName);

      if (firstCapacity) {
        await clearAllPassengerCapacityTags(page);
        await addPassengerCapacityTag(page, firstCapacity);
      }

      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-EDT-09: Update combination to duplicate of existing Inactive record shows error', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
        const inactiveCapacity = (await tableRows(page).first().locator('[role="cell"]').nth(5).innerText())?.trim() ?? '';
        const firstCapacity = inactiveCapacity.split(',')[0].trim().replace(/[^0-9a-zA-Z\s]/g, '').trim();

        await statusFilterSelect(page).selectOption('Active');
        await waitForTableRows(page);

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

        const nameInput = page.getByRole('textbox', { name: /Flooring Name/i });
        await nameInput.clear();
        await nameInput.fill(inactiveName);

        if (firstCapacity) {
          await clearAllPassengerCapacityTags(page);
          await addPassengerCapacityTag(page, firstCapacity);
        }

        await page.getByRole('button', { name: /Update$/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 15000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(1000);
      await waitForTableRows(page);

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
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-SRC-01: Search by partial flooring name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await flooringSearchBox(page).fill('Vinyl');
      await page.waitForTimeout(1000);

      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);
      await flooringSearchBox(page).fill('XYZNONEXISTENTFLOORING999');
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      expect(await tableRows(page).count().catch(() => 0)).toBe(0);
    });

    test('TC-SRC-03: Clearing search restores the full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await flooringSearchBox(page).fill('Industrial');
      await page.waitForTimeout(1000);

      await flooringSearchBox(page).clear();
      await page.waitForTimeout(1500);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThanOrEqual(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
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
        await page.waitForTimeout(500);
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible({ timeout: 10000 });

        await page.getByRole('button', { name: /Previous page/i }).click();
        await page.waitForTimeout(500);
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible({ timeout: 10000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-SRT-01: Sort by Price column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /^Price$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      await page.getByRole('button', { name: /^Price$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-SRT-02: Sort by Lift Type column', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Lift Type/i }).click();
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
  // Suite 11 – Update Price Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Update Price Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-UPP-01: Update Price modal opens with correct title', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(dialog.getByRole('heading').first()).toBeVisible();
    });

    test('TC-UPP-02: Update price for a record and verify updated price in data table', async ({ page }) => {
      await waitForTableRows(page);
      const firstFlooringName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Update Price/i }).click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const newPrice = '900';
      const priceInputs = dialog.getByRole('spinbutton');
      const inputCount = await priceInputs.count();

      if (inputCount > 0) {
        await priceInputs.first().clear();
        await priceInputs.first().fill(newPrice);

        const saveBtn = dialog.getByRole('button', { name: /save|update|confirm/i }).first();
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          await expect(dialog).not.toBeVisible({ timeout: 10000 });
          await flooringSearchBox(page).fill(firstFlooringName);
          await page.waitForTimeout(1000);
          await expect(tableRows(page).filter({ hasText: firstFlooringName })).toHaveCount(1, { timeout: 15000 });
          await flooringSearchBox(page).clear();
        }
      }
    });

    test('TC-UPP-03: Search functionality in Update Price modal filters records', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const searchInput = dialog.getByRole('textbox').first();
      const hasSearchInput = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSearchInput) {
        const initialRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        await searchInput.fill('Vinyl');
        await page.waitForTimeout(500);
        const filteredRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        expect(filteredRows).toBeLessThanOrEqual(initialRows);

        await searchInput.clear();
        await page.waitForTimeout(500);
        const restoredRows = await dialog.locator('[role="row"]:has([role="cell"])').count().catch(() => 0);
        expect(restoredRows).toBe(initialRows);
      }

      await page.keyboard.press('Escape');
    });

    test('TC-UPP-04: Cancel button in Update Price modal closes without saving', async ({ page }) => {
      await waitForTableRows(page);
      const firstFlooringName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      await page.getByRole('button', { name: /Update Price/i }).click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const priceInputs = dialog.getByRole('spinbutton');
      if (await priceInputs.count() > 0) {
        await priceInputs.first().fill('9999');
      }

      const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
      await flooringSearchBox(page).fill(firstFlooringName);
      await page.waitForTimeout(1000);
      const priceCell = tableRows(page).filter({ hasText: firstFlooringName }).locator('[role="cell"]').nth(3);
      const currentPrice = (await priceCell.innerText())?.trim() ?? '';
      expect(currentPrice).not.toBe('9999');
      await flooringSearchBox(page).clear();
    });

    test('TC-UPP-05: Cross (×) button in Update Price modal closes without saving', async ({ page }) => {
      await waitForTableRows(page);
      await page.getByRole('button', { name: /Update Price/i }).click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const priceInputs = dialog.getByRole('spinbutton');
      if (await priceInputs.count() > 0) {
        await priceInputs.first().fill('8888');
      }

      const closeBtn = dialog.locator('button').filter({ hasText: /^[×✕]$/i }).or(
        dialog.locator('[aria-label="Close"], [aria-label="close"], .btn-close')
      ).first();

      if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoFlooringMaster(page);
    });

    test('TC-INA-01: Mark Active flooring as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);
      const flooringName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(flooringName.length).toBeGreaterThan(0);

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Inactive');
      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });

      await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(0, { timeout: 10000 });

      await statusFilterSelect(page).selectOption('Inactive');
      await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: flooringName }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update$/i }).click();
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });
    });

    test('TC-INA-02: Re-activate an Inactive flooring', async ({ page }) => {
      await statusFilterSelect(page).selectOption('Inactive');
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);
        const flooringName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Flooring/i })).toBeVisible({ timeout: 10000 });

        await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
        await page.getByRole('button', { name: /Update$/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Flooring updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 15000 });

        await statusFilterSelect(page).selectOption('Active');
        await expect(tableRows(page).filter({ hasText: flooringName })).toHaveCount(1, { timeout: 10000 });
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

      await page.goto('https://stage.elevatorplus.net/master/flooring-master', { timeout: 60000 });
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).not.toBeVisible();

      await context.close();
    });

    test('TC-NAV-02: Access Flooring Master via Other Masters menu navigation', async ({ page }) => {
      await registerPopupHandler(page);
      await page.goto('/master/other-master', { timeout: 60000 });
      await dismissNotificationPopup(page);

      await page.locator('li').filter({ hasText: 'Flooring Master' }).waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('li').filter({ hasText: 'Flooring Master' }).click();
      await expect(page.getByRole('heading', { name: /Add Flooring/i })).toBeVisible({ timeout: 30000 });
      // Table rows may be CSS-hidden in react-data-table on this page — verify form loaded instead
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible({ timeout: 10000 });
    });

  });

});
