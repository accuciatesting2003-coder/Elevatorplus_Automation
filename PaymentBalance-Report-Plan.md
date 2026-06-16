# Payment Balance Report Comprehensive Test Plan

## Application Overview

The Payment Balance Report module allows users to view and track outstanding payment balances by site and firm. It provides a detailed financial overview through a data table with 15 columns: **Sr. No., Site Name, Firm Name, Quotation No., Job No., Total Payment, Remaining Payment, Contact Person Name, Contact Person Number, Area, Assigned Person, Payment Terms, Committed Date, City, and Notes.** The module features advanced **Filtering (Date Range, Payment Type, City, Area, Assigned Person)**, real-time **Search (Firm Name, Site Name, City)**, **Export to Excel**, and **Pagination**.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Payment Type (Job, PM, Repair Order, One Time Service) | Positive |
| 1.2 | Filtering | Filter by Date Range (Custom range, Today, Yesterday, etc.) | Positive |
| 1.3 | Filtering | Filter by City / Area | Positive |
| 1.4 | Filtering | Filter by Assigned Person | Positive |
| 1.5 | Filtering | Combine multiple filters (Type + City + Assigned Person) | Positive |
| 1.6 | Filtering | Verify "Clear All" resets all filters and search fields | Positive |
| 1.7 | Filtering | Apply filter with 0 matching records | Negative |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Firm Name | Positive |
| 2.2 | Search | Search by Site Name | Positive |
| 2.3 | Search | Search by City | Positive |
| 2.4 | Search | Search with special characters and spaces | Positive |
| 2.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| 2.6 | Search | Search with no results found | Negative |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of all 15 mandatory columns | Positive |
| 3.2 | Grid | Verify currency formatting for Total and Remaining Payment | Positive |
| 3.3 | Grid | Verify Contact details (Person Name & Number) are correctly displayed | Positive |
| 3.4 | Grid | Column Sorting (Remaining Payment, Committed Date, Job No.) | Positive |
| 3.5 | Grid | Tooltips for long text (Notes, Payment Terms) | Positive |
| 3.6 | Grid | Sr. No. increments correctly across pages | Positive |
| **4** | **Export Feature** | | |
| 4.1 | Export | Export full dataset to Excel | Positive |
| 4.2 | Export | Export filtered dataset (By Payment Type + Area) | Positive |
| 4.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 4.4 | Export | Verify exported file formatting and all 15 column headers | Positive |
| **5** | **Pagination** | | |
| 5.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 5.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 5.3 | Pagination | Verify pagination state is maintained after sorting/filtering | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 6.2 | UI/UX | Verify empty state UI when no records exist | Positive |
| 6.3 | UI/UX | Mobile Responsiveness (Horizontal scrolling for 15 columns) | Positive |
| 6.4 | Performance | Load time with large dataset of payment balances | Positive |
| **7** | **Error Handling** | | |
| 7.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 7.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **8** | **Integrated Validation** | | |
| 8.1 | Integrated | Apply Payment Type filter -> Verify table only shows selected type | Positive |
| 8.2 | Integrated | Apply Payment Type filter -> Export to Excel -> Verify Excel only contains selected type | Positive |
| 8.3 | Integrated | Apply Multiple Filters (Type + City + Date) -> Verify records match all criteria | Positive |
| 8.4 | Integrated | Click "Clear All" / Reset -> Verify all filters are cleared and all records return | Positive |

**Total: 33 tests | 8 suites | 28 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1. Payment Type Filter:** Verify that selecting "PM" (Preventive Maintenance) or "Repair Order" correctly filters the balance list.
*   **1.2. Date Range:** Test presets like "Last 30 Days" and custom ranges. Verify records are filtered based on the transaction or committed date.
*   **1.4. Assigned Person:** Verify the list updates to show only balances assigned to a specific engineer or collector.
*   **1.6. Reset Logic:** Clicking "Clear All" must reset all dropdowns to "Select", clear the search bar, and restore the table to show all available records.

### 2. Search Functionality
*   **2.1. Firm/Site Search:** Searching for "ABC Corp" or "Sunrise Apartments" should return all associated payment records.
*   **2.3. City Search:** Verify that searching for "Mumbai" or "Pune" filters the grid correctly.

### 3. Data Table & Grid
*   **3.1. Column Audit:** Ensure all 15 columns are visible: Sr. No., Site Name, Firm Name, Quotation No., Job No., Total Payment, Remaining Payment, Contact Person Name, Contact Person Number, Area, Assigned Person, Payment Terms, Committed Date, City, Notes.
*   **3.2. Financial Accuracy:** Verify that **Total Payment** minus any paid amount equals the **Remaining Payment**.
*   **3.3. Contact Info:** Check that mobile numbers are formatted correctly and contact names are accurate.

### 4. Export Feature
*   **4.2. Filter Consistency:** Filter by "Remaining Payment > 0" and export. The Excel file must match the UI exactly.
*   **4.4. Header Verification:** Ensure the Excel file contains all 15 columns as specified in the UI requirements.

### 5. Pagination
*   **5.1. Row Limit:** Verify switching between 10, 25, 50, and 100 rows per page.
*   **5.2. Navigation:** Ensure smooth navigation through multiple pages of balance records.

### 6. UI/UX & Performance
*   **6.2. No Data State:** Verify a "No Records Found" message when search/filters yield no results.
*   **6.3. Responsiveness:** Check for horizontal scrolling on smaller screens to ensure all 15 columns remain accessible.

### 7. Error Handling
*   **7.1. API Failure:** Verify that the system shows an error message if the payment data fails to load.

### 8. Integrated Validation
*   **8.1. Type Filter Accuracy:** Apply a filter (e.g., "Repair Order"). Manually verify every row in the resulting table belongs to the "Repair Order" category.
*   **8.2. Export Synchronization:** Apply a filter (e.g., "Job"). Export the records and verify the Excel file contains the exact same count and data as shown in the filtered UI.
*   **8.3. Multi-Filter Logic:** Apply "Type: PM" + "City: Mumbai" + "Date Range: Last 7 Days". Verify the table only shows records that satisfy **all three** conditions simultaneously.
*   **8.4. Global Reset:** After applying multiple filters and searches, click "Clear All". Verify that the data table immediately repopulates with the full set of original records and all filter UI elements return to their default state.
