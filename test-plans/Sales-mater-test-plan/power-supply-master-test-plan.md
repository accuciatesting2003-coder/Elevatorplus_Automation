# Power Supply Master Test Plan

## Application Overview

The Power Supply Master page is part of the ElevatorPlus Sales Masters section, accessible at https://stage.elevatorplus.net/master/power-supply-master. It allows admin users to manage elevator power supply type records used in elevator sales quotation configurations. The page has two main sections: (1) an "Add Power Supply" form at the top, and (2) a data table listing all Power Supply records below.

The Add Power Supply form contains one field: "Power Supply Name *" (mandatory text input, helper text: "Specify supply type e.g. 3-phase 415V."). An info icon button is present next to the "Add Power Supply" heading that opens a side panel with a "Power Supply Master" heading and sections for Title, Video, and Note (all currently empty/unpopulated in the staging environment). The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Power Supply" mode with the Power Supply Name field pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive; current status pre-selected; helper text: "Select active or inactive") and the action button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Import" button, and a "Search Power Supply Name" text input with a "Search:" label. Note: There is no Export Excel button on this page.

Table columns are: Sr. No., Action (Edit icon only — no Delete), Power Supply Name, and Status. The Power Supply Name and Status columns are sortable (clickable header buttons with sort icons). Pagination controls (Previous page, page number buttons, Next page) appear below the table.

Existing data in the staging environment includes: 415, 415 Volts Three Phase, 440 volts Single phase 50HZ AC, 440 Volts Three phase 50HZ Ac, 440 Volts, 240 Volts Single Phase, 230 Volts Single Phase, among others.

Validation messages: submitting an empty field shows inline error "Please enter power supply name"; submitting whitespace-only shows inline error "Power supply name can not be empty". Success toast on create: "Power Supply has been created successfully!". Success toast on update: "Power Supply has been updated successfully!". Duplicate or server-side error produces a toast: "Something went wrong."

Page navigation/breadcrumb heading reads "Power Supply Master" in the top navbar area. The sidebar link is labeled "Power Supply" under Sales Masters.

## Actual UI Locators

### Form Locators
- **Page/nav heading:** `page.getByRole('heading', { name: /Power Supply Master/i })`
- **Add mode form heading:** `page.getByRole('heading', { name: /Add Power Supply/i })`
- **Update mode form heading:** `page.getByRole('heading', { name: /Update Power Supply/i })`
- **Power Supply Name input:** `page.getByRole('textbox', { name: /Power Supply Name/i })` (DOM id: `power_supply`)
- **Helper text:** `page.getByText(/Specify supply type e\.g\. 3-phase 415V\./i)`
- **Info icon button:** `page.locator('#info-tooltip')`
- **Clear button:** `page.getByRole('button', { name: /Clear/i })`
- **Submit button:** `page.getByRole('button', { name: /Submit/i })`
- **Update button:** `page.getByRole('button', { name: /Update/i })`
- **Status dropdown (edit mode only):** `page.locator('#status')` — native `<select>` with options: `''` (Select Status), `'true'` (Active), `'false'` (Inactive)

### Table Locators
- **Table data rows:** `page.locator('[role="row"]:has([role="cell"])')`
- **Edit icon in row:** `tableRows(page).nth(i).getByRole('img', { name: 'Edit' })`
- **Status filter dropdown:** `page.locator('select').filter({ has: page.locator('option[value="false"]') }).first()` — option values: `''` (All), `'true'` (Active), `'false'` (Inactive)
- **Rows-per-page dropdown:** `page.locator('#rows-per-page').first()`
- **Search input:** `page.locator('input[placeholder="Search Power Supply Name"]')`
- **Status badge cell:** `page.getByRole('heading', { level: 5 })` inside each row
- **Power Supply Name cell (column index 2):** `tableRows(page).nth(i).locator('[role="cell"]').nth(2)`

### Validation Error Messages
- **Empty Power Supply Name field:** `Please enter power supply name`
- **Whitespace-only input:** `Power supply name can not be empty`

### Toast Notification Locators
- **Success toast (create):** `page.locator('[role="alert"]').filter({ hasText: /created successfully/i })`
- **Success toast (update):** `page.locator('[role="alert"]').filter({ hasText: /updated successfully/i })`
- **Error toast (duplicate/server):** `page.locator('[role="alert"]').filter({ hasText: /already exists|something went wrong/i })`

### Spec File
- **Script:** `tests/Sales-master/power-supply-master.spec.ts`

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-PS-SM-01: Power Supply Master page loads successfully

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/power-supply-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/power-supply-master
    - expect: The top navbar heading should read 'Power Supply Master'
    - expect: The form card heading should display 'Add Power Supply'
    - expect: The 'Power Supply Name *' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible in the form
    - expect: The data table should load and display Power Supply records with 'Active' status by default

#### 1.2. TC-PS-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and inspect the form section
    - expect: The form section heading should read 'Add Power Supply'
    - expect: An info icon button (circle with 'i') should be present next to the 'Add Power Supply' heading
    - expect: The 'Power Supply Name *' text input field should be visible, focusable, and empty
    - expect: The helper text below the input should read 'Specify supply type e.g. 3-phase 415V.'
    - expect: The 'Clear' button and 'Submit' button should be present in the form
  2. Inspect the data table toolbar section above the table
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: An 'Import' button should be present in the toolbar
    - expect: A 'Search:' label with a 'Search Power Supply Name' text input should be present in the toolbar
    - expect: There should be no 'Export Excel' button on this page
  3. Inspect the data table header row
    - expect: Table header columns should be: Sr. No., Action, Power Supply Name, Status
    - expect: The 'Power Supply Name' and 'Status' column headers should have sort icons indicating they are sortable
    - expect: The 'Sr. No.' and 'Action' column headers should be present but do not have sort icons
    - expect: All 4 columns should be visible
  4. Inspect a sample data row in the table
    - expect: Sr. No. cell should contain a sequential integer number
    - expect: Action cell should contain an Edit icon (img with alt 'Edit') with no Delete icon
    - expect: Power Supply Name cell should contain the power supply name text
    - expect: Status cell should display a badge/heading reading 'Active' or 'Inactive'

#### 1.3. TC-PS-SM-03: Verify form field label, helper text, and info panel content

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and inspect the form field
    - expect: The field floating label should read 'Power Supply Name *' — the asterisk (*) indicates the field is mandatory
    - expect: The helper text below the input should read 'Specify supply type e.g. 3-phase 415V.'
  2. Click the info icon button next to the 'Add Power Supply' heading
    - expect: A side panel should open on the right side of the page
    - expect: The panel should have a heading 'Power Supply Master'
    - expect: The panel should contain sections for 'Title:', 'Video:', and 'Note:'
    - expect: A close link/button should be present in the panel
  3. Click the close link/button in the info side panel
    - expect: The info side panel should close
    - expect: The main form and table should remain unchanged and accessible

### 2. 2. Add Power Supply - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-PS-ADD-01: Successfully create a new Power Supply record

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master
    - expect: The 'Add Power Supply' form is displayed with the Power Supply Name input field empty
  2. Click on the 'Power Supply Name *' input field and type a unique value, e.g., '3-Phase 415V'
    - expect: The typed text '3-Phase 415V' appears in the input field
    - expect: The floating label 'Power Supply Name *' animates upward when the field is focused
  3. Click the 'Submit' button
    - expect: A success toast notification appears with the message 'Power Supply has been created successfully!'
    - expect: The 'Power Supply Name *' input field is cleared and reset to empty after successful submission
    - expect: The form heading remains 'Add Power Supply'
    - expect: The action button remains 'Submit' (not 'Update')
    - expect: The newly created record '3-Phase 415V' appears in the data table with Status 'Active'

#### 2.2. TC-PS-ADD-02: Successfully create a Power Supply record with a descriptive multi-word name

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type a descriptive name, e.g., '220 Volts, Single Phase, 60HZ AC', into the 'Power Supply Name *' input
    - expect: The value '220 Volts, Single Phase, 60HZ AC' appears in the input field
  2. Click the 'Submit' button
    - expect: A success toast notification appears: 'Power Supply has been created successfully!'
    - expect: The input field is cleared after successful submission
    - expect: The newly created record '220 Volts, Single Phase, 60HZ AC' appears in the data table with Status 'Active'

#### 2.3. TC-PS-ADD-03: Successfully create a Power Supply record with special characters

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type a name containing special characters, e.g., '380V / 3-Phase (50Hz)', into the 'Power Supply Name *' input
    - expect: The value '380V / 3-Phase (50Hz)' appears in the input field
  2. Click the 'Submit' button
    - expect: A success toast notification appears: 'Power Supply has been created successfully!'
    - expect: The input field is cleared after successful submission
    - expect: The record '380V / 3-Phase (50Hz)' appears in the data table with Status 'Active'

#### 2.4. TC-PS-ADD-04: Successfully create multiple Power Supply records sequentially

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, type 'DC 48V Supply' in the 'Power Supply Name *' field, and click 'Submit'
    - expect: A success toast notification appears: 'Power Supply has been created successfully!'
    - expect: The field is cleared and the form is ready for another entry
  2. Immediately type 'AC 24V Supply' in the 'Power Supply Name *' field and click 'Submit' again
    - expect: A second success toast notification appears: 'Power Supply has been created successfully!'
    - expect: The field is cleared again
    - expect: Both records 'DC 48V Supply' and 'AC 24V Supply' appear in the data table with Status 'Active'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-PS-VAL-01: Submit form with empty Power Supply Name field shows inline validation error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the 'Submit' button without entering any value in the 'Power Supply Name *' field
    - expect: An inline validation error appears below the 'Power Supply Name *' field reading 'Please enter power supply name'
    - expect: No new Power Supply record is created in the data table
    - expect: The form remains in 'Add Power Supply' mode and is not reset
    - expect: No success toast notification is shown

#### 3.2. TC-PS-VAL-02: Submit form with whitespace-only input shows inline validation error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type only spaces (e.g., '   ') into the 'Power Supply Name *' input field
    - expect: Spaces appear to be entered in the field (the field is not empty from the user's view)
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the 'Power Supply Name *' field reading 'Power supply name can not be empty' — whitespace-only input is treated as invalid
    - expect: No new Power Supply record is created in the data table
    - expect: The form remains in 'Add Power Supply' mode and is not reset
    - expect: No success toast notification is shown

#### 3.3. TC-PS-VAL-03: Inline validation error clears when valid input is entered after failed submission

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the inline validation error
    - expect: Inline validation error 'Please enter power supply name' is displayed below the 'Power Supply Name *' field
  2. Type a valid unique name, e.g., 'Single Phase 110V', in the 'Power Supply Name *' field
    - expect: The typed text appears in the field
    - expect: The inline validation error should no longer be visible as the user starts typing
  3. Click the 'Submit' button
    - expect: A success toast notification appears: 'Power Supply has been created successfully!'
    - expect: The record 'Single Phase 110V' appears in the table with Status 'Active'

#### 3.4. TC-PS-VAL-04: Clicking Clear on an invalid (empty-submitted) form removes the validation error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the inline validation error, then click the 'Clear' button
    - expect: The inline validation error should no longer be visible
    - expect: The 'Power Supply Name *' input field should be empty
    - expect: The form heading should still read 'Add Power Supply'
    - expect: The action button should still read 'Submit'

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-PS-DUP-01: Submitting an existing Active Power Supply name shows an error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and note an existing Active Power Supply name from the data table (e.g., '415 Volts, Three Phase')
    - expect: At least one Power Supply record is visible in the table with Status 'Active'
  2. Type the existing Power Supply name (e.g., '415 Volts, Three Phase') exactly into the 'Power Supply Name *' input field
    - expect: The value '415 Volts, Three Phase' is entered in the input field
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: No duplicate Power Supply record is added to the data table
    - expect: The form input value is not cleared after the failed submission

#### 4.2. TC-PS-DUP-02: Submitting a name matching an existing Inactive Power Supply shows an error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, change the 'Status:' filter dropdown to 'Inactive', and note the name of any Inactive Power Supply record
    - expect: At least one Inactive Power Supply record is visible, OR the table shows 'There are no records to display' if none exist
  2. Change the Status filter back to 'Active'. In the 'Power Supply Name *' field, type the name of the Inactive record observed in the previous step
    - expect: The name of the Inactive record is entered in the input field
  3. Click the 'Submit' button
    - expect: A toast error message appears reading 'Something went wrong.' — the name already exists in the system even though the existing record is Inactive
    - expect: No new Power Supply record is created in the data table
    - expect: The form input value is not cleared

#### 4.3. TC-PS-DUP-03: Test case-sensitivity for duplicate Power Supply name

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, note an existing Active record name (e.g., '440 Volts'), and type the same name in all-lowercase, e.g., '440 volts', into the 'Power Supply Name *' field
    - expect: The lowercase version of the name is entered in the input field
  2. Click the 'Submit' button
    - expect: If the system is case-insensitive: a toast error 'Something went wrong.' appears and no duplicate is created
    - expect: If the system is case-sensitive: a new record '440 volts' may be created — observe and document the behavior

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-PS-CLR-01: Clear button resets the Add Power Supply form

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master
    - expect: The 'Add Power Supply' form is visible with the Power Supply Name input field empty
  2. Type a value into the 'Power Supply Name *' field, e.g., 'Test Value To Be Cleared'
    - expect: The value 'Test Value To Be Cleared' is visible in the input field
  3. Click the 'Clear' button
    - expect: The 'Power Supply Name *' input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Power Supply'
    - expect: The action button still reads 'Submit' (not 'Update')
    - expect: The Status dropdown does not appear (it is only shown in Update mode)
    - expect: No toast notification or error is shown
    - expect: The data table is not affected or refreshed

#### 5.2. TC-PS-CLR-02: Clear button in Edit/Update mode resets form back to Add Power Supply state

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon on any Power Supply record in the data table
    - expect: The form heading changes to 'Update Power Supply'
    - expect: The 'Power Supply Name *' input is pre-filled with the selected record's name
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected (e.g., 'Active')
    - expect: The helper text for the Status field reads 'Select active or inactive'
    - expect: The action button label changes from 'Submit' to 'Update'
    - expect: The 'Clear' button is still present
  2. Click the 'Clear' button while in Update Power Supply mode
    - expect: The form heading reverts to 'Add Power Supply'
    - expect: The 'Power Supply Name *' input field is cleared and empty
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts from 'Update' to 'Submit'
    - expect: No data changes are made to any records
    - expect: No toast notification is shown

#### 5.3. TC-PS-CLR-03: Clear button in Update mode with validation error resets the error state

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Power Supply Name *' field so it is empty, click 'Update' to trigger the inline validation error, then click the 'Clear' button
    - expect: After clicking 'Clear', the inline validation error should no longer be visible
    - expect: The form should return to 'Add Power Supply' mode with an empty input field
    - expect: The 'Status *' dropdown should be hidden
    - expect: The action button should revert to 'Submit'

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-PS-EDT-01: Edit icon opens record in Update Power Supply mode with pre-filled fields

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon (pencil/edit image) in the Action column of any row
    - expect: The form heading changes from 'Add Power Supply' to 'Update Power Supply'
    - expect: The 'Power Supply Name *' input is pre-filled with the selected row's power supply name
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected
    - expect: The helper text for the Status field reads 'Select active or inactive'
    - expect: The action button label changes to 'Update'
    - expect: The 'Clear' button is still present
    - expect: The selected row in the table no longer shows an Edit icon (it is in edit mode)

#### 6.2. TC-PS-EDT-02: Successfully update a Power Supply record with a new name

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon for any Power Supply record (e.g., one with an easily recognizable name)
    - expect: The form switches to 'Update Power Supply' mode with the selected name pre-filled in the input field
  2. Clear the 'Power Supply Name *' input field and type a new unique name, e.g., 'Updated 3-Phase 440V'
    - expect: The new value 'Updated 3-Phase 440V' appears in the input field
  3. Click the 'Update' button
    - expect: A success toast notification appears reading 'Power Supply has been updated successfully!'
    - expect: The form resets to 'Add Power Supply' state with the Power Supply Name field cleared
    - expect: The 'Status *' dropdown disappears
    - expect: The action button reverts to 'Submit'
    - expect: The data table refreshes and shows the updated name 'Updated 3-Phase 440V' in place of the previously edited row

#### 6.3. TC-PS-EDT-03: Update Power Supply with empty name field shows validation error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon for any Power Supply record
    - expect: The form is in 'Update Power Supply' mode with the name field pre-filled
  2. Clear the 'Power Supply Name *' input field completely so it is empty, then click the 'Update' button
    - expect: An inline validation error appears below the 'Power Supply Name *' field reading 'Please enter power supply name'
    - expect: No API update call is made
    - expect: The form remains in 'Update Power Supply' mode without resetting
    - expect: No success or error toast appears

#### 6.4. TC-PS-EDT-04: Update Power Supply name to match an existing Active record shows error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and note two distinct existing Active Power Supply names (e.g., '415 Volts, Three Phase' and '440 Volts'). Click the Edit icon for '440 Volts'
    - expect: The form is in 'Update Power Supply' mode with '440 Volts' pre-filled in the input field
  2. Clear the input and type the name of the other existing Active record (e.g., '415 Volts, Three Phase')
    - expect: '415 Volts, Three Phase' appears in the input field
  3. Click the 'Update' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: The Power Supply record is not updated and the original name remains in the table
    - expect: The form remains in 'Update Power Supply' mode

#### 6.5. TC-PS-EDT-05: Update Power Supply name to match an existing Inactive record shows error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, change the Status filter to 'Inactive', and note the name of any Inactive record. Then change the Status filter back to 'Active' and click the Edit icon for any Active record
    - expect: The form is in 'Update Power Supply' mode with the selected Active record's name pre-filled
  2. Clear the input and type the name of the existing Inactive record
    - expect: The Inactive record's name appears in the input field
  3. Click the 'Update' button
    - expect: A toast error message appears reading 'Something went wrong.'
    - expect: The Active record is not updated and the original name remains unchanged in the table
    - expect: The form remains in 'Update Power Supply' mode

#### 6.6. TC-PS-EDT-06: Update Power Supply status from Active to Inactive

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon for any Active Power Supply record
    - expect: The form is in 'Update Power Supply' mode with the 'Status *' dropdown showing 'Active'
  2. In the 'Status *' dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed reading 'Power Supply has been updated successfully!'
    - expect: The form resets to 'Add Power Supply' mode with the input field cleared
    - expect: When the Status filter remains on 'Active', the edited Power Supply record no longer appears in the table
    - expect: When the Status filter is changed to 'All', the edited record is visible with an 'Inactive' status badge
    - expect: When the Status filter is changed to 'Inactive', the edited record appears with an 'Inactive' status badge

#### 6.7. TC-PS-EDT-07: Update Power Supply with whitespace-only name shows validation error

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the Edit icon for any Power Supply record
    - expect: The form is in 'Update Power Supply' mode with the name pre-filled
  2. Clear the 'Power Supply Name *' input and type only spaces (e.g., '   '), then click the 'Update' button
    - expect: An inline validation error appears below the 'Power Supply Name *' field reading 'Power supply name can not be empty'
    - expect: No API update call is made
    - expect: The form remains in 'Update Power Supply' mode without resetting

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-PS-FLT-01: Filter table by Active status (default behavior)

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and observe the 'Status:' filter dropdown
    - expect: The 'Status:' filter dropdown defaults to 'Active'
    - expect: The data table shows only records with 'Active' status
    - expect: All visible rows display an 'Active' badge in the Status column
    - expect: No 'Inactive' rows are displayed in the table

#### 7.2. TC-PS-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and change the 'Status:' filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive Power Supply records
    - expect: Inactive records (if any exist) are shown alongside Active ones
    - expect: The Status column shows both 'Active' and 'Inactive' badges among the rows

#### 7.3. TC-PS-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and change the 'Status:' filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive Power Supply records are shown in the table, OR the table shows 'There are no records to display' if no Inactive records exist
    - expect: All visible rows (if any) display an 'Inactive' badge in the Status column
    - expect: No 'Active' status rows are displayed

#### 7.4. TC-PS-FLT-04: Status filter resets when navigating away and back

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All', then navigate to another page (e.g., Dashboard), and navigate back to the Power Supply Master page
    - expect: The Status filter should reset to the default value 'Active' upon re-navigation
    - expect: The table should display only Active records after re-navigating to the page

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-PS-SRC-01: Search by partial Power Supply name returns matching results

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and observe the full list of Active records in the table
    - expect: The full list of Active Power Supply records is displayed
  2. Click the 'Search Power Supply Name' input field in the toolbar and type a partial value, e.g., '415'
    - expect: The table dynamically filters to show only Power Supply records whose names contain '415' (e.g., '415', '415 Volts, Three Phase')
    - expect: Non-matching rows are hidden from the table

#### 8.2. TC-PS-SRC-02: Search by complete Power Supply name returns exact matching result

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type the complete name of an existing record, e.g., '440 Volts', into the 'Search Power Supply Name' input
    - expect: The table shows only the Power Supply record matching '440 Volts'
    - expect: All other rows are hidden from the table

#### 8.3. TC-PS-SRC-03: Search with a non-existent value returns no results

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type a value that does not exist, e.g., 'XYZNOTEXIST999', into the 'Search Power Supply Name' input
    - expect: The table body shows no rows
    - expect: An empty state message 'There are no records to display' is shown in the table body
    - expect: No Power Supply records matching the search text are displayed

#### 8.4. TC-PS-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type '415' into the 'Search Power Supply Name' input to filter results
    - expect: The table shows only records matching '415'
  2. Clear the 'Search Power Supply Name' input field completely (delete all text)
    - expect: The table restores to show all Active Power Supply records based on the current Status filter
    - expect: The full unfiltered list is displayed again

#### 8.5. TC-PS-SRC-05: Search is case-insensitive

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and type 'volts' (all lowercase) into the 'Search Power Supply Name' input, where known records contain 'Volts' (with uppercase V)
    - expect: Records whose names contain 'Volts' (mixed case) should appear in the filtered results even though the search term uses all lowercase
    - expect: The search behavior is case-insensitive

#### 8.6. TC-PS-SRC-06: Search filters apply on top of the active Status filter

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. With the Status filter set to 'Active', type '440' in the 'Search Power Supply Name' input box
    - expect: Only Active records containing '440' in the Power Supply Name should appear (e.g., '440 Volts', '440 volts, Single phase, 50HZ AC')
    - expect: Inactive records matching '440' should not appear

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PS-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and inspect the 'Show:' dropdown in the table toolbar
    - expect: The 'Show:' dropdown should display '25' as the selected value by default
    - expect: Up to 25 rows are shown in the table

#### 9.2. TC-PS-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total Power Supply records
    - expect: The 'Previous page' button is disabled when on page 1

#### 9.3. TC-PS-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, set the 'Show:' dropdown to '10', and verify there are multiple pages (if more than 10 records exist)
    - expect: Pagination controls with 'Previous page', page number buttons, and 'Next page' are visible
    - expect: The 'Previous page' button is disabled on page 1
    - expect: The current page button (page 1) is highlighted as the current page
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of Power Supply records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The page 1 button is highlighted as the current page
    - expect: The 'Previous page' button becomes disabled again

#### 9.4. TC-PS-PAG-04: Change rows-per-page to 50 and 100

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and change the 'Show:' dropdown to '50'
    - expect: The table displays up to 50 rows per page
    - expect: If total records are fewer than 50, all records are shown on a single page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table displays up to 100 rows per page
    - expect: If total records are fewer than 100, all records are shown on a single page

#### 9.5. TC-PS-PAG-05: Pagination is disabled when all records fit on one page

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master with the default 'Show: 25' setting and verify the total record count is 25 or fewer
    - expect: The 'Previous page' button should be disabled
    - expect: The 'Next page' button should be disabled
    - expect: Only page '1' button should be shown in the pagination control

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PS-SRT-01: Sort table by Power Supply Name column ascending

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and click the 'Power Supply Name' column header button
    - expect: The table re-sorts Power Supply records alphabetically in ascending order (A to Z)
    - expect: The sort icon on the 'Power Supply Name' column header indicates ascending sort order

#### 10.2. TC-PS-SRT-02: Sort table by Power Supply Name column descending

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Click the 'Power Supply Name' column header button a second time
    - expect: The sort order reverses to descending (Z to A)
    - expect: The sort icon on the 'Power Supply Name' column header updates to indicate descending sort order

#### 10.3. TC-PS-SRT-03: Sort table by Status column

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, set the Status filter to 'All', then click the 'Status' column header button
    - expect: The table re-sorts records grouping Active and Inactive records together by status
    - expect: The sort icon on the 'Status' column header updates to indicate the sort direction
  2. Click the 'Status' column header button again
    - expect: The sort order reverses
    - expect: The sort icon updates to indicate the reversed sort direction

#### 10.4. TC-PS-SRT-04: Sr. No. and Action columns are not sortable

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master and inspect the 'Sr. No.' and 'Action' column headers
    - expect: The 'Sr. No.' column header button should not have a sort icon indicating it is not sortable
    - expect: The 'Action' column header button should not have a sort icon indicating it is not sortable
    - expect: Clicking these column headers should not change the sort order of the data

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-PS-INA-01: Deactivate an Active Power Supply and verify it disappears from the Active filter

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master with the Status filter set to 'Active'. Note the name of an existing Active Power Supply record (e.g., '230 Volts, Single Phase')
    - expect: The Power Supply record '230 Volts, Single Phase' is visible in the Active-filtered table
  2. Click the Edit icon for '230 Volts, Single Phase' to open it in 'Update Power Supply' mode
    - expect: The form shows 'Update Power Supply' with the Power Supply Name field pre-filled as '230 Volts, Single Phase'
    - expect: The 'Status *' dropdown shows 'Active' as the current status
  3. Change the 'Status *' dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Power Supply has been updated successfully!'
    - expect: The form resets to 'Add Power Supply' mode
  4. Verify the table with the Status filter still set to 'Active'
    - expect: The Power Supply record '230 Volts, Single Phase' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The Power Supply record '230 Volts, Single Phase' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-PS-INA-02: Re-activate an Inactive Power Supply

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, change the Status filter to 'Inactive', and click the Edit icon for an Inactive Power Supply record
    - expect: The form shows 'Update Power Supply' with the 'Status *' dropdown showing 'Inactive'
  2. Change the 'Status *' dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed: 'Power Supply has been updated successfully!'
    - expect: The form resets to 'Add Power Supply' mode
  3. Change the Status filter to 'Active'
    - expect: The previously Inactive Power Supply now appears in the Active-filtered table with an 'Active' status badge
    - expect: The record no longer appears when the Status filter is set to 'Inactive'

#### 11.3. TC-PS-INA-03: Inactive records are hidden from the Active filter view by default

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive Power Supply record exists (by editing a record and setting it to Inactive). Then navigate to the Power Supply Master page with the default Status filter
    - expect: The Status filter defaults to 'Active'
    - expect: The Inactive record should not appear in the table under the 'Active' filter view

#### 11.4. TC-PS-INA-04: Edit icon is available for Inactive records

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/power-supply-master, change the Status filter to 'Inactive', and inspect the Edit icon availability for Inactive records
    - expect: Each Inactive record in the table should have an Edit icon in the Action column
    - expect: Clicking the Edit icon for an Inactive record should open the 'Update Power Supply' form with the record's data pre-filled
    - expect: The 'Status *' dropdown should show 'Inactive' as the current selection

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-PS-NAV-01: Unauthenticated access to Power Supply Master URL redirects to login page

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state / no session cookies) and navigate directly to https://stage.elevatorplus.net/master/power-supply-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Power Supply Master page content (form and table) is not shown
    - expect: The login form with mobile number and password fields is visible

#### 12.2. TC-PS-NAV-02: Access Power Supply Master via Sales Masters sidebar navigation

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master links
    - expect: A 'Power Supply' link should be visible in the expanded Sales Masters sub-menu
    - expect: The link URL should be /master/power-supply-master
  2. Click the 'Power Supply' link in the Sales Masters sub-menu
    - expect: The Power Supply Master page at /master/power-supply-master is loaded
    - expect: The page heading 'Add Power Supply' is visible in the form section
    - expect: The data table with existing Power Supply records is displayed
    - expect: The top navigation heading reads 'Power Supply Master'

#### 12.3. TC-PS-NAV-03: Direct URL navigation to Power Supply Master works when authenticated

**File:** `tests/Sales-master/power-supply-master.spec.ts`

**Steps:**
  1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/power-supply-master via the browser address bar
    - expect: The page should load successfully without redirecting to the login page
    - expect: The 'Add Power Supply' form and data table should be fully functional
    - expect: The top navbar heading should read 'Power Supply Master'
