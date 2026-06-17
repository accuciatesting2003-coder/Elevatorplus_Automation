# Lead Report - Test Plan

## Overview
This test plan covers the **Lead Report** (`/reports/lead-report`), which provides real-time performance metrics and lead distribution. It presents lead data in a 13-column table and is headed by dynamic **Status Cards** (e.g. Enquiry Generated, Pending, Won) that render **only for statuses that have at least one matching record** in the current scope (a status with 0 records shows no card). The Status Cards are **display-only** (not clickable); filtering by status is done in the **Filter** panel via a **single-select Status button group** that lists **every configured lead status** (Enquiry Generated, Pending, Won, Lost, Cold, Hot, Warm, Close by Others, plus many custom statuses) — far more than the cards. Applying a status filters the table to that status and leaves **only that status's card** visible with its count. The report also supports **Filtering (Date Range, Sales Person, Status)**, real-time **Search**, **Manage Column** visibility control, **Export to Excel**, an **Active Filters** chip with **Clear All**, and **Pagination (10/25/50/100 rows)**. The **View** column ("For More Details") opens a per-lead detail view.

---

## Columns Summary (13)

Sr. No., View, Lead Date, Created By, Lead Name, Lead Source, Lead Source Name, Mobile Number, Firm Name, Site Name, Assign To, Touch Points, Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker |
| Sales Person | Searchable dropdown |
| Status | Button group |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-LR-001: Lead Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Lead Report.
- **Expected Result:** The page loads with the "Lead Report" heading, subtitle "Real-time performance metrics and lead distribution", status cards, data table, Search, Manage Column, Export, and Filter controls.

### TC-LR-002: Default date range applied on load
- **Type:** Positive
- **Steps:**
  1. Load the page and observe the Active Filters chip.
- **Expected Result:** A default date range is shown and the data reflects it.

---

## Test Suite 2: Status Cards

### TC-LR-003: Default card count matches table data (baseline)
- **Type:** Positive
- **Steps:**
  1. On load, note the count on each visible status card.
  2. For each status, count the rows carrying that status across all pages.
- **Expected Result:** The table count for each status exactly equals the stored card count.

### TC-LR-004: Apply each status displayed on the cards and verify count vs listing
- **Type:** Positive
- **Steps:**
  1. Note the statuses currently shown on the cards and their counts (e.g. Enquiry Generated, Pending, Won).
  2. Open Filter, select the first card status from the Status button group, and Apply.
  3. Verify the listing and the card, then repeat for each remaining card status.
- **Expected Result:** For every status shown on the cards: only rows of that status are listed, the table row count (across all pages) equals that status's card count, the Active Filters bar shows a status chip, and **only that status's card remains** visible (the other cards disappear because their count becomes 0 under the filter).

### TC-LR-004b: Status filter lists all configured statuses (not only carded ones)
- **Type:** Positive
- **Steps:**
  1. Open the Filter panel and inspect the Status button group.
  2. Apply a status that is NOT shown on the cards (e.g. Lost or a custom status with no records in range).
- **Expected Result:** The Status group lists every configured lead status (well beyond the 3 cards). Applying a status with no records in range yields an empty listing and no status card.

### TC-LR-005: Status card appears only when count ≥ 1
- **Type:** Positive
- **Steps:**
  1. Apply filters so a particular status has zero matching records.
- **Expected Result:** The card for that status is hidden (e.g. "Lost" is not shown when its count is 0).

### TC-LR-006: Card counts update dynamically when a filter is applied
- **Type:** Positive
- **Steps:**
  1. Note baseline card counts.
  2. Apply a Date or Sales Person filter.
- **Expected Result:** Every status card count updates to reflect only matching leads; now-empty cards disappear.

---

## Test Suite 3: Filtering

### TC-LR-007: Filter by Status (single-select button group)
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a status (e.g. "Won") from the Status button group, then select a different status (e.g. "Pending").
  2. Apply.
- **Expected Result:** The Status group is single-select — selecting a second status deselects the first (only one status active at a time). After Apply, only the selected status's leads are listed and the Active Filters chip reflects the selection.

### TC-LR-008: Filter by Sales Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, search and select a Sales Person, and Apply.
- **Expected Result:** Only leads assigned to that person are shown.

### TC-LR-009: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, pick a custom Date Range, and Apply.
- **Expected Result:** The Lead Date column values stay within the selected range.

### TC-LR-010: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Status + Sales Person + Date Range together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-LR-011: Reset inside the Filter panel
- **Type:** Positive
- **Steps:**
  1. Make selections in the Filter panel, then click Reset.
- **Expected Result:** All in-panel selections clear back to default (Status = "All").

### TC-LR-012: Clear All resets filters, cards, and chip
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** The table, status cards, and Active Filters chip return to the default state.

### TC-LR-013: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-LR-014: Search by Lead Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type a full or partial lead name in the Search box.
- **Expected Result:** All matching leads are returned.

### TC-LR-015: Search by Mobile Number
- **Type:** Positive
- **Steps:**
  1. Type a mobile number in the Search box.
- **Expected Result:** The exact matching record is returned.

### TC-LR-016: Search by Firm Name / Site Name
- **Type:** Positive
- **Steps:**
  1. Search by a Firm Name, then a Site Name.
- **Expected Result:** The table filters correctly to matching records.

### TC-LR-017: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters (`@`, `#`) and leading/trailing spaces.
- **Expected Result:** The system handles the input without crashing.

### TC-LR-018: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-LR-019: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear "No Records Found" empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-LR-020: All 13 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 13 columns are present: Sr. No., View, Lead Date, Created By, Lead Name, Lead Source, Lead Source Name, Mobile Number, Firm Name, Site Name, Assign To, Touch Points, Status.

### TC-LR-021: Manage Column hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Click Manage Column and toggle off a column (e.g. "Touch Points").
  2. Re-enable the column.
- **Expected Result:** The hidden column disappears and the layout adjusts; re-enabling restores it.

### TC-LR-022: Manage Column Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Column, use Select All / Reset.
- **Expected Result:** Select All shows all columns; Reset returns to the default column set.

### TC-LR-023: View opens the lead detail
- **Type:** Positive
- **Steps:**
  1. Click the "For More Details" icon in the View column of any row.
- **Expected Result:** The per-lead detail view opens with the correct lead.

### TC-LR-024: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect Lead Date, Mobile Number, and Status cells.
- **Expected Result:** Lead Date renders as DD-MM-YYYY, Mobile in "+91 XXXXX XXXXX" format, and Status as a coloured badge.

### TC-LR-025: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Lead Date, Lead Name, and Status headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder accordingly.

### TC-LR-026: Empty cells show placeholder
- **Type:** Positive
- **Steps:**
  1. Locate cells without a value.
- **Expected Result:** Empty cells render a "-" placeholder.

### TC-LR-027: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-LR-028: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-LR-029: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Date + Status filter and click Export.
- **Expected Result:** The Excel file contains exactly the rows shown on screen.

### TC-LR-030: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-LR-031: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** Headers match the table columns and Mobile Number is not rendered in scientific notation.

---

## Test Suite 7: Pagination

### TC-LR-032: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly (default 25).

### TC-LR-033: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, and a specific page number.
- **Expected Result:** The correct records display for each navigation.

### TC-LR-034: Page count and Previous disabled on page 1
- **Type:** Positive
- **Steps:**
  1. Observe "Page X of Y" and the Previous button on page 1.
- **Expected Result:** The count is accurate and Previous is disabled on page 1.

---

## Test Suite 8: UI/UX & Error Handling

### TC-LR-035: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe the table while data loads.
- **Expected Result:** A loading indicator is shown until data renders.

### TC-LR-036: Empty state when no leads match
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

### TC-LR-037: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The table scrolls horizontally and the status cards stack.

### TC-LR-038: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-LR-039: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-LR-040: Card count ↔ table synchronization per status
- **Type:** Positive
- **Steps:**
  1. Store each visible status card's count.
  2. For each status, apply it and compare the table count.
- **Expected Result:** The table lists only that status, the row count equals the stored card count, and the card count is unchanged after applying.

### TC-LR-041: Integrated filter + export
- **Type:** Positive
- **Steps:**
  1. Apply Date + Status; note the table count and matching card count.
  2. Export and open the file.
- **Expected Result:** The table count, matching card count, and exported rows all reconcile.

### TC-LR-042: Sales Person integration
- **Type:** Positive
- **Steps:**
  1. Select a Sales Person and Apply.
- **Expected Result:** The listing shows only that person's leads and all status card counts update accordingly.

### TC-LR-043: Reset workflow restores all data
- **Type:** Positive
- **Steps:**
  1. Apply a complex filter set; verify the listing updates.
  2. Click Clear All.
- **Expected Result:** The full dataset and all baseline status cards are restored.
