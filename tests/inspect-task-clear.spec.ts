import { test } from './fixtures/auth-fixture';

test('inspect clear button checkbox behavior', async ({ page }) => {
  await page.goto('/master/task-master');
  await page.getByRole('heading', { name: /Add Task/i }).waitFor({ state: 'visible', timeout: 30000 });
  await page.addStyleTag({ content: '.checklist-component { display: none !important; }' });

  // Check initial state
  const remarkInitial = await page.locator('#remark_required').isChecked();
  const photosInitial = await page.locator('#photos_required').isChecked();
  console.log('INITIAL remark=' + remarkInitial + ' photos=' + photosInitial);

  // Toggle checkboxes via label click
  await page.locator('label[for="remark_required"]').click();
  await page.locator('label[for="photos_required"]').click();
  await page.waitForTimeout(200);

  const remarkAfterToggle = await page.locator('#remark_required').isChecked();
  const photosAfterToggle = await page.locator('#photos_required').isChecked();
  console.log('AFTER_TOGGLE remark=' + remarkAfterToggle + ' photos=' + photosAfterToggle);

  // Click Clear
  await page.getByRole('button', { name: /Clear/i }).click();
  await page.waitForTimeout(500);

  const remarkAfterClear = await page.locator('#remark_required').isChecked();
  const photosAfterClear = await page.locator('#photos_required').isChecked();
  console.log('AFTER_CLEAR remark=' + remarkAfterClear + ' photos=' + photosAfterClear);
});
