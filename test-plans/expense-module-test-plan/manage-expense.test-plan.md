# Test Plan: Manage Expense

## Module: MATL Management > Manage Expense

---

## Test Suite 1: Page Load & Navigation

### TC-ME-001: Manage Expense page loads successfully
- Navigate to MATL Management > Manage Expense
- Verify the page heading is visible
- Verify the Add / Create button is present
- Verify the expense entries table is rendered

---

## Test Suite 2: Create Expense Entry — Field Validations

### TC-ME-002: Submit empty form shows validation errors
- Click the Add / Create button to open the form
- Leave all fields empty and click Save / Submit
- Verify mandatory field errors appear for Expense Type, Category, Expense Date, and Amount

### TC-ME-003: Expense Type is mandatory
- Open the create form
- Leave Expense Type unselected, fill all other mandatory fields
- Click Save
- Verify validation error appears for Expense Type

### TC-ME-004: Category is mandatory
- Open the create form
- Select a valid Expense Type but leave Category unselected
- Fill all other mandatory fields
- Click Save
- Verify validation error appears for Category

### TC-ME-005: Expense Date is mandatory
- Open the create form
- Select valid Expense Type and Category
- Leave Expense Date empty, fill Amount
- Click Save
- Verify validation error appears for Expense Date

### TC-ME-006: Amount is mandatory
- Open the create form
- Select valid Expense Type and Category, set a valid Expense Date
- Leave Amount empty
- Click Save
- Verify validation error appears for Amount

### TC-ME-007: Amount rejects non-numeric input
- Open the create form
- Fill all mandatory fields with valid values
- Enter alphabetic / special characters in the Amount field
- Click Save
- Verify validation error for Amount

### TC-ME-008: Amount rejects zero or negative values
- Open the create form
- Fill all mandatory fields
- Enter 0 or a negative number in Amount
- Click Save
- Verify validation error for Amount

---

## Test Suite 3: Expense Type → Category Dependency

### TC-ME-009: Category dropdown is empty before Expense Type is selected
- Open the create form
- Without selecting Expense Type, click on the Category dropdown
- Verify no options are available or the dropdown is disabled

### TC-ME-010: Category dropdown loads correct options after selecting Expense Type = PM
- Open the create form
- Select Expense Type = "PM"
- Verify only expense names created under "PM" in Expense Master appear in Category dropdown
- Verify expenses from "Job" or "Others" types are NOT listed

### TC-ME-011: Category dropdown loads correct options after selecting Expense Type = Job
- Open the create form
- Select Expense Type = "Job"
- Verify only expense names created under "Job" in Expense Master appear in Category dropdown

### TC-ME-012: Category dropdown loads correct options after selecting Expense Type = Others
- Open the create form
- Select Expense Type = "Others"
- Verify only expense names created under "Others" in Expense Master appear in Category dropdown

### TC-ME-013: Changing Expense Type clears and reloads Category dropdown
- Open the create form
- Select Expense Type = "PM" — note the categories shown
- Change Expense Type to "Job"
- Verify Category dropdown is reset and now shows only "Job" categories

### TC-ME-014: Inactive expense names do NOT appear in Category dropdown
- Ensure at least one expense name under a type is set to Inactive in Expense Master
- Open the create form and select that Expense Type
- Verify the inactive expense name does NOT appear in Category dropdown

---

## Test Suite 4: Optional Fields

### TC-ME-015: Site Name dropdown is optional — form saves without it
- Open the create form
- Fill all mandatory fields (Expense Type, Category, Expense Date, Amount)
- Leave Site Name unselected
- Click Save
- Verify success and expense appears in list

### TC-ME-016: Site Name dropdown shows available sites
- Open the create form
- Click the Site Name dropdown
- Verify a list of sites is displayed

### TC-ME-017: Note field is optional — form saves without it
- Open the create form
- Fill all mandatory fields, leave Note blank
- Click Save
- Verify success and entry is saved

### TC-ME-018: Note field accepts text input
- Open the create form
- Fill all mandatory fields
- Enter a note (e.g., "Petrol for site visit")
- Click Save
- Verify success and note is stored

### TC-ME-019: Expense To dropdown is optional — form saves without it
- Open the create form
- Fill all mandatory fields, leave Expense To unselected
- Click Save
- Verify success

### TC-ME-020: Expense To dropdown displays available options
- Open the create form
- Click the Expense To dropdown
- Verify a list of recipients / employees is displayed

---

## Test Suite 5: Expense Attachment

### TC-ME-021: Expense Attachment is optional — form saves without it
- Open the create form
- Fill all mandatory fields, do not attach a file
- Click Save
- Verify success

### TC-ME-022: PDF file can be attached
- Open the create form
- Fill all mandatory fields
- Attach a valid PDF file
- Click Save
- Verify success and attachment is visible/downloadable in the record

### TC-ME-023: JPG image file can be attached
- Open the create form
- Fill all mandatory fields
- Attach a valid JPG image file
- Click Save
- Verify success and attachment is visible/downloadable in the record

### TC-ME-024: PNG image file can be attached
- Open the create form
- Fill all mandatory fields
- Attach a valid PNG image file
- Click Save
- Verify success

### TC-ME-025: Unsupported file type is rejected
- Open the create form
- Fill all mandatory fields
- Attempt to attach a file with an unsupported format (e.g., .exe, .docx, .xlsx)
- Verify an error message or the file is rejected

### TC-ME-026: File size limit is enforced (if applicable)
- Attempt to attach a file that exceeds the maximum allowed size
- Verify an appropriate error message is shown

---

## Test Suite 6: Expense Date Field

### TC-ME-027: Expense Date accepts a valid date via date picker
- Open the create form
- Click the Expense Date field
- Select a valid date from the date picker
- Verify the date is populated in the field

### TC-ME-028: Expense Date accepts manual date entry
- Open the create form
- Type a valid date directly into the Expense Date field
- Click Save
- Verify the date is stored correctly

### TC-ME-029: Expense Date rejects invalid date format
- Open the create form
- Enter an invalid date (e.g., "31-13-2024") in the Expense Date field
- Click Save
- Verify validation error for Expense Date

---

## Test Suite 7: Create Expense — Happy Path

### TC-ME-030: Successfully create a complete expense entry with all fields
- Open the create form
- Select a valid Expense Type
- Select a valid Category (dependent on Expense Type)
- Select a Site Name
- Pick a valid Expense Date
- Enter a positive Amount
- Enter a Note
- Select Expense To
- Attach a valid PDF or image file
- Click Save
- Verify success toast / message appears
- Verify the new entry appears in the expense list with correct details

---

## Test Suite 8: Edit / Update Expense Entry

### TC-ME-031: Edit button opens pre-filled form
- From the expense list, click Edit on an existing entry
- Verify all previously saved fields are pre-filled correctly (Expense Type, Category, Date, Amount, Note, Site Name, Expense To)

### TC-ME-032: Update Amount — reflected in Manage Expense data table and view detail
- Open the edit form for an existing entry
- Change the Amount to a new valid value
- Click Save / Update
- Verify success message
- Verify the updated Amount is visible in the Manage Expense data table row
- Click the View icon for that row — verify the updated Amount is shown in the detail view

### TC-ME-033: Update Expense Type and Category — reflected in Manage Expense data table and view detail
- Open the edit form
- Change Expense Type to a different option
- Select a valid Category for the new type
- Click Save
- Verify success
- Verify the updated Expense Type and Category are visible in the data table row
- Click View — verify both updated values appear correctly in the detail view

### TC-ME-034: Cannot save edit with blank Amount
- Open the edit form
- Clear the Amount field
- Click Save
- Verify validation error for Amount

### TC-ME-035: Attachment can be updated in edit mode
- Open the edit form for an entry that has an attachment
- Remove the existing attachment and attach a new file
- Click Save
- Verify success and the new attachment is stored
- Click View on that entry — verify only the new attachment is shown (old one removed)

---

## Test Suite 9: Delete Expense Entry

### TC-ME-036: Expense entry can be deleted
- From the expense list, click Delete on an existing entry
- Confirm the deletion in any confirmation dialog
- Verify success message
- Verify the deleted entry no longer appears in the list

### TC-ME-037: Delete confirmation dialog appears before deletion
- Click Delete on an entry
- Verify a confirmation dialog / prompt is displayed
- Click Cancel — verify the entry is NOT deleted
- Click Delete — verify the entry is removed

---

## Test Suite 10: Search & Filter

### TC-ME-038: List displays all submitted expense entries
- Verify the expense list shows entries added by the current user

### TC-ME-039: Filter by Expense Type narrows the list
- Apply a filter for a specific Expense Type
- Verify only entries with that Expense Type are displayed

### TC-ME-040: Filter by date range narrows the list
- Apply a date range filter
- Verify only entries within that date range are displayed

---

## Test Suite 11: Data Flow to Expense Approval

### TC-ME-041: New expense entry is auto-approved and appears in Expense Approval under Approved status
- Create a new expense entry via Manage Expense
- Navigate to Expense Approval
- Apply Status filter = "Approved"
- Verify the newly created entry is listed (entries from Manage Expense are auto-approved, not pending)

### TC-ME-042: All field values are correctly propagated to Expense Approval view
- Create an expense entry with all fields filled
- Navigate to Expense Approval, apply Status = "Approved", and open the View detail for that entry
- Verify Expense Type, Category, Date, Amount, Note, Attachment match what was entered

---

## Test Suite 12: Pagination

### TC-ME-043: Pagination controls are visible when entries exceed one page
- Ensure enough expense entries exist to trigger pagination
- Verify pagination controls (page numbers, next/previous buttons) are visible

### TC-ME-044: First page displays the correct number of records per page
- Navigate to Manage Expense (default view)
- Note the configured page size (e.g., 10 or 25 per page)
- Verify the first page shows exactly that many records (or fewer if total < page size)

### TC-ME-045: Navigating to the next page loads the next set of entries
- Click the "Next" button or page 2
- Verify a new set of expense entries is displayed
- Verify the records on page 2 are different from those on page 1

### TC-ME-046: Navigating to the previous page returns to the prior set of entries
- Navigate to page 2
- Click the "Previous" button or page 1
- Verify the original first-page entries are displayed again

### TC-ME-047: Navigating to a specific page number loads the correct entries
- Click on a specific page number (e.g., page 3)
- Verify the correct entries for that page are displayed

### TC-ME-048: Last page may show fewer entries than the page size
- Navigate to the last page
- Verify the number of records shown is less than or equal to the configured page size

### TC-ME-049: Total record count shown in pagination matches actual entries
- Note the total count displayed in the pagination bar (e.g., "Showing 1–10 of 30")
- Verify this count matches the actual number of expense entries in the system

---

## Test Suite 13: Edit Update Propagation to Both Masters

> These tests verify that edits made in Manage Expense are correctly reflected in **both** the Manage Expense master and the Expense Approval master — in the data table row AND in the detail view opened via the View button.

### TC-ME-050: Updated Amount is reflected in Manage Expense data table and view detail
- Edit an existing expense entry and change the Amount to a new valid value, click Save
- In Manage Expense: verify the new Amount is visible in the data table row
- In Manage Expense: click the View icon for that row — verify the new Amount is shown in the detail view

### TC-ME-051: Updated Amount is reflected in Expense Approval data table and view detail
- After editing the Amount (see TC-ME-050), navigate to Expense Approval and apply Status = "Approved"
- Verify the updated Amount is visible in the Expense Approval data table row for that entry
- Click the View icon for that row — verify the new Amount is shown in the Expense Approval detail view

### TC-ME-052: Updated Expense Type and Category are reflected in both masters
- Edit an expense entry — change Expense Type and Category, click Save
- In Manage Expense: verify updated Expense Type and Category in data table row and in view detail
- In Expense Approval (Status = Approved): verify updated Expense Type and Category in data table row and in view detail

### TC-ME-053: Updated Expense Date is reflected in both masters
- Edit an expense entry — change the Expense Date to a new valid date, click Save
- In Manage Expense: verify updated date in data table row and in view detail
- In Expense Approval (Status = Approved): verify updated date in data table row and in view detail

### TC-ME-054: Updated Note is reflected in view detail of both masters
- Edit an expense entry — change the Note field, click Save
- In Manage Expense: click View on that entry — verify the updated Note is shown in the detail view
- In Expense Approval (Status = Approved): click View on that entry — verify the updated Note is shown in the detail view

### TC-ME-055: Updated Site Name is reflected in both masters
- Edit an expense entry — change the Site Name, click Save
- In Manage Expense: verify updated Site Name in data table row and in view detail
- In Expense Approval (Status = Approved): verify updated Site Name in data table row and in view detail

### TC-ME-056: Updated Expense To is reflected in view detail of both masters
- Edit an expense entry — change the Expense To field, click Save
- In Manage Expense: click View — verify the updated Expense To value in the detail view
- In Expense Approval (Status = Approved): click View — verify the updated Expense To value in the detail view

### TC-ME-057: Updated Attachment is reflected in view detail of both masters
- Edit an expense entry — replace the existing attachment with a new file, click Save
- In Manage Expense: click View — verify only the new attachment is shown in the detail view
- In Expense Approval (Status = Approved): click View — verify only the new attachment is shown in the detail view

