# Shaft Master Test Plan

## Application Overview

The Shaft Master page is part of the ElevatorPlus Other Masters section, accessible at /master/shaft-master (also accessible as a tab at /master/other-master). It allows admin users to manage shaft type records used in elevator quotation cost estimation. The page has two sections: (1) an "Add Shaft" form with two mandatory fields — "Shaft Type Name *" (text input, helper: "Enter the shaft type name") and "Price *" (number input, helper: "Enter the price"), along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table below listing all shaft types with columns: Sr. No., Action (Edit icon), Shaft Type Name, Price, and Status. The table toolbar includes a Status filter (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Update Price" button, an "Import" button, and a labeled search "Search: [Search Shaft Type Name]". Clicking the Edit icon switches the form to "Update Shaft" mode, pre-fills the fields, exposes a Status dropdown (Active / Inactive), and changes the button to "Update". Successful creation shows a toast: "Shaft created successfully!". Submitting an empty Shaft Type Name shows inline error. Submitting a duplicate returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Shaft Master page loads successfully

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/shaft-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/shaft-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Shaft' card heading should be visible
    - expect: The Shaft Type Name input (label: 'Shaft Type Name *') should be present and empty
    - expect: The Price input (label: 'Price *') should be present
    - expect: Helper text 'Enter the shaft type name' should be visible below Shaft Type Name
    - expect: Helper text 'Enter the price' should be visible below Price
    - expect: The warning note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: 'Clear' and 'Submit' buttons should be visible
    - expect: The data table should load with columns: Sr. No., Action, Shaft Type Name, Price, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master
    - expect: Form heading reads 'Add Shaft'
  2. Inspect the data table toolbar
    - expect: Show dropdown (10, 25, 50, 100 — default 25) is present
    - expect: Status filter (All, Active, Inactive — default Active) is present
    - expect: An 'Update Price' button is present
    - expect: An 'Import' button is present
    - expect: A 'Search:' label with 'Search Shaft Type Name' input is present
  3. Inspect the table headers
    - expect: Columns are: Sr. No., Action, Shaft Type Name, Price, Status
    - expect: Shaft Type Name, Price, and Status have sort icons

### 2. Add Shaft - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new shaft type with a unique name and price

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master
    - expect: 'Add Shaft' form is visible with empty fields
  2. Type a unique shaft type name, e.g. 'Brick Wall Shaft Test'
    - expect: Text appears in Shaft Type Name input
  3. Enter Price as '2500'
    - expect: Price is entered
  4. Click 'Submit'
    - expect: Toast 'Shaft created successfully!' appears
    - expect: Both fields are cleared
    - expect: Form heading remains 'Add Shaft'
    - expect: New record appears in table with correct values and Status 'Active'

#### 2.2. TC-ADD-02: Create a shaft type with a price of zero

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, fill Shaft Type Name with 'Zero Price Shaft Test', enter Price as '0'
    - expect: Fields are populated
  2. Click 'Submit'
    - expect: Toast 'Shaft created successfully!' appears
    - expect: Record appears in table showing price '0'

#### 2.3. TC-ADD-03: Create a shaft type with a large price value

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and fill Shaft Type Name with 'Premium Shaft Test', enter a large Price (e.g. '500000')
    - expect: Fields are populated
  2. Click 'Submit'
    - expect: Toast 'Shaft created successfully!' appears
    - expect: Record appears in table with correctly formatted price

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty Shaft Type Name shows inline error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, leave Shaft Type Name empty, enter Price '100', and click 'Submit'
    - expect: Inline validation error appears below Shaft Type Name
    - expect: No record is added to the table

#### 3.2. TC-VAL-02: Submit with empty Price shows validation error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, fill Shaft Type Name but leave Price empty, and click 'Submit'
    - expect: Validation error appears for Price field
    - expect: No record is created

#### 3.3. TC-VAL-03: Validation errors clear when valid input is entered

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Submit' without filling any fields
    - expect: Validation errors are shown for both required fields
  2. Fill in both fields with valid values
    - expect: Validation errors disappear
  3. Click 'Submit'
    - expect: Toast 'Shaft created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing shaft type name shows an error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and note an existing shaft type name (e.g. 'Glass Shaft')
    - expect: At least one record is visible
  2. Type 'Glass Shaft' in Shaft Type Name, enter any Price, and click 'Submit'
    - expect: Toast error 'Something went wrong.' appears
    - expect: No duplicate is added to the table

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate shaft type name

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Note an existing name (e.g. 'Glass Shaft') and type it with different casing (e.g. 'glass shaft')
    - expect: Observe whether the system treats this as a duplicate

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Shaft form

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, fill Shaft Type Name and Price
    - expect: Both fields contain values
  2. Click 'Clear'
    - expect: Shaft Type Name and Price inputs are cleared
    - expect: Form heading remains 'Add Shaft'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Shaft state

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click Edit on any record
    - expect: Form shows 'Update Shaft' with Shaft Type Name and Price pre-filled; Status dropdown visible
  2. Click 'Clear'
    - expect: Form reverts to 'Add Shaft' mode with empty fields
    - expect: Status dropdown is no longer visible
    - expect: Action button reverts to 'Submit'

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the shaft record in edit mode

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click the Edit icon on any row
    - expect: Form heading changes to 'Update Shaft'
    - expect: Shaft Type Name and Price inputs are pre-filled
    - expect: Status dropdown (Active / Inactive) appears with current status selected
    - expect: Action button changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the shaft type name and price

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, click Edit, update Shaft Type Name to 'Updated Shaft Name' and Price to '3000'
    - expect: New values are in the inputs
  2. Click 'Update'
    - expect: Toast 'Shaft updated successfully!' appears
    - expect: Form resets to 'Add Shaft'; table shows updated values

#### 6.3. TC-EDT-03: Update shaft status to Inactive

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Click Edit on any Active shaft, set Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
    - expect: When Status filter set to 'All', the record shows 'Inactive' badge

#### 6.4. TC-EDT-04: Update with empty Shaft Type Name shows validation error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Click Edit, clear Shaft Type Name, and click 'Update'
    - expect: Inline validation error appears
    - expect: No update is saved

#### 6.5. TC-EDT-05: Update shaft name to a duplicate of an existing Active shaft shows error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master (Status filter: Active) and note an existing Active shaft type name (e.g. 'Glass Shaft')
    - expect: The record is visible with an Active status badge
  2. Click Edit on a different shaft, change its name to 'Glass Shaft', and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original name is preserved in the table

#### 6.6. TC-EDT-06: Update shaft name to a duplicate of an existing Inactive shaft shows error

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master, set Status filter to 'Inactive', and note an existing Inactive shaft type name
    - expect: An Inactive record is visible
  2. Set Status filter back to 'Active', click Edit on an Active shaft, change its name to the noted Inactive shaft's name, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master
    - expect: Status filter defaults to 'Active'; table shows only Active records

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
    - expect: Both Active and Inactive records are displayed

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
    - expect: Only Inactive records shown, or empty state if none exist

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial shaft type name returns matching results

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and type 'Shaft' in the search input
    - expect: Table filters to show only records containing 'Shaft'

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Type 'XYZNONEXISTENTSHAFT999' in the search input
    - expect: Table shows no rows or an empty state message

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Type a search term, then clear the search input
    - expect: The full Active list is restored

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and change Show to '10'
    - expect: Up to 10 rows are displayed

#### 9.2. TC-PAG-02: Navigate between pages

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. If multiple pages exist, click 'Next page' then 'Previous page'
    - expect: Navigation between pages works correctly

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Shaft Type Name column

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Shaft Type Name' column header
    - expect: Table re-sorts alphabetically A→Z
  2. Click 'Shaft Type Name' header again
    - expect: Sort reverses to Z→A

#### 10.2. TC-SRT-02: Sort table by Price column

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Price' column header
    - expect: Table re-sorts by price in ascending order
  2. Click 'Price' header again
    - expect: Sort reverses to descending

#### 10.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click 'Status' column header
    - expect: Records are grouped by status

### 11. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-UPP-01: Update Price modal opens with correct title

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master
    - expect: 'Update Price' button is visible in toolbar
  2. Click 'Update Price'
    - expect: A modal/panel opens
    - expect: The modal title is visible and correctly reads (e.g. 'Update Price' or 'Bulk Price Update')
    - expect: The modal contains a list of shaft records with editable price fields

#### 11.2. TC-UPP-02: Update price for a record and verify updated price in data table

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Update Price'
    - expect: The Update Price modal opens with shaft records listed
  2. Locate a shaft record in the modal and change its price to a new value (e.g. '3500')
    - expect: The new price value is entered in the price field
  3. Submit / save the price update (click the save/update button in the modal)
    - expect: Success feedback appears (toast or inline confirmation)
    - expect: The modal closes or the list refreshes
  4. Verify in the main data table
    - expect: The updated shaft record now shows the new price '3500' in the Price column

#### 11.3. TC-UPP-03: Search functionality in Update Price modal filters records

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Update Price'
    - expect: Update Price modal opens with a search input
  2. Type a partial shaft type name in the search field within the modal
    - expect: The list of records in the modal filters to show only matching shaft records
  3. Clear the search input
    - expect: The full list of records is restored in the modal

#### 11.4. TC-UPP-04: Cancel button in Update Price modal closes without saving

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the 'Cancel' button
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

#### 11.5. TC-UPP-05: Cross (×) button in Update Price modal closes without saving

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Navigate to /master/shaft-master and click 'Update Price'
    - expect: Update Price modal opens
  2. Change a price value in the modal, then click the close icon (×) at the top-right of the modal
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active shaft as Inactive and verify filter behavior

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Edit an Active shaft, set Status to 'Inactive', click 'Update'
    - expect: Success toast appears
  2. With Status filter 'Active', verify the shaft is gone
    - expect: Shaft absent from Active list
  3. Switch to 'Inactive' filter
    - expect: Shaft appears with 'Inactive' badge

#### 12.2. TC-INA-02: Re-activate an Inactive shaft

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Edit an Inactive shaft, set Status to 'Active', click 'Update'
    - expect: Shaft reappears in Active list

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Shaft Master via direct URL without authentication redirects to login

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to https://stage.elevatorplus.net/master/shaft-master
    - expect: User is redirected to login page

#### 13.2. TC-NAV-02: Access Shaft Master via Other Masters tab navigation

**File:** `tests/Other-master/shaft-master.spec.ts`

**Steps:**
  1. Log in, click 'Other Masters' in sidebar, then click the 'Shaft Master' tab
    - expect: Shaft Master form with 'Add Shaft' heading is displayed
    - expect: Data table loads with shaft records
