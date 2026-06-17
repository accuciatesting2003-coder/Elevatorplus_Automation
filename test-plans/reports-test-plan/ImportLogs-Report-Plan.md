# Import Logs Report - Test Plan

## Overview
This test plan covers the **Import Logs** report (`/reports/import-logs`), which provides an audit trail of all bulk-import activity and its results across modules (Jobs, PM, Branches, Areas, Products, Designations, etc.). It presents an 11-column table where the **Excel File** column exposes a **View** link to the original uploaded source file. The report supports **Filtering (Date Range, User, Entity Type/Module)**, real-time **Search**, **Export to Excel**, an **Active Filters** chip with **Clear All**, and **Pagination (default 50)**. The per-row **Status** is a badge (**Success / Failed**). There are no status cards or Manage Column controls.

---

## Columns Summary (11)

Sr. No., User Name, Module Name, Excel File (View link), Date (date + time), Total, Success Count, Failed, Created, Updated, Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker |
| User | Searchable dropdown |
| Entity Type (Module) | Button group (All, Job, PM Import, branches, areas, etc.) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-IL-001: Import Logs page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Import Logs.
- **Expected Result:** The page loads with the heading "Import Logs", subtitle "Track all data import activity and results", the data table, Search, Export, and Filters controls.

### TC-IL-002: Default date range applied on load
- **Type:** Positive
- **Steps:**
  1. Load the page and observe the Active Filters chip.
- **Expected Result:** A default date range is shown and the data reflects it.

---

## Test Suite 2: Filtering

### TC-IL-003: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filters, pick a Date Range, and Apply.
- **Expected Result:** Only import runs whose Date falls within the range are listed.

### TC-IL-004: Filter by User
- **Type:** Positive
- **Steps:**
  1. Open Filters, select a User, and Apply.
- **Expected Result:** Only import runs performed by that user are listed.

### TC-IL-005: Filter by Entity Type / Module
- **Type:** Positive
- **Steps:**
  1. Open Filters, select an Entity Type (e.g. Job, PM Import, branches), and Apply.
- **Expected Result:** Only that module's import runs are listed.

### TC-IL-006: Default "All" entity types
- **Type:** Positive
- **Steps:**
  1. Open Filters and leave Entity Type = All.
- **Expected Result:** Import runs for all modules are listed.

### TC-IL-007: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply User + Module + Date Range together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-IL-008: Reset inside the Filters panel
- **Type:** Positive
- **Steps:**
  1. Make selections, then click Reset.
- **Expected Result:** All in-panel selections clear back to default.

### TC-IL-009: Clear All resets filters and chip
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** The table and Active Filters chip return to default (default date range).

### TC-IL-010: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-IL-011: Search by Module Name
- **Type:** Positive
- **Steps:**
  1. Type a Module Name in the Search box.
- **Expected Result:** The table filters to matching import runs.

### TC-IL-012: Search by User Name
- **Type:** Positive
- **Steps:**
  1. Type a User Name in the Search box.
- **Expected Result:** The table filters to that user's import runs.

### TC-IL-013: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-IL-014: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search is cleared and the full dataset is restored.

### TC-IL-015: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-IL-016: All 11 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 11 columns are present: Sr. No., User Name, Module Name, Excel File, Date, Total, Success Count, Failed, Created, Updated, Status.

### TC-IL-017: Excel File View link opens the source file
- **Type:** Positive
- **Steps:**
  1. Click the "View" link in the Excel File column of a row.
- **Expected Result:** The original uploaded file for that row opens/downloads from its source URL.

### TC-IL-018: Status badge reflects the outcome
- **Type:** Positive
- **Steps:**
  1. Inspect the Status column across rows.
- **Expected Result:** Runs with failures show "Failed" (red); fully successful runs show "Success" (green).

### TC-IL-019: Date shows date and time
- **Type:** Positive
- **Steps:**
  1. Inspect the Date column.
- **Expected Result:** The Date renders with both date and time (DD-MM-YYYY hh:mm AM/PM).

### TC-IL-020: Count integrity — Total = Success + Failed
- **Type:** Positive
- **Steps:**
  1. For several rows, compare Total against Success Count + Failed.
- **Expected Result:** Total equals Success Count + Failed for every row.

### TC-IL-021: Count integrity — Success = Created + Updated
- **Type:** Positive
- **Steps:**
  1. For several rows, compare Success Count against Created + Updated.
- **Expected Result:** Success Count equals Created + Updated for every row.

### TC-IL-022: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Date, Module Name, and Status headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-IL-023: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Export Feature

### TC-IL-024: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters, click Export.
- **Expected Result:** An Excel file downloads containing all records; it is not empty.

### TC-IL-025: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Module + Date filter and click Export.
- **Expected Result:** The file contains exactly the rows shown on screen.

### TC-IL-026: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-IL-027: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** Headers match the 11 columns and counts are numeric (not scientific notation).

---

## Test Suite 6: Pagination

### TC-IL-028: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly (default 50).

### TC-IL-029: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, and a specific page number.
- **Expected Result:** The correct records display for each navigation.

### TC-IL-030: Previous/Next disabled at boundaries
- **Type:** Positive
- **Steps:**
  1. Observe Previous on page 1 and Next on the last page.
- **Expected Result:** Previous is disabled on page 1 and Next is disabled on the last page.

---

## Test Suite 7: UI/UX & Error Handling

### TC-IL-031: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-IL-032: Empty state when no logs match
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state is shown.

### TC-IL-033: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The table scrolls horizontally and controls remain usable.

### TC-IL-034: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-IL-035: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 8: Integrated Validation

### TC-IL-036: Filter accuracy + count reconciliation
- **Type:** Positive
- **Steps:**
  1. Apply Module + Date.
  2. Verify the listing and the per-row Total/Success/Failed/Created/Updated figures.
- **Expected Result:** The listing is correct and all per-row counts reconcile (Total = Success + Failed; Success = Created + Updated).

### TC-IL-037: Failed import trace via source file
- **Type:** Positive
- **Steps:**
  1. Filter for a "Failed" log and open its Excel File link.
- **Expected Result:** The linked file is the exact file that produced that result.

### TC-IL-038: Reset workflow restores data
- **Type:** Positive
- **Steps:**
  1. Apply multiple filters; verify the listing; click Clear All.
- **Expected Result:** The full dataset is restored.

### TC-IL-039: Filter + Export consistency
- **Type:** Positive
- **Steps:**
  1. With filters active, export and open the file.
- **Expected Result:** The file matches the filtered UI row-for-row.
