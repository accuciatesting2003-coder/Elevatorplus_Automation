# Ceiling Master Test Plan

## Application Overview

The Ceiling Master page is part of the ElevatorPlus Other Masters section, accessible at /master/ceiling-master (also accessible as a tab at /master/other-master). It allows admin users to manage ceiling type records used in elevator quotation cost estimation. The page is a standard master form layout with two sections: (1) an "Add Ceiling" form at the top containing four mandatory fields — "Ceiling Name *" (text input, helper: "Enter the ceiling name"), "Price *" (number input, helper: "Enter the price"), "Lift Type *" (dropdown: Passenger Lift / Goods Lift, helper: "Select the lift type"), and "Passenger/Capacity *" (multi-select tag input, helper: "Select passenger or capacity"), along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table below listing all ceilings with columns: Sr. No., Action (Edit icon), Ceiling Name, Price, Lift Type, Passengers/Capacity, Additional Info-ceiling, and Status. The table includes filtering by Status (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Update Price" button, an "Import Excel" button, and a "Search Ceiling Name" search box. Clicking the Edit icon on a row switches the form header to "Update Ceiling", pre-fills all fields, exposes a Status dropdown (Active / Inactive), disables the Lift Type dropdown (cannot be changed), and changes the action button label to "Update". Clicking "Clear" in either mode resets the form to the blank "Add Ceiling" state. Successful creation shows a toast: "Ceiling created successfully!". Submitting an empty Ceiling Name shows inline error: "Please enter ceiling name". Submitting a duplicate returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Ceiling Master page loads successfully

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/ceiling-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/ceiling-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Ceiling' card heading should be visible
    - expect: The Ceiling Name input field (label: 'Ceiling Name *') should be present and empty
    - expect: The Price input field (label: 'Price *') should be present
    - expect: The Lift Type dropdown (label: 'Lift Type *') should be present with default option 'Passenger Lift'
    - expect: The Passenger/Capacity multi-select input (label: 'Passenger/Capacity *') should be present
    - expect: The helper text 'Enter the ceiling name' should be visible below the Ceiling Name input
    - expect: The warning note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display ceiling records with columns: Sr. No., Action, Ceiling Name, Price, Lift Type, Passengers/Capacity, Additional Info-ceiling, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to the Ceiling Master page at /master/ceiling-master
    - expect: The form section heading should read 'Add Ceiling'
    - expect: An info icon button should be present next to the heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Update Price' button should be present
    - expect: An 'Import Excel' button should be present
    - expect: A 'Search Ceiling Name' search box should be present
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Ceiling Name, Price, Lift Type, Passengers/Capacity, Additional Info-ceiling, Status
    - expect: Price, Lift Type, Passengers/Capacity, Additional Info-ceiling, and Status columns should display sort icons indicating they are sortable

### 2. Add Ceiling - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new ceiling with a unique name (Passenger Lift)

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The 'Add Ceiling' form is displayed with empty fields
  2. Fill in Ceiling Name with a unique name, e.g. 'Mirror Finish Ceiling Test'
    - expect: The typed text appears in the input field
  3. Fill in Price with a numeric value, e.g. '500'
    - expect: The price value is entered
  4. Confirm Lift Type dropdown shows 'Passenger Lift' (default)
    - expect: 'Passenger Lift' is selected
  5. Type a passenger count in the Passenger/Capacity input, e.g. '8', and select it from the dropdown
    - expect: '8' tag appears in the Passenger/Capacity field
  6. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Ceiling created successfully!'
    - expect: The form fields are cleared and reset to empty
    - expect: The form heading remains 'Add Ceiling'
    - expect: The newly created ceiling appears in the data table with correct values and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a ceiling for Goods Lift

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and fill in Ceiling Name with a unique name, e.g. 'Steel Grid Ceiling Goods'
    - expect: The name is entered
  2. Fill in Price with '750' and select 'Goods Lift' from the Lift Type dropdown
    - expect: 'Goods Lift' is selected in the Lift Type dropdown
  3. Type a capacity value in the Passenger/Capacity input, e.g. '816 kg', and select it
    - expect: The capacity tag is added
  4. Click 'Submit'
    - expect: Toast 'Ceiling created successfully!' appears
    - expect: The new record appears in the table showing 'Goods Lift' in the Lift Type column

#### 2.3. TC-ADD-03: Create a ceiling with multiple passenger/capacity values

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and fill Ceiling Name with 'Multi-Capacity Ceiling Test'
    - expect: Name is entered
  2. Enter Price '300' and keep Lift Type as 'Passenger Lift'
    - expect: Values are set
  3. Add multiple tags in Passenger/Capacity, e.g. '4', '6', '8'
    - expect: Three tags ('4', '6', '8') appear in the Passenger/Capacity field
  4. Click 'Submit'
    - expect: Toast 'Ceiling created successfully!' appears
    - expect: The new record shows '4, 6, 8' in the Passengers/Capacity column

#### 2.4. TC-ADD-04: Create a ceiling with a single passenger/capacity value

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, fill Ceiling Name with a unique name e.g. 'Single Cap Ceiling Test', Price '200', Lift Type 'Passenger Lift', and add exactly one tag '6' in the Passenger/Capacity field
    - expect: Only the single tag '6' appears in the Passenger/Capacity field; no additional tags
  2. Click 'Submit'
    - expect: Toast 'Ceiling created successfully!' appears
    - expect: Form fields are cleared
    - expect: New record appears in the table with '6' in the Passengers/Capacity column and Status 'Active'

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Ceiling Name shows inline error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The 'Add Ceiling' form is visible with empty fields
  2. Leave the Ceiling Name input empty, fill Price and Passenger/Capacity, then click 'Submit'
    - expect: No API call is made to create a ceiling
    - expect: An inline validation error appears below the Ceiling Name field
    - expect: No new record is added to the data table

#### 3.2. TC-VAL-02: Submit form with empty Price shows validation error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and fill in Ceiling Name but leave Price empty
    - expect: Price field remains empty
  2. Add a Passenger/Capacity value and click 'Submit'
    - expect: A validation error appears for the Price field
    - expect: No ceiling is created

#### 3.3. TC-VAL-03: Submit form with empty Passenger/Capacity shows validation error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, fill in Ceiling Name and Price, but leave Passenger/Capacity empty
    - expect: Passenger/Capacity field has no tags
  2. Click 'Submit'
    - expect: A validation error appears for the Passenger/Capacity field
    - expect: No ceiling is created

#### 3.4. TC-VAL-04: Error clears when valid input is entered after failed validation

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click 'Submit' without filling any fields to trigger validation errors
    - expect: Validation errors are shown for required fields
  2. Fill in all required fields with valid values
    - expect: The validation error messages disappear as each field is filled
  3. Click 'Submit'
    - expect: Toast 'Ceiling created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting duplicate combination matching an existing Active record shows error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master (Status filter: Active) and note an existing combination (e.g., name 'Powder-coated MS Ceiling', Passenger Lift, capacity '8')
    - expect: The record is visible with an Active status badge
  2. Fill in the identical Ceiling Name, Lift Type, and Passenger/Capacity combination and click 'Submit'
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the table

#### 4.2. TC-DUP-02: Submitting duplicate combination matching an existing Inactive record shows error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, set Status filter to 'Inactive', and note an existing combination (e.g., name 'Old Ceiling', Passenger Lift, capacity '6')
    - expect: An Inactive record is visible in the table
  2. Set Status filter back to 'Active', then fill in the identical Ceiling Name, Lift Type, and Passenger/Capacity from the Inactive record and click 'Submit'
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No new record is created regardless of the existing record's inactive status

#### 4.3. TC-DUP-03: Adding single passenger/capacity that matches one value in an existing multi-passenger record shows error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and note an existing multi-passenger record (e.g., name 'Multi-Capacity Ceiling', Passenger Lift, capacity '4, 6, 8')
    - expect: The multi-passenger record is visible
  2. Fill in the same Ceiling Name and Lift Type, but add only the single tag '8' in the Passenger/Capacity field, and click 'Submit'
    - expect: Observe whether the system treats the partial/single-capacity combination as a duplicate and shows 'Something went wrong.', or allows creation — document the actual behavior

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Ceiling form

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and fill in all fields (Ceiling Name, Price, Lift Type, Passenger/Capacity)
    - expect: All fields contain entered values
  2. Click the 'Clear' button
    - expect: Ceiling Name input is cleared
    - expect: Price input is cleared
    - expect: Lift Type reverts to default ('Passenger Lift')
    - expect: Passenger/Capacity tags are removed
    - expect: The form heading still reads 'Add Ceiling'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Ceiling state

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click the Edit icon for any ceiling record
    - expect: The form heading changes to 'Update Ceiling'
    - expect: All fields are pre-filled with the selected record's values
    - expect: The Status dropdown appears
    - expect: The Lift Type dropdown is disabled
    - expect: The action button shows 'Update'
  2. Click the 'Clear' button while in Update Ceiling mode
    - expect: The form heading reverts to 'Add Ceiling'
    - expect: All form fields are cleared
    - expect: The Status dropdown is no longer visible
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the ceiling record in edit mode

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The data table shows at least one ceiling record
  2. Click the Edit icon (img[alt='Edit']) in the Action column of any row
    - expect: The form heading changes from 'Add Ceiling' to 'Update Ceiling'
    - expect: The Ceiling Name input is pre-filled with the selected record's name
    - expect: The Price input is pre-filled with the record's price
    - expect: The Lift Type dropdown is pre-filled but **disabled** (cannot be changed in edit mode)
    - expect: The Passenger/Capacity field shows the existing capacity tags
    - expect: A Status dropdown appears with label 'Status *' and options: 'Select Status', 'Active', 'Inactive'
    - expect: The currently set status ('Active') is pre-selected
    - expect: The action button label changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the ceiling name and price

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click Edit on any ceiling record
    - expect: Form is in Update Ceiling mode
  2. Clear the Ceiling Name and type a new unique name, e.g. 'Updated Ceiling Name Test'
    - expect: New name appears in the input
  3. Change Price to a new value, e.g. '999'
    - expect: New price is entered
  4. Click the 'Update' button
    - expect: A success toast notification appears (e.g. 'Ceiling updated successfully!')
    - expect: The form resets to 'Add Ceiling' state
    - expect: The data table refreshes showing the updated values in the edited row

#### 6.3. TC-EDT-03: Update ceiling status to Inactive

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click Edit on any Active ceiling
    - expect: Form shows 'Update Ceiling' with Status dropdown showing 'Active'
  2. Select 'Inactive' from the Status dropdown and click 'Update'
    - expect: A success toast is displayed
    - expect: When Status filter is set to 'All', the edited ceiling shows 'Inactive' badge in the Status column

#### 6.4. TC-EDT-04: Update with empty Ceiling Name shows validation error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, click Edit on any ceiling, then clear the Ceiling Name field
    - expect: Ceiling Name input is empty
  2. Click the 'Update' button
    - expect: Inline validation error appears below the Ceiling Name field
    - expect: No API update call is made
    - expect: The form remains in Update Ceiling mode

#### 6.5. TC-EDT-05: Verify Lift Type is disabled in edit mode

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click Edit on any ceiling record
    - expect: The form is in Update Ceiling mode
  2. Attempt to interact with the Lift Type dropdown
    - expect: The Lift Type dropdown is disabled and cannot be changed
    - expect: The existing Lift Type value remains displayed

#### 6.6. TC-EDT-06: Update with empty Price shows validation error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click Edit on any ceiling record
    - expect: The form is in Update Ceiling mode with Price pre-filled
  2. Clear the Price field and click 'Update'
    - expect: Inline validation error appears for the Price field
    - expect: No update is saved to the database
    - expect: The form remains in Update Ceiling mode

#### 6.7. TC-EDT-07: Update with empty Passenger/Capacity shows validation error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click Edit on any ceiling record
    - expect: The form is in Update Ceiling mode with Passenger/Capacity tags pre-filled
  2. Remove all tags from the Passenger/Capacity field and click 'Update'
    - expect: Inline validation error appears for the Passenger/Capacity field
    - expect: No update is saved
    - expect: The form remains in Update Ceiling mode

#### 6.8. TC-EDT-08: Update combination to duplicate of an existing Active record shows error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and note the Ceiling Name and Passenger/Capacity of an existing Active record (e.g., 'Powder-coated MS Ceiling', '8')
    - expect: Record is visible in the Active list
  2. Click Edit on a different Active ceiling record
    - expect: Form is in Update Ceiling mode
  3. Change the Ceiling Name to match the noted Active record and set the same Passenger/Capacity value, then click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original values are preserved in the table; no change is applied

#### 6.9. TC-EDT-09: Update combination to duplicate of an existing Inactive record shows error

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, set Status filter to 'Inactive', and note the name and Passenger/Capacity of an existing Inactive record
    - expect: At least one Inactive record is visible
  2. Set Status filter to 'Active', click Edit on an Active record, change its Ceiling Name and Passenger/Capacity to match the noted Inactive record, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The Status filter dropdown defaults to 'Active'
    - expect: The table shows only records with 'Active' status badge
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and change the Status filter to 'All'
    - expect: The table refreshes to display both Active and Inactive records
    - expect: Inactive ceilings (if any) are shown alongside Active ones

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and change the Status filter to 'Inactive'
    - expect: Only Inactive ceiling records are shown, OR an empty state message is shown if none exist

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial ceiling name returns matching results

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The full list of Active ceilings is displayed
  2. Type a partial name (e.g. 'Mirror') in the 'Search Ceiling Name' input
    - expect: The table filters to show only ceilings whose names contain 'Mirror' (case-insensitive)
    - expect: Non-matching rows are hidden

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and type 'XYZNONEXISTENTCEILING999' in the search box
    - expect: The table shows no rows or an empty state message

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, type a partial name to filter the table
    - expect: Table is filtered
  2. Clear the search input completely
    - expect: The table restores to show all Active ceiling records

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master (default shows 25 rows per page)
    - expect: The Show dropdown displays '25' and up to 25 rows are shown
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 9.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, set Show to '10', and verify multiple pages exist
    - expect: Pagination controls with Previous, page numbers, and Next buttons are visible
  2. Click the 'Next page' button
    - expect: The table advances to page 2
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Price column

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click the 'Price' column header
    - expect: The table re-sorts by price in ascending order
    - expect: The sort icon on the Price column indicates ascending sort
  2. Click the 'Price' column header again
    - expect: The sort order reverses to descending
    - expect: The sort icon updates to indicate descending sort

#### 10.2. TC-SRT-02: Sort table by Lift Type column

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click the 'Lift Type' column header
    - expect: The table re-sorts by Lift Type (grouping Passenger Lift and Goods Lift records)
    - expect: The sort icon updates

#### 10.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, set Status filter to 'All', then click the 'Status' column header
    - expect: Records are grouped by status (Active / Inactive)
    - expect: The sort icon on Status column updates

### 11. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-UPP-01: Update Price modal opens with correct title

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master
    - expect: The 'Update Price' button is visible in the table toolbar
  2. Click the 'Update Price' button
    - expect: A modal/panel opens
    - expect: The modal title is visible and correctly reads (e.g. 'Update Price' or 'Bulk Price Update')
    - expect: The modal contains a list of ceiling records with editable price fields

#### 11.2. TC-UPP-02: Update price for a record and verify updated price in data table

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click 'Update Price'
    - expect: The Update Price modal opens with ceiling records listed
  2. Locate a ceiling record in the modal and change its price to a new value (e.g. '1200')
    - expect: The new price value is entered in the price field
  3. Submit / save the price update (click the save/update button in the modal)
    - expect: Success feedback appears (toast or inline confirmation)
    - expect: The modal closes or the list refreshes
  4. Verify in the main data table
    - expect: The updated ceiling record now shows the new price '1200' in the Price column

#### 11.3. TC-UPP-03: Search functionality in Update Price modal filters records

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click 'Update Price'
    - expect: Update Price modal opens with a search input
  2. Type a partial ceiling name in the search field within the modal
    - expect: The list of records in the modal filters to show only matching ceiling records
  3. Clear the search input
    - expect: The full list of records is restored in the modal

#### 11.4. TC-UPP-04: Cancel button in Update Price modal closes without saving

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the 'Cancel' button
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

#### 11.5. TC-UPP-05: Cross (×) button in Update Price modal closes without saving

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the close icon (×) at the top-right of the modal
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active ceiling as Inactive and verify filter behavior

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master (Status filter: Active). Note the name of a ceiling (e.g. 'Test Ceiling Active')
    - expect: The ceiling is visible in the Active list
  2. Click Edit on that ceiling, change Status to 'Inactive', and click 'Update'
    - expect: A success toast is displayed
  3. Verify with Status filter 'Active'
    - expect: The ceiling no longer appears in the Active-filtered table
  4. Change Status filter to 'Inactive'
    - expect: The ceiling now appears with an 'Inactive' badge

#### 12.2. TC-INA-02: Re-activate an Inactive ceiling

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Navigate to /master/ceiling-master, set Status filter to 'Inactive', click Edit on an Inactive ceiling, change Status to 'Active', and click 'Update'
    - expect: A success toast is displayed
  2. Change the Status filter back to 'Active'
    - expect: The previously Inactive ceiling now appears in the Active list

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Ceiling Master page via direct URL without authentication redirects to login

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/master/ceiling-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Ceiling Master page content is not shown

#### 13.2. TC-NAV-02: Access Ceiling Master via Other Masters menu navigation

**File:** `tests/Other-master/ceiling-master.spec.ts`

**Steps:**
  1. Log in and click 'Other Masters' in the left sidebar navigation
    - expect: The Other Masters page at /master/other-master is loaded with sub-tabs visible
  2. Confirm the 'Ceiling Master' tab is active (default) and shows the Ceiling form
    - expect: The page heading 'Add Ceiling' is visible
    - expect: The data table with existing ceiling records is displayed
