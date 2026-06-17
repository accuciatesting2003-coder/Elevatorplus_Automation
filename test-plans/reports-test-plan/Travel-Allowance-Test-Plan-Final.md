# Travel Allowance Report - Test Plan

## Overview
This test plan covers the **Travel Allowance Report**, which tracks and maintains employee travel distance data. The data table **dynamically adjusts its columns based on the selected date range**: fixed columns (Sr. No., Emp Code, Emp Name, Designation) are followed by one **Dynamic Date Column** per day in the range (e.g. 01-Jun, 02-Jun, ...) showing distance values. It supports **Filtering (Date Range, Employee selection)**, real-time **Search (Emp Name, Designation, Emp Code)**, **Export to Excel**, and **Pagination**.

---

## Columns Summary

**Fixed:** Sr. No., Emp Code, Emp Name, Designation.
**Dynamic:** One date column per day in the selected range (e.g. 01-Jun, 02-Jun, ...) holding the distance value for that day.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (drives the dynamic date columns) |
| Employee | Searchable dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-TA-001: Travel Allowance Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Travel Allowance Report.
- **Expected Result:** The page loads with the heading, fixed columns, data table, Search, Export, and Filter controls.

---

## Test Suite 2: Filtering

### TC-TA-002: Filter by Date Range generates dynamic date columns
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a date range (e.g. June 1 to June 5), and Apply.
- **Expected Result:** The table generates exactly 5 date columns (one per day) in addition to the fixed employee detail columns.

### TC-TA-003: Filter by specific Employee
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a specific employee, and Apply.
- **Expected Result:** The table narrows to only that employee's travel row.

### TC-TA-004: Combine Date Range + Employee filter
- **Type:** Positive
- **Steps:**
  1. Apply a Date Range + Employee together.
- **Expected Result:** Only the selected employee's distances within the range are displayed across the generated date columns.

### TC-TA-005: Clear All resets filters and columns to default
- **Type:** Positive
- **Steps:**
  1. Apply filters and a search, then click Clear All.
- **Expected Result:** The date range resets to default (e.g. current month), the dynamic columns reset, and search inputs clear.

### TC-TA-006: Date Range with no travel data
- **Type:** Negative
- **Steps:**
  1. Select a date range where no travel data was recorded.
- **Expected Result:** A "No Records Found" empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-TA-007: Search by Employee Code
- **Type:** Positive
- **Steps:**
  1. Search for an Emp Code (e.g. "EMP001").
- **Expected Result:** Only that employee is returned.

### TC-TA-008: Search by Employee Name
- **Type:** Positive
- **Steps:**
  1. Search for an Emp Name (e.g. "John").
- **Expected Result:** The current view dynamically filters to matching employees.

### TC-TA-009: Search by Designation
- **Type:** Positive
- **Steps:**
  1. Search for a Designation (e.g. "Technician").
- **Expected Result:** The list filters to employees with that designation.

### TC-TA-010: Search with partial strings
- **Type:** Positive
- **Steps:**
  1. Search a partial string (e.g. "Eng" for "Engineer").
- **Expected Result:** All matching employees/designations are returned.

### TC-TA-011: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-TA-012: Fixed columns are always visible
- **Type:** Positive
- **Steps:**
  1. Inspect the left side of the table.
- **Expected Result:** The fixed columns (Sr. No., Emp Code, Emp Name, Designation) are always visible.

### TC-TA-013: Date columns match the selected Date Range
- **Type:** Positive
- **Steps:**
  1. Apply a date range and inspect the generated date columns.
- **Expected Result:** The date columns correspond exactly to the selected range and are formatted correctly (e.g. DD-MMM).

### TC-TA-014: Distance value accuracy
- **Type:** Positive
- **Steps:**
  1. For a specific employee and date, compare the displayed distance with the employee's record.
- **Expected Result:** The distance values are aligned with the correct employee and date.

### TC-TA-015: Horizontal scrolling for wide date ranges
- **Type:** Positive
- **Steps:**
  1. Select a long range (e.g. 30 days) and scroll the table.
- **Expected Result:** A horizontal scrollbar is available and the fixed columns remain pinned (if sticky columns are implemented).

### TC-TA-016: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Export Feature

### TC-TA-017: Export dataset with current filters
- **Type:** Positive
- **Steps:**
  1. Apply filters and click Export.
- **Expected Result:** An Excel file downloads reflecting the current filtered view; it is not empty.

### TC-TA-018: Exported file includes all dynamic date columns
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The number of date columns in the Excel matches the range selected in the UI at export time.

### TC-TA-019: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-TA-020: Exported data matches the UI exactly
- **Type:** Positive
- **Steps:**
  1. Cross-check a distance value for a specific employee/date between the UI and the Excel file.
- **Expected Result:** The exported data matches the table UI exactly.

---

## Test Suite 6: Pagination

### TC-TA-021: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-TA-022: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-TA-023: Pagination state maintained after search/filter
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then apply a search or filter.
- **Expected Result:** The pagination state is maintained appropriately.

---

## Test Suite 7: UI/UX & Performance

### TC-TA-024: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-TA-025: Empty state when no records exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield no travel data.
- **Expected Result:** A "No Records Found" message is displayed.

### TC-TA-026: Load time with large date range
- **Type:** Positive
- **Steps:**
  1. Select a wide range (e.g. 31 days for 100+ employees).
- **Expected Result:** The report loads within an acceptable time and the wide table remains responsive.

---

## Test Suite 8: Error Handling

### TC-TA-027: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** A user-friendly error message/toast is shown and the UI does not crash.

### TC-TA-028: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date (or a range beyond any allowed limit).
- **Expected Result:** The system prevents the selection or shows a validation error.
