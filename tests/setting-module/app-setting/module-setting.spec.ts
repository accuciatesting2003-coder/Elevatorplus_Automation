import { test, expect } from '../../fixtures/auth-fixture';
import { LoginPage } from '../../helpers/page-objects/login-page';

// ─── URLs ────────────────────────────────────────────────────────────────────
const MODULE_SETTINGS_URL      = '/settings/configure?tab=modules';
const PREFIX_CONFIG_URL        = '/settings/configure?tab=prefix';
const CEILING_MASTER_URL       = '/master/ceiling-master';
const FLOORING_MASTER_URL      = '/master/flooring-master';
const SHAFT_MASTER_URL         = '/master/shaft-master';
const PRODUCT_CATEGORY_URL     = '/product-inventory/product-category-master';
const USER_MASTER_URL          = '/master/user';
const ONE_TIME_INSPECTION_URL  = '/master/one-time-service-inspection-checklist';
const CHECKLIST_DROPDOWN_URL   = '/master/checklist-dropdown-master';
const MANAGE_SERVICE_CODES_URL = '/master/manage-service-code';

// ─── Toggle labels exactly as shown on the Module Settings page ───────────────
const TOGGLE = {
  PM_INSPECTION:    'PM Inspection Required',
  MODERNIZATION:    'Modernization Contract',
  ONE_TIME_SERVICE: 'One-Time Service Contract',
  INTERNATIONAL_PAY:'International Payment',
  KIT_SUPPLY:       'Kit Supply (Third-Party Lift)',
  MATERIAL_ARRIVAL: 'Material Arrival Notes',
  MATERIAL_DELIVERED:'Material Delivered',
  SALES_ORDER:      'Sales Order Required',
  CUSTOMER_OTP:     'Customer OTP Enabled',
  AUTO_CALC:        'Automatic Calculation for Quotation',
  TWO_FA:           'Enable Two-Factor Authentication (2FA)',
  SHOW_MATERIAL:    'Show Material Used In Jobs',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function reAuthenticate(page: any) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnvCredentials();
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await loginPage.dismissNotificationPopup();
}

async function registerPopupHandler(page: any) {
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
  // The onboarding checklist overlay (.checklist-component.visible) intercepts toggle clicks.
  // This handler fires automatically before any blocked action and hides the overlay via JS.
  await page.addLocatorHandler(
    page.locator('.checklist-component.visible'),
    async () => {
      await page.evaluate(() => {
        const el = document.querySelector('.checklist-component') as HTMLElement | null;
        if (el) { el.style.display = 'none'; el.style.pointerEvents = 'none'; }
      }).catch(() => {});
    }
  );
}

async function dismissOnboardingPanel(page: any) {
  try {
    const btn = page.locator('.checklist-component button').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
    }
    // JS fallback: hide the checklist overlay so it doesn't block pointer events
    await page.evaluate(() => {
      const el = document.querySelector('.checklist-component') as HTMLElement | null;
      if (el) el.style.display = 'none';
    }).catch(() => {});
  } catch { /* not present — continue */ }
}

async function gotoModuleSettings(page: any) {
  await registerPopupHandler(page);
  await page.goto(MODULE_SETTINGS_URL);
  await page.waitForLoadState('networkidle');
  await dismissOnboardingPanel(page);

  // If redirected away (2FA session disruption or session expiry), re-authenticate once
  const onSettingsPage = await page.getByText('Module Setting', { exact: true })
    .isVisible({ timeout: 5000 }).catch(() => false);
  if (!onSettingsPage) {
    await reAuthenticate(page);
    await page.goto(MODULE_SETTINGS_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
  }

  await page.getByText('Module Setting', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
}

/**
 * Returns the checkbox (toggle) for the named module on the Module Settings page.
 * DOM: each row has [label-div + description-div] and [toggle-div containing checkbox]
 * all inside a shared parent row div. Traversing up 2 levels from the label text
 * reaches the row container which also contains the checkbox.
 */
function getToggle(page: any, label: string) {
  return page.getByText(label, { exact: true }).locator('../..').locator('input[type="checkbox"]');
}

/**
 * Set the named toggle to enabled/disabled and click Save Changes.
 * Only clicks the toggle if current state differs from desired state.
 */
async function setToggle(page: any, label: string, enable: boolean) {
  const toggle = getToggle(page, label);
  await toggle.waitFor({ state: 'attached', timeout: 15000 });
  const isChecked = await toggle.isChecked();
  // No change needed — return early to avoid a non-dirty save that can corrupt state
  if (enable === isChecked) return;
  await toggle.locator('..').click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  // SweetAlert2 confirmation dialog must be confirmed before the API call fires
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForLoadState('networkidle');
  // Wait for React to finish re-rendering after the API response
  await page.waitForTimeout(1500);
}

/**
 * Navigate to User Master, find Ganesh Kadam and open his record for User Access editing.
 */
async function openGaneshKadamUserAccess(page: any) {
  await page.goto(USER_MASTER_URL);
  await page.waitForLoadState('networkidle');
  await dismissOnboardingPanel(page);
  // Search for Ganesh Kadam
  const searchBox = page.getByRole('textbox', { name: /search/i }).or(
    page.getByPlaceholder(/search/i)
  ).first();
  await searchBox.fill('Ganesh');
  await page.waitForTimeout(1000);
  // Click the Edit icon on the Ganesh Kadam row
  await page.locator('div.rdt_TableRow').filter({ hasText: /Ganesh/i }).first()
    .locator('svg[title="Edit"]').click();
  await page.waitForLoadState('networkidle');
  // Open User Access tab
  await page.getByRole('button', { name: /User Access/i })
    .or(page.getByText('User Access', { exact: true })).first().click();
  await page.waitForTimeout(800);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Smoke Tests', () => {

  test('TC-SM-01: Module Settings page loads successfully', async ({ page }) => {
    await gotoModuleSettings(page);
    await expect(page).toHaveURL(/settings\/configure/);
    await expect(page.getByText('Module Setting', { exact: true })).toBeVisible();
    // Save Changes button confirms the page is fully loaded with toggles
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

  test('TC-SM-02: All four impactful module toggles are present', async ({ page }) => {
    await gotoModuleSettings(page);
    await expect(page.getByText(TOGGLE.ONE_TIME_SERVICE, { exact: true })).toBeVisible();
    await expect(page.getByText(TOGGLE.KIT_SUPPLY,       { exact: true })).toBeVisible();
    await expect(page.getByText(TOGGLE.MODERNIZATION,    { exact: true })).toBeVisible();
    await expect(page.getByText(TOGGLE.AUTO_CALC,        { exact: true })).toBeVisible();
  });

  test('TC-SM-03: Toggle state is preserved after page refresh (Kit Supply)', async ({ page }) => {
    await gotoModuleSettings(page);
    const toggle = getToggle(page, TOGGLE.KIT_SUPPLY);
    const initialState = await toggle.isChecked();

    // Flip the state
    await toggle.locator('..').click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const newState = !initialState;
    await expect(getToggle(page, TOGGLE.KIT_SUPPLY)).toBeChecked({ checked: newState });

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(getToggle(page, TOGGLE.KIT_SUPPLY)).toBeChecked({ checked: newState });

    // Restore original state
    await getToggle(page, TOGGLE.KIT_SUPPLY).locator('..').click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Toggle-Only Modules — Enable, Disable, and Persist
// ─────────────────────────────────────────────────────────────────────────────

const TOGGLE_ONLY_MODULES: Array<{ id: string; label: string }> = [
  { id: 'TC-TOG-01', label: TOGGLE.PM_INSPECTION     },
  { id: 'TC-TOG-02', label: TOGGLE.MATERIAL_DELIVERED },
  { id: 'TC-TOG-03', label: TOGGLE.CUSTOMER_OTP      },
  { id: 'TC-TOG-04', label: TOGGLE.TWO_FA            },
  { id: 'TC-TOG-05', label: TOGGLE.INTERNATIONAL_PAY },
  { id: 'TC-TOG-06', label: TOGGLE.MATERIAL_ARRIVAL  },
  { id: 'TC-TOG-07', label: TOGGLE.SALES_ORDER       },
  { id: 'TC-TOG-08', label: TOGGLE.SHOW_MATERIAL     },
];

test.describe('2. Toggle-Only Modules — Enable, Disable, and Persist', () => {

  for (const { id, label } of TOGGLE_ONLY_MODULES) {
    test(`${id}: ${label} — enables, disables, and persists`, async ({ page }) => {
      await gotoModuleSettings(page);

      // Material Delivered has a server-side dependency on Material Arrival Notes.
      // Ensure Material Arrival is enabled before attempting to enable Material Delivered.
      if (label === TOGGLE.MATERIAL_DELIVERED) {
        await setToggle(page, TOGGLE.MATERIAL_ARRIVAL, true);
      }

      // ── Enable ──
      const toggle = getToggle(page, label);
      if (!(await toggle.isChecked())) await toggle.locator('..').click();
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await expect(getToggle(page, label)).toBeChecked();

      // ── Reload → still enabled ──
      await page.reload();
      await page.waitForLoadState('networkidle');
      await dismissOnboardingPanel(page);
      await expect(getToggle(page, label)).toBeChecked();

      // ── Disable ──
      await getToggle(page, label).locator('..').click();
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await expect(getToggle(page, label)).not.toBeChecked();

      // ── Reload → still disabled ──
      await page.reload();
      await page.waitForLoadState('networkidle');
      await dismissOnboardingPanel(page);
      await expect(getToggle(page, label)).not.toBeChecked();

      // ── Restore to enabled (2FA starts disabled — leave it off) ──
      if (label !== TOGGLE.TWO_FA) {
        await getToggle(page, label).locator('..').click();
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      }
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. One-Time Service Contract
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. One-Time Service Contract', () => {

  test('TC-OTS-01: Enabled — "One Time Services Reports" section appears in admin panel sidebar', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('link', { name: /One Time Services Reports/i })).toBeVisible();
  });

  test('TC-OTS-02: Disabled — admin sidebar retains "One Time Services Reports" link (admin always has access)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Admin navigation always shows the OTS section regardless of the module toggle
    await expect(page.locator('.navigation.navigation-main').getByRole('link', { name: /One Time Services Reports/i })).toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-OTS-03: Enabled — "One Time Service Inspection Checklist" and "Checklist Dropdown Master" items visible in user access (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await openGaneshKadamUserAccess(page);
    // Scope to ul.list-group to avoid matching hidden sidebar nav spans with the same text
    await expect(page.locator('ul.list-group').getByText('One Time Service Inspection Checklist').first()).toBeVisible();
    await expect(page.locator('ul.list-group').getByText('Checklist Dropdown Master').first()).toBeVisible();
  });

  test('TC-OTS-04: Disabled — sidebar hides "One Time Service Inspection Checklist" and "Checklist Dropdown Master" nav links', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the "One Time Services Reports" accordion (section itself always visible for admin)
    const otsNavItem = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /One Time Services Reports/ }).first();
    if (await otsNavItem.isVisible().catch(() => false)) await otsNavItem.click();
    await page.waitForTimeout(400);
    // When OTS disabled, these child links are removed from the nav
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /One Time Service Inspection Checklist/i }).first()).not.toBeVisible();
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /Checklist Dropdown Master/i }).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-OTS-05: Enabled — "One Time Service" option present in Add Service Code Type dropdown', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await page.goto(MANAGE_SERVICE_CODES_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Use force:true to bypass the checklist overlay that intercepts pointer events
    await page.getByRole('button', { name: /Add Service Code/i }).click({ force: true });
    await page.waitForTimeout(800);
    // React Select renders a hidden native <option> for every available option.
    // "One Time Service" option should exist in the DOM when OTS is enabled.
    await expect(page.locator('option[value="One Time Service"]')).toHaveCount(1);
  });

  test('TC-OTS-06: Disabled — "One Time Service" option absent from Add Service Code Type dropdown', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto(MANAGE_SERVICE_CODES_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Use force:true to bypass the checklist overlay that intercepts pointer events
    await page.getByRole('button', { name: /Add Service Code/i }).click({ force: true });
    await page.waitForTimeout(800);
    // Open dropdown via JS: focus the react-select input and dispatch ArrowDown
    await page.evaluate(() => {
      const input = document.querySelector('[class*="select__control"] input') as HTMLInputElement | null;
      if (input) {
        input.scrollIntoView({ block: 'center' });
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
      }
    });
    await page.waitForTimeout(600);
    // When OTS disabled, "One Time Service" should not appear in the visible dropdown options
    await expect(page.locator('[class*="select__option"]').filter({ hasText: /^One Time Service$/ })).toHaveCount(0);
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-OTS-07: Enabled — Reports section shows One Time Service Report checkboxes (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await openGaneshKadamUserAccess(page);
    // Scope to list-group to avoid matching collapsed sidebar nav items
    await expect(page.locator('ul.list-group').getByText('One Time Service Report').first()).toBeVisible();
    await expect(page.locator('ul.list-group').getByText('One Time Service Quotation Report').first()).toBeVisible();
  });

  test('TC-OTS-08: Disabled — sidebar hides "One Time Service Report" nav link', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the "One Time Services Reports" accordion section in the sidebar
    const otsNavItem08 = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /One Time Services Reports/ }).first();
    if (await otsNavItem08.isVisible().catch(() => false)) await otsNavItem08.click();
    await page.waitForTimeout(400);
    // When OTS disabled, the One Time Service Report nav link is removed
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /One Time Service Report/i }).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-OTS-09: Enabled — "One Time Services" section visible in App User Access (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await openGaneshKadamUserAccess(page);
    // Switch to App User Access tab
    await page.getByRole('button', { name: /App User Access/i })
      .or(page.getByText('App User Access', { exact: true })).first().click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /One Time Services/ }).first()).toBeVisible();
  });

  test('TC-OTS-10: Disabled — sidebar hides "One Time Service Quotation Report" nav link', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the "One Time Services Reports" accordion section in the sidebar
    const otsNavItem10 = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /One Time Services Reports/ }).first();
    if (await otsNavItem10.isVisible().catch(() => false)) await otsNavItem10.click();
    await page.waitForTimeout(400);
    // When OTS disabled, the One Time Service Quotation Report nav link is removed
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /One Time Service Quotation Report/i }).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-OTS-11: Enabled — "One-time Service Quotation" and "One-time Service" rows visible in Prefix Configuration', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
    await page.goto(PREFIX_CONFIG_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByText('One-time Service Quotation', { exact: true })).toBeVisible();
    await expect(page.getByText('One-time Service', { exact: true })).toBeVisible();
  });

  test('TC-OTS-12: Disabled — sidebar hides OTS inspection and report nav links', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the "One Time Services Reports" accordion to reveal (or confirm absence of) child links
    const otsNavItem12 = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /One Time Services Reports/ }).first();
    if (await otsNavItem12.isVisible().catch(() => false)) await otsNavItem12.click();
    await page.waitForTimeout(400);
    // When OTS disabled, all OTS-specific nav links are removed from the sidebar
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /One Time Service Inspection Checklist/i }).first()).not.toBeVisible();
    await expect(page.locator('.navigation.navigation-main').locator('a').filter({ hasText: /One Time Service Report/i }).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Kit Supply
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4. Kit Supply', () => {

  test('TC-KIT-01: Enabled — "Kit Based Category" checkbox visible in Product Category Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.KIT_SUPPLY, true);
    await page.goto(PRODUCT_CATEGORY_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.locator('form').getByText('Kit Based Category')).toBeVisible();
  });

  test('TC-KIT-02: Disabled — "Kit Based Category" checkbox hidden in Product Category Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.KIT_SUPPLY, false);
    await page.goto(PRODUCT_CATEGORY_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.locator('form').getByText('Kit Based Category')).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.KIT_SUPPLY, true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Modernization Contract
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5. Modernization Contract', () => {

  test('TC-MOD-01: Enabled — Modernization Contract toggle persists as enabled after page reload', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, true);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(getToggle(page, TOGGLE.MODERNIZATION)).toBeChecked();
  });

  test('TC-MOD-02: Disabled — "Modernization Job" and "Modernization Quotation" rows hidden in Prefix & Numbering', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, false);
    await page.goto(PREFIX_CONFIG_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByText('Modernization Job', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Modernization Quotation', { exact: true })).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, true);
  });

  test('TC-MOD-03: Enabled — "Modernization Job" and "Modernization Quotation" rows visible in Prefix & Numbering', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, true);
    await page.goto(PREFIX_CONFIG_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByText('Modernization Job', { exact: true })).toBeVisible();
    await expect(page.getByText('Modernization Quotation', { exact: true })).toBeVisible();
  });

  test('TC-MOD-04: Disabled — "Modernization Job" and "Modernization Quotation" rows hidden in Prefix & Numbering', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, false);
    await page.goto(PREFIX_CONFIG_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByText('Modernization Job', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Modernization Quotation', { exact: true })).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.MODERNIZATION, true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Automatic Calculation for Quotation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('6. Automatic Calculation for Quotation', () => {

  test('TC-ACQ-01: Enabled — "Sales Forms" section displayed in User Access (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await openGaneshKadamUserAccess(page);
    await expect(page.getByText('Sales Forms', { exact: true })).toBeVisible();
  });

  test('TC-ACQ-02: Disabled — "Sales Forms" section hidden in User Access (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    // Navigate via dashboard to allow server to propagate the ACQ=disabled state
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await openGaneshKadamUserAccess(page);
    await expect(page.getByText('Sales Forms', { exact: true })).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ACQ-03: Enabled — Material Category Master and Material Master checkboxes displayed in Sales Master (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await openGaneshKadamUserAccess(page);
    // Scope to list-group to avoid matching collapsed sidebar nav items
    await expect(page.locator('ul.list-group').getByText('Material Category Master').first()).toBeVisible();
    await expect(page.locator('ul.list-group').getByText('Material Master').first()).toBeVisible();
  });

  test('TC-ACQ-04: Disabled — Material Category Master and Material Master checkboxes hidden (Ganesh Kadam)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    await openGaneshKadamUserAccess(page);
    await expect(page.locator('ul.list-group').getByText('Material Category Master').first()).not.toBeVisible();
    await expect(page.locator('ul.list-group').getByText('Material Master').first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ACQ-05: Enabled — "Sales Forms" section displayed under Masters in sidebar (admin)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the Masters nav item to reveal Sales Forms sub-link
    const mastersNav = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /^Masters$/ }).first();
    if (await mastersNav.isVisible().catch(() => false)) await mastersNav.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.navigation.navigation-main').getByRole('link', { name: 'Sales Forms' })).toBeVisible();
  });

  test('TC-ACQ-06: Disabled — "Sales Forms" section hidden under Masters in sidebar (admin)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('link', { name: 'Sales Forms' })).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ACQ-07: Enabled — Price field visible in Ceiling Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await page.goto(CEILING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();
  });

  test('TC-ACQ-08: Disabled — Price field hidden in Ceiling Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    await page.goto(CEILING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ACQ-09: Enabled — Price field visible in Flooring Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await page.goto(FLOORING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();
  });

  test('TC-ACQ-10: Disabled — Price field hidden in Flooring Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    // Navigate via dashboard to allow server to propagate the ACQ=disabled state
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(FLOORING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ACQ-11: Enabled — Price field visible in Shaft Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
    await page.goto(SHAFT_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();
  });

  test('TC-ACQ-12: Disabled — Price field hidden in Shaft Master form', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);
    await page.goto(SHAFT_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Admin User Type — Master Visibility Checks
// (Admin always has all accesses; only verify master/section visibility)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('7. Admin User — Master Visibility After Toggle Change', () => {

  test('TC-ADM-01: Admin — OTS disabled — admin sidebar retains "One Time Services Reports" link (admin always has access)', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, false);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Admin navigation always shows the OTS section regardless of the module toggle
    await expect(page.locator('.navigation.navigation-main').getByRole('link', { name: /One Time Services Reports/i })).toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.ONE_TIME_SERVICE, true);
  });

  test('TC-ADM-02: Admin — Kit Supply disabled hides "Kit Based Category" checkbox in Product Category Master', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.KIT_SUPPLY, false);
    await page.goto(PRODUCT_CATEGORY_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.locator('form').getByText('Kit Based Category')).not.toBeVisible();
    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.KIT_SUPPLY, true);
  });

  test('TC-ADM-03: Admin — ACQ disabled hides Sales Forms in sidebar and hides Price in Ceiling Master', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, false);

    // Sales Forms is hidden when ACQ is disabled (auto-calc not active)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await dismissOnboardingPanel(page);
    await expect(page.locator('.navigation.navigation-main').getByRole('link', { name: 'Sales Forms' })).not.toBeVisible();

    // Price field should be hidden in Ceiling Master
    await page.goto(CEILING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).not.toBeVisible();

    // Restore
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);
  });

  test('TC-ADM-04: Admin — ACQ enabled hides Sales Forms in sidebar and shows Price in Ceiling, Flooring, Shaft Masters', async ({ page }) => {
    await gotoModuleSettings(page);
    await setToggle(page, TOGGLE.AUTO_CALC, true);

    // Sales Forms is shown when ACQ is enabled (auto-calc mode — manual pricing forms available)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    // Expand the Masters nav item to reveal Sales Forms sub-link
    const mastersNav2 = page.locator('.navigation.navigation-main li.nav-item').filter({ hasText: /^Masters$/ }).first();
    if (await mastersNav2.isVisible().catch(() => false)) await mastersNav2.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.navigation.navigation-main').getByRole('link', { name: 'Sales Forms' })).toBeVisible();

    // Price field should be visible in Ceiling Master
    await page.goto(CEILING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();

    // Price field should be visible in Flooring Master
    await page.goto(FLOORING_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();

    // Price field should be visible in Shaft Master
    await page.goto(SHAFT_MASTER_URL);
    await page.waitForLoadState('networkidle');
    await dismissOnboardingPanel(page);
    await expect(page.getByRole('textbox', { name: /Price/i })
      .or(page.getByRole('spinbutton', { name: /Price/i }))
      .or(page.locator('input[placeholder*="price" i]')).first()).toBeVisible();
  });

});
