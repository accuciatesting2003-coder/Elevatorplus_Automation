# Site Visit Report Comprehensive Test Plan

## Application Overview

The Site Visit Report is a tracking module designed to monitor employee field activities. It captures precise data regarding when and where staff members visit project sites, providing transparency for site operations. The report features a data table with 11 columns: **Sr. No., Emp Code, Username, Site Name, Type of Service, Date, In Time, Out Time, In Site Location, Out Site Location, and Time Spent.** The module supports real-time **Search (Site Name, User Name)**, advanced **Filtering (Date Range, User, Site)**, **Manage Column** visibility, and **Export to Excel** for attendance and productivity auditing.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Visit Data Accuracy** | | |
| 1.1 | Visit Data | Verify In/Out times are recorded correctly and in sequence | Positive |
| 1.2 | Visit Data | Verify "Time Spent" calculation (Out Time - In Time) | Positive |
| 1.3 | Visit Data | Verify In/Out Site Location captures valid GPS/Address data | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Date Range (Custom range, Today, Yesterday) | Positive |
| 2.2 | Filtering | Filter by Specific User (Individual tracking) | Positive |
| 2.3 | Filtering | Filter by Specific Site (Location-based tracking) | Positive |
| 2.4 | Filtering | Combine multiple filters (Date + User + Site) | Positive |
| 2.5 | Filtering | Verify "Clear All" resets all dropdowns and date pickers | Positive |
| 2.6 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Site Name (Exact & Partial) | Positive |
| 3.2 | Search | Search by User Name | Positive |
| 3.3 | Search | Search with special characters and spaces | Positive |
| 3.4 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.5 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 11 mandatory columns | Positive |
| 4.2 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 4.3 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 4.4 | Grid | Verify data formatting (Time formats, Emp Code) | Positive |
| 4.5 | Grid | Column Sorting (Ascending/Descending for Date, User Name, Time Spent) | Positive |
| 4.6 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full visit dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Specific User + Date) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers (All 11 columns) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no visits are recorded | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Horizontal scrolling for 11 columns) | Positive |
| 7.4 | Performance | Load time with large dataset (e.g., 1000+ site visits) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply User filter → verify table listing accuracy and export consistency | Positive |
| 9.2 | Integrated | Filter by Date Range + Site → verify "Time Spent" data is correct for the subset | Positive |
| 9.3 | Integrated | Apply multiple filters → verify listing → click "Clear All" → verify all data restored | Positive |

**Total: 38 tests | 9 suites | 33 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Visit Data Accuracy
*   **1.1. Time Sequencing:** Ensure that "Out Time" is logically after "In Time". Check how the system handles overnight visits (if applicable).
*   **1.2. Time Spent Calculation:** Verify that the "Time Spent" column accurately calculates the duration between check-in and check-out. (e.g., In: 10:00 AM, Out: 11:30 AM → Time Spent: 1h 30m).
*   **1.3. Location Validation:** Ensure the "In Site Location" and "Out Site Location" columns display the site coordinates or resolved address captured during the visit.

### 2. Filtering
*   **2.2. User Filter:** Selecting an employee (e.g., "Rahul") should filter the report to show only his site visits.
*   **2.3. Site Filter:** Selecting a project site (e.g., "Green Valley") should show all employees who visited that specific site.
*   **2.5. Reset Logic:** Clicking "Clear All" must reset all search terms and filter dropdowns to show the original full list.

### 3. Search Functionality
*   **3.1. Site Search:** Typing "Site A" should find all visits associated with that site name.
*   **3.2. Username Search:** Searching for "Suresh" should yield all visit logs for that user.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all 11 columns are present: Sr. No., Emp Code, Username, Site Name, Type of Service, Date, In Time, Out Time, In Site Location, Out Site Location, Time Spent.
*   **4.2. Manage Columns Visibility:** Hide "Emp Code" and "Type of Service". Verify they are hidden from the UI.
*   **4.5. Sorting:** Click "Date" header to toggle between newest and oldest visits.

### 5. Export Feature
*   **5.2. Filter Consistency:** Apply a "Site" filter and export. The Excel file must match the on-screen list exactly.
*   **5.4. Excel Integrity:** Verify the exported file contains all 11 columns and the time formats are preserved.

### 6. Pagination
*   **6.1. Row Limit:** Confirm that changing rows per page (e.g., to 50) updates the table view correctly.

### 7. UI/UX & Performance
*   **7.3. Responsiveness:** Verify that the 11 columns are accessible via horizontal scroll on mobile devices.

### 8. Error Handling
*   **8.2. Date Validation:** Ensure a validation error is shown if the user selects a start date in the future relative to the end date.

### 9. Integrated Validation
*   **9.1. End-to-End Workflow:** Filter by User + Date Range; verify the table counts, time calculations, and the exported Excel file all align with the filtered criteria.
