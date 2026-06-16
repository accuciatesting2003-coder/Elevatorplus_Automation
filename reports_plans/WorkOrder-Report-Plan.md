# Work Order Report Comprehensive Test Plan

## Application Overview

The Work Order Report module is designed to track contractor work orders, financial transactions, and completion statuses. It provides a comprehensive view of work order progress and payment history. The module features **Status Cards (Pending, Confirm, Completed)** for quick count summaries, a detailed data table with **Action items (View, Download)**, a financial **Footer Summary**, and robust **Filtering (Contractor Name, Date Range, Status)** and **Search (Contractor Name, Job Number, Work Order Number)** capabilities.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Status Cards** | | |
| 1.1 | Status Cards | Verify count for "Pending" matches table data | Positive |
| 1.2 | Status Cards | Verify count for "Confirm" matches table data | Positive |
| 1.3 | Status Cards | Verify count for "Completed" matches table data | Positive |
| 1.4 | Status Cards | Verify cards update dynamically when filters are applied | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Contractor Name | Positive |
| 2.2 | Filtering | Filter by Status: "Pending" (Verify count and listing) | Positive |
| 2.3 | Filtering | Filter by Status: "Confirm" (Verify count and listing) | Positive |
| 2.4 | Filtering | Filter by Status: "Completed" (Verify count and listing) | Positive |
| 2.5 | Filtering | Filter by Date Range (Created At) | Positive |
| 2.6 | Filtering | Combine multiple filters (Contractor + Status) | Positive |
| 2.7 | Filtering | Verify "Clear All" resets all filters and status cards | Positive |
| 2.8 | Filtering | Filter with no matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Work Order Number | Positive |
| 3.2 | Search | Search by Contractor Name | Positive |
| 3.3 | Search | Search by Job Number | Positive |
| 3.4 | Search | Search with no results found | Negative |
| **4** | **Data Table & Actions** | | |
| 4.1 | Grid | Verify visibility of all columns: Sr. No., Action, Work Order No., Contractor Name, Job No., Created At, Total Amount, Paid Amount, Pending Amount, Status | Positive |
| 4.2 | Actions | **View:** Verify clicking "View" opens work order details | Positive |
| 4.3 | Actions | **Download:** Verify clicking "Download" triggers PDF/Excel download | Positive |
| 4.4 | Grid | Verify status badge colors (e.g., Orange: Pending, Blue: Confirm, Green: Completed) | Positive |
| 4.5 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Financial Footer Summary** | | |
| 5.1 | Footer | Verify **Total Amount** sum matches the filtered records | Positive |
| 5.2 | Footer | Verify **Paid Amount** sum matches the filtered records | Positive |
| 5.3 | Footer | Verify **Pending Amount** sum matches the filtered records | Positive |
| 5.4 | Footer | Verify **Assigned Stages** count matches | Positive |
| 5.5 | Footer | Verify **Assigned Phases** count matches | Positive |
| 5.6 | Footer | Verify footer totals update dynamically when filters change | Positive |
| **6** | **Export Feature** | | |
| 6.1 | Export | Export current filtered view to Excel | Positive |
| 6.2 | Export | Verify Excel includes all table columns and financial data | Positive |
| 6.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| **7** | **Pagination** | | |
| 7.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 7.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| **8** | **UI/UX & Error Handling** | | |
| 8.1 | UI/UX | Verify loading state during data fetch | Positive |
| 8.2 | UI/UX | Mobile Responsiveness (Horizontal scrolling for wide table) | Positive |
| 8.3 | Error | API failure/Timeout handling | Negative |
| 8.4 | Error | Invalid Date Range selection | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Multiple Filters (Contractor + Date + Status) -> Verify table intersection | Positive |
| 9.2 | Integrated | Multiple Filters -> Verify Status Cards and Footer Summary sync correctly | Positive |
| 9.3 | Integrated | Multiple Filters -> Export to Excel -> Verify data matches filtered UI | Positive |
| 9.4 | Integrated | Individual Status Cycle -> Apply Pending, then Confirm, then Completed -> Verify listing and count accuracy at each step | Positive |

**Total: 40 tests | 9 suites | 35 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Status Cards
*   **1.1-1.3. Count Consistency:** Manually count rows for a specific status (e.g., Pending) and compare with the number shown on the corresponding Status Card.
*   **1.4. Dynamic Logic:** Apply a filter for "Contractor A". Ensure the "Confirm" card count only reflects Contractor A's confirmed work orders.

### 2. Filtering
*   **2.2-2.4. Status Accuracy:** Selecting a status (e.g., "Pending") must update the listing to show *only* records with that status. Verify the total row count matches the number shown on the status card at the top.
*   **2.7. Reset:** Clicking "Clear All" should restore all records and reset the Footer Summary to global totals.

### 3. Search Functionality
*   **3.1. Work Order ID:** Search for "WO-123". Ensure only that specific work order appears.
*   **3.3. Job Sync:** Searching for a Job Number should return all work orders associated with that job.

### 4. Data Table & Actions
*   **4.1. Financial Precision:** Verify that `Total Amount - Paid Amount = Pending Amount` for every row.
*   **4.3. Download Integrity:** Download a work order and verify the content (PDF/Excel) matches the UI data.

### 5. Financial Footer Summary
*   **5.1-5.3. Calculation Logic:** Sum the "Total Amount" column of all visible rows and verify it matches the "Total Amount" shown in the footer.
*   **5.6. Filter Sync:** If a filter reduces the list to 2 rows, the footer totals must reflect only those 2 rows.

### 6. Export Feature
*   **6.2. Column Audit:** Ensure the exported file contains the Work Order Number, Contractor Name, Job Number, and all financial columns.

### 7. Pagination
*   **7.1. Row limits:** Verify that changing rows per page correctly re-calculates the number of total pages.

### 8. UI/UX & Error Handling
*   **8.3. Resilience:** If the network is disconnected, verify the system shows a "Network Error" toast instead of crashing.

### 9. Integrated Validation
*   **9.1. Multi-Filter Accuracy:** Apply "Contractor: XYZ Builders" + "Status: Confirm" + "Date: Last Month". Verify the table only displays records that meet **all three** criteria.
*   **9.2. Global Sync:** With multiple filters active, ensure the **Status Cards** at the top and the **Footer Summary** at the bottom both update to reflect only the currently filtered subset of data.
*   **9.3. Export Integrity:** Export to Excel while multiple filters are active. Verify the Excel file contains the exact same records and financial totals as the filtered UI.
*   **9.4. Status Filter Cycle:** 
    1. Select "Pending": Verify list has only Pending items and count matches "Pending" card.
    2. Select "Confirm": Verify list has only Confirm items and count matches "Confirm" card.
    3. Select "Completed": Verify list has only Completed items and count matches "Completed" card.
