import { test, expect } from '../fixtures/auth-fixture';

const EXPENSE_MASTER_URL = '/product-inventory/expense-master';
const MANAGE_EXPENSE_URL = '/product-inventory/manage-expenses';

async function dismissChecklist(page: any) {
  await page.addStyleTag({
    content: [
      '.checklist-component { display: none !important; }',
      '.header-navbar-shadow { pointer-events: none !important; }',
    ].join('\n'),
  });
}

function tableRows(page: any) {
  return page.locator('[role="row"]:has([role="cell"])');
}

test('DIAG-001: Inspect validation error for whitespace input', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);

  await page.locator('select#expense_type').selectOption({ label: 'Against The PM' });
  await page.locator('input#expense_name').fill('   ');
  await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
  await page.waitForTimeout(2000);

  const html = await page.content();
  const snapshot = await page.locator('form').first().innerHTML().catch(() => 'no form');
  console.log('FORM HTML:', snapshot.substring(0, 3000));

  const classErrorCount = await page.locator('[class*="error"]').count();
  console.log('Elements with class*error:', classErrorCount);

  for (let i = 0; i < classErrorCount; i++) {
    const txt = await page.locator('[class*="error"]').nth(i).textContent().catch(() => '');
    const cls = await page.locator('[class*="error"]').nth(i).getAttribute('class').catch(() => '');
    console.log(`  Error element ${i}: class="${cls}", text="${txt}"`);
  }

  const swalVisible = await page.locator('.swal2-popup').isVisible().catch(() => false);
  console.log('SweetAlert popup visible:', swalVisible);

  const nameVal = await page.locator('input#expense_name').inputValue().catch(() => '');
  console.log('Current expense_name value:', JSON.stringify(nameVal));
});

test('DIAG-002: Inspect Edit button locator and rows', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);

  await page.waitForTimeout(1000);

  const rows = page.locator('[role="row"]:has([role="cell"])');
  const rowCount = await rows.count();
  console.log('Row count:', rowCount);

  if (rowCount > 0) {
    const firstRowHtml = await rows.first().innerHTML().catch(() => '');
    console.log('First row HTML:', firstRowHtml.substring(0, 2000));

    const svgEdit = rows.first().locator('svg[title="Edit"]');
    const svgEditCount = await svgEdit.count();
    console.log('svg[title="Edit"] count in first row:', svgEditCount);

    const h5s = rows.first().locator('h5');
    const h5Count = await h5s.count();
    console.log('h5 count in first row:', h5Count);
    for (let i = 0; i < h5Count; i++) {
      const txt = await h5s.nth(i).textContent().catch(() => '');
      console.log(`  h5 ${i}: "${txt}"`);
    }
  }

  const selects = page.locator('select');
  const selectCount = await selects.count();
  console.log('Total selects:', selectCount);
  for (let i = 0; i < selectCount; i++) {
    const options = await selects.nth(i).locator('option').allTextContents();
    console.log(`  Select ${i} options:`, options);
  }
});

test('DIAG-003: Inspect Manage Expense page', async ({ page }) => {
  await page.goto(MANAGE_EXPENSE_URL);
  await page.waitForTimeout(3000);
  await dismissChecklist(page);

  const heading = await page.getByRole('heading', { name: /Manage Expense/i }).isVisible().catch(() => false);
  console.log('Manage Expense heading visible:', heading);

  const expenseTypeSelect = page.locator('select#expense_type');
  const hasSelect = await expenseTypeSelect.isVisible().catch(() => false);
  console.log('expense_type select visible:', hasSelect);

  if (hasSelect) {
    const options = await expenseTypeSelect.locator('option').allTextContents();
    console.log('Expense type options:', options);
    await expenseTypeSelect.selectOption({ label: 'Against The PM' });
    await page.waitForTimeout(1000);

    const reactSelects = page.locator('[class*="react-select"]');
    const rsCount = await reactSelects.count();
    console.log('React select elements:', rsCount);

    // Click the react select
    const rsContainer = page.locator('.react-select').first();
    await rsContainer.click();
    await page.waitForTimeout(1000);

    const idOptions = page.locator('[id*="-option-"]');
    const idOptionCount = await idOptions.count();
    console.log('Elements with id*=-option-:', idOptionCount);
    for (let i = 0; i < Math.min(idOptionCount, 5); i++) {
      const txt = await idOptions.nth(i).textContent().catch(() => '');
      const id = await idOptions.nth(i).getAttribute('id').catch(() => '');
      console.log(`  ID Option ${i}: id="${id}", text="${txt}"`);
    }

    const menuHtml = await page.locator('[class*="react-select__menu"]').innerHTML().catch(() => 'menu not found');
    console.log('React select menu HTML:', menuHtml.substring(0, 2000));
  }
});

test('DIAG-004: Inspect search field and empty state', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);

  const rows = tableRows(page);
  const initialCount = await rows.count();
  console.log('Initial row count:', initialCount);

  await page.locator('input#filled-search').fill('NONEXISTENT_XYZ_99999');
  await page.waitForTimeout(2000);

  const countAfterSearch = await rows.count();
  console.log('Row count after search:', countAfterSearch);

  // rdt table body
  const rdtBody = page.locator('.rdt_TableBody');
  const rdtBodyText = await rdtBody.textContent().catch(() => 'not found');
  console.log('rdt_TableBody text:', rdtBodyText?.substring(0, 300));

  const rdtBodyHtml = await rdtBody.innerHTML().catch(() => 'not found');
  console.log('rdt_TableBody HTML:', rdtBodyHtml?.substring(0, 1000));

  // What does the no-data indicator look like?
  const pageHtml = await page.locator('[class*="rdt_Table"]').innerHTML().catch(() => 'not found');
  console.log('rdt_Table HTML:', pageHtml?.substring(0, 2000));
});

test('DIAG-005: Inspect pagination controls', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);

  const statusSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
  await statusSelect.selectOption('All');
  await page.waitForTimeout(500);

  const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
  await rppSelect.selectOption('100');
  await page.waitForTimeout(1000);

  const rows = tableRows(page);
  const rowCount = await rows.count();
  console.log('Row count at 100 per page (All filter):', rowCount);

  const nextBtns = page.locator('[aria-label*="next" i]');
  const nextBtnCount = await nextBtns.count();
  console.log('Next button count:', nextBtnCount);

  for (let i = 0; i < nextBtnCount; i++) {
    const visible = await nextBtns.nth(i).isVisible().catch(() => false);
    const disabled = await nextBtns.nth(i).isDisabled().catch(() => false);
    const ariaDisabled = await nextBtns.nth(i).getAttribute('aria-disabled').catch(() => '');
    console.log(`  Next btn ${i}: visible=${visible}, disabled=${disabled}, aria-disabled="${ariaDisabled}"`);
  }

  const pagination = page.locator('[class*="pagination"], [class*="Pagination"]').first();
  const hasPagination = await pagination.isVisible().catch(() => false);
  console.log('Pagination element visible:', hasPagination);
  if (hasPagination) {
    const paginationHtml = await pagination.innerHTML().catch(() => '');
    console.log('Pagination HTML:', paginationHtml.substring(0, 2000));
  }
});

test('DIAG-006: Check Submit button text in edit mode', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);
  await page.waitForTimeout(1000);

  const buttons = page.locator('button');
  const btnCount = await buttons.count();
  console.log('Total buttons:', btnCount);
  for (let i = 0; i < btnCount; i++) {
    const txt = await buttons.nth(i).textContent().catch(() => '');
    const type = await buttons.nth(i).getAttribute('type').catch(() => '');
    console.log(`  Button ${i}: type="${type}", text="${txt?.trim()}"`);
  }

  const rows = tableRows(page);
  await rows.first().waitFor({ state: 'visible', timeout: 10000 });
  await rows.first().locator('svg[title="Edit"]').click({ force: true });
  await page.waitForTimeout(1000);

  console.log('--- AFTER CLICK EDIT ---');
  const btnsAfter = page.locator('button');
  const btnCountAfter = await btnsAfter.count();
  console.log('Total buttons after edit click:', btnCountAfter);
  for (let i = 0; i < btnCountAfter; i++) {
    const txt = await btnsAfter.nth(i).textContent().catch(() => '');
    const type = await btnsAfter.nth(i).getAttribute('type').catch(() => '');
    console.log(`  Button ${i}: type="${type}", text="${txt?.trim()}"`);
  }

  const formHtml = await page.locator('form').first().innerHTML().catch(() => 'no form');
  console.log('Form HTML after edit:', formHtml.substring(0, 3000));
});

test('DIAG-007: Check status toggle flow and SweetAlert', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);
  await page.waitForTimeout(1000);

  const ts = Date.now();
  const name = `StatusToggleTest ${ts}`;

  await page.locator('select#expense_type').selectOption({ label: 'Against The Job' });
  await page.locator('input#expense_name').fill(name);
  await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
  await page.waitForTimeout(2000);
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

  // Close any SweetAlert
  const swal = page.locator('.swal2-popup');
  const swalVisible = await swal.isVisible().catch(() => false);
  console.log('SweetAlert after submit:', swalVisible);
  if (swalVisible) {
    const swalText = await swal.textContent().catch(() => '');
    console.log('SweetAlert text:', swalText?.substring(0, 200));
    await page.locator('.swal2-confirm').click().catch(() => {});
    await page.waitForTimeout(500);
  }

  const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
  await rppSelect.selectOption('100');
  await page.waitForTimeout(500);

  const rows = tableRows(page);
  let rowIdx = -1;
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const txt = await rows.nth(i).textContent().catch(() => '');
    if (txt && txt.includes(name)) { rowIdx = i; break; }
  }
  console.log('Found row index:', rowIdx);

  if (rowIdx >= 0) {
    const h5 = rows.nth(rowIdx).locator('h5');
    const h5Html = await h5.innerHTML().catch(() => '');
    console.log('Status h5 HTML:', h5Html);

    await h5.click({ force: true });
    await page.waitForTimeout(2000);
    await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    const swalAfter = await page.locator('.swal2-popup').isVisible().catch(() => false);
    console.log('SweetAlert after toggle:', swalAfter);
    if (swalAfter) {
      const swalText = await page.locator('.swal2-popup').textContent().catch(() => '');
      console.log('SweetAlert text after toggle:', swalText?.substring(0, 200));
      await page.locator('.swal2-confirm').click().catch(() => {});
      await page.waitForTimeout(500);
    }

    const statusSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
    await statusSelect.selectOption('Inactive');
    await page.waitForTimeout(1000);
    await rppSelect.selectOption('100');
    await page.waitForTimeout(500);

    const inactiveRows = await tableRows(page).count();
    console.log('Rows under Inactive filter:', inactiveRows);

    const nameVisible = await page.getByText(name).isVisible().catch(() => false);
    console.log('Name visible in Inactive filter:', nameVisible);
  }
});

test('DIAG-008: Check submit then find row and click edit', async ({ page }) => {
  await page.goto(EXPENSE_MASTER_URL);
  await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
  await dismissChecklist(page);

  const ts = Date.now();
  const name = `FindAndEdit ${ts}`;

  // Submit
  await page.locator('select#expense_type').selectOption({ label: 'Against The PM' });
  await page.locator('input#expense_name').fill(name);
  await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

  const swal = page.locator('.swal2-popup');
  if (await swal.isVisible().catch(() => false)) {
    console.log('SweetAlert after submit visible');
    await page.locator('.swal2-confirm').click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Select 100 per page and find
  const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
  await rppSelect.selectOption('100');
  await page.waitForTimeout(500);

  const rows = tableRows(page);
  let rowIdx = -1;
  const count = await rows.count();
  console.log('Row count:', count);
  for (let i = 0; i < count; i++) {
    const txt = await rows.nth(i).textContent().catch(() => '');
    if (txt && txt.includes(name)) { rowIdx = i; break; }
  }
  console.log('Row index for submitted item:', rowIdx);

  if (rowIdx >= 0) {
    await rows.nth(rowIdx).locator('svg[title="Edit"]').click({ force: true });
    await page.waitForTimeout(1000);

    // Check what buttons are now visible
    const btns = page.locator('button');
    const btnCount = await btns.count();
    console.log('Buttons after edit click:', btnCount);
    for (let i = 0; i < btnCount; i++) {
      const txt = await btns.nth(i).textContent().catch(() => '');
      const type = await btns.nth(i).getAttribute('type').catch(() => '');
      console.log(`  Button ${i}: type="${type}", text="${txt?.trim()}"`);
    }

    // Check heading
    const headings = await page.locator('h2, h3, h4, h5, h6').allTextContents();
    console.log('Headings in edit mode:', headings);

    // Check form HTML
    const formHtml = await page.locator('form').first().innerHTML().catch(() => 'no form');
    console.log('Form HTML in edit mode:', formHtml.substring(0, 3000));

    // Check if Submit button is present
    const submitBtn = page.locator('button').filter({ hasText: /^Submit$/i });
    const submitCount = await submitBtn.count();
    console.log('Submit buttons count:', submitCount);

    // Check Update button
    const updateBtn = page.locator('button').filter({ hasText: /^Update$/i });
    const updateCount = await updateBtn.count();
    console.log('Update buttons count:', updateCount);
  }
});
