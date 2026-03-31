import { Page, expect } from '@playwright/test';

/**
 * Common Actions Helper
 *
 * Reusable functions for common test actions
 */

/**
 * Wait for network to be idle
 */
export async function waitForNetwork(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for a specific timeout (use sparingly!)
 */
export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = Date.now();
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
  });
}

/**
 * Check if element is visible within timeout
 */
export async function isVisible(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get text content of element
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  return (await page.locator(selector).textContent()) || '';
}

/**
 * Check if URL matches pattern
 */
export async function expectUrlToMatch(page: Page, pattern: string | RegExp) {
  await expect(page).toHaveURL(pattern);
}

/**
 * Reload page and wait for load
 */
export async function reloadPage(page: Page) {
  await page.reload();
  await waitForNetwork(page);
}

/**
 * Clear and fill input
 */
export async function clearAndFill(
  page: Page,
  selector: string,
  value: string
) {
  const input = page.locator(selector);
  await input.clear();
  await input.fill(value);
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string
) {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.locator(selector).click(),
  ]);
}

/**
 * Get all text contents from multiple elements
 */
export async function getAllTextContents(
  page: Page,
  selector: string
): Promise<string[]> {
  return await page.locator(selector).allTextContents();
}

/**
 * Check if page has error
 */
export async function hasPageError(page: Page): Promise<boolean> {
  const errorAlert = page.getByRole('alert');
  return await errorAlert.isVisible().catch(() => false);
}

/**
 * Get page error message
 */
export async function getPageError(page: Page): Promise<string | null> {
  if (await hasPageError(page)) {
    const errorAlert = page.getByRole('alert');
    return await errorAlert.textContent();
  }
  return null;
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(
  page: Page,
  selector: string,
  timeout: number = 10000
) {
  await page.locator(selector).waitFor({ state: 'hidden', timeout });
}

/**
 * Press Enter key
 */
export async function pressEnter(page: Page) {
  await page.keyboard.press('Enter');
}

/**
 * Press Escape key
 */
export async function pressEscape(page: Page) {
  await page.keyboard.press('Escape');
}

/**
 * Hover over element
 */
export async function hoverElement(page: Page, selector: string) {
  await page.locator(selector).hover();
}

/**
 * Double click element
 */
export async function doubleClick(page: Page, selector: string) {
  await page.locator(selector).dblclick();
}

/**
 * Right click element
 */
export async function rightClick(page: Page, selector: string) {
  await page.locator(selector).click({ button: 'right' });
}
