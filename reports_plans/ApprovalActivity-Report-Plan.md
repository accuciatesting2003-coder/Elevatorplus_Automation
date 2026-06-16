# Approval Activity Report Comprehensive Test Plan

## Application Overview

The Approval Activity Report module tracks the audit trail of approval processes configured within the system. It maintains a detailed log of every action taken during an approval flow (Initiated, Approved, Modified, Rejected) across various modules. The data table consists of 10 columns: **Sr. No., Action, Site/Firm, Type, Step, Performed By, Branch, Entity Details, Remark, and Date.** The module features **Filtering (Date Range, Approval Type, Action)**, **Search (Remark, Step)**, and **Pagination**.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Action: "Approved" | Positive |
| 1.2 | Filtering | Filter by Action: "Rejected" | Positive |
| 1.3 | Filtering | Filter by Action: "Modified" | Positive |
| 1.4 | Filtering | Filter by Action: "Initiated" | Positive |
| 1.5 | Filtering | Filter by Approval Type (PO, Job, Work Order, etc.) | Positive |
| 1.6 | Filtering | Filter by Date Range: Single day (Today) | Positive |
| 1.7 | Filtering | Filter by Date Range: Custom Range (e.g., last 3 months) | Positive |
| 1.8 | Filtering | Combine Action + Type Filter | Positive |
| 1.9 | Filtering | Combine Action + Type + Date Range Filter | Positive |
| 1.10 | Filtering | Verify "Clear All" resets all filter dropdowns | Positive |
| 1.11 | Filtering | Filter with no matching data (Empty state) | Negative |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Remark: Full string match | Positive |
| 2.2 | Search | Search by Remark: Partial string match | Positive |
| 2.3 | Search | Search by Step: Full string (e.g., "Step 1") | Positive |
| 2.4 | Search | Search by Step: Partial string (e.g., "Final") | Positive |
| 2.5 | Search | Search with trailing/leading spaces (Auto-trim check) | Positive |
| 2.6 | Search | Search with special characters (e.g., #, -, /) | Positive |
| 2.7 | Search | Case-insensitive search check (e.g., "step" vs "STEP") | Positive |
| 2.8 | Search | Search with no results found | Negative |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of all 10 mandatory columns | Positive |
| 3.2 | Grid | Verify "Action" badge colors (Green: Approved, Red: Rejected, Blue: Initiated, Yellow: Modified) | Positive |
| 3.3 | Grid | Verify "Date" format consistency (e.g., DD/MM/YYYY HH:mm) | Positive |
| 3.4 | Grid | Verify "Performed By" displays the full name of the user | Positive |
| 3.5 | Grid | Tooltips for long "Remark" or "Entity Details" text | Positive |
| 3.6 | Grid | Column Sorting: Date (Newest to Oldest & vice versa) | Positive |
| 3.7 | Grid | Column Sorting: Action (Alphabetical) | Positive |
| 3.8 | Grid | Column Sorting: Performed By | Positive |
| 3.9 | Grid | Horizontal scrolling on smaller screen resolutions | Positive |
| 3.10 | Grid | Sr. No. increments correctly across multiple pages | Positive |
| **4** | **Pagination** | | |
| 4.1 | Pagination | Change "Rows per page" (10, 25, 50, 100) | Positive |
| 4.2 | Pagination | Navigate: Next Page / Previous Page | Positive |
| 4.3 | Pagination | Navigate: Jump to First Page / Last Page | Positive |
| 4.4 | Pagination | Verify pagination updates after applying filters | Positive |
| 4.5 | Pagination | Page 1 displayed by default on fresh load | Positive |
| **5** | **Integrated Validation** | | |
| 5.1 | Integrated | Apply Multi-Filter + Search -> Verify intersection accuracy | Positive |
| 5.2 | Integrated | "Clear All" -> Verify Search is cleared AND table resets | Positive |
| 5.3 | Integrated | Refresh Page -> Verify if filter state is maintained (if supported) | Positive |
| 5.4 | Integrated | Filter by Type -> Verify "Action" options update (if dynamic) | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify Skeleton/Spinner during data load | Positive |
| 6.2 | UI/UX | Verify "No Records Found" centered UI | Positive |
| 6.3 | UI/UX | Mobile Responsiveness: Column stacking or scrolling | Positive |
| 6.4 | Performance | Load 1000+ records without browser lag | Positive |
| 6.5 | Performance | Rapid filter switching (Stress test) | Positive |
| **7** | **Error Handling** | | |
| 7.1 | Error | Handle API 500 (Internal Server Error) with Toast | Negative |
| 7.2 | Error | Handle API 404/Timeout errors | Negative |
| 7.3 | Error | Invalid Date Range (Start Date > End Date) | Negative |

**Total: 44 tests | 7 suites | 38 Positive | 6 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1-1.4. Action Precision:** Ensure "Approved" filter *never* shows "Modified" or "Rejected" records.
*   **1.9. Layered Filtering:** Apply "Action: Approved" + "Type: Purchase Order" + "Date: Last 7 Days". The table must show the intersection of all three.
*   **1.10. Reset State:** Verify that clicking "Clear All" returns every dropdown to its placeholder text (e.g., "Select Type").

### 2. Search Functionality
*   **2.1. Remark Accuracy:** Searching for a specific job number mentioned in a Remark should isolate that entry.
*   **2.5. Trim Logic:** Inputting " Step 1 " should be treated the same as "Step 1".
*   **2.7. Case Insensitivity:** Verify that "final" and "FINAL" yield identical results for the Step search.

### 3. Data Table & Grid
*   **3.2. Visual Indicators:** Verify that "Rejected" actions have a distinct red UI to alert the user immediately.
*   **3.3. Chronology:** Verify that the Date column accurately reflects the time of the action taken in the panel.
*   **3.6. Default Sort:** Check if the table loads by default with the most recent approval activity at the top.

### 4. Pagination
*   **4.1. Record Count:** If "10 rows" is selected, count the rows to ensure there are exactly 10 (unless it's the last page).
*   **4.4. Dynamic Pagination:** If a filter reduces results from 100 to 5, pagination should disappear or show only 1 page.

### 5. Integrated Validation
*   **5.1. Complex Query:** Combine a Search for "Urgent" + Filter by "Work Order". Verify results match both.
*   **5.2. Reset Consistency:** Ensure that resetting filters also clears any active search query to prevent hidden state issues.

### 6. UI/UX & Performance
*   **6.3. Column Integrity:** On mobile, ensure columns like "Action" and "Performed By" are prioritized or easily accessible via horizontal scroll.
*   **6.4. Data Volume:** Test with a simulated high-volume database to ensure sorting and filtering remain snappy.

### 7. Error Handling
*   **7.1. Graceful Failure:** If the backend is down, the user should see a "Something went wrong" message rather than an empty white screen.
*   **7.3. Date Validation:** If the user selects an end date earlier than the start date, the system should ideally block the request or show a validation error.
