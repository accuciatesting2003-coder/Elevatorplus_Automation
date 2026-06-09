import { test, expect } from './fixtures/auth-fixture';

test('inspect lost reason', async ({ page }) => {
  await page.goto('/master/lost-reason');
  await page.waitForLoadState('networkidle');

  console.log('--- PAGE INSPECTION ---');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  const headings = await page.getByRole('heading').all();
  for (const heading of headings) {
      console.log('Heading:', await heading.textContent());
  }

  const inputs = await page.getByRole('textbox').all();
  for (const input of inputs) {
      const label = await input.evaluate(el => el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.id);
      console.log('Input:', label);
  }

  const buttons = await page.getByRole('button').all();
  for (const button of buttons) {
      console.log('Button:', await button.textContent());
  }

  const table = page.locator('table');
  if (await table.isVisible()) {
      console.log('Table Headers:', await table.locator('thead th').allTextContents());
      const firstRow = table.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
          console.log('First Row:', await firstRow.textContent());
          const editIcon = firstRow.getByRole('img', { name: 'Edit' });
          if (await editIcon.isVisible()) {
              await editIcon.click();
              await page.waitForTimeout(1000);
              console.log('--- AFTER EDIT CLICK ---');
              const updateHeading = page.getByRole('heading', { name: /Update/i });
              if (await updateHeading.isVisible()) {
                  console.log('Update Heading:', await updateHeading.textContent());
              }
              const statusSelect = page.getByRole('combobox', { name: /Status/i });
              console.log('Status Select visible:', await statusSelect.isVisible());
          }
      }
  }
  console.log('--- END INSPECTION ---');
});
