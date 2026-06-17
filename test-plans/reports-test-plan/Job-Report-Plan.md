# Job Report - Test Plan

## Overview
This test plan covers the **Job Report**, a central hub for managing and tracking the lifecycle of installation jobs. It presents job data in a 15-column table, headed by high-level **Status Cards (Pending, Work in Progress, Completed, On Hold, HO Checklist Done, Hold by Customer, Cancelled, Material Delivered)** plus a **Total** card. Unlike the Lead/Enquiry reports, **all status cards are always displayed — including those with a count of 0** — and the cards are **clickable**: clicking a status card filters the table to that status. The **Total** card equals the sum of all status counts, and after any filter is applied every card recomputes to the filtered subset (non-matching statuses show 0 and Total reflects the filtered count). The report also supports advanced **Filtering (Date Range, Enquiry Type, City, Branch, Area, Lift Type, Job Status)**, real-time **Search (Site Name, Firm Name, Quotation Number, Job Number, City Name)**, **Manage Columns** visibility control, **Export to Excel**, and **Pagination**. The **View** column opens a per-job detail view.

---

## Columns Summary (15)

Sr. No., View Option, Job ID, Job Enquiry Date, Job Start Date, Job Completion Date, City, Firm Name, Site Engineer Name, Site Name, Material Dispatch Date, Material Arrival Date, Wing Name, Lift Type, Job Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Custom, Today, Yesterday, etc.) |
| Enquiry Type | Dropdown |
| City | Dropdown |
| Branch | Dropdown |
| Area | Dropdown |
| Lift Type | Dropdown |
| Job Status | Button group / dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-JB-001: Job Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Job Report.
- **Expected Result:** The page loads with the heading, status cards, data table, Search, Manage Columns, Export, and Filter controls.

---

## Test Suite 2: Status Cards

### TC-JB-002: All status cards always visible (including zero counts) + Total card
- **Type:** Positive
- **Steps:**
  1. Load the report and inspect the card row.
- **Expected Result:** All status cards are shown — Pending, Work in Progress, Completed, On Hold, HO Checklist Done, Hold by Customer, Cancelled, Material Delivered — **including any with a count of 0** — plus a **Total** card.

### TC-JB-002b: Total card equals the sum of all status cards
- **Type:** Positive
- **Steps:**
  1. Add up every status card's count.
  2. Compare with the Total card.
- **Expected Result:** The Total card equals the sum of all individual status card counts (e.g. 13 + 5 + 1 + 1 = 20).

### TC-JB-002c: Card counts match table data
- **Type:** Positive
- **Steps:**
  1. For a status (e.g. Completed), count the rows with that status across all pages.
  2. Compare with that status's card count.
- **Expected Result:** Each card's count matches the number of table rows carrying that status.

### TC-JB-003: Clicking a status card filters the table by that status
- **Type:** Positive
- **Steps:**
  1. Click a status card (e.g. "Completed").
- **Expected Result:** The table filters to only that status's jobs (row count = the clicked card's count), an Active Filters status chip appears, every other status card recomputes to 0, and the Total card now shows the filtered count.

### TC-JB-003b: Cards recompute when a non-status filter is applied
- **Type:** Positive
- **Steps:**
  1. Note baseline card counts.
  2. Apply a filter (e.g. City or Lift Type) from the Filter panel.
- **Expected Result:** All status card counts (and Total) recompute to reflect only the matching jobs.

---

## Test Suite 3: Filtering

### TC-JB-004: Filter by Job Status
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Job Status (e.g. Completed), and Apply.
- **Expected Result:** Only jobs with that status are listed.

### TC-JB-005: Filter by City / Branch / Area
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a City, Branch, and/or Area, and Apply.
- **Expected Result:** The list narrows correctly to the selected geography.

### TC-JB-006: Filter by Lift Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Lift Type, and Apply.
- **Expected Result:** Only jobs of the selected lift type are listed.

### TC-JB-007: Filter by Enquiry Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select an Enquiry Type, and Apply.
- **Expected Result:** Only jobs of the selected enquiry type are listed.

### TC-JB-008: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/Last 7 Days), and Apply.
- **Expected Result:** Records outside the selected range are excluded.

### TC-JB-009: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Status + City + Lift Type together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-JB-010: Clear All resets filters and cards
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** All dropdowns and search fields reset to default and the cards return to baseline.

### TC-JB-011: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 4: Search Functionality

### TC-JB-012: Search by Job Number / Quotation Number
- **Type:** Positive
- **Steps:**
  1. Search for a specific Job ID, then a Quotation Number.
- **Expected Result:** The exact matching record is returned.

### TC-JB-013: Search by Site Name / Firm Name
- **Type:** Positive
- **Steps:**
  1. Search by a Firm Name (e.g. "Elevator Corp"), then a Site Name (e.g. "Site A").
- **Expected Result:** Matching results are returned.

### TC-JB-014: Search by City Name
- **Type:** Positive
- **Steps:**
  1. Search by a City Name.
- **Expected Result:** The table filters to jobs in that city.

### TC-JB-015: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-JB-016: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-JB-017: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 5: Data Table & Grid

### TC-JB-018: All 15 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 15 columns are present: Sr. No., View Option, Job ID, Job Enquiry Date, Job Start Date, Job Completion Date, City, Firm Name, Site Engineer Name, Site Name, Material Dispatch Date, Material Arrival Date, Wing Name, Lift Type, Job Status.

### TC-JB-019: View opens job details
- **Type:** Positive
- **Steps:**
  1. Click the "View" icon/option on a row.
- **Expected Result:** The job's detailed view page or modal opens for the correct job.

### TC-JB-020: Manage Columns hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Open Manage Columns and hide "Wing Name" and "Material Dispatch Date".
- **Expected Result:** The hidden columns disappear from the table.

### TC-JB-021: Manage Columns Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Columns, click Reset / Select All.
- **Expected Result:** The table restores all 15 columns.

### TC-JB-022: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect the date columns and Job Status cells.
- **Expected Result:** Dates follow the system format (DD-MM-YYYY) and Job Status renders as colour-coded badges.

### TC-JB-023: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Date, Job ID, and Status headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-JB-024: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Site Name or Firm Name value.
- **Expected Result:** A tooltip reveals the full text.

### TC-JB-025: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 6: Export Feature

### TC-JB-026: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-JB-027: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Date + Job Status filter and click Export.
- **Expected Result:** The Excel file contains only jobs matching the filter, exactly as shown on screen.

### TC-JB-028: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-JB-029: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The file contains all 15 columns as headers and the data matches the table.

---

## Test Suite 7: Pagination

### TC-JB-030: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-JB-031: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-JB-032: Pagination state maintained after sorting
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort a column.
- **Expected Result:** The pagination state is maintained appropriately after sorting.

---

## Test Suite 8: UI/UX & Performance

### TC-JB-033: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-JB-034: Empty state when no jobs exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A "No Records Found" message is displayed.

### TC-JB-035: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** A horizontal scrollbar is present for the 15-column table and cards lay out appropriately.

### TC-JB-036: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset (e.g. 1000+ jobs).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 9: Error Handling

### TC-JB-037: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** An error toast/alert is shown and the UI does not crash.

### TC-JB-038: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 10: Integrated Validation

### TC-JB-039: Date + Job Status filter + export consistency
- **Type:** Positive
- **Steps:**
  1. Apply Date Range + City + Job Status; note the table and card counts.
  2. Export and open the file.
- **Expected Result:** The table count, card counts, and exported file all synchronize.

### TC-JB-040: City + Lift Type card synchronization
- **Type:** Positive
- **Steps:**
  1. Filter by City + Lift Type.
- **Expected Result:** The status card counts synchronize with the filtered listing.

### TC-JB-041: Job Number search + Area filter accuracy
- **Type:** Positive
- **Steps:**
  1. Search by a Job Number and apply an Area filter.
- **Expected Result:** The result accurately reflects both criteria.
