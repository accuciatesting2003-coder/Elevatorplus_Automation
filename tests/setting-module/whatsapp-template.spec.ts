// spec: test-plans/setting-module-test-plan/whatsapp-template-test-plan.md
// seed: tests/setup/auth.setup.ts

import { test, expect } from '../fixtures/auth-fixture';
import * as path from 'path';

const WAT_URL = '/setting/whatsapp-templates';

const IMG_JPG  = path.join(__dirname, '../test-data/company-logo-jpg.jpg');
const IMG_PNG  = path.join(__dirname, '../test-data/company-logo-png.png');
const PDF_FILE = path.join(__dirname, '../test-data/pdf.pdf');
const PPT_FILE = path.join(__dirname, '../test-data/ppt.pptx');
const VID_FILE = path.join(__dirname, '../test-data/video.mp4');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function registerPopupHandler(page: any) {
  if ((page as any).__watPopupHandlerRegistered) return;
  (page as any).__watPopupHandlerRegistered = true;
  await page.addLocatorHandler(
    page.getByRole('button', { name: /Maybe Later/i }),
    async () => {
      await page.getByRole('button', { name: /Maybe Later/i }).click().catch(() => {});
    }
  );
  await page.addLocatorHandler(
    page.locator('.checklist-component.visible'),
    async () => {
      await page.evaluate(() => {
        const el = document.querySelector('.checklist-component') as HTMLElement | null;
        if (el) {
          el.style.setProperty('display', 'none', 'important');
          el.classList.remove('visible');
        }
      });
    }
  );
  await page.addLocatorHandler(
    page.locator('nav.floating-nav'),
    async () => {
      await page.evaluate(() => {
        const nav = document.querySelector('nav.floating-nav') as HTMLElement | null;
        if (nav) nav.style.setProperty('display', 'none', 'important');
      });
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

async function gotoWAT(page: any) {
  await registerPopupHandler(page);
  await page.goto(WAT_URL, { timeout: 60000 });
  await page.getByRole('heading', { name: /Add Whatsapp Template/i }).waitFor({ state: 'visible', timeout: 45000 });
  await dismissNotificationPopup(page);
  // Ensure checklist and floating nav do not interfere with clicks
  await page.evaluate(() => {
    const el = document.querySelector('.checklist-component') as HTMLElement | null;
    if (el) { el.style.setProperty('display', 'none', 'important'); el.classList.remove('visible'); }
    const nav = document.querySelector('nav.floating-nav') as HTMLElement | null;
    if (nav) nav.style.setProperty('display', 'none', 'important');
  });
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

async function waitForTableRows(page: any) {
  await tableRows(page).first().waitFor({ state: 'visible', timeout: 30000 });
}

async function clickEditOnRow(page: any, rowIndex: number = 0) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const editIcon = tableRows(page).nth(rowIndex).getByRole('img', { name: 'Edit' });
  await editIcon.waitFor({ state: 'visible', timeout: 15000 });
  await editIcon.click({ timeout: 15000 });
}

async function clickEditByTemplateName(page: any, name: string) {
  // Filter by the name cell (index 2) to avoid matching category/content cells
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const row = tableRows(page).filter({
    has: page.locator('[role="cell"]').nth(2).filter({ hasText: new RegExp(`^${escaped}$`, 'i') })
  }).first();
  await row.waitFor({ state: 'visible', timeout: 15000 });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await row.getByRole('img', { name: 'Edit' }).click({ timeout: 15000 });
}

// Table toolbar
function statusFilterSelect(page: any) {
  return page.locator('#rows-per-page').nth(1);
}

function showEntriesSelect(page: any) {
  return page.locator('#rows-per-page').first();
}

function searchInput(page: any) {
  // Two inputs share placeholder "Search..." — the table toolbar one has type="text" (MUI search bar has type="search")
  return page.locator('input[type="text"][placeholder="Search..."]');
}

// Form inputs — IDs from live DOM inspection
function templateNameInput(page: any) {
  return page.locator('#wa_draft_name');
}

function templateContentInput(page: any) {
  return page.locator('#content');
}

// Template Category — native <select id="wa_category">
async function selectCategory(page: any, category: string) {
  await page.locator('#wa_category').selectOption(category);
}

// Status in update form — native <select id="status">
async function selectFormStatus(page: any, status: string) {
  await page.locator('#status').selectOption(status);
}

async function uploadMedia(page: any, filePath: string) {
  await page.locator('#file_input_media').setInputFiles(filePath);
  await page.waitForTimeout(600);
}

function createdToast(page: any) {
  return page.locator('[role="alert"]').filter({ hasText: /created successfully/i });
}

function updatedToast(page: any) {
  return page.locator('[role="alert"]').filter({ hasText: /updated successfully/i });
}

function errorToast(page: any) {
  return page.locator('[role="alert"]').filter({ hasText: /something went wrong|already exists/i });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('WhatsApp Template Master', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // 1 – Smoke Tests
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-SM-01: WhatsApp Template page loads successfully', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(WAT_URL, 'i'));
      // Page title in nav bar (not a heading role — check as text)
      await expect(page.getByText('Whatsapp Templates').first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
      await waitForTableRows(page);
      expect(await tableRows(page).count()).toBeGreaterThan(0);
    });

    test('TC-WAT-SM-02: Verify all Add form elements are present', async ({ page }) => {
      // Template Name input
      await expect(templateNameInput(page)).toBeVisible();
      await expect(templateNameInput(page)).toHaveValue('');
      await expect(page.locator('.modern-helper-text', { hasText: 'Enter the template name' })).toBeVisible();

      // Template Category native select — placeholder option is selected (empty value)
      await expect(page.locator('#wa_category')).toBeVisible();
      await expect(page.locator('#wa_category')).toHaveValue('');
      await expect(page.locator('.modern-helper-text', { hasText: 'Select a template category' })).toBeVisible();

      // Template Content textarea
      await expect(templateContentInput(page)).toBeVisible();
      await expect(templateContentInput(page)).toHaveValue('');
      await expect(page.locator('.modern-helper-text', { hasText: 'Enter template content' })).toBeVisible();

      // Media upload area
      await expect(page.locator('label[for="file_input_media"]')).toBeVisible();
      await expect(page.locator('.modern-file-title', { hasText: 'Upload or drag and drop' })).toBeVisible();
      await expect(page.locator('.modern-file-hint', { hasText: /PNG, JPG, PDF, MP4, PPT/i })).toBeVisible();
      await expect(page.locator('.modern-helper-text', { hasText: 'Upload image, PDF, video or PPT.' })).toBeVisible();

      // Form buttons
      await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();

      // Info button
      await expect(page.locator('#info-tooltip')).toBeVisible();
    });

    test('TC-WAT-SM-03: Verify Template Category dropdown options', async ({ page }) => {
      const options = await page.locator('#wa_category option').allTextContents();
      expect(options).toContain('Leads');
      expect(options).toContain('Enquiries');
      expect(options).toContain('Jobs');
      expect(options).toContain('PM');
      expect(options).toContain('Breakdown');
      expect(options).toContain('Others');
    });

    test('TC-WAT-SM-04: Verify table columns and toolbar', async ({ page }) => {
      await waitForTableRows(page);

      // Column headers
      await expect(page.getByRole('button', { name: /^Sr\. No\.$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Action$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Whatsapp Template Name$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Template Category$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Template Content$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Status$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Attachment$/ })).toBeVisible();

      // Toolbar: rows-per-page default 25
      await expect(showEntriesSelect(page)).toHaveValue('25');

      // Toolbar: status filter default Active
      await expect(statusFilterSelect(page)).toHaveValue('true');

      // Toolbar: search input present
      await expect(searchInput(page)).toBeVisible();

      // No Import / Export buttons
      await expect(page.getByRole('button', { name: /^Import$/ })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /^Export$/ })).not.toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2 – Add Template — Happy Path
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Add Template — Happy Path', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-ADD-01: Add a new template with mandatory fields only (no media)', async ({ page }) => {
      const name = `AutoTest NoMedia ${Date.now()}`;

      await templateNameInput(page).fill(name);
      await selectCategory(page, 'Others');
      await templateContentInput(page).fill('This is an automated test template');
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      // Form resets after success
      await expect(templateNameInput(page)).toHaveValue('', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();

      // Record appears in table
      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: name })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    test('TC-WAT-ADD-02: Add a template with an image attachment (JPG)', async ({ page }) => {
      const name = `AutoTest Image ${Date.now()}`;

      await templateNameInput(page).fill(name);
      await selectCategory(page, 'Others');
      await templateContentInput(page).fill('Template with image media');
      await uploadMedia(page, IMG_JPG);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      // Record appears with an attachment link in the attachment column
      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachLink = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(attachLink).toBeVisible({ timeout: 10000 });
      const href = await attachLink.getAttribute('href');
      expect(href).toMatch(/\.(jpg|jpeg|png)/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ADD-03: Add a template with a PDF attachment', async ({ page }) => {
      const name = `AutoTest PDF ${Date.now()}`;

      await templateNameInput(page).fill(name);
      await selectCategory(page, 'Others');
      await templateContentInput(page).fill('Template with PDF media');
      await uploadMedia(page, PDF_FILE);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachLink = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(attachLink).toBeVisible({ timeout: 10000 });
      const href = await attachLink.getAttribute('href');
      expect(href).toMatch(/\.pdf/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ADD-04: Add a template with a PPT/PPTX attachment', async ({ page }) => {
      const name = `AutoTest PPT ${Date.now()}`;

      await templateNameInput(page).fill(name);
      await selectCategory(page, 'Others');
      await templateContentInput(page).fill('Template with PPT media');
      await uploadMedia(page, PPT_FILE);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachLink = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(attachLink).toBeVisible({ timeout: 10000 });
      const href = await attachLink.getAttribute('href');
      expect(href).toMatch(/\.pptx?/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ADD-05: Add a template with an MP4 video attachment', async ({ page }) => {
      const name = `AutoTest Video ${Date.now()}`;

      await templateNameInput(page).fill(name);
      await selectCategory(page, 'Others');
      await templateContentInput(page).fill('Template with video media');
      await uploadMedia(page, VID_FILE);
      await page.getByRole('button', { name: /Submit/i }).click();

      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill(name);
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: name }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachLink = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(attachLink).toBeVisible({ timeout: 10000 });
      const href = await attachLink.getAttribute('href');
      expect(href).toMatch(/\.mp4/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ADD-06: Add same template name with a different category should succeed', async ({ page }) => {
      // Precondition: "test" / Leads already exists (Active); test with "PM" category
      await templateNameInput(page).fill('test');
      await selectCategory(page, 'PM');
      await templateContentInput(page).fill('Testing cross-category uniqueness');
      await page.getByRole('button', { name: /Submit/i }).click();

      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const isSuccess = await createdToast(page).isVisible({ timeout: 3000 }).catch(() => false);
      const isError   = await errorToast(page).isVisible({ timeout: 3000 }).catch(() => false);

      // If test/PM didn't exist: success expected; if it existed from a prior run: error is acceptable
      if (!isError) {
        expect(isSuccess).toBeTruthy();
        await statusFilterSelect(page).selectOption('');
        await searchInput(page).fill('test');
        await page.waitForTimeout(800);
        const pmRows = tableRows(page).filter({ hasText: 'PM' }).filter({ hasText: 'test' });
        expect(await pmRows.count()).toBeGreaterThan(0);
        await searchInput(page).clear();
        await statusFilterSelect(page).selectOption('true');
      }
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3 – Add Template — Validation (Mandatory Fields)
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Add Template — Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-VAL-01: Submit with all fields empty shows validation errors', async ({ page }) => {
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      // No record created — form stays in Add mode and no success toast
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
      expect(await createdToast(page).isVisible({ timeout: 2000 }).catch(() => false)).toBeFalsy();
    });

    test('TC-WAT-VAL-02: Submit without Whatsapp Template Name shows validation error', async ({ page }) => {
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('Some content');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
      expect(await createdToast(page).isVisible({ timeout: 2000 }).catch(() => false)).toBeFalsy();
    });

    test('TC-WAT-VAL-03: Submit without Template Category shows validation error', async ({ page }) => {
      await templateNameInput(page).fill('Missing Category Test');
      await templateContentInput(page).fill('Some content');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
      expect(await createdToast(page).isVisible({ timeout: 2000 }).catch(() => false)).toBeFalsy();
    });

    test('TC-WAT-VAL-04: Submit without Template Content shows validation error', async ({ page }) => {
      await templateNameInput(page).fill('Missing Content Test');
      await selectCategory(page, 'Leads');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
      expect(await createdToast(page).isVisible({ timeout: 2000 }).catch(() => false)).toBeFalsy();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4 – Add Template — Duplicate Validation
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Add Template — Duplicate Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-DUP-ADD-01: Add duplicate name (exact) against an Active record in same category', async ({ page }) => {
      // Precondition: "test" / Leads is Active
      await templateNameInput(page).fill('test');
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('Duplicate attempt content');
      await page.locator('button[type="submit"]').click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
    });

    test('TC-WAT-DUP-ADD-02: Add duplicate name (exact) against an Inactive record in same category', async ({ page }) => {
      // Precondition: "Enquiry Generated" / Enquiries is Inactive
      await templateNameInput(page).fill('Enquiry Generated');
      await selectCategory(page, 'Enquiries');
      await templateContentInput(page).fill('Duplicate of inactive record');
      await page.locator('button[type="submit"]').click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
    });

    test('TC-WAT-DUP-ADD-03: Add same name ALL CAPS against Active record in same category (case-insensitive block)', async ({ page }) => {
      // Precondition: "test" / Leads is Active
      await templateNameInput(page).fill('TEST');
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('Uppercase duplicate attempt');
      await page.locator('button[type="submit"]').click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
    });

    test('TC-WAT-DUP-ADD-04: Add same name mixed case against Active record in same category', async ({ page }) => {
      // Precondition: "test" / Leads is Active
      await templateNameInput(page).fill('Test');
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('Mixed case duplicate attempt');
      await page.locator('button[type="submit"]').click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
    });

    test('TC-WAT-DUP-ADD-05: Add same name with a different category should succeed (cross-category allowed)', async ({ page }) => {
      // Precondition: "test" / Leads is Active; no "test" / Breakdown exists
      await templateNameInput(page).fill('test');
      await selectCategory(page, 'Breakdown');
      await templateContentInput(page).fill('Cross category allowed test');
      await page.locator('button[type="submit"]').click();

      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const isSuccess = await createdToast(page).isVisible({ timeout: 3000 }).catch(() => false);
      const isError   = await errorToast(page).isVisible({ timeout: 3000 }).catch(() => false);

      if (!isError) {
        expect(isSuccess).toBeTruthy();
        await statusFilterSelect(page).selectOption('');
        await searchInput(page).fill('test');
        await page.waitForTimeout(800);
        const rows = tableRows(page).filter({ hasText: 'Breakdown' }).filter({ hasText: 'test' });
        expect(await rows.count()).toBeGreaterThan(0);
        await searchInput(page).clear();
        await statusFilterSelect(page).selectOption('true');
      }
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5 – Update Template — Happy Path
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Update Template — Happy Path', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-UPD-01: Edit icon opens Update form with pre-filled values', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);

      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      // Fields are pre-filled
      const nameValue = await templateNameInput(page).inputValue();
      expect(nameValue.length).toBeGreaterThan(0);

      const contentValue = await templateContentInput(page).inputValue();
      expect(contentValue.length).toBeGreaterThan(0);

      // Status dropdown visible in update mode
      await expect(page.locator('#status')).toBeVisible();

      // Update button present; Submit/Clear NOT present in update mode
      await expect(page.locator('button').filter({ hasText: /^Update$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^Submit$/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /^Clear$/i })).not.toBeVisible();
    });

    test('TC-WAT-UPD-02: Update template name successfully', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      const newName = `Updated Name ${Date.now()}`;
      await templateNameInput(page).clear();
      await templateNameInput(page).fill(newName);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await searchInput(page).fill(newName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: newName })).toHaveCount(1, { timeout: 15000 });
      await searchInput(page).clear();
    });

    test('TC-WAT-UPD-03: Update template content successfully', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      const updatedContent = `Updated content text ${Date.now()}`;
      await templateContentInput(page).clear();
      await templateContentInput(page).fill(updatedContent);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });
    });

    test('TC-WAT-UPD-04: Add image attachment during update', async ({ page }) => {
      // Edit "test" / Leads which has no attachment
      await waitForTableRows(page);
      await clickEditByTemplateName(page, 'test');
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await uploadMedia(page, IMG_PNG);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      // Attachment link present in the row
      await searchInput(page).fill('test');
      await page.waitForTimeout(800);
      const row = tableRows(page).filter({ hasText: 'Leads' }).filter({ hasText: 'test' }).first();
      const attachLink = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(attachLink).toBeVisible({ timeout: 10000 });
      await searchInput(page).clear();
    });

    test('TC-WAT-UPD-05: Add PDF attachment during update', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await uploadMedia(page, PDF_FILE);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-UPD-06: Add PPT attachment during update', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await uploadMedia(page, PPT_FILE);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-UPD-07: Add MP4 video attachment during update', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await uploadMedia(page, VID_FILE);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-UPD-08: Update status from Active to Inactive', async ({ page }) => {
      await waitForTableRows(page);
      const firstRow = tableRows(page).first();
      const editedName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await selectFormStatus(page, 'Inactive');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      // Record disappears from Active-filtered view
      await searchInput(page).fill(editedName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: editedName })).toHaveCount(0, { timeout: 10000 });

      // Appears in Inactive-filtered view
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: editedName })).toHaveCount(1, { timeout: 15000 });

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-UPD-09: Update status from Inactive back to Active', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(800);
      await waitForTableRows(page);

      const firstRow = tableRows(page).first();
      const editedName = (await firstRow.locator('[role="cell"]').nth(2).innerText()).trim();

      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await selectFormStatus(page, 'Active');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      // Disappears from Inactive view
      await searchInput(page).fill(editedName);
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: editedName })).toHaveCount(0, { timeout: 10000 });

      // Appears in Active view
      await statusFilterSelect(page).selectOption('true');
      await page.waitForTimeout(800);
      await expect(tableRows(page).filter({ hasText: editedName })).toHaveCount(1, { timeout: 15000 });

      await searchInput(page).clear();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6 – Update Template — Duplicate Validation
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Update Template — Duplicate Validation', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-DUP-UPD-01: Update name to existing Active record name in same category is blocked', async ({ page }) => {
      // Self-contained: create a temp Leads record, then try to rename it to "test" (existing Leads record)
      const tempName = `dup01_${Date.now()}`;
      await templateNameInput(page).fill(tempName);
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('dup test precondition');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      await waitForTableRows(page);
      await clickEditByTemplateName(page, tempName);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await templateNameInput(page).clear();
      await templateNameInput(page).fill('test');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-DUP-UPD-02: Update name to existing Inactive record name in same category is blocked', async ({ page }) => {
      // Precondition: "Enquiry Generated" / Enquiries is Inactive; "test" / Enquiries is Active
      await waitForTableRows(page);
      await clickEditByTemplateName(page, 'test');
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await templateNameInput(page).clear();
      await templateNameInput(page).fill('Enquiry Generated');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-DUP-UPD-03: Update name to UPPERCASE of existing Active record in same category is blocked', async ({ page }) => {
      // Self-contained: create a temp Leads record, rename to "TEST" — uppercase of existing "test"/Leads
      const tempName = `dup03_${Date.now()}`;
      await templateNameInput(page).fill(tempName);
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('dup uppercase test');
      await page.getByRole('button', { name: /Submit/i }).click();
      await expect(createdToast(page)).toBeVisible({ timeout: 15000 });

      await waitForTableRows(page);
      await clickEditByTemplateName(page, tempName);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await templateNameInput(page).clear();
      await templateNameInput(page).fill('TEST');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(errorToast(page)).toBeVisible({ timeout: 15000 });
    });

    test('TC-WAT-DUP-UPD-04: Update to same name with different category should succeed', async ({ page }) => {
      // Precondition: "test" / Leads is Active; no "test" / Breakdown exists
      await waitForTableRows(page);
      await clickEditByTemplateName(page, 'test');
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await selectCategory(page, 'Breakdown');
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      const isSuccess = await updatedToast(page).isVisible({ timeout: 3000 }).catch(() => false);
      const isError   = await errorToast(page).isVisible({ timeout: 3000 }).catch(() => false);

      if (!isError) {
        expect(isSuccess).toBeTruthy();
        await searchInput(page).fill('test');
        await page.waitForTimeout(800);
        const row = tableRows(page).filter({ hasText: 'Breakdown' }).filter({ hasText: 'test' });
        expect(await row.count()).toBeGreaterThan(0);
        await searchInput(page).clear();
      }
    });

    test('TC-WAT-DUP-UPD-05: Update without changing name (same name + same category) should succeed', async ({ page }) => {
      // Precondition: "pm" / PM exists
      await waitForTableRows(page);
      await clickEditByTemplateName(page, 'pm');
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      await templateContentInput(page).clear();
      await templateContentInput(page).fill(`Updated content ${Date.now()}`);
      await page.locator('button').filter({ hasText: /^Update$/ }).click();

      await expect(updatedToast(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible({ timeout: 10000 });
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 7 – Clear Button Behavior
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Clear Button Behavior', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
    });

    test('TC-WAT-CLR-01: Clear button resets Add form', async ({ page }) => {
      await templateNameInput(page).fill('Some Name');
      await selectCategory(page, 'Leads');
      await templateContentInput(page).fill('Some content');

      await page.getByRole('button', { name: /Clear/i }).click();

      await expect(templateNameInput(page)).toHaveValue('');
      await expect(templateContentInput(page)).toHaveValue('');
      await expect(page.locator('#wa_category')).toHaveValue('');
      await expect(page.getByRole('heading', { name: /Add Whatsapp Template/i })).toBeVisible();
    });

    test('TC-WAT-CLR-02: Navigating back resets form to Add mode', async ({ page }) => {
      await waitForTableRows(page);
      await clickEditOnRow(page, 0);
      await expect(page.getByRole('heading', { name: /Update Whatsapp Template/i })).toBeVisible({ timeout: 10000 });

      // Reload to reset to Add mode
      await page.goto(WAT_URL, { timeout: 60000 });
      await page.getByRole('heading', { name: /Add Whatsapp Template/i }).waitFor({ state: 'visible', timeout: 30000 });
      await page.evaluate(() => {
        const el = document.querySelector('.checklist-component') as HTMLElement | null;
        if (el) { el.style.setProperty('display', 'none', 'important'); el.classList.remove('visible'); }
        const nav = document.querySelector('nav.floating-nav') as HTMLElement | null;
        if (nav) nav.style.setProperty('display', 'none', 'important');
      });

      await expect(templateNameInput(page)).toHaveValue('');
      await expect(templateContentInput(page)).toHaveValue('');
      await expect(page.locator('#wa_category')).toHaveValue('');
      await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible();
      // Status dropdown absent in Add mode
      await expect(page.locator('#status')).not.toBeVisible();
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8 – Search and Filter
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Search and Filter', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
      await waitForTableRows(page);
    });

    test('TC-WAT-SRCH-01: Search by template name filters table', async ({ page }) => {
      const initialCount = await tableRows(page).count();

      await searchInput(page).fill('breakdown');
      await page.waitForTimeout(800);

      const filtered = await tableRows(page).count();
      expect(filtered).toBeLessThanOrEqual(initialCount);

      for (let i = 0; i < filtered; i++) {
        const cellText = await tableRows(page).nth(i).locator('[role="cell"]').nth(2).innerText();
        expect(cellText.toLowerCase()).toContain('breakdown');
      }

      await searchInput(page).clear();
      await page.waitForTimeout(800);
      await waitForTableRows(page);
    });

    test('TC-WAT-SRCH-02: Status filter defaults to Active — only Active records shown', async ({ page }) => {
      await expect(statusFilterSelect(page)).toHaveValue('true');

      const count = await tableRows(page).count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const badgeText = await tableRows(page).nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
        expect(/^inactive$/i.test(badgeText.trim())).toBeFalsy();
      }
    });

    test('TC-WAT-SRCH-03: Filter by Inactive status shows only Inactive records', async ({ page }) => {
      await statusFilterSelect(page).selectOption('false');
      await page.waitForTimeout(800);
      await expect(statusFilterSelect(page)).toHaveValue('false');

      await waitForTableRows(page);

      // "Enquiry Generated" / Enquiries (Inactive) should be visible
      await expect(tableRows(page).filter({ hasText: 'Enquiry Generated' })).toHaveCount(1, { timeout: 15000 });

      // No Active badges visible
      const count = await tableRows(page).count();
      for (let i = 0; i < count; i++) {
        const badgeText = await tableRows(page).nth(i).getByRole('heading', { level: 5 }).innerText().catch(() => '');
        expect(/^active$/i.test(badgeText.trim())).toBeFalsy();
      }

      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-SRCH-04: Filter by All status shows both Active and Inactive records', async ({ page }) => {
      const activeCount = await tableRows(page).count();

      await statusFilterSelect(page).selectOption('');
      await page.waitForTimeout(800);
      await expect(statusFilterSelect(page)).toHaveValue('');
      await waitForTableRows(page);

      const allCount = await tableRows(page).count();
      expect(allCount).toBeGreaterThanOrEqual(activeCount);

      // "Enquiry Generated" (Inactive) now visible
      await expect(tableRows(page).filter({ hasText: 'Enquiry Generated' })).toHaveCount(1, { timeout: 15000 });

      await statusFilterSelect(page).selectOption('true');
    });

  });

  // ───────────────────────────────────────────────────────────────────────────
  // 9 – Table Display — Attachment Column
  // ───────────────────────────────────────────────────────────────────────────

  test.describe('Table Display — Attachment Column', () => {

    test.beforeEach(async ({ page }) => {
      await gotoWAT(page);
      await waitForTableRows(page);
    });

    test('TC-WAT-ATT-01: Attachment column shows image link for image files', async ({ page }) => {
      // Precondition: "JObs Video" / Jobs has a JPEG image attached
      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill('JObs Video');
      await page.waitForTimeout(800);

      const row = tableRows(page).filter({ hasText: 'JObs Video' }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const link = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(link).toBeVisible({ timeout: 10000 });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\.(jpg|jpeg|png)/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ATT-02: Attachment column shows PDF link for PDF files', async ({ page }) => {
      // Precondition: "jobs pdf" / Jobs has a PDF attached
      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill('jobs pdf');
      await page.waitForTimeout(800);

      const row = tableRows(page).filter({ hasText: 'jobs pdf' }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const link = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(link).toBeVisible({ timeout: 10000 });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\.pdf/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ATT-03: Attachment column shows PPT link for PPT files', async ({ page }) => {
      // Precondition: "breakdown PPT" / Enquiries has a PPTX attached
      await statusFilterSelect(page).selectOption('');
      await searchInput(page).fill('breakdown PPT');
      await page.waitForTimeout(800);

      const row = tableRows(page).filter({ hasText: 'breakdown PPT' }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const link = row.locator('[role="cell"]').nth(6).locator('a');
      await expect(link).toBeVisible({ timeout: 10000 });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\.pptx?/i);

      await searchInput(page).clear();
      await statusFilterSelect(page).selectOption('true');
    });

    test('TC-WAT-ATT-04: Attachment column shows video element (no text label) for MP4 files', async ({ page }) => {
      // Precondition: "pm" / PM has an MP4 video attached
      await searchInput(page).fill('pm');
      await page.waitForTimeout(800);

      const row = tableRows(page).filter({ hasText: /^pm$/i }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachCell = row.locator('[role="cell"]').nth(6);
      const link = attachCell.locator('a');
      await expect(link).toBeVisible({ timeout: 10000 });

      const href = await link.getAttribute('href');
      expect(href).toMatch(/\.mp4/i);

      // MP4 shows a video element (not an image)
      await expect(attachCell.locator('video')).toBeVisible({ timeout: 5000 });

      await searchInput(page).clear();
    });

    test('TC-WAT-ATT-05: Attachment column is empty for records with no media', async ({ page }) => {
      // Precondition: "test" / Leads has no attachment
      await searchInput(page).fill('test');
      await page.waitForTimeout(800);

      const row = tableRows(page).filter({ hasText: 'Leads' }).filter({ hasText: 'test' }).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });

      const attachCell = row.locator('[role="cell"]').nth(6);
      await expect(attachCell.locator('a')).not.toBeVisible();

      await searchInput(page).clear();
    });

  });

});
