# Job Report Comprehensive Test Plan

## Application Overview

The Job Report module is a central hub for managing and tracking the lifecycle of installation jobs. It provides a detailed view of job progress through a data table with 15 columns: **Sr. No., View Option, Job ID, Job Enquiry Date, Job Start Date, Job Completion Date, City, Firm Name, Site Engineer Name, Site Name, Material Dispatch Date, Material Arrival Date, Wing Name, Lift Type, and Job Status.** The module features high-level **Status Cards (Pending, Work in Progress, Completed, On Hold, HO Checklist Done, Hold by Customer, Cancelled, Material Delivered, Total)**, advanced **Filtering (Date Range, Enquiry Type, City, Branch, Area, Lift Type, Job Status)**, real-time **Search (Site Name, Firm Name, Quotation Number, Job Number, City Name)**, and **Export to Excel** capabilities.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Status Cards** | | |
| 1.1 | Status Cards | Verify counts match table data for all statuses (Pending, Completed, etc.) | Positive |
| 1.2 | Status Cards | Verify cards update dynamically when any filter is applied | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Job Status (Single selection) | Positive |
| 2.2 | Filtering | Filter by City / Branch / Area | Positive |
| 2.3 | Filtering | Filter by Lift Type | Positive |
| 2.4 | Filtering | Filter by Enquiry Type | Positive |
| 2.5 | Filtering | Filter by Date Range (Custom range, Today, Yesterday, etc.) | Positive |
| 2.6 | Filtering | Combine multiple filters (Status + City + Lift Type) | Positive |
| 2.7 | Filtering | Verify "Clear All" resets all filters and cards | Positive |
| 2.8 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Job Number / Quotation Number | Positive |
| 3.2 | Search | Search by Site Name / Firm Name | Positive |
| 3.3 | Search | Search by City Name | Positive |
| 3.4 | Search | Search with special characters and spaces | Positive |
| 3.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.6 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 15 mandatory columns | Positive |
| 4.2 | Grid | **View Details:** Verify clicking "View" icon opens job details | Positive |
| 4.3 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 4.4 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 4.5 | Grid | Verify data formatting (Dates, Status badges) | Positive |
| 4.6 | Grid | Column Sorting (Ascending/Descending for Date, Job ID, Status) | Positive |
| 4.7 | Grid | Tooltips for long text (Site Name, Firm Name) | Positive |
| 4.8 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Date + Job Status) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers (All 15 columns) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no jobs exist | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Table scrolling & card layout) | Positive |
| 7.4 | Performance | Load time with large dataset (e.g., 1000+ jobs) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Date + Job Status filter → verify table, count, and export consistency | Positive |
| 9.2 | Integrated | Filter by City + Lift Type → verify status card count synchronization | Positive |
| 9.3 | Integrated | Search by Job Number + Filter by Area → verify result accuracy | Positive |

**Total: 39 tests | 9 suites | 34 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Status Cards
*   **1.1. Count Verification:** Verify that each card (**Pending, Work in Progress, Completed, On Hold, HO Checklist Done, Hold by Customer, Cancelled, Material Delivered, Total**) shows a count that matches the number of rows in the table when that specific status filter is active.
*   **1.2. Dynamic Updates:** Apply a filter (e.g., City or Lift Type); confirm that all Status Card counts update dynamically.

### 2. Filtering
*   **2.1. Job Status Filter:** Selecting "Completed" should only show jobs with that status.
*   **2.2. Location Filters:** Filtering by City, Branch, or Area should correctly narrow down the list.
*   **2.5. Date Range:** Test custom ranges and presets (Today, Last 7 Days). Verify records outside the range are excluded.
*   **2.7. Reset Logic:** Clicking "Clear All" must reset all dropdowns and search fields to default.

### 3. Search Functionality
*   **3.1. ID Search:** Searching for a specific Job ID or Quotation Number should return the exact record.
*   **3.2. Name Search:** Searching for "Elevator Corp" (Firm Name) or "Site A" (Site Name) should yield matching results.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all 15 columns are visible: Sr. No., View Option, Job ID, Job Enquiry Date, Job Start Date, Job Completion Date, City, Firm Name, Site Engineer Name, Site Name, Material Dispatch Date, Material Arrival Date, Wing Name, Lift Type, Job Status.
*   **4.2. View Details:** Click the "View" icon/option; verify it opens the job's detailed view page or modal.
*   **4.3. Manage Columns Visibility:** Click the "Manage Column" icon; hide "Wing Name" and "Material Dispatch Date". Verify they are hidden from the table.

### 5. Export Feature
*   **5.2. Filter Consistency:** Apply a "Job Status" filter and export. The Excel file must contain only jobs with that status.
*   **5.4. Excel Formatting:** Verify the exported file contains all 15 columns as headers and the data matches the table.

### 6. Pagination
*   **6.1. Row Limit:** Verify switching between 10, 25, 50, and 100 rows per page.
*   **6.2. Navigation:** Ensure the user can navigate through multiple pages of job records.

### 7. UI/UX & Performance
*   **7.2. No Data State:** Verify a "No Records Found" message when filters yield no results.
*   **7.3. Responsiveness:** Ensure horizontal scrollbar is present for the 15-column table on smaller screens.

### 8. Error Handling
*   **8.1. API Failure:** Verify the system handles network errors gracefully.
*   **8.2. Validation:** Check for invalid date range inputs (e.g., end date before start date).

### 9. Integrated Validation
*   **9.1. Complex Filtering:** Apply Date Range + City + Job Status. Verify table count, card counts, and export file all synchronize.
