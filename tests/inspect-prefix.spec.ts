import { test } from './fixtures/auth-fixture';
import * as fs from 'fs';
import * as path from 'path';

async function gotoPrefix(page: any) {
  await page.goto('/settings/configure?tab=prefix');
  await page.waitForLoadState('networkidle');
  try {
    const btn = page.getByRole('button', { name: /Maybe Later/i });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) await btn.click();
  } catch {}
  try {
    const panel = page.locator('.checklist-component button').first();
    if (await panel.isVisible({ timeout: 2000 }).catch(() => false)) await panel.click();
  } catch {}
  await page.locator('#prefixYearType').waitFor({ state: 'visible', timeout: 20000 });
}

test('inspect: Manual state inputs', async ({ page }) => {
  await gotoPrefix(page);
  await page.locator('#prefixYearType').selectOption('Manual');
  await page.waitForTimeout(800);
  const inputs = await page.evaluate(() => {
    const els = document.querySelectorAll('input, select');
    return Array.from(els).map((el: any) => ({
      tag: el.tagName, id: el.id, name: el.name, type: el.type,
      placeholder: el.placeholder, value: el.value, className: el.className,
    })).filter(i => i.className.includes('modern-form-input') || i.className.includes('form-control'));
  });
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-manual-inputs.json'), JSON.stringify(inputs, null, 2));
  const html = await page.locator('.settings-form-body').first().innerHTML().catch(() => '');
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-manual-section-html.txt'), html.substring(0, 3000));
});

test('inspect: Not Required state', async ({ page }) => {
  await gotoPrefix(page);
  await page.locator('#prefixYearType').selectOption('Not Required');
  await page.waitForTimeout(800);
  const inputs = await page.evaluate(() => {
    const els = document.querySelectorAll('input, select');
    return Array.from(els).map((el: any) => ({
      tag: el.tagName, id: el.id, name: el.name, type: el.type,
      placeholder: el.placeholder, value: el.value, className: el.className,
    })).filter(i => i.className.includes('modern-form-input') || i.className.includes('form-control'));
  });
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-not-required-inputs.json'), JSON.stringify(inputs, null, 2));
  const tokensHtml = await page.locator('.jss39').first().innerHTML().catch(() => '');
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-not-required-tokens.txt'), tokensHtml);
});

test('inspect: validation on empty FY Change On (Automatic)', async ({ page }) => {
  await gotoPrefix(page);
  await page.locator('#prefixYearType').selectOption('Automatic');
  await page.waitForTimeout(500);
  // Clear the date input - click it and clear using keyboard
  const dateInput = page.locator('.react-datepicker__input-container input').first();
  await dateInput.click({ force: true });
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.locator('#prefixYearType').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const errorMsgs = bodyText.split('\n').filter((l: string) =>
    l.toLowerCase().includes('required') || l.toLowerCase().includes('error') ||
    l.toLowerCase().includes('invalid') || l.toLowerCase().includes('please') ||
    l.toLowerCase().includes('cannot') || l.toLowerCase().includes('enter')
  );
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-validation-errors.txt'), errorMsgs.join('\n'));
  await page.screenshot({ path: path.join(__dirname, '../.playwright-mcp/prefix-validation-screenshot.png'), fullPage: false });
});

test('inspect: financialYear token in pattern + Not Required error', async ({ page }) => {
  await gotoPrefix(page);
  // Ensure Automatic first, add {financialYear} to quotation template
  await page.locator('#prefixYearType').selectOption('Automatic');
  await page.waitForTimeout(500);
  const quotInput = page.locator('input[name="quotation_template"]');
  await quotInput.fill('{financialYear}{serialNumber}');
  // Switch to Not Required
  await page.locator('#prefixYearType').selectOption('Not Required');
  await page.waitForTimeout(800);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const errorLines = bodyText.split('\n').filter((l: string) => l.includes('financialYear') || l.includes('Not Required'));
  fs.writeFileSync(path.join(__dirname, '../.playwright-mcp/prefix-fy-error.txt'), errorLines.join('\n'));
  await page.screenshot({ path: path.join(__dirname, '../.playwright-mcp/prefix-fy-error.png'), fullPage: false });
});
