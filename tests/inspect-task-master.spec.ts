import { test } from './fixtures/auth-fixture';

test('inspect task master DOM', async ({ page }) => {
  await page.goto('/master/task-master');
  await page.waitForTimeout(3000);

  // Check heading
  const h4 = await page.locator('h4').allInnerTexts().catch(() => []);
  console.log('H4_HEADINGS=' + JSON.stringify(h4));

  const h5 = await page.locator('h5').allInnerTexts().catch(() => []);
  console.log('H5_HEADINGS=' + JSON.stringify(h5));

  // React select IDs
  const reactSelects = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, placeholder: e.getAttribute('placeholder'), visible: (e as any).offsetParent !== null }))
  );
  console.log('REACT_SELECTS=' + JSON.stringify(reactSelects));

  // All input IDs
  const inputs = await page.locator('input').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, name: e.name, type: e.type, placeholder: e.getAttribute('placeholder') }))
  );
  console.log('INPUTS=' + JSON.stringify(inputs));

  // Edit icon type: img or svg?
  const rows = page.locator('[role="row"]:has([role="cell"])');
  const rowCount = await rows.count();
  console.log('ROW_COUNT=' + rowCount);
  if (rowCount > 0) {
    const imgs = await rows.nth(0).locator('img').evaluateAll((els: HTMLImageElement[]) => els.map(e => e.alt));
    console.log('ROW0_IMGS=' + JSON.stringify(imgs));
    const svgs = await rows.nth(0).locator('svg').evaluateAll((els: SVGElement[]) => els.map(e => e.getAttribute('title') || e.getAttribute('aria-label') || 'no-title'));
    console.log('ROW0_SVGS=' + JSON.stringify(svgs));
  }

  // Status filter select values
  const selects = await page.locator('select').evaluateAll((els: HTMLSelectElement[]) =>
    els.map(e => ({
      value: e.value,
      options: Array.from(e.options).map(o => ({ value: o.value, text: o.text }))
    }))
  );
  console.log('SELECTS=' + JSON.stringify(selects));
});
