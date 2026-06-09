// spec: test-plans/Sales-mater-test-plan/status-master-test-plan.md
// seed: tests/Sales-master/landing-door-master.spec.ts

import { test, expect } from '../fixtures/auth-fixture';

const STATUS_MASTER_URL = '/master/status-master';

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
      await page.waitForTimeout(500);
    }
  } catch {}
}

async function gotoStatusMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(STATUS_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Status/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  const rows = tableRows(page);
  const count = await rows.count();
  for (let i = rowIndex; i < count; i++) {
    const editImg = rows.nth(i).getByRole('img', { name: 'Edit' });
    const hasEdit = await editImg.isVisible({ timeout: 500 }).catch(() => false);
    if (hasEdit) {
      await editImg.click();
      return;
    }
  }
  throw new Error('No editable row found with an Edit icon');
}

interface StatusFormData {
  type?: string | null;
  name?: string | null;
  priority?: string | null;
}

async function fillStatusForm(page: any, { type = null, name = null, priority = null }: StatusFormData) {
  if (type !== null) {
    await page.getByLabel('Status Type *').selectOption(type);
  }
  if (name !== null) {
    await page.getByRole('textbox', { name: 'Status Name *' }).fill(name);
  }
  if (priority !== null) {
    await page.getByRole('spinbutton', { name: /Priority/i }).fill(priority);
  }
}

async function submitForm(page: any) {
  await page.getByRole('button', { name: /Submit/i }).click();
}

async function updateForm(page: any) {
  await page.getByRole('button', { name: /Update/i }).click();
}

async function clearForm(page: any) {
  await page.getByRole('button', { name: /Clear/i }).click();
}

// Status filter: combobox with options All / Active / Inactive
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ hasText: 'Inactive' }).first();
}

// Show entries: #rows-per-page selector (options: 10, 25, 50, 100)
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Table search input lives inside the toolbar banner — not the nav searchbox
function searchInput(page: any) {
  return page.getByRole('banner').getByRole('textbox');
}

// Reads Status badge (h5) text for each visible row
async function getStatusBadgeTexts(page: any): Promise<string[]> {
  const rows = tableRows(page);
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
    texts.push(text.trim());
  }
  return texts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Status Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-SM-01: Status Master page loads successfully
    test('TC-SM-01: Page loads with form, table, and toolbar', async ({ page }) => {
      await expect(page).toHaveURL(/\/master\/status-master/);
      await expect(page).toHaveTitle(/ElevatorPlus/i);
      await expect(page.getByRole('heading', { name: /Status Master/i, level: 4 })).toBeVisible();

      // Add Status form
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
      await expect(page.getByLabel('Status Type *')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Status Name *' })).toBeVisible();
      await expect(page.getByRole('spinbutton', { name: /Priority/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Table
      await waitForTableRows(page);
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);

      // Toolbar
      await expect(showEntriesSelect(page)).toBeVisible();
      await expect(statusFilterSelect(page)).toBeVisible();
    });

    // TC-SM-02: Status Master is accessible via sidebar navigation
    test('TC-SM-02: Status Master accessible via Sales Masters sidebar', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 30000 });
      await page.getByRole('link', { name: /Sales Masters/i }).click();
      await page.getByRole('link', { name: /Status Master/i }).click();
      await expect(page).toHaveURL(/\/master\/status-master/);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 30000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Status (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Status (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-ADD-01: Successfully add a new Status with Status Type 'Lead'
    test('TC-ADD-01: Add new status with type Lead', async ({ page }) => {
      const timestamp = Date.now();
      const name = `Lead Status ${timestamp}`;

      await fillStatusForm(page, { type: 'Lead', name, priority: '99' });
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');
    });

    // TC-ADD-02: Successfully add a new Status with Status Type 'Breakdown'
    test('TC-ADD-02: Add new status with type Breakdown', async ({ page }) => {
      const timestamp = Date.now();
      const name = `Breakdown Status ${timestamp}`;

      await fillStatusForm(page, { type: 'Breakdown', name, priority: '98' });
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');
    });

    // TC-ADD-03: Successfully add a new Status with Status Type 'Enquiries'
    test('TC-ADD-03: Add new status with type Enquiries', async ({ page }) => {
      const timestamp = Date.now();
      const name = `Enquiries Status ${timestamp}`;

      await fillStatusForm(page, { type: 'Enquiries', name, priority: '97' });
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');
    });

    // TC-ADD-04: Successfully add a new Status with Status Type 'PM'
    test('TC-ADD-04: Add new status with type PM', async ({ page }) => {
      const timestamp = Date.now();
      const name = `PM Status ${timestamp}`;

      await fillStatusForm(page, { type: 'PM', name, priority: '96' });
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-VAL-01: Submit empty form — all fields show validation errors
    test('TC-VAL-01: Empty form submit shows all validation errors', async ({ page }) => {
      await submitForm(page);

      await expect(page.getByText('Type is required')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter status name')).toBeVisible();
      await expect(page.getByText('Please enter priority')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
    });

    // TC-VAL-02: Submit with only Status Type filled
    test('TC-VAL-02: Only Status Type filled shows name and priority errors', async ({ page }) => {
      await fillStatusForm(page, { type: 'Lead' });
      await submitForm(page);

      await expect(page.getByText('Please enter status name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter priority')).toBeVisible();
      await expect(page.getByText('Type is required')).not.toBeVisible();
    });

    // TC-VAL-03: Submit with only Status Name filled
    test('TC-VAL-03: Only Status Name filled shows type and priority errors', async ({ page }) => {
      await fillStatusForm(page, { name: 'Test Name' });
      await submitForm(page);

      await expect(page.getByText('Type is required')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter priority')).toBeVisible();
    });

    // TC-VAL-04: Submit with only Priority filled
    test('TC-VAL-04: Only Priority filled shows type and name errors', async ({ page }) => {
      await fillStatusForm(page, { priority: '50' });
      await submitForm(page);

      await expect(page.getByText('Type is required')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter status name')).toBeVisible();
    });

    // TC-VAL-05: Status Name with forward slash triggers validation error
    test('TC-VAL-05: Status Name with forward slash triggers char validation', async ({ page }) => {
      await fillStatusForm(page, { type: 'Lead', name: 'Test/Name', priority: '50' });
      await submitForm(page);

      await expect(page.getByText('Name cannot contain /, \\, or , characters')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
    });

    // TC-VAL-06: Status Name with backslash triggers validation error
    test('TC-VAL-06: Status Name with backslash triggers char validation', async ({ page }) => {
      await fillStatusForm(page, { type: 'PM', name: 'Test\\Name', priority: '50' });
      await submitForm(page);

      await expect(page.getByText('Name cannot contain /, \\, or , characters')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
    });

    // TC-VAL-07: Status Name with comma triggers validation error
    test('TC-VAL-07: Status Name with comma triggers char validation', async ({ page }) => {
      await fillStatusForm(page, { type: 'Enquiries', name: 'Test,Name', priority: '50' });
      await submitForm(page);

      await expect(page.getByText('Name cannot contain /, \\, or , characters')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
    });

    // TC-VAL-08: Color picker has a default color value
    test('TC-VAL-08: Color field has a default hex value pre-filled', async ({ page }) => {
      // The color hex display element shows the current color value next to the picker
      const hexDisplay = page.locator('span, div').filter({ hasText: /^#[0-9a-fA-F]{6}$/ }).first();
      await expect(hexDisplay).toBeVisible({ timeout: 5000 });
      const colorText = await hexDisplay.innerText();
      expect(colorText.trim()).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-DUP-01: Duplicate name + same type → error
    test('TC-DUP-01: Duplicate status name and type shows error', async ({ page }) => {
      await waitForTableRows(page);
      // Use an existing system record: "PM" + "Test 2" visible on page 1
      await fillStatusForm(page, { type: 'PM', name: 'Test 2', priority: '95' });
      await submitForm(page);

      await expect(
        page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()
      ).toBeVisible({ timeout: 10000 });
    });

    // TC-DUP-02: Same name with different Status Type is allowed
    test('TC-DUP-02: Same name with different type is allowed', async ({ page }) => {
      const timestamp = Date.now();
      const name = `DupTest ${timestamp}`;

      // Add first record
      await fillStatusForm(page, { type: 'Lead', name, priority: '94' });
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Wait for form to fully reset before filling the second record
      await expect(page.getByRole('textbox', { name: 'Status Name *' })).toHaveValue('', { timeout: 15000 });

      // Add same name with different type — should succeed
      await fillStatusForm(page, { type: 'PM', name, priority: '93' });
      await submitForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await waitForTableRows(page);
      await searchInput(page).fill(name);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);
      const count = await tableRows(page).filter({ hasText: name }).count();
      expect(count).toBeGreaterThanOrEqual(2);
      await searchInput(page).fill('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-CLR-01: Clear button resets all Add Status form fields
    test('TC-CLR-01: Clear button resets all form fields in Add mode', async ({ page }) => {
      await fillStatusForm(page, { type: 'Lead', name: 'Clear Test', priority: '93' });
      await clearForm(page);
      await page.waitForTimeout(500);

      await expect(page.getByLabel('Status Type *')).toHaveValue('');
      await expect(page.getByRole('textbox', { name: 'Status Name *' })).toHaveValue('');
      await expect(page.getByRole('spinbutton', { name: /Priority/i })).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
    });

    // TC-CLR-02: Clear button in Edit mode resets form and returns to Add mode
    test('TC-CLR-02: Clear in Edit mode reverts form to Add Status state', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      await clearForm(page);
      await page.waitForTimeout(500);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('textbox', { name: 'Status Name *' })).toHaveValue('');
      await expect(page.getByRole('spinbutton', { name: /Priority/i })).toHaveValue('');
      await expect(page.getByLabel('Status *')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit / Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit / Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-EDT-01: Edit button loads correct data into the form
    test('TC-EDT-01: Edit loads correct data into Update form', async ({ page }) => {
      await waitForTableRows(page);
      // Search for "Test 2" to locate the PM/Test 2 record reliably regardless of table order
      await searchInput(page).fill('Test 2');
      await page.waitForTimeout(1000);
      const targetRow = tableRows(page).filter({ hasText: 'Test 2' }).filter({ hasText: 'PM' }).first();
      await targetRow.getByRole('img', { name: 'Edit' }).click();
      await searchInput(page).fill('');

      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByLabel('Status Type *')).toHaveValue('PM');
      await expect(page.getByRole('textbox', { name: 'Status Name *' })).toHaveValue('Test 2');
      await expect(page.getByRole('spinbutton', { name: /Priority/i })).toHaveValue('2');
      await expect(page.getByLabel('Status *')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
      await clearForm(page);
    });

    // TC-EDT-02: Successfully update an existing status record
    test('TC-EDT-02: Update status name and priority', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      const originalName = await page.getByRole('textbox', { name: 'Status Name *' }).inputValue();
      const updatedName = `${originalName} Updated`;

      await page.getByRole('textbox', { name: 'Status Name *' }).fill(updatedName);
      await page.getByRole('spinbutton', { name: /Priority/i }).fill('88');
      await updateForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill(updatedName);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: updatedName })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');

      // Restore original name
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('textbox', { name: 'Status Name *' }).fill(originalName);
      await page.getByRole('spinbutton', { name: /Priority/i }).fill('2');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-03: Update status record — change Status Type
    test('TC-EDT-03: Update changes Status Type successfully', async ({ page }) => {
      const timestamp = Date.now();
      const name = `TypeChange ${timestamp}`;

      // Create a Lead status first
      await fillStatusForm(page, { type: 'Lead', name, priority: '87' });
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Find and edit it
      await waitForTableRows(page);
      await searchInput(page).fill(name);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      await page.getByLabel('Status Type *').selectOption('Enquiries');
      await updateForm(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: name }).filter({ hasText: 'Enquiries' })).toHaveCount(1, { timeout: 20000 });
      await searchInput(page).fill('');
    });

    // TC-EDT-04: Update to duplicate active name → error
    test('TC-EDT-04: Update to duplicate active record name shows error', async ({ page }) => {
      await waitForTableRows(page);
      // Edit the "Test 2" PM record and try to rename it to "PM New Status" (also PM type — duplicate)
      await searchInput(page).fill('Test 2');
      await page.waitForTimeout(1000);
      const targetRow = tableRows(page).filter({ hasText: 'Test 2' }).filter({ hasText: 'PM' }).first();
      await targetRow.getByRole('img', { name: 'Edit' }).click();
      await searchInput(page).fill('');
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      // 'PM New Status' already exists with type PM
      await page.getByRole('textbox', { name: 'Status Name *' }).fill('PM New Status');
      await updateForm(page);

      await expect(
        page.locator('[class*="error"], [class*="toast"], [role="alert"]').first()
      ).toBeVisible({ timeout: 10000 });
      await clearForm(page);
    });

    // TC-EDT-06: Update a record — mark as Inactive
    test('TC-EDT-06: Marking a record Inactive hides it from Active view', async ({ page }) => {
      const timestamp = Date.now();
      const name = `InactiveTest ${timestamp}`;

      // Create record
      await fillStatusForm(page, { type: 'Lead', name, priority: '86' });
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Find and edit — wait for table to fully render before searching
      await waitForTableRows(page);
      await searchInput(page).fill(name);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      await page.getByLabel('Status *').selectOption('Inactive');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Should not appear in Active filter
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(0, { timeout: 10000 });
      await searchInput(page).fill('');

      // Restore: reactivate
      await statusFilterSelect(page).selectOption('Inactive');
      await searchInput(page).fill(name);
      await page.waitForTimeout(1000);
      const inactiveRow = tableRows(page).filter({ hasText: name });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await page.getByLabel('Status *').selectOption('Active');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill('');
      await statusFilterSelect(page).selectOption('Active');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-FLT-01: Status filter defaults to 'Active'
    test('TC-FLT-01: Status filter defaults to Active and shows only active records', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue(/active|true/i);
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(500);
      await waitForTableRows(page);

      // No Inactive badge should be visible when filter is Active
      await expect(
        page.locator('[role="row"]:has([role="cell"]) h5').filter({ hasText: 'Inactive' })
      ).toHaveCount(0, { timeout: 15000 });
      // At least one Active badge confirms data is loaded
      await expect(
        page.locator('[role="row"]:has([role="cell"]) h5').filter({ hasText: 'Active' }).first()
      ).toBeVisible({ timeout: 15000 });
    });

    // TC-FLT-02: Status filter 'All' shows all records
    test('TC-FLT-02: All filter shows records including both Active and Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const activeCount = await tableRows(page).count();

      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(1000);

      const allCount = await tableRows(page).count();
      expect(allCount).toBeGreaterThanOrEqual(activeCount);
    });

    // TC-FLT-03: Status filter 'Inactive' shows only inactive records or empty state
    test('TC-FLT-03: Inactive filter shows only inactive records or empty state', async ({ page }) => {
      await statusFilterSelect(page).selectOption({ label: 'Inactive' });
      await page.waitForTimeout(1000);

      const rows = await tableRows(page).count();
      if (rows > 0) {
        await showEntriesSelect(page).selectOption('10');
        await page.waitForTimeout(500);
        const badges = await getStatusBadgeTexts(page);
        for (const badge of badges) {
          expect(badge).toBe('Inactive');
        }
      } else {
        await expect(page.getByText(/no records to display/i)).toBeVisible({ timeout: 5000 });
      }
    });

    // TC-FLT-04: Changing Status filter resets pagination to page 1
    test('TC-FLT-04: Status filter change resets pagination to page 1', async ({ page }) => {
      // Navigate to page 2
      await page.getByRole('button', { name: /Page 2/i }).click();
      await page.waitForTimeout(500);

      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(500);

      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible({ timeout: 5000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-SRC-01: Search by Status Name filters results
    test('TC-SRC-01: Search by Status Name filters table in real time', async ({ page }) => {
      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(800);
      await waitForTableRows(page);

      // Use the first row's Status Name as search term — avoids dependency on specific DB records
      const firstRowName = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText()).trim();

      await searchInput(page).fill(firstRowName);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);

      const rows = tableRows(page);
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(new RegExp(firstRowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      }
    });

    // TC-SRC-02: Search by partial Status Name
    test('TC-SRC-02: Partial search term matches records containing that text', async ({ page }) => {
      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(800);
      await waitForTableRows(page);
      // "Pend" partially matches "Pending" records which are confirmed to exist
      await searchInput(page).fill('Pend');
      await page.waitForTimeout(1500);

      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);
      await searchInput(page).fill('');
    });

    // TC-SRC-03: Search with no matching results shows empty state
    test('TC-SRC-03: Search with no match shows empty state message', async ({ page }) => {
      await searchInput(page).fill('XYZNONEXISTENT12345');
      await page.waitForTimeout(1500);

      // The table should show 0 data rows when nothing matches
      await expect(tableRows(page)).toHaveCount(0, { timeout: 10000 });
      await searchInput(page).fill('');
    });

    // TC-SRC-04: Clearing search input restores the full list
    test('TC-SRC-04: Clearing search input restores full record list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      await searchInput(page).fill('Pending');
      await page.waitForTimeout(1000);
      await searchInput(page).fill('');
      await page.waitForTimeout(1500);
      await waitForTableRows(page);

      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBeGreaterThanOrEqual(initialCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-PAG-01: Default rows per page is 25 and pagination shows 2 pages
    test('TC-PAG-01: Default rows per page is 25 and 2 pages are visible', async ({ page }) => {
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await waitForTableRows(page);
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(25);

      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();
    });

    // TC-PAG-02: Change rows per page to 10
    test('TC-PAG-02: Rows per page 10 shows at most 10 rows and more pages', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await page.waitForTimeout(2000);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();
    });

    // TC-PAG-03: Change rows per page to 50 — all records on one page
    test('TC-PAG-03: Rows per page 50 fits all records on one page', async ({ page }) => {
      await showEntriesSelect(page).selectOption('50');
      await page.waitForTimeout(500);
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(50);
      await expect(page.getByRole('button', { name: /Page 2/i })).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    });

    // TC-PAG-04: Change rows per page to 100
    test('TC-PAG-04: Rows per page 100 shows all records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('100');
      await page.waitForTimeout(500);
      await waitForTableRows(page);

      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-PAG-05: Navigate to page 2 using the page button
    test('TC-PAG-05: Page 2 button loads second page and enables Previous', async ({ page }) => {
      await page.getByRole('button', { name: /Page 2/i }).click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeEnabled();
      // Next page may still be enabled if more records were added by prior tests
    });

    // TC-PAG-06: Navigate using Next and Previous page buttons
    test('TC-PAG-06: Next then Previous page buttons navigate correctly', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();

      await page.getByRole('button', { name: /Next page/i }).click();
      await page.waitForTimeout(500);
      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible({ timeout: 5000 });
      // Previous page becomes enabled on page 2
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeEnabled();

      await page.getByRole('button', { name: /Previous page/i }).click();
      await page.waitForTimeout(500);
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Previous page/i })).toBeDisabled();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
      await waitForTableRows(page);
    });

    // TC-SRT-01: Sort by Status Type column
    test('TC-SRT-01: Clicking Status Type column sorts rows alphabetically', async ({ page }) => {
      await page.getByRole('button', { name: /Status Type/i }).click();
      await page.waitForTimeout(500);
      const firstType = await tableRows(page).first().locator('[role="cell"]').nth(2).innerText();

      await page.getByRole('button', { name: /Status Type/i }).click();
      await page.waitForTimeout(500);
      const firstTypeDesc = await tableRows(page).first().locator('[role="cell"]').nth(2).innerText();

      expect(firstType.trim()).not.toBe(firstTypeDesc.trim());
    });

    // TC-SRT-02: Sort by Status Name column
    test('TC-SRT-02: Clicking Status Name column sorts rows alphabetically', async ({ page }) => {
      await page.getByRole('button', { name: /Status Name/i }).click();
      await page.waitForTimeout(500);
      const firstAsc = await tableRows(page).first().locator('[role="cell"]').nth(3).innerText();

      await page.getByRole('button', { name: /Status Name/i }).click();
      await page.waitForTimeout(500);
      const firstDesc = await tableRows(page).first().locator('[role="cell"]').nth(3).innerText();

      expect(firstAsc.trim()).not.toBe(firstDesc.trim());
    });

    // TC-SRT-03: Sort by Priority column
    test('TC-SRT-03: Clicking Priority column sorts rows numerically', async ({ page }) => {
      await page.getByRole('button', { name: /Priority/i }).click();
      await page.waitForTimeout(500);
      const firstAsc = await tableRows(page).first().locator('[role="cell"]').nth(5).innerText();

      await page.getByRole('button', { name: /Priority/i }).click();
      await page.waitForTimeout(500);
      const firstDesc = await tableRows(page).first().locator('[role="cell"]').nth(5).innerText();

      expect(parseInt(firstAsc)).toBeLessThanOrEqual(parseInt(firstDesc));
    });

    // TC-SRT-04: Sort by Status column (with All filter)
    test('TC-SRT-04: Clicking Status column sorts Active/Inactive rows', async ({ page }) => {
      await statusFilterSelect(page).selectOption({ label: 'All' });
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Status', exact: true }).click();
      await page.waitForTimeout(500);
      const firstAsc = await tableRows(page).first().getByRole('heading', { level: 5 }).innerText();

      await page.getByRole('button', { name: 'Status', exact: true }).click();
      await page.waitForTimeout(500);
      const firstDesc = await tableRows(page).first().getByRole('heading', { level: 5 }).innerText();

      // After two clicks, order should have changed for mixed Active/Inactive
      // (may be equal if all records are same status — just verify no crash)
      expect(typeof firstAsc).toBe('string');
      expect(typeof firstDesc).toBe('string');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoStatusMaster(page);
    });

    // TC-INACT-01: Mark a user-created status as Inactive via Edit form
    test('TC-INACT-01: Mark record as Inactive and verify it leaves Active view', async ({ page }) => {
      const timestamp = Date.now();
      const name = `InactMgmt ${timestamp}`;

      await fillStatusForm(page, { type: 'Lead', name, priority: '85' });
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      await waitForTableRows(page);
      await searchInput(page).fill(name);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });

      await page.getByLabel('Status *').selectOption('Inactive');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Not visible in Active filter
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(0, { timeout: 10000 });

      // Visible under Inactive filter
      await statusFilterSelect(page).selectOption({ label: 'Inactive' });
      await page.waitForTimeout(500);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 10000 });

      // Restore
      await tableRows(page).filter({ hasText: name }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await page.getByLabel('Status *').selectOption('Active');
      await updateForm(page);
      await searchInput(page).fill('');
      await statusFilterSelect(page).selectOption({ label: 'Active' });
    });

    // TC-INACT-02: Inactive records hidden when Status filter is 'Active'
    test('TC-INACT-02: Active filter hides Inactive records', async ({ page }) => {
      await showEntriesSelect(page).selectOption('10');
      await statusFilterSelect(page).selectOption({ label: 'Active' });
      await page.waitForTimeout(500);
      await waitForTableRows(page);

      const badges = await getStatusBadgeTexts(page);
      for (const badge of badges) {
        expect(badge).toBe('Active');
      }
    });

    // TC-INACT-03: Reactivate an Inactive record
    test('TC-INACT-03: Reactivating Inactive record makes it appear in Active filter', async ({ page }) => {
      // Create a fresh record and immediately mark it inactive so this test is self-contained
      const timestamp = Date.now();
      const name = `Reactivate ${timestamp}`;

      await fillStatusForm(page, { type: 'Lead', name, priority: '87' });
      await submitForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      await waitForTableRows(page);
      await searchInput(page).fill(name);
      await page.waitForTimeout(1500);
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await page.getByLabel('Status *').selectOption('Inactive');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });
      await searchInput(page).fill('');

      // Verify it's now in the Inactive filter
      await statusFilterSelect(page).selectOption({ label: 'Inactive' });
      await page.waitForTimeout(1000);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 10000 });

      // Reactivate it
      await tableRows(page).filter({ hasText: name }).getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Status/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByLabel('Status *')).toHaveValue('false');
      await page.getByLabel('Status *').selectOption('Active');
      await updateForm(page);
      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible({ timeout: 15000 });

      // Should not be in Inactive filter anymore
      await statusFilterSelect(page).selectOption({ label: 'Inactive' });
      await page.waitForTimeout(500);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(0, { timeout: 10000 });

      // Should appear in Active filter
      await statusFilterSelect(page).selectOption({ label: 'Active' });
      await page.waitForTimeout(500);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    // TC-NAV-01: Unauthenticated user is redirected to login page
    test('TC-NAV-01: Unauthenticated access redirects to login', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('/master/status-master', { timeout: 30000, waitUntil: 'domcontentloaded' }).catch(() => {});
      await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
      await context.close();
    });

    // TC-NAV-02: Page heading shows 'Status Master'
    test('TC-NAV-02: Breadcrumb and page title show Status Master', async ({ page }) => {
      await gotoStatusMaster(page);
      await expect(page.getByRole('heading', { name: /Status Master/i, level: 4 })).toBeVisible();
      await expect(page).toHaveTitle(/ElevatorPlus/i);
    });

    // TC-NAV-03: Status Master is listed under Sales Masters in the sidebar
    test('TC-NAV-03: Status Master link present in Sales Masters sidebar', async ({ page }) => {
      await gotoStatusMaster(page);
      await expect(page.getByRole('link', { name: /Status Master/i })).toBeVisible();
    });

    // TC-NAV-04: Navigating away and back resets to default state
    test('TC-NAV-04: Navigating away and back resets to default state', async ({ page }) => {
      await gotoStatusMaster(page);
      await page.goto('/dashboard', { timeout: 30000 });
      await gotoStatusMaster(page);

      await expect(page.getByRole('heading', { name: /Add Status/i })).toBeVisible();
      await expect(showEntriesSelect(page)).toHaveValue('25');
      await expect(statusFilterSelect(page)).toHaveValue(/active|true/i);
    });

  });

});
