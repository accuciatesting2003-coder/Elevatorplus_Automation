# Work Order Report - Test Plan

## Overview
This test plan covers the **Work Order Report**, which tracks contractor work orders, financial transactions, and completion statuses. It features a **fixed set of three Status Cards (Pending, Confirm, Completed)** that are **always displayed, including when a count is 0** (the card set does not expand to other statuses such as Cancelled, which can appear in the data without a card). The cards are **display-only** (not clickable); filtering by status is done in the **Filters** panel. It also has a detailed data table with **Action items (View, Download)**, a financial **Footer Summary**, robust **Filtering (Contractor Name, Date Range, Status)**, **Search (Contractor Name, Job Number, Work Order Number)**, **Export to Excel**, and **Pagination**.

---

## Columns Summary (10)

Sr. No., Action (View, Download), Work Order No., Contractor Name, Job No., Created At, Total Amount, Paid Amount, Pending Amount, Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Contractor Name | Searchable dropdown |
| Date Range | Date range picker (Created At) |
| Status | Button group (Pending, Confirm, Completed) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-WO-001: Work Order Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Work Order Report.
- **Expected Result:** The page loads with the heading, status cards, data table, footer summary, Search, Export, and Filter controls.

---

## Test Suite 2: Status Cards

### TC-WO-002a: All three cards always visible (including zero counts)
- **Type:** Positive
- **Steps:**
  1. Load the report and inspect the card row (use a scope where one status has 0 records).
- **Expected Result:** All three cards — Pending, Confirm, Completed — are shown, including any with a count of 0; no extra status card (e.g. Cancelled) appears even if such records exist in the table.

### TC-WO-002: Pending card count matches table data
- **Type:** Positive
- **Steps:**
  1. Note the "Pending" card count.
  2. Count the rows with Pending status across all pages.
- **Expected Result:** The table count of Pending rows equals the "Pending" card count.

### TC-WO-003: Confirm card count matches table data
- **Type:** Positive
- **Steps:**
  1. Note the "Confirm" card count and count the Confirm rows.
- **Expected Result:** The table count of Confirm rows equals the "Confirm" card count.

### TC-WO-004: Completed card count matches table data
- **Type:** Positive
- **Steps:**
  1. Note the "Completed" card count and count the Completed rows.
- **Expected Result:** The table count of Completed rows equals the "Completed" card count.

### TC-WO-005: Cards update dynamically when filters are applied
- **Type:** Positive
- **Steps:**
  1. Apply a filter for a specific contractor.
- **Expected Result:** Each status card count reflects only that contractor's work orders.

---

## Test Suite 3: Filtering

### TC-WO-006: Filter by Contractor Name
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Contractor Name, and Apply.
- **Expected Result:** Only that contractor's work orders are listed.

### TC-WO-007: Filter by Status — Pending
- **Type:** Positive
- **Steps:**
  1. Apply Status = Pending.
- **Expected Result:** Only Pending work orders are listed and the count matches the "Pending" card.

### TC-WO-008: Filter by Status — Confirm
- **Type:** Positive
- **Steps:**
  1. Apply Status = Confirm.
- **Expected Result:** Only Confirm work orders are listed and the count matches the "Confirm" card.

### TC-WO-009: Filter by Status — Completed
- **Type:** Positive
- **Steps:**
  1. Apply Status = Completed.
- **Expected Result:** Only Completed work orders are listed and the count matches the "Completed" card.

### TC-WO-010: Filter by Date Range (Created At)
- **Type:** Positive
- **Steps:**
  1. Open Filter, pick a Date Range, and Apply.
- **Expected Result:** Only work orders whose Created At falls within the range are listed.

### TC-WO-011: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Contractor + Status together.
- **Expected Result:** Only records meeting both criteria are displayed.

### TC-WO-012: Clear All resets filters and status cards
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** All records are restored and the footer summary resets to global totals.

### TC-WO-013: Filter with no matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-WO-014: Search by Work Order Number
- **Type:** Positive
- **Steps:**
  1. Search for a specific Work Order Number (e.g. "WO-123").
- **Expected Result:** Only that specific work order appears.

### TC-WO-015: Search by Contractor Name
- **Type:** Positive
- **Steps:**
  1. Search by a Contractor Name.
- **Expected Result:** The table filters to that contractor's work orders.

### TC-WO-016: Search by Job Number
- **Type:** Positive
- **Steps:**
  1. Search by a Job Number.
- **Expected Result:** All work orders associated with that job are returned.

### TC-WO-017: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Actions

### TC-WO-018: All columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All columns are present: Sr. No., Action, Work Order No., Contractor Name, Job No., Created At, Total Amount, Paid Amount, Pending Amount, Status.

### TC-WO-019: View opens work order details
- **Type:** Positive
- **Steps:**
  1. Click "View" on any row.
- **Expected Result:** The work order details open for the correct record.

### TC-WO-020: Download triggers a file download
- **Type:** Positive
- **Steps:**
  1. Click "Download" on a row.
- **Expected Result:** A PDF/Excel download is triggered and its content matches the UI data.

### TC-WO-021: Status badge colours
- **Type:** Positive
- **Steps:**
  1. Inspect the Status column across rows.
- **Expected Result:** Status badges use the correct colours (e.g. Orange: Pending, Blue: Confirm, Green: Completed).

### TC-WO-022: Financial precision per row
- **Type:** Positive
- **Steps:**
  1. For several rows, compute Total Amount − Paid Amount.
- **Expected Result:** Total Amount − Paid Amount equals the Pending Amount for every row.

### TC-WO-023: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Financial Footer Summary

### TC-WO-024: Total Amount sum matches filtered records
- **Type:** Positive
- **Steps:**
  1. Sum the Total Amount column of all visible rows.
  2. Compare with the footer Total Amount.
- **Expected Result:** The footer Total Amount equals the sum of the visible rows.

### TC-WO-025: Paid Amount sum matches filtered records
- **Type:** Positive
- **Steps:**
  1. Sum the Paid Amount column and compare with the footer.
- **Expected Result:** The footer Paid Amount equals the sum of the visible rows.

### TC-WO-026: Pending Amount sum matches filtered records
- **Type:** Positive
- **Steps:**
  1. Sum the Pending Amount column and compare with the footer.
- **Expected Result:** The footer Pending Amount equals the sum of the visible rows.

### TC-WO-027: Assigned Stages count matches
- **Type:** Positive
- **Steps:**
  1. Inspect the footer Assigned Stages value.
- **Expected Result:** The Assigned Stages count matches the underlying data.

### TC-WO-028: Assigned Phases count matches
- **Type:** Positive
- **Steps:**
  1. Inspect the footer Assigned Phases value.
- **Expected Result:** The Assigned Phases count matches the underlying data.

### TC-WO-029: Footer totals update dynamically with filters
- **Type:** Positive
- **Steps:**
  1. Apply a filter that reduces the list (e.g. to 2 rows).
- **Expected Result:** The footer totals reflect only the filtered rows.

---

## Test Suite 7: Export Feature

### TC-WO-030: Export current filtered view to Excel
- **Type:** Positive
- **Steps:**
  1. Apply a filter and click Export.
- **Expected Result:** An Excel file downloads with exactly the filtered rows; it is not empty.

### TC-WO-031: Exported file includes all columns and financial data
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The file contains the Work Order Number, Contractor Name, Job Number, and all financial columns.

### TC-WO-032: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

---

## Test Suite 8: Pagination

### TC-WO-033: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks and the total page count recalculates accordingly.

### TC-WO-034: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

---

## Test Suite 9: UI/UX & Error Handling

### TC-WO-035: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-WO-036: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The wide table scrolls horizontally and controls remain usable.

### TC-WO-037: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Disconnect the network or simulate an API failure.
- **Expected Result:** A "Network Error" toast is shown instead of a crash.

### TC-WO-038: Invalid Date Range selection
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 10: Integrated Validation

### TC-WO-039: Multi-filter intersection accuracy
- **Type:** Positive
- **Steps:**
  1. Apply Contractor + Status + Date Range together (e.g. "XYZ Builders" + "Confirm" + "Last Month").
- **Expected Result:** The table displays only records meeting all three criteria.

### TC-WO-040: Status cards and footer summary sync
- **Type:** Positive
- **Steps:**
  1. With multiple filters active, inspect the status cards and footer summary.
- **Expected Result:** Both the status cards and the footer summary update to reflect only the filtered subset.

### TC-WO-041: Export integrity with filters
- **Type:** Positive
- **Steps:**
  1. With multiple filters active, export to Excel and open the file.
- **Expected Result:** The Excel file contains the exact same records and financial totals as the filtered UI.

### TC-WO-042: Individual status filter cycle
- **Type:** Positive
- **Steps:**
  1. Select "Pending" and verify; then "Confirm" and verify; then "Completed" and verify.
- **Expected Result:** At each step the list shows only that status's items and the count matches the corresponding status card.
