# User Performance Report Comprehensive Test Plan

## Application Overview

The User Performance Report is a high-level productivity tracking module that provides a quantitative analysis of individual staff performance. It aggregates counts of key actions taken by users across various modules (Sales, PMS, Service). The data table consists of 15 columns: **Sr. No., Name, Designation, Lead Created, Enquiry Generated, Enquiries Finalised, Job Created, Follow-ups Created, Sales PM Created, Sales PM Finalised, Service PM Resolved, Confirm PM Variations, Breakdown Resolved, Repair Order Created, and Repair Order Completed.** The module supports real-time **Search (Name, Designation)**, **Filtering (Date Range, User Type)**, and **Export to Excel** for performance auditing.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Data Accuracy & Counts** | | |
| 1.1 | Counts | Verify counts in each column match the actual records created by the user in that module | Positive |
| 1.2 | Counts | Verify counts update correctly when the Date Range filter is adjusted | Positive |
| 1.3 | Counts | Verify zero (0) is displayed for users with no activity in a specific category | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Date Range (Custom range, Today, This Month, etc.) | Positive |
| 2.2 | Filtering | Filter by User Type (Admin, Sales Executive, Service Engineer, etc.) | Positive |
| 2.3 | Filtering | Combine Date Range + User Type filters | Positive |
| 2.4 | Filtering | Verify "Clear All" resets filters to default state | Positive |
| 2.5 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Name (Exact & Partial) | Positive |
| 3.2 | Search | Search by Designation | Positive |
| 3.3 | Search | Search with special characters and spaces | Positive |
| 3.4 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.5 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 15 mandatory columns | Positive |
| 4.2 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 4.3 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 4.4 | Grid | Verify data formatting (Numeric alignment, Name/Designation text) | Positive |
| 4.5 | Grid | Column Sorting (Ascending/Descending for Name, Leads Created, etc.) | Positive |
| 4.6 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full performance dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Date + User Type) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers (All 15 columns) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no users match criteria | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Horizontal scrolling for 15 columns) | Positive |
| 7.4 | Performance | Load time with large user list (e.g., 500+ staff members) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Date Range filter → verify all count columns (Lead, Enquiry, etc.) update accurately | Positive |
| 9.2 | Integrated | Filter by User Type + Search Name → verify result accuracy and export consistency | Positive |
| 9.3 | Integrated | Apply complex filters → verify listing → reset filters → verify all data restored | Positive |

**Total: 39 tests | 9 suites | 34 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Data Accuracy & Counts
*   **1.1. Count Verification:** Select a specific user and date range. Manually count their "Enquiries Generated" in the Enquiry module for that period. Verify this count matches the number shown in the Performance Report.
*   **1.3. Empty Metrics:** Ensure that if a user (e.g., a new hire) has not created any "Repair Orders," the column displays `0` rather than remaining blank or showing an error.

### 2. Filtering
*   **2.1. Date Range Sensitivity:** Change the filter from "This Month" to "Today". Verify that counts (Lead Created, Job Created, etc.) decrease or change to reflect only today's actions.
*   **2.2. User Type Filter:** Selecting "Service Engineer" should hide all Sales-only staff from the report.

### 3. Search Functionality
*   **3.1. Name Search:** Searching for "Aman" should find users like "Aman Sharma" and "Aman Varma".
*   **3.2. Designation Search:** Typing "Manager" should filter the list to only show staff with "Manager" in their designation.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all 15 columns are visible: Sr. No., Name, Designation, Lead Created, Enquiry Generated, Enquiries Finalised, Job Created, Follow-ups Created, Sales PM Created, Sales PM Finalised, Service PM Resolved, Confirm PM Variations, Breakdown Resolved, Repair Order Created, Repair Order Completed.
*   **4.5. Sorting:** Click on "Lead Created" header. Verify the table sorts users from highest leads to lowest (and vice-versa).

### 5. Export Feature
*   **5.2. Filter Consistency:** Apply a "User Type" filter and export. Verify that the Excel file only contains the filtered subset of users and their respective counts.
*   **5.4. Excel Integrity:** Open the export. Ensure the column headers are identical to the UI and counts are exported as numeric values (not text).

### 6. Pagination
*   **6.1. Row Limit:** Verify that the "Rows per page" selector correctly limits the display.

### 7. UI/UX & Performance
*   **7.3. Responsiveness:** Since the report has 15 columns, ensure a smooth horizontal scroll is available on smaller screens so all metrics remain accessible.

### 8. Error Handling
*   **8.1. API Failure:** Verify the system displays a user-friendly error message if the performance data fails to load due to a server timeout.

### 9. Integrated Validation
*   **9.1. Cross-Module Synchronization:** Verify that a new action (e.g., creating a Breakdown) is immediately reflected in the report count after a page refresh or filter update.
*   **9.3. Reset Workflow:** Verify that clicking "Clear All" restores the original unfiltered user list and baseline counts.
