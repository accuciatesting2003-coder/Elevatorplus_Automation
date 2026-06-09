# Lost Reason Master Test Plan

## Application Overview

The Lost Reason Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/lost-reason. It allows admin users to manage reasons why a sale was lost. The page has two main sections: (1) an "Add Lost Reason" form at the top, and (2) a data table listing all lost reason records below.

The Add Lost Reason form contains one field: "Lost Reason *" (mandatory text input). An info icon button is present next to the "Add Lost Reason" heading that opens a side panel with guidance notes. The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Lost Reason" mode with the Lost Reason field pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) and the action button changes to "Update".

## Actual UI Locators (Inferred for consistency)

### Form Locators
- **Page/nav heading:** `page.getByRole('heading', { name: /Lost Reason Master/i })`
- **Add mode form heading:** `page.getByRole('heading', { name: /Add Lost Reason/i })`
- **Update mode form heading:** `page.getByRole('heading', { name: /Update Lost Reason/i })`
- **Lost Reason input:** `page.getByRole('textbox', { name: /Lost Reason \*/i })`
- **Clear button:** `page.getByRole('button', { name: / Clear/i })`
- **Submit button:** `page.getByRole('button', { name: / Submit/i })`
- **Update button:** `page.getByRole('button', { name: / Update/i })`
- **Status dropdown (edit mode only):** `page.getByRole('combobox', { name: /Status \*/i })` — native <select> with options: "Select Status", "Active", "Inactive"

### Table Locators
- **Table rows:** `page.locator('table tbody tr')`
- **Edit icon in row:** `page.locator('table tbody tr').nth(i).getByRole('img', { name: 'Edit' })`
- **Status filter dropdown:** `page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) })`
- **Rows-per-page dropdown:** `page.locator('select').first()`
- **Search input:** `page.getByRole('textbox', { name: /Lost Reason/i }).last()`
- **Table content:** `page.locator('table tbody').getByText(name)`

### Validation Error Messages
- **Empty Lost Reason field:** `Please enter lost reason`

### Toast Notification Locators
- **Success toast (create):** `page.locator('[role="alert"]').filter({ hasText: /created successfully/i })`
- **Success toast (update):** `page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })`
- **Error toast (duplicate):** `page.locator('[role="alert"]').filter({ hasText: /something went wrong/i })`

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Lost Reason Master page loads successfully
**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/lost-reason
    - expect: The page URL should be https://stage.elevatorplus.net/master/lost-reason
    - expect: The 'Add Lost Reason' card heading should be visible
    - expect: The 'Lost Reason *' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display lost reason records with 'Active' status by default

#### 1.2. TC-SM-02: Verify page elements, table columns, and toolbar layout
**Steps:**
  1. Navigate to /master/lost-reason and inspect the form section
    - expect: The form section heading should read 'Add Lost Reason'
    - expect: An info icon button is present next to the heading
  2. Inspect the data table toolbar
    - expect: 'Show:' rows-per-page dropdown (default 25), 'Status:' filter dropdown (default Active), 'Import', 'Export Excel', and 'Search Lost Reason' input should be present
  3. Inspect the table header row
    - expect: Column headers: Sr. No., Action, Lost Reason, and Status are present

### 2. Add Lost Reason - Happy Path

#### 2.1. TC-ADD-01: Successfully create a new Lost Reason
**Steps:**
  1. Navigate to /master/lost-reason
  2. Enter 'Price Too High' in 'Lost Reason *' and click 'Submit'
    - expect: Success toast 'Lost Reason created successfully!' appears
    - expect: Input field is cleared
    - expect: Record 'Price Too High' appears in the table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a Lost Reason with special characters
**Steps:**
  1. Navigate to /master/lost-reason
  2. Type 'Competitor Discount (Special Offer)' and click 'Submit'
    - expect: Success toast 'Lost Reason created successfully!' appears
    - expect: Record appears in the table with the exact name

#### 2.3. TC-ADD-03: Successfully create a Lost Reason with a long name
**Steps:**
  1. Enter 'Customer decided to postpone the project indefinitely due to internal restructuring and budget cuts'
  2. Click 'Submit'
    - expect: Success toast 'Lost Reason created successfully!' appears
    - expect: Record appears in the data table

#### 2.4. TC-ADD-04: Successfully create multiple Lost Reason records sequentially
**Steps:**
  1. Create 'Project Cancelled', then immediately create 'Delayed Decision'
    - expect: Both records appear in the table with Status 'Active'

### 3. Mandatory Field Validation

#### 3.1. TC-VAL-01: Submit form with empty Lost Reason field shows inline validation error
**Steps:**
  1. Click 'Submit' without entering any value
    - expect: Inline validation error `Please enter lost reason` appears below the field
    - expect: No new record is created

#### 3.2. TC-VAL-02: Inline error clears when valid input is entered after failed validation
**Steps:**
  1. Click 'Submit' to trigger error, then type 'Inquiry Only' in the field
    - expect: The inline error message 'Please enter lost reason' is no longer visible
  2. Click 'Submit'
    - expect: Success toast 'Lost Reason created successfully!' appears

#### 3.3. TC-VAL-03: Submit form with only whitespace shows validation error
**Steps:**
  1. Type '   ' (spaces) and click 'Submit'
    - expect: Validation error `Please enter lost reason` is shown
    - expect: No record is created

### 4. Duplicate Prevention

#### 4.1. TC-DUP-01: Submitting an existing Active Lost Reason name shows an error toast
**Steps:**
  1. Type 'Price Too High' (existing record) and click 'Submit'
    - expect: Toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Lost Reason name
**Steps:**
  1. Type 'price too high' (different casing) and click 'Submit'
    - expect: System shows 'Something went wrong.' if case-insensitive

#### 4.3. TC-DUP-03: Submitting a name that matches an existing Inactive record shows an error
**Steps:**
  1. Type the name of an existing Inactive record and click 'Submit'
    - expect: Toast error 'Something went wrong.' appears

### 5. Clear Button Behavior

#### 5.1. TC-CLR-01: Clear button resets the Add Lost Reason form
**Steps:**
  1. Type 'Maybe Later' and click 'Clear'
    - expect: The 'Lost Reason *' input field is cleared and empty

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Lost Reason state
**Steps:**
  1. Click Edit for any record, then click 'Clear'
    - expect: Form heading reverts to 'Add Lost Reason'
    - expect: Input field is cleared and Status dropdown disappears

#### 5.3. TC-CLR-03: Clear button in Add mode with validation error resets the error state
**Steps:**
  1. Trigger validation error, then click 'Clear'
    - expect: Inline validation error is no longer visible

### 6. Edit and Update Operations

#### 6.1. TC-EDT-01: Edit icon opens the record in Update Lost Reason mode with pre-filled fields
**Steps:**
  1. Click Edit for a record
    - expect: Heading is 'Update Lost Reason', input is pre-filled, Status dropdown and 'Update' button are visible

#### 6.2. TC-EDT-02: Successfully update a Lost Reason record with a new name
**Steps:**
  1. Click Edit, change name to 'Price Too High - Updated', and click 'Update'
    - expect: Success toast 'Lost Reason updated successfully!' appears
    - expect: Table reflects 'Price Too High - Updated'

#### 6.3. TC-EDT-03: Update with empty Lost Reason field shows validation error
**Steps:**
  1. Click Edit, clear input, and click 'Update'
    - expect: Inline validation error 'Please enter lost reason' appears

#### 6.4. TC-EDT-04: Update name to match an existing Active record shows error
**Steps:**
  1. Click Edit, change name to match another record, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears

#### 6.5. TC-EDT-05: Update status from Active to Inactive
**Steps:**
  1. Click Edit, select 'Inactive' status, and click 'Update'
    - expect: Success toast 'Lost Reason updated successfully!' appears
    - expect: Record is hidden from Active list

#### 6.6. TC-EDT-06: Update status from Inactive to Active (re-activate a record)
**Steps:**
  1. Filter by Inactive, click Edit, select 'Active' status, and click 'Update'
    - expect: Success toast 'Lost Reason updated successfully!' appears
    - expect: Record reappears in Active list

### 7. Status Filter

#### 7.1. TC-FLT-01: Filter table by Active status (default behavior)
**Steps:**
  1. Navigate to page
    - expect: 'Status:' filter defaults to 'Active', showing only Active records

#### 7.2. TC-FLT-02: Filter table to show All statuses
**Steps:**
  1. Change Status filter to 'All'
    - expect: Table shows both Active and Inactive records

#### 7.3. TC-FLT-03: Filter table by Inactive status
**Steps:**
  1. Change Status filter to 'Inactive'
    - expect: Table shows only Inactive records

### 8. Search Functionality

#### 8.1. TC-SRC-01: Search by partial lost reason name returns matching results
**Steps:**
  1. Type 'Price' in search box
    - expect: Table filters to show records containing 'Price'

#### 8.2. TC-SRC-02: Search by complete name returns exact matching result
**Steps:**
  1. Type 'Price Too High' in search box
    - expect: Only 'Price Too High' is shown

#### 8.3. TC-SRC-03: Search with a non-existent name returns no results
**Steps:**
  1. Type 'XYZ123' and check table
    - expect: 'There are no records to display' message is shown

#### 8.4. TC-SRC-04: Clearing the search input restores the full list
**Steps:**
  1. Clear search input
    - expect: Full unfiltered list is restored

### 9. Rows Per Page and Pagination

#### 9.1. TC-PAG-01: Default rows-per-page is 25
**Steps:**
  1. Check 'Show:' dropdown
    - expect: Default value is '25'

#### 9.2. TC-PAG-02: Change rows-per-page to 10
**Steps:**
  1. Change 'Show:' to '10'
    - expect: Table displays 10 rows per page

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls
**Steps:**
  1. Click 'Next page' and 'Previous page'
    - expect: Table navigates correctly between pages

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and 100
**Steps:**
  1. Change 'Show:' to '50', then '100'
    - expect: Table displays 50 and 100 rows per page respectively
