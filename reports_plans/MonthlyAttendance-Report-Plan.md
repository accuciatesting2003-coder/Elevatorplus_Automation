# Monthly Attendance Report Comprehensive Test Plan

## Application Overview

The Monthly Attendance Report provides a chronological view of a specific employee's attendance records over a selected date range. Unlike the daily report, this module is optimized for auditing individual performance and history. Users can select an employee from the comprehensive **User Master dropdown** and define a **Date Range** to retrieve records. The report features a data table with 14 columns: **Sr. No., Date, In Time, Out Time, Total Worked Hours, Clock In/Out Sessions, Attendance Type, Leave Type, In Comment, Out Comment, In Selfie, Out Selfie, In Site Name, and Out Site Name.** It includes **Export to Excel** and **Pagination** for large date ranges.

## Test Scenarios Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| **1** | **Search & Selection** | | |
| 1.1 | Search | Select Employee from Dropdown (User Master) | Positive |
| 1.2 | Search | Search by Employee Name within the dropdown | Positive |
| 1.3 | Search | Define Date Range (e.g., full month) and Search | Positive |
| 1.4 | Search | Search without selecting an Employee | Negative |
| 1.5 | Search | Search with a date range having no records | Negative |
| **2** | **Data Table & Grid** | | |
| 2.1 | Grid | Verify visibility of all 14 mandatory columns | Positive |
| 2.2 | Grid | Verify "Date" column displays records in chronological order | Positive |
| 2.3 | Grid | Verify "Total Worked Hours" accuracy for individual days | Positive |
| 2.4 | Grid | Verify media visibility (In/Out Selfie thumbnails) | Positive |
| 2.5 | Grid | Sr. No. increments correctly across pagination pages | Positive |
| **3** | **Media & Sessions** | | |
| 3.1 | Media | Click In/Out Selfie to view full-size image in modal | Positive |
| 3.2 | Sessions | View "Clock In/Out Sessions" breakdown for a specific date | Positive |
| 3.3 | Sessions | Verify multiple sessions on one date sum correctly to Total Hours | Positive |
| **4** | **Export Feature** | | |
| 4.1 | Export | Export selected employee's monthly history to Excel | Positive |
| 4.2 | Export | Verify Excel row count matches UI record count | Positive |
| 4.3 | Export | Verify all 14 column headers and data types in Excel | Positive |
| **5** | **Pagination** | | |
| 5.1 | Pagination | Navigate through pages for a wide date range (e.g., 90 days) | Positive |
| 5.2 | Pagination | Change Rows per page (10, 25, 50, 100) | Positive |
| **6** | **UI/UX & Performance** | | |
| 6.1 | UI/UX | Verify loading state while fetching attendance history | Positive |
| 6.2 | UI/UX | Mobile Responsiveness (Horizontal scroll for 14 columns) | Positive |
| 6.3 | Performance | Load time for an employee with 31+ days of high-session data | Positive |
| **7** | **Edge Cases** | | |
| 7.1 | Edge Case | Verify handling of Overnight shifts (In at 10 PM, Out at 6 AM) | Positive |
| 7.2 | Edge Case | Verify row display when Out Time/Out Selfie is missing (Pending) | Positive |
| 7.3 | Edge Case | Verify behavior when "Leave Type" is populated (Total Hours should be 0) | Positive |
| **8** | **Integrated Validation** | | |
| 8.1 | Integrated | Full Search Workflow (Emp + Date Range) → Verify UI & Export consistency | Positive |
| 8.2 | Integrated | Cross-Verify Excel: Ensure exported data belongs ONLY to selected Emp | Positive |

**Total: 27 tests | 8 suites | 23 Positive | 4 Negative**

---

## Detailed Test Scenarios

### 1. Search & Selection
*   **1.1. User Selection:** Click the User dropdown. Verify that all employees from the User Master are listed. Select one and ensure their name remains selected.
*   **1.3. Date Range Audit:** Select a Date Range from the 1st to the 30th of the month. Click Search. Verify that only records falling within this range are displayed.

### 2. Data Table & Grid
*   **2.2. Chronology:** Ensure the "Date" column is sorted by default (Ascending or Descending as per requirement) so the monthly history is readable.
*   **2.3. Worked Hours Logic:** For a date where an employee has multiple sessions (e.g., 2h in morning, 4h in afternoon), verify the "Total Worked Hours" column shows "06:00".

### 3. Media & Sessions
*   **3.1. Selfie Validation:** Verify that clicking an "In Selfie" thumbnail opens a high-quality preview. Verify that "N/A" is shown if no selfie was taken.
*   **3.2. Session Modal:** Clicking on "Clock In/Out Sessions" should open a modal listing each individual punch time and site name for that specific day.

### 4. Export Feature
*   **4.1. Monthly Export:** Export the records for the selected month.
*   **4.3. Data Consistency:** Open the Excel file. Verify that "In Comment" and "Out Comment" match the UI exactly and that the "Date" format is consistent (e.g., DD-MM-YYYY).

### 7. Edge Cases
*   **7.1. Midnight Crossover:** If an employee clocks in at 11:00 PM on June 1st and clocks out at 07:00 AM on June 2nd, verify the hours are either split correctly or assigned to the "In" date as per company policy.
*   **7.3. Leave Verification:** For dates marked with an "Attendance Type" of "Leave", ensure the In/Out times are blank/zero and the "Leave Type" (Sick, Casual, etc.) is visible.

### 8. Integrated Validation
*   **8.1. Comprehensive Workflow:** 
    1. Select a specific **Employee** from the dropdown.
    2. Define a **Date Range** (e.g., the previous month).
    3. Click **Search** and verify the table listing displays the correct chronological history for that specific employee only.
    4. Click the **Export** button.
    5. Open the Excel file and verify that the data (Date, In/Out Times, Total Hours) matches the UI row-for-row.
*   **8.2. Export Scope Audit:** Verify that the exported Excel file contains **only** the data for the selected employee and does not leak records from other employees or dates outside the selected range.
