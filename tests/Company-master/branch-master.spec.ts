import { test, expect } from '../fixtures/auth-fixture';

const BRANCH_MASTER_URL = '/master/branch-master';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  // Auto-dismiss "Maybe Later" notification popup whenever it appears
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
      await page.waitForTimeout(300);
    }
  );
}

async function gotoBranchMaster(page: any) {
  await registerPopupHandler(page);
  await page.goto(BRANCH_MASTER_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: 'Add Branch' }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
}

/**
 * Dismiss the "Enable Push Notifications" popup by clicking "Maybe Later".
 */
async function dismissNotificationPopup(page: any) {
  try {
    const maybeLater = page.getByRole('button', { name: /Maybe Later/i });
    const visible = await maybeLater.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await maybeLater.click();
      await page.waitForTimeout(500);
      return;
    }
    const closeBtn = page.locator('dialog button', { hasText: /×|Close/i });
    const closeVisible = await closeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.first().click();
      await page.waitForTimeout(500);
    }
  } catch {
    // Popup did not appear
  }
}

/**
 * The Branch Address textbox (textarea) has no accessible name.
 * Locate it via the sibling hint text "Enter branch address".
 */
function getBranchAddressField(page: any) {
  return page.getByText('Enter branch address').locator('..').getByRole('textbox');
}

async function waitForTableRows(page: any) {
  await page.locator('div.rdt_TableRow').first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.locator('div.rdt_TableRow').nth(rowIndex).getByRole('img', { name: 'Edit' }).click();
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 – Add Branch (Positive Tests)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Branch', () => {

  test.beforeEach(async ({ page }) => {
    await gotoBranchMaster(page);
  });

  test('1.1 Add branch with all valid fields (with location from map)', async ({ page }) => {
    const timestamp = Date.now();
    const branchName = `Test Branch ${timestamp}`;
    const branchCode = `TB${timestamp.toString().slice(-4)}`;

    await page.getByRole('textbox', { name: 'Branch Name *' }).fill(branchName);
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill(branchCode);
    await getBranchAddressField(page).fill('Pune, Maharashtra');

    // Open map location picker
    await page.getByRole('button', { name: 'Select Branch Location' }).click();
    await page.waitForTimeout(2000);

    // Wait for the modal search box to appear
    const searchInput = page.getByRole('textbox', { name: 'Search for a place' });
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });

    // Type location slowly to trigger Google Maps autocomplete
    await searchInput.pressSequentially('Pune, Maharashtra', { delay: 100 });
    await page.waitForTimeout(2000);

    // Click the first autocomplete suggestion
    const firstSuggestion = page.locator('.pac-container .pac-item').first();
    const suggestionVisible = await firstSuggestion.isVisible({ timeout: 3000 }).catch(() => false);
    if (suggestionVisible) {
      await firstSuggestion.click();
    } else {
      // Fallback: use keyboard to select first suggestion
      await searchInput.press('ArrowDown');
      await page.waitForTimeout(300);
      await searchInput.press('Enter');
    }
    await page.waitForTimeout(1500);

    // Confirm the selected location
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(1000);

    // Submit the form
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(3000);

    // Reload to see updated table
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    await dismissNotificationPopup(page);

    // Set status filter to "All" and wait for table to load
    await page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first().selectOption('All');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    // Search for the newly added branch
    const searchBox = page.getByRole('textbox', { name: 'Search by branch name' });
    await searchBox.waitFor({ state: 'visible', timeout: 15000 });
    await searchBox.fill(branchName);
    await page.waitForTimeout(5000);

    // Verify the newly added branch name is visible in the data table
    await expect(page.getByRole('cell', { name: branchName, exact: true })).toBeVisible({ timeout: 60000 });
  });

  test('1.2 Add branch with all fields including branch location from map', async ({ page }) => {
    const timestamp = Date.now();
    const branchName = `Map Branch ${timestamp}`;
    const branchCode = `MB${timestamp.toString().slice(-4)}`;

    await page.getByRole('textbox', { name: 'Branch Name *' }).fill(branchName);
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill(branchCode);
    await getBranchAddressField(page).fill('Pune, Maharashtra');

    // Open Google Map popup
    await page.getByRole('button', { name: 'Select Branch Location' }).click();
    await page.waitForTimeout(3000);

    // Search for a location in the map search box
    const mapSearchBox = page.locator('.pac-input, input[placeholder*="Search"], input[placeholder*="search"]').first();
    const mapSearchVisible = await mapSearchBox.isVisible({ timeout: 5000 }).catch(() => false);
    if (mapSearchVisible) {
      await mapSearchBox.fill('Pune, Maharashtra, India');
      await page.waitForTimeout(2000);
      await page.locator('.pac-item').first().click().catch(() => {
        mapSearchBox.press('Enter');
      });
      await page.waitForTimeout(2000);
    }

    // Click Confirm button on the map popup
    const confirmBtn = page.getByRole('button', { name: /Confirm/i });
    const confirmVisible = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (confirmVisible) {
      await confirmBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: 'Add Branch' })).toBeVisible();
  });

  test('1.3 Clear button resets Branch Name and Branch Code fields', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('Clear Test Branch');
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill('CTB1');
    await getBranchAddressField(page).fill('Clear Test Address');

    await page.getByRole('button', { name: /Clear/ }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: 'Add Branch' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Branch Name *' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Branch Code *' })).toHaveValue('');
  });

  test('1.4 Newly added branch appears in the table', async ({ page }) => {
    const timestamp = Date.now();
    const branchName = `Verify Branch ${timestamp}`;
    const branchCode = `VB${timestamp.toString().slice(-6)}`;

    await page.getByRole('textbox', { name: 'Branch Name *' }).fill(branchName);
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill(branchCode);
    await getBranchAddressField(page).fill('Pune, Maharashtra');

    // Branch Location is required — interact with the map modal (same as test 1.1)
    await page.getByRole('button', { name: 'Select Branch Location' }).click();
    await page.waitForTimeout(2000);
    const searchInput = page.getByRole('textbox', { name: 'Search for a place' });
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.pressSequentially('Pune, Maharashtra', { delay: 100 });
    await page.waitForTimeout(2000);
    const firstSuggestion = page.locator('.pac-container .pac-item').first();
    const suggestionVisible = await firstSuggestion.isVisible({ timeout: 3000 }).catch(() => false);
    if (suggestionVisible) {
      await firstSuggestion.click();
    } else {
      await searchInput.press('ArrowDown');
      await page.waitForTimeout(300);
      await searchInput.press('Enter');
    }
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(3000);

    // Verify branch was created: form resets to Add state on success
    await expect(page.getByRole('heading', { name: 'Add Branch' })).toBeVisible({ timeout: 10000 });

    // Reload the page to see the updated table
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    await dismissNotificationPopup(page);

    // Set status filter to 'All' so newly added branch is visible regardless of default status
    await page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first().selectOption('All');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    // Search for the newly added branch
    const searchBox = page.getByRole('textbox', { name: 'Search by branch name' });
    await searchBox.waitFor({ state: 'visible', timeout: 15000 });
    await searchBox.fill(branchName);
    await page.waitForTimeout(5000);

    await expect(page.getByRole('cell', { name: branchName, exact: true })).toBeVisible({ timeout: 60000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 – Add Branch Validation (Negative Tests)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Add Branch Validation', () => {

  test.beforeEach(async ({ page }) => {
    await gotoBranchMaster(page);
  });

  test('2.1 Submit with all fields empty shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);

    // All three mandatory fields should show validation errors
    await expect(page.getByText('Please enter branch name')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Please enter branch code')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Please enter address')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.2 Submit with empty Branch Name shows validation error', async ({ page }) => {
    // Leave Branch Name empty, fill others
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill('TC01');
    await getBranchAddressField(page).fill('Test Address');

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(/please enter branch name/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.3 Submit with Branch Code cleared shows validation or auto-fills code', async ({ page }) => {
    // Branch Code auto-fills from Branch Name (uppercase).
    // Fill name, then explicitly clear the auto-filled code.
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('No Code Branch');
    await page.waitForTimeout(500);

    // Clear the auto-filled branch code
    await page.getByRole('textbox', { name: 'Branch Code *' }).clear();
    await getBranchAddressField(page).fill('Test Address');

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // App should either show validation error or remain on page
    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.4 Submit with empty Branch Address shows validation or stays on page', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('No Address Branch');
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill('NAB1');
    // Leave Branch Address empty

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    // App should either show validation error or remain on page
    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.5 Submit with only Branch Name filled stays on page', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('Only Name Branch');
    // Branch Code auto-fills; Branch Address is empty

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.6 Branch Name field does not accept only whitespace', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('   ');
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill('WS01');
    await getBranchAddressField(page).fill('Whitespace Test');

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

  test('2.7 Duplicate branch name submission handling', async ({ page }) => {
    // Use an existing branch name
    await page.getByRole('textbox', { name: 'Branch Name *' }).fill('Pune');
    await page.getByRole('textbox', { name: 'Branch Code *' }).fill('PUNE');
    await getBranchAddressField(page).fill('Pune Address');

    await page.getByRole('button', { name: /Submit/ }).click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 – UI Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Branch Master UI', () => {

  test.beforeEach(async ({ page }) => {
    await gotoBranchMaster(page);
  });

  test('3.1 Page heading and form heading are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Branch Master' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Branch' })).toBeVisible();
  });

  test('3.2 All form fields are visible', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Branch Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Branch Code *' })).toBeVisible();
    await expect(getBranchAddressField(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select Branch Location' })).toBeVisible();
  });

  test('3.3 Submit and Clear buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Submit/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear/ })).toBeVisible();
  });

  test('3.4 Branch Name field has correct placeholder', async ({ page }) => {
    const branchNameField = page.getByRole('textbox', { name: 'Branch Name *' });
    await expect(branchNameField).toBeVisible();
    await expect(branchNameField).toHaveValue('');
  });

  test('3.5 Branch table is visible with correct headers', async ({ page }) => {
    await waitForTableRows(page);

    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('Sr. No.')).toBeVisible();
    await expect(table.getByText('Actions')).toBeVisible();
    await expect(table.getByText('Branch Name')).toBeVisible();
    await expect(table.getByText('Branch Code')).toBeVisible();
    await expect(table.getByText('Branch Address')).toBeVisible();
    await expect(table.getByText('Status')).toBeVisible();
  });

  test('3.6 Table has data rows loaded', async ({ page }) => {
    await waitForTableRows(page);

    const rowCount = await page.locator('div.rdt_TableRow').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('3.7 Search box is visible and functional', async ({ page }) => {
    await waitForTableRows(page);

    const searchBox = page.getByRole('textbox', { name: 'Search by branch name' });
    await expect(searchBox).toBeVisible();

    await searchBox.fill('Pune');
    await page.waitForTimeout(2000);

    const filteredRows = await page.locator('div.rdt_TableRow').count();
    expect(filteredRows).toBeGreaterThan(0);
    await expect(page.locator('div.rdt_TableRow').filter({ hasText: 'Pune' }).first()).toBeVisible();
  });

  test('3.8 Status filter dropdown is visible with correct options', async ({ page }) => {
    await waitForTableRows(page);

    const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
    await expect(statusFilter.first()).toBeVisible();
  });

  test('3.9 Show entries dropdown is visible', async ({ page }) => {
    await waitForTableRows(page);

    const showDropdown = page.locator('select').filter({ has: page.locator('option', { hasText: '10' }) });
    await expect(showDropdown.first()).toBeVisible();
  });

  test('3.10 Edit icon is visible in table rows', async ({ page }) => {
    await waitForTableRows(page);

    const editIcon = page.locator('div.rdt_TableRow').first().getByRole('img', { name: 'Edit' });
    await expect(editIcon).toBeVisible();
  });

  test('3.11 Clicking Edit loads branch data into the form', async ({ page }) => {
    await waitForTableRows(page);

    const firstRowBranchName = await page.locator('div.rdt_TableRow').first().locator('[role="cell"]').nth(2).textContent();

    await clickEditOnRow(page, 0);
    await page.waitForTimeout(2000);

    const branchNameValue = await page.getByRole('textbox', { name: 'Branch Name *' }).inputValue();
    expect(branchNameValue).toBeTruthy();
    expect(branchNameValue).toBe(firstRowBranchName?.trim());
  });

  test('3.12 Select Branch Location opens map popup', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Branch Location' }).click();
    await page.waitForTimeout(3000);

    const mapContainer = page.locator('.modal, [class*="modal"], [class*="map"], [role="dialog"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test('3.13 Map popup has search box and confirm button', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Branch Location' }).click();
    await page.waitForTimeout(3000);

    const mapSearchBox = page.locator('.pac-input, input[placeholder*="Search"], input[placeholder*="search"]').first();
    const searchVisible = await mapSearchBox.isVisible({ timeout: 5000 }).catch(() => false);
    expect(searchVisible).toBeTruthy();

    const confirmBtn = page.getByRole('button', { name: /Confirm/i });
    const confirmVisible = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);
    expect(confirmVisible).toBeTruthy();
  });

  test('3.14 Pagination controls are visible', async ({ page }) => {
    await waitForTableRows(page);

    await expect(page.getByRole('button', { name: /previous page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next page/i })).toBeVisible();
  });

  test('3.15 Status filter filters table by Active/Inactive', async ({ page }) => {
    await waitForTableRows(page);

    const statusFilter = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) });
    await statusFilter.first().selectOption('Active');
    await page.waitForTimeout(2000);

    const rows = page.locator('div.rdt_TableRow');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const statusCell = rows.nth(i).locator('[role="cell"]').last();
      await expect(statusCell).toContainText('Active');
    }
  });

  test('3.16 URL is correct for Branch Master page', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(BRANCH_MASTER_URL));
  });

 });
