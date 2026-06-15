# Activity Report Comprehensive Test Plan

## Application Overview

The Activity Report module provides a comprehensive audit trail of all sales and follow-up activities. It allows management to track the engagement levels of the sales team through a data table with 11 columns: **Sr. No., Sales Person, Next Follow-up Date, Branch Name, Firm Name, Site Name, Notes, Type, Activity Status, Assigned To, and Status.** The module features specialized **Category Filters (All Activities, Missed Activities, Upcoming Activities)**, advanced **Filtering (Date Range, Sales Person, Type, Follow-up Status, Activity Status)**, real-time **Search (Created By Name, Branch Name, Firm Name, Site Name)**, and **Export to Excel** capabilities.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Activity Categories** | | |
| 1.1 | Categories | Verify "Missed Activities" shows only activities with past dates and incomplete status | Positive |
| 1.2 | Categories | Verify "Upcoming Activities" shows only future-dated activities | Positive |
| 1.3 | Categories | Verify "All Activities" displays the complete dataset | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Sales Person (Single selection) | Positive |
| 2.2 | Filtering | Filter by Activity Type (Call, Meeting, etc.) | Positive |
| 2.3 | Filtering | Filter by Follow-up Status / Activity Status | Positive |
| 2.4 | Filtering | Filter by Date Range (Custom range, Today, Yesterday, etc.) | Positive |
| 2.5 | Filtering | Combine Category + Sales Person + Date Range | Positive |
| 2.6 | Filtering | Verify "Clear All" resets all filters and category selection | Positive |
| 2.7 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Created By Name (Exact & Partial) | Positive |
| 3.2 | Search | Search by Branch Name | Positive |
| 3.3 | Search | Search by Firm Name / Site Name | Positive |
| 3.4 | Search | Search with special characters and spaces | Positive |
| 3.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.6 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 11 mandatory columns | Positive |
| 4.2 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 4.3 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 4.4 | Grid | Verify data formatting (Next Follow-up Date, Status labels) | Positive |
| 4.5 | Grid | Column Sorting (Ascending/Descending for Date, Sales Person) | Positive |
| 4.6 | Grid | Tooltips for long text (Notes, Firm Name) | Positive |
| 4.7 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Missed Activities + Sales Person) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers (All 11 columns) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no activities exist | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Table scrolling for 11 columns) | Positive |
| 7.4 | Performance | Load time with large dataset (e.g., 1000+ activities) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Date + Activity Status filter → verify table listing accuracy and export consistency | Positive |
| 9.2 | Integrated | Filter by "Missed Activities" + Sales Person → verify exported file matches UI exactly | Positive |
| 9.3 | Integrated | Apply multiple filters → verify listing → click "Clear All" → verify all data restored | Positive |
| 9.4 | Integrated | Search by Firm Name + Filter by Type → verify result accuracy and export content | Positive |

**Total: 41 tests | 9 suites | 36 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Activity Categories
*   **1.1. Missed Activities:** Click the "Missed Activities" filter/tab. Verify that only activities where the "Next Follow-up Date" is before Today AND the status is not "Completed" are displayed.
*   **1.2. Upcoming Activities:** Click "Upcoming Activities". Verify that only activities with future "Next Follow-up Dates" are listed.

### 2. Filtering
*   **2.1. Sales Person Filter:** Selecting a specific sales person should filter the table to show only their activities.
*   **2.4. Date Range:** Test selecting "Yesterday" or a custom range. Ensure the "Next Follow-up Date" column reflects the selected range.
*   **2.6. Reset Logic:** After applying multiple filters (e.g., Type = Call + Status = Pending), clicking "Clear All" must return the table to the "All Activities" state with no filters.

### 3. Search Functionality
*   **3.1. Created By Search:** Searching for "Admin" should find all activities logged by the Admin user.
*   **3.2. Location Search:** Searching for a specific "Branch Name" should filter the table correctly.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all 11 columns are present: Sr. No., Sales Person, Next Follow-up Date, Branch Name, Firm Name, Site Name, Notes, Type, Activity Status, Assigned To, Status.
*   **4.2. Manage Columns Visibility:** Hide "Notes" and "Assigned To" via column management. Verify the table layout adjusts correctly.
*   **4.4. Data Integrity:** Verify that "Next Follow-up Date" is in a readable format (e.g., DD-MM-YYYY) and "Status" uses the correct color-coded badges.

### 5. Export Feature
*   **5.2. Filter Consistency:** Filter by "Missed Activities" for a specific "Branch", then export. The Excel file must contain exactly the same records shown on the screen.
*   **5.4. Excel Formatting:** Verify that the exported file headers match the 11 columns of the report and the data is correctly typed.

### 6. Pagination
*   **6.1. Row Limit:** Verify that the table correctly chunks data into 10, 25, 50, or 100 rows per page.

### 7. UI/UX & Performance
*   **7.2. No Data State:** Verify the appearance of an empty state illustration/message when filters result in zero records.

### 8. Error Handling
*   **8.2. Validation:** Check that the system shows a warning if a user tries to search with a Start Date greater than the End Date.

### 9. Integrated Validation
*   **9.1. Integrated Filter and Export:** Apply Date Range and Activity Status; verify the table count is accurate and the exported file matches the UI data row-for-row.
*   **9.3. Filter Reset Workflow:** Aply a complex set of filters (Missed + Sales Person + Type); verify the listing data updates; click "Clear All"; verify that the full original dataset is re-displayed.
