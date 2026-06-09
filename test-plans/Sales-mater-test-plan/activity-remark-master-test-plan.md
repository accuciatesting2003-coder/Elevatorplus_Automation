# Activity Remark Master Test Plan

## Application Overview

The Activity Remark Master page is part of the ElevatorPlus Sales Masters section, accessible at https://stage.elevatorplus.net/master/activity-remark-master. It allows admin users to manage activity remarks used to classify and describe actions taken on a lead or enquiry. The page has two main sections: (1) an "Add Activity Remark" form at the top, and (2) a data table listing all activity remark records below.

The Add Activity Remark form contains one field: "Activity Remark *" (mandatory text input) with a helper text below reading "Built-in remarks (Final, Warm, Lost etc.) cannot be edited." An info icon button is present next to the "Add Activity Remark" heading that opens a side panel with Title, Video, and Note guidance sections. The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Activity Remark" mode with the Activity Remark field pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) with helper text "Select active or inactive", and the action button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Import" button, and a "Search Activity Remark" text input. Note: There is no Export Excel button on this page.

The table has four columns: Sr. No., Action, Activity Remark, and Status. The Status column displays Active/Inactive badge labels. The Action column contains only an Edit icon (no Delete). The page pre-loads with system built-in records including: Final, Warm, Lost, Cold, Hot — these built-in records cannot be edited via the application.

Page navigation heading reads "Activity Remark Master" in the top breadcrumb/navbar area.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Activity Remark Master page loads successfully

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/activity-remark-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/activity-remark-master
    - expect: The page title in the navigation bar should read 'Activity Remark Master'
    - expect: The form card heading should display 'Add Activity Remark'
    - expect: The 'Activity Remark *' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible in the form
    - expect: The data table should load and display activity remark records with 'Active' status by default

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/activity-remark-master and inspect the form section
    - expect: The form section heading should read 'Add Activity Remark'
    - expect: An info icon button should be present next to the 'Add Activity Remark' heading
    - expect: The 'Activity Remark *' text input field should be visible and focusable
    - expect: The helper text 'Built-in remarks (Final, Warm, Lost etc.) cannot be edited.' should be visible below the input field
    - expect: The 'Clear' button and 'Submit' button should be present below the input field
  2. Inspect the data table toolbar section
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: An 'Import' button with an icon should be present
    - expect: A 'Search:' label with a 'Search Activity Remark' text input should be present
    - expect: There should be no 'Export Excel' button on this page
  3. Inspect the data table header row
    - expect: Table header columns should be: Sr. No., Action, Activity Remark, Status
    - expect: Activity Remark and Status column headers should have a sort icon
    - expect: All 4 columns should be visible
  4. Inspect a sample table data row
    - expect: Sr. No. cell should contain a sequential number
    - expect: Action cell should contain an Edit icon (img with alt 'Edit') - no Delete icon
    - expect: Activity Remark cell should contain the remark text
    - expect: Status cell should display a badge/label reading 'Active' or 'Inactive'

#### 1.3. TC-SM-03: Info panel opens and closes correctly

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the info icon button next to the 'Add Activity Remark' heading
    - expect: A side panel should open on the right side of the page
    - expect: The panel should have a heading 'Activity Remark Master'
    - expect: The panel should contain sections for 'Title:', 'Video:', and 'Note:'
    - expect: A close (X) link/button should be present in the panel
  2. Click the close link/button in the info side panel
    - expect: The info side panel should close
    - expect: The main form and table should remain unchanged and accessible

### 2. 2. Add Activity Remark - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Activity Remark

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/activity-remark-master
    - expect: Page loads with 'Add Activity Remark' form visible
  2. Click the 'Activity Remark *' input field and type 'Follow Up Pending', then click the 'Submit' button
    - expect: A success toast notification 'Activity Remark created successfully!' should appear
    - expect: The 'Activity Remark *' input field should be cleared/empty after successful submission
    - expect: The record 'Follow Up Pending' should appear in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create an Activity Remark with special characters

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'Price Negotiation (Discount Required)' in the 'Activity Remark *' field, and click 'Submit'
    - expect: A success toast notification 'Activity Remark created successfully!' should appear
    - expect: The record 'Price Negotiation (Discount Required)' should appear in the data table with the exact name and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create an Activity Remark with a long name

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'Customer Requested Detailed Proposal and Site Visit Before Finalization' in the 'Activity Remark *' field, and click 'Submit'
    - expect: A success toast notification 'Activity Remark created successfully!' should appear
    - expect: The record should appear in the data table with Status 'Active'

#### 2.4. TC-ADD-04: Successfully create multiple Activity Remark records sequentially

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'Meeting Scheduled', click 'Submit', then immediately type 'Demo Given', and click 'Submit' again
    - expect: First submission: success toast 'Activity Remark created successfully!' appears and field is cleared
    - expect: Second submission: success toast 'Activity Remark created successfully!' appears and field is cleared again
    - expect: Both records 'Meeting Scheduled' and 'Demo Given' appear in the data table with Status 'Active'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Activity Remark field shows inline validation error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the 'Submit' button without entering any value in the 'Activity Remark *' field
    - expect: An inline validation error message 'Please enter activity remark' should appear below the input field
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.2. TC-VAL-02: Inline validation error clears when valid input is entered after failed submission

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the validation error
    - expect: Inline validation error 'Please enter activity remark' is displayed
  2. Type 'Inquiry Only' in the 'Activity Remark *' field
    - expect: The inline validation error 'Please enter activity remark' should no longer be visible as the user starts typing
  3. Click 'Submit'
    - expect: Success toast 'Activity Remark created successfully!' should appear
    - expect: Record 'Inquiry Only' should appear in the table

#### 3.3. TC-VAL-03: Submit form with only whitespace characters shows validation error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type '   ' (spaces only) in the 'Activity Remark *' field, and click 'Submit'
    - expect: Inline validation error 'Please enter activity remark' should be displayed
    - expect: No new record should be created in the data table

#### 3.4. TC-VAL-04: Clicking Clear on invalid (empty-submitted) form removes validation error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Submit' on empty form to trigger validation error, then click the 'Clear' button
    - expect: The inline validation error 'Please enter activity remark' should no longer be visible
    - expect: The 'Activity Remark *' input field should be empty

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Active Activity Remark name shows an error toast

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'Quotation Raised' (an existing Active record visible in the table) in the 'Activity Remark *' field, and click 'Submit'
    - expect: An error toast message 'Something went wrong.' should appear
    - expect: No duplicate record should be added to the table

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Activity Remark name

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'quotation raised' (lowercase version of an existing record) in the 'Activity Remark *' field, and click 'Submit'
    - expect: If the system is case-insensitive, an error should appear and no duplicate is created
    - 
#### 4.3. TC-DUP-03: Submitting a name matching an existing Inactive record shows an error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. First change the Status filter to 'Inactive' and note the name of any Inactive record. Then change the filter back to 'Active'. In the 'Activity Remark *' field, enter the name of the Inactive record observed, and click 'Submit'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: No new record is created with the duplicate name

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Activity Remark form

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page, type 'Test Remark' in the 'Activity Remark *' field, then click the 'Clear' button
    - expect: The 'Activity Remark *' input field should be empty/cleared
    - expect: The form heading should still read 'Add Activity Remark'
    - expect: No record should have been created in the data table

#### 5.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Activity Remark state

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the 'Edit' icon on any editable table row (e.g., 'Quotation Raised')
    - expect: The form heading changes to 'Update Activity Remark'
    - expect: The 'Activity Remark *' field is pre-filled with the record's name
    - expect: A 'Status *' dropdown appears with helper text 'Select active or inactive'
    - expect: An 'Update' button replaces the 'Submit' button
  2. Click the 'Clear' button while in Update Activity Remark mode
    - expect: The form heading reverts to 'Add Activity Remark'
    - expect: The 'Activity Remark *' input field is cleared and empty
    - expect: The 'Status *' dropdown disappears
    - expect: The 'Update' button reverts back to 'Submit' button

#### 5.3. TC-CLR-03: Clear button in Update mode with validation error resets the error state

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Activity Remark *' field, click 'Update' to trigger the validation error, then click 'Clear'
    - expect: After clicking 'Clear', the inline validation error 'Please enter activity remark' should not be visible
    - expect: The form should return to 'Add Activity Remark' mode with an empty input

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens record in Update Activity Remark mode with pre-filled fields

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the 'Edit' icon (img with alt='Edit') on an editable row (e.g., the row showing 'Quotation Raised')
    - expect: The form heading changes from 'Add Activity Remark' to 'Update Activity Remark'
    - expect: The 'Activity Remark *' input field is pre-filled with 'Quotation Raised'
    - expect: A 'Status *' dropdown appears with the current status pre-selected (e.g., 'Active')
    - expect: The helper text 'Select active or inactive' appears below the Status dropdown
    - expect: The 'Submit' button is replaced by an 'Update' button
    - expect: The 'Clear' button remains visible

#### 6.2. TC-EDT-02: Successfully update an Activity Remark record with a new name

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Edit' on an editable row (e.g., 'Quotation Raised'), clear the 'Activity Remark *' field, type 'Quotation Raised - Revised', and click 'Update'
    - expect: A success toast notification 'Activity Remark updated successfully!' should appear
    - expect: The form resets to 'Add Activity Remark' mode with empty fields
    - expect: The data table should reflect the updated name 'Quotation Raised - Revised' in the corresponding row

#### 6.3. TC-EDT-03: Update with empty Activity Remark field shows validation error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Activity Remark *' input field (so it is empty), and click 'Update'
    - expect: Inline validation error 'Please enter activity remark' should appear below the input field
    - expect: No update should be submitted
    - expect: No success or error toast should appear

#### 6.4. TC-EDT-04: Update Activity Remark name to match an existing Active record shows error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Edit' on one record (e.g., 'Planning Stage'), change its name to the name of another existing active record (e.g., 'Hot'), and click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original record should remain unchanged in the table

#### 6.5. TC-EDT-05: Update Activity Remark name to match an existing Inactive record shows error

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive record (e.g., 'Not Interested'). Change the Status filter back to 'Active' and click the 'Edit' icon on any Active record (e.g., 'Planning Stage')
    - expect: The form is in 'Update Activity Remark' mode with the Active record's name pre-filled
  2. Clear the 'Activity Remark *' input and type the name of the existing Inactive record (e.g., 'Not Interested'), then click 'Update'
    - expect: An error toast 'Something went wrong.' should appear
    - expect: The original Active record should remain unchanged in the table
    - expect: No duplicate record should be created
    - expect: The form should remain in 'Update Activity Remark' mode without resetting

#### 6.6. TC-EDT-06: Update Activity Remark status from Active to Inactive

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click 'Edit' on an active record (e.g., 'Not Interested'), keep the name unchanged, change the 'Status *' dropdown from 'Active' to 'Inactive', and click 'Update'
    - expect: A success toast notification 'Activity Remark updated successfully!' should appear
    - expect: The form resets to 'Add Activity Remark' mode
    - expect: The record 'Not Interested' should no longer appear in the table when the Status filter is set to 'Active'
    - expect: The record should appear when the Status filter is changed to 'Inactive' or 'All'

#### 6.7. TC-EDT-07: Update Activity Remark status from Inactive to Active (re-activate record)

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the Status filter dropdown to 'Inactive' and click the 'Edit' icon on an Inactive record
    - expect: The 'Update Activity Remark' form opens with the record pre-filled and Status set to 'Inactive'
  2. Change the 'Status *' dropdown to 'Active' and click 'Update'
    - expect: A success toast notification 'Activity Remark updated successfully!' should appear
    - expect: The form resets to 'Add Activity Remark' mode
    - expect: The re-activated record should no longer appear when the Status filter is set to 'Inactive'
    - expect: The record should appear again when the Status filter is set to 'Active'

#### 6.8. TC-EDT-08: Built-in activity remarks (Final, Warm, Lost, etc.) behavior when edited

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and observe the built-in records such as 'Final', 'Warm', 'Lost', 'Cold', 'Hot' in the table. Click the 'Edit' icon on a built-in record (e.g., 'Lost')
    - expect: The 'Update Activity Remark' form opens with the record's data
    - expect: The helper text 'Built-in remarks (Final, Warm, Lost etc.) cannot be edited.' should be visible below the Activity Remark field
    - expect: Attempting to modify and save a built-in remark should result in an error or the edit should be restricted

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Default status filter shows Active records only

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and check the 'Status:' filter dropdown default value
    - expect: The 'Status:' filter dropdown should default to 'Active'
    - expect: The table should display only records with an 'Active' status badge
    - expect: No 'Inactive' status records should be visible in the table

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All'
    - expect: The table should display both Active and Inactive records
    - expect: Records with both 'Active' and 'Inactive' status badges should be visible

#### 7.3. TC-FLT-03: Filter table to show only Inactive records

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'Inactive'
    - expect: The table should display only records with an 'Inactive' status badge
    - expect: No 'Active' records should be visible
    - expect: If no Inactive records exist, the table should show a 'no records' message

#### 7.4. TC-FLT-04: Status filter resets when navigating away and back

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All', then navigate to another page (e.g., Dashboard), and navigate back to the Activity Remark Master page
    - expect: The Status filter should reset to the default value 'Active' upon re-navigation

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial Activity Remark name returns matching results

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and type 'Follow' in the 'Search Activity Remark' input box
    - expect: The table should filter to show only records containing 'Follow' in the Activity Remark name (e.g., 'In Follow For Final Meeting')
    - expect: Records not containing 'Follow' should be hidden

#### 8.2. TC-SRC-02: Search by complete Activity Remark name returns exact matching result

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Type 'Site Hold' (an exact name from the table) in the 'Search Activity Remark' input box
    - expect: Only the record 'Site Hold' should be displayed in the table
    - expect: All other records should be hidden

#### 8.3. TC-SRC-03: Search with a non-existent name returns no results

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Type 'XYZ123NONEXISTENT' in the 'Search Activity Remark' input box
    - expect: The table body should show a 'no records' message (e.g., 'There are no records to display')
    - expect: No data rows should be visible in the table

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Type a search term to filter the table, then clear the 'Search Activity Remark' input (either by selecting all and deleting, or using the clear/X control)
    - expect: The table should restore and display the full list of records based on the current Status filter
    - expect: Previously hidden records should reappear

#### 8.5. TC-SRC-05: Search is case-insensitive

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Type 'site hold' (all lowercase) in the 'Search Activity Remark' input box
    - expect: The record 'Site Hold' should appear in the filtered results even though the casing differs

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and inspect the 'Show:' dropdown in the table toolbar
    - expect: The 'Show:' dropdown should have '25' selected as the default value

#### 9.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '10'
    - expect: The table should display a maximum of 10 rows
    - expect: If there are more than 10 records, pagination controls (Next page, Previous page) should appear

#### 9.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Set 'Show:' to '10' to enable pagination (assuming more than 10 records exist), then click the 'Next page' button
    - expect: The table should navigate to the next page showing the next set of records
    - expect: The current page indicator (e.g., 'Page 2 is your current page') should update
  2. Click the 'Previous page' button
    - expect: The table should navigate back to the previous page
    - expect: The current page indicator should revert to page 1

#### 9.4. TC-PAG-04: Change rows-per-page to 50 and then 100

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '50'
    - expect: The table should display up to 50 records per page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table should display up to 100 records per page
    - expect: All records should be visible on a single page if the total count is 100 or fewer

#### 9.5. TC-PAG-05: Pagination is disabled when all records fit on one page

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page with the default 'Show: 25' setting and verify total record count is 25 or fewer
    - expect: The 'Previous page' button should be disabled
    - expect: The 'Next page' button should be disabled
    - expect: Only page '1' button should be shown in the pagination control

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Activity Remark column ascending

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the 'Activity Remark' column header button
    - expect: The table should sort records by Activity Remark in ascending alphabetical order (A to Z)
    - expect: The sort icon on the 'Activity Remark' column header should indicate ascending sort

#### 10.2. TC-SRT-02: Sort table by Activity Remark column descending

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Click the 'Activity Remark' column header button a second time
    - expect: The table should sort records by Activity Remark in descending alphabetical order (Z to A)
    - expect: The sort icon should indicate descending sort

#### 10.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. With Status filter set to 'All', click the 'Status' column header button
    - expect: The table should sort records by Status (Active/Inactive) in ascending or descending order
    - expect: The sort icon on the 'Status' column header should reflect the sort direction

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INACT-01: Inactive records are hidden from the Active filter view by default

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists (by editing a record and setting it to Inactive), then navigate to the Activity Remark Master page
    - expect: The Status filter defaults to 'Active'
    - expect: The Inactive record should not appear in the table under the Active filter

#### 11.2. TC-INACT-02: Inactive records are visible when filtering by Inactive or All

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists. Change the Status filter to 'Inactive'
    - expect: Only Inactive records should be displayed in the table
    - expect: Active records should be hidden
  2. Change the Status filter to 'All'
    - expect: Both Active and Inactive records should appear in the table

#### 11.3. TC-INACT-03: Edit icon is available for Inactive records

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' to reveal inactive records, then click the 'Edit' icon on an Inactive record
    - expect: The 'Update Activity Remark' form should open with the record's data pre-filled
    - expect: The 'Status *' dropdown should show 'Inactive' as the current selection

### 12. 12. Import Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-IMP-01: Import button is present and clickable

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Navigate to the Activity Remark Master page and click the 'Import' button in the table toolbar
    - expect: A file upload dialog or import modal should open
    - expect: The user should be able to select a file for import

### 13. 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Activity Remark Master is accessible via the Sales Masters sidebar menu

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Log in to ElevatorPlus and click 'Sales Masters' in the left sidebar navigation menu to expand it
    - expect: The Sales Masters submenu should expand showing multiple options
    - expect: An 'Activity Remark' link should be visible in the expanded submenu
    - expect: The link URL should be /master/activity-remark-master
  2. Click the 'Activity Remark' link in the submenu
    - expect: The browser should navigate to https://stage.elevatorplus.net/master/activity-remark-master
    - expect: The Activity Remark Master page should load with the 'Add Activity Remark' form and data table

#### 13.2. TC-NAV-02: Unauthenticated users cannot access the Activity Remark Master page

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. Without logging in (or after logging out), directly navigate to https://stage.elevatorplus.net/master/activity-remark-master
    - expect: The user should be redirected to the login page
    - expect: The Activity Remark Master page content should not be accessible without authentication

#### 13.3. TC-NAV-03: Direct URL navigation to Activity Remark Master works when authenticated

**File:** `tests/Sales-master/activity-remark-master.spec.ts`

**Steps:**
  1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/activity-remark-master via the browser address bar
    - expect: The page should load successfully without redirecting
    - expect: The 'Add Activity Remark' form and data table should be fully functional
