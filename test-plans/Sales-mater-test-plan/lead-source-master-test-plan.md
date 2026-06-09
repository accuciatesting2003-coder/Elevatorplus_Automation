# Lead Source Master Test Plan

## Application Overview

The Lead Source Master page is part of the ElevatorPlus Sales Masters section, accessible at https://stage.elevatorplus.net/master/lead-source-master. It allows admin users to manage lead source channels used to classify where leads originate. The page has two main sections: (1) an "Add Lead Source" form at the top, and (2) a data table listing all lead source records below.

The Add Lead Source form contains three fields: "Lead Source Name *" (mandatory text input) with helper text "Name of this lead source channel.", "Ask Details" (optional checkbox) with helper text "Show a details field when this source is selected.", and "Is Required" (optional checkbox) with helper text "Make details entry mandatory for this source." An info icon button is present next to the "Add Lead Source" heading that opens a side panel with Title, Video, and Note guidance sections. The Note text reads: "Lead Source Name: Enter the Lead Source Name Ask Details: Check the box if you want to ask the details Status: Select the status of Lead Source i.e. Active / Inactive. Status will be by default Active, if you want to make this Lead Source inactive then select that option from the list. Click on the Submit button to save the Lead Source." The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Lead Source" mode with all fields pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) with helper text "Select active or inactive", and the action button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), and a "Search Lead Source" text input. Note: There is no Import button or Export Excel button on this page.

The table has six columns: Sr. No., Action, Lead Source Name, Ask Details, Is Required, and Status. The Ask Details and Is Required columns display "True" or "False" values. The Status column displays Active/Inactive badge labels. The Action column contains only an Edit icon (no Delete). Existing data includes records such as: India Mart, Expo (Ask Details: True, Is Required: True), Repeat Client, From Boss, Site Visit (Ask Details: True, Is Required: True), Google Lead (Ask Details: True, Is Required: True), Facebook (Ask Details: True, Is Required: True), Website, Client and Arch (Ask Details: True, Is Required: False).

Page navigation heading reads "Lead Source" in the top breadcrumb/navbar area.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Lead Source Master page loads successfully

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/lead-source-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/lead-source-master
    - expect: The page title in the navigation bar should read 'Lead Source'
    - expect: The form card heading should display 'Add Lead Source'
    - expect: The 'Lead Source Name *' input field should be present and empty
    - expect: The 'Ask Details' checkbox should be present and unchecked
    - expect: The 'Is Required' checkbox should be present and unchecked
    - expect: The 'Clear' button and 'Submit' button should both be visible in the form
    - expect: The data table should load and display lead source records with 'Active' status by default

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/lead-source-master and inspect the form section
    - expect: The form section heading should read 'Add Lead Source'
    - expect: An info icon button should be present next to the 'Add Lead Source' heading
    - expect: The 'Lead Source Name *' text input field should be visible and focusable
    - expect: The helper text 'Name of this lead source channel.' should be visible below the input field
    - expect: The 'Ask Details' checkbox should be visible with helper text 'Show a details field when this source is selected.'
    - expect: The 'Is Required' checkbox should be visible with helper text 'Make details entry mandatory for this source.'
    - expect: The 'Clear' button and 'Submit' button should be present below the checkboxes
  2. Inspect the data table toolbar section
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: A 'Search:' label with a 'Search Lead Source' text input should be present
    - expect: There should be no 'Import' button on this page
    - expect: There should be no 'Export Excel' button on this page
  3. Inspect the data table header row
    - expect: Table header columns should be: Sr. No., Action, Lead Source Name, Ask Details, Is Required, Status
    - expect: Lead Source Name, Ask Details, Is Required, and Status column headers should have a sort icon
    - expect: All 6 columns should be visible
  4. Inspect a sample table data row
    - expect: Sr. No. cell should contain a sequential number
    - expect: Action cell should contain an Edit icon (img with alt 'Edit') - no Delete icon
    - expect: Lead Source Name cell should contain the lead source name text
    - expect: Ask Details cell should display 'True' or 'False'
    - expect: Is Required cell should display 'True' or 'False'
    - expect: Status cell should display a badge/label reading 'Active' or 'Inactive'

#### 1.3. TC-SM-03: Info panel opens and closes correctly

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the info icon button next to the 'Add Lead Source' heading
    - expect: A side panel should open on the right side of the page
    - expect: The panel should have a heading 'Lead Source'
    - expect: The panel should contain sections for 'Title:', 'Video:', and 'Note:'
    - expect: The Note section should contain guidance text about Lead Source Name, Ask Details, and Status fields
    - expect: A close (X) link/button should be present in the panel
  2. Click the close link/button in the info side panel
    - expect: The info side panel should close
    - expect: The main form and table should remain unchanged and accessible

### 2. 2. Add Lead Source - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Lead Source with both checkboxes unchecked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/lead-source-master
    - expect: Page loads with 'Add Lead Source' form visible
    - expect: Both 'Ask Details' and 'Is Required' checkboxes are unchecked by default
  2. Click the 'Lead Source Name *' input field, type 'Cold Call', leave both checkboxes unchecked, and click the 'Submit' button
    - expect: A success toast notification should appear confirming creation
    - expect: The 'Lead Source Name *' input field should be cleared/empty after successful submission
    - expect: Both checkboxes should remain unchecked (reset to default)
    - expect: The record 'Cold Call' should appear in the data table with Ask Details: False, Is Required: False, and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a Lead Source with both checkboxes checked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Referral' in the 'Lead Source Name *' field, check the 'Ask Details' checkbox, check the 'Is Required' checkbox, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form should reset after successful submission
    - expect: The record 'Referral' should appear in the data table with Ask Details: True, Is Required: True, and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a Lead Source with only Ask Details checked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Walk-in' in the 'Lead Source Name *' field, check the 'Ask Details' checkbox only (leave 'Is Required' unchecked), and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form should reset after successful submission
    - expect: The record 'Walk-in' should appear in the data table with Ask Details: True, Is Required: False, and Status 'Active'

#### 2.4. TC-ADD-04: Successfully create a Lead Source with only Is Required checked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Social Media' in the 'Lead Source Name *' field, leave 'Ask Details' unchecked, check 'Is Required', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form should reset after successful submission
    - expect: The record 'Social Media' should appear in the data table with Ask Details: False, Is Required: True, and Status 'Active'

#### 2.5. TC-ADD-05: Successfully create a Lead Source with special characters in the name

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Trade Show & Expo (2025)' in the 'Lead Source Name *' field, leave both checkboxes unchecked, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record 'Trade Show & Expo (2025)' should appear in the data table with the exact name and Status 'Active'

#### 2.6. TC-ADD-06: Successfully create multiple Lead Source records sequentially

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Newspaper Ad', click 'Submit', then immediately type 'Radio Campaign', and click 'Submit' again
    - expect: First submission: success toast appears and field is cleared, checkboxes reset
    - expect: Second submission: success toast appears and field is cleared again
    - expect: Both records 'Newspaper Ad' and 'Radio Campaign' appear in the data table with Status 'Active'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Lead Source Name field shows inline validation error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the 'Submit' button without entering any value in the 'Lead Source Name *' field
    - expect: An inline validation error message should appear below the 'Lead Source Name *' input field (e.g., 'Please enter lead source name')
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.2. TC-VAL-02: Inline validation error clears when valid input is entered after failed submission

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the validation error
    - expect: Inline validation error is displayed below 'Lead Source Name *'
  2. Type 'Website Chat' in the 'Lead Source Name *' field
    - expect: The inline validation error should no longer be visible as the user starts typing
  3. Click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: Record 'Website Chat' should appear in the table with Status 'Active'

#### 3.3. TC-VAL-03: Submit form with only whitespace characters shows validation error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type '   ' (spaces only) in the 'Lead Source Name *' field, and click 'Submit'
    - expect: Inline validation error should be displayed below the 'Lead Source Name *' field
    - expect: No new record should be created in the data table

#### 3.4. TC-VAL-04: Clicking Clear on invalid (empty-submitted) form removes validation error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Submit' on empty form to trigger validation error, then click the 'Clear' button
    - expect: The inline validation error should no longer be visible
    - expect: The 'Lead Source Name *' input field should be empty
    - expect: Both 'Ask Details' and 'Is Required' checkboxes should be unchecked

#### 3.5. TC-VAL-05: Submit form with checkboxes checked but empty name shows validation error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, check 'Ask Details', check 'Is Required', leave the 'Lead Source Name *' field empty, and click 'Submit'
    - expect: An inline validation error message should appear below the 'Lead Source Name *' input field
    - expect: No new record should be created in the data table even though checkboxes are checked
    - expect: No success toast should appear

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Active Lead Source name shows an error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Website' (an existing Active record visible in the table) in the 'Lead Source Name *' field, and click 'Submit'
    - expect: An error toast message 'Something went wrong.' should appear
    - expect: No duplicate record should be added to the table

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Lead Source name

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'website' (lowercase version of an existing record 'Website') in the 'Lead Source Name *' field, and click 'Submit'
    - expect: If the system is case-insensitive, an error toast 'Something went wrong.' should appear and no duplicate is created
    - expect: If the system is case-sensitive, a new record 'website' may be created — note the behavior for documentation

#### 4.3. TC-DUP-03: Submitting a name matching an existing Inactive record shows an error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. First change the Status filter to 'Inactive' and note the name of any Inactive record. Then change the filter back to 'Active'. In the 'Lead Source Name *' field, enter the name of the Inactive record observed, and click 'Submit'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: No new record is created with the duplicate name

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Lead Source form

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page, type 'Test Lead Source' in the 'Lead Source Name *' field, check 'Ask Details', check 'Is Required', then click the 'Clear' button
    - expect: The 'Lead Source Name *' input field should be empty/cleared
    - expect: The 'Ask Details' checkbox should be unchecked
    - expect: The 'Is Required' checkbox should be unchecked
    - expect: The form heading should still read 'Add Lead Source'
    - expect: No record should have been created in the data table

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Lead Source state

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the 'Edit' icon on any table row (e.g., 'India Mart')
    - expect: The form heading changes to 'Update Lead Source'
    - expect: The 'Lead Source Name *' field is pre-filled with the record's name
    - expect: The 'Ask Details' checkbox reflects the record's stored value
    - expect: The 'Is Required' checkbox reflects the record's stored value
    - expect: A 'Status *' dropdown appears with helper text 'Select active or inactive'
    - expect: An 'Update' button replaces the 'Submit' button
  2. Click the 'Clear' button while in Update Lead Source mode
    - expect: The form heading reverts to 'Add Lead Source'
    - expect: The 'Lead Source Name *' input field is cleared and empty
    - expect: The 'Ask Details' checkbox is unchecked
    - expect: The 'Is Required' checkbox is unchecked
    - expect: The 'Status *' dropdown disappears
    - expect: The 'Update' button reverts back to 'Submit' button

#### 5.3. TC-CLR-03: Clear button in Update mode with validation error resets the error state

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Lead Source Name *' field, click 'Update' to trigger the validation error, then click 'Clear'
    - expect: After clicking 'Clear', the inline validation error should not be visible
    - expect: The form should return to 'Add Lead Source' mode with an empty input and unchecked checkboxes

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens record in Update Lead Source mode with pre-filled fields

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the 'Edit' icon (img with alt='Edit') on a row with known values (e.g., 'Expo' which has Ask Details: True, Is Required: True)
    - expect: The form heading changes from 'Add Lead Source' to 'Update Lead Source'
    - expect: The 'Lead Source Name *' input field is pre-filled with 'Expo'
    - expect: The 'Ask Details' checkbox is checked (reflecting True value)
    - expect: The 'Is Required' checkbox is checked (reflecting True value)
    - expect: A 'Status *' dropdown appears with the current status pre-selected (e.g., 'Active')
    - expect: The helper text 'Select active or inactive' appears below the Status dropdown
    - expect: The 'Submit' button is replaced by an 'Update' button
    - expect: The 'Clear' button remains visible

#### 6.2. TC-EDT-02: Edit icon opens record with both checkboxes unchecked (False values)

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the 'Edit' icon on a row with Ask Details: False and Is Required: False (e.g., 'India Mart')
    - expect: The form heading changes to 'Update Lead Source'
    - expect: The 'Lead Source Name *' field is pre-filled with 'India Mart'
    - expect: The 'Ask Details' checkbox is unchecked (reflecting False value)
    - expect: The 'Is Required' checkbox is unchecked (reflecting False value)
    - expect: The 'Status *' dropdown is present with the current status selected

#### 6.3. TC-EDT-03: Successfully update a Lead Source record with a new name

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on the row for 'Repeat Client', clear the 'Lead Source Name *' field, type 'Returning Client', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode with empty fields and unchecked checkboxes
    - expect: The data table should reflect the updated name 'Returning Client' in the corresponding row

#### 6.4. TC-EDT-04: Successfully update Ask Details checkbox from unchecked to checked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record where Ask Details is False (e.g., 'From Boss'), check the 'Ask Details' checkbox (leave other fields as-is), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode
    - expect: The data table row for 'From Boss' should now show Ask Details: True

#### 6.5. TC-EDT-05: Successfully update Is Required checkbox from unchecked to checked

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record where Is Required is False (e.g., 'Website'), check the 'Is Required' checkbox (leave other fields as-is), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode
    - expect: The data table row for 'Website' should now show Is Required: True

#### 6.6. TC-EDT-06: Update with empty Lead Source Name field shows validation error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Lead Source Name *' input field (so it is empty), and click 'Update'
    - expect: Inline validation error should appear below the 'Lead Source Name *' input field
    - expect: No update should be submitted
    - expect: No success or error toast should appear

#### 6.7. TC-EDT-07: Update Lead Source name to match an existing Active record shows error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on one record (e.g., 'From Boss'), change its name to the name of another existing active record (e.g., 'Website'), and click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original record should remain unchanged in the table

#### 6.8. TC-EDT-08: Update Lead Source name to match an existing Inactive record shows error

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive record (e.g., 'Old Source'). Change the Status filter back to 'Active' and click the 'Edit' icon on any Active record (e.g., 'From Boss')
    - expect: The form is in 'Update Lead Source' mode with the Active record's name pre-filled
  2. Clear the 'Lead Source Name *' input and type the name of the existing Inactive record (e.g., 'Old Source'), then click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original Active record should remain unchanged in the table
    - expect: No duplicate record should be created
    - expect: The form should remain in 'Update Lead Source' mode without resetting

#### 6.9. TC-EDT-09: Update Lead Source status from Active to Inactive

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on an active record (e.g., 'Google Lead'), keep the name and checkboxes unchanged, change the 'Status *' dropdown from 'Active' to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode
    - expect: The record 'Google Lead' should no longer appear in the table when the Status filter is set to 'Active'
    - expect: The record should appear when the Status filter is changed to 'Inactive' or 'All'

#### 6.10. TC-EDT-10: Update Lead Source status from Inactive to Active (re-activate record)

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the Status filter dropdown to 'Inactive' and click the 'Edit' icon on an Inactive record
    - expect: The 'Update Lead Source' form opens with the record pre-filled and Status set to 'Inactive'
    - expect: All checkboxes reflect the stored values
  2. Change the 'Status *' dropdown to 'Active' and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode
    - expect: The re-activated record should no longer appear when the Status filter is set to 'Inactive'
    - expect: The record should appear again when the Status filter is set to 'Active'

#### 6.11. TC-EDT-11: Update both checkboxes simultaneously during edit

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record where both Ask Details and Is Required are True (e.g., 'Site Visit'), uncheck both 'Ask Details' and 'Is Required' checkboxes, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Lead Source' mode
    - expect: The data table row for 'Site Visit' should now show Ask Details: False and Is Required: False

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Default status filter shows Active records only

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and check the 'Status:' filter dropdown default value
    - expect: The 'Status:' filter dropdown should default to 'Active'
    - expect: The table should display only records with an 'Active' status badge
    - expect: No 'Inactive' status records should be visible in the table

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All'
    - expect: The table should display both Active and Inactive records
    - expect: Records with both 'Active' and 'Inactive' status badges should be visible

#### 7.3. TC-FLT-03: Filter table to show only Inactive records

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'Inactive'
    - expect: The table should display only records with an 'Inactive' status badge
    - expect: No 'Active' records should be visible
    - expect: If no Inactive records exist, the table should show a 'no records' message

#### 7.4. TC-FLT-04: Status filter resets when navigating away and back

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All', then navigate to another page (e.g., Dashboard), and navigate back to the Lead Source Master page
    - expect: The Status filter should reset to the default value 'Active' upon re-navigation

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial Lead Source name returns matching results

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and type 'Google' in the 'Search Lead Source' input box
    - expect: The table should filter to show only records containing 'Google' in the Lead Source Name (e.g., 'Google Lead')
    - expect: Records not containing 'Google' should be hidden

#### 8.2. TC-SRC-02: Search by complete Lead Source name returns exact matching result

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Type 'Facebook' (an exact name from the table) in the 'Search Lead Source' input box
    - expect: Only the record 'Facebook' should be displayed in the table
    - expect: All other records should be hidden

#### 8.3. TC-SRC-03: Search with a non-existent name returns no results

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Type 'XYZ123NONEXISTENT' in the 'Search Lead Source' input box
    - expect: The table body should show a 'no records' message (e.g., 'There are no records to display')
    - expect: No data rows should be visible in the table

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Type a search term to filter the table, then clear the 'Search Lead Source' input (either by selecting all and deleting, or using the clear/X control)
    - expect: The table should restore and display the full list of records based on the current Status filter
    - expect: Previously hidden records should reappear

#### 8.5. TC-SRC-05: Search is case-insensitive

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Type 'facebook' (all lowercase) in the 'Search Lead Source' input box
    - expect: The record 'Facebook' should appear in the filtered results even though the casing differs

#### 8.6. TC-SRC-06: Search filters apply on top of the active Status filter

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Active', then type 'India' in the 'Search Lead Source' input box
    - expect: Only Active records containing 'India' in the Lead Source Name should appear (e.g., 'India Mart')
    - expect: Inactive records matching 'India' should not appear

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and inspect the 'Show:' dropdown in the table toolbar
    - expect: The 'Show:' dropdown should have '25' selected as the default value

#### 9.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '10'
    - expect: The table should display a maximum of 10 rows
    - expect: If there are more than 10 records, pagination controls (Next page, Previous page) should appear

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Set 'Show:' to '10' to enable pagination (assuming more than 10 records exist), then click the 'Next page' button
    - expect: The table should navigate to the next page showing the next set of records
    - expect: The current page indicator (e.g., 'Page 2 is your current page') should update
  2. Click the 'Previous page' button
    - expect: The table should navigate back to the previous page
    - expect: The current page indicator should revert to page 1

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and then 100

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '50'
    - expect: The table should display up to 50 records per page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table should display up to 100 records per page
    - expect: All records should be visible on a single page if the total count is 100 or fewer

#### 9.5. TC-PAG-05: Pagination is disabled when all records fit on one page

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page with the default 'Show: 25' setting and verify the total record count is 25 or fewer
    - expect: The 'Previous page' button should be disabled
    - expect: The 'Next page' button should be disabled
    - expect: Only page '1' button should be shown in the pagination control

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Lead Source Name column ascending

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Navigate to the Lead Source Master page and click the 'Lead Source Name' column header button
    - expect: The table should sort records by Lead Source Name in ascending alphabetical order (A to Z)
    - expect: The sort icon on the 'Lead Source Name' column header should indicate ascending sort

#### 10.2. TC-SRT-02: Sort table by Lead Source Name column descending

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click the 'Lead Source Name' column header button a second time
    - expect: The table should sort records by Lead Source Name in descending alphabetical order (Z to A)
    - expect: The sort icon should indicate descending sort

#### 10.3. TC-SRT-03: Sort table by Ask Details column

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click the 'Ask Details' column header button
    - expect: The table should sort records by Ask Details value (True/False) in ascending order
    - expect: The sort icon on the 'Ask Details' column header should reflect the sort direction

#### 10.4. TC-SRT-04: Sort table by Is Required column

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Click the 'Is Required' column header button
    - expect: The table should sort records by Is Required value (True/False) in ascending order
    - expect: The sort icon on the 'Is Required' column header should reflect the sort direction

#### 10.5. TC-SRT-05: Sort table by Status column

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. With Status filter set to 'All', click the 'Status' column header button
    - expect: The table should sort records by Status (Active/Inactive) in ascending or descending order
    - expect: The sort icon on the 'Status' column header should reflect the sort direction

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INACT-01: Inactive records are hidden from the Active filter view by default

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists (by editing a record and setting it to Inactive), then navigate to the Lead Source Master page
    - expect: The Status filter defaults to 'Active'
    - expect: The Inactive record should not appear in the table under the Active filter

#### 11.2. TC-INACT-02: Inactive records are visible when filtering by Inactive or All

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists. Change the Status filter to 'Inactive'
    - expect: Only Inactive records should be displayed in the table
    - expect: Active records should be hidden
  2. Change the Status filter to 'All'
    - expect: Both Active and Inactive records should appear in the table

#### 11.3. TC-INACT-03: Edit icon is available for Inactive records and loads correct checkbox values

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' to reveal inactive records, then click the 'Edit' icon on an Inactive record
    - expect: The 'Update Lead Source' form should open with the record's data pre-filled
    - expect: The 'Status *' dropdown should show 'Inactive' as the current selection
    - expect: The 'Ask Details' and 'Is Required' checkboxes should reflect the stored values for the inactive record

#### 11.4. TC-INACT-04: Checkbox values are preserved when a record is inactivated and reactivated

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Edit a record that has Ask Details: True and Is Required: True (e.g., 'Expo'), change the Status to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record should no longer appear under the Active filter
  2. Change the Status filter to 'Inactive', click 'Edit' on the 'Expo' record, change Status back to 'Active', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record 'Expo' should reappear under the Active filter with Ask Details: True and Is Required: True preserved

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Lead Source Master is accessible via the Sales Masters sidebar menu

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Log in to ElevatorPlus and click 'Sales Masters' in the left sidebar navigation menu to expand it
    - expect: The Sales Masters submenu should expand showing multiple options
    - expect: A 'Lead Source' link should be visible in the expanded submenu
    - expect: The link URL should be /master/lead-source-master
  2. Click the 'Lead Source' link in the submenu
    - expect: The browser should navigate to https://stage.elevatorplus.net/master/lead-source-master
    - expect: The Lead Source Master page should load with the 'Add Lead Source' form and data table

#### 12.2. TC-NAV-02: Unauthenticated users cannot access the Lead Source Master page

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. Without logging in (or after logging out), directly navigate to https://stage.elevatorplus.net/master/lead-source-master
    - expect: The user should be redirected to the login page
    - expect: The Lead Source Master page content should not be accessible without authentication

#### 12.3. TC-NAV-03: Direct URL navigation to Lead Source Master works when authenticated

**File:** `tests/Sales-master/lead-source-master.spec.ts`

**Steps:**
  1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/lead-source-master via the browser address bar
    - expect: The page should load successfully without redirecting
    - expect: The 'Add Lead Source' form and data table should be fully functional
