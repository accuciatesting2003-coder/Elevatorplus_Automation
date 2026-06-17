# Payment Balance Report - Test Plan

## Overview
This test plan covers the **Payment Balance Report**, which lets users view and track outstanding payment balances by site and firm. It presents a 15-column financial table and supports advanced **Filtering (Date Range, Payment Type, City, Area, Assigned Person)**, real-time **Search (Firm Name, Site Name, City)**, **Export to Excel**, and **Pagination**.

---

## Columns Summary (15)

Sr. No., Site Name, Firm Name, Quotation No., Job No., Total Payment, Remaining Payment, Contact Person Name, Contact Person Number, Area, Assigned Person, Payment Terms, Committed Date, City, Notes.

## Filters Summary

| Filter | Type |
|--------|------|
| Payment Type | Dropdown (Job, PM, Repair Order, One Time Service) |
| Date Range | Date range picker (Custom, Today, Yesterday, etc.) |
| City | Dropdown |
| Area | Dropdown |
| Assigned Person | Searchable dropdown |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-PB-001: Payment Balance Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Payment Balance Report.
- **Expected Result:** The page loads with the heading, data table, Search, Export, and Filter controls.

---

## Test Suite 2: Filtering

### TC-PB-002: Filter by Payment Type
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Payment Type (e.g. PM or Repair Order), and Apply.
- **Expected Result:** The balance list is correctly filtered to the selected payment type.

### TC-PB-003: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a preset (e.g. Last 30 Days) or custom range, and Apply.
- **Expected Result:** Records are filtered based on the transaction/committed date within the range.

### TC-PB-004: Filter by City / Area
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a City and/or Area, and Apply.
- **Expected Result:** The list narrows to the selected city/area.

### TC-PB-005: Filter by Assigned Person
- **Type:** Positive
- **Steps:**
  1. Open Filter, select an Assigned Person, and Apply.
- **Expected Result:** The list shows only balances assigned to that person.

### TC-PB-006: Combine multiple filters
- **Type:** Positive
- **Steps:**
  1. Apply Type + City + Assigned Person together.
- **Expected Result:** Only records meeting all criteria are displayed.

### TC-PB-007: Clear All resets filters and search
- **Type:** Positive
- **Steps:**
  1. Apply filters and a search term, then click Clear All.
- **Expected Result:** All dropdowns reset to "Select", the search bar clears, and the table restores all records.

### TC-PB-008: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Apply a filter combination known to match no records.
- **Expected Result:** A clear "No Records Found" empty state is shown.

---

## Test Suite 3: Search Functionality

### TC-PB-009: Search by Firm Name
- **Type:** Positive
- **Steps:**
  1. Search for a Firm Name (e.g. "ABC Corp").
- **Expected Result:** All associated payment records are returned.

### TC-PB-010: Search by Site Name
- **Type:** Positive
- **Steps:**
  1. Search for a Site Name (e.g. "Sunrise Apartments").
- **Expected Result:** All associated payment records are returned.

### TC-PB-011: Search by City
- **Type:** Positive
- **Steps:**
  1. Search for a City (e.g. "Mumbai" or "Pune").
- **Expected Result:** The grid filters correctly to that city.

### TC-PB-012: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters and leading/trailing spaces.
- **Expected Result:** The system handles input gracefully without crashing.

### TC-PB-013: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

### TC-PB-014: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-PB-015: All 15 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 15 columns are present: Sr. No., Site Name, Firm Name, Quotation No., Job No., Total Payment, Remaining Payment, Contact Person Name, Contact Person Number, Area, Assigned Person, Payment Terms, Committed Date, City, Notes.

### TC-PB-016: Currency formatting for payment amounts
- **Type:** Positive
- **Steps:**
  1. Inspect the Total Payment and Remaining Payment columns.
- **Expected Result:** Amounts display with correct currency formatting.

### TC-PB-017: Financial accuracy of Remaining Payment
- **Type:** Positive
- **Steps:**
  1. For several rows, compare Total Payment minus any paid amount against Remaining Payment.
- **Expected Result:** Total Payment − paid amount equals the Remaining Payment for each row.

### TC-PB-018: Contact details display correctly
- **Type:** Positive
- **Steps:**
  1. Inspect the Contact Person Name and Contact Person Number columns.
- **Expected Result:** Contact names are accurate and mobile numbers are formatted correctly.

### TC-PB-019: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Remaining Payment, Committed Date, and Job No. headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-PB-020: Tooltips for long text
- **Type:** Positive
- **Steps:**
  1. Hover over a long Notes or Payment Terms value.
- **Expected Result:** A tooltip reveals the full text.

### TC-PB-021: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

---

## Test Suite 5: Export Feature

### TC-PB-022: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-PB-023: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Payment Type + Area filter and click Export.
- **Expected Result:** The Excel file matches the filtered UI exactly.

### TC-PB-024: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-PB-025: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** The file contains all 15 columns as headers and the data matches the table.

---

## Test Suite 6: Pagination

### TC-PB-026: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly.

### TC-PB-027: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-PB-028: Pagination state maintained after sorting/filtering
- **Type:** Positive
- **Steps:**
  1. Navigate to page 2, then sort or filter.
- **Expected Result:** The pagination state is maintained appropriately.

---

## Test Suite 7: UI/UX & Performance

### TC-PB-029: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner/skeleton loading state is shown until data renders.

### TC-PB-030: Empty state when no records exist
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A "No Records Found" message is displayed.

### TC-PB-031: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** Horizontal scrolling keeps all 15 columns accessible.

### TC-PB-032: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset of payment balances.
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 8: Error Handling

### TC-PB-033: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading payment data.
- **Expected Result:** An error toast/alert is shown and the UI does not crash.

### TC-PB-034: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set a Start Date after the End Date.
- **Expected Result:** The system prevents the search or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-PB-035: Payment Type filter accuracy
- **Type:** Positive
- **Steps:**
  1. Apply a Payment Type filter (e.g. "Repair Order").
  2. Inspect every row in the result.
- **Expected Result:** Every row in the resulting table belongs to the selected payment type.

### TC-PB-036: Payment Type filter + export synchronization
- **Type:** Positive
- **Steps:**
  1. Apply a Payment Type filter (e.g. "Job").
  2. Export and open the file.
- **Expected Result:** The Excel file contains the exact same count and data as the filtered UI.

### TC-PB-037: Multi-filter logic
- **Type:** Positive
- **Steps:**
  1. Apply Type: PM + City: Mumbai + Date Range: Last 7 Days.
- **Expected Result:** The table only shows records satisfying all three conditions simultaneously.

### TC-PB-038: Global reset restores data
- **Type:** Positive
- **Steps:**
  1. Apply multiple filters and a search, then click Clear All.
- **Expected Result:** The table repopulates with the full original record set and all filter UI elements return to default.
