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

test.describe('Diagnostic 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EXPENSE_MASTER_URL);
    await page.getByRole('heading', { name: /Add Expense Category/i }).waitFor({ state: 'visible', timeout: 30000 });
    await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await dismissChecklist(page);
  });

  test('DIAG-006: Check Submit button text in edit mode', async ({ page }) => {
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

    const formHeadings = await page.locator('[class*="heading"], [class*="title"], h2, h3, h4, h5, h6').allTextContents();
    console.log('All headings:', formHeadings);

    const formHtml = await page.locator('form').first().innerHTML().catch(() => 'no form');
    console.log('Form HTML after edit:', formHtml.substring(0, 3000));
  });

  test('DIAG-007: Check search behavior in detail', async ({ page }) => {
    const rows = tableRows(page);
    const initialCount = await rows.count();
    console.log('Initial row count:', initialCount);

    await page.locator('input#filled-search').fill('NONEXISTENT_XYZ_99999');
    await page.waitForTimeout(2000);

    const countAfterSearch = await rows.count();
    console.log('Row count after search:', countAfterSearch);

    // Check the table structure
    const allTableRows = page.locator('[role="row"]');
    const allRowCount = await allTableRows.count();
    console.log('All role=row count (including header):', allRowCount);

    // Check rdt table body
    const rdtBody = page.locator('.rdt_TableBody');
    const rdtBodyText = await rdtBody.textContent().catch(() => 'not found');
    console.log('rdt_TableBody text:', rdtBodyText?.substring(0, 300));

    const rdtBodyHtml = await rdtBody.innerHTML().catch(() => 'not found');
    console.log('rdt_TableBody HTML:', rdtBodyHtml?.substring(0, 1000));

    // What does the page show after no-result search?
    const pageHtml = await page.locator('[class*="rdt_Table"]').innerHTML().catch(() => 'not found');
    console.log('rdt_Table HTML:', pageHtml?.substring(0, 2000));
  });

  test('DIAG-008: Check pagination Next button disabled state', async ({ page }) => {
    const statusSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) }).first();
    await statusSelect.selectOption('All');
    await page.waitForTimeout(500);

    const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
    await rppSelect.selectOption('100');
    await page.waitForTimeout(1000);

    const rows = tableRows(page);
    const rowCount = await rows.count();
    console.log('Row count:', rowCount);

    // Check Next button specifically
    const nextBtn = page.locator('[aria-label="Next page"]').first();
    const nextVisible = await nextBtn.isVisible().catch(() => false);
    const nextDisabled = await nextBtn.isDisabled().catch(() => false);
    const nextAriaDisabled = await nextBtn.getAttribute('aria-disabled').catch(() => '');
    console.log('Next button: visible=', nextVisible, 'disabled=', nextDisabled, 'aria-disabled=', nextAriaDisabled);

    // The parent li class
    const nextLi = page.locator('.page-item.next');
    const nextLiClass = await nextLi.getAttribute('class').catch(() => '');
    console.log('Next page li class:', nextLiClass);

    // Check locator with aria-label=next
    const nextAriaBtn = page.locator('[aria-label*="next" i]').first();
    const nextAriaVisible = await nextAriaBtn.isVisible().catch(() => false);
    const nextAriaIsDisabled = await nextAriaBtn.isDisabled().catch(() => false);
    console.log('aria-label*="next": visible=', nextAriaVisible, 'isDisabled=', nextAriaIsDisabled);

    // Test total rows < 100 condition
    if (rowCount < 100) {
      console.log('Row count < 100, so next should be disabled');
      const isDisabledOrHidden = !nextAriaVisible || nextAriaIsDisabled;
      console.log('isDisabledOrHidden:', isDisabledOrHidden);
    }
  });

  test('DIAG-009: Check Manage Expense page category dropdown', async ({ page }) => {
    await page.goto(MANAGE_EXPENSE_URL);
    await page.getByRole('heading', { name: /Manage Expense/i }).waitFor({ state: 'visible', timeout: 30000 });
    await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await dismissChecklist(page);

    const expenseTypeSelect = page.locator('select#expense_type');
    await expenseTypeSelect.selectOption({ label: 'Against The PM' });
    await page.waitForTimeout(1500);

    // Check react-select structure
    const rs = page.locator('[class*="react-select"]');
    const rsCount = await rs.count();
    console.log('React select elements count:', rsCount);

    for (let i = 0; i < rsCount; i++) {
      const cls = await rs.nth(i).getAttribute('class').catch(() => '');
      const id = await rs.nth(i).getAttribute('id').catch(() => '');
      console.log(`  RS ${i}: id="${id}", class="${cls?.substring(0, 100)}"`);
    }

    // Click the react-select
    const rsContainer = page.locator('.react-select').first();
    const rsContainerVisible = await rsContainer.isVisible().catch(() => false);
    console.log('React select container visible:', rsContainerVisible);

    if (rsContainerVisible) {
      await rsContainer.click();
      await page.waitForTimeout(1000);

      // Check for menu/options
      const idOptions = page.locator('[id*="-option-"]');
      const idOptionCount = await idOptions.count();
      console.log('Elements with id*=-option-:', idOptionCount);
      for (let i = 0; i < Math.min(idOptionCount, 5); i++) {
        const txt = await idOptions.nth(i).textContent().catch(() => '');
        const id = await idOptions.nth(i).getAttribute('id').catch(() => '');
        console.log(`  ID Option ${i}: id="${id}", text="${txt}"`);
      }

      // Check entire dropdown content
      const menuHtml = await page.locator('[class*="react-select__menu"]').innerHTML().catch(() => 'menu not found');
      console.log('Menu HTML:', menuHtml?.substring(0, 2000));
    }
  });

  test('DIAG-010: Check status toggle flow', async ({ page }) => {
    const ts = Date.now();
    const name = `StatusToggleTest ${ts}`;

    await page.locator('select#expense_type').selectOption({ label: 'Against The Job' });
    await page.locator('input#expense_name').fill(name);
    await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
    await page.waitForTimeout(2000);
    await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Close any SweetAlert
    const swalConfirm = page.locator('.swal2-confirm');
    if (await swalConfirm.isVisible().catch(() => false)) {
      await swalConfirm.click();
      await page.waitForTimeout(500);
    }

    // Select 100 per page
    const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
    await rppSelect.selectOption('100');
    await page.waitForTimeout(500);

    // Find the row
    const rows = tableRows(page);
    const count = await rows.count();
    console.log('Row count:', count);

    let rowIdx = -1;
    for (let i = 0; i < count; i++) {
      const txt = await rows.nth(i).textContent().catch(() => '');
      if (txt && txt.includes(name)) {
        rowIdx = i;
        break;
      }
    }
    console.log('Found row index:', rowIdx);

    if (rowIdx >= 0) {
      const h5 = rows.nth(rowIdx).locator('h5');
      const h5Text = await h5.textContent().catch(() => '');
      console.log('Status h5 text:', h5Text);
      const h5Html = await h5.innerHTML().catch(() => '');
      console.log('Status h5 HTML:', h5Html);

      await h5.click({ force: true });
      await page.waitForTimeout(2000);
      await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check swal after toggle
      const swalAfter = await page.locator('.swal2-popup').isVisible().catch(() => false);
      console.log('SweetAlert after toggle:', swalAfter);
      if (swalAfter) {
        const swalText = await page.locator('.swal2-popup').textContent().catch(() => '');
        console.log('SweetAlert text:', swalText?.substring(0, 200));
        await page.locator('.swal2-confirm').click().catch(() => {});
        await page.waitForTimeout(500);
      }

      // Try Inactive filter
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

  test('DIAG-011: Check findRowByName function - submit then find', async ({ page }) => {
    const ts = Date.now();
    const name = `FindTest ${ts}`;

    await page.locator('select#expense_type').selectOption({ label: 'Against The PM' });
    await page.locator('input#expense_name').fill(name);
    await page.locator('button').filter({ hasText: /^Submit$/ }).first().click({ force: true });
    await page.waitForTimeout(1000);
    await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Close SweetAlert if visible
    const swal = page.locator('.swal2-popup');
    const swalVisible = await swal.isVisible().catch(() => false);
    console.log('SweetAlert visible after submit:', swalVisible);
    if (swalVisible) {
      const swalText = await swal.textContent().catch(() => '');
      console.log('SweetAlert text:', swalText?.substring(0, 200));
      const confirmBtn = page.locator('.swal2-confirm');
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Try findRowByName logic
    const rppSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '100' }) }).first();
    await rppSelect.selectOption('100');
    await page.waitForTimeout(500);

    const rows = tableRows(page);
    const count = await rows.count();
    console.log('Row count after submit:', count);

    let rowIdx = -1;
    for (let i = 0; i < count; i++) {
      const txt = await rows.nth(i).textContent().catch(() => '');
      if (txt && txt.includes(name)) {
        rowIdx = i;
        break;
      }
    }
    console.log('Found row index:', rowIdx);

    if (rowIdx >= 0) {
      // Try clicking Edit
      const editSvg = rows.nth(rowIdx).locator('svg[title="Edit"]');
      const editSvgCount = await editSvg.count();
      console.log('Edit SVG count in row:', editSvgCount);
      await editSvg.click({ force: true });
      await page.waitForTimeout(1000);

      // Check buttons after edit click
      const btns = page.locator('button');
      const btnCount = await btns.count();
      console.log('Buttons after edit click:', btnCount);
      for (let i = 0; i < btnCount; i++) {
        const txt = await btns.nth(i).textContent().catch(() => '');
        const type = await btns.nth(i).getAttribute('type').catch(() => '');
        console.log(`  Button ${i}: type="${type}", text="${txt?.trim()}"`);
      }

      const headingText = await page.getByRole('heading', { name: /expense/i }).allTextContents();
      console.log('Headings:', headingText);

      // Check form HTML in update mode
      const formHtml = await page.locator('form').first().innerHTML().catch(() => 'no form');
      console.log('Form HTML in update mode:', formHtml.substring(0, 3000));
    }
  });
});
