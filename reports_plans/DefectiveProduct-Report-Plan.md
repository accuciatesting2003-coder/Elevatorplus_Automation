# Defective Product Report Comprehensive Test Plan

## Application Overview

The Defective Product Report module allows users to track and manage defective, damaged, and surplus products across different warehouses. It provides a detailed view of product issues to help in inventory reconciliation and quality control. The report features a data table with 4 core columns: **Sr. No., Product Name, Unit, and Product Quantity.** Users can manage data through **Filters (Date Range, Warehouse, Status)**, **Search (Product Name, Unit)**, **Pagination**, and **Export to Excel** capabilities.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Warehouse (Single selection) | Positive |
| 1.2 | Filtering | Filter by Status (Defective, Damaged, Surplus) | Positive |
| 1.3 | Filtering | Filter by Date Range (Custom, Today, Last 7 Days) | Positive |
| 1.4 | Filtering | Combine Warehouse + Status + Date Range | Positive |
| 1.5 | Filtering | Apply filter with 0 matching records | Negative |
| 1.6 | Filtering | Verify "Clear All" resets Warehouse, Status, and Date | Positive |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Product Name (Exact & Partial) | Positive |
| 2.2 | Search | Search by Unit (e.g., Kg, Pcs, Box) | Positive |
| 2.3 | Search | Search with special characters (e.g., "Product-A") | Positive |
| 2.4 | Search | Search with no results found | Negative |
| 2.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of all 4 mandatory columns | Positive |
| 3.2 | Grid | Verify data accuracy for "Product Quantity" (Decimals/Integers) | Positive |
| 3.3 | Grid | Sr. No. increments correctly across pages | Positive |
| 3.4 | Grid | Column Sorting (Ascending/Descending for Product Name/Quantity) | Positive |
| 3.5 | Grid | Tooltips for long Product Names | Positive |
| **4** | **Export Feature** | | |
| 4.1 | Export | Export full dataset to Excel | Positive |
| 4.2 | Export | Export filtered dataset (Specific Warehouse + Damaged Status) | Positive |
| 4.3 | Export | Export with 0 records (Verify empty file/alert) | Negative |
| 4.4 | Export | Verify exported file formatting matches UI headers | Positive |
| **5** | **Pagination** | | |
| 5.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 5.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 5.3 | Pagination | Verify pagination state is maintained after applying filters | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify loading state (Spinner) during data fetch | Positive |
| 6.2 | UI/UX | Verify empty state UI when no data exists | Positive |
| 6.3 | UI/UX | Mobile Responsiveness (Horizontal scroll for table) | Positive |
| 6.4 | Performance | Load time with large dataset (e.g., 500+ defect entries) | Positive |
| **7** | **Error Handling** | | |
| 7.1 | Error | API failure/Timeout handling | Negative |
| 7.2 | Error | Invalid Date Range (Start Date > End Date) | Negative |
| **8** | **Integrated Validation** | | |
| 8.1 | Integrated | Apply Warehouse Filter + Search Product → Verify accuracy | Positive |
| 8.2 | Integrated | Apply All Filters (Warehouse + Status + Date) → Verify UI & Export consistency | Positive |
| 8.3 | Integrated | Search by Unit + Apply Status Filter → Verify results | Positive |

**Total: 31 tests | 8 suites | 26 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1. Warehouse Filter:** Select a specific warehouse (e.g., "Main Warehouse"). Verify that the list only displays products currently stored in that location.
*   **1.2. Status Filter:** Select "Surplus". Verify that only products marked as surplus are shown.
*   **1.3. Date Range:** Select a date range where no products were reported. Verify the "No Data Found" message appears.

### 2. Search Functionality
*   **2.1. Product Search:** Enter a partial name (e.g., "Pipe"). The list should update in real-time or upon pressing Enter to show all pipes.
*   **2.2. Unit Search:** Searching for "Box" should filter the list to products measured in boxes.

### 3. Data Table & Grid
*   **3.1. Column Audit:** Ensure the following columns are present and data is correctly aligned: Sr. No., Product Name, Unit, Product Quantity.
*   **3.2. Quantity Check:** Ensure "Product Quantity" correctly displays zeros or negative values if the system allows them, and that units are consistent with the search/filter.

### 4. Export Feature
*   **4.2. Filtered Export:** Apply a filter for "Damaged" products in "Warehouse B". Click Export. The resulting Excel file must contain only those specific damaged items, matching the screen's row count.
*   **4.4. Formatting:** Open the exported Excel file and verify that the column headers match the UI exactly and that the "Product Quantity" is exported as a numeric value, not text.

### 5. Pagination
*   **5.1. Row Limit:** Change rows to 50. If there are 45 records, verify pagination buttons are disabled.
*   **5.3. Filter Persistence:** Go to page 2, apply a Warehouse filter. Verify the table resets to page 1 to show the new filtered results.

### 7. Error Handling
*   **7.2. Date Validation:** Attempt to select an End Date that is before the Start Date. The system should either prevent the selection or show a validation error message.

### 8. Integrated Validation
*   **8.2. Comprehensive Workflow:** 
    1. Apply all available filters: Select a specific **Warehouse**, a **Status** (e.g., Defective), and a **Date Range**.
    2. Verify the table displays correct data matching all three criteria simultaneously.
    3. Click the **Export** button.
    4. Open the exported Excel file and verify that the data (Product Name, Unit, Quantity) and row count exactly match the UI listing.
