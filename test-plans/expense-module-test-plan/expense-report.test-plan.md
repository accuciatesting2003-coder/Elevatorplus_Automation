# Test Plan: Expense Report

## Module: Expense Module > Expense Report

---

## Test Suite 1: Page Load & Navigation

### TC-ER-001: Expense Report page loads successfully
- Navigate to the Expense Report located under  reports
- Verify the page heading is visible
- Verify the report data table is rendered
- Verify the export option / button is present

---

## Test Suite 2: Data Population — Approved Expenses Only

### TC-ER-002: Approved expense entries appear in the report
- Pre-condition: at least one expense has been approved via Expense Approval
- Navigate to Expense Report
- Verify the approved expense entry is listed

### TC-ER-003: Pending expenses do NOT appear in the report
- Create an expense entry and leave it in Pending status (do not approve)
- Navigate to Expense Report
- Verify the pending entry is NOT listed

### TC-ER-004: Rejected expenses do NOT appear in the report
- Create an expense entry and reject it in Expense Approval
- Navigate to Expense Report
- Verify the rejected entry is NOT listed

### TC-ER-005: Multiple approved expenses are all listed in the report
- Approve multiple expense entries from Expense Approval
- Navigate to Expense Report
- Verify all approved entries appear in the list

---

## Test Suite 3: Report Table Columns

### TC-ER-006: Employee Name column is displayed
- Navigate to Expense Report
- Verify the table contains an "Employee Name" (or equivalent) column

### TC-ER-007: Total Amount column is displayed
- Verify the table contains a "Total Amount" (or equivalent) column

### TC-ER-008: Month column is displayed
- Verify the table contains a "Month" column

### TC-ER-009: Year column is displayed
- Verify the table contains a "Year" column

### TC-ER-010: Employee Name matches the submitter of the expense
- Approve an expense submitted by a specific employee
- Navigate to Expense Report
- Verify the Employee Name shown matches the employee who submitted the expense

### TC-ER-011: Total Amount reflects the approved expense amount correctly
- Note the Amount entered in Manage Expense for a specific entry
- Navigate to Expense Report
- Verify the Total Amount shown for that entry matches the recorded amount

### TC-ER-012: Month and Year correspond to the Expense Date
- Note the Expense Date of a submitted and approved entry (e.g., 15-Jun-2024)
- Navigate to Expense Report
- Verify Month = June and Year = 2024 for that entry

---

## Test Suite 4: View Expense Details

### TC-ER-013: View button is present for each row in the report table
- Navigate to Expense Report
- Verify each row has a View button / icon

### TC-ER-014: Clicking View opens the expense detail view
- Click the View button on any report row
- Verify a detail view (modal, panel, or page) opens

### TC-ER-015: Detail view shows Employee Name
- Click View on a report entry
- Verify the Employee Name is prominently displayed

### TC-ER-016: Detail view shows Expense Type
- Click View on a report entry
- Verify the Expense Type is displayed and matches the original entry

### TC-ER-017: Detail view shows Category
- Click View on a report entry
- Verify the Category is displayed and matches what was selected in Manage Expense

### TC-ER-018: Detail view shows Expense Date
- Click View on a report entry
- Verify the Expense Date is displayed and matches the original entry

### TC-ER-019: Detail view shows Amount
- Click View on a report entry
- Verify the Amount is displayed and matches the original entry

### TC-ER-020: Detail view shows Note (if provided)
- Click View on a report entry that had a Note added
- Verify the Note is displayed correctly

### TC-ER-021: Detail view shows Site Name (if provided)
- Click View on a report entry that had a Site Name selected
- Verify the Site Name is displayed

### TC-ER-022: Detail view shows Expense To (if provided)
- Click View on a report entry that had Expense To selected
- Verify the Expense To value is displayed

### TC-ER-023: Detail view shows attachment (if provided)
- Click View on a report entry that had an attachment
- Verify the attachment is visible or a download / view link is present

---

## Test Suite 5: Export Functionality

### TC-ER-024: Export option is visible on the report page
- Navigate to Expense Report
- Verify an Export button (PDF, Excel, CSV, or equivalent) is visible

### TC-ER-025: Export button is visible / accessible from the detail view
- Open the detail view of a report entry
- Verify an Export option is present within the detail view

### TC-ER-026: Exporting report downloads a file
- Click the Export button on the report page
- Verify a file download is triggered (e.g., PDF, Excel, or CSV)
- Verify the downloaded file is not empty

### TC-ER-027: Exported file contains Employee Name
- Export the report
- Open the exported file
- Verify Employee Name is present in the exported data

### TC-ER-028: Exported file contains Total Amount
- Export the report
- Open the exported file
- Verify Total Amount column / field is present and correct

### TC-ER-029: Exported file contains Month and Year
- Export the report
- Open the exported file
- Verify Month and Year fields are present and match the report data

### TC-ER-030: Exported file contains Expense Type and Category
- Export the report
- Open the exported file
- Verify Expense Type and Category columns are present

### TC-ER-031: Exported data matches data displayed in the report table
- Compare the data in the export with what is visible on screen
- Verify all rows and columns match without truncation or missing records

### TC-ER-032: Exporting from detail view exports that specific entry's data
- Open the detail view of a specific approved expense
- Click Export from the detail view
- Verify the exported file contains only / primarily that entry's full details including employee name

---

## Test Suite 6: Filter / Search on Report

### TC-ER-033: Report can be filtered by Employee Name
- Apply a filter for a specific employee name
- Verify only that employee's approved expenses are shown

### TC-ER-034: Report can be filtered by Month
- Apply a filter for a specific month (e.g., June)
- Verify only entries with Expense Date in that month are shown

### TC-ER-035: Report can be filtered by Year
- Apply a filter for a specific year (e.g., 2024)
- Verify only entries with Expense Date in that year are shown

### TC-ER-036: No results message when filters match no data
- Apply filters that are known to match no approved expense records
- Verify "No records found" or equivalent empty state is displayed

### TC-ER-037: Clearing filters restores the full approved expense list
- Apply one or more filters
- Clear all filters
- Verify all approved expense entries are visible again

---

## Test Suite 7: Data Integrity — End-to-End

### TC-ER-038: Full flow — create, approve, verify in report
- Create a new expense entry in Manage Expense with all fields filled
- Approve it via Expense Approval
- Navigate to Expense Report
- Verify the entry appears with correct Employee Name, Amount, Month, Year
- Click View and verify all field values match the original entry
- Export and verify the exported file contains the correct data

### TC-ER-039: Approving multiple expenses for one employee sums correctly in report
- Create and approve two or more expenses for the same employee in the same month
- Navigate to Expense Report
- Verify the Total Amount displayed for that employee and month is the sum of all approved expenses

### TC-ER-040: Report reflects real-time updates after new approvals
- Note the current state of the report
- Approve a new expense in Expense Approval
- Return to Expense Report (refresh if needed)
- Verify the newly approved expense is now listed in the report

---


## Test Suite 9: Pagination

### TC-ER-047: Pagination controls are visible when records exceed one page
- Ensure enough approved expense records exist to trigger pagination
- Verify pagination controls (page numbers, next/previous buttons) are visible

### TC-ER-048: First page displays the correct number of records per page
- Navigate to Expense Report (default view)
- Note the configured page size (e.g., 10 or 25 per page)
- Verify the first page shows exactly that many records (or fewer if total < page size)

### TC-ER-049: Navigating to the next page loads the next set of records
- Click the "Next" button or page 2
- Verify a new set of report records is displayed
- Verify the records on page 2 are different from those on page 1

### TC-ER-050: Navigating to the previous page returns to the prior set of records
- Navigate to page 2
- Click the "Previous" button or page 1
- Verify the original first-page records are displayed again

### TC-ER-051: Navigating to a specific page number loads the correct records
- Click on a specific page number (e.g., page 3)
- Verify the correct records for that page are displayed

### TC-ER-052: Last page may show fewer records than the page size
- Navigate to the last page
- Verify the number of records is less than or equal to the configured page size

### TC-ER-053: Total record count shown in pagination matches actual report records
- Note the total count displayed in the pagination bar (e.g., "Showing 1–10 of 60")
- Verify this count matches the actual number of approved expense records in the system

### TC-ER-054: Pagination persists correctly when a status filter is applied
- Apply Status filter = "Active"
- If multiple pages exist, navigate to page 2
- Verify the Active filter remains applied on page 2 (does not reset to All or default)

### TC-ER-055: Pagination persists correctly when a filter (employee / month / year) is applied
- Apply a filter (e.g., filter by a specific employee)
- If multiple pages exist, navigate to page 2
- Verify the filter remains applied on page 2 and only filtered records are shown
