# Financial Summary Report - Test Plan

## Overview
This test plan covers the **Financial Summary Report** (`/reports/financial-summary-report`), which gives a per-site / per-job / per-AMC financial overview of income, expenses, and net profit/loss. It is **parameter-driven**: the user selects a **Site Name**, **Job Number**, and/or **AMC Number** (searchable dropdowns) and clicks **Generate Report** — no data is shown until then. After generation it presents three **Summary Cards (Total Income, Total Expenses, Net Profit/Loss)**, an **Export Excel** action, and four detailed sub-tables. **Net Profit/Loss = Total Income − Total Expenses.**

---

## Sub-tables Summary

| Sub-table | Columns |
|-----------|---------|
| Income Summary – Finalized Quotations | Quotation Number, Date, Type, Amount, International Payment, Actions (Download) + Total row |
| Expenses – Delivery Challans (Purchase) | DC Number, Date, Amount (Purchase Price), Actions |
| Other Operational Expenses | Date, Expense Type, Amount, Note |
| Returned Items Summary | Return Order Number, Date, Amount (Credit), Actions |

---

## Test Cases

---

## Test Suite 1: Page Load & Parameters

### TC-FS-001: Financial Summary Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Financial Summary Report.
- **Expected Result:** The page loads with the heading "Financial Summary Report", subtitle "Financial overview of income, expenses, and net profit/loss", the Site Name / Job Number / AMC Number selectors, and the Generate Report button.

### TC-FS-002: No summary or tables before Generate Report
- **Type:** Positive
- **Steps:**
  1. Load the page and observe before clicking Generate Report.
- **Expected Result:** Only the parameter selectors and Generate Report button are visible — no summary cards or sub-tables.

### TC-FS-003: Generate report by Site Name
- **Type:** Positive
- **Steps:**
  1. Select a valid Site Name from the dropdown.
  2. Click Generate Report.
- **Expected Result:** The summary cards, Export Excel button, and four sub-tables render scoped to the selected site.

### TC-FS-004: Generate report by Job Number
- **Type:** Positive
- **Steps:**
  1. Select a valid Job Number and click Generate Report.
- **Expected Result:** The financial summary renders scoped to that job.

### TC-FS-005: Generate report by AMC Number
- **Type:** Positive
- **Steps:**
  1. Select a valid AMC Number and click Generate Report.
- **Expected Result:** The financial summary renders scoped to that AMC.

### TC-FS-006: Generate report with combined parameters
- **Type:** Positive
- **Steps:**
  1. Select Site + Job + AMC values and click Generate Report.
- **Expected Result:** The summary reflects the combined scope.

### TC-FS-007: Generate with no parameter selected
- **Type:** Negative
- **Steps:**
  1. Click Generate Report without selecting any parameter.
- **Expected Result:** The action is blocked or a validation/prompt is shown to select at least one parameter.

### TC-FS-008: Re-generate after changing a parameter
- **Type:** Positive
- **Steps:**
  1. Generate a report, then change the Site/Job/AMC and click Generate Report again.
- **Expected Result:** The summary and sub-tables refresh to reflect the new scope.

---

## Test Suite 2: Summary Cards

### TC-FS-009: Total Income matches Income sub-table total
- **Type:** Positive
- **Steps:**
  1. Generate a report.
  2. Compare the Total Income card with the "Total" row of the Income Summary sub-table.
- **Expected Result:** Total Income equals the Income Summary total.

### TC-FS-010: Total Expenses matches expense sub-tables sum
- **Type:** Positive
- **Steps:**
  1. Generate a report.
  2. Sum Delivery Challans (Purchase) + Other Operational Expenses.
- **Expected Result:** Total Expenses equals the combined sum of the expense sub-tables (per the app's costing logic).

### TC-FS-011: Net Profit/Loss equals Income − Expenses
- **Type:** Positive
- **Steps:**
  1. Generate a report and read all three cards.
- **Expected Result:** Net Profit/Loss = Total Income − Total Expenses.

### TC-FS-012: Currency formatting
- **Type:** Positive
- **Steps:**
  1. Inspect the card and table amounts.
- **Expected Result:** Amounts render with the ₹ symbol and thousands separators.

### TC-FS-013: Loss scenario renders correctly
- **Type:** Positive
- **Steps:**
  1. Generate a report for an entity whose expenses exceed income.
- **Expected Result:** Net Profit/Loss renders as a loss (negative/red) and the Net formula still holds.

---

## Test Suite 3: Income Summary – Finalized Quotations

### TC-FS-014: Income table columns
- **Type:** Positive
- **Steps:**
  1. Generate a report and inspect the Income Summary sub-table header.
- **Expected Result:** Columns present: Quotation Number, Date, Type, Amount, International Payment, Actions.

### TC-FS-015: Total row equals sum of Amount column
- **Type:** Positive
- **Steps:**
  1. Sum the Amount column of all listed quotations.
  2. Compare with the "Total" row.
- **Expected Result:** The Total row equals the sum of the Amount column (and the Total Income card).

### TC-FS-016: Download a quotation from the Income table
- **Type:** Positive
- **Steps:**
  1. Click the "Download" action on a quotation row.
- **Expected Result:** The correct quotation document downloads.

### TC-FS-017: International Payment placeholder
- **Type:** Positive
- **Steps:**
  1. Inspect the International Payment column.
- **Expected Result:** The column shows a value where applicable or a "-" placeholder otherwise.

---

## Test Suite 4: Expense Sub-tables

### TC-FS-018: Delivery Challans table columns
- **Type:** Positive
- **Steps:**
  1. Inspect the "Expenses – Delivery Challans (Purchase)" sub-table.
- **Expected Result:** Columns present: DC Number, Date, Amount (Purchase Price), Actions.

### TC-FS-019: Other Operational Expenses table columns
- **Type:** Positive
- **Steps:**
  1. Inspect the "Other Operational Expenses" sub-table.
- **Expected Result:** Columns present: Date, Expense Type, Amount, Note.

### TC-FS-020: Returned Items Summary columns
- **Type:** Positive
- **Steps:**
  1. Inspect the "Returned Items Summary" sub-table.
- **Expected Result:** Columns present: Return Order Number, Date, Amount (Credit), Actions.

### TC-FS-021: Empty messages per sub-table
- **Type:** Positive
- **Steps:**
  1. Generate a report for an entity lacking challans/expenses/returns.
- **Expected Result:** Each sub-table shows its specific empty message ("No delivery challans found.", "No expense found.", "No return items found.").

### TC-FS-022: Returned items credit applied to Net
- **Type:** Positive
- **Steps:**
  1. Generate a report that has returned items.
- **Expected Result:** The returned items (credit) are applied consistently to the Net Profit/Loss per the app's costing logic.

---

## Test Suite 5: Export Feature

### TC-FS-023: Export Excel downloads a file
- **Type:** Positive
- **Steps:**
  1. Generate a report and click Export Excel.
- **Expected Result:** An Excel file downloads containing the summary and all sub-tables; it is not empty.

### TC-FS-024: Exported totals match the Summary Cards
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
  2. Compare income/expenses/net figures with the cards.
- **Expected Result:** The exported figures match the on-screen Summary Cards exactly.

### TC-FS-025: Export a report with empty sub-tables
- **Type:** Positive
- **Steps:**
  1. Generate a report with empty sub-tables and Export.
- **Expected Result:** A valid file is produced with the available data and empty sections handled gracefully.

---

## Test Suite 6: UI/UX & Error Handling

### TC-FS-026: Loading state while generating
- **Type:** Positive
- **Steps:**
  1. Click Generate Report and observe.
- **Expected Result:** A loading indicator is shown until the summary renders.

### TC-FS-027: Zero/empty state
- **Type:** Positive
- **Steps:**
  1. Generate a report for an entity with no financial activity.
- **Expected Result:** Cards show ₹0 and sub-tables show their empty messages rather than an error.

### TC-FS-028: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open a generated report on a small viewport.
- **Expected Result:** The cards stack and the sub-tables scroll horizontally.

### TC-FS-029: API failure / timeout during generation
- **Type:** Negative
- **Steps:**
  1. Simulate an API failure while generating.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

---

## Test Suite 7: Integrated Validation

### TC-FS-030: End-to-end financial accuracy
- **Type:** Positive
- **Steps:**
  1. Generate a report for a Site.
  2. Reconcile Total Income with the Income table total, Total Expenses with the expense tables sum, and Net with the formula.
- **Expected Result:** All three cards reconcile with their underlying sub-tables and Net = Income − Expenses.

### TC-FS-031: Generate ↔ Export consistency
- **Type:** Positive
- **Steps:**
  1. Generate a report, then Export Excel and open it.
- **Expected Result:** Every figure matches the UI row-for-row and total-for-total.

### TC-FS-032: Re-scope from Site to Job
- **Type:** Positive
- **Steps:**
  1. Generate for a Site, then switch to a specific Job Number and regenerate.
- **Expected Result:** The figures narrow to that job only.
