# Lead Report Comprehensive Test Plan

## Application Overview

The Lead Report module is a central hub for tracking and analyzing leads. It provides a detailed view of lead information through a data table with 14 columns: **Sr. No., Lead Date, Created By, Lead Name, Lead Source, Mobile Number, Alternate Number, Firm Name, Site Name, Firm Address, Assigned To Email ID, Notes, Touch Point, and Status.** The module is designed for efficiency with high-level **Status Cards** for quick metrics, advanced **Filtering (Status, Salesperson, Date Range)**, real-time **Search**, and **Export to Excel** capabilities. It also includes robust pagination and UI elements for a seamless user experience.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Status Cards** | | |
| 1.1 | Status Cards | Verify counts match table data for all statuses | Positive |
| 1.2 | Status Cards | Verify cards update dynamically when any filter (Date/Salesperson) is applied | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Lead Status (Single selection) | Positive |
| 2.2 | Filtering | Filter by Salesperson (Single selection) | Positive |
| 2.3 | Filtering | Filter by Date Range (Custom range) | Positive |
| 2.4 | Filtering | Filter by Date Range (Today, Yesterday, Last 7 Days) | Positive |
| 2.5 | Filtering | Combine multiple filters (Status + Salesperson + Date) | Positive |
| 2.6 | Filtering | Verify "Clear All" resets all filters and cards | Positive |
| 2.7 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Lead Name (Exact & Partial) | Positive |
| 3.2 | Search | Search by Mobile Number / Alternate Number | Positive |
| 3.3 | Search | Search by Firm Name / Site Name | Positive |
| 3.4 | Search | Search with special characters and spaces | Positive |
| 3.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.6 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 14 mandatory columns | Positive |
| 4.2 | Grid | Verify data formatting (Dates, Phone Numbers, Email links) | Positive |
| 4.3 | Grid | Column Sorting (Ascending/Descending for Name, Date, Status) | Positive |
| 4.4 | Grid | Tooltips for long text (Notes, Firm Address) | Positive |
| 4.5 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Date + Status) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no leads exist | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Table scrolling & card layout) | Positive |
| 7.4 | Performance | Load time with large dataset (e.g., 1000+ leads) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Date + Status filter → verify table filter, record count accuracy, and export consistency | Positive |
| 9.2 | Integrated | Filter by Date Range → verify table listing, status card count updates, and exported file content | Positive |
| 9.3 | Integrated | Filter by Lead Status → verify all filtered data is listed and accurately exported | Positive |
| 9.4 | Integrated | Filter by Date Range → verify all filtered data is listed and accurately exported | Positive |
| 9.5 | Integrated | Apply Salesperson filter → verify table listing and status card count updates | Positive |
| 9.6 | Integrated | Filter by any Status → verify table data, table count, status card count, and export consistency | Positive |
| 9.7 | Integrated | Verify baseline counts vs filtered counts synchronization for table and status cards | Positive |

**Total: 37 tests | 9 suites | 33 Positive | 4 Negative**

---

## Detailed Test Scenarios

### 1. Status Cards
*   **1.1. Count Verification:** Verify that each card (New, Won, Lost, etc.) shows a count that exactly matches the number of rows in the table when that specific status filter is active.
*   **1.2. Dynamic Updates:** Apply a filter (e.g., Date Range or Salesperson); confirm that all Status Card counts update dynamically to reflect only the leads matching the applied filter criteria.

### 2. Filtering
*   **2.1. Status Filter:** Selecting "Won" should exclude all other statuses from the listing.
*   **2.2. Salesperson Filter:** Selecting "john@example.com" should only show leads where "Assigned To" matches this email.
*   **2.3. Date Range Edge Cases:** Test selecting "Today", "Last Month", and a custom range spanning 1 year. Verify boundaries.
*   **2.5. Combined Filtering:** Apply "Won" status + "Last 30 Days" + "Salesperson A". Verify that only records meeting *all* criteria are displayed.
*   **2.6. Reset Logic:** After applying complex filters, clicking "Clear All" should return the table to its default state and restore card counts.

### 3. Search Functionality
*   **3.1. Name Search:** Typing "Aman" should find "Aman Kumar" and "Aman Singh".
*   **3.2. Contact Search:** Searching for a specific 10-digit mobile number should yield the exact record.
*   **3.4. Robustness:** Enter special characters like `@`, `#`, or leading/trailing spaces. The system should handle these without crashing and return results if applicable.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all columns: Sr. No., Lead Date, Created By, Lead Name, Lead Source, Mobile Number, Alternate Number, Firm Name, Site Name, Firm Address, Assigned To Email ID, Notes, Touch Point, and Status are present.
*   **4.3. Sorting:** Clicking "Lead Date" header should toggle between oldest-to-newest and newest-to-oldest.
*   **4.4. Long Content:** For columns like "Notes" or "Firm Address", verify that long text doesn't break the row layout (e.g., using ellipsis or wrapping).

### 5. Export Feature
*   **5.2. Filter Consistency:** Filter by a specific Salesperson, then export. The Excel file must *not* contain leads from other salespeople.
*   **5.4. Formatting:** Open the exported Excel. Verify that "Mobile Number" is treated as text/number and not scientific notation, and dates are in a readable format.

### 6. Pagination
*   **6.1. Row Limit:** If "10" is selected, the table must not show an 11th row.
*   **6.2. Navigation:** Ensure the "Previous" button is disabled on Page 1 and "Next" is disabled on the last page.

### 7. UI/UX & Performance
*   **7.2. No Data State:** If no leads match a filter, verify a clear "No Records Found" message and a centered illustration/icon are shown.
*   **7.3. Responsiveness:** On a mobile screen, the table should be horizontally scrollable while the Status Cards should stack vertically or remain accessible.

### 8. Error Handling
*   **8.1. API Failure:** Simulate a 500 error from the server. Verify a user-friendly error message is displayed rather than a blank screen.
*   **8.2. Date Validation:** If a user selects a Start Date that is after the End Date, the system should ideally prevent the search or show a validation error.

### 9. Integrated Validation
*   **9.1. Integrated Filter (Date + Status) with Count and Export Validation:** Verify that applying Date and Status filters correctly updates the table, showing the correct count, and results in an accurate export mirroring the filtered state.
*   **9.2. Date Range Integration with Status Cards and Export:** Verify that applying a Date Range updates Status Cards, table listing, and the export to match the filtered metrics.
*   **9.3. Individual Lead Status Filter - Listing and Export Accuracy:** Verify that selecting a single status correctly filters all records in the table and results in a perfect export matching the UI.
*   **9.4. Individual Date Range Filter - Listing and Export Accuracy:** Verify that applying a date range correctly filters the table and ensures the exported file contains all and only the relevant leads.
*   **9.5. Salesperson Filter Integration with Status Cards:** Verify that selecting a specific Salesperson updates the counts on all Status Cards to reflect only that salesperson's performance.
*   **9.6. Status Filter Integration (Listing, Cards, and Export):** Apply any status filter (e.g., "In Progress"); verify that the table listings update correctly, the table count matches the number of rows, the corresponding Status Card reflects the same count, and the exported Excel file contains identical data and totals.
*   **9.7. Baseline vs. Filtered Count Synchronization:** Before applying any filter, note the total listing count and status card counts. Apply a filter (e.g., specific date range) and verify that both the table listing and status cards update to reflect the subset of data accurately compared to the baseline.
