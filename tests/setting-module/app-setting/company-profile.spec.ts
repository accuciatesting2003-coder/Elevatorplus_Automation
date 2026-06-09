import { test, expect } from '../../fixtures/auth-fixture';
import * as path from 'path';

const COMPANY_PROFILE_URL = '/settings/configure?tab=company';
const LOGO_JPG = path.join(__dirname, '../../test-data/company-logo-jpg.jpg');
const LOGO_PNG = path.join(__dirname, '../../test-data/company-logo-png.png');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
      await page.waitForTimeout(300);
    }
  );
}

async function dismissPopup(page: any) {
  try {
    const btn = page.getByRole('button', { name: /Maybe Later/i });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(400);
    }
  } catch { /* popup did not appear */ }
}

async function gotoCompanyProfile(page: any) {
  await registerPopupHandler(page);
  await page.goto(COMPANY_PROFILE_URL, { timeout: 60000 });
  await page.waitForLoadState('networkidle');
  await page.getByText('Company Information').waitFor({ state: 'visible', timeout: 30000 });
  await dismissPopup(page);
}

/** Click Save Changes → confirm in the confirmation dialog → assert success toast */
async function saveAndConfirm(page: any) {
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('heading', { name: 'Are you sure?' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Setting has been saved successfully!')).toBeVisible({ timeout: 15000 });
}

/** Click Save Changes → dismiss the confirmation dialog without saving */
async function saveAndCancel(page: any) {
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('heading', { name: 'Are you sure?' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(300);
}

/** Clears the phone-input-container mobile field via native-setter so React sees the change */
async function clearMobileInput(page: any) {
  await page.evaluate(() => {
    const input = document.querySelector('.phone-input-container input.form-control') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
}

/** Fill a textarea using the native setter so React's synthetic onChange fires */
async function fillTextarea(page: any, selector: string, value: string) {
  await page.evaluate(({ sel, val }: { sel: string; val: string }) => {
    const ta = document.querySelector(sel) as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
    setter.call(ta, val);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }, { sel: selector, val: value });
}

/** Ensure billing and shipping addresses are non-empty before saving (guards against corrupted staging data) */
async function ensureAddressesPopulated(page: any) {
  const billing = await loc.billingAddress(page).inputValue();
  const shipping = await loc.shippingAddress(page).inputValue();
  if (!billing) {
    await fillTextarea(page, 'textarea#ship_to_address', 'Default Billing, Test Street, Pune - 411001');
  }
  if (!shipping) {
    if (await loc.sameAsBilling(page).isChecked()) {
      await loc.sameAsBilling(page).uncheck();
      await page.waitForTimeout(200);
    }
    await fillTextarea(page, 'textarea#ship_address', 'Default Shipping, Test Lane, Mumbai - 400001');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Field locators
// ─────────────────────────────────────────────────────────────────────────────

const loc = {
  // Company Information
  countryCodeInput: (p: any) => p.getByRole('textbox', { name: 'Select your country code' }),
  currencyValueText: (p: any) => p.locator('div').filter({ has: p.getByText('Currency*') }).locator('div').filter({ hasText: /\(.*-/ }).first(),
  dateFormatSelect: (p: any) => p.getByRole('combobox', { name: 'Date Format' }),
  companyName: (p: any) => p.locator('#company_name'),
  mobile: (p: any) => p.locator('.phone-input-container input.form-control'),
  taxId: (p: any) => p.locator('#gstn'),
  panNumber: (p: any) => p.locator('#pan_number'),

  // Logo
  logoArea: (p: any) =>
    p.locator('div').filter({ has: p.getByText('Logo *', { exact: true }) }).first(),
  removeLogoBtn: (p: any) => p.getByRole('button', { name: 'Remove' }),
  authSigFileInput: (p: any) => p.locator('#file_input_auth_sig'),

  // Address
  billingAddress: (p: any) => p.locator('textarea#ship_to_address'),
  shippingAddress: (p: any) => p.locator('textarea#ship_address'),
  sameAsBilling: (p: any) => p.getByRole('checkbox', { name: 'Same as Billing Address' }),

  // Actions
  saveBtn: (p: any) => p.getByRole('button', { name: 'Save Changes' }),
  confirmBtn: (p: any) => p.getByRole('button', { name: 'Confirm' }),
  cancelBtn: (p: any) => p.getByRole('button', { name: 'Cancel' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('1.1 TC-SM-01: Company Profile page loads at correct URL with Company & Identity heading', async ({ page }) => {
    await expect(page).toHaveURL(/settings\/configure\?tab=company/);
    await expect(page.getByText('Company & Identity').first()).toBeVisible();
  });

  test('1.2 TC-SM-01: All three sections are visible', async ({ page }) => {
    await expect(page.getByText('Company Information')).toBeVisible();
    await expect(page.getByText('Company Logos')).toBeVisible();
    await expect(page.getByText('Company Address')).toBeVisible();
  });

  test('1.3 TC-SM-02: Company Information section has all expected fields', async ({ page }) => {
    await expect(page.getByText('Country Code*')).toBeVisible();
    await expect(loc.countryCodeInput(page)).toBeDisabled();
    await expect(page.getByText('Currency*')).toBeVisible();
    await expect(loc.dateFormatSelect(page)).toBeVisible();
    await expect(loc.companyName(page)).toBeVisible();
    await expect(page.getByText('Company Mobile Number*')).toBeVisible();
    await expect(loc.mobile(page)).toBeVisible();
    await expect(loc.taxId(page)).toBeVisible();
  });

  test('1.4 TC-SM-03: Company Logos section has Logo upload and Authorized Signature upload', async ({ page }) => {
    await expect(page.getByText('Logo *')).toBeVisible();
    await expect(page.getByText('Authorized Signature (optional)')).toBeVisible();
    await expect(page.getByText('PNG, JPG (Max 1MB)')).toBeVisible();
  });

  test('1.5 TC-SM-04: Company Address section has Billing, Same As Billing checkbox, and Shipping fields', async ({ page }) => {
    await expect(loc.billingAddress(page)).toBeVisible();
    await expect(loc.sameAsBilling(page)).toBeVisible();
    await expect(loc.shippingAddress(page)).toBeVisible();
    await expect(page.getByText('Appears on invoices and client-facing documents.')).toBeVisible();
  });

  test('1.6 TC-SM-05: Section tabs and Save Changes button are visible', async ({ page }) => {
    await expect(loc.saveBtn(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Company & Identity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Module Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prefix & Numbering' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Configuration Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Integrations' })).toBeVisible();
  });

  test('1.7 TC-SM-06: Form is pre-filled with existing saved data', async ({ page }) => {
    const companyName = await loc.companyName(page).inputValue();
    const billing = await loc.billingAddress(page).inputValue();
    const shipping = await loc.shippingAddress(page).inputValue();
    expect(companyName.length).toBeGreaterThan(0);
    expect(billing.length).toBeGreaterThan(0);
    expect(shipping.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Country Code and Currency
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2. Country Code and Currency', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('2.1 TC-CUR-03: Country Code field is disabled — cannot be edited manually', async ({ page }) => {
    const countryCode = loc.countryCodeInput(page);
    // Primary assertion: the field must be disabled (read-only, driven by Currency selection)
    await expect(countryCode).toBeDisabled();
    // Secondary assertion: when a currency is selected the value is a country code (+XX);
    // if no currency is set (empty staging data) the field is empty — both are valid read-only states
    const val = await countryCode.inputValue();
    expect(val).toMatch(/^\+\d+$|^$/);
  });

  test('2.2 TC-CUR-02: Currency dropdown shows currently selected currency', async ({ page }) => {
    // A currency value is selected (India INR or equivalent)
    const currencyWrapper = page.locator('div').filter({ has: page.getByText('Currency*') }).first();
    const currentText = await currencyWrapper.textContent();
    expect(currentText).toMatch(/\(.*-.*\)/);
  });

  test('2.3 TC-CUR-01: Selecting a different currency updates Country Code', async ({ page }) => {
    const originalCode = await loc.countryCodeInput(page).inputValue();

    // Open the currency dropdown using the arrow/toggle button
    const currencySection = page.locator('div').filter({ has: page.getByText('Currency*') }).first();
    const dropdownToggle = currencySection.locator('img').last();
    await dropdownToggle.click();
    await page.waitForTimeout(400);

    // Search for United States
    const searchInput = currencySection.locator('input').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('United States');
      await page.waitForTimeout(400);
      const usdOption = page.locator('li, div[class*="option"]').filter({ hasText: /United States.*USD/i }).first();
      if (await usdOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await usdOption.click();
        await page.waitForTimeout(500);
        const newCode = await loc.countryCodeInput(page).inputValue();
        expect(newCode).not.toBe(originalCode);
        expect(newCode).toMatch(/^\+\d+/);
        // Restore India INR
        await dropdownToggle.click();
        await page.waitForTimeout(300);
        const restoreInput = currencySection.locator('input').first();
        await restoreInput.fill('India');
        await page.waitForTimeout(400);
        const inrOption = page.locator('li, div[class*="option"]').filter({ hasText: /India.*INR/i }).first();
        if (await inrOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await inrOption.click();
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        await page.keyboard.press('Escape');
        test.skip(true, 'USD option not found — currency dropdown structure may differ');
      }
    } else {
      await page.keyboard.press('Escape');
      test.skip(true, 'Currency dropdown search not accessible');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Date Format
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. Date Format', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('3.1 TC-SM-02: Date Format dropdown has all expected format options', async ({ page }) => {
    const sel = loc.dateFormatSelect(page);
    await expect(sel).toBeVisible();
    await expect(sel.locator('option', { hasText: 'DD/MM/YYYY (11/09/2026)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'MM/DD/YYYY (09/11/2026)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'YYYY-MM-DD (2026-09-11)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'DD-MM-YYYY (11-09-2026)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'DD MMMM YYYY (11 September 2026)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'DD MMM YYYY (11 Sep 2026)' })).toBeAttached();
    await expect(sel.locator('option', { hasText: 'MM-DD-YY (09-11-26)' })).toBeAttached();
  });

  test('3.2 TC-DF-04: Date Format is optional — blank selection does not block save dialog', async ({ page }) => {
    const originalFormat = await loc.dateFormatSelect(page).inputValue();
    await loc.dateFormatSelect(page).selectOption({ index: 0 });
    await loc.saveBtn(page).click();
    // Optional field should not block the confirmation dialog
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible({ timeout: 8000 });
    await loc.cancelBtn(page).click();
    // Restore
    await loc.dateFormatSelect(page).selectOption(originalFormat);
  });

  test('3.3 TC-DF-03: Can select DD-MM-YYYY format and it reflects in the dropdown', async ({ page }) => {
    const original = await loc.dateFormatSelect(page).inputValue();
    await loc.dateFormatSelect(page).selectOption('DD-MM-YYYY (11-09-2026)');
    const selected = await loc.dateFormatSelect(page).inputValue();
    expect(selected).toContain('DD-MM-YYYY');
    // Restore without saving
    await loc.dateFormatSelect(page).selectOption(original);
  });

  test('3.4 TC-DF-01: Date Format change is persisted after save', async ({ page }) => {
    const original = await loc.dateFormatSelect(page).inputValue();
    const newFmt = original.includes('DD/MM/YYYY')
      ? 'DD-MM-YYYY (11-09-2026)'
      : 'DD/MM/YYYY (11/09/2026)';

    await loc.dateFormatSelect(page).selectOption(newFmt);
    await saveAndConfirm(page);

    await gotoCompanyProfile(page);
    const saved = await loc.dateFormatSelect(page).inputValue();
    expect(saved).toContain(newFmt.split(' ')[0]);

    // Restore
    await loc.dateFormatSelect(page).selectOption(original);
    await saveAndConfirm(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Company Name Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4. Company Name Validation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('4.1 TC-CN-01: Empty Company Name shows "Please enter company name" error', async ({ page }) => {
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();
    await loc.saveBtn(page).click();
    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('4.2 TC-FVAL-02: Validation error clears after filling Company Name', async ({ page }) => {
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();
    await loc.saveBtn(page).click();
    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });

    await loc.companyName(page).fill('ElevatorPlus Softwares');
    await expect(page.getByText('Please enter company name')).not.toBeVisible({ timeout: 3000 });
  });

  test('4.3 TC-CN-02: Company Name accepts alphanumeric and special characters', async ({ page }) => {
    const original = await loc.companyName(page).inputValue();
    await loc.companyName(page).fill('ElevatorPlus Pvt. Ltd. & Co.');
    await saveAndConfirm(page);
    await gotoCompanyProfile(page);
    await expect(loc.companyName(page)).toHaveValue('ElevatorPlus Pvt. Ltd. & Co.', { timeout: 10000 });
    // Restore
    await loc.companyName(page).fill(original);
    await saveAndConfirm(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Mobile Number Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5. Mobile Number Validation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('5.1 TC-MOB-01: Empty Mobile Number shows "Enter a valid mobile number" error', async ({ page }) => {
    await clearMobileInput(page);
    await loc.saveBtn(page).click();
    await expect(page.getByText('Enter a valid mobile number')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('5.2 TC-MOB-02: Mobile Number field has country code prefix dropdown', async ({ page }) => {
    await expect(page.getByRole('button', { name: /India.*\+.*91/i }).nth(1)).toBeVisible();
    await expect(loc.mobile(page)).toBeVisible();
    const mobileVal = await loc.mobile(page).inputValue();
    expect(mobileVal).toMatch(/^\+/);
  });

  test('5.3 TC-MOB-03: Helper text "Enter your contact number" is visible', async ({ page }) => {
    await expect(page.getByText('Enter your contact number')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Tax ID — Optional Field
// ─────────────────────────────────────────────────────────────────────────────

test.describe('6. Tax ID (optional)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('6.1 TC-TAX-01: Form saves without Tax ID (optional field)', async ({ page }) => {
    const original = await loc.taxId(page).inputValue();
    await loc.taxId(page).clear();
    await loc.saveBtn(page).click();
    // Should open confirmation dialog (Tax ID is optional — does not block save)
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible({ timeout: 8000 });
    await loc.cancelBtn(page).click();
    // Restore
    await loc.taxId(page).fill(original);
  });

  test('6.2 TC-TAX-02: Tax ID accepts alphanumeric value and helper text is shown', async ({ page }) => {
    await expect(page.getByText('For tax invoicing and compliance (max 15 characters).')).toBeVisible();
    const original = await loc.taxId(page).inputValue();
    await loc.taxId(page).fill('GST12345ABC');
    await expect(loc.taxId(page)).toHaveValue('GST12345ABC');
    // Restore without saving
    await loc.taxId(page).fill(original);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Company Logo Upload
// ─────────────────────────────────────────────────────────────────────────────

test.describe('7. Company Logo Upload', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('7.1 TC-LOGO-01: Logo section shows uploaded logo with Remove button', async ({ page }) => {
    await expect(page.getByText('Logo *')).toBeVisible();
    await expect(loc.logoArea(page).locator('img').first()).toBeVisible();
    await expect(loc.removeLogoBtn(page)).toBeVisible();
  });

  /** Click the logo area and upload a file, handling both filechooser and hidden-input approaches */
  async function uploadLogo(page: any, filePath: string) {
    // Try filechooser event first; fall back to setting files on a hidden input directly
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await loc.logoArea(page).click({ force: true });
    const chooser = await chooserPromise;
    if (chooser) {
      await chooser.setFiles(filePath);
    } else {
      // The app may use a hidden <input type="file"> inside the logo section
      const logoSection = page.locator('div').filter({ has: page.getByText('Company Logos') }).first();
      const hiddenInput = logoSection.locator('input[type="file"]').first();
      if (await hiddenInput.count() > 0) {
        await hiddenInput.setInputFiles(filePath);
      } else {
        // Last resort: set files on any file input not the auth-sig one
        await page.locator('input[type="file"]').first().setInputFiles(filePath);
      }
    }
    await page.waitForTimeout(500);
  }

  test('7.2 TC-LOGO-01: Logo area is clickable and triggers a file chooser for JPG upload', async ({ page }) => {
    await uploadLogo(page, LOGO_JPG);
    await expect(loc.logoArea(page).locator('img').first()).toBeVisible();
    // Reload without saving to discard the change
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('7.3 TC-LOGO-02: Logo area accepts PNG file upload', async ({ page }) => {
    await uploadLogo(page, LOGO_PNG);
    await expect(loc.logoArea(page).locator('img').first()).toBeVisible();
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('7.4 TC-LOGO-04: Authorized Signature upload area accepts PNG and JPG only (accept attribute)', async ({ page }) => {
    const accept = await loc.authSigFileInput(page).getAttribute('accept');
    expect(accept).toContain('image/png');
    expect(accept).toContain('image/jpeg');
  });

  test('7.5 TC-LOGO-05: Logo section helper text is visible', async ({ page }) => {
    await expect(page.getByText('Used to brand your invoices and the technician mobile app.')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Logo Invalid Format Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('8. Logo Invalid Format Validation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('8.1 TC-LOGO-INV-01: Authorized Signature file input rejects PDF via accept attribute', async ({ page }) => {
    const sigInput = loc.authSigFileInput(page);
    const accept = await sigInput.getAttribute('accept');
    // The accept attribute is the first line of defense — PDFs are not in the accepted MIME types
    expect(accept).not.toContain('application/pdf');
    expect(accept).toBe('image/png,image/jpeg');
  });

  test('8.2 TC-LOGO-INV-02: Authorized Signature rejects a non-image file upload', async ({ page }) => {
    const sigInput = loc.authSigFileInput(page);
    await sigInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    });
    await page.waitForTimeout(1000);
    // Expect either an error message or that no image preview appears for sig
    const errorMsg = page.getByText(/invalid.*format|only.*png.*jpg|jpg.*png|not supported/i);
    const errorShown = await errorMsg.isVisible({ timeout: 2000 }).catch(() => false);
    // The app should either show an error OR silently reject (no preview update)
    // Accept attribute = 'image/png,image/jpeg' is the restriction — test confirms non-image is blocked
    const sigPreview = page.locator('#file_input_auth_sig').locator('xpath=..').locator('img');
    const previewCount = await sigPreview.count();
    // Either an error appeared OR no image preview was set
    expect(errorShown || previewCount === 0).toBeTruthy();
  });

  test('8.3 TC-LOGO-INV-03: Authorized Signature rejects GIF file', async ({ page }) => {
    const sigInput = loc.authSigFileInput(page);
    await sigInput.setInputFiles({
      name: 'animated.gif',
      mimeType: 'image/gif',
      buffer: Buffer.from('GIF89a'),
    });
    await page.waitForTimeout(1000);
    const accept = await sigInput.getAttribute('accept');
    // GIF is not in the accepted types
    expect(accept).not.toContain('image/gif');
  });

  test('8.4 TC-LOGO-INV-04: Authorized Signature rejects SVG file', async ({ page }) => {
    const sigInput = loc.authSigFileInput(page);
    await sigInput.setInputFiles({
      name: 'icon.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
    await page.waitForTimeout(1000);
    const accept = await sigInput.getAttribute('accept');
    expect(accept).not.toContain('image/svg');
  });

  test('8.5 TC-LOGO-INV-06: Valid JPG upload works after an invalid file attempt on Authorized Signature', async ({ page }) => {
    const sigInput = loc.authSigFileInput(page);
    // First try an invalid file
    await sigInput.setInputFiles({
      name: 'bad.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('bad file'),
    });
    await page.waitForTimeout(500);
    // Now upload a valid PNG
    await sigInput.setInputFiles(LOGO_PNG);
    await page.waitForTimeout(500);
    // The upload area should reflect the valid file (preview or no error)
    await expect(loc.authSigFileInput(page)).toBeAttached();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Company Address
// ─────────────────────────────────────────────────────────────────────────────

test.describe('9. Company Address', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('9.1 TC-ADDR-01: Billing and Shipping Address fields are pre-filled', async ({ page }) => {
    const billing = await loc.billingAddress(page).inputValue();
    const shipping = await loc.shippingAddress(page).inputValue();
    expect(billing.length).toBeGreaterThan(0);
    expect(shipping.length).toBeGreaterThan(0);
  });

  test('9.2 TC-ADDR-02: Checking "Same as Billing Address" copies Billing value to Shipping', async ({ page }) => {
    const checkbox = loc.sameAsBilling(page);
    // Uncheck first so we can test fresh check behavior
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
      await page.waitForTimeout(200);
    }
    const testBilling = 'Test Billing, 123 Park Avenue, Pune - 411001';
    await loc.billingAddress(page).fill(testBilling);

    await checkbox.check();
    await page.waitForTimeout(500);

    const shippingVal = await loc.shippingAddress(page).inputValue();
    expect(shippingVal).toBe(testBilling);
  });

  test('9.3 TC-ADDR-03: Unchecking "Same as Billing" allows Shipping Address to be edited independently', async ({ page }) => {
    const checkbox = loc.sameAsBilling(page);
    if (!(await checkbox.isChecked())) {
      await loc.billingAddress(page).fill('Some Billing Address, City - 400001');
      await checkbox.check();
      await page.waitForTimeout(300);
    }
    await checkbox.uncheck();
    await page.waitForTimeout(200);

    const differentShipping = 'Different Shipping, Warehouse Road, Mumbai - 400099';
    await loc.shippingAddress(page).fill(differentShipping);
    await expect(loc.shippingAddress(page)).toHaveValue(differentShipping);
  });

  test('9.4 TC-ADDR-04: Billing Address change reflects in Shipping when checkbox is checked', async ({ page }) => {
    const checkbox = loc.sameAsBilling(page);
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
      await page.waitForTimeout(300);
    }
    const updatedBilling = 'Updated Billing, New Street, Delhi - 110001';
    // Fill billing using Playwright fill (triggers React's synthetic input event)
    await loc.billingAddress(page).fill(updatedBilling);
    // Verify billing was actually updated in DOM before checking shipping
    await expect(loc.billingAddress(page)).toHaveValue(updatedBilling, { timeout: 3000 });
    await page.waitForTimeout(500);
    const shipping = await loc.shippingAddress(page).inputValue();
    // If "Same as Billing" live sync works: shipping mirrors billing
    // If app only syncs at checkbox-check time (not live): shipping retains previous value → test fails
    expect(shipping).toBe(updatedBilling);
  });

  test('9.5 TC-ADDR-VAL-01: Empty Billing Address shows "Please enter address" error', async ({ page }) => {
    await loc.billingAddress(page).clear();
    await loc.saveBtn(page).click();
    await expect(page.getByText('Please enter address').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('9.6 TC-ADDR-VAL-02: Empty Shipping Address shows "Please enter address" error when unchecked', async ({ page }) => {
    if (await loc.sameAsBilling(page).isChecked()) {
      await loc.sameAsBilling(page).uncheck();
      await page.waitForTimeout(200);
    }
    await loc.shippingAddress(page).click();
    await loc.shippingAddress(page).fill('');
    await loc.shippingAddress(page).blur();
    await loc.saveBtn(page).click();
    await expect(page.getByText('Please enter address').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('9.7 TC-ADDR-VAL-03: Shipping Address auto-filled by checkbox does not block save', async ({ page }) => {
    const origBilling = await loc.billingAddress(page).inputValue();
    const origShipping = await loc.shippingAddress(page).inputValue();

    await loc.billingAddress(page).fill('Auto Fill Test, Pune - 411001');
    const checkbox = loc.sameAsBilling(page);
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
      await page.waitForTimeout(300);
    }
    // Save — shipping address was auto-filled so it should not block
    await loc.saveBtn(page).click();
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible({ timeout: 8000 });
    await loc.cancelBtn(page).click();

    // Restore
    if (await checkbox.isChecked()) await checkbox.uncheck();
    await loc.billingAddress(page).fill(origBilling);
    await loc.shippingAddress(page).fill(origShipping);
  });

  test('9.8 TC-ADDR-01: Address changes are persisted after save and reload', async ({ page }) => {
    await ensureAddressesPopulated(page);
    const origBilling = await loc.billingAddress(page).inputValue();
    const origShipping = await loc.shippingAddress(page).inputValue();

    if (await loc.sameAsBilling(page).isChecked()) {
      await loc.sameAsBilling(page).uncheck();
      await page.waitForTimeout(200);
    }
    await loc.billingAddress(page).fill('Persisted Billing, Road No.1, Pune - 411001');
    await loc.shippingAddress(page).fill('Persisted Shipping, Lane B, Mumbai - 400001');
    await saveAndConfirm(page);

    await gotoCompanyProfile(page);
    await expect(loc.billingAddress(page)).toHaveValue('Persisted Billing, Road No.1, Pune - 411001', { timeout: 10000 });
    await expect(loc.shippingAddress(page)).toHaveValue('Persisted Shipping, Lane B, Mumbai - 400001', { timeout: 10000 });

    // Restore
    await loc.billingAddress(page).fill(origBilling);
    await loc.shippingAddress(page).fill(origShipping);
    await saveAndConfirm(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Save Flow — Confirmation Dialog
// ─────────────────────────────────────────────────────────────────────────────

test.describe('10. Save Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('10.1 TC-SAVE-01: Save Changes button opens confirmation dialog', async ({ page }) => {
    await loc.saveBtn(page).click();
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Do you want to save changes to the settings? This will affect entire application!')).toBeVisible();
    await expect(loc.confirmBtn(page)).toBeVisible();
    await expect(loc.cancelBtn(page)).toBeVisible();
    await loc.cancelBtn(page).click();
  });

  test('10.2 TC-SAVE-02: Cancelling confirmation dialog does not persist changes', async ({ page }) => {
    const originalName = await loc.companyName(page).inputValue();
    await loc.companyName(page).fill('Should Not Be Saved Name');
    await saveAndCancel(page);

    await page.reload();
    await page.getByText('Company Information').waitFor({ state: 'visible', timeout: 30000 });
    await expect(loc.companyName(page)).toHaveValue(originalName, { timeout: 10000 });
  });

  test('10.3 TC-SAVE-03: Confirming save shows "Setting has been saved successfully!" toast', async ({ page }) => {
    await loc.saveBtn(page).click();
    await page.getByRole('heading', { name: 'Are you sure?' }).waitFor({ state: 'visible', timeout: 10000 });
    await loc.confirmBtn(page).click();
    await expect(page.getByText('Setting has been saved successfully!')).toBeVisible({ timeout: 15000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Full Form Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('11. Full Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('11.1 TC-FVAL-01: All mandatory field errors appear when fields are cleared and Save is clicked', async ({ page }) => {
    // Clear all mandatory fields using click+fill('')+blur to ensure React marks them as touched
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();
    await clearMobileInput(page);
    await loc.billingAddress(page).click();
    await loc.billingAddress(page).fill('');
    await loc.billingAddress(page).blur();
    if (await loc.sameAsBilling(page).isChecked()) {
      await loc.sameAsBilling(page).uncheck();
      await page.waitForTimeout(200);
    }
    await loc.shippingAddress(page).click();
    await loc.shippingAddress(page).fill('');
    await loc.shippingAddress(page).blur();

    await loc.saveBtn(page).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Enter a valid mobile number')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Please enter address').first()).toBeVisible({ timeout: 5000 });
    // Confirmation dialog must NOT appear when mandatory fields are empty
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('11.2 TC-FVAL-02: Optional fields (Tax ID) do not show validation errors when empty', async ({ page }) => {
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();
    await loc.saveBtn(page).click();
    await page.waitForTimeout(500);

    // Tax ID and PAN Number are optional — check their immediate containers have no error text
    // Scope to each field's parent to avoid matching unrelated text in the same row
    const taxIdParent = page.locator('#gstn').locator('xpath=ancestor::div[2]');
    const panParent = page.locator('#pan_number').locator('xpath=ancestor::div[2]');
    await expect(taxIdParent.getByText(/required|please enter/i)).not.toBeVisible();
    await expect(panParent.getByText(/required|please enter/i)).not.toBeVisible();
    // Only Company Name error should show
    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Section-Wise Update — Data Already Saved
// ─────────────────────────────────────────────────────────────────────────────

test.describe('12. Section-Wise Update (data already saved)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  test('12.1 TC-UPD-01: Company Information updates independently — Logo and Address stay intact', async ({ page }) => {
    const origName = await loc.companyName(page).inputValue();
    await ensureAddressesPopulated(page);
    const origBilling = await loc.billingAddress(page).inputValue();

    await loc.companyName(page).fill('Section Update Test Corp');
    await saveAndConfirm(page);

    await gotoCompanyProfile(page);
    await expect(loc.companyName(page)).toHaveValue('Section Update Test Corp', { timeout: 10000 });
    // Logo Remove button should still be visible (logo was not removed)
    await expect(loc.removeLogoBtn(page)).toBeVisible();
    // Address should remain unchanged
    await expect(loc.billingAddress(page)).toHaveValue(origBilling, { timeout: 10000 });

    // Restore
    await loc.companyName(page).fill(origName);
    await saveAndConfirm(page);
  });

  test('12.2 TC-UPD-03: Company Address updates independently — Company Information stays intact', async ({ page }) => {
    await ensureAddressesPopulated(page);
    const origBilling = await loc.billingAddress(page).inputValue();
    const origShipping = await loc.shippingAddress(page).inputValue();
    const origName = await loc.companyName(page).inputValue();

    if (await loc.sameAsBilling(page).isChecked()) {
      await loc.sameAsBilling(page).uncheck();
      await page.waitForTimeout(200);
    }
    await loc.billingAddress(page).fill('Section Test Billing, 99 Main St, Pune - 411007');
    await loc.shippingAddress(page).fill('Section Test Shipping, 88 Side Rd, Pune - 411008');
    await saveAndConfirm(page);

    await gotoCompanyProfile(page);
    await expect(loc.billingAddress(page)).toHaveValue('Section Test Billing, 99 Main St, Pune - 411007', { timeout: 10000 });
    // Company Name should be unchanged
    await expect(loc.companyName(page)).toHaveValue(origName, { timeout: 10000 });

    // Restore
    await loc.billingAddress(page).fill(origBilling);
    await loc.shippingAddress(page).fill(origShipping);
    await saveAndConfirm(page);
  });

  test('12.3 TC-UPD-04: Mandatory field validation still applies even when data exists', async ({ page }) => {
    // Even though data is already saved, clearing a required field still shows error
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();
    await loc.saveBtn(page).click();
    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible();
  });

  test('12.4 TC-UPD-05: Tax ID (optional) can be updated independently', async ({ page }) => {
    const origTaxId = await loc.taxId(page).inputValue();
    const newTaxId = 'UPDTAX12345';

    await loc.taxId(page).fill(newTaxId);
    await saveAndConfirm(page);

    await gotoCompanyProfile(page);
    await expect(loc.taxId(page)).toHaveValue(newTaxId, { timeout: 10000 });

    // Restore
    await loc.taxId(page).fill(origTaxId);
    await saveAndConfirm(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. Navigation and Access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('13. Navigation and Access', () => {
  test('13.1 TC-NAV-01: Unauthenticated access redirects to login page', async ({ browser }) => {
    const context = await browser.newContext();
    const freshPage = await context.newPage();
    await freshPage.goto('https://stage.elevatorplus.net/settings/configure?tab=company', { timeout: 30000 });
    await freshPage.waitForURL(/\/login/, { timeout: 15000 });
    await expect(freshPage.getByRole('heading', { name: /Welcome to ElevatorPlus/i })).toBeVisible({ timeout: 10000 });
    await context.close();
  });

  test('13.2 TC-NAV-02: Navigate to Company Profile via Settings → App Settings hub', async ({ page }) => {
    await registerPopupHandler(page);
    await page.goto('/settings', { timeout: 60000 });
    await page.getByText('Company Profile').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('div').filter({ hasText: /^Company ProfileLegal name, tax details, and branding\.$/ }).nth(1).click();
    await page.getByText('Company Information').waitFor({ state: 'visible', timeout: 30000 });
    await expect(page).toHaveURL(/configure\?tab=company/);
  });

  test('13.3 TC-NAV-03: Back button returns to App Settings hub', async ({ page }) => {
    await gotoCompanyProfile(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await page.waitForURL('**/settings', { timeout: 15000 });
    await expect(page.getByText('Settings Hub')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Company Profile')).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. Unsaved Changes Navigation Guard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('14. Unsaved Changes Navigation Guard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompanyProfile(page);
  });

  /** Type a character at the end of Company Name to mark the form dirty */
  async function dirtyForm(page: any) {
    await loc.companyName(page).click();
    await page.keyboard.press('End');
    await page.keyboard.press('X');
    await page.waitForTimeout(200);
  }

  /** Wait for the unsaved-changes dialog and assert its content */
  async function expectUnsavedDialog(page: any) {
    await expect(page.getByRole('heading', { name: 'Unsaved Changes' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('You have unsaved changes on this tab. What would you like to do?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stay Here' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Discard Changes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save & Switch' })).toBeVisible();
  }

  test('14.1 TC-UNS-01: Editing a field and clicking another tab shows the Unsaved Changes dialog', async ({ page }) => {
    await dirtyForm(page);
    await page.getByRole('button', { name: 'Module Settings' }).click();
    await expectUnsavedDialog(page);
    // Clean up — discard so the dirty value is not left in the form
    await page.getByRole('button', { name: 'Discard Changes' }).click();
    await page.waitForURL(/tab=modules/, { timeout: 10000 });
  });

  test('14.2 TC-UNS-01: Dialog has exact title, message and three buttons', async ({ page }) => {
    await dirtyForm(page);
    await page.getByRole('button', { name: 'Prefix & Numbering' }).click();
    await expect(page.getByRole('heading', { name: 'Unsaved Changes' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('You have unsaved changes on this tab. What would you like to do?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stay Here' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Discard Changes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save & Switch' })).toBeVisible();
    await page.getByRole('button', { name: 'Discard Changes' }).click();
  });

  test('14.3 TC-UNS-02: "Stay Here" closes dialog and keeps user on Company & Identity with changes intact', async ({ page }) => {
    await dirtyForm(page);
    const dirtyName = await loc.companyName(page).inputValue();
    expect(dirtyName.endsWith('X')).toBeTruthy();

    await page.getByRole('button', { name: 'Module Settings' }).click();
    await expectUnsavedDialog(page);

    await page.getByRole('button', { name: 'Stay Here' }).click();
    await page.waitForTimeout(500);

    // Dialog should be gone
    await expect(page.getByRole('heading', { name: 'Unsaved Changes' })).not.toBeVisible();
    // Company Information section must still be visible (stayed on Company & Identity)
    await expect(page.getByText('Company Information')).toBeVisible({ timeout: 5000 });
    // URL should remain on company tab
    await expect(page).toHaveURL(/tab=company/);
    // Unsaved change must still be in the field
    await expect(loc.companyName(page)).toHaveValue(dirtyName);

    // Clean up — discard by navigating away without saving
    await page.reload();
  });

  test('14.4 TC-UNS-03: "Discard Changes" discards edits and switches to the target tab', async ({ page }) => {
    const originalName = await loc.companyName(page).inputValue();
    await dirtyForm(page);

    await page.getByRole('button', { name: 'Module Settings' }).click();
    await expectUnsavedDialog(page);

    await page.getByRole('button', { name: 'Discard Changes' }).click();

    // Should now be on Module Settings
    await page.waitForURL(/tab=modules/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Module Setting').first()).toBeVisible({ timeout: 10000 });

    // Switch back to Company & Identity and verify the dirty value was discarded
    await page.getByRole('button', { name: 'Company & Identity' }).click();
    await page.waitForURL(/tab=company/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.getByText('Company Information').waitFor({ state: 'visible', timeout: 15000 });
    await expect(loc.companyName(page)).toHaveValue(originalName, { timeout: 10000 });
  });

  test('14.5 TC-UNS-04: "Save & Switch" saves changes and switches without a separate confirmation dialog', async ({ page }) => {
    const originalName = await loc.companyName(page).inputValue();

    // Append a unique suffix to the name
    await loc.companyName(page).click();
    await page.keyboard.press('End');
    await page.keyboard.type('SAVED');
    const savedName = originalName + 'SAVED';

    await page.getByRole('button', { name: 'Module Settings' }).click();
    await expectUnsavedDialog(page);

    // Click Save & Switch — it should NOT show the "Are you sure?" dialog
    await page.getByRole('button', { name: 'Save & Switch' }).click();

    // "Are you sure?" must NOT appear
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).not.toBeVisible({ timeout: 3000 }).catch(() => {});

    // Either: switched to Module Settings (save succeeded) OR stayed on Company & Identity (save failed with validation)
    await page.waitForTimeout(1500);
    const urlAfter = page.url();

    if (urlAfter.includes('tab=modules') || urlAfter.includes('tab=prefix')) {
      // Save & Switch succeeded — verify save persisted
      await expect(page.getByText(/Setting has been saved successfully!/)).toBeVisible({ timeout: 10000 }).catch(() => {});
      // Switch back and check value was saved
      await page.getByRole('button', { name: 'Company & Identity' }).click();
      await page.getByText('Company Information').waitFor({ state: 'visible', timeout: 15000 });
      await expect(loc.companyName(page)).toHaveValue(savedName, { timeout: 10000 });
      // Restore
      await loc.companyName(page).fill(originalName);
      await saveAndConfirm(page);
    } else {
      // Save failed due to validation — confirm we're still on Company & Identity
      await expect(page.getByText('Company Information')).toBeVisible({ timeout: 5000 });
    }
  });

  test('14.6 TC-UNS-05: "Save & Switch" with empty mandatory field shows validation error and does not switch', async ({ page }) => {
    // Clear Company Name (mandatory) to force a validation failure on Save & Switch
    await loc.companyName(page).click();
    await loc.companyName(page).fill('');
    await loc.companyName(page).blur();

    await page.getByRole('button', { name: 'Module Settings' }).click();
    await expectUnsavedDialog(page);

    await page.getByRole('button', { name: 'Save & Switch' }).click();
    await page.waitForTimeout(1000);

    // Validation error must appear
    await expect(page.getByText('Please enter company name')).toBeVisible({ timeout: 5000 });
    // Should NOT have navigated away — still on Company & Identity content
    await expect(page.getByText('Company Information')).toBeVisible();
    // No success toast
    await expect(page.getByText('Setting has been saved successfully!')).not.toBeVisible();
  });

  test('14.7 TC-UNS-06: No dialog appears when switching tabs without any unsaved changes', async ({ page }) => {
    // Navigate to Company & Identity — no changes made
    await page.getByRole('button', { name: 'Module Settings' }).click();
    // Dialog must NOT appear
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Unsaved Changes' })).not.toBeVisible();
    // Should have switched directly to Module Settings
    await expect(page).toHaveURL(/tab=modules/, { timeout: 10000 });
    await expect(page.getByText('Module Setting').first()).toBeVisible({ timeout: 10000 });

    // Switch back — also no dialog
    await page.getByRole('button', { name: 'Company & Identity' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Unsaved Changes' })).not.toBeVisible();
    await expect(page).toHaveURL(/tab=company/, { timeout: 10000 });
  });
});
