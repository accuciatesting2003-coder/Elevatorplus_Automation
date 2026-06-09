# Speed Master Test Plan

## Application Overview

The Speed Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/speed-master. It allows admin users to manage elevator Speed records (in meters per second) used in elevator sales quotation cost estimations. The page has two main sections: (1) an "Add Speed" form at the top, and (2) a data table listing all Speed records below.

The Add Speed form contains one field: "Speed (m/s) *" (mandatory text input, helper text: "Speed value in m/s (e.g. 1.0, 1.5, 2.0)."). The field accepts numeric values with up to two decimal places only. An info icon button is present next to the "Add Speed" heading that opens a side panel with guidance notes: "Speed (m/s) : Enter the speed in m/s. Status : Select the status of this Speed i.e. Active / Inactive. Status will be by default Active, if you want to make this Speed inactive then select that option from the list. Click on the Submit button to save the Speed." The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Speed" mode with the Speed field pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive; helper text: "Select active or inactive") and the action button changes to "Update".

The data table toolbar includes: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Import" button, an "Export Excel" button, and a "Search speed" search text box.

Table columns are: Sr. No., Action (Edit icon), Speed (m/s), and Status. Pagination controls (Previous page, page number buttons, Next page) appear below the table. The Speed (m/s) and Status columns are sortable.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Speed Master page loads successfully

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/speed-master
    - expect: The page title in the browser tab should be 'speed master'
    - expect: The breadcrumb or top navigation should indicate 'Speed Master'
    - expect: The 'Add Speed' card heading should be visible
    - expect: The 'Speed (m/s) *' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display Speed records with 'Active' status by default

#### 1.2. TC-SM-02: Verify page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and inspect the form section
    - expect: The form section heading should read 'Add Speed'
    - expect: An info icon button (circle with 'i') should be present next to the 'Add Speed' heading
  2. Inspect the data table toolbar above the table
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25 selected)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active selected)
    - expect: An 'Import' button should be present in the toolbar
    - expect: An 'Export Excel' button should be present in the toolbar
    - expect: A 'Search speed' text input should be present in the toolbar with a 'Search:' label
  3. Inspect the table header row
    - expect: Column headers should include: Sr. No., Action, Speed (m/s), and Status
    - expect: The Speed (m/s) and Status columns should be sortable (clickable header buttons with sort icons)
    - expect: The Sr. No. and Action columns are present but not sortable

#### 1.3. TC-SM-03: Verify form field label, helper text, and info tooltip content

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and inspect the form field
    - expect: The field label should read 'Speed (m/s) *' — the asterisk (*) indicates the field is mandatory
    - expect: The helper text below the input should read 'Speed value in m/s (e.g. 1.0, 1.5, 2.0).'
  2. Click the info icon button next to the 'Add Speed' heading
    - expect: A side panel or tooltip opens with title 'Speed Master'
    - expect: The note section should contain guidance: 'Speed (m/s) : Enter the speed in m/s Status : Select the status of this Speed i.e. Active / Inactive. Status will be by default Active, if you want to make this Speed inactive then select that option from the list. Click on the Submit button to save the Speed.'
    - expect: The panel can be closed using a close/link button

### 2. 2. Add Speed - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Speed record with an integer-like value

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The 'Add Speed' form is displayed with the Speed input field empty
  2. Click on the 'Speed (m/s) *' input field and type a unique integer-like value, e.g., '2.00'
    - expect: The typed text '2.00' appears in the input
    - expect: The floating label 'Speed (m/s) *' animates upward
  3. Click the 'Submit' button
    - expect: A success toast notification appears with the message 'Speed has been created successfully!'
    - expect: The Speed input field is cleared and reset to empty
    - expect: The form heading remains 'Add Speed'
    - expect: The action button remains 'Submit'
    - expect: The newly created Speed '2.00 m/s' appears in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a new Speed record with a one-decimal value

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The 'Add Speed' form is visible with the Speed input field empty
  2. Type a unique one-decimal speed value, e.g., '1.5', into the 'Speed (m/s) *' input
    - expect: The value '1.5' appears in the input field
  3. Click the 'Submit' button
    - expect: A success toast notification appears with the message 'Speed has been created successfully!'
    - expect: The input field is cleared after successful submission
    - expect: The newly created record '1.5 m/s' (or '1.50 m/s') appears in the data table with Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a new Speed record with a two-decimal value

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type a unique two-decimal value, e.g., '0.75', into the 'Speed (m/s) *' input
    - expect: The value '0.75' appears in the Speed input field
  2. Click the 'Submit' button
    - expect: A success toast notification appears: 'Speed has been created successfully!'
    - expect: The Speed input field is cleared
    - expect: The record '0.75 m/s' appears in the data table with Status 'Active'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Speed field shows inline validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the 'Submit' button without entering any value in the Speed field
    - expect: An inline validation error appears below the Speed (m/s) field reading 'Please enter speed'
    - expect: No new Speed record is created in the data table
    - expect: The form remains in 'Add Speed' mode and is not reset
    - expect: No toast notification is shown

#### 3.2. TC-VAL-02: Submit form with whitespace-only input shows inline validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type only spaces (e.g., '   ') into the 'Speed (m/s) *' input field
    - expect: Spaces appear to be entered in the field
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places' — whitespace-only input is treated as invalid
    - expect: No new Speed record is created in the data table
    - expect: The form remains in 'Add Speed' mode and is not reset

#### 3.3. TC-VAL-03: Enter alphabetic characters in Speed field shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type alphabetic characters, e.g., 'abc', into the 'Speed (m/s) *' input field
    - expect: The alphabetic characters appear in the field (field does not block alphabetic input at the keystroke level)
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places'
    - expect: No new Speed record is created in the data table
    - expect: The form is not reset

#### 3.4. TC-VAL-04: Enter special characters in Speed field shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type special characters, e.g., '!@#$', into the 'Speed (m/s) *' input field
    - expect: The special characters appear (or are partially accepted) in the field
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places'
    - expect: No new Speed record is created in the data table
    - expect: The form is not reset

#### 3.5. TC-VAL-05: Enter a negative value in Speed field shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type a negative value, e.g., '-1.0', into the 'Speed (m/s) *' input field
    - expect: The value '-1.0' appears in the field
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places' — negative values are not permitted
    - expect: No new Speed record is created in the data table
    - expect: The form is not reset

#### 3.6. TC-VAL-06: Enter more than two decimal places in Speed field shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type a value with more than two decimal places, e.g., '1.234', into the 'Speed (m/s) *' input field
    - expect: The value '1.234' appears in the field
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places'
    - expect: No new Speed record is created
    - expect: The form is not reset

#### 3.7. TC-VAL-07: Enter zero (0) in Speed field — verify acceptance or rejection

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type '0' into the 'Speed (m/s) *' input field
    - expect: The value '0' appears in the Speed field
  2. Click the 'Submit' button
    - expect: Observe whether zero is accepted (success toast 'Speed has been created successfully!') or rejected (inline validation error shown)
    - expect: If accepted: the record '0 m/s' or '0.00 m/s' appears in the data table with Status 'Active'
    - expect: If rejected: an inline validation error appears below the Speed field

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Active Speed value shows an error toast

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and note an existing Speed value from the data table (e.g., '1.50 m/s')
    - expect: At least one Speed record is visible in the table with Status 'Active'
  2. Type the existing Speed value (e.g., '1.50') exactly into the 'Speed (m/s) *' input field
    - expect: The value '1.50' is entered in the Speed input
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: No duplicate Speed record is added to the data table
    - expect: The form input value is not cleared

#### 4.2. TC-DUP-02: Add a new record with the same value as an existing Inactive Speed shows error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and change the Status filter to 'Inactive'. Note the Speed value of any Inactive record visible in the table (e.g., '4.00 m/s')
    - expect: At least one Inactive Speed record is visible in the table, OR the table shows 'There are no records to display' if none exist
  2. Change the Status filter back to 'Active'. In the 'Add Speed' form, type the same value as the Inactive Speed record (e.g., '4.00') into the 'Speed (m/s) *' field
    - expect: The speed value of the Inactive record is entered in the Speed input
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.' — the speed value already exists in the system even though the existing record is Inactive
    - expect: No new Speed record is created in the data table
    - expect: The form input value is not cleared

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Speed form

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The 'Add Speed' form is visible with the Speed input field empty
  2. Type a value into the Speed field, e.g., '9.99'
    - expect: The value '9.99' is visible in the Speed input field
  3. Click the 'Clear' button
    - expect: The Speed (m/s) input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Speed'
    - expect: The action button still reads 'Submit'
    - expect: The Status dropdown does not appear (it is only shown in Update mode)
    - expect: No toast notification or error is shown
    - expect: The data table is not affected or refreshed

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Speed state

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the Edit icon for any Speed record in the data table
    - expect: The form heading changes to 'Update Speed'
    - expect: The 'Speed (m/s) *' field is pre-filled with the selected record's speed value
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected (e.g., 'Active')
    - expect: The helper text for Status reads 'Select active or inactive'
    - expect: The action button label changes from 'Submit' to 'Update'
  2. Click the 'Clear' button while in Update Speed mode
    - expect: The form heading reverts to 'Add Speed'
    - expect: The 'Speed (m/s) *' input field is cleared and empty
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to any records
    - expect: No toast notification is shown

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the Speed record in Update Speed mode with pre-filled fields

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The data table shows at least one Speed record
  2. Click the Edit icon (pencil/edit image) in the Action column of any row, e.g., the row with Speed '1.50 m/s'
    - expect: The form heading changes from 'Add Speed' to 'Update Speed'
    - expect: The 'Speed (m/s) *' input is pre-filled with the selected row's speed value (e.g., '1.50')
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected (e.g., 'Active')
    - expect: The helper text for the Status field reads 'Select active or inactive'
    - expect: The action button label changes to 'Update'
    - expect: The 'Clear' button is still present

#### 6.2. TC-EDT-02: Successfully update a Speed record with a new value

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the Edit icon for any Speed record (e.g., '2.00 m/s')
    - expect: The form switches to 'Update Speed' mode with '2.00' pre-filled in the Speed field
  2. Clear the Speed field and type a new unique value, e.g., '2.05'
    - expect: The value '2.05' appears in the Speed input
  3. Click the 'Update' button
    - expect: A success toast notification appears reading 'Speed has been updated successfully!'
    - expect: The form resets to 'Add Speed' state with the Speed field cleared
    - expect: The Status dropdown disappears
    - expect: The action button reverts to 'Submit'
    - expect: The data table refreshes and shows the updated value '2.05 m/s' in place of the previously edited row

#### 6.3. TC-EDT-03: Update Speed with empty Speed field shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the Edit icon for any Speed record
    - expect: The form is in 'Update Speed' mode with the Speed field pre-filled
  2. Clear the 'Speed (m/s) *' input field completely so it is empty, then click the 'Update' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter speed'
    - expect: No API update call is made
    - expect: The form remains in 'Update Speed' mode without resetting

#### 6.4. TC-EDT-04: Update Speed value to match an existing Active Speed record shows error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and note two distinct existing Active Speed values (e.g., '1.50 m/s' and '2.10 m/s'). Click the Edit icon for '2.10 m/s'
    - expect: The form is in 'Update Speed' mode with '2.10' pre-filled in the Speed field
  2. Clear the Speed input and type the value of the other existing Active Speed, e.g., '1.50'
    - expect: '1.50' appears in the Speed input
  3. Click the 'Update' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: The Speed record is not updated and the original value '2.10 m/s' remains in the table
    - expect: The form remains in 'Update Speed' mode

#### 6.5. TC-EDT-05: Update Speed value to match an existing Inactive Speed record shows error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master, change the Status filter to 'Inactive', and note the Speed value of any Inactive record (e.g., '4.00 m/s'). Then change the Status filter back to 'Active' and click the Edit icon for any Active Speed record (e.g., '2.10 m/s')
    - expect: The form is in 'Update Speed' mode with the Active Speed value pre-filled (e.g., '2.10')
  2. Clear the Speed input and type the value of the existing Inactive Speed record (e.g., '4.00')
    - expect: '4.00' appears in the Speed input field
  3. Click the 'Update' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: The Speed record is not updated and the original value '2.10 m/s' remains unchanged in the table
    - expect: The form remains in 'Update Speed' mode

#### 6.6. TC-EDT-06: Update Speed status from Active to Inactive

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the Edit icon for any Speed record with 'Active' status
    - expect: The form is in 'Update Speed' mode with the 'Status *' dropdown showing 'Active'
  2. In the 'Status *' dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed reading 'Speed has been updated successfully!'
    - expect: The form resets to 'Add Speed' mode
    - expect: When the table Status filter is set to 'All', the edited Speed row shows 'Inactive' in the Status column
    - expect: When the table Status filter is set to 'Active', the edited Speed record no longer appears

#### 6.7. TC-EDT-07: Update Speed with invalid numeric format shows validation error

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and click the Edit icon for any Speed record
    - expect: The form is in 'Update Speed' mode with the Speed field pre-filled
  2. Clear the Speed input and type an invalid value, e.g., 'xyz' or '1.234' (more than 2 decimal places)
    - expect: The invalid value appears in the Speed field
  3. Click the 'Update' button
    - expect: An inline validation error appears below the Speed field reading 'Please enter a numeric value with up to two decimal places'
    - expect: No API update call is made
    - expect: The form remains in 'Update Speed' mode without resetting

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default behavior)

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The 'Status:' filter dropdown defaults to 'Active'
    - expect: The data table shows only records with 'Active' status
    - expect: All visible rows display an 'Active' badge in the Status column
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and change the 'Status:' filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive Speed records
    - expect: Inactive Speed records (if any exist) are shown alongside Active ones
    - expect: The Status column shows both 'Active' and 'Inactive' badges among the rows

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and change the 'Status:' filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive Speed records are shown in the table, OR the table shows 'There are no records to display' if no Inactive Speed records exist
    - expect: All visible rows (if any) display an 'Inactive' badge in the Status column

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial speed value returns matching results

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The full list of Active Speed records is displayed in the table
  2. Click the 'Search speed' input field in the table toolbar and type a partial value, e.g., '1.5'
    - expect: The table dynamically filters to show only Speed records whose values contain '1.5' (e.g., '1.50 m/s')
    - expect: Non-matching rows are hidden from the table

#### 8.2. TC-SRC-02: Search by complete speed value returns exact matching result

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type a complete speed value that exists in the table, e.g., '2.10', into the 'Search speed' input
    - expect: The table shows only the Speed record matching '2.10' (i.e., '2.10 m/s')
    - expect: All other rows are hidden

#### 8.3. TC-SRC-03: Search with a non-existent speed value returns no results

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type a value that does not exist, e.g., 'XYZNOTEXIST999', into the 'Search speed' input
    - expect: The table shows no rows
    - expect: An empty state message 'There are no records to display' is shown in the table body
    - expect: No Speed records matching the search text are displayed

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and type '1.5' into the 'Search speed' input to filter results
    - expect: The table shows only records matching '1.5'
  2. Clear the 'Search speed' input field completely (delete all text)
    - expect: The table restores to show all Active Speed records as before the search
    - expect: The full unfiltered list is displayed

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The 'Show:' dropdown displays '25' as the selected value by default
    - expect: Up to 25 rows are shown in the table

#### 9.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master (default shows 25 rows per page) and change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total Speed records
    - expect: The 'Previous page' button is disabled when on page 1

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master, set the 'Show:' dropdown to '10', and verify there are multiple pages
    - expect: Pagination controls with 'Previous page', page number buttons, and 'Next page' are visible
    - expect: The 'Previous page' button is disabled on page 1
    - expect: The current page button (page 1) is highlighted
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of Speed records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The page 1 button is highlighted as the current page
    - expect: The 'Previous page' button becomes disabled again

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and 100

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master and change the 'Show:' dropdown to '50'
    - expect: The table displays up to 50 rows per page
    - expect: If total records are fewer than 50, all records are shown on a single page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table displays up to 100 rows per page
    - expect: If total records are fewer than 100, all records are shown on a single page

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Speed (m/s) column

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master
    - expect: The data table is loaded with Speed records
    - expect: The 'Speed (m/s)' column header has a sort icon indicating it is sortable
  2. Click the 'Speed (m/s)' column header button
    - expect: The table re-sorts Speed records numerically in ascending order (smallest to largest value)
    - expect: The sort icon on the Speed (m/s) column indicates ascending sort order
  3. Click the 'Speed (m/s)' column header button again
    - expect: The sort order reverses to descending (largest to smallest)
    - expect: The sort icon updates to indicate descending sort order

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master, set the Status filter to 'All', then click the 'Status' column header button
    - expect: The table re-sorts records grouping Active and Inactive records together
    - expect: The sort icon on the Status column updates to indicate sort direction
  2. Click the 'Status' column header button again
    - expect: The sort order reverses
    - expect: The sort icon updates to indicate the reversed sort direction

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Deactivate an Active Speed and verify it disappears from the Active filter

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master with the Status filter set to 'Active'. Note the value of an existing Active Speed record (e.g., '3.0 m/s')
    - expect: The Speed record '3.0 m/s' is visible in the Active list
  2. Click the Edit icon for '3.0 m/s' to open it in 'Update Speed' mode
    - expect: The form shows 'Update Speed' with the Speed field pre-filled as '3.0' and Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Speed has been updated successfully!'
    - expect: The form resets to 'Add Speed' mode
  4. Verify the table with Status filter still set to 'Active'
    - expect: The Speed record '3.0 m/s' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The Speed record '3.0 m/s' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-INA-02: Re-activate an Inactive Speed

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/speed-master, change Status filter to 'Inactive', and click the Edit icon for an Inactive Speed record
    - expect: The form shows 'Update Speed' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Speed has been updated successfully!'
    - expect: The form resets to 'Add Speed' mode
  3. Change the Status filter to 'Active'
    - expect: The previously Inactive Speed now appears in the Active list with an 'Active' status badge
    - expect: The Speed record no longer appears when the filter is set to 'Inactive'

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Unauthenticated access to Speed Master URL redirects to login page

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state / no session cookies) and navigate directly to https://stage.elevatorplus.net/master/speed-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Speed Master page content (form and table) is not shown
    - expect: The login form with mobile number and password fields is visible

#### 12.2. TC-NAV-02: Access Speed Master via Sales Masters sidebar navigation

**File:** `tests/Sales-master/speed-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master links including 'Speed'
  2. Click the 'Speed' link in the Sales Masters sub-menu
    - expect: The Speed Master page at /master/speed-master is loaded
    - expect: The page heading 'Add Speed' is visible in the form section
    - expect: The data table with existing Speed records is displayed
    - expect: The top navigation heading reads 'Speed Master'
