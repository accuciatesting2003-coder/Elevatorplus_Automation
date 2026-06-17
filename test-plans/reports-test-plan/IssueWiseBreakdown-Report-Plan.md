# Issue-wise Breakdown Report - Test Plan

## Overview
This test plan covers the **Issue-wise Breakdown Report** (`/reports/issue-wise-breakdown-report`), internally titled **"Breakdown Issue Count Report"**, an aggregation report that tracks breakdown issues by category — it groups all breakdown records by their issue and shows how many breakdowns reported each issue. It presents a 4-column table where the **View** column ("For More Details") drills into the underlying breakdown records for that issue. The report supports **Filtering (Date Range, Branch, Area, City)**, real-time **Search (Issue Name)**, **Export to Excel**, an **Active Filters** chip with **Clear All**, column sorting, and pagination.

---

## Columns Summary (4)

Sr. No., View, Issue Name, No. Of Issues (aggregated count).

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker |
| Branch | Button group |
| Area | Button group (cascading) |
| City | Button group |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-IB-001: Issue-wise Breakdown Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Issue-wise Breakdown Report.
- **Expected Result:** The page loads with the heading "Breakdown Issue Count Report", subtitle "Track breakdown issues by category", the data table, Search, Export, and Filter controls.

### TC-IB-002: Default date range applied on load
- **Type:** Positive
- **Steps:**
  1. Load the page and observe the Active Filters chip.
- **Expected Result:** A default date range is shown and the aggregated data reflects it.

---

## Test Suite 2: Aggregation Accuracy

### TC-IB-003: No. Of Issues equals underlying breakdown count
- **Type:** Positive
- **Steps:**
  1. Note an issue row's "No. Of Issues" value.
  2. Cross-check the number of breakdowns reporting that issue in the active range.
- **Expected Result:** The "No. Of Issues" equals the number of breakdown records reporting that issue.

### TC-IB-004: Each issue appears only once
- **Type:** Positive
- **Steps:**
  1. Scan the Issue Name column for duplicates.
- **Expected Result:** Every distinct issue is collapsed into a single row (no duplicate issue rows).

### TC-IB-005: Counts reconcile with the Breakdown Report
- **Type:** Positive
- **Steps:**
  1. Apply identical filters here and on the Breakdown Report.
  2. Compare per-issue counts with the Breakdown Report's Issues column.
- **Expected Result:** The per-issue counts reconcile between the two reports.

### TC-IB-006: Counts update dynamically when a filter is applied
- **Type:** Positive
- **Steps:**
  1. Note baseline counts.
  2. Apply a Date/Branch/City filter.
- **Expected Result:** Every issue count recomputes to reflect only the matching breakdowns.

---

## Test Suite 3: Filtering

### TC-IB-007: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, pick a Date Range, and Apply.
- **Expected Result:** Only breakdowns within the range are aggregated.

### TC-IB-008: Filter by Branch
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Branch, and Apply.
- **Expected Result:** Only breakdowns in that branch are aggregated.

### TC-IB-009: Filter by Area
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Branch then an Area, and Apply.
- **Expected Result:** The aggregation narrows to the selected area; Area options correspond to the chosen Branch.

### TC-IB-010: Filter by City
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a City, and Apply.
- **Expected Result:** Only breakdowns in that city are aggregated.

### TC-IB-011: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Branch + City + Date Range together.
- **Expected Result:** Only breakdowns meeting all criteria are aggregated.

### TC-IB-012: Reset inside the Filter panel
- **Type:** Positive
- **Steps:**
  1. Make selections, then click Reset.
- **Expected Result:** All in-panel selections clear back to default.

### TC-IB-013: Clear All resets filters and chip
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** The table and Active Filters chip return to default (default date range).

### TC-IB-014: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-IB-015: Search by Issue Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type a full or partial Issue Name in the Search box.
- **Expected Result:** The aggregated rows filter to matching issues.

### TC-IB-016: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-IB-017: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search is cleared and the full dataset is restored.

### TC-IB-018: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-IB-019: All 4 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 4 columns are present: Sr. No., View, Issue Name, No. Of Issues.

### TC-IB-020: View drills into the issue's breakdowns
- **Type:** Positive
- **Steps:**
  1. Click the "For More Details" icon on an issue row.
- **Expected Result:** The individual breakdown records that contribute to that issue's count are listed.

### TC-IB-021: Drill-down count matches the aggregate
- **Type:** Positive
- **Steps:**
  1. Note an issue's "No. Of Issues" value, then drill in via View.
- **Expected Result:** The number of drilled records equals the "No. Of Issues" value.

### TC-IB-022: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Issue Name and No. Of Issues headers.
- **Expected Result:** Each click toggles ascending/descending sort; sorting by "No. Of Issues" orders issues by frequency.

### TC-IB-023: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, move to page 2 (if applicable).
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-IB-024: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters, click Export.
- **Expected Result:** An Excel file downloads containing all aggregated rows; it is not empty.

### TC-IB-025: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Branch + Date filter and click Export.
- **Expected Result:** The file contains exactly the aggregated rows and counts shown on screen.

### TC-IB-026: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-IB-027: Exported headers and counts match the UI
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The file headers and per-issue counts match the on-screen data.

---

## Test Suite 7: Pagination

### TC-IB-028: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-IB-029: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, and a specific page number (when multiple pages exist).
- **Expected Result:** The correct records display for each navigation.

---

## Test Suite 8: UI/UX & Error Handling

### TC-IB-030: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-IB-031: Empty state when no issues match
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state is shown.

### TC-IB-032: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The table scrolls and controls remain usable.

### TC-IB-033: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-IB-034: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-IB-035: Count ↔ drill-down synchronization
- **Type:** Positive
- **Steps:**
  1. Apply Branch + Date; note an issue's count.
  2. Drill into the issue via View.
- **Expected Result:** The number of listed breakdowns equals the issue's "No. Of Issues" count.

### TC-IB-036: Filter + Export consistency
- **Type:** Positive
- **Steps:**
  1. With filters active, export and open the file.
- **Expected Result:** The aggregated counts match the filtered UI.

### TC-IB-037: Reset workflow restores data
- **Type:** Positive
- **Steps:**
  1. Apply filters; verify the listing; click Clear All.
- **Expected Result:** The full dataset is restored.
