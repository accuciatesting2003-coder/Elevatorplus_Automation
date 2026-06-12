import { test } from './fixtures/auth-fixture';

test('inspect phase master DOM', async ({ page }) => {
  await page.goto('/master/phase-master');
  await page.getByRole('heading', { name: /Add Phase/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page.addStyleTag({ content: '.checklist-component { display: none !important; }' });

  const ids = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, placeholder: e.getAttribute('placeholder'), visible: (e as any).offsetParent !== null }))
  );
  console.log('ADD_UNCHECKED=' + JSON.stringify(ids));

  await page.locator('#isAllowForAllLifts').check({ force: true });
  await page.waitForTimeout(300);
  const ids2 = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, visible: (e as any).offsetParent !== null }))
  );
  console.log('ADD_CHECKED=' + JSON.stringify(ids2));

  const labelHtml = await page.locator('label[for="isAllowForAllLifts"]').evaluate((el: HTMLElement) => el.outerHTML).catch(() => 'NO_LABEL');
  console.log('LABEL=' + labelHtml);

  await page.locator('label[for="isAllowForAllLifts"]').click().catch(() => {});
  await page.waitForTimeout(500);
  const ids3 = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, visible: (e as any).offsetParent !== null }))
  );
  console.log('ADD_UNCHECKED_AGAIN=' + JSON.stringify(ids3));

  await page.locator('[role="row"]:has([role="cell"])').nth(0).locator('svg[title="Edit"]').click({ force: true });
  await page.getByRole('heading', { name: /Update Phase/i }).waitFor({ state: 'visible', timeout: 10000 });
  const ids4 = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, placeholder: e.getAttribute('placeholder'), visible: (e as any).offsetParent !== null }))
  );
  console.log('EDIT_FORM=' + JSON.stringify(ids4));
});
