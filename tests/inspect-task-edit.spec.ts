import { test } from './fixtures/auth-fixture';

test('inspect task master edit mode react select IDs', async ({ page }) => {
  await page.goto('/master/task-master');
  await page.getByRole('heading', { name: /Add Task/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page.addStyleTag({ content: '.checklist-component { display: none !important; }' });

  // Check ADD mode IDs
  const addIds = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, visible: (e as any).offsetParent !== null }))
  );
  console.log('ADD_MODE=' + JSON.stringify(addIds));

  // Click edit on first row
  const rows = page.locator('[role="row"]:has([role="cell"])');
  await rows.first().waitFor({ state: 'visible' });
  await rows.nth(0).locator('svg[title="Edit"]').click({ force: true });
  await page.getByRole('heading', { name: /Update Task/i }).waitFor({ state: 'visible', timeout: 10000 });

  // Check EDIT mode IDs
  const editIds = await page.locator('input[id*="react-select"]').evaluateAll((els: HTMLInputElement[]) =>
    els.map(e => ({ id: e.id, visible: (e as any).offsetParent !== null }))
  );
  console.log('EDIT_MODE=' + JSON.stringify(editIds));

  // Check status select (is it native or React Select?)
  const statusSelect = await page.locator('select').evaluateAll((els: HTMLSelectElement[]) =>
    els.map(e => ({
      id: e.id, name: e.name,
      options: Array.from(e.options).map(o => o.text)
    }))
  );
  console.log('NATIVE_SELECTS_EDIT=' + JSON.stringify(statusSelect));
});
