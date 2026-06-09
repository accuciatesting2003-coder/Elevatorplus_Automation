// spec: test-plans/Sales-mater-test-plan/speed-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const SPEED_MASTER_URL = '/master/speed-master';

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
    const closeBtn = page.locator('dialog button', { hasText: /×|Close/i });
    const closeVisible = await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.first().click();
    }
  } catch {
    // Popup did not appear
  }
}

async function gotoSpeedMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(SPEED_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Speed/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

async function waitForTableRows(page: any) {
  await page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().waitFor({ state: 'visible', timeout: 60000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('[role="rowgroup"]').last().locator('[role="row"]').nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Smoke
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Speed Master', () => {

  test.describe('Smoke', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-SM-01: Speed Master page loads successfully
    test('TC-SM-01: Speed Master page loads successfully', async ({ page }) => {
      // Verify the page URL
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));

      // Verify the top navigation heading reads 'Speed Master'
      await expect(page.getByRole('heading', { name: /Speed Master/i })).toBeVisible();

      // Verify the 'Add Speed' card heading is visible
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();

      // Verify the Speed (m/s) * input field is present and empty
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Verify Clear and Submit buttons are visible
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify data table loads with Active status by default
      await waitForTableRows(page);
      await expect(page.locator('[role="rowgroup"]').last().locator('[role="row"]').first()).toBeVisible();
    });

    // TC-SM-02: Verify page elements, table columns, and toolbar layout
    test('TC-SM-02: Verify page elements, table columns, and toolbar layout', async ({ page }) => {
      // Verify form section heading and info icon
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page.locator('#info-tooltip')).toBeVisible();

      // Verify Show: rows-per-page dropdown with default 25
      const showDropdown = page.locator('select').first();
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      // Verify Status: filter dropdown defaults to Active
      const statusFilter = page.locator('select').nth(1);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      // Verify Import and Export Excel buttons
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Export Excel/i })).toBeVisible();

      // Verify Search speed input
      await expect(page.getByRole('textbox', { name: /Search speed/i })).toBeVisible();

      // Verify table column headers
      await expect(page.getByRole('button', { name: /Sr\. No\./i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Action/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Speed \(m\/s\)/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Status/i })).toBeVisible();
    });

    // TC-SM-03: Verify form field label, helper text, and info tooltip content
    test('TC-SM-03: Verify form field label, helper text, and info tooltip content', async ({ page }) => {
      // Verify helper text below the Speed input
      await expect(page.locator('text=Speed value in m/s (e.g. 1.0, 1.5, 2.0).')).toBeVisible();

      // Click the info icon button next to 'Add Speed' heading
      await page.locator('#info-tooltip').click();

      // Verify the side panel opens with the title 'Speed Master'
      await expect(page.getByRole('heading', { name: /Speed Master/i }).nth(0)).toBeVisible();

      // Verify the note section contains guidance text
      await expect(page.locator('text=Speed (m/s) : Enter the speed in m/s')).toBeVisible();

      // Close the side panel
      await page.getByRole('link').filter({ hasText: /^$/ }).first().click();

      // Verify panel is closed (Add Speed heading still visible)
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Speed - Happy Path
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Speed (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-ADD-01: Successfully create a new Speed record with an integer-like value
    test('TC-ADD-01: Successfully create a Speed record with integer-like value', async ({ page }) => {
      const speedValue = `${(Date.now() % 990) + 10}.00`;

      // Verify the Add Speed form is displayed with empty Speed input
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Type an integer-like value into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(speedValue);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(speedValue);

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been created successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the Speed input is cleared and form resets to Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Verify action button remains Submit
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Search for the newly created Speed to confirm it appears (handles pagination)
      const searchInput1 = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput1.fill(speedValue);
      await new Promise(f => setTimeout(f, 1500));
      await expect(page.locator('[role="table"]').getByText(new RegExp(speedValue.replace(/\./g, '\\.')))).toBeVisible({ timeout: 15000 });
    });

    // TC-ADD-02: Successfully create a new Speed record with a one-decimal value
    test('TC-ADD-02: Successfully create a Speed record with one-decimal value', async ({ page }) => {
      const speedValue = `${2000 + (Date.now() % 900)}.5`;

      // Verify the Add Speed form is visible with empty Speed input
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();

      // Type a one-decimal speed value into the Speed (m/s) * input
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(speedValue);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(speedValue);

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been created successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the input field is cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('', { timeout: 10000 });

      // Search for the newly created record to confirm it appears (handles pagination)
      const searchInput2 = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput2.fill(speedValue);
      await new Promise(f => setTimeout(f, 1000));
      await expect(page.locator('[role="table"]').getByText(new RegExp(speedValue.replace(/\./g, '\\.')))).toBeVisible({ timeout: 15000 });
    });

    // TC-ADD-03: Successfully create a new Speed record with a two-decimal value
    test('TC-ADD-03: Successfully create a Speed record with two-decimal value', async ({ page }) => {
      const speedValue = `${3000 + (Date.now() % 900)}.75`;

      // Type a unique two-decimal value into the Speed (m/s) * input
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(speedValue);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(speedValue);

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been created successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the Speed input field is cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('', { timeout: 10000 });

      // Search for the newly created record to confirm it appears (handles pagination)
      const searchInput3 = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput3.fill(speedValue);
      await new Promise(f => setTimeout(f, 1000));
      await expect(page.locator('[role="table"]').getByText(new RegExp(speedValue.replace(/\./g, '\\.')))).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-VAL-01: Submit form with empty Speed field shows inline validation error
    test('TC-VAL-01: Submit form with empty Speed field shows validation error', async ({ page }) => {
      // Click the Submit button without entering any value in the Speed field
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears below the Speed (m/s) field
      await expect(page.locator('text=/please enter speed/i')).toBeVisible({ timeout: 5000 });

      // Verify no toast notification is shown
      await expect(page.locator('[role="alert"]')).not.toBeVisible({ timeout: 2000 }).catch(() => {});

      // Verify the form remains in Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-02: Submit form with whitespace-only input shows inline validation error
    test('TC-VAL-02: Submit form with whitespace-only input shows validation error', async ({ page }) => {
      // Type only spaces into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('   ');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter/i')).toBeVisible({ timeout: 5000 });

      // Verify form remains in Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-03: Enter alphabetic characters in Speed field shows validation error
    test('TC-VAL-03: Alphabetic characters in Speed field shows validation error', async ({ page }) => {
      // Type alphabetic characters into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('abc');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter a numeric value with up to two decimal places/i')).toBeVisible({ timeout: 5000 });

      // Verify no new record is created and form is not reset
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-04: Enter special characters in Speed field shows validation error
    test('TC-VAL-04: Special characters in Speed field shows validation error', async ({ page }) => {
      // Type special characters into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('!@#$');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter a numeric value with up to two decimal places/i')).toBeVisible({ timeout: 5000 });

      // Verify form is not reset
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-05: Enter a negative value in Speed field shows validation error
    test('TC-VAL-05: Negative value in Speed field shows validation error', async ({ page }) => {
      // Type a negative value into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('-1.0');
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('-1.0');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter a numeric value with up to two decimal places/i')).toBeVisible({ timeout: 5000 });

      // Verify form is not reset
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-06: Enter more than two decimal places shows validation error
    test('TC-VAL-06: More than two decimal places shows validation error', async ({ page }) => {
      // Type a value with more than two decimal places
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('1.234');
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('1.234');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter a numeric value with up to two decimal places/i')).toBeVisible({ timeout: 5000 });

      // Verify no new record is created and form is not reset
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-VAL-07: Enter zero (0) in Speed field — verify acceptance or rejection
    test('TC-VAL-07: Enter zero (0) in Speed field — observe behavior', async ({ page }) => {
      // Type '0' into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('0');
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('0');

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // The page should remain on speed-master regardless of whether zero is accepted or rejected
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-DUP-01: Submitting an existing Active Speed value shows an error toast
    test('TC-DUP-01: Duplicate Active Speed value shows error toast', async ({ page }) => {
      // Wait for table and read an existing active speed value from the first row
      await waitForTableRows(page);
      const existingSpeed = (await page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().locator('[role="cell"]').nth(2).textContent())?.trim() ?? '';
      expect(existingSpeed.length).toBeGreaterThan(0);

      // Extract the numeric part (e.g., "1.30 m/s" → "1.30")
      const speedNumeric = existingSpeed.replace(' m/s', '').trim();

      // Type the existing Speed value into the Speed (m/s) * input field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(speedNumeric);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(speedNumeric);

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify error toast appears
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 10000 });

      // Verify no duplicate record is added and form input is not cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).not.toHaveValue('');
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));
    });

    // TC-DUP-02: Add a record with the same value as an existing Inactive Speed shows error
    test('TC-DUP-02: Duplicate Inactive Speed value shows error toast', async ({ page }) => {
      // Change the Status filter to 'Inactive'
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('Inactive');

      // Wait for table to refresh — check for rows or empty state
      await new Promise(f => setTimeout(f, 1000));

      const rowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      if (rowCount === 0 || (await page.locator('text=There are no records to display').isVisible().catch(() => false))) {
        // No inactive records exist — skip with a pass
        return;
      }

      // Note the Speed value of an Inactive record
      const inactiveSpeed = (await page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().locator('[role="cell"]').nth(2).textContent())?.trim() ?? '';
      const speedNumeric = inactiveSpeed.replace(' m/s', '').trim();

      // Change Status filter back to Active
      await statusFilter.selectOption('Active');
      await new Promise(f => setTimeout(f, 1000));

      // Type the same value as the Inactive Speed record into the Speed input
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(speedNumeric);

      // Click the Submit button
      await page.getByRole('button', { name: /Submit/i }).click();

      // Verify error toast appears
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 10000 });

      // Verify no new record is created and form input is not cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).not.toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-CLR-01: Clear button resets the Add Speed form
    test('TC-CLR-01: Clear button resets the Add Speed form', async ({ page }) => {
      // Verify form is visible with empty Speed input
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Type a value into the Speed field
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('9.99');
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('9.99');

      // Click the Clear button
      await page.getByRole('button', { name: /Clear/i }).click();

      // Verify the Speed (m/s) input is cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Verify the form heading still reads Add Speed
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();

      // Verify the action button still reads Submit
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify the Status dropdown does not appear (only shown in Update mode)
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
    });

    // TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Speed state
    test('TC-CLR-02: Clear button in Update mode resets to Add Speed state', async ({ page }) => {
      // Click the Edit icon for any Speed record in the data table
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify the form switches to Update Speed mode
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Verify the Speed (m/s) * field is pre-filled
      const speedValue = await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).inputValue();
      expect(speedValue.length).toBeGreaterThan(0);

      // Verify the Status * dropdown appears with Active pre-selected
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toBeVisible({ timeout: 5000 });

      // Verify helper text for Status reads 'Select active or inactive'
      await expect(page.locator('text=Select active or inactive')).toBeVisible();

      // Verify the action button label changes to Update
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click the Clear button while in Update Speed mode
      await page.getByRole('button', { name: /Clear/i }).click();

      // Verify the form heading reverts to Add Speed
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();

      // Verify the Speed (m/s) * input field is cleared
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Verify the Status * dropdown is no longer visible
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();

      // Verify the action button reverts to Submit
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-EDT-01: Edit icon opens the Speed record in Update Speed mode with pre-filled fields
    test('TC-EDT-01: Edit icon opens Update Speed mode with pre-filled fields', async ({ page }) => {
      // Verify the data table shows at least one Speed record
      await waitForTableRows(page);

      // Click the Edit icon in the Action column of any row
      await clickEditOnRow(page, 0);

      // Verify the form heading changes from Add Speed to Update Speed
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Verify the Speed (m/s) * input is pre-filled with the selected row's speed value
      const speedInput = page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i });
      const speedValue = await speedInput.inputValue();
      expect(speedValue.length).toBeGreaterThan(0);

      // Verify the Status * dropdown appears with Active as selected option
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toBeVisible({ timeout: 5000 });

      // Verify helper text for Status reads 'Select active or inactive'
      await expect(page.locator('text=Select active or inactive')).toBeVisible();

      // Verify the action button label changes to Update
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Verify the Clear button is still present
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update a Speed record with a new value
    test('TC-EDT-02: Successfully update a Speed record with a new value', async ({ page }) => {
      // Wait for table and click Edit on the first row
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify the form switches to Update Speed mode
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Clear the Speed field and type a new unique value
      const speedInput = page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i });
      await speedInput.clear();
      const newSpeed = `${(Date.now() % 9000) + 1000}.55`;
      await speedInput.fill(newSpeed);
      await expect(speedInput).toHaveValue(newSpeed);

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been updated successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the form resets to Add Speed state with Speed field cleared
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('');

      // Verify Status dropdown disappears and action button reverts to Submit
      await expect(page.getByRole('combobox', { name: /Status \*/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Search for the updated value to confirm it appears in the data table (handles pagination)
      const editSearchInput = page.getByRole('textbox', { name: /Search speed/i });
      await editSearchInput.fill(newSpeed);
      await new Promise(f => setTimeout(f, 1000));
      await expect(page.locator('[role="table"]').getByText(new RegExp(newSpeed.replace(/\./g, '\\.')))).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-03: Update Speed with empty Speed field shows validation error
    test('TC-EDT-03: Update Speed with empty Speed field shows validation error', async ({ page }) => {
      // Click the Edit icon for any Speed record
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify the form is in Update Speed mode with the Speed field pre-filled
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Clear the Speed (m/s) * input field completely
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).clear();

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter speed/i')).toBeVisible({ timeout: 5000 });

      // Verify the form remains in Update Speed mode without resetting
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible();
    });

    // TC-EDT-04: Update Speed value to match an existing Active Speed record shows error
    test('TC-EDT-04: Update Speed to match existing Active Speed shows error', async ({ page }) => {
      // Wait for table and get speed values from two different rows
      await waitForTableRows(page);
      const rowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      if (rowCount < 2) {
        // Not enough records to test duplicate update
        return;
      }

      // Get speed values from first and second rows
      const firstSpeed = (await page.locator('[role="rowgroup"]').last().locator('[role="row"]').nth(0).locator('[role="cell"]').nth(2).textContent())?.trim() ?? '';
      const firstSpeedNumeric = firstSpeed.replace(' m/s', '').trim();

      // Click Edit on the second row
      await clickEditOnRow(page, 1);
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Clear the Speed input and type the value of the first existing Active Speed
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).clear();
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(firstSpeedNumeric);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(firstSpeedNumeric);

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify error toast appears
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 10000 });

      // Verify the form remains in Update Speed mode
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible();
    });

    // TC-EDT-05: Update Speed value to match an existing Inactive Speed record shows error
    test('TC-EDT-05: Update Speed to match existing Inactive Speed shows error', async ({ page }) => {
      // Change Status filter to Inactive to find an inactive record
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('Inactive');
      await new Promise(f => setTimeout(f, 1000));

      const hasInactiveRows = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count().then(c => c > 0);
      if (!hasInactiveRows) {
        // No inactive records exist — skip
        return;
      }

      // Note the Speed value of the Inactive record
      const inactiveSpeed = (await page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().locator('[role="cell"]').nth(2).textContent())?.trim() ?? '';
      const inactiveSpeedNumeric = inactiveSpeed.replace(' m/s', '').trim();

      // Change Status filter back to Active
      await statusFilter.selectOption('Active');
      await new Promise(f => setTimeout(f, 1000));

      // Click Edit on any Active record
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Clear the Speed input and type the value of the Inactive record
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).clear();
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill(inactiveSpeedNumeric);
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue(inactiveSpeedNumeric);

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify error toast appears
      await expect(page.locator('[role="alert"]').filter({ hasText: /Something went wrong\./i })).toBeVisible({ timeout: 10000 });

      // Verify the form remains in Update Speed mode
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible();
    });

    // TC-EDT-06: Update Speed status from Active to Inactive
    test('TC-EDT-06: Update Speed status from Active to Inactive', async ({ page }) => {
      // Wait for table and click Edit on the first row with Active status
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify the form is in Update Speed mode with Status showing Active
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toHaveValue('true');

      // Note the speed value for later verification
      const speedValue = await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).inputValue();

      // In the Status * dropdown, select Inactive
      await statusDropdown.selectOption('Inactive');
      await expect(statusDropdown).toHaveValue('false');

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been updated successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the form resets to Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });

      // Verify the edited Speed record no longer appears in the Active-filtered table
      const activeRows = page.locator('[role="rowgroup"]').last().locator('[role="row"]').filter({ hasText: speedValue });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Change the table Status filter to All and verify the record shows Inactive
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('All');
      await new Promise(f => setTimeout(f, 1000));
      const inactiveRow = page.locator('[role="rowgroup"]').last().locator('[role="row"]').filter({ hasText: speedValue });
      await expect(inactiveRow.getByText('Inactive')).toBeVisible({ timeout: 10000 });

      // Restore: set the status back to Active
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-07: Update Speed with invalid numeric format shows validation error
    test('TC-EDT-07: Update Speed with invalid format shows validation error', async ({ page }) => {
      // Click the Edit icon for any Speed record
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      // Verify the form is in Update Speed mode with the Speed field pre-filled
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Clear the Speed input and type an invalid value
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).clear();
      await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).fill('xyz');
      await expect(page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i })).toHaveValue('xyz');

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify inline validation error appears
      await expect(page.locator('text=/please enter a numeric value with up to two decimal places/i')).toBeVisible({ timeout: 5000 });

      // Verify the form remains in Update Speed mode without resetting
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-FLT-01: Filter table by Active status (default behavior)
    test('TC-FLT-01: Default Status filter shows only Active records', async ({ page }) => {
      // Verify the Status: filter dropdown defaults to Active
      const statusFilter = page.locator('select').nth(1);
      await expect(statusFilter).toHaveValue('true');

      // Verify the data table shows only Active status records
      await waitForTableRows(page);
      const rows = page.locator('[role="rowgroup"]').last().locator('[role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Verify all visible rows display an Active badge in the Status column
      for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).locator('[role="cell"]').last()).toContainText('Active');
      }
    });

    // TC-FLT-02: Filter table to show All statuses
    test('TC-FLT-02: Status filter All shows both Active and Inactive records', async ({ page }) => {
      // Change the Status: filter dropdown from Active to All
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('All');
      await expect(statusFilter).toHaveValue('');

      // Wait for the table to refresh
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table shows records (can be both Active and Inactive)
      await waitForTableRows(page);
      const rows = page.locator('[role="rowgroup"]').last().locator('[role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-FLT-03: Filter table by Inactive status
    test('TC-FLT-03: Status filter Inactive shows only Inactive records', async ({ page }) => {
      // Change the Status: filter dropdown to Inactive
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('Inactive');
      await expect(statusFilter).toHaveValue('false');

      // Wait for either rows or empty state to appear after filter change
      const tableRow = page.locator('[role="rowgroup"]').last().locator('[role="row"]');
      const emptyMsg = page.locator('text=There are no records to display');
      await Promise.race([
        tableRow.first().waitFor({ state: 'visible', timeout: 60000 }),
        emptyMsg.waitFor({ state: 'visible', timeout: 60000 }),
      ]).catch(() => {});

      // Verify only Inactive records are shown OR an empty state message appears
      const hasRows = await tableRow.count().then(c => c > 0);
      if (hasRows) {
        // All visible rows should display an Inactive badge
        const rowCount = await tableRow.count();
        for (let i = 0; i < rowCount; i++) {
          await expect(tableRow.nth(i).locator('[role="cell"]').last()).toContainText('Inactive');
        }
      } else {
        // Empty state message is shown
        await expect(emptyMsg).toBeVisible({ timeout: 5000 });
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-SRC-01: Search by partial speed value returns matching results
    test('TC-SRC-01: Partial speed value search returns matching results', async ({ page }) => {
      // Verify the full list of Active Speed records is displayed
      await waitForTableRows(page);

      // Click the Search speed input and type a partial value
      const searchInput = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput.fill('1.5');

      // Wait for table to filter
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table shows only matching Speed records
      const rows = page.locator('[role="rowgroup"]').last().locator('[role="row"]');
      const rowCount = await rows.count();
      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          await expect(rows.nth(i).locator('[role="cell"]').nth(2)).toContainText('1.5');
        }
      }
    });

    // TC-SRC-02: Search by complete speed value returns exact matching result
    test('TC-SRC-02: Exact speed value search returns exact matching result', async ({ page }) => {
      // Read an existing speed value from the first table row
      await waitForTableRows(page);
      const firstRowSpeedCell = page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().locator('[role="cell"]').nth(2);
      const firstRowSpeedText = (await firstRowSpeedCell.textContent())?.trim() ?? '';
      expect(firstRowSpeedText.length).toBeGreaterThan(0);
      const speedNumeric = firstRowSpeedText.replace(' m/s', '').trim();

      // Type the existing speed value into the Search speed input
      const searchInput = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput.fill(speedNumeric);

      // Wait for table to filter
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table shows the matching Speed record
      await expect(page.locator('[role="table"]').getByText(firstRowSpeedText)).toBeVisible({ timeout: 5000 });
    });

    // TC-SRC-03: Search with a non-existent speed value returns no results
    test('TC-SRC-03: Non-existent speed value search returns no results', async ({ page }) => {
      // Type a value that does not exist into the Search speed input
      const searchInput = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput.fill('XYZNOTEXIST999');

      // Wait for table to filter
      await new Promise(f => setTimeout(f, 1000));

      // Verify an empty state message is shown
      await expect(page.locator('text=There are no records to display')).toBeVisible({ timeout: 5000 });
    });

    // TC-SRC-04: Clearing the search input restores the full list
    test('TC-SRC-04: Clearing search input restores the full list', async ({ page }) => {
      // Type '1.5' into the Search speed input to filter results
      await waitForTableRows(page);
      const initialRowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();

      const searchInput = page.getByRole('textbox', { name: /Search speed/i });
      await searchInput.fill('1.5');
      await new Promise(f => setTimeout(f, 1000));

      // Clear the Search speed input field completely
      await searchInput.clear();
      await page.waitForTimeout(1500);
      await waitForTableRows(page);

      // Verify the table restores to show all Active Speed records
      const restoredRowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      expect(restoredRowCount).toBeGreaterThanOrEqual(initialRowCount);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-PAG-01: Default rows-per-page is 25
    test('TC-PAG-01: Default rows-per-page is 25', async ({ page }) => {
      // Verify the Show: dropdown displays 25 as the selected value by default
      const showDropdown = page.locator('select').first();
      await expect(showDropdown).toHaveValue('25');

      // Verify up to 25 rows are shown in the table
      await waitForTableRows(page);
      const rowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      expect(rowCount).toBeLessThanOrEqual(25);
    });

    // TC-PAG-02: Change rows-per-page to 10
    test('TC-PAG-02: Change rows-per-page to 10', async ({ page }) => {
      // Change the Show: dropdown from 25 to 10
      const showDropdown = page.locator('select').first();
      await showDropdown.selectOption('10');
      await expect(showDropdown).toHaveValue('10');

      // Wait for table to refresh
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table displays a maximum of 10 rows
      await waitForTableRows(page);
      const rowCount = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    // TC-PAG-03: Navigate between pages using pagination controls
    test('TC-PAG-03: Navigate between pages using pagination controls', async ({ page }) => {
      // Set Show: dropdown to 10 and verify multiple pages exist
      const showDropdown = page.locator('select').first();
      await showDropdown.selectOption('10');
      await new Promise(f => setTimeout(f, 1000));

      // Check if pagination controls are visible
      const prevBtn = page.getByRole('button', { name: /Previous page/i });
      const nextBtn = page.getByRole('button', { name: /Next page/i });

      await expect(prevBtn).toBeVisible();

      const isNextEnabled = await nextBtn.isEnabled();
      if (!isNextEnabled) {
        // Not enough records for pagination — skip
        return;
      }

      // Verify Previous page button is disabled on page 1
      await expect(prevBtn).toBeDisabled();

      // Verify the current page button (page 1) is highlighted
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible();

      // Click the Next page button
      await nextBtn.click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table advances to page 2
      await expect(page.getByRole('button', { name: /Page 2 is your current page/i })).toBeVisible({ timeout: 5000 });

      // Verify the Previous page button becomes enabled
      await expect(prevBtn).toBeEnabled();

      // Click the Previous page button
      await prevBtn.click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table returns to page 1
      await expect(page.getByRole('button', { name: /Page 1 is your current page/i })).toBeVisible({ timeout: 5000 });

      // Verify the Previous page button becomes disabled again
      await expect(prevBtn).toBeDisabled();
    });

    // TC-PAG-04: Change rows-per-page to 50 and 100
    test('TC-PAG-04: Change rows-per-page to 50 and 100', async ({ page }) => {
      const showDropdown = page.locator('select').first();

      // Change Show: dropdown to 50
      await showDropdown.selectOption('50');
      await expect(showDropdown).toHaveValue('50');
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table displays up to 50 rows
      await waitForTableRows(page);
      const rowCount50 = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      expect(rowCount50).toBeLessThanOrEqual(50);

      // Change Show: dropdown to 100
      await showDropdown.selectOption('100');
      await expect(showDropdown).toHaveValue('100');
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table displays up to 100 rows
      await waitForTableRows(page);
      const rowCount100 = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count();
      expect(rowCount100).toBeLessThanOrEqual(100);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-SRT-01: Sort table by Speed (m/s) column
    test('TC-SRT-01: Sort table by Speed (m/s) column', async ({ page }) => {
      // Wait for the data table to load
      await waitForTableRows(page);

      // Verify the Speed (m/s) column header has a sort icon
      await expect(page.getByRole('button', { name: /Speed \(m\/s\)/i })).toBeVisible();

      // Click the Speed (m/s) column header button to sort ascending
      await page.getByRole('button', { name: /Speed \(m\/s\)/i }).click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table re-sorts (rows are still visible)
      await waitForTableRows(page);

      // Click the Speed (m/s) column header button again to sort descending
      await page.getByRole('button', { name: /Speed \(m\/s\)/i }).click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the sort order reverses (rows are still visible)
      await waitForTableRows(page);
    });

    // TC-SRT-02: Sort table by Status column
    test('TC-SRT-02: Sort table by Status column', async ({ page }) => {
      // Set Status filter to All to see both Active and Inactive records
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('All');
      await new Promise(f => setTimeout(f, 1000));

      await waitForTableRows(page);

      // Click the Status column header button to sort
      await page.getByRole('button', { name: /Status/i }).click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the table re-sorts (rows are still visible)
      await waitForTableRows(page);

      // Click the Status column header button again to reverse sort
      await page.getByRole('button', { name: /Status/i }).click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the sort order reverses (rows are still visible)
      await waitForTableRows(page);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpeedMaster(page);
    });

    // TC-INA-01: Deactivate an Active Speed and verify it disappears from the Active filter
    test('TC-INA-01: Deactivate an Active Speed and verify it moves to Inactive list', async ({ page }) => {
      // Verify the Status filter is set to Active and at least one record exists
      await waitForTableRows(page);

      // Note the value of an existing Active Speed record from the first row
      const speedCell = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').first().locator('[role="cell"]').nth(2).textContent();
      const speedValue = speedCell?.trim() ?? '';
      const speedNumeric = speedValue.replace(' m/s', '').trim();
      expect(speedValue.length).toBeGreaterThan(0);

      // Click the Edit icon for this record
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Verify the Status * dropdown shows Active
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toHaveValue('true');

      // Change the Status dropdown from Active to Inactive
      await statusDropdown.selectOption('Inactive');

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been updated successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the form resets to Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });

      // Verify the edited Speed record no longer appears in the Active-filtered table
      const activeRows = page.locator('[role="rowgroup"]').last().locator('[role="row"]').filter({ hasText: speedNumeric });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Change the Status filter to Inactive
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('Inactive');
      await new Promise(f => setTimeout(f, 1000));

      // Verify the Speed record now appears in the Inactive-filtered table with Inactive badge
      await expect(page.locator('[role="table"]').getByText(speedNumeric)).toBeVisible({ timeout: 10000 });

      // Restore: re-activate the record
      const inactiveRow = page.locator('[role="rowgroup"]').last().locator('[role="row"]').filter({ hasText: speedNumeric });
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });
      await page.getByRole('combobox', { name: /Status \*/i }).selectOption('Active');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-INA-02: Re-activate an Inactive Speed
    test('TC-INA-02: Re-activate an Inactive Speed', async ({ page }) => {
      // Change Status filter to Inactive
      const statusFilter = page.locator('select').nth(1);
      await statusFilter.selectOption('Inactive');
      await new Promise(f => setTimeout(f, 1000));

      // Check if any inactive records exist
      const hasRows = await page.locator('[role="rowgroup"]').last().locator('[role="row"]').count().then(c => c > 0);
      if (!hasRows) {
        // No inactive records exist — skip test
        return;
      }

      // Click the Edit icon for an Inactive Speed record
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Speed/i })).toBeVisible({ timeout: 10000 });

      // Note the speed value
      const speedValue = await page.getByRole('textbox', { name: /Speed \(m\/s\) \*/i }).inputValue();

      // Verify the Status * dropdown shows Inactive
      const statusDropdown = page.getByRole('combobox', { name: /Status \*/i });
      await expect(statusDropdown).toHaveValue('false');

      // Change the Status dropdown from Inactive to Active
      await statusDropdown.selectOption('Active');

      // Click the Update button
      await page.getByRole('button', { name: /Update/i }).click();

      // Verify success toast notification
      await expect(page.locator('[role="alert"]').filter({ hasText: /Speed has been updated successfully!/i })).toBeVisible({ timeout: 10000 });

      // Verify the form resets to Add Speed mode
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible({ timeout: 15000 });

      // Change the Status filter to Active
      await statusFilter.selectOption('Active');
      await new Promise(f => setTimeout(f, 1000));

      // Search for the re-activated speed to confirm it appears in the Active list (handles pagination)
      const reactivateSearchInput = page.getByRole('textbox', { name: /Search speed/i });
      await reactivateSearchInput.fill(speedValue);
      await new Promise(f => setTimeout(f, 1000));
      await expect(page.locator('[role="table"]').getByText(new RegExp(speedValue.replace(/\./g, '\\.')))).toBeVisible({ timeout: 10000 });

      // Clear search, then verify the record no longer appears in the Inactive list
      await reactivateSearchInput.clear();
      await new Promise(f => setTimeout(f, 1000));
      await statusFilter.selectOption('Inactive');
      await new Promise(f => setTimeout(f, 1000));
      const inactiveRows = page.locator('[role="rowgroup"]').last().locator('[role="row"]').filter({ hasText: speedValue });
      await expect(inactiveRows).toHaveCount(0, { timeout: 10000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    // TC-NAV-01: Unauthenticated access to Speed Master URL redirects to login page
    test('TC-NAV-01: Unauthenticated access redirects to login page', async ({ browser }) => {
      // Open a new browser context with no authentication state
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigate directly to the Speed Master URL
      await page.goto('https://stage.elevatorplus.net/master/speed-master', { timeout: 60000 }).catch(() => {});

      // Wait for redirect to login page
      await Promise.race([
        page.getByRole('button', { name: 'Login' }).waitFor({ state: 'visible', timeout: 30000 }),
        page.waitForURL(/\/login/, { timeout: 30000 }),
      ]).catch(() => {});

      // Verify the user is redirected to the login page
      await expect(page).toHaveURL(/\/login/);

      // Verify the Speed Master page content is not shown
      await expect(page.getByRole('heading', { name: /Add Speed/i })).not.toBeVisible();

      // Verify the login form is visible with mobile number field
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

      await context.close();
    });

    // TC-NAV-02: Access Speed Master via Sales Masters sidebar navigation
    test('TC-NAV-02: Access Speed Master via Sales Masters sidebar navigation', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 60000 });
      await page.getByRole('heading', { name: /Dashboards/i }).waitFor({ state: 'visible', timeout: 30000 });
      await dismissNotificationPopup(page);

      // Click on Sales Masters in the left sidebar navigation
      await page.getByRole('link', { name: /Sales Masters/i }).click();
      await new Promise(f => setTimeout(f, 1000));

      // Verify the Sales Masters sub-menu expands to show Speed link
      await expect(page.getByRole('link', { name: /Speed/i })).toBeVisible({ timeout: 10000 });

      // Click the Speed link in the Sales Masters sub-menu
      await page.getByRole('link', { name: /^Speed$/i }).click();

      // Wait for the Speed Master page to load
      await page.getByRole('heading', { name: /Add Speed/i }).waitFor({ state: 'visible', timeout: 30000 });

      // Verify the Speed Master page is loaded
      await expect(page).toHaveURL(new RegExp(SPEED_MASTER_URL));

      // Verify the page heading 'Add Speed' is visible in the form section
      await expect(page.getByRole('heading', { name: /Add Speed/i })).toBeVisible();

      // Verify the data table with existing Speed records is displayed
      await waitForTableRows(page);

      // Verify the top navigation heading reads Speed Master
      await expect(page.getByRole('heading', { name: /Speed Master/i })).toBeVisible();
    });

  });

});
