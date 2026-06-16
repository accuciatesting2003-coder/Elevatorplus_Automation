# Travel Allowance Report Comprehensive Test Plan

## Application Overview

The Travel Allowance Report module tracks and maintains employee travel distance data. This report provides a detailed breakdown of travel records, where the data table dynamically adjusts its columns based on the selected date range. The primary columns include **Sr. No., Emp Code, Emp Name, and Designation**, followed by **Dynamic Date Columns** (e.g., 01-Jun, 02-Jun, etc.) showing distance values. The module features **Filtering (Date Range, Employee selection)**, **Search (Emp Name, Designation, Emp Code)**, **Export to Excel**, and **Pagination**.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Date Range (Verify dynamic date columns appear in table) | Positive |
| 1.2 | Filtering | Filter by Specific Employee | Positive |
| 1.3 | Filtering | Combine Date Range + Employee Filter | Positive |
| 1.4 | Filtering | Verify "Clear All" resets filters and table columns to default | Positive |
| 1.5 | Filtering | Apply Date Range with no travel data recorded | Negative |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Employee Code | Positive |
| 2.2 | Search | Search by Employee Name | Positive |
| 2.3 | Search | Search by Designation | Positive |
| 2.4 | Search | Search with partial strings (e.g., "Eng" for "Engineer") | Positive |
| 2.5 | Search | Search with no results found | Negative |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of mandatory columns (Sr. No., Emp Code, Emp Name, Designation) | Positive |
| 3.2 | Grid | Verify Date Columns match the selected Date Range filter | Positive |
| 3.3 | Grid | Verify data accuracy (Distance values match employee records for specific dates) | Positive |
| 3.4 | Grid | Horizontal scrolling for wide date ranges (e.g., Monthly view) | Positive |
| 3.5 | Grid | Sr. No. increments correctly across pages | Positive |
| **4** | **Export Feature** | | |
| 4.1 | Export | Export dataset to Excel with current filters | Positive |
| 4.2 | Export | Verify Excel file includes all dynamic date columns | Positive |
| 4.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 4.4 | Export | Verify exported data matches the table UI exactly | Positive |
| **5** | **Pagination** | | |
| 5.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 5.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 5.3 | Pagination | Verify pagination state is maintained after search/filter | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 6.2 | UI/UX | Verify empty state UI when no records exist | Positive |
| 6.3 | Performance | Load time with large date range (e.g., 31 days for 100+ employees) | Positive |
| **7** | **Error Handling** | | |
| 7.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 7.2 | Error | Invalid Date Range selection (Start > End) | Negative |

**Total: 26 tests | 7 suites | 21 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1. Dynamic Column Generation:** Select a date range (e.g., June 1st to June 5th). Verify the table generates exactly 5 date columns in addition to the fixed employee detail columns.
*   **1.2. Employee Filter:** Selecting a specific employee from the dropdown should narrow the table to only that employee's travel row.
*   **1.4. Reset Logic:** Clicking "Clear All" must reset the date range to the default (e.g., current month) and clear any search inputs.

### 2. Search Functionality
*   **2.1. Code Search:** Searching for "EMP001" should return only that employee.
*   **2.2. Name/Designation Search:** Searching for "John" or "Technician" should dynamically filter the current view.

### 3. Data Table & Grid
*   **3.1. Column Audit:** Ensure fixed columns (Sr. No., Emp Code, Emp Name, Designation) are always visible on the left.
*   **3.2. Dynamic Dates:** Verify that dates are formatted correctly (e.g., DD-MMM) and aligned with the travel distance values.
*   **3.4. Scrollability:** If the date range is long (e.g., 30 days), ensure a horizontal scrollbar is available and the fixed columns remain pinned (if sticky columns are implemented).

### 4. Export Feature
*   **4.2. Excel Column Sync:** Open the exported Excel file and verify that the number of date columns matches the range selected in the UI at the time of export.
*   **4.4. Data Integrity:** Cross-check the distance value for a specific employee on a specific date between the UI and the Excel file.

### 5. Pagination
*   **5.1. Row Limit:** Verify switching between 10, 25, 50, and 100 rows per page.
*   **5.2. Navigation:** Ensure the user can navigate through multiple pages of employee records.

### 6. UI/UX & Performance
*   **6.2. No Data State:** Verify a "No Records Found" message when filters yield no travel data.
*   **6.3. Responsiveness:** Ensure the table handles mobile view gracefully, likely using horizontal scrolling.

### 7. Error Handling
*   **7.1. API Failure:** Verify the system handles network errors gracefully with a user-friendly message.
*   **7.2. Validation:** Check for invalid date range inputs (e.g., selecting a range larger than the allowed limit, if any).
