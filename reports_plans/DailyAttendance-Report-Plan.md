# Daily Attendance Report Comprehensive Test Plan

## Application Overview

The Daily Attendance Report module provides a detailed view of employee attendance records, including check-in/out times, total working hours, and photographic verification (selfies). It is designed to help management monitor punctuality and field presence. The report features a comprehensive data table with 16 columns: **Sr. No., Emp Code, Emp Name, In Time, Out Time, Total Worked Hours, Clock In/Out Sessions, Attendance Type, Leave Type, In Comment, Out Comment, In Selfie, Out Selfie, In Site Name, Out Site Name, and Action.** Key functionalities include **Filters (Date, Type, Branch)**, **Search (Emp Code, Emp Name)**, **Media View (Selfies)**, and **Export to Excel**.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Filtering** | | |
| 1.1 | Filtering | Filter by Date (Single Day & Date Range) | Positive |
| 1.2 | Filtering | Filter by Attendance Type (Present, Late, Half-Day, etc.) | Positive |
| 1.3 | Filtering | Filter by Branch | Positive |
| 1.4 | Filtering | Combine Date + Type + Branch filters | Positive |
| 1.5 | Filtering | Verify "Clear All" resets all filters and search | Positive |
| 1.6 | Filtering | Apply filter with 0 matching records | Negative |
| **2** | **Search Functionality** | | |
| 2.1 | Search | Search by Emp Code (Exact Match) | Positive |
| 2.2 | Search | Search by Emp Name (Partial & Exact) | Positive |
| 2.3 | Search | Search for non-existent Emp Code | Negative |
| 2.4 | Search | Search with special characters in Name | Positive |
| **3** | **Data Table & Grid** | | |
| 3.1 | Grid | Verify visibility of all 16 mandatory columns | Positive |
| 3.2 | Grid | Verify "Total Worked Hours" calculation logic | Positive |
| 3.3 | Grid | Verify visibility of In/Out Selfies (Thumbnail/Icon) | Positive |
| 3.4 | Grid | Verify site names (In Site/Out Site) reflect GPS locations | Positive |
| 3.5 | Grid | Sr. No. increments correctly across pages | Positive |
| 3.6 | Grid | Column Sorting (Emp Name, In Time) | Positive |
| 3.7 | Grid | Verify "Total Worked Hours" for employees with only "In Time" (No Out Time) | Negative |
| 3.8 | Grid | Verify "Attendance Type" color coding (Present=Green, Late=Orange, etc.) | Positive |
| **4** | **Media & Actions** | | |
| 4.1 | Media | Click In/Out Selfie to view full-size image | Positive |
| 4.2 | Media | Verify behavior when Selfie image fails to load | Negative |
| 4.3 | Actions | Click "Action" button (e.g., View Details or Edit) | Positive |
| 4.4 | Sessions | Click "Clock In/Out Sessions" to view multiple logs | Positive |
| 4.5 | Sessions | Verify Session Modal displays: Sr. No, In Time, Out Time, Total Hours | Positive |
| **5** | **Export Feature** | | |
| 5.1 | Export | Export full attendance dataset | Positive |
| 5.2 | Export | Export filtered dataset (Specific Date + Branch) | Positive |
| 5.3 | Export | Verify Excel formatting and all 16 column headers | Positive |
| 5.4 | Export | Export with 0 records | Negative |
| 5.5 | Export | Export after Search (Search Result Export) | Positive |
| **6** | **Pagination** | | |
| 6.1 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| 6.2 | Pagination | Navigate through multiple pages | Positive |
| **7** | **UI/UX & Performance** | | |
| 7.1 | UI/UX | Verify loading state for images and data | Positive |
| 7.2 | UI/UX | Mobile Responsiveness (Horizontal scrolling for 16 columns) | Positive |
| 7.3 | Performance | Load time with high employee count (e.g., 500+ records) | Positive |
| 7.4 | UI/UX | Verify column headers remain sticky while scrolling vertically | Positive |
| **8** | **Integrated Validation** | | |
| 8.1 | Integrated | Apply All Filters (Date + Type + Branch) → Verify UI & Export consistency | Positive |
| 8.2 | Integrated | Search by Name + Filter by Date → Verify session details | Positive |
| 8.3 | Integrated | Search + Export (Verify Excel matches search results) | Positive |
| **9** | **Edge Cases** | | |
| 9.1 | Edge Case | Verify behavior when "In Comment" or "Out Comment" is empty | Positive |
| 9.2 | Edge Case | Verify handling of 24+ hour shifts (Total Worked Hours > 24) | Positive |
| 9.3 | Edge Case | Verify Session Modal displays correct data for multiple logins | Positive |

**Total: 36 tests | 9 suites | 31 Positive | 5 Negative**

---

## Detailed Test Scenarios

### 1. Filtering
*   **1.1. Date Filter:** Select "Today". Verify only today's attendance is shown. Test "Custom Range" for the last 7 days.
*   **1.2. Attendance Type:** Filter by "Present" then "Leave". Verify the "Leave Type" column is populated correctly when "Leave" is selected.

### 2. Search Functionality
*   **2.1. Emp Code:** Enter "EMP001". The table should immediately filter to show only that specific employee's record.
*   **2.2. Emp Name:** Enter "John". Verify all employees with "John" in their name (John Doe, Johnny Smith) are displayed.

### 3. Data Table & Grid
*   **3.2. Worked Hours:** For a record with In Time 09:00 and Out Time 17:00, verify "Total Worked Hours" shows "08:00".
*   **3.4. Site Names:** Verify that "In Site Name" and "Out Site Name" correctly display the location name captured during the clock-in/out event.
*   **3.7. Missing Out Time:** If an employee has only an "In Time" but no "Out Time", verify that "Total Worked Hours" is empty or "00:00" and the row is flagged (if applicable).

### 4. Media & Actions
*   **4.1. Selfie Preview:** Click on the thumbnail in the "In Selfie" column. A modal/popup should open showing the full high-resolution image captured by the employee.
*   **4.4. Sessions View:** If an employee clocked in/out multiple times, click the session count. Verify a breakdown of each individual session is shown.
*   **4.5. Session Modal Audit:** Ensure the modal displays: Sr. No., In Time, Out Time, Total Worked Hours, In/Out Comments, and In/Out Site Names for EACH session.

### 5. Export Feature
*   **5.2. Filtered Export:** Filter by "Branch: Corporate" and "Date: 15-06-2026". Export the file. The Excel should contain only the employees from that branch for that date.
*   **5.3. Excel Data Audit:** Ensure columns like "In Comment" and "Out Comment" are fully visible in the Excel export and not truncated.
*   **5.5. Search Export:** Search for an employee, then export. Verify the Excel file contains only that employee's filtered records.

### 8. Integrated Validation
*   **8.1. Comprehensive Workflow:** 
    1. Apply all available filters: Select a specific **Date Range**, an **Attendance Type** (e.g., Present), and a **Branch**.
    2. Verify the table displays correct data matching all three criteria simultaneously.
    3. Click the **Export** button.
    4. Open the exported Excel file and verify that the data (Emp Code, In/Out Times, Worked Hours, etc.) and row count exactly match the UI listing.
*   **8.3. Cross-Validation:** Apply a Date filter + Search by Name. Verify the total worked hours match the session details modal sum exactly.

### 9. Edge Cases
*   **9.1. Empty Comments:** Verify that if an employee provides no comment, the UI and Excel show a hyphen "-" or "N/A" and do not cause alignment issues.
*   **9.2. Overnight Shifts:** Verify the system correctly calculates hours for employees who clock in at 10 PM and clock out at 6 AM the next day.
