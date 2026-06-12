# Test Plan: Expense Master

## Module: MATL > Expense Master

---

## Test Suite 1: Page Load & Navigation

### TC-EM-001: Expense Master page loads successfully
- Navigate to MATL > Expense Master
- Verify the page heading is visible
- Verify the Add / Create button is present
- Verify the expense list table is rendered

---

## Test Suite 2: Create Expense — Field Validations

### TC-EM-002: Submit empty form shows validation errors
- Click the Add / Create button to open the form
- Leave all fields empty and click Save / Submit
- Verify mandatory field errors appear for "Expense Type" and "Expense Name"

### TC-EM-003: Expense Type dropdown is required
- Open the create form
- Leave Expense Type unselected, enter a valid Expense Name
- Click Save
- Verify validation error appears for Expense Type

### TC-EM-004: Expense Name field is required
- Open the create form
- Select a valid Expense Type, leave Expense Name blank
- Click Save
- Verify validation error appears for Expense Name

### TC-EM-005: Expense Name rejects blank / whitespace-only input
- Open the create form
- Select a valid Expense Type
- Enter only spaces in the Expense Name field
- Click Save
- Verify validation error is shown

### TC-EM-006: Expense Name accepts valid text
- Open the create form
- Select a valid Expense Type from the dropdown (e.g., "PM")
- Enter a valid expense name (e.g., "Travel Allowance")
- Click Save
- Verify success toast / message appears
- Verify the new expense appears in the list

---

## Test Suite 3: Expense Type Dropdown

### TC-EM-007: Expense Type dropdown displays all available options
- Open the create form
- Click the Expense Type dropdown
- Verify the list contains the expected options (PM, Job, Others, etc.)

### TC-EM-008: Expense Type selection persists in form
- Open the create form
- Select an Expense Type (e.g., "Job")
- Verify the selected value is displayed in the dropdown before saving

### TC-EM-009: Each Expense Type option can be selected
- For each available Expense Type option, open a new form, select that option, enter a valid Expense Name, save, and verify success

---

## Test Suite 4: Create Expense Against Different Categories

### TC-EM-010: Add expense against PM
- Open the create form
- Select Expense Type = "PM"
- Enter a valid expense name
- Click Save
- Verify the expense is created and listed with Expense Type = "PM"

### TC-EM-011: Add expense against Job
- Open the create form
- Select Expense Type = "Job"
- Enter a valid expense name
- Click Save
- Verify the expense is created and listed with Expense Type = "Job"

### TC-EM-012: Add expense against Others
- Open the create form
- Select Expense Type = "Others"
- Enter a valid expense name
- Click Save
- Verify the expense is created and listed with Expense Type = "Others"

---

## Test Suite 5: Edit / Update Expense

### TC-EM-013: Edit button opens pre-filled form
- From the expense list, click Edit on an existing expense
- Verify the form opens with Expense Type and Expense Name pre-filled with existing values

### TC-EM-014: Update Expense Name successfully
- Open the edit form for an existing expense
- Clear the Expense Name and enter a new valid name
- Click Save / Update
- Verify success message
- Verify the updated name appears in the list

### TC-EM-015: Update Expense Type successfully
- Open the edit form for an existing expense
- Change the Expense Type to a different valid option
- Click Save / Update
- Verify success message
- Verify the updated Expense Type is reflected in the list

### TC-EM-016: Cannot save edit with empty Expense Name
- Open the edit form for an existing expense
- Clear the Expense Name field
- Click Save
- Verify validation error for Expense Name

### TC-EM-017: Cannot save edit with no Expense Type selected
- Open the edit form for an existing expense
- Clear / deselect the Expense Type
- Click Save
- Verify validation error for Expense Type

---

## Test Suite 6: Expense Name Uniqueness

### TC-EM-018: Duplicate expense name under same Expense Type shows error
- Create an expense with Expense Type = "PM" and name "Fuel Cost"
- Attempt to create another expense with the same Expense Type and name
- Verify an appropriate duplicate error message is shown

### TC-EM-019: Same expense name under different Expense Types is allowed
- Create an expense with Expense Type = "PM" and name "Fuel Cost"
- Create another expense with Expense Type = "Job" and the same name "Fuel Cost"
- Verify both are created successfully (different types allow same name)

### TC-EM-020: Updating expense name to an existing active and inactive  name under the same type shows error
- Open the edit form for an expense
- Change the Expense Name to a name already used under the same Expense Type
- Click Save
- Verify duplicate error message

---

## Test Suite 7: Data Propagation to Manage Expense

### TC-EM-021: Expense added under PM appears in Manage Expense category dropdown when PM is selected
- Add an expense with Expense Type = "PM" and name "Test PM Expense"
- Navigate to Manage Expense
- Select Expense Type = "PM"
- Verify "Test PM Expense" appears in the Category dropdown

### TC-EM-022: Expense added under Job appears in Manage Expense category dropdown when Job is selected
- Add an expense with Expense Type = "Job" and name "Test Job Expense"
- Navigate to Manage Expense
- Select Expense Type = "Job"
- Verify "Test Job Expense" appears in the Category dropdown

### TC-EM-023: Expense under PM does NOT appear in category dropdown when Job is selected
- Add an expense with Expense Type = "PM" and name "PM Only Expense"
- Navigate to Manage Expense
- Select Expense Type = "Job"
- Verify "PM Only Expense" does NOT appear in the Category dropdown

---

## Test Suite 8: Status / Active-Inactive

### TC-EM-024: Newly created expense defaults to Active status
- Create a new expense
- Verify status column shows Active in the list

### TC-EM-025: Expense status can be toggled to Inactive
- From the list, toggle status of an active expense to Inactive
- Verify the status changes to Inactive

### TC-EM-026: Inactive expense does not appear in Manage Expense category dropdown
- Set an expense to Inactive
- Navigate to Manage Expense
- Select the corresponding Expense Type
- Verify the deactivated expense name does NOT appear in the Category dropdown

---

## Test Suite 9: Search & Filter

### TC-EM-027: Search by expense name filters results
- Enter an existing expense name in the search / filter field
- Verify only matching expenses are shown

### TC-EM-028: Search with non-existent name shows no results
- Enter a name that does not exist
- Verify "No records found" or equivalent empty state is displayed

### TC-EM-029: Filter by Expense Type narrows results
- Apply a filter for a specific Expense Type (e.g., "PM")
- Verify only expenses with that Expense Type are displayed

---

## Test Suite 10: Status Filter — Active / Inactive / All

### TC-EM-030: By default only Active records are displayed
- Navigate to Expense Master without applying any status filter
- Verify the list shows only Active expense records
- Verify no Inactive records are visible in the default view

### TC-EM-031: Status filter = Active shows only Active records
- Apply the Status filter with value "Active"
- Verify only Active expense records are displayed
- Verify no Inactive records appear in the list

### TC-EM-032: Status filter = Inactive shows only Inactive records
- Apply the Status filter with value "Inactive"
- Verify only Inactive expense records are displayed
- Verify no Active records appear in the list

### TC-EM-033: Status filter = All shows both Active and Inactive records
- Apply the Status filter with value "All"
- Verify both Active and Inactive expense records are displayed together

### TC-EM-034: Record count — All count equals Active count plus Inactive count
- Apply Status filter = "All" and note the total record count
- Apply Status filter = "Active" and note the Active record count
- Apply Status filter = "Inactive" and note the Inactive record count
- Verify: All count = Active count + Inactive count

### TC-EM-035: Clearing the status filter reverts to default Active-only view
- Apply Status filter = "Inactive"
- Clear / reset the status filter
- Verify the list returns to showing only Active records (default behavior)

---

## Test Suite 11: Pagination

### TC-EM-036: Pagination controls are visible when records exceed one page
- Ensure enough expense records exist to trigger pagination
- Verify pagination controls (page numbers, next/previous buttons) are visible at the bottom of the list

### TC-EM-037: First page displays the correct number of records per page
- Navigate to Expense Master (default view)
- Note the page size (e.g., 10 or 25 records per page)
- Verify the first page shows exactly that many records (or fewer if total < page size)

### TC-EM-038: Navigating to the next page loads the next set of records
- Click the "Next" button or page 2
- Verify a new set of records is displayed
- Verify the records on page 2 are different from those on page 1

### TC-EM-039: Navigating to the previous page returns to the prior set of records
- Navigate to page 2
- Click the "Previous" button or page 1
- Verify the original first-page records are displayed again

### TC-EM-040: Navigating to a specific page number loads the correct records
- Click on a specific page number (e.g., page 3)
- Verify the correct records for that page are displayed

### TC-EM-041: Last page may show fewer records than the page size
- Navigate to the last page
- Verify the number of records shown is less than or equal to the configured page size

### TC-EM-042: Total record count shown in pagination matches actual records
- Note the total count displayed in the pagination bar (e.g., "Showing 1–10 of 45")
- Verify this total matches the actual number of expense records in the system

### TC-EM-043: Pagination persists correctly when a status filter is applied
- Apply Status filter = "Active"
- If multiple pages exist, navigate to page 2
- Verify the Active filter remains applied on page 2 (does not reset to All or default)
