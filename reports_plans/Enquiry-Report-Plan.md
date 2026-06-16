# Enquiry Report Comprehensive Test Plan

## Application Overview

The Enquiry Report module serves as a detailed tracking system for enquiries and their associated quotations. It provides a comprehensive view of enquiry data through a data table with 17 columns: **Sr. No., VIEW Quotation, Enquiry Date, Firm Name, Site Name, Contact Person Name, Contact Person Number, City, Branch, Area, Lead Source, Executive Name, Assigned To, Quotation Number, Quotation Status, Modernisation, and Enquiry Status.** The module features high-level **Status Cards (Quotation Raised, Pending, Finalized, Closed by Others)**, advanced **Filtering (Date Range, Enquiry Type, City, Sales Person, Branch, Enquiry Status, Follow-up Status)**, real-time **Search (Quotation Number, Contact Person Name)**, and **Export to Excel** capabilities.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Status Cards** | | |
| 1.1 | Status Cards | Verify counts match table data for all statuses (Quotation Raised, Pending, etc.) | Positive |
| 1.2 | Status Cards | Verify cards update dynamically when any filter is applied | Positive |
| **2** | **Filtering** | | |
| 2.1 | Filtering | Filter by Enquiry Status (Single selection) | Positive |
| 2.2 | Filtering | Filter by Follow-up Status | Positive |
| 2.3 | Filtering | Filter by Sales Person | Positive |
| 2.4 | Filtering | Filter by City / Branch | Positive |
| 2.5 | Filtering | Filter by Enquiry Type | Positive |
| 2.6 | Filtering | Filter by Date Range (Custom range, Today, Yesterday, etc.) | Positive |
| 2.7 | Filtering | Combine multiple filters (Status + Sales Person + City) | Positive |
| 2.8 | Filtering | Verify "Clear All" resets all filters and cards | Positive |
| 2.9 | Filtering | Apply filter with 0 matching records | Negative |
| **3** | **Search Functionality** | | |
| 3.1 | Search | Search by Quotation Number (Exact & Partial) | Positive |
| 3.2 | Search | Search by Contact Person Name | Positive |
| 3.3 | Search | Search by Firm Name / Site Name | Positive |
| 3.4 | Search | Search with special characters and spaces | Positive |
| 3.5 | Search | Verify search is cleared when using "Clear All" | Positive |
| 3.6 | Search | Search with no results found | Negative |
| **4** | **Data Table & Grid** | | |
| 4.1 | Grid | Verify visibility of all 17 mandatory columns | Positive |
| 4.2 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 4.3 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 4.4 | Grid | Verify "VIEW Quotation" option redirects/opens correctly | Positive |
| 4.5 | Grid | Verify data formatting (Dates, Phone Numbers, Status labels) | Positive |
| 4.6 | Grid | Column Sorting (Ascending/Descending for Date, Name, Status) | Positive |
| 4.7 | Grid | Tooltips for long text (Firm Name, Site Name) | Positive |
| 4.8 | Grid | Sr. No. increments correctly across pages | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full dataset to Excel | Positive |
| 5.2 | Export | Export filtered dataset (Date + Enquiry Status) | Positive |
| 5.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 5.4 | Export | Verify exported file formatting and column headers (All 17 columns) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 6.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 7.2 | UI/UX | Verify empty state UI when no enquiries exist | Positive |
| 7.3 | UI/UX | Mobile Responsiveness (Table scrolling & card layout) | Positive |
| 7.4 | Performance | Load time with large dataset (e.g., 1000+ enquiries) | Positive |
| **8** | **Error Handling** | | |
| 8.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 8.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **9** | **Integrated Validation** | | |
| 9.1 | Integrated | Apply Date + Enquiry Status filter → verify table, count, and export consistency | Positive |
| 9.2 | Integrated | Filter by Quotation Status → verify table listing and status card updates | Positive |
| 9.3 | Integrated | Search by Quotation Number + Filter by City → verify result accuracy | Positive |
| 9.4 | Integrated | Filter by Branch + Sales Person → verify status card count synchronization | Positive |

**Total: 42 tests | 9 suites | 37 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Status Cards
*   **1.1. Count Verification:** Verify that each card (**Quotation Raised, Pending, Finalized, Closed by Others**) shows a count that matches the number of rows in the table when that status filter is active.
*   **1.2. Dynamic Updates:** Apply a filter (e.g., City or Sales Person); confirm that all Status Card counts update to reflect only the enquiries matching the criteria.

### 2. Filtering
*   **2.1. Enquiry Status Filter:** Selecting "Finalized" should only show enquiries with that status.
*   **2.2. Follow-up Status Filter:** Filter by specific follow-up statuses to ensure correct data retrieval.
*   **2.4. City/Branch Filter:** Selecting a specific Branch should filter the table and update cards for that branch only.
*   **2.6. Date Range:** Test "Last 7 Days", "This Month", and custom ranges. Verify records outside the range are excluded.
*   **2.8. Reset Logic:** Clicking "Clear All" must reset all dropdowns, date pickers, and search fields to default.

### 3. Search Functionality
*   **3.1. Quotation Number Search:** Searching for "QTN/2024/001" should return the specific enquiry record.
*   **3.2. Contact Person Search:** Typing a name (e.g., "Rahul") should find all enquiries associated with that contact person.

### 4. Data Table & Grid
*   **4.1. Column Audit:** Ensure all 17 columns are visible and in correct order: Sr. No., VIEW Quotation, Enquiry Date, Firm Name, Site Name, Contact Person Name, Contact Person Number, City, Branch, Area, Lead Source, Executive Name, Assigned To, Quotation Number, Quotation Status, Modernisation, Enquiry Status.
*   **4.2. Manage Columns Visibility:** Click the "Manage Column" or "Settings" icon; uncheck "City" and "Branch". Verify these columns are immediately hidden from the table.
*   **4.3. Manage Columns Reset:** Re-check all columns or click "Reset/Select All"; verify the table restores all 17 columns.
*   **4.4. VIEW Quotation:** Click the "VIEW" option/icon; verify it correctly opens the quotation details or redirects to the quotation document.
*   **4.5. Data Integrity:** Verify that "Contact Person Number" displays correctly and "Enquiry Date" follows the system format.

### 5. Export Feature
*   **5.2. Filter Consistency:** Apply an "Enquiry Type" filter and export. The Excel file must match the on-screen filtered data.
*   **5.4. Excel Formatting:** Verify the exported file contains all 17 columns as headers and the data matches the table row for row.

### 6. Pagination
*   **6.1. Row Limit:** Verify that switching between 10, 25, 50, and 100 rows per page works correctly.
*   **6.2. Navigation:** Ensure the user can navigate through multiple pages of enquiries.

### 7. UI/UX & Performance
*   **7.2. No Data State:** Verify a user-friendly "No Records Found" message when filters yield no results.
*   **7.3. Responsiveness:** Ensure the horizontal scrollbar is present for the 17-column table on smaller screens.

### 8. Error Handling
*   **8.1. API Failure:** Verify the system handles network errors gracefully without crashing the UI.
*   **8.2. Validation:** Check for date range validation (e.g., end date cannot be before start date).

### 9. Integrated Validation
*   **9.1. Complex Filtering:** Apply Date Range + City + Enquiry Status. Verify table count, card count, and export file all synchronize.
*   **9.4. Count Synchronization:** Ensure the "Grand Total" (if applicable) or sum of status cards matches the total records available before and after filtering.
