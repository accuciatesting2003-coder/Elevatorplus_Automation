# Defective Product Report - Test Plan

## Overview
This test plan covers the **Defective Product Report**, which lets users track and manage defective, damaged, and surplus products across warehouses for inventory reconciliation and quality control. It presents a 4-column table and supports **Filtering (Date Range, Warehouse, Status)**, real-time **Search (Product Name, Unit)**, **Export to Excel**, and **Pagination**.

---

## Columns Summary (4)

Sr. No., Product Name, Unit, Product Quantity.

## Filters Summary

| Filter | Type |
|--------|------|
| Date Range | Date range picker (Custom, Today, Last 7 Days) |
| Warehouse | Dropdown (single selection) |
| Status | Dropdown (Defective, Damaged, Surplus) |

---

## Test Cases

---

## Test Suite 1: Page Load & Navigation

### TC-DP-001: Defective Product Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in and navigate to Reports > Defective Product Report.
- **Expected Result:** The page loads with the heading, data table, Search, Export, and Filter controls.

---

## Test Suite 2: Filtering

### TC-DP-002: Filter by Warehouse
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a warehouse (e.g. "Main Warehouse"), and Apply.
- **Expected Result:** The list shows only products stored in that warehouse.

### TC-DP-003: Filter by Status
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a Status (e.g. Surplus), and Apply.
- **Expected Result:** Only products marked with that status are shown.

### TC-DP-004: Filter by Date Range
- **Type:** Positive
- **Steps:**
  1. Open Filter, select a custom range (or Today/Last 7 Days), and Apply.
- **Expected Result:** Only products reported within the range are listed.

### TC-DP-005: Combine Warehouse + Status + Date Range
- **Type:** Positive
- **Steps:**
  1. Apply Warehouse + Status + Date Range together.
- **Expected Result:** Only records meeting all three criteria are displayed.

### TC-DP-006: Filter with zero matching records
- **Type:** Negative
- **Steps:**
  1. Select a date range (or combination) where no products were reported.
- **Expected Result:** A "No Data Found" empty state is shown.

### TC-DP-007: Clear All resets filters
- **Type:** Positive
- **Steps:**
  1. Apply filters, then click Clear All.
- **Expected Result:** Warehouse, Status, and Date reset to default and the full dataset is restored.

---

## Test Suite 3: Search Functionality

### TC-DP-008: Search by Product Name (exact & partial)
- **Type:** Positive
- **Steps:**
  1. Enter a full or partial product name (e.g. "Pipe").
- **Expected Result:** The list updates to show all matching products.

### TC-DP-009: Search by Unit
- **Type:** Positive
- **Steps:**
  1. Search by a Unit (e.g. "Box", "Kg", "Pcs").
- **Expected Result:** The list filters to products measured in that unit.

### TC-DP-010: Search with special characters
- **Type:** Positive
- **Steps:**
  1. Enter a value with special characters (e.g. "Product-A").
- **Expected Result:** The system handles the input gracefully without crashing.

### TC-DP-011: Search with no results
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist.
- **Expected Result:** A clear empty state is displayed.

### TC-DP-012: Search cleared on Clear All
- **Type:** Positive
- **Steps:**
  1. Enter a search term, then click Clear All.
- **Expected Result:** The search box is cleared and the full dataset is restored.

---

## Test Suite 4: Data Table & Grid

### TC-DP-013: All 4 columns are visible
- **Type:** Positive
- **Steps:**
  1. Inspect the table header.
- **Expected Result:** All 4 columns are present and aligned: Sr. No., Product Name, Unit, Product Quantity.

### TC-DP-014: Product Quantity data accuracy
- **Type:** Positive
- **Steps:**
  1. Inspect the Product Quantity column across rows.
- **Expected Result:** Quantities display correctly as integers/decimals (including zero/negative if allowed) with units consistent with the filter/search.

### TC-DP-015: Sr. No. increments across pages
- **Type:** Positive
- **Steps:**
  1. Note Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages.

### TC-DP-016: Column sorting works
- **Type:** Positive
- **Steps:**
  1. Click the Product Name and Product Quantity headers.
- **Expected Result:** Each click toggles ascending/descending sort and rows reorder.

### TC-DP-017: Tooltips for long Product Names
- **Type:** Positive
- **Steps:**
  1. Hover over a long Product Name value.
- **Expected Result:** A tooltip reveals the full name.

---

## Test Suite 5: Export Feature

### TC-DP-018: Export full dataset to Excel
- **Type:** Positive
- **Steps:**
  1. With no filters applied, click Export.
- **Expected Result:** An Excel file downloads containing all current records; it is not empty.

### TC-DP-019: Export filtered dataset
- **Type:** Positive
- **Steps:**
  1. Apply a Warehouse + Damaged Status filter and click Export.
- **Expected Result:** The Excel file contains only those damaged items, matching the on-screen row count.

### TC-DP-020: Export with zero records
- **Type:** Negative
- **Steps:**
  1. Apply a filter that yields no records and click Export.
- **Expected Result:** An empty file (headers only) or an appropriate alert is produced — no crash.

### TC-DP-021: Exported formatting and headers
- **Type:** Positive
- **Steps:**
  1. Export and open the file.
- **Expected Result:** Column headers match the UI exactly and Product Quantity is exported as a numeric value (not text).

---

## Test Suite 6: Pagination

### TC-DP-022: Change rows per page
- **Type:** Positive
- **Steps:**
  1. Change the Rows per page selector to 10, 25, 50, 100.
- **Expected Result:** The table re-chunks accordingly; with fewer records than the page size, pagination controls are disabled.

### TC-DP-023: Navigate pages
- **Type:** Positive
- **Steps:**
  1. Click Next, Previous, First, and Last pages.
- **Expected Result:** The correct records display for each navigation.

### TC-DP-024: Pagination resets/maintains correctly after filtering
- **Type:** Positive
- **Steps:**
  1. Go to page 2, then apply a Warehouse filter.
- **Expected Result:** The table resets to page 1 to show the new filtered results.

---

## Test Suite 7: UI/UX & Performance

### TC-DP-025: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a filter and observe while data loads.
- **Expected Result:** A spinner loading state is shown until data renders.

### TC-DP-026: Empty state when no data exists
- **Type:** Positive
- **Steps:**
  1. Apply filters that yield zero records.
- **Expected Result:** A clear empty state is displayed.

### TC-DP-027: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small viewport.
- **Expected Result:** The table scrolls horizontally and controls remain usable.

### TC-DP-028: Load time with large dataset
- **Type:** Positive
- **Steps:**
  1. Load the report with a large dataset (e.g. 500+ defect entries).
- **Expected Result:** The report loads within an acceptable time without freezing.

---

## Test Suite 8: Error Handling

### TC-DP-029: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate a network/API failure while loading.
- **Expected Result:** A friendly error message/toast is shown instead of a crash.

### TC-DP-030: Invalid Date Range (Start > End)
- **Type:** Negative
- **Steps:**
  1. Attempt to set an End Date before the Start Date.
- **Expected Result:** The system prevents the selection or shows a validation error.

---

## Test Suite 9: Integrated Validation

### TC-DP-031: Warehouse filter + product search accuracy
- **Type:** Positive
- **Steps:**
  1. Apply a Warehouse filter and search a product name.
- **Expected Result:** The result accurately reflects both criteria.

### TC-DP-032: All filters + export consistency
- **Type:** Positive
- **Steps:**
  1. Apply Warehouse + Status (e.g. Defective) + Date Range; verify the table matches all three.
  2. Export and open the file.
- **Expected Result:** The exported data (Product Name, Unit, Quantity) and row count exactly match the UI listing.

### TC-DP-033: Unit search + Status filter accuracy
- **Type:** Positive
- **Steps:**
  1. Search by a Unit and apply a Status filter.
- **Expected Result:** The results reflect both criteria accurately.
