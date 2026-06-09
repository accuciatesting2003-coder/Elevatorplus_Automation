# Payment Collection Type Master Test Plan

## Application Overview

The Payment Collection Type Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/payment-collection-type. It allows admin users to manage payment collection type records used in elevator sales configurations. The page has two main sections: (1) an "Add Payment Collection Type" form at the top, and (2) a data table listing all payment collection type records below.

The Add Payment Collection Type form contains one field: "Payment Collection Type *" (mandatory text input). An info icon button is present next to the "Add Payment Collection Type" heading that opens a side panel with guidance notes. The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Payment Collection Type" mode with the Payment Collection Type field pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) and the action button changes to "Update".

## Actual UI Locators (Verified from Live Staging Site)

The following locators and messages were confirmed by navigating to `https://stage.elevatorplus.net/master/payment-collection-type` and inspecting the live DOM:

### Form Locators
- **Page/nav heading:** `page.getByRole('heading', { name: /Payment Collection Type Master/i })`
- **Add mode form heading:** `page.getByRole('heading', { name: /Add Payment Collection Type/i })`
- **Update mode form heading:** `page.getByRole('heading', { name: /Update Payment Collection Type/i })`
- **Payment Collection Type input:** `page.getByRole('textbox', { name: /Payment Collection Type \*/i })`
- **Clear button:** `page.getByRole('button', { name: / Clear/i })` (button label has leading icon + space)
- **Submit button:** `page.getByRole('button', { name: / Submit/i })` (button label has leading icon + space)
- **Update button:** `page.getByRole('button', { name: / Update/i })` (button label has leading icon + space)
- **Status dropdown (edit mode only):** `page.getByRole('combobox', { name: /Status \*/i })` — native `<select>` element with options: "Select Status", "Active", "Inactive"

### Table Locators
- **Table rows:** `page.locator('table tbody tr')` — native HTML `<table>` element
- **Edit icon in row:** `page.locator('table tbody tr').nth(i).getByRole('img', { name: 'Edit' })`
- **Status filter dropdown:** `page.locator('select').filter({ has: page.locator('option', { hasText: 'Inactive' }) })` — second `<select>` on page
- **Rows-per-page dropdown:** `page.locator('select').first()` — first `<select>` on page (default value: '25')
- **Search input:** `page.getByRole('textbox', { name: /Payment Collection Type/i }).last()`
- **Table content:** `page.locator('table tbody').getByText(name)`

### Validation Error Messages (Exact Text from DOM)
- **Empty Payment Collection Type field:** `Please enter payment collection type` (all lowercase, no trailing period)

### Toast Notification Locators
- **Success toast (create):** `page.locator('[role="alert"]').filter({ hasText: /created successfully/i })`
- **Success toast (update):** `page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })`
- **Error toast (duplicate):** `page.locator('[role="alert"]').filter({ hasText: /something went wrong/i })`

The data table toolbar includes: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Import" button, an "Export Excel" button, and a "Search Payment Collection Type" search text box.

Table columns are: Sr. No., Action (Edit icon), Payment Collection Type, and Status. Pagination controls (Previous page, page number buttons, Next page) appear below the table. The Payment Collection Type and Status columns are sortable.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Payment Collection Type Master page loads successfully

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The page URL should be https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The page title in the browser tab should be 'Payment Collection Type Masetr'
    - expect: The 'Add Payment Collection Type' card heading should be visible
    - expect: The 'Payment Collection Type *' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display payment collection type records with 'Active' status by default

#### 1.2. TC-SM-02: Verify page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and inspect the form section
    - expect: The form section heading should read 'Add Payment Collection Type'
    - expect: An info icon button (circle with 'i') should be present next to the 'Add Payment Collection Type' heading
  2. Inspect the data table toolbar above the table
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25 selected)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active selected)
    - expect: An 'Import' button should be present in the toolbar
    - expect: An 'Export Excel' button should be present in the toolbar
    - expect: A 'Search Payment Collection Type' text input should be present in the toolbar
  3. Inspect the table header row
    - expect: Column headers should include: Sr. No., Action, Payment Collection Type, and Status
    - expect: The Payment Collection Type and Status columns should be sortable (clickable header buttons with sort icons)
    - expect: The Sr. No. and Action columns are present but not sortable

#### 1.3. TC-SM-03: Verify form field label and info tooltip content

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and inspect the form field
    - expect: The field label should read 'Payment Collection Type *' — the asterisk (*) indicates the field is mandatory
  2. Click the info icon button next to the 'Add Payment Collection Type' heading
    - expect: A side panel or tooltip opens with guidance notes for the Payment Collection Type Master
    - expect: The panel can be closed using a close/link button

### 2. Add Payment Collection Type - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Payment Collection Type with a unique name

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Add Payment Collection Type' form is displayed with the Payment Collection Type input field empty
  2. Click on the 'Payment Collection Type *' input field and type a unique name, e.g., 'Cash On Delivery'
    - expect: The typed text 'Cash On Delivery' appears in the input
    - expect: The floating label 'Payment Collection Type *' animates upward
  3. Click the 'Submit' button
    - expect: A success toast notification appears with the message 'Payment Collection Type created successfully!'
    - expect: The Payment Collection Type input field is cleared and reset to empty
    - expect: The form heading remains 'Add Payment Collection Type'
    - expect: The action button remains 'Submit'
    - expect: The newly created record 'Cash On Delivery' appears in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a Payment Collection Type with special characters

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Add Payment Collection Type' form is visible and empty
  2. Click the 'Payment Collection Type *' input and type a name with special characters, e.g., 'Bank Transfer - NEFT/RTGS'
    - expect: The input accepts the text with special characters
  3. Click the 'Submit' button
    - expect: A success toast notification with 'Payment Collection Type created successfully!' is displayed
    - expect: The new record appears in the data table with the exact name including special characters and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a Payment Collection Type with a long name

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type a long name of approximately 100 characters, e.g., 'Deferred Payment Collection Through Authorized Bank Channel With Monthly Installment Agreement Type'
    - expect: The input accepts the long text string
  2. Click the 'Submit' button
    - expect: Either a success toast 'Payment Collection Type created successfully!' is shown, or an appropriate error is shown if a character limit is enforced
    - expect: If successful, the new record appears in the data table with the full or truncated name

#### 2.4. TC-ADD-04: Successfully create multiple Payment Collection Type records sequentially

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type 'Online Payment' in the input, then click 'Submit'
    - expect: A success toast 'Payment Collection Type created successfully!' is shown
    - expect: The input field is cleared after successful submission
  2. Immediately type another unique name, e.g., 'Cheque', into the input and click 'Submit'
    - expect: A second success toast is shown
    - expect: Both 'Online Payment' and 'Cheque' appear as separate records in the data table with Status 'Active'

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Payment Collection Type field shows inline validation error

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click the 'Submit' button without entering any value in the Payment Collection Type field
    - expect: An inline validation error appears below the Payment Collection Type field reading `Please enter payment collection type` (exact text, all lowercase, no trailing period)
    - expect: No new record is created in the data table
    - expect: The form remains in 'Add Payment Collection Type' mode and is not reset
    - expect: No success toast notification is shown

#### 3.2. TC-VAL-02: Inline error clears when valid input is entered after failed validation

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click 'Submit' without entering a value to trigger the validation error
    - expect: Inline error `Please enter payment collection type` is shown below the input
  2. Click on the 'Payment Collection Type *' input field and type a valid name, e.g., 'Direct Debit'
    - expect: The inline error message 'Please enter payment collection type' is no longer visible
    - expect: The input's invalid styling (red border) is removed
  3. Click the 'Submit' button
    - expect: The record is created successfully
    - expect: A toast notification 'Payment Collection Type created successfully!' appears

#### 3.3. TC-VAL-03: Submit form with only whitespace shows validation error

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type only spaces (e.g., '   ') into the 'Payment Collection Type *' input field
    - expect: The spaces are visible in the input field
  2. Click the 'Submit' button
    - expect: Either the validation error 'Please enter payment collection type' is shown (treating whitespace-only as empty), or a server-side error is returned
    - expect: No record with a blank/whitespace name should be created in the table

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Active Payment Collection Type name shows an error toast

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and note an existing record name from the data table (e.g., 'Cash On Delivery')
    - expect: At least one Payment Collection Type record is visible in the table with Status 'Active'
  2. Type the existing record name 'Cash On Delivery' exactly (same casing) into the 'Payment Collection Type *' input field
    - expect: The text is entered in the input field
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: No duplicate record is added to the data table
    - expect: The form input value is not cleared

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Payment Collection Type name

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and note an existing record name, e.g., 'Cash On Delivery'
    - expect: The record exists in the table
  2. Type the same name with different casing into the input field, e.g., 'cash on delivery' or 'CASH ON DELIVERY'
    - expect: The text appears in the input
  3. Click the 'Submit' button
    - expect: Observe whether the system treats this as a duplicate and shows 'Something went wrong.' or allows the creation

#### 4.3. TC-DUP-03: Submitting a name that matches an existing Inactive record shows an error

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type, change the Status filter to 'Inactive', and note the name of any Inactive record (e.g., 'Wire Transfer')
    - expect: At least one Inactive record is visible, OR the table shows no records if none exist
  2. Change the Status filter back to 'Active'. In the form, type the Inactive record name (e.g., 'Wire Transfer') into the input field
    - expect: The name is entered in the input
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.' — the name already exists in the system even though the existing record is Inactive
    - expect: No new record is created in the data table

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Payment Collection Type form

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Add Payment Collection Type' form is visible with the input field empty
  2. Type a value into the input field, e.g., 'Temporary Type Name'
    - expect: The value 'Temporary Type Name' is visible in the input field
  3. Click the 'Clear' button
    - expect: The 'Payment Collection Type *' input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Payment Collection Type'
    - expect: The action button still reads 'Submit'
    - expect: The Status dropdown does not appear (it is only shown in Update mode)
    - expect: No toast notification or error is shown
    - expect: The data table is not affected or refreshed

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Payment Collection Type state

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click the Edit icon for any record in the data table
    - expect: The form heading changes to 'Update Payment Collection Type'
    - expect: The 'Payment Collection Type *' field is pre-filled with the selected record's name
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected (e.g., 'Active')
    - expect: The action button label changes from 'Submit' to 'Update'
  2. Click the 'Clear' button while in Update Payment Collection Type mode
    - expect: The form heading reverts to 'Add Payment Collection Type'
    - expect: The 'Payment Collection Type *' input field is cleared and empty
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to any records
    - expect: No toast notification is shown

#### 5.3. TC-CLR-03: Clear button in Add mode with validation error resets the error state

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click 'Submit' without entering any value to trigger a validation error
    - expect: Inline error 'Please enter payment collection type' is visible below the input
  2. Click the 'Clear' button
    - expect: The input field remains empty
    - expect: The inline validation error is no longer visible
    - expect: The form is in its default blank 'Add Payment Collection Type' state

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the record in Update Payment Collection Type mode with pre-filled fields

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The data table shows at least one Payment Collection Type record
  2. Click the Edit icon (pencil/edit image) in the Action column of any row (e.g., the row with 'Cash On Delivery')
    - expect: The form heading changes from 'Add Payment Collection Type' to 'Update Payment Collection Type'
    - expect: The 'Payment Collection Type *' input is pre-filled with the selected row's name (e.g., 'Cash On Delivery')
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected (e.g., 'Active')
    - expect: The action button label changes to 'Update'
    - expect: The 'Clear' button is still present

#### 6.2. TC-EDT-02: Successfully update a Payment Collection Type record with a new name

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click the Edit icon for any record (e.g., 'Cash On Delivery')
    - expect: The form switches to 'Update Payment Collection Type' mode with 'Cash On Delivery' pre-filled in the input
  2. Clear the input field and type a new unique name, e.g., 'Cash Payment Updated'
    - expect: The value 'Cash Payment Updated' appears in the input
  3. Click the 'Update' button
    - expect: A success toast notification appears reading 'Payment Collection Type updated successfully!'
    - expect: The form resets to 'Add Payment Collection Type' state with the input field cleared
    - expect: The Status dropdown disappears
    - expect: The action button reverts to 'Submit'
    - expect: The data table refreshes and shows the updated name 'Cash Payment Updated' in place of the previously edited row

#### 6.3. TC-EDT-03: Update with empty Payment Collection Type field shows validation error

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click the Edit icon for any record
    - expect: The form is in 'Update Payment Collection Type' mode with the input field pre-filled
  2. Clear the 'Payment Collection Type *' input field completely so it is empty, then click the 'Update' button
    - expect: An inline validation error appears below the input reading 'Please enter payment collection type'
    - expect: No API update call is made
    - expect: The form remains in 'Update Payment Collection Type' mode without resetting

#### 6.4. TC-EDT-04: Update name to match an existing Active record shows error

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and note two distinct existing Active records (e.g., 'Cheque' and 'Online Payment'). Click the Edit icon for 'Online Payment'
    - expect: The form is in 'Update Payment Collection Type' mode with 'Online Payment' pre-filled
  2. Clear the input and type the name of the other existing Active record, e.g., 'Cheque'
    - expect: 'Cheque' appears in the input
  3. Click the 'Update' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: The record is not updated and the original name 'Online Payment' remains in the table
    - expect: The form remains in 'Update Payment Collection Type' mode

#### 6.5. TC-EDT-05: Update status from Active to Inactive

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and click the Edit icon for any record with 'Active' status
    - expect: The form is in 'Update Payment Collection Type' mode with the 'Status *' dropdown showing 'Active'
  2. In the 'Status *' dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed reading 'Payment Collection Type updated successfully!'
    - expect: The form resets to 'Add Payment Collection Type' mode
    - expect: When the table Status filter is set to 'All', the edited row shows 'Inactive' in the Status column
    - expect: When the table Status filter is set to 'Active', the edited record no longer appears

#### 6.6. TC-EDT-06: Update status from Inactive to Active (re-activate a record)

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type, change the Status filter to 'Inactive', and click the Edit icon for any Inactive record
    - expect: The form shows 'Update Payment Collection Type' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Payment Collection Type updated successfully!'
    - expect: The form resets to 'Add Payment Collection Type' mode
  3. Change the Status filter to 'Active'
    - expect: The previously Inactive record now appears in the Active list with an 'Active' status badge
    - expect: The record no longer appears when the filter is set to 'Inactive'

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default behavior)

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Status:' filter dropdown defaults to 'Active'
    - expect: The data table shows only records with 'Active' status
    - expect: All visible rows display an 'Active' badge in the Status column
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and change the 'Status:' filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive records
    - expect: Inactive records (if any exist) are shown alongside Active ones
    - expect: The Status column shows both 'Active' and 'Inactive' badges among the rows

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and change the 'Status:' filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive records are shown in the table, OR the table shows 'There are no records to display' if no Inactive records exist
    - expect: All visible rows (if any) display an 'Inactive' badge in the Status column

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial Payment Collection Type name returns matching results

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The full list of Active records is displayed in the table
  2. Click the 'Search Payment Collection Type' input field in the table toolbar and type a partial name, e.g., 'cash'
    - expect: The table dynamically filters to show only records whose names contain 'cash' (case-insensitive)
    - expect: Non-matching rows are hidden from the table

#### 8.2. TC-SRC-02: Search by complete name returns exact matching result

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type a complete record name that exists in the table, e.g., 'Cash On Delivery', into the search input
    - expect: The table shows only the record matching 'Cash On Delivery'
    - expect: All other rows are hidden

#### 8.3. TC-SRC-03: Search with a non-existent name returns no results

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type a name that does not exist, e.g., 'XYZNONEXISTENT999', into the 'Search Payment Collection Type' input
    - expect: The table shows no rows
    - expect: An empty state message 'There are no records to display' is shown in the table body
    - expect: No records matching the search text are displayed

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and type 'cash' into the search input to filter results
    - expect: The table shows only records matching 'cash'
  2. Clear the 'Search Payment Collection Type' input field completely (delete all text)
    - expect: The table restores to show all Active records as before the search
    - expect: The full unfiltered list is displayed

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Show:' dropdown displays '25' as the selected value by default
    - expect: Up to 25 rows are shown in the table

#### 9.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records
    - expect: The 'Previous page' button is disabled when on page 1

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type, set the 'Show:' dropdown to '10', and verify there are multiple pages
    - expect: Pagination controls with 'Previous page', page number buttons, and 'Next page' are visible
    - expect: The 'Previous page' button is disabled on page 1
    - expect: The current page button (page 1) is highlighted
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The page 1 button is highlighted as the current page
    - expect: The 'Previous page' button becomes disabled again

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and 100

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type and change the 'Show:' dropdown to '50'
    - expect: The table displays up to 50 rows per page
    - expect: If total records are fewer than 50, all records are shown on a single page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table displays up to 100 rows per page
    - expect: If total records are fewer than 100, all records are shown on a single page

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Payment Collection Type column

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The data table is loaded with Payment Collection Type records
    - expect: The 'Payment Collection Type' column header has a sort icon indicating it is sortable
  2. Click the 'Payment Collection Type' column header button
    - expect: The table re-sorts records alphabetically in ascending order (A to Z)
    - expect: The sort icon on the Payment Collection Type column indicates ascending sort order
  3. Click the 'Payment Collection Type' column header button again
    - expect: The sort order reverses to descending (Z to A)
    - expect: The sort icon updates to indicate descending sort order

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type, set the Status filter to 'All', then click the 'Status' column header button
    - expect: The table re-sorts records grouping Active and Inactive records together
    - expect: The sort icon on the Status column updates to indicate sort direction
  2. Click the 'Status' column header button again
    - expect: The sort order reverses
    - expect: The sort icon updates to indicate the reversed sort direction

### 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Deactivate an Active record and verify it disappears from the Active filter

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type with the Status filter set to 'Active'. Note the name of an existing Active record (e.g., 'Direct Debit')
    - expect: The record 'Direct Debit' is visible in the Active list
  2. Click the Edit icon for 'Direct Debit' to open it in 'Update Payment Collection Type' mode
    - expect: The form shows 'Update Payment Collection Type' with the Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Payment Collection Type updated successfully!'
    - expect: The form resets to 'Add Payment Collection Type' mode
  4. Verify the table with Status filter still set to 'Active'
    - expect: The record 'Direct Debit' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The record 'Direct Debit' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-INA-02: Re-activate an Inactive record and verify it reappears in the Active filter

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type, change Status filter to 'Inactive', and click the Edit icon for an Inactive record
    - expect: The form shows 'Update Payment Collection Type' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Payment Collection Type updated successfully!'
    - expect: The form resets to 'Add Payment Collection Type' mode
  3. Change the Status filter to 'Active'
    - expect: The previously Inactive record now appears in the Active list with an 'Active' status badge
    - expect: The record no longer appears when the filter is set to 'Inactive'

### 12. Export Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-EXP-01: Verify Export Excel button is present and triggers a file download

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Export Excel' button is visible in the table toolbar area
  2. Click the 'Export Excel' button
    - expect: A file download is triggered for an Excel file (.xlsx or .xls) containing the Payment Collection Type records
    - expect: No error toast or modal is displayed

### 13. Import Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-IMP-01: Verify Import button is present and clickable

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The 'Import' button is visible in the table toolbar area
  2. Click the 'Import' button
    - expect: A file chooser dialog opens, OR a modal/panel appears with import instructions and a file upload option
    - expect: The import interface is accessible and functional

### 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-NAV-01: Unauthenticated access to Payment Collection Type URL redirects to login page

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state / no session cookies) and navigate directly to https://stage.elevatorplus.net/master/payment-collection-type
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Payment Collection Type Master page content (form and table) is not shown
    - expect: The login form with mobile number and password fields is visible

#### 14.2. TC-NAV-02: Access Payment Collection Type Master via Sales Masters sidebar navigation

**File:** `tests/Sales-master/payment-collection-type-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master links
  2. Look for and click the 'Payment Collection Type' link in the Sales Masters sub-menu
    - expect: The Payment Collection Type Master page at /master/payment-collection-type is loaded
    - expect: The page heading 'Add Payment Collection Type' is visible in the form section
    - expect: The data table with existing records is displayed
    - expect: The top navigation heading reads 'Payment Collection Type Master'
