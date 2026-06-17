# Quotation Report - Test Plan

## Overview
This test plan covers the **Quotation Report**, a centralized tracking system for generated quotations and their financial estimates. It presents quotation data in a 16-column table and supports advanced **Filtering (Date Range, Enquiry Type, City, Sales Person, Branch, Area)**, real-time **Search (Owner Name, Quotation Number)**, **Manage Column** visibility control, per-row **Download** actions, **Export to Excel**, and **Pagination**.

---

## Columns Summary (16)

Sr. No., Download Quotation, City, Site Name, CP Name, CP Number, Floor Structure, Estimate Cost (without tax), International Payment Amount, Type of Lift, Executive Name, Assign Person Name, Lead Source, Lead Source Name, Created Via, Status.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Custom, Today, Yesterday, etc.) |
| Enquiry Type | Dropdown |
| City | Dropdown |
| Sales Person | Searchable dropdown |
| Branch | Dropdown |
| Area | Dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-QR-001: Quotation Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Quotation Report.
- **Expected Result:** The page loads with the heading, data table, Search, Manage Column, Export, and Filter controls.

---

## Test Suite 2: Filtering

### TC-QR-002: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/Yesterday), and Apply.
- **Expected Result:** Only quotations generated within the selected start and end dates are displayed.

### TC-QR-003: Filter by Enquiry Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select an Enquiry Type, and Apply.
- **Expected Result:** Only quotations of the selected enquiry type are listed.

### TC-QR-004: Filter by City
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a City (e.g. "Ahmedabad"), and Apply.
- **Expected Result:** Records from all other cities are excluded.

### TC-QR-005: Filter by Sales Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Sales Person, and Apply.
- **Expected Result:** Only that sales person's quotations are listed.

### TC-QR-006: Filter by Branch
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Branch, and Apply.
- **Expected Result:** Only that branch's quotations are listed.

### TC-QR-007: Filter by Area
- **Type:** Positive
- **Steps:**
  1. Open Filter, select an Area, and Apply.
- **Expected Result:** Only quotations belonging to the selected area are listed.

### TC-QR-008: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply City + Sales Person + Area together.
- **Expected Result:** The resulting list strictly meets all three criteria.

### TC-QR-009: Clear All resets all filters
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** The table returns to the full unfiltered list and all dropdowns reset to default.

### TC-QR-010: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-QR-011: Search by Owner Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Type an owner name (e.g. "Kunal").
- **Expected Result:** All quotations where Assign Person Name or Executive Name matches are returned.

### TC-QR-012: Search by Quotation Number
- **Type:** Positive
- **Steps:**
  1. Search for a specific Quotation Number (e.g. "QTN-102").
- **Expected Result:** The exact matching record is returned.

### TC-QR-013: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-QR-014: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-QR-015: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-QR-016: All 16 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 16 columns are present: Sr. No., Download Quotation, City, Site Name, CP Name, CP Number, Floor Structure, Estimate Cost (without tax), International Payment Amount, Type of Lift, Executive Name, Assign Person Name, Lead Source, Lead Source Name, Created Via, Status.

### TC-QR-017: Download a quotation PDF
- **Type:** Positive
- **Steps:**
  1. Click the "Download" icon/link in a row.
- **Expected Result:** A PDF of that quotation is generated and downloaded to the local system.

### TC-QR-018: Manage Columns hides/shows columns
- **Type:** Positive
- **Steps:**
  1. Open Manage Columns and uncheck "Floor Structure" and "Created Via".
- **Expected Result:** The unchecked columns disappear from the grid immediately.

### TC-QR-019: Manage Columns Select All / Reset behaviour
- **Type:** Positive
- **Steps:**
  1. In Manage Columns, click Reset / Select All.
- **Expected Result:** The table restores all 16 columns.

### TC-QR-020: Data formatting
- **Type:** Positive
- **Steps:**
  1. Inspect the Estimate Cost and CP Number cells.
- **Expected Result:** Estimate Cost displays with currency formatting and CP Number is formatted correctly as a mobile number.

### TC-QR-021: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Date, Name, and Cost headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-QR-022: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Site Name or Lead Source Name value.
- **Expected Result:** A tooltip reveals the full text.

### TC-QR-023: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Export Feature

### TC-QR-024: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-QR-025: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Date + City filter and click Export.
- **Expected Result:** The Excel file contains exactly the rows shown on screen.

### TC-QR-026: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-QR-027: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The exported Excel contains all 16 column headers exactly as in the UI and the data matches.

---

## Test Suite 6: Pagination

### TC-QR-028: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly (e.g. 25 shows a maximum of 25 records per page).

### TC-QR-029: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-QR-030: Pagination state maintained after sorting
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort a column.
- **Expected Result:** The pagination state is maintained appropriately after sorting.

---

## Test Suite 7: UI/UX & Performance

### TC-QR-031: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-QR-032: Empty state when no quotations exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A "No Records Found" illustration/message is displayed.

### TC-QR-033: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a tablet/mobile screen.
- **Expected Result:** The 16-column table remains scrollable and the Download button stays accessible.

### TC-QR-034: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset (e.g. 1000+ quotations).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 8: Error Handling

### TC-QR-035: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a loss of connection during data fetch.
- **Expected Result:** A clear error message/toast is shown and the UI does not crash.

### TC-QR-036: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a logically impossible date range (Start after End).
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-QR-037: Date + City filter + export consistency
- **Type:** Positive
- **Steps:**
  1. Apply Date + City filters; verify the table listing.
  2. Export and open the file.
- **Expected Result:** The table shows the correct filtered list and the exported file matches this subset exactly.

### TC-QR-038: Quotation Number search + Sales Person filter accuracy
- **Type:** Positive
- **Steps:**
  1. Search by a Quotation Number and apply a Sales Person filter.
- **Expected Result:** The result accurately reflects both criteria.

### TC-QR-039: Area filter export accuracy
- **Type:** Positive
- **Steps:**
  1. Select a specific Area and Export.
- **Expected Result:** Every record in the table and the resulting export belongs to that area.
