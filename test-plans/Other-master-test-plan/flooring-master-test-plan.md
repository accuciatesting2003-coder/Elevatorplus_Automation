# Flooring Master Test Plan

## Application Overview

The Flooring Master page is part of the ElevatorPlus Other Masters section, accessible at /master/flooring-master (also accessible as a tab at /master/other-master). It allows admin users to manage flooring type records used in elevator quotation cost estimation. The page contains: (1) an "Add Flooring" form with four mandatory fields — "Flooring Name *" (text input, helper: "Enter the flooring name"), "Price *" (number input, helper: "Enter the price"), "Lift Type *" (dropdown: Passenger Lift / Goods Lift, helper: "Select the lift type"), and "select Passenger *" (multi-select tag input, helper: "Select passenger or capacity"), along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table with columns: Sr. No., Action (Edit icon), Flooring Name, Price, Lift Type, Passengers/Capacity, Additional Info-sahilflooring, Additional Info-sahilnewflooring, Additional Info-flooring Img 1, and Status. The table includes filtering by Status (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Update Price" button, an "Import Excel" button, and a "Search Passengers" search box. Clicking the Edit icon switches the form to "Update Flooring" mode, pre-fills all fields, and exposes a Status dropdown (Active / Inactive). Successful creation shows a toast: "Flooring created successfully!". Submitting an empty Flooring Name shows inline error. Submitting a duplicate combination returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Flooring Master page loads successfully

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/flooring-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/flooring-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Flooring' card heading should be visible
    - expect: Flooring Name *, Price *, Lift Type *, and select Passenger * fields should be present and empty
    - expect: The helper text 'Enter the flooring name' should be visible
    - expect: The warning note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: 'Clear' and 'Submit' buttons should be visible
    - expect: The data table should load with columns: Sr. No., Action, Flooring Name, Price, Lift Type, Passengers/Capacity, Additional Info-sahilflooring, Additional Info-sahilnewflooring, Additional Info-flooring Img 1, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master
    - expect: The form section heading reads 'Add Flooring'
  2. Inspect the data table toolbar
    - expect: Show dropdown (10, 25, 50, 100 — default 25) is present
    - expect: Status filter (All, Active, Inactive — default Active) is present
    - expect: 'Update Price' button is present
    - expect: 'Import Excel' button is present
    - expect: A search box with placeholder 'Search Passengers' is present
  3. Inspect the table headers
    - expect: Columns are: Sr. No., Action, Flooring Name, Price, Lift Type, Passengers/Capacity, Additional Info-sahilflooring, Additional Info-sahilnewflooring, Additional Info-flooring Img 1, Status
    - expect: Price, Lift Type, Passengers/Capacity, Additional Info columns, and Status are sortable

### 2. Add Flooring - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new flooring for Passenger Lift

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and fill in Flooring Name with 'Vinyl Tile Flooring Test'
    - expect: Name is entered
  2. Enter Price as '400' and keep Lift Type as 'Passenger Lift'
    - expect: Price and Lift Type are set
  3. Add passenger capacity tag '8' in the select Passenger field
    - expect: Tag '8' appears in the field
  4. Click 'Submit'
    - expect: Toast 'Flooring created successfully!' appears
    - expect: Form resets; new record appears in table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a flooring for Goods Lift

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, fill Flooring Name with 'Industrial Rubber Flooring', Price '1200', Lift Type 'Goods Lift', and capacity '816 kg'
    - expect: All fields are populated
  2. Click 'Submit'
    - expect: Toast 'Flooring created successfully!' appears
    - expect: New record appears in table with 'Goods Lift' in the Lift Type column

#### 2.3. TC-ADD-03: Create a flooring with multiple passenger/capacity values

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, fill Flooring Name 'Multi-Cap Flooring Test', Price '250', Lift Type 'Passenger Lift', and add tags '4', '6', '8' to select Passenger
    - expect: Three tags appear in the select Passenger field
  2. Click 'Submit'
    - expect: Toast 'Flooring created successfully!' appears
    - expect: New record shows '4, 6, 8' in the Passengers/Capacity column

#### 2.4. TC-ADD-04: Create a flooring with a single passenger/capacity value

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, fill Flooring Name with a unique name e.g. 'Single Cap Flooring Test', Price '350', Lift Type 'Passenger Lift', and add exactly one tag '6' in the select Passenger field
    - expect: Only the single tag '6' appears in the select Passenger field; no additional tags
  2. Click 'Submit'
    - expect: Toast 'Flooring created successfully!' appears
    - expect: Form fields are cleared
    - expect: New record appears in the table with '6' in the Passengers/Capacity column and Status 'Active'

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty Flooring Name shows inline error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, leave Flooring Name empty, fill Price and Passenger, and click 'Submit'
    - expect: Inline validation error appears below Flooring Name
    - expect: No flooring is created

#### 3.2. TC-VAL-02: Submit with empty Price shows validation error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, fill Flooring Name but leave Price empty, add Passenger, and click 'Submit'
    - expect: Validation error appears for Price
    - expect: No flooring is created

#### 3.3. TC-VAL-03: Submit with empty Passenger/Capacity shows validation error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, fill Flooring Name and Price but leave Passenger empty, and click 'Submit'
    - expect: Validation error appears for the Passenger/Capacity field
    - expect: No flooring is created

#### 3.4. TC-VAL-04: Validation errors clear when valid input is entered

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Submit' without filling any fields
    - expect: Validation errors are shown for required fields
  2. Fill in all required fields with valid values
    - expect: Validation errors disappear as fields are filled
  3. Click 'Submit'
    - expect: Toast 'Flooring created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting duplicate combination matching an existing Active record shows error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master (Status filter: Active) and note an existing combination (e.g., 'Vinyl Flooring', Passenger Lift, '8')
    - expect: The record is visible with an Active status badge
  2. Enter the identical Flooring Name, Lift Type, and Passenger/Capacity and click 'Submit'
    - expect: Toast 'Something went wrong.' appears
    - expect: No duplicate record is added to the table

#### 4.2. TC-DUP-02: Submitting duplicate combination matching an existing Inactive record shows error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, set Status filter to 'Inactive', and note an existing combination (e.g., 'Old Flooring', Passenger Lift, '6')
    - expect: An Inactive record is visible in the table
  2. Set Status filter back to 'Active', then fill in the identical Flooring Name, Lift Type, and Passenger/Capacity from the Inactive record and click 'Submit'
    - expect: Toast 'Something went wrong.' appears
    - expect: No new record is created regardless of the conflicting record's inactive status

#### 4.3. TC-DUP-03: Adding single passenger/capacity that matches one value in an existing multi-passenger record shows error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and note an existing multi-passenger record (e.g., 'Multi-Cap Flooring', Passenger Lift, '4, 6, 8')
    - expect: The multi-passenger record is visible
  2. Fill in the same Flooring Name and Lift Type, but add only the single tag '8' in the select Passenger field, and click 'Submit'
    - expect: Observe whether the system treats the single-capacity subset as a duplicate and shows 'Something went wrong.', or allows creation — document the actual behavior

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Flooring form

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and fill in all fields
    - expect: All fields contain entered values
  2. Click 'Clear'
    - expect: All fields are cleared/reset to defaults
    - expect: Form heading remains 'Add Flooring'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Flooring state

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click Edit on any record
    - expect: Form is in 'Update Flooring' mode with pre-filled fields and Status dropdown visible
  2. Click 'Clear'
    - expect: Form resets to 'Add Flooring' mode with empty fields
    - expect: Status dropdown is no longer visible
    - expect: Action button reverts to 'Submit'

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the flooring record in edit mode

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click the Edit icon on any row
    - expect: Form heading changes to 'Update Flooring'
    - expect: All fields are pre-filled (Flooring Name, Price, Lift Type, Passenger/Capacity)
    - expect: A Status dropdown (Active / Inactive) appears
    - expect: Action button changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the flooring name and price

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click Edit on any record
    - expect: Form is in Update Flooring mode
  2. Change the Flooring Name to 'Updated Flooring Test' and Price to '1500'
    - expect: New values are entered
  3. Click 'Update'
    - expect: Toast 'Flooring updated successfully!' appears
    - expect: Data table refreshes showing updated values

#### 6.3. TC-EDT-03: Update flooring status to Inactive

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, click Edit on any Active flooring, change Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
    - expect: When filtering by 'All', the record shows 'Inactive' badge

#### 6.4. TC-EDT-04: Update with empty Flooring Name shows validation error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, click Edit on any record, clear the Flooring Name, and click 'Update'
    - expect: Inline validation error appears
    - expect: No update is saved

#### 6.5. TC-EDT-05: Update with empty Price shows validation error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click Edit on any flooring record
    - expect: The form is in Update Flooring mode with Price pre-filled
  2. Clear the Price field and click 'Update'
    - expect: Inline validation error appears for the Price field
    - expect: No update is saved to the database
    - expect: The form remains in Update Flooring mode

#### 6.6. TC-EDT-06: Update with empty Passenger/Capacity shows validation error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click Edit on any flooring record
    - expect: The form is in Update Flooring mode with Passenger/Capacity tags pre-filled
  2. Remove all tags from the select Passenger field and click 'Update'
    - expect: Inline validation error appears for the Passenger/Capacity field
    - expect: No update is saved
    - expect: The form remains in Update Flooring mode

#### 6.7. TC-EDT-07: Update combination to duplicate of an existing Active record shows error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and note the Flooring Name and Passenger/Capacity of an existing Active record (e.g., 'Vinyl Flooring', '8')
    - expect: Record is visible in the Active list
  2. Click Edit on a different Active flooring record
    - expect: Form is in Update Flooring mode
  3. Change the Flooring Name to match the noted Active record and set the same Passenger/Capacity value and Lift Type, then click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original values are preserved in the table; no change is applied

#### 6.8. TC-EDT-08: Update combination to duplicate of an existing Inactive record shows error

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, set Status filter to 'Inactive', and note the name, Lift Type, and Passenger/Capacity of an existing Inactive record
    - expect: At least one Inactive record is visible
  2. Set Status filter to 'Active', click Edit on an Active record, change its Flooring Name, Lift Type, and Passenger/Capacity to match the noted Inactive record, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master
    - expect: Status filter defaults to 'Active' and table shows only Active records

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and change Status filter to 'All'
    - expect: Both Active and Inactive records are shown

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and change Status filter to 'Inactive'
    - expect: Only Inactive records appear, or empty state if none exist

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial flooring name returns matching results

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and type 'Vinyl' in the search box
    - expect: Table filters to show only records matching 'Vinyl'

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and type 'XYZNONEXISTENTFLOORING999' in the search box
    - expect: Table shows no rows or an empty state message

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, search for a partial name, then clear the search input
    - expect: The full Active list is restored

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and change Show to '10'
    - expect: Up to 10 rows are displayed; pagination appears if more than 10 records exist

#### 9.2. TC-PAG-02: Navigate between pages

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master, set Show to '10', and verify multiple pages exist
    - expect: Pagination buttons (Previous, page numbers, Next) are visible
  2. Click 'Next page', then 'Previous page'
    - expect: Navigation works correctly between pages

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Price column

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Price' column header twice
    - expect: Table sorts ascending then descending by price

#### 10.2. TC-SRT-02: Sort table by Lift Type column

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Lift Type' column header
    - expect: Records are grouped by Lift Type

### 11. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-UPP-01: Update Price modal opens with correct title

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master
    - expect: 'Update Price' button is visible in toolbar
  2. Click 'Update Price'
    - expect: A modal/panel opens
    - expect: The modal title is visible and correctly reads (e.g. 'Update Price' or 'Bulk Price Update')
    - expect: The modal contains a list of flooring records with editable price fields

#### 11.2. TC-UPP-02: Update price for a record and verify updated price in data table

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Update Price'
    - expect: The Update Price modal opens with flooring records listed
  2. Locate a flooring record in the modal and change its price to a new value (e.g. '900')
    - expect: The new price value is entered in the price field
  3. Submit / save the price update (click the save/update button in the modal)
    - expect: Success feedback appears (toast or inline confirmation)
    - expect: The modal closes or the list refreshes
  4. Verify in the main data table
    - expect: The updated flooring record now shows the new price '900' in the Price column

#### 11.3. TC-UPP-03: Search functionality in Update Price modal filters records

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Update Price'
    - expect: Update Price modal opens with a search input
  2. Type a partial flooring name in the search field within the modal
    - expect: The list of records in the modal filters to show only matching flooring records
  3. Clear the search input
    - expect: The full list of records is restored in the modal

#### 11.4. TC-UPP-04: Cancel button in Update Price modal closes without saving

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the 'Cancel' button
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

#### 11.5. TC-UPP-05: Cross (×) button in Update Price modal closes without saving

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Navigate to /master/flooring-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the close icon (×) at the top-right of the modal
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active flooring as Inactive and verify filter behavior

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Edit an Active flooring, set Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
  2. Verify Status filter 'Active' no longer shows the record
    - expect: Record is absent from Active list
  3. Switch filter to 'Inactive'
    - expect: Record now appears with 'Inactive' badge

#### 12.2. TC-INA-02: Re-activate an Inactive flooring

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Edit an Inactive flooring, set Status to 'Active', and click 'Update'
    - expect: Success toast; record reappears in Active filter

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Flooring Master via direct URL without authentication redirects to login

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to https://stage.elevatorplus.net/master/flooring-master
    - expect: User is redirected to login page

#### 13.2. TC-NAV-02: Access Flooring Master via Other Masters tab navigation

**File:** `tests/Other-master/flooring-master.spec.ts`

**Steps:**
  1. Log in, click 'Other Masters' in sidebar, then click the 'Flooring Master' tab
    - expect: Flooring Master form with 'Add Flooring' heading is displayed
    - expect: Data table loads with flooring records
