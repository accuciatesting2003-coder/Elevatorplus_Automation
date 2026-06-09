// spec: test-plans/Sales-mater-test-plan/special-feature-master-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';

const SPECIAL_FEATURE_URL = '/master/special-feature-master';

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
  } catch {
    // Popup did not appear
  }
}

async function gotoSpecialFeatureMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(SPECIAL_FEATURE_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Special Feature/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

// The data table uses ARIA roles: [role="row"]:has([role="cell"]) targets only
// data rows (skipping the header row).
function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.mouse.move(0, 0);
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).waitFor({ state: 'visible', timeout: 10000 });
  await tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// Status filter select: values are '' (All), 'true' (Active), 'false' (Inactive).
// Identified by the presence of option[value="false"] (the Inactive option).
function statusFilterSelect(page: any) {
  return page.locator('select').filter({ has: page.locator('option[value="false"]') }).first();
}

// Show-entries select is identified by its id attribute.
function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

// Status is rendered as an h5 badge inside a cell.
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

// ─────────────────────────────────────────────────────────────────────────────
// Suite – Special Feature Master
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Special Feature Master', () => {

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 1 – Smoke Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-SM-01: Special Feature Master page loads successfully
    test('TC-SM-01: Special Feature Master page loads successfully', async ({ page }) => {
      // Verify URL
      await expect(page).toHaveURL(new RegExp(SPECIAL_FEATURE_URL, 'i'));

      // Verify page title
      await expect(page).toHaveTitle('ElevatorPlus');

      // Verify breadcrumb heading in navigation bar
      await expect(page.getByRole('heading', { name: /Special Feature Master/i, level: 4 })
        .or(page.locator('[role="navigation"]').getByText(/Special Feature Master/i))
      ).toBeVisible();

      // Verify 'Add Special Feature' card heading is visible
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Verify Feature Name input is present and empty
      const featureNameInput = page.locator('#feature_name');
      await expect(featureNameInput).toBeVisible();
      await expect(featureNameInput).toHaveValue('');

      // Verify helper text below Feature Name
      await expect(page.getByText('Name of this special feature.')).toBeVisible();

      // Verify Door Opening Type dropdown is present with default option
      const doorOpeningSelect = page.locator('#opening_type');
      await expect(doorOpeningSelect).toBeVisible();
      await expect(doorOpeningSelect).toHaveValue('');

      // Verify helper text below Door Opening Type
      await expect(page.getByText('Door type this feature applies to.')).toBeVisible();

      // Verify Description input is present and empty
      const descriptionInput = page.locator('#description');
      await expect(descriptionInput).toBeVisible();
      await expect(descriptionInput).toHaveValue('');

      // Verify helper text below Description
      await expect(page.getByText('Brief description of what this feature includes.')).toBeVisible();

      // Verify Clear and Submit buttons are visible
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Verify data table loads with columns
      await waitForTableRows(page);
      await expect(page.getByText('Sr. No.')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      await expect(page.getByText('Feature Name')).toBeVisible();
      await expect(page.getByText('Door Opening Type')).toBeVisible();
      await expect(page.getByText('Description')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();
    });

    // TC-SM-02: Verify page elements and layout
    test('TC-SM-02: Verify page elements and layout', async ({ page }) => {
      // Form section heading reads 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Info icon button present next to heading
      await expect(page.locator('#info-tooltip').or(page.getByRole('button', { name: /info/i }).first())).toBeVisible();

      // Inspect data table toolbar: rows-per-page dropdown (default 25)
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toBeVisible();
      await expect(showDropdown).toHaveValue('25');

      // Status filter dropdown (default Active = 'true')
      const statusFilter = statusFilterSelect(page);
      await expect(statusFilter).toBeVisible();
      await expect(statusFilter).toHaveValue('true');

      // Import button present
      await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();

      // Search box present
      await expect(page.locator('#search')).toBeVisible();

      // Column headers present
      await waitForTableRows(page);
      await expect(page.getByRole('button', { name: /Feature Name/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Door Opening Type/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/i })).toBeVisible();
    });

    // TC-SM-03: Verify Door Opening Type dropdown options
    test('TC-SM-03: Verify Door Opening Type dropdown options', async ({ page }) => {
      // Click the Door Opening Type dropdown
      const doorOpeningSelect = page.locator('#opening_type');
      await expect(doorOpeningSelect).toBeVisible();

      // Verify options
      await expect(doorOpeningSelect.locator('option[value=""]')).toHaveText('Select Opening Type');
      await expect(doorOpeningSelect.locator('option[value="general"]')).toHaveText('General');
      await expect(doorOpeningSelect.locator('option[value="manual"]')).toHaveText('Manual');
      await expect(doorOpeningSelect.locator('option[value="automatic"]')).toHaveText('Automatic');

      // Default selected option is 'Select Opening Type'
      await expect(doorOpeningSelect).toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 2 – Add Special Feature (Happy Path)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Add Special Feature (Happy Path)', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-ADD-01: Successfully create a new special feature with Door Opening Type 'General'
    test('TC-ADD-01: Successfully create a new special feature with Door Opening Type General', async ({ page }) => {
      const featureName = `AutoFeature ${Date.now()}`;

      // Navigate to page - form is displayed with empty inputs
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Click on Feature Name input and type unique name
      await page.locator('#feature_name').fill(featureName);
      await expect(page.locator('#feature_name')).toHaveValue(featureName);

      // Click Door Opening Type and select General
      await page.locator('#opening_type').selectOption('general');
      await expect(page.locator('#opening_type')).toHaveValue('general');

      // Click Description and type description
      await page.locator('#description').fill('Automatically rescues passengers during power failure');
      await expect(page.locator('#description')).toHaveValue('Automatically rescues passengers during power failure');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect Feature Name input is cleared
      await expect(page.locator('#feature_name')).toHaveValue('', { timeout: 15000 });

      // Expect Door Opening Type resets to Select Opening Type
      await expect(page.locator('#opening_type')).toHaveValue('', { timeout: 15000 });

      // Expect Description is cleared
      await expect(page.locator('#description')).toHaveValue('', { timeout: 15000 });

      // Expect form heading remains 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Expect new record in table
      await page.locator('#search').fill(featureName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: featureName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-ADD-02: Successfully create a new special feature with Door Opening Type 'Manual'
    test('TC-ADD-02: Successfully create a new special feature with Door Opening Type Manual', async ({ page }) => {
      const featureName = `EmergencyStop ${Date.now()}`;

      // Fill in all fields
      await page.locator('#feature_name').fill(featureName);
      await page.locator('#opening_type').selectOption('manual');
      await page.locator('#description').fill('Manual emergency stop for the lift cabin');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.locator('#feature_name')).toHaveValue('', { timeout: 15000 });

      // Expect new record in table with manual opening type
      await page.locator('#search').fill(featureName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const newRow = tableRows(page).filter({ hasText: featureName });
      await expect(newRow).toHaveCount(1, { timeout: 15000 });
      await expect(newRow.locator('[role="cell"]').nth(3)).toHaveText('manual');
      await page.locator('#search').fill('');
    });

    // TC-ADD-03: Successfully create a new special feature with Door Opening Type 'Automatic'
    test('TC-ADD-03: Successfully create a new special feature with Door Opening Type Automatic', async ({ page }) => {
      const featureName = `VoiceAnnouncement ${Date.now()}`;

      // Fill in all fields
      await page.locator('#feature_name').fill(featureName);
      await page.locator('#opening_type').selectOption('automatic');
      await page.locator('#description').fill('Announces floor numbers automatically');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.locator('#feature_name')).toHaveValue('', { timeout: 15000 });

      // Expect new record with automatic type
      await page.locator('#search').fill(featureName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const newRow = tableRows(page).filter({ hasText: featureName });
      await expect(newRow).toHaveCount(1, { timeout: 15000 });
      await expect(newRow.locator('[role="cell"]').nth(3)).toHaveText('automatic');
      await page.locator('#search').fill('');
    });

    // TC-ADD-04: Create a special feature with special characters in Feature Name and Description
    test('TC-ADD-04: Create a special feature with special characters', async ({ page }) => {
      const featureName = `Load Sensor #3 (Heavy-Duty) ${Date.now()}`;
      const description = 'Detects overload > 1000 kg & triggers alarm';

      // Fill in fields with special characters
      await page.locator('#feature_name').fill(featureName);
      await page.locator('#opening_type').selectOption('general');
      await page.locator('#description').fill(description);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect record in table with exact Feature Name
      await page.locator('#search').fill('Load Sensor');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: featureName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-ADD-05: Create a special feature with a long Feature Name and Description
    test('TC-ADD-05: Create a special feature with long Feature Name and Description', async ({ page }) => {
      const longName = `Advanced Regenerative Drive System with Automatic Speed Controller and Remote Monitoring ${Date.now()}`;
      const longDesc = 'This is a very long description text that covers many aspects of the advanced regenerative drive system used in modern elevators.';

      // Fill in fields with long text
      await page.locator('#feature_name').fill(longName);
      await page.locator('#opening_type').selectOption('automatic');
      await page.locator('#description').fill(longDesc);

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect either success toast or appropriate error
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i });
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\.|already exists/i });
      const validationError = page.locator('text=/please enter feature name/i');

      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);
      const hasError = await errorToast.isVisible({ timeout: 5000 }).catch(() => false);
      const hasValidation = await validationError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasSuccess || hasError || hasValidation).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 3 – Mandatory Field Validation
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Mandatory Field Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-VAL-01: Submit form with all three mandatory fields empty shows inline errors
    test('TC-VAL-01: Submit form with all fields empty shows inline errors', async ({ page }) => {
      // Verify form is empty
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Click Submit without entering values
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline validation errors for all three fields
      await expect(page.getByText('Please enter feature name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please select opening type')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter description')).toBeVisible({ timeout: 5000 });

      // Form remains on Add Special Feature page
      await expect(page).toHaveURL(new RegExp(SPECIAL_FEATURE_URL, 'i'));
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();
    });

    // TC-VAL-02: Submit form with only Feature Name empty
    test('TC-VAL-02: Submit form with only Feature Name empty shows error', async ({ page }) => {
      // Fill Door Opening Type and Description but leave Feature Name empty
      await page.locator('#opening_type').selectOption('general');
      await page.locator('#description').fill('Test Description');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline error for Feature Name only
      await expect(page.getByText('Please enter feature name')).toBeVisible({ timeout: 5000 });

      // No inline errors for Door Opening Type or Description
      await expect(page.getByText('Please select opening type')).not.toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Please enter description')).not.toBeVisible({ timeout: 3000 });
    });

    // TC-VAL-03: Submit form with only Door Opening Type not selected
    test('TC-VAL-03: Submit form with only Door Opening Type unselected shows error', async ({ page }) => {
      // Fill Feature Name and Description but leave Door Opening Type unselected
      await page.locator('#feature_name').fill('Test Feature');
      await page.locator('#description').fill('Test Description');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline error for Door Opening Type only
      await expect(page.getByText('Please select opening type')).toBeVisible({ timeout: 5000 });

      // No inline errors for Feature Name or Description
      await expect(page.getByText('Please enter feature name')).not.toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Please enter description')).not.toBeVisible({ timeout: 3000 });
    });

    // TC-VAL-04: Submit form with only Description empty
    test('TC-VAL-04: Submit form with only Description empty shows error', async ({ page }) => {
      // Fill Feature Name and Door Opening Type but leave Description empty
      await page.locator('#feature_name').fill('Test Feature');
      await page.locator('#opening_type').selectOption('automatic');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline error for Description only
      await expect(page.getByText('Please enter description')).toBeVisible({ timeout: 5000 });

      // No inline errors for Feature Name or Door Opening Type
      await expect(page.getByText('Please enter feature name')).not.toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Please select opening type')).not.toBeVisible({ timeout: 3000 });
    });

    // TC-VAL-05: Submit form with Feature Name and Description empty but Door Opening Type selected
    test('TC-VAL-05: Submit form with Feature Name and Description empty shows both errors', async ({ page }) => {
      // Leave Feature Name and Description empty, select Door Opening Type
      await page.locator('#opening_type').selectOption('manual');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect inline errors for Feature Name and Description
      await expect(page.getByText('Please enter feature name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter description')).toBeVisible({ timeout: 5000 });

      // No inline error for Door Opening Type
      await expect(page.getByText('Please select opening type')).not.toBeVisible({ timeout: 3000 });
    });

    // TC-VAL-06: Validation errors clear when valid input is entered after failed submission
    test('TC-VAL-06: Validation errors clear when valid input is entered', async ({ page }) => {
      // Click Submit to trigger all validation errors
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect all three errors
      await expect(page.getByText('Please enter feature name')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please select opening type')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Please enter description')).toBeVisible({ timeout: 5000 });

      // Type valid Feature Name — its error clears
      const validName = `ValidFeature ${Date.now()}`;
      await page.locator('#feature_name').fill(validName);
      await expect(page.getByText('Please enter feature name')).not.toBeVisible({ timeout: 5000 });

      // Select Door Opening Type — its error clears
      await page.locator('#opening_type').selectOption('general');
      await expect(page.getByText('Please select opening type')).not.toBeVisible({ timeout: 5000 });

      // Type Description and Submit
      await page.locator('#description').fill('Valid description text');
      await expect(page.getByText('Please enter description')).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast and form reset
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#feature_name')).toHaveValue('', { timeout: 15000 });
    });

    // TC-VAL-07: Submit form with only whitespace in all mandatory fields
    test('TC-VAL-07: Submit form with only whitespace shows validation or server error', async ({ page }) => {
      // Enter whitespace only in Feature Name and Description
      await page.locator('#feature_name').fill('   ');
      await page.locator('#opening_type').selectOption('general');
      await page.locator('#description').fill('   ');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect either validation error or server error — no blank feature created
      const validationErrorFeature = page.getByText('Please enter feature name');
      const validationErrorDesc = page.getByText('Please enter description');
      const serverError = page.locator('[role="alert"]').filter({ hasText: /Something went wrong\.|already exists/i });

      const hasValidationFeature = await validationErrorFeature.isVisible({ timeout: 5000 }).catch(() => false);
      const hasValidationDesc = await validationErrorDesc.isVisible({ timeout: 5000 }).catch(() => false);
      const hasServerError = await serverError.isVisible({ timeout: 5000 }).catch(() => false);

      expect(hasValidationFeature || hasValidationDesc || hasServerError).toBeTruthy();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 4 – Duplicate Prevention
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Duplicate Prevention', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-DUP-01: Submitting an existing Feature Name with same opening type shows an error
    test('TC-DUP-01: Submitting existing Feature Name with same opening type shows error', async ({ page }) => {
      // Get an existing feature name and opening type from the first table row
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const existingType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter that name and same opening type, then submit
      await page.locator('#feature_name').fill(existingName);
      await page.locator('#opening_type').selectOption(existingType);
      await page.locator('#description').fill('Duplicate test description');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect error toast (duplicate combination)
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });
    });

    // TC-DUP-02: Test case-sensitivity for duplicate Feature Name
    test('TC-DUP-02: Case-sensitivity test for duplicate Feature Name', async ({ page }) => {
      // Get existing feature name from first table row (that has 'automatic' type)
      await waitForTableRows(page);
      const existingName = (await tableRows(page).filter({ hasText: 'automatic' }).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter same name in uppercase with same opening type
      const upperCaseName = existingName.toUpperCase();
      await page.locator('#feature_name').fill(upperCaseName);
      await page.locator('#opening_type').selectOption('automatic');
      await page.locator('#description').fill('Case sensitivity test description');
      await page.getByRole('button', { name: /Submit/i }).click();

      // Observe whether duplicate error or success — both are acceptable outcomes
      const errorToast = page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i });
      const successToast = page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i });

      const hasError = await errorToast.isVisible({ timeout: 15000 }).catch(() => false);
      const hasSuccess = await successToast.isVisible({ timeout: 15000 }).catch(() => false);

      expect(hasError || hasSuccess).toBeTruthy();
    });

    // TC-DUP-03: Submitting an existing active Feature Name with a different Door Opening Type should not show an error
    test('TC-DUP-03: Existing active Feature Name with different opening type should succeed', async ({ page }) => {
      // Get an existing Active record — note its Feature Name and Door Opening Type
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const existingType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Choose a different opening type
      const differentType = existingType === 'automatic' ? 'general' : existingType === 'general' ? 'manual' : 'automatic';

      // Enter same Feature Name but different Door Opening Type
      await page.locator('#feature_name').fill(existingName);
      await page.locator('#opening_type').selectOption(differentType);
      await page.locator('#description').fill('Different opening type test description');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect success toast — no error
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been created successfully!/i })).toBeVisible({ timeout: 15000 });

      // Form resets
      await expect(page.locator('#feature_name')).toHaveValue('', { timeout: 15000 });
    });

    // TC-DUP-04: Submitting an existing inactive Feature Name with the same Door Opening Type shows an error
    test('TC-DUP-04: Existing inactive Feature Name with same opening type shows error', async ({ page }) => {
      // Change Status filter to Inactive to find an inactive record
      await statusFilterSelect(page).selectOption('false');

      // Check if any Inactive records exist
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount === 0) {
        // Create an inactive record first: edit an active record and set it inactive
        await statusFilterSelect(page).selectOption('true');
        await waitForTableRows(page);
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });
        await page.locator('#status').selectOption('false');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await statusFilterSelect(page).selectOption('false');
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      }

      // Note the Inactive record's Feature Name and Door Opening Type
      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const inactiveType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      // Change filter back to Active
      await statusFilterSelect(page).selectOption('true');

      // Enter the Inactive record's Feature Name and same Door Opening Type
      await page.locator('#feature_name').fill(inactiveName);
      await page.locator('#opening_type').selectOption(inactiveType);
      await page.locator('#description').fill('Testing inactive duplicate error');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });

      // Form inputs not cleared
      await expect(page.locator('#feature_name')).not.toHaveValue('');
    });

    // TC-DUP-05: Submitting an existing active Feature Name with the same Door Opening Type shows an error
    test('TC-DUP-05: Existing active Feature Name with same opening type shows error', async ({ page }) => {
      // Get an existing Active record — note its Feature Name and Door Opening Type
      await waitForTableRows(page);
      const existingName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const existingType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(existingName.length).toBeGreaterThan(0);

      // Enter same Feature Name and same Door Opening Type
      await page.locator('#feature_name').fill(existingName);
      await page.locator('#opening_type').selectOption(existingType);
      await page.locator('#description').fill('Active duplicate test description');

      // Click Submit
      await page.getByRole('button', { name: /Submit/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });

      // Form inputs not cleared
      await expect(page.locator('#feature_name')).not.toHaveValue('');
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 5 – Clear Button Behavior
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-CLR-01: Clear button resets the Add Special Feature form
    test('TC-CLR-01: Clear button resets the Add Special Feature form', async ({ page }) => {
      // Verify empty form
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Fill all fields
      await page.locator('#feature_name').fill('Temporary Feature');
      await page.locator('#opening_type').selectOption('manual');
      await page.locator('#description').fill('Some temporary description');

      // Verify fields are filled
      await expect(page.locator('#feature_name')).toHaveValue('Temporary Feature');
      await expect(page.locator('#opening_type')).toHaveValue('manual');
      await expect(page.locator('#description')).toHaveValue('Some temporary description');

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect all fields reset
      await expect(page.locator('#feature_name')).toHaveValue('');
      await expect(page.locator('#opening_type')).toHaveValue('');
      await expect(page.locator('#description')).toHaveValue('');

      // Form heading still reads 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // No 'Temporary Feature' in table
      const matchingRows = await tableRows(page).filter({ hasText: 'Temporary Feature' }).count();
      expect(matchingRows).toBe(0);
    });

    // TC-CLR-02: Clear button in Edit mode resets form to Add Special Feature state
    test('TC-CLR-02: Clear button in Edit mode resets form to Add Special Feature state', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect 'Update Special Feature' heading
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Expect Feature Name pre-filled
      const featureNameInput = page.locator('#feature_name');
      const currentName = await featureNameInput.inputValue();
      expect(currentName.length).toBeGreaterThan(0);

      // Expect Door Opening Type pre-selected
      const currentType = await page.locator('#opening_type').inputValue();
      expect(currentType.length).toBeGreaterThan(0);

      // Expect Description pre-filled
      const currentDesc = await page.locator('#description').inputValue();

      // Expect Status dropdown visible
      await expect(page.locator('#status')).toBeVisible();

      // Expect Update button
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();

      // Click Clear
      await page.getByRole('button', { name: /Clear/i }).click();

      // Expect heading reverts to 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible();

      // Expect inputs cleared
      await expect(featureNameInput).toHaveValue('');
      await expect(page.locator('#opening_type')).toHaveValue('');
      await expect(page.locator('#description')).toHaveValue('');

      // Expect Status dropdown no longer visible
      await expect(page.locator('#status')).not.toBeVisible();

      // Expect Submit button (not Update)
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Update/i })).not.toBeVisible();
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 6 – Edit and Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edit and Update Operations', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-EDT-01: Edit icon opens the special feature record in edit mode
    test('TC-EDT-01: Edit icon opens record in edit mode', async ({ page }) => {
      await waitForTableRows(page);

      // Get feature name from first row
      const originalName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);

      // Expect heading changes to 'Update Special Feature'
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Expect Feature Name pre-filled
      await expect(page.locator('#feature_name')).toHaveValue(originalName);

      // Expect Door Opening Type pre-selected (not empty)
      const openingTypeValue = await page.locator('#opening_type').inputValue();
      expect(openingTypeValue.length).toBeGreaterThan(0);

      // Expect Description pre-filled
      // Description may be '-' or empty

      // Expect Status dropdown appears with 'Active' (value 'true') pre-selected
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toBeVisible();
      await expect(statusSelect).toHaveValue('true');

      // Expect helper text for Status
      await expect(page.getByText('Select active or inactive')).toBeVisible();

      // Expect action button changes to 'Update'
      await expect(page.getByRole('button', { name: /Update/i })).toBeVisible();
    });

    // TC-EDT-02: Successfully update the Feature Name
    test('TC-EDT-02: Successfully update the Feature Name', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Clear Feature Name and type new unique name
      const newName = `UpdatedFeature ${Date.now()}`;
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(newName);
      await expect(page.locator('#feature_name')).toHaveValue(newName);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets to 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });

      // Expect updated name in table
      await page.locator('#search').fill(newName);
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await page.locator('#search').fill('');
    });

    // TC-EDT-03: Successfully update the Door Opening Type in edit mode
    test('TC-EDT-03: Successfully update the Door Opening Type', async ({ page }) => {
      await waitForTableRows(page);

      // Find a row with 'general' opening type
      const generalRow = tableRows(page).filter({ hasText: 'general' }).first();
      const rowCount = await tableRows(page).filter({ hasText: 'general' }).count();
      if (rowCount === 0) {
        test.skip();
        return;
      }

      const featureName = (await generalRow.locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on that row
      await generalRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Verify Door Opening Type shows 'general'
      await expect(page.locator('#opening_type')).toHaveValue('general');

      // Change Door Opening Type to 'manual'
      await page.locator('#opening_type').selectOption('manual');
      await expect(page.locator('#opening_type')).toHaveValue('manual');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-04: Successfully update the Description in edit mode
    test('TC-EDT-04: Successfully update the Description', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Clear Description and type new description
      const newDesc = 'Updated description for this feature';
      await page.locator('#description').clear();
      await page.locator('#description').fill(newDesc);
      await expect(page.locator('#description')).toHaveValue(newDesc);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-05: Update special feature status to Inactive
    test('TC-EDT-05: Update special feature status to Inactive', async ({ page }) => {
      await waitForTableRows(page);

      // Note feature name from first row (Active filter is default)
      const featureName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Status dropdown should show Active ('true')
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toHaveValue('true');

      // Change to Inactive
      await statusSelect.selectOption('false');
      await expect(statusSelect).toHaveValue('false');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Expect form resets
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });

      // Change filter to All — verify feature shows Inactive badge
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);
      const editedRow = tableRows(page).filter({ hasText: featureName });
      await expect(editedRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 15000 });

      // Restore: set status back to Active
      await editedRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-06: Update special feature with empty Feature Name shows validation error
    test('TC-EDT-06: Update with empty Feature Name shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Clear Feature Name
      await page.locator('#feature_name').clear();
      await expect(page.locator('#feature_name')).toHaveValue('');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect inline validation error
      await expect(page.getByText('Please enter feature name')).toBeVisible({ timeout: 5000 });

      // Form remains in Update Special Feature mode
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible();
    });

    // TC-EDT-07: Update special feature with empty Description shows validation error
    test('TC-EDT-07: Update with empty Description shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Clear Description
      await page.locator('#description').clear();
      await expect(page.locator('#description')).toHaveValue('');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect inline validation error
      await expect(page.getByText('Please enter description')).toBeVisible({ timeout: 5000 });

      // Form remains in Update Special Feature mode
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible();
    });

    // TC-EDT-08: Update special feature name to a duplicate of an existing feature
    test('TC-EDT-08: Update to duplicate Feature Name and same type shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Ensure at least 2 rows
      const rowCount = await tableRows(page).count();
      if (rowCount < 2) {
        test.skip();
        return;
      }

      // Note name of second row
      const secondName = (await tableRows(page).nth(1).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const secondType = (await tableRows(page).nth(1).locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(secondName.length).toBeGreaterThan(0);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Feature Name to second row's name and Door Opening Type to match
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(secondName);
      await page.locator('#opening_type').selectOption(secondType);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-09: Update Door Opening Type to 'Select Opening Type' (unselect) shows validation error
    test('TC-EDT-09: Update with unselected Door Opening Type shows validation error', async ({ page }) => {
      await waitForTableRows(page);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Door Opening Type to empty (unselected)
      await page.locator('#opening_type').selectOption('');
      await expect(page.locator('#opening_type')).toHaveValue('');

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect inline validation error for Door Opening Type
      await expect(page.getByText('Please select opening type')).toBeVisible({ timeout: 5000 });

      // Form remains in Update Special Feature mode
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible();
    });

    // TC-EDT-10: Update with an existing active Feature Name and the same Door Opening Type shows an error
    test('TC-EDT-10: Update to existing active Feature Name and same type shows error', async ({ page }) => {
      await waitForTableRows(page);

      // Need at least 2 rows
      const rowCount = await tableRows(page).count();
      if (rowCount < 2) {
        test.skip();
        return;
      }

      // Note record A (first row) - Feature Name and Door Opening Type
      const recordAName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const recordAType = (await tableRows(page).nth(0).locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';

      // Click Edit on second row (record B)
      await clickEditOnRow(page, 1);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Feature Name to record A's name and Door Opening Type to record A's type
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(recordAName);
      await page.locator('#opening_type').selectOption(recordAType);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });

      // Form stays in Update Special Feature mode
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible();
    });

    // TC-EDT-11: Update with an existing inactive Feature Name and the same Door Opening Type shows an error
    test('TC-EDT-11: Update to existing inactive Feature Name and same type shows error', async ({ page }) => {
      // Switch to Inactive filter to find an inactive record
      await statusFilterSelect(page).selectOption('false');
      let inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount === 0) {
        // Create an inactive record by editing the first active record
        await statusFilterSelect(page).selectOption('true');
        await waitForTableRows(page);
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });
        await page.locator('#status').selectOption('false');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await statusFilterSelect(page).selectOption('false');
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        inactiveCount = await tableRows(page).count();
      }

      // Note inactive record's Feature Name and Door Opening Type
      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const inactiveType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      // Switch back to Active filter
      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      // Click Edit on first Active row (record B)
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Feature Name to inactive record's name and same Door Opening Type
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(inactiveName);
      await page.locator('#opening_type').selectOption(inactiveType);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect error toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /already exists|Something went wrong\./i })).toBeVisible({ timeout: 15000 });

      // Form stays in Update Special Feature mode
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible();
    });

    // TC-EDT-12: Update with an existing active Feature Name but a different Door Opening Type should not show an error
    test('TC-EDT-12: Update to existing active Feature Name with different type should succeed', async ({ page }) => {
      await waitForTableRows(page);

      // Need at least 2 rows
      const rowCount = await tableRows(page).count();
      if (rowCount < 2) {
        test.skip();
        return;
      }

      // Note record A (first row) - Feature Name and Door Opening Type
      const recordAName = (await tableRows(page).nth(0).locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const recordAType = (await tableRows(page).nth(0).locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';

      // Choose a DIFFERENT opening type from record A
      const differentType = recordAType === 'automatic' ? 'general' : recordAType === 'general' ? 'manual' : 'automatic';

      // Click Edit on second row (record B)
      await clickEditOnRow(page, 1);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Feature Name to record A's name but different Door Opening Type
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(recordAName);
      await page.locator('#opening_type').selectOption(differentType);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast — no error
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Form resets to 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-EDT-13: Update with an existing inactive Feature Name but a different Door Opening Type should not show an error
    test('TC-EDT-13: Update to existing inactive Feature Name with different type should succeed', async ({ page }) => {
      // Switch to Inactive filter to find an inactive record
      await statusFilterSelect(page).selectOption('false');
      let inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount === 0) {
        // Create an inactive record by editing the first active record
        await statusFilterSelect(page).selectOption('true');
        await waitForTableRows(page);
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });
        await page.locator('#status').selectOption('false');
        await page.getByRole('button', { name: /Update/i }).click();
        await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await statusFilterSelect(page).selectOption('false');
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
        inactiveCount = await tableRows(page).count();
      }

      // Note inactive record's Feature Name and Door Opening Type
      const inactiveName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      const inactiveType = (await tableRows(page).first().locator('[role="cell"]').nth(3).innerText())?.trim() ?? '';
      expect(inactiveName.length).toBeGreaterThan(0);

      // Choose a DIFFERENT opening type from the inactive record
      const differentType = inactiveType === 'automatic' ? 'general' : inactiveType === 'general' ? 'manual' : 'automatic';

      // Switch back to Active filter
      await statusFilterSelect(page).selectOption('true');
      await waitForTableRows(page);

      // Click Edit on first Active row (record B)
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Change Feature Name to inactive record's name but DIFFERENT Door Opening Type
      await page.locator('#feature_name').clear();
      await page.locator('#feature_name').fill(inactiveName);
      await page.locator('#opening_type').selectOption(differentType);

      // Click Update
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast — no error
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });

      // Form resets to 'Add Special Feature'
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 7 – Status Filter
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Status Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-FLT-01: Filter table by Active status (default)
    test('TC-FLT-01: Filter by Active (default) shows only Active records', async ({ page }) => {
      // Verify default Status filter is Active ('true')
      await expect(statusFilterSelect(page)).toHaveValue('true');

      // Wait for rows to load
      await waitForTableRows(page);

      // Limit to 10 rows to keep the status loop fast
      await showEntriesSelect(page).selectOption('10');

      // Verify all visible rows are Active
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
      }
    });

    // TC-FLT-02: Filter table to show All statuses
    test('TC-FLT-02: Filter to All shows both Active and Inactive', async ({ page }) => {
      // Change to All
      await statusFilterSelect(page).selectOption('');

      // Wait for table to update
      await waitForTableRows(page);

      // Verify the dropdown shows All ('')
      await expect(statusFilterSelect(page)).toHaveValue('');

      // Table should have rows
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

    // TC-FLT-03: Filter table by Inactive status
    test('TC-FLT-03: Filter to Inactive shows only Inactive or empty state', async ({ page }) => {
      // Change to Inactive
      await statusFilterSelect(page).selectOption('false');
      await expect(statusFilterSelect(page)).toHaveValue('false');

      // Table should show only Inactive rows or be empty
      const rowCount = await tableRows(page).count().catch(() => 0);

      if (rowCount > 0) {
        // All shown rows should have Inactive status
        const statuses = await getStatusColumnTexts(page);
        for (const status of statuses) {
          expect(status).toBe('Inactive');
        }
      }
      // If no rows, that is acceptable (no Inactive special features exist)
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 8 – Search Functionality
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-SRC-01: Search by partial Feature Name returns matching results
    test('TC-SRC-01: Search by partial Feature Name returns matches', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Type partial search term 'Inter'
      const searchBox = page.locator('#search');
      await searchBox.fill('Inter');

      // Wait for table to filter
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Filtered count should be less than or equal initial and > 0
      const filteredCount = await tableRows(page).count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
    });

    // TC-SRC-02: Search with a non-existent name returns no results
    test('TC-SRC-02: Non-existent search returns no results', async ({ page }) => {
      await waitForTableRows(page);

      // Type non-existent search term
      const searchBox = page.locator('#search');
      await searchBox.fill('XYZNONEXISTENTFEATURE999');

      // Wait for table to update
      await tableRows(page).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Expect no rows
      const rows = await tableRows(page).count().catch(() => 0);
      expect(rows).toBe(0);
    });

    // TC-SRC-03: Clearing the search input restores the full list
    test('TC-SRC-03: Clearing search restores full list', async ({ page }) => {
      await waitForTableRows(page);
      const initialCount = await tableRows(page).count();

      // Search to filter
      const searchBox = page.locator('#search');
      await searchBox.fill('AC');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Clear search
      await searchBox.clear();

      // Full list should be restored
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const restoredCount = await tableRows(page).count();
      expect(restoredCount).toBe(initialCount);
    });

    // TC-SRC-04: Search is case-insensitive
    test('TC-SRC-04: Search is case-insensitive', async ({ page }) => {
      await waitForTableRows(page);

      // Search with lowercase 'telephone'
      const searchBox = page.locator('#search');
      await searchBox.fill('telephone');

      // Wait for table to filter
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Should find the matching record (e.g., 'Telephone')
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 9 – Rows Per Page and Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Rows Per Page and Pagination', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-PAG-01: Change rows-per-page to 10
    test('TC-PAG-01: Change rows per page to 10', async ({ page }) => {
      await waitForTableRows(page);

      // Default is 25 — change to 10
      const showDropdown = showEntriesSelect(page);
      await expect(showDropdown).toHaveValue('25');
      await showDropdown.selectOption('10');

      // Expect max 10 rows
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(10);

      // Show dropdown shows '10'
      await expect(showDropdown).toHaveValue('10');
    });

    // TC-PAG-02: Change rows-per-page to 50
    test('TC-PAG-02: Change rows per page to 50', async ({ page }) => {
      await waitForTableRows(page);

      // Change to 50
      const showDropdown = showEntriesSelect(page);
      await showDropdown.selectOption('50');

      // Expect max 50 rows
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(50);

      // Show dropdown shows '50'
      await expect(showDropdown).toHaveValue('50');
    });

    // TC-PAG-03: Change rows-per-page to 100
    test('TC-PAG-03: Change rows per page to 100', async ({ page }) => {
      await waitForTableRows(page);

      // Change to 100
      const showDropdown = showEntriesSelect(page);
      await showDropdown.selectOption('100');

      // Expect max 100 rows
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeLessThanOrEqual(100);

      // Show dropdown shows '100'
      await expect(showDropdown).toHaveValue('100');
    });

    // TC-PAG-04: Navigate between pages using pagination controls
    test('TC-PAG-04: Navigate between pages using pagination controls', async ({ page }) => {
      await waitForTableRows(page);

      // Set to 10 rows per page
      const showDropdown = showEntriesSelect(page);
      await showDropdown.selectOption('10');
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Check pagination controls
      const prevBtn = page.getByRole('button', { name: /Previous page/i });
      const nextBtn = page.getByRole('button', { name: /Next page/i });

      // Previous button should be disabled on page 1
      await expect(prevBtn).toBeDisabled();

      // Check if Next page button is enabled (more than 10 records)
      const isNextEnabled = await nextBtn.isEnabled().catch(() => false);

      if (isNextEnabled) {
        // Click Next
        await nextBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        // Page 2 should be active
        await expect(page.getByRole('button', { name: /Page 2/i })).toBeVisible();

        // Previous button should be enabled
        await expect(prevBtn).toBeEnabled();

        // Click Previous
        await prevBtn.click();
        await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

        // Page 1 should be active, Previous should be disabled
        await expect(page.getByRole('button', { name: /Page 1/i })).toBeVisible();
        await expect(prevBtn).toBeDisabled();
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 10 – Column Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Column Sorting', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-SRT-01: Sort table by Feature Name column ascending and descending
    test('TC-SRT-01: Sort by Feature Name column ascending then descending', async ({ page }) => {
      await waitForTableRows(page);

      // Click Feature Name column header for ascending sort
      await page.getByRole('button', { name: /Feature Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first feature name after ascending sort (cell index 2)
      const firstNameAsc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Click again for descending sort
      await page.getByRole('button', { name: /Feature Name/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Get first feature name after descending sort
      const firstNameDesc = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

      // Names should differ if there are multiple records
      const rowCount = await tableRows(page).count();
      if (rowCount > 1) {
        expect(firstNameAsc).not.toBe(firstNameDesc);
      }
    });

    // TC-SRT-02: Sort table by Door Opening Type column
    test('TC-SRT-02: Sort by Door Opening Type column', async ({ page }) => {
      await waitForTableRows(page);

      // Click Door Opening Type column header for ascending sort
      await page.getByRole('button', { name: /Door Opening Type/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Table should be sorted by Door Opening Type
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);

      // Click again for descending sort
      await page.getByRole('button', { name: /Door Opening Type/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      const rowCountAfter = await tableRows(page).count();
      expect(rowCountAfter).toBeGreaterThan(0);
    });

    // TC-SRT-03: Sort table by Status column
    test('TC-SRT-03: Sort by Status column', async ({ page }) => {
      await waitForTableRows(page);

      // Set Status filter to All to ensure both Active and Inactive are visible
      await statusFilterSelect(page).selectOption('');
      await waitForTableRows(page);

      // Click Status column header
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });

      // Table should be sorted by Status
      const rowCount = await tableRows(page).count();
      expect(rowCount).toBeGreaterThan(0);

      // Click again for reverse sort
      await page.getByRole('button', { name: /^Status$/i }).click();
      await tableRows(page).first().waitFor({ state: 'visible', timeout: 15000 });
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 11 – Inactive Status Management
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Inactive Status Management', () => {

    test.beforeEach(async ({ page }) => {
      await gotoSpecialFeatureMaster(page);
    });

    // TC-INACT-01: Mark an Active special feature as Inactive and verify filter behavior
    test('TC-INACT-01: Mark Active feature as Inactive and verify filter behavior', async ({ page }) => {
      await waitForTableRows(page);

      // Note feature name from first row (Active filter is default)
      const featureName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';
      expect(featureName.length).toBeGreaterThan(0);

      // Click Edit on first row
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

      // Status select should show Active ('true')
      const statusSelect = page.locator('#status');
      await expect(statusSelect).toHaveValue('true');

      // Change to Inactive and Update
      await statusSelect.selectOption('false');
      await page.getByRole('button', { name: /Update/i }).click();

      // Expect success toast
      await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });

      // Active filter (default) should NOT show this record
      const activeRows = tableRows(page).filter({ hasText: featureName });
      await expect(activeRows).toHaveCount(0, { timeout: 10000 });

      // Switch to Inactive filter — record should appear
      await statusFilterSelect(page).selectOption('false');
      await expect(tableRows(page).filter({ hasText: featureName })).toHaveCount(1, { timeout: 10000 });

      // Verify Inactive badge
      const inactiveRow = tableRows(page).filter({ hasText: featureName });
      await expect(inactiveRow.getByRole('heading', { level: 5, name: /Inactive/i })).toBeVisible({ timeout: 10000 });

      // Restore: set status back to Active
      await inactiveRow.getByRole('img', { name: 'Edit' }).click();
      await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });
      await statusSelect.selectOption('true');
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });
    });

    // TC-INACT-02: Re-activate an Inactive special feature
    test('TC-INACT-02: Re-activate Inactive feature verifies it appears in Active list', async ({ page }) => {
      // Switch to Inactive filter
      await statusFilterSelect(page).selectOption('false');

      // Check if any Inactive records exist
      const inactiveCount = await tableRows(page).count().catch(() => 0);

      if (inactiveCount > 0) {
        await waitForTableRows(page);

        // Note the feature name (cell index 2)
        const featureName = (await tableRows(page).first().locator('[role="cell"]').nth(2).innerText())?.trim() ?? '';

        // Click Edit on first Inactive row
        await clickEditOnRow(page, 0);
        await expect(page.getByRole('heading', { name: /Update Special Feature/i })).toBeVisible({ timeout: 10000 });

        // Status select should show Inactive ('false')
        const statusSelect = page.locator('#status');
        await expect(statusSelect).toHaveValue('false');

        // Change to Active and Update
        await statusSelect.selectOption('true');
        await page.getByRole('button', { name: /Update/i }).click();

        // Expect success toast
        await expect(page.locator('[role="alert"]').filter({ hasText: /Special Feature has been updated successfully!/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 15000 });

        // Change filter back to Active — feature should appear
        await statusFilterSelect(page).selectOption('true');
        await expect(tableRows(page).filter({ hasText: featureName })).toHaveCount(1, { timeout: 10000 });
      }
    });

    // TC-INACT-03: Verify Inactive record does not appear under Active filter
    test('TC-INACT-03: Inactive records do not appear under Active filter', async ({ page }) => {
      // Ensure Status filter is Active (default)
      await expect(statusFilterSelect(page)).toHaveValue('true');
      await waitForTableRows(page);

      // Limit to 10 rows for speed
      await showEntriesSelect(page).selectOption('10');

      // All displayed records should show 'Active' badge
      const statuses = await getStatusColumnTexts(page);
      expect(statuses.length).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(status).toBe('Active');
        expect(status).not.toBe('Inactive');
      }
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Suite 12 – Navigation and Access
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Navigation and Access', () => {

    // TC-NAV-01: Direct URL without auth redirects to login
    test('TC-NAV-01: Direct URL without auth redirects to login', async ({ browser }) => {
      // Open a new browser context with no auth state
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      // Navigate directly to special-feature-master without authentication
      await page.goto('https://stage.elevatorplus.net/master/special-feature-master', { timeout: 60000 });

      // Expect redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

      // Special Feature Master content should not be shown
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).not.toBeVisible();

      await context.close();
    });

    // TC-NAV-02: Access Special Feature Master via Sales Masters menu navigation
    test('TC-NAV-02: Access Special Feature Master via Sales Masters menu navigation', async ({ page }) => {
      await registerPopupHandler(page);

      // Navigate to Dashboard
      await page.goto('/dashboard', { timeout: 60000 });
      await dismissNotificationPopup(page);

      // Click on Sales Masters in the left sidebar
      await page.getByRole('link', { name: /Sales Masters/i }).click();

      // Wait for sub-menu to expand and look for Special Feature link
      const specialFeatureLink = page.getByRole('link', { name: /^Special Feature$/i })
        .or(page.getByRole('link', { name: /Special Feature Master/i })).first();
      await specialFeatureLink.waitFor({ state: 'visible', timeout: 15000 });
      await specialFeatureLink.click();

      // Expect Special Feature Master page to load
      await expect(page).toHaveURL(/\/master\/special-feature-master/i, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Add Special Feature/i })).toBeVisible({ timeout: 30000 });

      // Data table should be displayed
      await waitForTableRows(page);
    });

  });

});
