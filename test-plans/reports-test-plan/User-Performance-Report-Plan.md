# User Performance Report - Test Plan

## Overview
This test plan covers the **User Performance Report**, a high-level productivity tracking module that gives a quantitative analysis of individual staff performance by aggregating counts of key actions across modules (Sales, PMS, Service). It presents a 15-column table and supports real-time **Search (Name, Designation)**, **Filtering (Date Range, User Type)**, **Manage Columns** visibility control, and **Export to Excel**.

---

## Columns Summary (15)

Sr. No., Name, Designation, Lead Created, Enquiry Generated, Enquiries Finalised, Job Created, Follow-ups Created, Sales PM Created, Sales PM Finalised, Service PM Resolved, Confirm PM Variations, Breakdown Resolved, Repair Order Created, Repair Order Completed.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Custom, Today, This Month, etc.) |
| User Type | Dropdown (Admin, Sales Executive, Service Engineer, etc.) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-UP-001: User Performance Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > User Performance Report.
- **Expected Result:** The page loads with the heading, data table, Search, Manage Columns, Export, and Filter controls.

---

## Test Suite 2: Data Accuracy & Counts

### TC-UP-002: Column counts match actual records
- **Type:** Positive
- **Steps:**
  1. Select a specific user and date range.
  2. Manually count their "Enquiry Generated" in the Enquiry module for that period.
- **Expected Result:** The count shown in the report matches the actual records created by that user in that module.

### TC-UP-003: Counts update when Date Range changes
- **Type:** Positive
- **Steps:**
  1. Change the filter from "This Month" to "Today".
- **Expected Result:** The count columns (Lead Created, Job Created, etc.) change to reflect only the new range's actions.

### TC-UP-004: Zero displayed for no activity
- **Type:** Positive
- **Steps:**
  1. Locate a user with no activity in a category (e.g. a new hire with no Repair Orders).
- **Expected Result:** The column displays `0` rather than remaining blank or showing an error.

---

## Test Suite 3: Filtering

### TC-UP-005: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/This Month), and Apply.
- **Expected Result:** The counts reflect only actions within the selected range.

### TC-UP-006: Filter by User Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a User Type (e.g. Service Engineer), and Apply.
- **Expected Result:** Only users of that type are listed (e.g. Sales-only staff are hidden).

### TC-UP-007: Combine Date Range + User Type
- **Type:** Positive
- **Steps:**
  1. Apply Date Range + User Type together.
- **Expected Result:** Only users meeting both criteria are listed with counts for the range.

### TC-UP-008: Clear All resets filters
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** Filters reset to default and the original unfiltered user list with baseline counts is restored.

### TC-UP-009: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-UP-010: Search by Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Search a full or partial name (e.g. "Aman").
- **Expected Result:** Matching users (e.g. "Aman Sharma", "Aman Varma") are returned.

### TC-UP-011: Search by Designation
- **Type:** Positive
- **Steps:**
  1. Search a Designation (e.g. "Manager").
- **Expected Result:** Only staff with that designation are listed.

### TC-UP-012: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-UP-013: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-UP-014: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-UP-015: All 15 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 15 columns are present: Sr. No., Name, Designation, Lead Created, Enquiry Generated, Enquiries Finalised, Job Created, Follow-ups Created, Sales PM Created, Sales PM Finalised, Service PM Resolved, Confirm PM Variations, Breakdown Resolved, Repair Order Created, Repair Order Completed.

### TC-UP-016: Manage Columns hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Open Manage Columns and toggle off some metric columns.
  2. Re-enable them.
- **Expected Result:** Hidden columns disappear and the layout adjusts; re-enabling restores them.

### TC-UP-017: Manage Columns Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Columns, click Reset / Select All.
- **Expected Result:** The table restores all 15 columns.

### TC-UP-018: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect the numeric metric columns and the Name/Designation text columns.
- **Expected Result:** Numeric counts are right-aligned and consistent; Name/Designation text displays correctly.

### TC-UP-019: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the "Lead Created" header (and Name).
- **Expected Result:** The table sorts users from highest to lowest (and vice-versa) for the chosen metric.

### TC-UP-020: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-UP-021: Export full performance dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all users and counts; it is not empty.

### TC-UP-022: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Date + User Type filter and click Export.
- **Expected Result:** The Excel file contains only the filtered subset of users and their respective counts.

### TC-UP-023: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-UP-024: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The column headers are identical to the UI and counts are exported as numeric values (not text).

---

## Test Suite 7: Pagination

### TC-UP-025: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-UP-026: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-UP-027: Pagination state maintained after sorting
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort a column.
- **Expected Result:** The pagination state is maintained appropriately after sorting.

---

## Test Suite 8: UI/UX & Performance

### TC-UP-028: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-UP-029: Empty state when no users match
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state is displayed.

### TC-UP-030: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** A smooth horizontal scroll keeps all 15 metric columns accessible.

### TC-UP-031: Load time with large user list
- **Type:** Positive
- **Steps:**
  1. Load the report with a large staff list (e.g. 500+ members).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 9: Error Handling

### TC-UP-032: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a server timeout while loading performance data.
- **Expected Result:** A user-friendly error message/toast is shown and the UI does not crash.

### TC-UP-033: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 10: Integrated Validation

### TC-UP-034: Date Range filter updates all count columns
- **Type:** Positive
- **Steps:**
  1. Apply a Date Range filter.
- **Expected Result:** All count columns (Lead, Enquiry, Job, etc.) update accurately for the range.

### TC-UP-035: User Type + Name search accuracy and export consistency
- **Type:** Positive
- **Steps:**
  1. Filter by User Type and search a Name.
  2. Export and compare.
- **Expected Result:** The result accurately reflects both criteria and the exported file matches the UI.

### TC-UP-036: Cross-module synchronization
- **Type:** Positive
- **Steps:**
  1. Perform a new action elsewhere (e.g. resolve a Breakdown).
  2. Refresh or re-apply the filter on the report.
- **Expected Result:** The corresponding count increments to reflect the new action.

### TC-UP-037: Reset workflow restores data
- **Type:** Positive
- **Steps:**
  1. Apply complex filters; verify the listing.
  2. Click Clear All.
- **Expected Result:** The original unfiltered user list and baseline counts are restored.
