# Quotation Report Comprehensive Test Plan

## Application Overview

The Quotation Report module is a centralized tracking system for generated quotations and their financial estimates. It provides a detailed view of quotation data through a data table with 16 columns: **Sr. No., Download Quotation, City, Site Name, CP Name, CP Number, Floor Structure, Estimate Cost (without tax), International Payment Amount, Type of Lift, Executive Name, Assign Person Name, Lead Source, Lead Source Name, Created Via, and Status.** The module is designed for efficiency with advanced **Filtering (Date Range, Enquiry Type, City, Sales Person, Branch, Area)**, real-time **Search (Owner Name, Quotation Number)**, and **Export to Excel** capabilities. It also includes "Manage Column" functionality and "Download" actions for individual records.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Date Range (Custom range, Today, Yesterday, etc.) | Positive |
| 1.2 | Filtering | Filter by Enquiry Type | Positive |
| 1.3 | Filtering | Filter by City | Positive |
| 1.4 | Filtering | Filter by Sales Person | Positive |
| 1.5 | Filtering | Filter by Branch | Positive |
| 1.6 | Filtering | Filter by Area | Positive |
| 1.7 | Filtering | Combine multiple filters (City + Sales Person + Area) | Positive |
| 1.8 | Filtering | Verify "Clear All" resets all filters | Positive |
| 1.9 | Filtering | Apply filter with 0 matching records | Negative |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Owner Name (Exact & Partial) | Positive |
| 2.2 | Search | Search by Quotation Number | Positive |
| 2.3 | Search | Search with special characters and spaces | Positive |
| 2.4 | Search | Verify search is cleared when using "Clear All" | Positive |
| 2.5 | Search | Search with no results found | Negative |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of all 16 mandatory columns | Positive |
| 3.2 | Grid | **Download Functionality:** Verify clicking "Download" icon/button starts PDF download | Positive |
| 3.3 | Grid | **Manage Columns:** Toggle column visibility (Hide/Show specific columns) | Positive |
| 3.4 | Grid | **Manage Columns:** Verify "Select All" / "Reset" in column management | Positive |
| 3.5 | Grid | Verify data formatting (Currency for Estimate Cost, Phone Numbers) | Positive |
| 3.6 | Grid | Column Sorting (Ascending/Descending for Date, Name, Cost) | Positive |
| 3.7 | Grid | Tooltips for long text (Site Name, Lead Source Name) | Positive |
| 3.8 | Grid | Sr. No. increments correctly across pages | Positive |
| **4** | **Export Feature** | | |
| 4.1 | Export | Export full dataset to Excel | Positive |
| 4.2 | Export | Export filtered dataset (Date + City) | Positive |
| 4.3 | Export | Export with 0 records (Empty file or alert) | Negative |
| 4.4 | Export | Verify exported file formatting and column headers (All 16 columns) | Positive |
| **5** | **Pagination** | | |
| 5.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 5.2 | Pagination | Navigate Next, Previous, First, and Last pages | Positive |
| 5.3 | Pagination | Verify pagination state is maintained after sorting | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify loading state (Spinner/Skeleton) during data fetch | Positive |
| 6.2 | UI/UX | Verify empty state UI when no quotations exist | Positive |
| 6.3 | UI/UX | Mobile Responsiveness (Table scrolling for 16 columns) | Positive |
| 6.4 | Performance | Load time with large dataset (e.g., 1000+ quotations) | Positive |
| **7** | **Error Handling** | | |
| 7.1 | Error | API failure/Timeout handling (Error toast/alert) | Negative |
| 7.2 | Error | Invalid Date Range selection (Start > End) | Negative |
| **8** | **Integrated Validation** | | |
| 8.1 | Integrated | Apply Date + City filter → verify table listing and export consistency | Positive |
| 8.2 | Integrated | Search by Quotation Number + Filter by Sales Person → verify result accuracy | Positive |
| 8.3 | Integrated | Filter by Area → verify exported file contains only relevant records | Positive |

**Total: 34 tests | 8 suites | 29 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1. Date Range:** Verify the table displays only quotations generated within the selected start and end dates.
*   **1.3. City Filter:** Selecting "Ahmedabad" should exclude records from all other cities.
*   **1.7. Combined Filtering:** Apply "Custom Date Range" + "Specific Sales Person" + "Specific Area". Verify that the resulting list strictly meets all three criteria.
*   **1.8. Reset Logic:** Clicking "Clear All" must return the table to the full unfiltered list and reset all dropdowns to their default state.

### 2. Search Functionality
*   **2.1. Owner Name Search:** Typing "Kunal" should find all quotations where "Assign Person Name" or "Executive Name" matches.
*   **2.2. Quotation Number Search:** Searching for a specific number (e.g., QTN-102) should yield the exact record.

### 3. Data Table & Grid
*   **3.1. Column Audit:** Ensure all 16 columns are present: Sr. No., Download Quotation, City, Site Name, CP Name, CP Number, Floor Structure, Estimate Cost (without tax), International Payment Amount, Type of Lift, Executive Name, Assign Person Name, Lead Source, Lead Source Name, Created Via, Status.
*   **3.2. Download Functionality:** Click the "Download" icon/link in a row. Verify that a PDF file of the quotation is generated and downloaded to the local system.
*   **3.3. Manage Columns Visibility:** Open the column management menu and uncheck "Floor Structure" and "Created Via". Verify these columns disappear from the grid immediately.
*   **3.5. Data Formatting:** Ensure "Estimate Cost" is displayed with currency symbols (if applicable) and "CP Number" is formatted correctly as a mobile number.

### 4. Export Feature
*   **4.2. Filter Consistency:** Filter by a specific Sales Person and export. The Excel file must match the filtered table entries.
*   **4.4. Column Headers:** Verify that the exported Excel contains all 16 column headers exactly as they appear in the UI.

### 5. Pagination
*   **5.1. Row Limit:** Selecting "25" rows should display a maximum of 25 records on the current page.
*   **5.2. Page Navigation:** Test "Next" and "Previous" buttons to ensure smooth transition between data chunks.

### 6. UI/UX & Performance
*   **6.2. No Data State:** Verify that a "No Records Found" illustration or message appears when a search/filter returns zero results.
*   **6.3. Responsiveness:** On a tablet or mobile screen, ensure the table remains scrollable and the "Download" button is still accessible.

### 7. Error Handling
*   **7.1. Network Failure:** Simulate a loss of internet connection during data fetch. Verify a clear error message is shown to the user.
*   **7.2. Validation:** Check that the system prevents searching if the date range is logically impossible.

### 8. Integrated Validation
*   **8.1. Integrated Filter and Export:** Apply Date and City filters; verify that the table shows the correct filtered list and the exported file matches this subset exactly.
*   **8.3. Area Filter Accuracy:** Select a specific Area; verify that every record in the table and the resulting export belongs to that area.
