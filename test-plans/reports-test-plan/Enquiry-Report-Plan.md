# Enquiry Report - Test Plan

## Overview
This test plan covers the **Enquiry Report**, a detailed tracking system for enquiries and their associated quotations. It presents enquiry data in a 17-column table, headed by high-level **Status Cards (Quotation Raised, Pending, Finalized, Closed by Others)** that render only for statuses with at least one matching record in scope. The cards are **display-only** (not clickable); filtering by status is done in the **Filter** panel via a **single-select Enquiry Status button group** that lists **every configured enquiry status** (Quotation Raised, Pending, Finalized, Closed by Others, Cancelled, Lost, Updated, plus custom statuses) — more than the cards. The report also supports advanced **Filtering (Date Range, Enquiry Type, City, Sales Person, Branch, Enquiry Status, Follow-up Status)**, real-time **Search (Quotation Number, Contact Person Name)**, **Manage Columns** visibility control, **Export to Excel**, and **Pagination**. The **VIEW Quotation** column opens the associated quotation.

---

## Columns Summary (17)

Sr. No., VIEW Quotation, Enquiry Date, Firm Name, Site Name, Contact Person Name, Contact Person Number, City, Branch, Area, Lead Source, Executive Name, Assigned To, Quotation Number, Quotation Status, Modernisation, Enquiry Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Custom, Today, Yesterday, etc.) |
| Enquiry Type | Dropdown |
| City | Dropdown |
| Branch | Dropdown |
| Sales Person | Searchable dropdown |
| Enquiry Status | Button group / dropdown |
| Follow-up Status | Dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-EN-001: Enquiry Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Enquiry Report.
- **Expected Result:** The page loads with the heading, status cards, data table, Search, Manage Columns, Export, and Filter controls.

---

## Test Suite 2: Status Cards

### TC-EN-002: Apply each status displayed on the cards and verify count vs listing
- **Type:** Positive
- **Steps:**
  1. Note the statuses shown on the cards and their counts (e.g. Quotation Raised, Pending, Finalized, Closed by Others).
  2. Open Filter, select the first card status from the Enquiry Status button group, and Apply; verify the listing and card.
  3. Repeat for each remaining card status.
- **Expected Result:** For every status shown on the cards: only enquiries of that status are listed, the table row count (across all pages) equals that status's card count, the Active Filters bar shows a status chip, and only that status's card remains visible.

### TC-EN-003: Cards update dynamically when a filter is applied
- **Type:** Positive
- **Steps:**
  1. Note baseline card counts.
  2. Apply a filter (e.g. City or Sales Person).
- **Expected Result:** All status card counts update to reflect only the enquiries matching the criteria.

---

## Test Suite 3: Filtering

### TC-EN-004: Filter by Enquiry Status (single-select, all statuses listed)
- **Type:** Positive
- **Steps:**
  1. Open Filter and inspect the Enquiry Status button group (lists all configured statuses, incl. Cancelled, Lost, Updated, and custom statuses beyond the cards).
  2. Select a status (e.g. Finalized), then select a different one to confirm single-select, and Apply.
- **Expected Result:** The group lists every configured enquiry status and is single-select (a new selection replaces the prior). After Apply, only enquiries with the selected status are listed.

### TC-EN-005: Filter by Follow-up Status
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Follow-up Status, and Apply.
- **Expected Result:** Only enquiries with the chosen follow-up status are retrieved.

### TC-EN-006: Filter by Sales Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Sales Person, and Apply.
- **Expected Result:** Only that sales person's enquiries are listed.

### TC-EN-007: Filter by City / Branch
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a City and/or Branch, and Apply.
- **Expected Result:** The table filters and the cards update for the selected city/branch only.

### TC-EN-008: Filter by Enquiry Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select an Enquiry Type, and Apply.
- **Expected Result:** Only enquiries of the selected type are listed.

### TC-EN-009: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/Last 7 Days/This Month), and Apply.
- **Expected Result:** Records outside the selected range are excluded.

### TC-EN-010: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Status + Sales Person + City together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-EN-011: Clear All resets filters and cards
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** All dropdowns, date pickers, and search fields reset to default and the cards return to baseline.

### TC-EN-012: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-EN-013: Search by Quotation Number (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type a full or partial Quotation Number (e.g. "QTN/2024/001").
- **Expected Result:** The specific matching enquiry record(s) are returned.

### TC-EN-014: Search by Contact Person Name
- **Type:** Positive
- **Steps:**
  1. Type a contact person name (e.g. "Rahul").
- **Expected Result:** All enquiries associated with that contact person are returned.

### TC-EN-015: Search by Firm Name / Site Name
- **Type:** Positive
- **Steps:**
  1. Search by a Firm Name, then a Site Name.
- **Expected Result:** The table filters correctly to matching records.

### TC-EN-016: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-EN-017: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-EN-018: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-EN-019: All 17 columns are visible and in order
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 17 columns are present in order: Sr. No., VIEW Quotation, Enquiry Date, Firm Name, Site Name, Contact Person Name, Contact Person Number, City, Branch, Area, Lead Source, Executive Name, Assigned To, Quotation Number, Quotation Status, Modernisation, Enquiry Status.

### TC-EN-020: Manage Columns hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Open Manage Columns and uncheck "City" and "Branch".
- **Expected Result:** The unchecked columns are immediately hidden from the table.

### TC-EN-021: Manage Columns Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Columns, click Reset / Select All.
- **Expected Result:** The table restores all 17 columns.

### TC-EN-022: VIEW Quotation opens correctly
- **Type:** Positive
- **Steps:**
  1. Click the "VIEW" option/icon on a row.
- **Expected Result:** The quotation details open / the quotation document is shown for the correct enquiry.

### TC-EN-023: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect Enquiry Date, Contact Person Number, and Status cells.
- **Expected Result:** Dates follow the system format (DD-MM-YYYY), phone numbers display correctly, and statuses use the correct labels/badges.

### TC-EN-024: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Enquiry Date, Name, and Status headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-EN-025: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Firm Name or Site Name value.
- **Expected Result:** A tooltip reveals the full text.

### TC-EN-026: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-EN-027: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-EN-028: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Date + Enquiry Status filter and click Export.
- **Expected Result:** The Excel file contains exactly the rows shown on screen.

### TC-EN-029: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-EN-030: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The file contains all 17 columns as headers and the data matches the table row-for-row.

---

## Test Suite 7: Pagination

### TC-EN-031: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-EN-032: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-EN-033: Pagination state maintained after sorting
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort a column.
- **Expected Result:** The pagination state is maintained appropriately after sorting.

---

## Test Suite 8: UI/UX & Performance

### TC-EN-034: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-EN-035: Empty state when no enquiries exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A user-friendly "No Records Found" message is displayed.

### TC-EN-036: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** A horizontal scrollbar is present for the 17-column table and the cards lay out appropriately.

### TC-EN-037: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset (e.g. 1000+ enquiries).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 9: Error Handling

### TC-EN-038: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** An error toast/alert is shown and the UI does not crash.

### TC-EN-039: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 10: Integrated Validation

### TC-EN-040: Date + Enquiry Status filter + export consistency
- **Type:** Positive
- **Steps:**
  1. Apply Date Range + City + Enquiry Status; note the table and card counts.
  2. Export and open the file.
- **Expected Result:** The table count, card count, and exported file all synchronize.

### TC-EN-041: Quotation Status filter + card sync
- **Type:** Positive
- **Steps:**
  1. Filter by a Quotation Status.
- **Expected Result:** The table listing and the status cards update consistently.

### TC-EN-042: Quotation Number search + City filter accuracy
- **Type:** Positive
- **Steps:**
  1. Search by a Quotation Number and apply a City filter.
- **Expected Result:** The result accurately reflects both criteria.

### TC-EN-043: Branch + Sales Person card synchronization
- **Type:** Positive
- **Steps:**
  1. Filter by Branch + Sales Person.
- **Expected Result:** The status card counts synchronize with the filtered listing.
