# Test Plan: Expense Approval

## Module: Expense Module > Expense Approval

---

## Test Suite 1: Page Load & Navigation

### TC-EA-001: Expense Approval page loads successfully
- Navigate to the Expense Approval module
- Verify the page heading is visible
- Verify the Status filter field is present
- Verify the Date Range filter field is present
- Verify the expense entries table is rendered

---

## Test Suite 2: Data Flow from Manage Expense

### TC-EA-002: Entry created in Manage Expense is auto-approved and visible in Expense Approval
- Create a new expense entry in Manage Expense
- Navigate to Expense Approval
- Apply Status filter = "Approved"
- Verify the newly created entry appears in the list (entries from Manage Expense are auto-approved)

### TC-EA-003: Auto-approved entry reflects correct Expense Type in Expense Approval list
- Create an expense in Manage Expense with a specific Expense Type
- In Expense Approval (Status = Approved), verify the Expense Type is displayed correctly

### TC-EA-004: Auto-approved entry reflects correct Amount in Expense Approval list
- Create an expense in Manage Expense with a specific Amount
- In Expense Approval (Status = Approved), verify the Amount is displayed correctly

---

## Test Suite 3: View Expense Details

### TC-EA-005: View icon is present for each entry in the table
- Navigate to Expense Approval
- Verify each row in the data table has a View icon / button

### TC-EA-006: Clicking View icon opens expense detail panel / modal
- Click the View icon for any expense entry
- Verify a detail view (modal, panel, or page) opens

### TC-EA-007: Expense detail shows Expense Type correctly
- Click View on an expense entry created with a specific Expense Type
- Verify the displayed Expense Type matches what was entered in Manage Expense

### TC-EA-008: Expense detail shows Category correctly
- Click View on an expense entry
- Verify the displayed Category matches the category selected during Manage Expense entry

### TC-EA-009: Expense detail shows Expense Date correctly
- Click View on an expense entry
- Verify the displayed Expense Date matches the date entered in Manage Expense

### TC-EA-010: Expense detail shows Amount correctly
- Click View on an expense entry
- Verify the displayed Amount matches the amount entered in Manage Expense

### TC-EA-011: Expense detail shows Note correctly (if added)
- Click View on an expense entry that includes a Note
- Verify the displayed Note matches what was entered

### TC-EA-012: Expense detail shows attachment (if added)
- Click View on an expense entry that has an attachment
- Verify the attachment is visible or a download link is available

### TC-EA-013: Expense detail shows Site Name (if selected)
- Click View on an expense entry that has a Site Name
- Verify the Site Name is displayed

### TC-EA-014: Expense detail shows Expense To (if selected)
- Click View on an expense entry that has an Expense To value
- Verify the Expense To field is displayed

---

## Test Suite 4: Status Filter

### TC-EA-015: Status filter = Approved shows auto-approved entries from Manage Expense
- Set the Status filter to "Approved"
- Verify entries created via Manage Expense (which are auto-approved) are displayed

### TC-EA-016: Status filter shows all entries when set to "All" or left blank
- Set the Status filter to "All" (or clear it)
- Verify all expense entries across all statuses are visible

### TC-EA-017: No entries are shown without selecting a status if the default view is empty
- Navigate to Expense Approval without applying any status filter
- Note whether entries appear by default or require a status selection to display

---

## Test Suite 5: Date Range Filter

### TC-EA-018: Date range filter shows entries within selected range
- Set a Date Range (e.g., from 01-Jun-2024 to 30-Jun-2024)
- Verify only expense entries whose Expense Date falls within that range are displayed

### TC-EA-019: Date range filter hides entries outside the range
- Set a narrow Date Range
- Verify entries with Expense Date outside that range are NOT displayed

### TC-EA-020: Clearing date range filter restores full list
- Apply a Date Range filter
- Clear the Date Range
- Verify all entries are visible again

### TC-EA-021: Date range with Start Date after End Date shows validation or empty result
- Enter a Start Date that is later than the End Date
- Verify an appropriate validation error or empty result

---

## Test Suite 6: Combined Filters

### TC-EA-022: Status = Approved + Date Range filter narrows results correctly
- Set Status = "Approved" and a specific Date Range
- Verify only Approved entries within that date range are shown

### TC-EA-023: No results message when filters match no data
- Apply filters that are known to match no records
- Verify "No records found" or equivalent empty state message is displayed

---

## Test Suite 7: Pagination

### TC-EA-024: Pagination controls are visible when entries exceed one page
- Ensure enough expense entries exist to trigger pagination
- Verify pagination controls (page numbers, next/previous buttons) are visible

### TC-EA-025: First page displays the correct number of records per page
- Navigate to Expense Approval (default view)
- Note the configured page size (e.g., 10 or 25 per page)
- Verify the first page shows exactly that many records (or fewer if total < page size)

### TC-EA-026: Navigating to the next page loads the next set of entries
- Click the "Next" button or page 2
- Verify a new set of entries is displayed
- Verify the records on page 2 are different from those on page 1

### TC-EA-027: Navigating to the previous page returns to the prior set of entries
- Navigate to page 2
- Click the "Previous" button or page 1
- Verify the original first-page entries are displayed again

### TC-EA-028: Navigating to a specific page number loads the correct entries
- Click on a specific page number (e.g., page 3)
- Verify the correct entries for that page are displayed

### TC-EA-029: Last page may show fewer entries than the page size
- Navigate to the last page
- Verify the number of records is less than or equal to the configured page size

### TC-EA-030: Total record count shown in pagination matches actual entries
- Note the total count displayed in the pagination bar (e.g., "Showing 1–10 of 50")
- Verify this count matches the actual number of expense entries visible under the current filter

### TC-EA-031: Pagination persists correctly when a status filter is applied
- Apply Status filter = "Approved"
- If multiple pages exist, navigate to page 2
- Verify the Approved filter remains applied on page 2 (does not reset)

### TC-EA-032: Pagination persists correctly when a date range filter is applied
- Apply a Date Range filter
- If multiple pages exist, navigate to page 2
- Verify the date range filter remains applied on page 2

---

## Test Suite 8: Edit Update Propagation from Manage Expense

> These tests verify that when an entry is edited in Manage Expense, the updated values are correctly reflected in Expense Approval — both in the data table row and in the detail view opened via the View button.

### TC-EA-033: Updated Amount from Manage Expense is reflected in Expense Approval data table
- Edit an existing expense in Manage Expense — change the Amount, save
- Navigate to Expense Approval, apply Status = "Approved"
- Find that entry in the data table — verify the updated Amount is displayed in the row

### TC-EA-034: Updated Amount from Manage Expense is reflected in Expense Approval view detail
- After editing the Amount in Manage Expense (see TC-EA-033), click the View icon for that entry in Expense Approval
- Verify the detail view shows the updated Amount (not the original value)

### TC-EA-035: Updated Expense Type and Category are reflected in Expense Approval data table and view detail
- Edit an expense in Manage Expense — change Expense Type and Category, save
- In Expense Approval (Status = Approved): verify updated Expense Type and Category in the data table row
- Click View for that entry — verify updated Expense Type and Category in the detail view

### TC-EA-036: Updated Expense Date is reflected in Expense Approval data table and view detail
- Edit an expense in Manage Expense — change the Expense Date, save
- In Expense Approval (Status = Approved): verify updated date in the data table row
- Click View for that entry — verify updated date in the detail view

### TC-EA-037: Updated Note is reflected in Expense Approval view detail
- Edit an expense in Manage Expense — change the Note, save
- In Expense Approval (Status = Approved): click View for that entry
- Verify the updated Note is shown in the detail view (not the original Note)

### TC-EA-038: Updated Site Name is reflected in Expense Approval data table and view detail
- Edit an expense in Manage Expense — change the Site Name, save
- In Expense Approval (Status = Approved): verify updated Site Name in the data table row
- Click View — verify updated Site Name in the detail view

### TC-EA-039: Updated Expense To is reflected in Expense Approval view detail
- Edit an expense in Manage Expense — change the Expense To field, save
- In Expense Approval (Status = Approved): click View for that entry
- Verify the updated Expense To value is shown in the detail view

### TC-EA-040: Updated Attachment is reflected in Expense Approval view detail
- Edit an expense in Manage Expense — replace the attachment with a new file, save
- In Expense Approval (Status = Approved): click View for that entry
- Verify only the new attachment is shown (old attachment no longer present)
