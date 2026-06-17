# Approval Activity Report - Test Plan

## Overview
This test plan covers the **Approval Activity Report**, which tracks the audit trail of approval processes across modules. It maintains a detailed log of every action taken during an approval flow (Initiated, Approved, Modified, Rejected). It presents a 10-column table and supports **Filtering (Date Range, Approval Type, Action)**, **Search (Remark, Step)**, and **Pagination**.

---

## Columns Summary (10)

Sr. No., Action, Site/Firm, Type, Step, Performed By, Branch, Entity Details, Remark, Date.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Single day / Custom range) |
| Approval Type | Dropdown (PO, Job, Work Order, etc.) |
| Action | Dropdown (Initiated, Approved, Modified, Rejected) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-AA-001: Approval Activity Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Approval Activity Report.
- **Expected Result:** The page loads with the heading, data table, Search, and Filter controls; page 1 is shown by default.

---

## Test Suite 2: Filtering

### TC-AA-002: Filter by Action — Approved
- **Type:** Positive
- **Steps:**
  1. Apply Action = Approved.
- **Expected Result:** Only "Approved" records are listed; no "Modified" or "Rejected" records appear.

### TC-AA-003: Filter by Action — Rejected
- **Type:** Positive
- **Steps:**
  1. Apply Action = Rejected.
- **Expected Result:** Only "Rejected" records are listed.

### TC-AA-004: Filter by Action — Modified
- **Type:** Positive
- **Steps:**
  1. Apply Action = Modified.
- **Expected Result:** Only "Modified" records are listed.

### TC-AA-005: Filter by Action — Initiated
- **Type:** Positive
- **Steps:**
  1. Apply Action = Initiated.
- **Expected Result:** Only "Initiated" records are listed.

### TC-AA-006: Filter by Approval Type
- **Type:** Positive
- **Steps:**
  1. Apply an Approval Type (e.g. Purchase Order, Job, Work Order).
- **Expected Result:** Only records of the selected type are listed.

### TC-AA-007: Filter by Date Range — single day (Today)
- **Type:** Positive
- **Steps:**
  1. Set the Date Range to Today and Apply.
- **Expected Result:** Only today's approval activity is listed.

### TC-AA-008: Filter by Date Range — custom range
- **Type:** Positive
- **Steps:**
  1. Set a custom range (e.g. last 3 months) and Apply.
- **Expected Result:** Only activity within the selected range is listed.

### TC-AA-009: Combine Action + Type filters
- **Type:** Positive
- **Steps:**
  1. Apply Action + Type together.
- **Expected Result:** Only records meeting both criteria are displayed.

### TC-AA-010: Combine Action + Type + Date Range filters
- **Type:** Positive
- **Steps:**
  1. Apply Action: Approved + Type: Purchase Order + Date: Last 7 Days.
- **Expected Result:** The table shows the intersection of all three criteria.

### TC-AA-011: Clear All resets all filter dropdowns
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** Every dropdown returns to its placeholder text (e.g. "Select Type") and the full dataset is restored.

### TC-AA-012: Filter with no matching data
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-AA-013: Search by Remark — full string
- **Type:** Positive
- **Steps:**
  1. Search a full Remark string (e.g. a job number mentioned in a remark).
- **Expected Result:** The matching entry is isolated.

### TC-AA-014: Search by Remark — partial string
- **Type:** Positive
- **Steps:**
  1. Search a partial Remark string.
- **Expected Result:** All entries whose Remark contains the substring are returned.

### TC-AA-015: Search by Step — full string
- **Type:** Positive
- **Steps:**
  1. Search a full Step value (e.g. "Step 1").
- **Expected Result:** Matching entries for that step are returned.

### TC-AA-016: Search by Step — partial string
- **Type:** Positive
- **Steps:**
  1. Search a partial Step value (e.g. "Final").
- **Expected Result:** All entries whose Step contains the substring are returned.

### TC-AA-017: Search auto-trims leading/trailing spaces
- **Type:** Positive
- **Steps:**
  1. Search " Step 1 " with surrounding spaces.
- **Expected Result:** Results are identical to searching "Step 1".

### TC-AA-018: Search with special characters
- **Type:** Positive
- **Steps:**
  1. Search using special characters (e.g. #, -, /).
- **Expected Result:** The system handles input gracefully without crashing.

### TC-AA-019: Case-insensitive search
- **Type:** Positive
- **Steps:**
  1. Search "step" then "STEP" (or "final" vs "FINAL").
- **Expected Result:** Both yield identical results.

### TC-AA-020: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-AA-021: All 10 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 10 columns are present: Sr. No., Action, Site/Firm, Type, Step, Performed By, Branch, Entity Details, Remark, Date.

### TC-AA-022: Action badge colours
- **Type:** Positive
- **Steps:**
  1. Inspect the Action column across rows.
- **Expected Result:** Action badges use distinct colours (Green: Approved, Red: Rejected, Blue: Initiated, Yellow: Modified) so Rejected actions are immediately recognisable.

### TC-AA-023: Date format consistency
- **Type:** Positive
- **Steps:**
  1. Inspect the Date column.
- **Expected Result:** Dates render in a consistent format (e.g. DD/MM/YYYY HH:mm) reflecting the time of the action.

### TC-AA-024: Performed By displays full user name
- **Type:** Positive
- **Steps:**
  1. Inspect the Performed By column.
- **Expected Result:** The full name of the user who performed the action is shown.

### TC-AA-025: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Remark or Entity Details value.
- **Expected Result:** A tooltip reveals the full text.

### TC-AA-026: Default sort newest first
- **Type:** Positive
- **Steps:**
  1. Load the report and observe the Date order.
- **Expected Result:** The table loads with the most recent approval activity at the top.

### TC-AA-027: Sort by Date
- **Type:** Positive
- **Steps:**
  1. Click the Date header to toggle newest↔oldest.
- **Expected Result:** Rows reorder by date in the chosen direction.

### TC-AA-028: Sort by Action (alphabetical)
- **Type:** Positive
- **Steps:**
  1. Click the Action header.
- **Expected Result:** Rows reorder alphabetically by action.

### TC-AA-029: Sort by Performed By
- **Type:** Positive
- **Steps:**
  1. Click the Performed By header.
- **Expected Result:** Rows reorder by performer name.

### TC-AA-030: Horizontal scrolling on small screens
- **Type:** Positive
- **Steps:**
  1. Reduce the viewport width.
- **Expected Result:** The table scrolls horizontally and all columns remain accessible.

### TC-AA-031: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Pagination

### TC-AA-032: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks; selecting 10 shows exactly 10 rows (except possibly the last page).

### TC-AA-033: Navigate Next / Previous
- **Type:** Positive
- **Steps:**
  1. Click Next, then Previous.
- **Expected Result:** The correct records display for each navigation.

### TC-AA-034: Jump to First / Last page
- **Type:** Positive
- **Steps:**
  1. Click First, then Last.
- **Expected Result:** The first and last page records display correctly.

### TC-AA-035: Pagination updates after filtering
- **Type:** Positive
- **Steps:**
  1. Apply a filter that reduces results (e.g. from 100 to 5).
- **Expected Result:** Pagination collapses to a single page (or disappears) reflecting the reduced result count.

### TC-AA-036: Page 1 shown by default on fresh load
- **Type:** Positive
- **Steps:**
  1. Load the report fresh.
- **Expected Result:** Page 1 is displayed by default.

---

## Test Suite 6: UI/UX & Performance

### TC-AA-037: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A skeleton/spinner is shown until data renders.

### TC-AA-038: Empty state centered UI
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A centered "No Records Found" UI is displayed.

### TC-AA-039: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** Columns stack or scroll horizontally with key columns (Action, Performed By) remaining accessible.

### TC-AA-040: Load 1000+ records without lag
- **Type:** Positive
- **Steps:**
  1. Load the report against a high-volume dataset.
- **Expected Result:** Sorting and filtering remain responsive without browser lag.

### TC-AA-041: Rapid filter switching (stress)
- **Type:** Positive
- **Steps:**
  1. Switch filters rapidly several times in a row.
- **Expected Result:** The report remains stable and renders the correct result each time.

---

## Test Suite 7: Error Handling

### TC-AA-042: Handle API 500 with toast
- **Type:** Negative
- **Steps:**
  1. Simulate an API 500 (Internal Server Error).
- **Expected Result:** A "Something went wrong" toast is shown rather than a blank white screen.

### TC-AA-043: Handle API 404 / timeout
- **Type:** Negative
- **Steps:**
  1. Simulate a 404 or timeout while loading.
- **Expected Result:** A friendly error message/toast is shown and the UI does not crash.

### TC-AA-044: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Select an end date earlier than the start date.
- **Expected Result:** The system blocks the request or shows a validation error.

---

## Test Suite 8: Integrated Validation

### TC-AA-045: Multi-filter + search intersection accuracy
- **Type:** Positive
- **Steps:**
  1. Combine a Search for "Urgent" + Filter by "Work Order".
- **Expected Result:** Results match both the search and the filter.

### TC-AA-046: Clear All clears search and resets table
- **Type:** Positive
- **Steps:**
  1. Apply filters and a search, then click Clear All.
- **Expected Result:** Both the search query and the filters are cleared and the table resets to all records.

### TC-AA-047: Filter state after refresh
- **Type:** Positive
- **Steps:**
  1. Apply a filter, then refresh the page.
- **Expected Result:** The filter state is maintained if the feature is supported, otherwise it resets cleanly to default without error.

### TC-AA-048: Action options update with Type (if dynamic)
- **Type:** Positive
- **Steps:**
  1. Select a Type and inspect the Action options.
- **Expected Result:** If Action options are dynamic, they update to those valid for the selected Type.
