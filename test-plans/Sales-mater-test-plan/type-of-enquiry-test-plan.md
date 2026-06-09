# Type of Enquiry Master Test Plan

## Application Overview

The Type of Enquiry Master page is part of the ElevatorPlus Sales Masters section, accessible at https://stage.elevatorplus.net/master/type-of-enquiry. It allows admin users to manage enquiry types used to classify how a lead or enquiry was initiated. The page has two main sections: (1) an "Add Type of Enquiry" form at the top, and (2) a data table listing all type of enquiry records below.

The Add Type of Enquiry form contains two fields: "Type of Enquiry *" (mandatory text input) and "Ask Firm Details" (optional checkbox). An info icon button is present next to the "Add Type of Enquiry" heading that opens a side panel with Title, Video, and Note guidance sections. The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Type of Enquiry" mode with all fields pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) with helper text "Select active or inactive", and the action button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), and a "Search By Type" text input. Note: There is no Import button or Export Excel button on this page.

The table has five columns: Sr. No., Action, Type of Enquiry, Ask Firm Details, and Status. The Ask Firm Details column displays "True" or "False" values. The Status column displays Active/Inactive badge labels. The Action column contains only an Edit icon (no Delete).

Page navigation heading reads "Type of Enquiry Master" in the top breadcrumb/navbar area.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Type of Enquiry Master page loads successfully

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/type-of-enquiry
    - expect: The page URL should be https://stage.elevatorplus.net/master/type-of-enquiry
    - expect: The page title in the navigation bar should read 'Type of Enquiry Master'
    - expect: The form card heading should display 'Add Type of Enquiry'
    - expect: The 'Type of Enquiry *' input field should be present and empty
    - expect: The 'Ask Firm Details' checkbox should be present and unchecked
    - expect: The 'Clear' button and 'Submit' button should both be visible in the form
    - expect: The data table should load and display type of enquiry records with 'Active' status by default

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/type-of-enquiry and inspect the form section
    - expect: The form section heading should read 'Add Type of Enquiry'
    - expect: An info icon button should be present next to the 'Add Type of Enquiry' heading
    - expect: The 'Type of Enquiry *' text input field should be visible and focusable
    - expect: The 'Ask Firm Details' checkbox should be visible and unchecked by default
    - expect: The 'Clear' button and 'Submit' button should be present below the fields
  2. Inspect the data table toolbar section
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: A 'Search:' label with a 'Search By Type' text input should be present
    - expect: There should be no 'Import' button on this page
    - expect: There should be no 'Export Excel' button on this page
  3. Inspect the data table header row
    - expect: Table header columns should be: Sr. No., Action, Type of Enquiry, Ask Firm Details, Status
    - expect: Type of Enquiry, Ask Firm Details, and Status column headers should have a sort icon
    - expect: All 5 columns should be visible
  4. Inspect a sample table data row
    - expect: Sr. No. cell should contain a sequential number
    - expect: Action cell should contain an Edit icon (img with alt 'Edit') - no Delete icon
    - expect: Type of Enquiry cell should contain the enquiry type name text
    - expect: Ask Firm Details cell should display 'True' or 'False'
    - expect: Status cell should display a badge/label reading 'Active' or 'Inactive'

#### 1.3. TC-SM-03: Info panel opens and closes correctly

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the info icon button next to the 'Add Type of Enquiry' heading
    - expect: A side panel should open on the right side of the page
    - expect: The panel should contain sections for 'Title:', 'Video:', and 'Note:'
    - expect: The Note section should contain guidance text about Type of Enquiry and Ask Firm Details fields
    - expect: A close (X) link/button should be present in the panel
  2. Click the close link/button in the info side panel
    - expect: The info side panel should close
    - expect: The main form and table should remain unchanged and accessible

### 2. 2. Add Type of Enquiry - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Type of Enquiry with checkbox unchecked

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/type-of-enquiry
    - expect: Page loads with 'Add Type of Enquiry' form visible
    - expect: The 'Ask Firm Details' checkbox is unchecked by default
  2. Click the 'Type of Enquiry *' input field, type 'Online Enquiry', leave the 'Ask Firm Details' checkbox unchecked, and click the 'Submit' button
    - expect: A success toast notification should appear confirming creation
    - expect: The 'Type of Enquiry *' input field should be cleared/empty after successful submission
    - expect: The 'Ask Firm Details' checkbox should remain unchecked (reset to default)
    - expect: The record 'Online Enquiry' should appear in the data table with Ask Firm Details: No and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a Type of Enquiry with Ask Firm Details checkbox checked

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, type 'Telephone Enquiry' in the 'Type of Enquiry *' field, check the 'Ask Firm Details' checkbox, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form should reset after successful submission
    - expect: The record 'Telephone Enquiry' should appear in the data table with Ask Firm Details: Yes and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a Type of Enquiry with special characters in the name

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, type 'Walk-in & Direct (2025)' in the 'Type of Enquiry *' field, leave the 'Ask Firm Details' checkbox unchecked, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record 'Walk-in & Direct (2025)' should appear in the data table with the exact name and Status 'Active'

#### 2.4. TC-ADD-04: Successfully create multiple Type of Enquiry records sequentially

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, type 'Email Enquiry', click 'Submit', then immediately type 'Social Media Enquiry', and click 'Submit' again
    - expect: First submission: success toast appears and the field is cleared, checkbox resets
    - expect: Second submission: success toast appears and the field is cleared again
    - expect: Both records 'Email Enquiry' and 'Social Media Enquiry' appear in the data table with Status 'Active'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Type of Enquiry field shows inline validation error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the 'Submit' button without entering any value in the 'Type of Enquiry *' field
    - expect: An inline validation error message should appear below the 'Type of Enquiry *' input field (e.g., 'Please enter type of enquiry')
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.2. TC-VAL-02: Inline validation error clears when valid input is entered after failed submission

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the validation error
    - expect: Inline validation error is displayed below 'Type of Enquiry *'
  2. Type 'Direct Visit' in the 'Type of Enquiry *' field
    - expect: The inline validation error should no longer be visible as the user starts typing
  3. Click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: Record 'Direct Visit' should appear in the table with Status 'Active'

#### 3.3. TC-VAL-03: Submit form with only whitespace characters shows validation error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, type '   ' (spaces only) in the 'Type of Enquiry *' field, and click 'Submit'
    - expect: Inline validation error should be displayed below the 'Type of Enquiry *' field
    - expect: No new record should be created in the data table

#### 3.4. TC-VAL-04: Clicking Clear on invalid (empty-submitted) form removes validation error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Submit' on empty form to trigger validation error, then click the 'Clear' button
    - expect: The inline validation error should no longer be visible
    - expect: The 'Type of Enquiry *' input field should be empty
    - expect: The 'Ask Firm Details' checkbox should be unchecked

#### 3.5. TC-VAL-05: Submit form with checkbox checked but empty name shows validation error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, check 'Ask Firm Details', leave the 'Type of Enquiry *' field empty, and click 'Submit'
    - expect: An inline validation error message should appear below the 'Type of Enquiry *' input field
    - expect: No new record should be created in the data table even though the checkbox is checked
    - expect: No success toast should appear

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Active Type of Enquiry name shows an error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, note an existing Active record name from the table, type that name in the 'Type of Enquiry *' field, and click 'Submit'
    - expect: An error toast message 'Something went wrong.' should appear
    - expect: No duplicate record should be added to the table

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Type of Enquiry name

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, note an existing Active record (e.g., 'Online Enquiry'), type the lowercase version 'online enquiry' in the 'Type of Enquiry *' field, and click 'Submit'
    - expect: If the system is case-insensitive, an error toast 'Something went wrong.' should appear and no duplicate is created
    - expect: If the system is case-sensitive, a new record 'online enquiry' may be created — note the behavior for documentation

#### 4.3. TC-DUP-03: Submitting a name matching an existing Inactive record shows an error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive record. Change the filter back to 'Active'. In the 'Type of Enquiry *' field, enter the name of the Inactive record, and click 'Submit'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: No new record is created with the duplicate name

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Type of Enquiry form

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page, type 'Test Enquiry Type' in the 'Type of Enquiry *' field, check 'Ask Firm Details', then click the 'Clear' button
    - expect: The 'Type of Enquiry *' input field should be empty/cleared
    - expect: The 'Ask Firm Details' checkbox should be unchecked
    - expect: The form heading should still read 'Add Type of Enquiry'
    - expect: No record should have been created in the data table

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Type of Enquiry state

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the 'Edit' icon on any table row
    - expect: The form heading changes to 'Update Type of Enquiry'
    - expect: The 'Type of Enquiry *' field is pre-filled with the record's name
    - expect: The 'Ask Firm Details' checkbox reflects the record's stored value
    - expect: A 'Status *' dropdown appears with helper text 'Select active or inactive'
    - expect: An 'Update' button replaces the 'Submit' button
  2. Click the 'Clear' button while in Update Type of Enquiry mode
    - expect: The form heading reverts to 'Add Type of Enquiry'
    - expect: The 'Type of Enquiry *' input field is cleared and empty
    - expect: The 'Ask Firm Details' checkbox is unchecked
    - expect: The 'Status *' dropdown disappears
    - expect: The 'Update' button reverts back to 'Submit' button

#### 5.3. TC-CLR-03: Clear button in Update mode with validation error resets the error state

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Type of Enquiry *' field, click 'Update' to trigger the validation error, then click 'Clear'
    - expect: After clicking 'Clear', the inline validation error should not be visible
    - expect: The form should return to 'Add Type of Enquiry' mode with an empty input and unchecked checkbox

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens record in Update Type of Enquiry mode with pre-filled fields

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the 'Edit' icon (img with alt='Edit') on a row with known values where Ask Firm Details is True
    - expect: The form heading changes from 'Add Type of Enquiry' to 'Update Type of Enquiry'
    - expect: The 'Type of Enquiry *' input field is pre-filled with the record's name
    - expect: The 'Ask Firm Details' checkbox is checked (reflecting True value)
    - expect: A 'Status *' dropdown appears with the current status pre-selected (e.g., 'Active')
    - expect: The helper text 'Select active or inactive' appears below the Status dropdown
    - expect: The 'Submit' button is replaced by an 'Update' button
    - expect: The 'Clear' button remains visible

#### 6.2. TC-EDT-02: Edit icon opens record with Ask Firm Details unchecked or checked  means if the record is with check then while updating it hould be checked (False value)

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the 'Edit' icon on a row where Ask Firm Details is False
    - expect: The form heading changes to 'Update Type of Enquiry'
    - expect: The 'Type of Enquiry *' field is pre-filled with the record's name
    - expect: The 'Ask Firm Details' checkbox is unchecked (reflecting False value)
    - expect: The 'Status *' dropdown is present with the current status selected

#### 6.3. TC-EDT-03: Successfully update a Type of Enquiry record with a new name

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on any active record, clear the 'Type of Enquiry *' field, type 'Updated Enquiry Name', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Type of Enquiry' mode with empty fields and unchecked checkbox
    - expect: The data table should reflect the updated name in the corresponding row

#### 6.4. TC-EDT-04: Successfully update Ask Firm Details checkbox from unchecked to checked

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record where Ask Firm Details is False, check the 'Ask Firm Details' checkbox (leave other fields as-is), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Type of Enquiry' mode
    - expect: The data table row should now show Ask Firm Details: Yes

#### 6.5. TC-EDT-05: Successfully update Ask Firm Details checkbox from checked to unchecked

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record where Ask Firm Details is True, uncheck the 'Ask Firm Details' checkbox (leave other fields as-is), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Type of Enquiry' mode
    - expect: The data table row should now show Ask Firm Details: No

#### 6.6. TC-EDT-06: Update with empty Type of Enquiry field shows validation error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Type of Enquiry *' input field (so it is empty), and click 'Update'
    - expect: Inline validation error should appear below the 'Type of Enquiry *' input field
    - expect: No update should be submitted
    - expect: No success or error toast should appear

#### 6.7. TC-EDT-07: Update Type of Enquiry name to match an existing Active record shows error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on one record, change its name to the name of another existing active record, and click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original record should remain unchanged in the table

#### 6.8. TC-EDT-08: Update Type of Enquiry name to match an existing Inactive record shows error

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive record. Change the Status filter back to 'Active' and click the 'Edit' icon on any Active record
    - expect: The form is in 'Update Type of Enquiry' mode with the Active record's name pre-filled
  2. Clear the 'Type of Enquiry *' input and type the name of the existing Inactive record, then click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original Active record should remain unchanged in the table
    - expect: No duplicate record should be created

#### 6.9. TC-EDT-09: Update Type of Enquiry status from Active to Inactive

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click 'Edit' on an active record, keep the name and checkbox unchanged, change the 'Status *' dropdown from 'Active' to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Type of Enquiry' mode
    - expect: The record should no longer appear in the table when the Status filter is set to 'Active'
    - expect: The record should appear when the Status filter is changed to 'Inactive' or 'All'

#### 6.10. TC-EDT-10: Update Type of Enquiry status from Inactive to Active (re-activate record)

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the Status filter dropdown to 'Inactive' and click the 'Edit' icon on an Inactive record
    - expect: The 'Update Type of Enquiry' form opens with the record pre-filled and Status set to 'Inactive'
    - expect: The 'Ask Firm Details' checkbox reflects the stored value
  2. Change the 'Status *' dropdown to 'Active' and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Type of Enquiry' mode
    - expect: The re-activated record should no longer appear when the Status filter is set to 'Inactive'
    - expect: The record should appear again when the Status filter is set to 'Active'

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Default status filter shows Active records only

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and check the 'Status:' filter dropdown default value
    - expect: The 'Status:' filter dropdown should default to 'Active'
    - expect: The table should display only records with an 'Active' status badge
    - expect: No 'Inactive' status records should be visible in the table

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All'
    - expect: The table should display both Active and Inactive records
    - expect: Records with both 'Active' and 'Inactive' status badges should be visible

#### 7.3. TC-FLT-03: Filter table to show only Inactive records

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'Inactive'
    - expect: The table should display only records with an 'Inactive' status badge
    - expect: No 'Active' records should be visible
    - expect: If no Inactive records exist, the table should show a 'no records' message

#### 7.4. TC-FLT-04: Status filter resets when navigating away and back

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All', then navigate to another page (e.g., Dashboard), and navigate back to the Type of Enquiry Master page
    - expect: The Status filter should reset to the default value 'Active' upon re-navigation

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial Type of Enquiry name returns matching results

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and type a partial name (e.g., 'Online') in the 'Search By Type' input box
    - expect: The table should filter to show only records containing 'Online' in the Type of Enquiry name
    - expect: Records not containing 'Online' should be hidden

#### 8.2. TC-SRC-02: Search by complete Type of Enquiry name returns exact matching result

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Type an exact record name from the table in the 'Search By Type' input box
    - expect: Only that exact record should be displayed in the table
    - expect: All other records should be hidden

#### 8.3. TC-SRC-03: Search with a non-existent name returns no results

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Type 'XYZ123NONEXISTENT' in the 'Search By Type' input box
    - expect: The table body should show a 'no records' message (e.g., 'There are no records to display')
    - expect: No data rows should be visible in the table

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Type a search term to filter the table, then clear the 'Search By Type' input (either by selecting all and deleting, or using the clear/X control)
    - expect: The table should restore and display the full list of records based on the current Status filter
    - expect: Previously hidden records should reappear

#### 8.5. TC-SRC-05: Search is case-insensitive

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Type a search term in all lowercase (e.g., 'online') in the 'Search By Type' input box
    - expect: Records containing 'Online' (with mixed case) should appear in the filtered results

#### 8.6. TC-SRC-06: Search filters apply on top of the active Status filter

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Active', then type a partial name in the 'Search By Type' input box
    - expect: Only Active records containing the search term should appear
    - expect: Inactive records matching the search term should not appear

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and inspect the 'Show:' dropdown in the table toolbar
    - expect: The 'Show:' dropdown should have '25' selected as the default value

#### 9.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '10'
    - expect: The table should display a maximum of 10 rows
    - expect: If there are more than 10 records, pagination controls (Next page, Previous page) should appear

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Set 'Show:' to '10' to enable pagination (assuming more than 10 records exist), then click the 'Next page' button
    - expect: The table should navigate to the next page showing the next set of records
    - expect: The current page indicator should update accordingly
  2. Click the 'Previous page' button
    - expect: The table should navigate back to the previous page
    - expect: The current page indicator should revert to page 1

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and then 100

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '50'
    - expect: The table should display up to 50 records per page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table should display up to 100 records per page
    - expect: All records should be visible on a single page if the total count is 100 or fewer

#### 9.5. TC-PAG-05: Pagination is disabled when all records fit on one page

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page with the default 'Show: 25' setting and verify the total record count is 25 or fewer
    - expect: The 'Previous page' button should be disabled
    - expect: The 'Next page' button should be disabled
    - expect: Only page '1' button should be shown in the pagination control

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Type of Enquiry column ascending

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Navigate to the Type of Enquiry Master page and click the 'Type of Enquiry' column header button
    - expect: The table should sort records by Type of Enquiry name in ascending alphabetical order (A to Z)
    - expect: The sort icon on the 'Type of Enquiry' column header should indicate ascending sort

#### 10.2. TC-SRT-02: Sort table by Type of Enquiry column descending

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click the 'Type of Enquiry' column header button a second time
    - expect: The table should sort records by Type of Enquiry name in descending alphabetical order (Z to A)
    - expect: The sort icon should indicate descending sort

#### 10.3. TC-SRT-03: Sort table by Ask Firm Details column

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Click the 'Ask Firm Details' column header button
    - expect: The table should sort records by Ask Firm Details value (True/False) in ascending order
    - expect: The sort icon on the 'Ask Firm Details' column header should reflect the sort direction

#### 10.4. TC-SRT-04: Sort table by Status column

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. With Status filter set to 'All', click the 'Status' column header button
    - expect: The table should sort records by Status (Active/Inactive) in ascending or descending order
    - expect: The sort icon on the 'Status' column header should reflect the sort direction

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INACT-01: Inactive records are hidden from the Active filter view by default

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists (by editing a record and setting it to Inactive), then navigate to the Type of Enquiry Master page
    - expect: The Status filter defaults to 'Active'
    - expect: The Inactive record should not appear in the table under the Active filter

#### 11.2. TC-INACT-02: Inactive records are visible when filtering by Inactive or All

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists. Change the Status filter to 'Inactive'
    - expect: Only Inactive records should be displayed in the table
    - expect: Active records should be hidden
  2. Change the Status filter to 'All'
    - expect: Both Active and Inactive records should appear in the table

#### 11.3. TC-INACT-03: Edit icon is available for Inactive records and loads correct field values

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' to reveal inactive records, then click the 'Edit' icon on an Inactive record
    - expect: The 'Update Type of Enquiry' form should open with the record's data pre-filled
    - expect: The 'Status *' dropdown should show 'Inactive' as the current selection
    - expect: The 'Ask Firm Details' checkbox should reflect the stored value for the inactive record

#### 11.4. TC-INACT-04: Ask Firm Details value is preserved when a record is inactivated and reactivated

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Edit a record that has Ask Firm Details: Yes, change the Status to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record should no longer appear under the Active filter
  2. Change the Status filter to 'Inactive', click 'Edit' on the inactivated record, change Status back to 'Active', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record should reappear under the Active filter with Ask Firm Details: Yes preserved

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Type of Enquiry Master is accessible via the Sales Masters sidebar menu

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. Log in to ElevatorPlus and click 'Sales Masters' in the left sidebar navigation menu to expand it
    - expect: The Sales Masters submenu should expand showing multiple options
    - expect: A 'Type of Enquiry' link should be visible in the expanded submenu
    - expect: The link URL should be /master/type-of-enquiry-master
  2. Click the 'Type of Enquiry' link in the submenu
    - expect: The browser should navigate to https://stage.elevatorplus.net/master/type-of-enquiry
    - expect: The Type of Enquiry Master page should load with the 'Add Type of Enquiry' form and data table

#### 12.2. TC-NAV-02: Direct URL navigation to Type of Enquiry Master works when authenticated

**File:** `tests/Sales-master/type-of-enquiry-master.spec.ts`

**Steps:**
  1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/type-of-enquiry via the browser address bar
    - expect: The page URL should be https://stage.elevatorplus.net/master/type-of-enquiry
    - expect: The 'Add Type of Enquiry' form heading should be visible
    - expect: The 'Type of Enquiry *' input field should be present and accessible
