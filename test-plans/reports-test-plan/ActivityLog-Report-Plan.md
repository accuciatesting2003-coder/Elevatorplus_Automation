# Activity Log Report - Test Plan

## Overview
This test plan covers the **Activity Log** report (`/reports/activity-log-report`), which is an audit trail that tracks all **report-generation activity by users** — every time a user generates/exports a report, an entry is recorded here. It presents a 5-column table where the **Filters** column shows the exact parameters used for that generation as key–value pairs. The report supports **Filtering (Date Range, User)**, real-time **Search**, an **Active Filters** chip with **Clear All**, and **Pagination (default 25)**. It is read-only: there are no status cards, Manage Column, or Export.

---

## Columns Summary (5)

Sr. No., Report Name, User Name, Action Date (date + time), Filters (key–value parameters used at generation).

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Action Date) |
| User | Searchable dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-AL-001: Activity Log page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Activity Log Report.
- **Expected Result:** The page loads with the heading "Activity Log", subtitle "Track all report generation activity by users", the data table, Search, and Filters controls.

### TC-AL-002: Default date range applied on load
- **Type:** Positive
- **Steps:**
  1. Load the page and observe the Active Filters chip.
- **Expected Result:** A default date range is shown and the data reflects it.

---

## Test Suite 2: Filtering

### TC-AL-003: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filters, pick a Date Range, and Apply.
- **Expected Result:** Only entries whose Action Date falls within the range are listed.

### TC-AL-004: Filter by User
- **Type:** Positive
- **Steps:**
  1. Open Filters, select a User, and Apply.
- **Expected Result:** Only report-generation events by that user are listed.

### TC-AL-005: Combine User + Date Range
- **Type:** Positive
- **Steps:**
  1. Apply User + Date Range together.
- **Expected Result:** Only that user's generations within the range are listed.

### TC-AL-006: Reset inside the Filters panel
- **Type:** Positive
- **Steps:**
  1. Make selections, then click Reset.
- **Expected Result:** All in-panel selections clear back to default.

### TC-AL-007: Clear All resets filters and chip
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** The table and Active Filters chip return to default (default date range).

### TC-AL-008: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-AL-009: Search by User Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type a full or partial User Name in the Search box.
- **Expected Result:** The table filters to matching users' activity.

### TC-AL-010: Search by Report Name
- **Type:** Positive
- **Steps:**
  1. Type a Report Name (e.g. "Lead Report") in the Search box.
- **Expected Result:** The table filters to generation events for that report.

### TC-AL-011: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-AL-012: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search is cleared and the full dataset is restored.

### TC-AL-013: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-AL-014: All 5 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 5 columns are present: Sr. No., Report Name, User Name, Action Date, Filters.

### TC-AL-015: Action Date shows date and time
- **Type:** Positive
- **Steps:**
  1. Inspect the Action Date column.
- **Expected Result:** The Action Date renders with both date and time (DD-MM-YYYY hh:mm AM/PM).

### TC-AL-016: Filters column shows correct key–value parameters
- **Type:** Positive
- **Steps:**
  1. Inspect the Filters column across different report types.
- **Expected Result:** Each entry shows the parameters used at generation as bold key + value pairs appropriate to the report (e.g. Lead Report → Form/To Date + User Type; Enquiry export → Type: isExcel; Service Slots → Is Excel + CountryInitial; Payment Balance → Type: Job).

### TC-AL-017: Report Name matches a real report
- **Type:** Positive
- **Steps:**
  1. Inspect the Report Name column.
- **Expected Result:** Each Report Name corresponds to a real report in the system (Lead, Enquiry, BreakDown, etc.).

### TC-AL-018: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Report Name, User Name, and Action Date headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-AL-019: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Audit Accuracy

### TC-AL-020: New report generation is logged
- **Type:** Positive
- **Steps:**
  1. In another tab, generate a report (e.g. Lead Report) with specific filters.
  2. Return to Activity Log and refresh.
- **Expected Result:** A new row appears with the correct Report Name, User Name, Action Date (≈ now), and matching Filters.

### TC-AL-021: Export is logged with type parameter
- **Type:** Positive
- **Steps:**
  1. Export a report (e.g. Enquiry) to Excel.
  2. Check the Activity Log entry.
- **Expected Result:** The entry records the export with a "Type/Is Excel" parameter.

### TC-AL-022: Logged filters match the ones used
- **Type:** Positive
- **Steps:**
  1. Generate a report with a known filter set.
  2. Inspect the corresponding Activity Log Filters column.
- **Expected Result:** The logged Filters exactly reflect the filters/options chosen at generation time.

---

## Test Suite 6: Pagination

### TC-AL-023: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly (default 25).

### TC-AL-024: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, and a specific page number.
- **Expected Result:** The correct records display for each navigation.

### TC-AL-025: Page count and Previous disabled on page 1
- **Type:** Positive
- **Steps:**
  1. Observe the page indicator and the Previous button on page 1.
- **Expected Result:** The count is accurate and Previous is disabled on page 1.

---

## Test Suite 7: UI/UX & Error Handling

### TC-AL-026: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-AL-027: Empty state when no activity matches
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state is shown.

### TC-AL-028: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The table scrolls and the Filters column wraps; controls remain usable.

### TC-AL-029: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-AL-030: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 8: Integrated Validation

### TC-AL-031: User + Date scope accuracy
- **Type:** Positive
- **Steps:**
  1. Filter by a User + Date Range.
- **Expected Result:** Only that user's generation events within the range are listed.

### TC-AL-032: Report Name search + Date filter accuracy
- **Type:** Positive
- **Steps:**
  1. Search a Report Name and apply a Date filter.
- **Expected Result:** Only that report's generations within range are listed.

### TC-AL-033: Reset workflow restores data
- **Type:** Positive
- **Steps:**
  1. Apply filters; verify the listing; click Clear All.
- **Expected Result:** The full audit list is restored.
