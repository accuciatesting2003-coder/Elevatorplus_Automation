# Controller Master Test Plan

## Application Overview

The Controller Master page is part of the ElevatorPlus Other Masters section, accessible at /master/controller-master (also accessible as a tab at /master/other-master). It allows admin users to manage controller type records used in elevator quotation cost estimation. The page has two sections: (1) an "Add Controller" form with one mandatory field — "Controller Name *" (text input, helper: "Enter the controller name"), along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table below listing all controllers with columns: Sr. No., Action (Edit icon), Controller Name, and Status. The table toolbar includes a Status filter (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Import" button, and a labeled search field "Search: [Search controller name]". Clicking the Edit icon switches the form to "Update Controller" mode, pre-fills Controller Name, exposes a Status dropdown (Active / Inactive), and changes the button to "Update". Successful creation shows a toast: "Controller created successfully!". Submitting an empty Controller Name shows inline error. Submitting a duplicate returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Controller Master page loads successfully

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/controller-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/controller-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Controller' card heading should be visible
    - expect: The Controller Name input (label: 'Controller Name *') should be present and empty
    - expect: Helper text 'Enter the controller name' should be visible
    - expect: The warning note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: 'Clear' and 'Submit' buttons should be visible
    - expect: The data table should load with columns: Sr. No., Action, Controller Name, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master
    - expect: The form heading reads 'Add Controller'
  2. Inspect the data table toolbar
    - expect: Show dropdown (10, 25, 50, 100 — default 25) is present
    - expect: Status filter (All, Active, Inactive — default Active) is present
    - expect: An 'Import' button is present
    - expect: A 'Search:' label with 'Search controller name' input is present
  3. Inspect the table headers
    - expect: Columns are: Sr. No., Action, Controller Name, Status
    - expect: Controller Name and Status columns have sort icons

### 2. Add Controller - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new controller with a unique name

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master
    - expect: 'Add Controller' form is visible with an empty Controller Name input
  2. Click the Controller Name input and type a unique name, e.g. 'Full Collective Test Controller'
    - expect: The text appears in the input field
  3. Click 'Submit'
    - expect: A toast 'Controller created successfully!' appears
    - expect: The Controller Name input is cleared
    - expect: The form heading remains 'Add Controller'
    - expect: The new controller appears in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Create a controller with special characters in the name

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and type a name with special characters, e.g. 'Relay #5 - Series Controller'
    - expect: Input accepts special characters
  2. Click 'Submit'
    - expect: Toast 'Controller created successfully!' appears
    - expect: New record appears in table with exact name including special characters

#### 2.3. TC-ADD-03: Create a controller with a long name

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and type a name of approximately 100 characters
    - expect: Input accepts the long text
  2. Click 'Submit'
    - expect: Either success toast appears, or an appropriate error if a character limit is enforced

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty Controller Name shows inline error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master, leave the Controller Name empty, and click 'Submit'
    - expect: Inline validation error appears below the Controller Name field
    - expect: No record is added to the table

#### 3.2. TC-VAL-02: Submit with only whitespace shows validation error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master, type only spaces in Controller Name, and click 'Submit'
    - expect: Either validation error 'Please enter controller name' appears, or server returns error
    - expect: No controller with blank name is created

#### 3.3. TC-VAL-03: Validation error clears when valid input is entered

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and click 'Submit' without entering a name
    - expect: Validation error is shown
  2. Type a valid name in the Controller Name field
    - expect: The validation error disappears
  3. Click 'Submit'
    - expect: Toast 'Controller created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing controller name shows an error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and note an existing controller name (e.g. 'Full Collective')
    - expect: At least one record is visible in the table
  2. Type the same controller name 'Full Collective' in the Controller Name input and click 'Submit'
    - expect: Toast error 'Something went wrong.' appears
    - expect: No duplicate record is added to the table

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate controller name

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and note an existing name (e.g. 'Full Collective')
    - expect: Record exists in the table
  2. Type the same name with different casing (e.g. 'FULL COLLECTIVE') and click 'Submit'
    - expect: Observe whether the system treats this as a duplicate

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Controller form

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and type a name, e.g. 'Temporary Controller Name'
    - expect: Text is visible in the input
  2. Click 'Clear'
    - expect: Controller Name input is cleared
    - expect: Form heading remains 'Add Controller'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Controller state

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and click Edit on any record
    - expect: Form shows 'Update Controller' with Controller Name pre-filled
    - expect: Status dropdown appears; action button shows 'Update'
  2. Click 'Clear'
    - expect: Form reverts to 'Add Controller' mode
    - expect: Controller Name input is empty
    - expect: Status dropdown is no longer visible
    - expect: Action button reverts to 'Submit'
    - expect: No data is changed

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the controller record in edit mode

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and click the Edit icon on any row
    - expect: Form heading changes to 'Update Controller'
    - expect: Controller Name input is pre-filled with the selected record's name
    - expect: Status dropdown (options: Select Status, Active, Inactive) appears
    - expect: Active status is pre-selected
    - expect: Action button changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the controller name

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master, click Edit, clear Controller Name, and type 'Updated Controller Name'
    - expect: New name is in the input
  2. Click 'Update'
    - expect: Toast 'Controller updated successfully!' appears
    - expect: Form resets to 'Add Controller'; table shows updated name

#### 6.3. TC-EDT-03: Update controller status to Inactive

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Click Edit on any Active controller, set Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
    - expect: When Status filter set to 'All', the record shows 'Inactive' badge

#### 6.4. TC-EDT-04: Update with empty Controller Name shows validation error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master, click Edit, clear Controller Name, and click 'Update'
    - expect: Inline validation error appears
    - expect: No update is saved; form remains in Update mode

#### 6.5. TC-EDT-05: Update controller name to a duplicate of an existing Active controller shows error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master (Status filter: Active) and note an existing Active controller name (e.g. 'Full Collective')
    - expect: The record is visible with an Active status badge
  2. Click Edit on a different controller, change its name to 'Full Collective', and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original name is preserved in the table

#### 6.6. TC-EDT-06: Update controller name to a duplicate of an existing Inactive controller shows error

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master, set Status filter to 'Inactive', and note an existing Inactive controller name (e.g. 'Old Controller')
    - expect: An Inactive record is visible
  2. Set Status filter back to 'Active', click Edit on an Active controller, change its name to the noted Inactive controller's name, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master
    - expect: Status filter defaults to 'Active'; table shows only Active records

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
    - expect: Both Active and Inactive records are displayed

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
    - expect: Only Inactive records shown, or empty state if none exist

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial controller name returns matching results

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and type 'Collective' in the search input
    - expect: Table filters to show only controllers containing 'Collective'

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Type 'XYZNONEXISTENTCONTROLLER999' in the search input
    - expect: Table shows no rows or an empty state message

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Type a search term, then clear the search input
    - expect: The full Active list is restored

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and change Show to '10'
    - expect: Up to 10 rows are displayed; pagination appears if more than 10 records exist

#### 9.2. TC-PAG-02: Navigate between pages

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Set Show to '10', and if multiple pages exist, click 'Next page' then 'Previous page'
    - expect: Navigation between pages works correctly

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Controller Name column

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Navigate to /master/controller-master and click 'Controller Name' column header
    - expect: Table re-sorts alphabetically A→Z
  2. Click 'Controller Name' header again
    - expect: Sort reverses to Z→A

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click 'Status' column header
    - expect: Records are grouped by status

### 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Mark an Active controller as Inactive and verify filter behavior

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Edit an Active controller, set Status to 'Inactive', click 'Update'
    - expect: Success toast appears
  2. With Status filter 'Active', verify the controller is no longer listed
    - expect: Controller is absent
  3. Switch to Status filter 'Inactive'
    - expect: Controller now appears with 'Inactive' badge

#### 11.2. TC-INA-02: Re-activate an Inactive controller

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Edit an Inactive controller, set Status to 'Active', click 'Update'
    - expect: Controller reappears in Active list

### 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Access Controller Master via direct URL without authentication redirects to login

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to https://stage.elevatorplus.net/master/controller-master
    - expect: User is redirected to login page

#### 12.2. TC-NAV-02: Access Controller Master via Other Masters tab navigation

**File:** `tests/Other-master/controller-master.spec.ts`

**Steps:**
  1. Log in, click 'Other Masters' in sidebar, then click the 'Controller Master' tab
    - expect: Controller Master form with 'Add Controller' heading is displayed
    - expect: Data table loads with controller records
