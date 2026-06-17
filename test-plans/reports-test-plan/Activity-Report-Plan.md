# Activity Report - Test Plan

## Overview
This test plan covers the **Activity Report**, which provides an audit trail of all sales and follow-up activities and lets management track sales-team engagement. It presents data in an 11-column table and features specialized **Category Filters (All Activities, Missed Activities, Upcoming Activities)**, advanced **Filtering (Date Range, Sales Person, Type, Follow-up Status, Activity Status)**, real-time **Search (Created By Name, Branch Name, Firm Name, Site Name)**, **Manage Columns** visibility control, **Export to Excel**, and **Pagination**.

---

## Columns Summary (11)

Sr. No., Sales Person, Next Follow-up Date, Branch Name, Firm Name, Site Name, Notes, Type, Activity Status, Assigned To, Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Category | Tabs/buttons (All / Missed / Upcoming Activities) |
| Date Range | Date range picker (Custom, Today, Yesterday, etc.) |
| Sales Person | Searchable dropdown |
| Type | Dropdown (Call, Meeting, etc.) |
| Follow-up Status | Dropdown |
| Activity Status | Dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-AR-001: Activity Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Activity Report.
- **Expected Result:** The page loads with the heading, the category filters, data table, Search, Manage Columns, Export, and Filter controls.

---

## Test Suite 2: Activity Categories

### TC-AR-002: Missed Activities shows only past, incomplete activities
- **Type:** Positive
- **Steps:**
  1. Click the "Missed Activities" category.
- **Expected Result:** Only activities whose Next Follow-up Date is before today AND whose status is not "Completed" are displayed.

### TC-AR-003: Upcoming Activities shows only future-dated activities
- **Type:** Positive
- **Steps:**
  1. Click the "Upcoming Activities" category.
- **Expected Result:** Only activities with future Next Follow-up Dates are listed.

### TC-AR-004: All Activities shows the complete dataset
- **Type:** Positive
- **Steps:**
  1. Click the "All Activities" category.
- **Expected Result:** The complete set of activities is displayed.

---

## Test Suite 3: Filtering

### TC-AR-005: Filter by Sales Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Sales Person, and Apply.
- **Expected Result:** Only that sales person's activities are shown.

### TC-AR-006: Filter by Activity Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Type (e.g. Call, Meeting), and Apply.
- **Expected Result:** Only activities of the selected type are listed.

### TC-AR-007: Filter by Follow-up Status / Activity Status
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Follow-up Status and/or Activity Status, and Apply.
- **Expected Result:** Only activities matching the selected status are listed.

### TC-AR-008: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/Yesterday), and Apply.
- **Expected Result:** The Next Follow-up Date column reflects the selected range.

### TC-AR-009: Combine Category + Sales Person + Date Range
- **Type:** Positive
- **Steps:**
  1. Select a category, then apply Sales Person + Date Range together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-AR-010: Clear All resets filters and category
- **Type:** Positive
- **Steps:**
  1. Apply multiple filters (e.g. Type = Call + Status = Pending).
  2. Click Clear All.
- **Expected Result:** The table returns to the "All Activities" state with no filters applied.

### TC-AR-011: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-AR-012: Search by Created By Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type a full or partial creator name (e.g. "Admin").
- **Expected Result:** All activities logged by that user are listed.

### TC-AR-013: Search by Branch Name
- **Type:** Positive
- **Steps:**
  1. Type a Branch Name in the Search box.
- **Expected Result:** The table filters to that branch's activities.

### TC-AR-014: Search by Firm Name / Site Name
- **Type:** Positive
- **Steps:**
  1. Search by a Firm Name, then a Site Name.
- **Expected Result:** The table filters correctly to matching records.

### TC-AR-015: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-AR-016: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-AR-017: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-AR-018: All 11 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 11 columns are present: Sr. No., Sales Person, Next Follow-up Date, Branch Name, Firm Name, Site Name, Notes, Type, Activity Status, Assigned To, Status.

### TC-AR-019: Manage Columns hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Open Manage Columns and toggle off columns (e.g. "Notes", "Assigned To").
  2. Re-enable them.
- **Expected Result:** Hidden columns disappear and the layout adjusts; re-enabling restores them.

### TC-AR-020: Manage Columns Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Columns, use Select All / Reset.
- **Expected Result:** Select All shows all columns; Reset returns to the default column set.

### TC-AR-021: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect the Next Follow-up Date and Status cells.
- **Expected Result:** The date renders in a readable format (DD-MM-YYYY) and Status uses correct colour-coded badges.

### TC-AR-022: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Next Follow-up Date and Sales Person headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-AR-023: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Notes or Firm Name value.
- **Expected Result:** A tooltip reveals the full text.

### TC-AR-024: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-AR-025: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-AR-026: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply "Missed Activities" + a Sales Person, then Export.
- **Expected Result:** The Excel file contains exactly the records shown on screen.

### TC-AR-027: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-AR-028: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The exported headers match the 11 columns and the data is correctly typed.

---

## Test Suite 7: Pagination

### TC-AR-029: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-AR-030: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-AR-031: Pagination state maintained after sorting
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort a column.
- **Expected Result:** The pagination state is maintained appropriately after sorting.

---

## Test Suite 8: UI/UX & Performance

### TC-AR-032: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-AR-033: Empty state when no activities exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state illustration/message is displayed.

### TC-AR-034: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The 11-column table scrolls horizontally and controls remain usable.

### TC-AR-035: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset (e.g. 1000+ activities).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 9: Error Handling

### TC-AR-036: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** An error toast/alert is shown instead of a crash.

### TC-AR-037: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation warning.

---

## Test Suite 10: Integrated Validation

### TC-AR-038: Date + Activity Status filter + export consistency
- **Type:** Positive
- **Steps:**
  1. Apply Date Range + Activity Status; note the table count.
  2. Export and open the file.
- **Expected Result:** The table count is accurate and the exported file matches the UI data row-for-row.

### TC-AR-039: Missed Activities + Sales Person export match
- **Type:** Positive
- **Steps:**
  1. Filter by "Missed Activities" for a specific branch + Sales Person.
  2. Export and compare.
- **Expected Result:** The Excel file contains exactly the records shown on screen.

### TC-AR-040: Multiple filters + Clear All restores data
- **Type:** Positive
- **Steps:**
  1. Apply a complex filter set (Missed + Sales Person + Type); verify the listing updates.
  2. Click Clear All.
- **Expected Result:** The full original dataset is re-displayed.

### TC-AR-041: Search Firm Name + Type filter + export accuracy
- **Type:** Positive
- **Steps:**
  1. Search by Firm Name and apply a Type filter.
  2. Export and compare.
- **Expected Result:** The result and exported content accurately reflect the combined criteria.
