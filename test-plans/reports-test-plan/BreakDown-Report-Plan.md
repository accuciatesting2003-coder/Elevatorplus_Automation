# Breakdown Report - Test Plan

## Overview
This test plan covers the **Breakdown Report** (`/reports/break-down-report`), which provides a complete operational view of all elevator breakdown records and their resolution lifecycle. The page is headed by dynamic **Status Cards** (e.g. Elevator Started, Shutdown) that render **only for statuses that have at least one matching record** in scope (statuses with 0 records show no card). The cards are **display-only**; filtering by status is done in the **Filter** panel via a **single-select Status button group** that lists **every configured breakdown status** (Elevator Started, Shutdown, Live, On Hold, Pause, plus custom statuses) — more than the cards. It presents a wide data table of **28 columns**, supports advanced **Filtering**, real-time **Search**, **Manage Column** visibility control, **Export to Excel**, an **Active Filters** chip with **Clear All**, and **Pagination**. The **View** column ("For More Details") opens a per-breakdown detail view.

---

## Columns Summary (28)

Sr. No., View, BreakDown Number, PM Number, Job Number, One Time Service Number, Firm Name, Site Name, Wing Name, Lift Name, Contact Person Name, Contact Number, Breakdown Reported Date, Breakdown Resolved Date, Technician Name, Resolve By, BreakDown Complaint, Note for team, Note for Customer, Breakdown Priority Status, Time To Attend, Time To Resolve, Breakdown Pending Duration, Site Visit Count, Breakdown Category, Issues, Status, Created By Person.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Breakdown Reported Date) |
| Technician Name | Searchable dropdown |
| Created By Person | Searchable dropdown |
| Branch | Button group |
| Area | Button group (cascading) |
| City | Button group |
| Category | Searchable dropdown |
| Breakdown Issues | Searchable dropdown |
| Status | Button group (Elevator Started, Shutdown, Live, On Hold, Pause, etc.) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-BD-001: Breakdown Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in to the admin panel.
  2. Navigate to Reports > BreakDown Report.
- **Expected Result:** The page loads with the "Breakdown Report" heading, subtitle "View and manage all breakdown records", status cards, data table, Search, Manage Column, Export, and Filter controls visible.

### TC-BD-002: Default date range is applied on load
- **Type:** Positive
- **Steps:**
  1. Navigate to the Breakdown Report.
  2. Observe the Active Filters chip.
- **Expected Result:** A default date range (current month) is shown in the Active Filters chip and the data reflects that range.

---

## Test Suite 2: Status Cards

### TC-BD-003: Status card count matches table row count for that status
- **Type:** Positive
- **Steps:**
  1. On load, note the count on each visible status card (e.g. Elevator Started, Shutdown).
  2. For one status, count the rows carrying that status across all pages.
- **Expected Result:** The table row count for that status exactly equals the stored card count.

### TC-BD-004: Apply each status displayed on the cards and verify count vs listing
- **Type:** Positive
- **Steps:**
  1. Note the statuses shown on the cards and their counts (e.g. Elevator Started, Shutdown).
  2. Open Filter, select the first card status from the Status button group, and Apply; verify the listing and card.
  3. Repeat for each remaining card status.
- **Expected Result:** For every status shown on the cards: only rows of that status are listed, the table row count equals that status's card count, the Active Filters bar shows a status chip, and only that status's card remains visible.

### TC-BD-005: Status card is hidden when its count is zero
- **Type:** Positive
- **Steps:**
  1. Apply filters so that a particular status has no matching records.
- **Expected Result:** The card for that status is not rendered (cards appear only when at least one record exists).

### TC-BD-006: Cards update dynamically when a filter is applied
- **Type:** Positive
- **Steps:**
  1. Note baseline card counts.
  2. Apply a Date/Branch/Technician filter.
- **Expected Result:** Every status card count updates to reflect only the matching breakdowns; now-empty cards disappear.

---

## Test Suite 3: Filtering

### TC-BD-007: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, pick a custom Date Range, and Apply.
- **Expected Result:** Only breakdowns whose Reported Date falls within the range are listed; the Active Filters chip reflects the range.

### TC-BD-008: Filter by Technician Name
- **Type:** Positive
- **Steps:**
  1. Open Filter, search and select a Technician Name, and Apply.
- **Expected Result:** Only breakdowns assigned to that technician are listed.

### TC-BD-009: Filter by Created By Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Created By Person, and Apply.
- **Expected Result:** Only breakdowns created by that person are listed.

### TC-BD-010: Filter by Branch / Area / City
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Branch, then an Area and City where applicable, and Apply.
- **Expected Result:** The listing narrows to the selected geography; Area/City options correspond to the chosen Branch.

### TC-BD-011: Filter by Breakdown Category
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Category, and Apply.
- **Expected Result:** Only breakdowns of that category are listed.

### TC-BD-012: Filter by Breakdown Issues
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Breakdown Issue, and Apply.
- **Expected Result:** Only breakdowns reporting that issue are listed.

### TC-BD-013: Filter by Status (single-select, all statuses listed)
- **Type:** Positive
- **Steps:**
  1. Open Filter and inspect the Status button group (lists all configured statuses, incl. Live, On Hold, Pause and custom statuses beyond the cards).
  2. Select a status (e.g. Elevator Started), then select a different one to confirm single-select, and Apply.
- **Expected Result:** The group lists every configured breakdown status and is single-select. After Apply, only breakdowns of the selected status are listed.

### TC-BD-014: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Open Filter, select Status + Technician + Date Range together, and Apply.
- **Expected Result:** Only records meeting all selected criteria are displayed.

### TC-BD-015: Reset inside the Filter panel
- **Type:** Positive
- **Steps:**
  1. Make several selections in the Filter panel.
  2. Click Reset.
- **Expected Result:** All in-panel selections clear back to default (Status = All, etc.).

### TC-BD-016: Clear All resets filters, cards, and chip
- **Type:** Positive
- **Steps:**
  1. Apply several filters.
  2. Click Clear All.
- **Expected Result:** The table, status cards, and Active Filters chip return to the default state.

### TC-BD-017: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No records found" empty state is shown and no status cards remain.

---

## Test Suite 4: Search Functionality

### TC-BD-018: Search by BreakDown Number
- **Type:** Positive
- **Steps:**
  1. Type a valid BreakDown Number in the Search box.
- **Expected Result:** Only the matching breakdown(s) are listed.

### TC-BD-019: Search by Job / PM / One Time Service Number
- **Type:** Positive
- **Steps:**
  1. Search by a Job Number, then a PM Number, then a One Time Service Number.
- **Expected Result:** The listing filters to the breakdowns associated with the searched number.

### TC-BD-020: Search by Firm Name / Site Name
- **Type:** Positive
- **Steps:**
  1. Search by a Firm Name, then a Site Name.
- **Expected Result:** The table filters to matching firm/site breakdowns.

### TC-BD-021: Search by Contact Number / Technician Name
- **Type:** Positive
- **Steps:**
  1. Search by a Contact Number, then a Technician Name.
- **Expected Result:** Matching records are listed.

### TC-BD-022: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces in the Search box.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-BD-023: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-BD-024: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear "No records found" empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-BD-025: All 28 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header (scroll horizontally as needed).
- **Expected Result:** All 28 columns listed in the Columns Summary are present.

### TC-BD-026: Manage Column hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Click Manage Column.
  2. Toggle off a column (e.g. "Note for team") and confirm.
  3. Re-enable the column.
- **Expected Result:** The hidden column disappears from the table and the layout adjusts; re-enabling restores it.

### TC-BD-027: Manage Column Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Column, use Select All / Reset.
- **Expected Result:** Select All shows all columns; Reset returns to the default column set.

### TC-BD-028: View opens the breakdown detail
- **Type:** Positive
- **Steps:**
  1. Click the "For More Details" icon in the View column of any row.
- **Expected Result:** The per-breakdown detail view opens with the correct record's data.

### TC-BD-029: Data formatting (dates, badges)
- **Type:** Positive
- **Steps:**
  1. Inspect Reported/Resolved Date, Priority, and Status cells.
- **Expected Result:** Dates render as DD-MM-YYYY, and Priority/Status render as coloured badges.

### TC-BD-030: Priority labels render correctly
- **Type:** Positive
- **Steps:**
  1. Inspect the Breakdown Priority Status column across rows.
- **Expected Result:** Priority values (Low, Medium, ManTrap (Very High), and any custom priorities) display correctly.

### TC-BD-031: Duration fields are human-readable
- **Type:** Positive
- **Steps:**
  1. Inspect Time To Attend, Time To Resolve, and Breakdown Pending Duration.
- **Expected Result:** Durations display as readable text (e.g. "4 days 22 hours 52 minutes").

### TC-BD-032: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Reported Date, Status, and Priority column headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder accordingly.

### TC-BD-033: Empty cells show placeholder
- **Type:** Positive
- **Steps:**
  1. Locate cells without a value.
- **Expected Result:** Empty cells render a "-" placeholder.

### TC-BD-034: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-BD-035: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-BD-036: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Status + Date filter and click Export.
- **Expected Result:** The Excel file contains exactly the rows shown on screen.

### TC-BD-037: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) is produced or an appropriate alert is shown — no crash.

### TC-BD-038: Exported file formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** Headers match the table columns; numbers/phone fields are not in scientific notation.

---

## Test Suite 7: Pagination

### TC-BD-039: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly (default 25).

### TC-BD-040: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, and a specific page number.
- **Expected Result:** The correct records display for each navigation.

### TC-BD-041: Page count and Previous disabled on page 1
- **Type:** Positive
- **Steps:**
  1. Observe "Page X of Y" and the Previous button on page 1.
- **Expected Result:** The count is accurate and Previous is disabled on page 1.

---

## Test Suite 8: UI/UX & Error Handling

### TC-BD-042: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe the table while it loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-BD-043: Empty state when no breakdowns match
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

### TC-BD-044: Mobile responsiveness with wide table
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The 28-column table scrolls horizontally; cards stack; Manage Column helps control width.

### TC-BD-045: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-BD-046: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-BD-047: Card count ↔ table synchronization per status
- **Type:** Positive
- **Steps:**
  1. Store each visible status card's count.
  2. For each status, apply it and compare the table count.
- **Expected Result:** The table lists only that status, the row count equals the stored card count, and the card count is unchanged after applying.

### TC-BD-048: Integrated filter + export
- **Type:** Positive
- **Steps:**
  1. Apply Date + Status; note the table count and matching card count.
  2. Export to Excel and open the file.
- **Expected Result:** The table count, matching card count, and exported rows all reconcile.

### TC-BD-049: Technician + Branch integration
- **Type:** Positive
- **Steps:**
  1. Select a Technician + Branch and Apply.
- **Expected Result:** The listing reflects only that technician's breakdowns in that branch and the status cards update accordingly.

### TC-BD-050: Reset workflow restores all data
- **Type:** Positive
- **Steps:**
  1. Apply a complex filter set; verify the listing updates.
  2. Click Clear All.
- **Expected Result:** The full dataset and all baseline status cards are restored.
