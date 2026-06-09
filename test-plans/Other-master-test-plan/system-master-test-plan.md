# System Master Test Plan

## Application Overview

The System Master page is part of the ElevatorPlus Other Masters section, accessible at /master/system-master (also accessible as a tab at /master/other-master). It allows admin users to manage elevator system type records. The page has two sections: (1) an "Add System" form with one mandatory field — "System Name *" (text input, helper: "Enter your system name"), along with "Clear" and "Submit" buttons (no "⚠ Note" warning unlike other masters); (2) a data table below listing all systems with columns: Sr. No., Action (Edit icon), System Name, and Status. The table toolbar includes a Status filter (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Import" button, and a labeled search field "Search: [Search System Name]". Clicking the Edit icon switches the form to "Update System" mode, pre-fills System Name, exposes a Status dropdown (Active / Inactive), and changes the button to "Update". Successful creation shows a toast: "System created successfully!". Submitting an empty System Name shows inline error. Submitting a duplicate returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: System Master page loads successfully

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/system-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/system-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add System' card heading should be visible
    - expect: The System Name input (label: 'System Name *') should be present and empty
    - expect: Helper text 'Enter your system name' should be visible
    - expect: No '⚠ Note' warning should be present (unlike ceiling/flooring/controller/shaft masters)
    - expect: 'Clear' and 'Submit' buttons should be visible
    - expect: The data table should load with columns: Sr. No., Action, System Name, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master
    - expect: The form heading reads 'Add System'
  2. Inspect the data table toolbar
    - expect: Show dropdown (10, 25, 50, 100 — default 25) is present
    - expect: Status filter (All, Active, Inactive — default Active) is present
    - expect: An 'Import' button is present
    - expect: A 'Search:' label with 'Search System Name' input is present
  3. Inspect the table headers
    - expect: Columns are: Sr. No., Action, System Name, Status
    - expect: System Name and Status have sort icons

### 2. Add System - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new system with a unique name

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master
    - expect: 'Add System' form is visible with an empty System Name input
  2. Type a unique name, e.g. 'DUPLEX Test System'
    - expect: Text appears in the input
  3. Click 'Submit'
    - expect: Toast 'System created successfully!' appears
    - expect: System Name input is cleared
    - expect: Form heading remains 'Add System'
    - expect: New system appears in the table with Status 'Active'

#### 2.2. TC-ADD-02: Create a system with special characters in the name

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and type a name with special characters, e.g. 'System #1 - Hi-Speed'
    - expect: Input accepts special characters
  2. Click 'Submit'
    - expect: Toast 'System created successfully!' appears
    - expect: New record appears in table with exact name

#### 2.3. TC-ADD-03: Create a system with a long name

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and type a name of approximately 100 characters
    - expect: Input accepts the long text
  2. Click 'Submit'
    - expect: Either success toast, or an appropriate error if a character limit is enforced

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty System Name shows inline error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master, leave System Name empty, and click 'Submit'
    - expect: Inline validation error appears below System Name
    - expect: No record is added to the table

#### 3.2. TC-VAL-02: Submit with only whitespace shows validation error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master, type only spaces in System Name, and click 'Submit'
    - expect: Either validation error appears, or server returns error
    - expect: No system with blank name is created

#### 3.3. TC-VAL-03: Validation error clears when valid input is entered

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and click 'Submit' without entering a name
    - expect: Validation error is shown
  2. Type a valid name
    - expect: Validation error disappears
  3. Click 'Submit'
    - expect: Toast 'System created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing system name shows an error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and note an existing system name (e.g. 'SIMPLEX')
    - expect: At least one record is visible in the table
  2. Type 'SIMPLEX' in the System Name input and click 'Submit'
    - expect: Toast error 'Something went wrong.' appears
    - expect: No duplicate record is added

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate system name

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Note an existing system name (e.g. 'SIMPLEX') and type it with different casing (e.g. 'simplex')
    - expect: Observe whether the system treats this as a duplicate

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add System form

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master, type a name in System Name
    - expect: Text is visible
  2. Click 'Clear'
    - expect: System Name input is cleared
    - expect: Form heading remains 'Add System'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add System state

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and click Edit on any record
    - expect: Form shows 'Update System' with System Name pre-filled and Status dropdown visible
  2. Click 'Clear'
    - expect: Form reverts to 'Add System' mode with empty System Name
    - expect: Status dropdown is no longer visible
    - expect: Action button reverts to 'Submit'

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the system record in edit mode

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and click the Edit icon on any row
    - expect: Form heading changes to 'Update System'
    - expect: System Name is pre-filled
    - expect: Status dropdown (Active / Inactive) appears with current status selected
    - expect: Action button changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the system name

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master, click Edit, clear System Name, and type 'Updated System Name Test'
    - expect: New name is in the input
  2. Click 'Update'
    - expect: Toast 'System updated successfully!' appears
    - expect: Form resets to 'Add System'; table shows updated name

#### 6.3. TC-EDT-03: Update system status to Inactive

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Click Edit on any Active system, set Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
    - expect: When Status filter set to 'All', the record shows 'Inactive' badge

#### 6.4. TC-EDT-04: Update with empty System Name shows validation error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Click Edit on any system, clear System Name, and click 'Update'
    - expect: Inline validation error appears
    - expect: No update is saved; form remains in Update mode

#### 6.5. TC-EDT-05: Update system name to a duplicate of an existing Active system shows error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master (Status filter: Active) and note an existing Active system name (e.g. 'SIMPLEX')
    - expect: The record is visible with an Active status badge
  2. Click Edit on a different system, change its name to 'SIMPLEX', and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original name is preserved in the table

#### 6.6. TC-EDT-06: Update system name to a duplicate of an existing Inactive system shows error

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master, set Status filter to 'Inactive', and note an existing Inactive system name
    - expect: An Inactive record is visible
  2. Set Status filter back to 'Active', click Edit on an Active system, change its name to the noted Inactive system's name, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master
    - expect: Status filter defaults to 'Active'; table shows only Active records

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
    - expect: Both Active and Inactive records are displayed

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
    - expect: Only Inactive records shown, or empty state if none exist

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial system name returns matching results

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and type 'DUPLEX' in the search input
    - expect: Table filters to show only matching records

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Type 'XYZNONEXISTENTSYSTEM999' in the search input
    - expect: Table shows no rows or an empty state message

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Type a search term, then clear the search input
    - expect: The full Active list is restored

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and change Show to '10'
    - expect: Up to 10 rows are displayed

#### 9.2. TC-PAG-02: Navigate between pages

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. If multiple pages exist, click 'Next page' then 'Previous page'
    - expect: Navigation between pages works correctly

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by System Name column

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Navigate to /master/system-master and click 'System Name' column header
    - expect: Table re-sorts alphabetically A→Z
  2. Click 'System Name' header again
    - expect: Sort reverses to Z→A

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click 'Status' column header
    - expect: Records are grouped by status

### 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Mark an Active system as Inactive and verify filter behavior

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Edit an Active system, set Status to 'Inactive', click 'Update'
    - expect: Success toast appears
  2. With Status filter 'Active', verify the system is gone
    - expect: System absent from Active list
  3. Switch to 'Inactive' filter
    - expect: System appears with 'Inactive' badge

#### 11.2. TC-INA-02: Re-activate an Inactive system

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Edit an Inactive system, set Status to 'Active', click 'Update'
    - expect: System reappears in Active list

### 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Access System Master via direct URL without authentication redirects to login

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to https://stage.elevatorplus.net/master/system-master
    - expect: User is redirected to login page

#### 12.2. TC-NAV-02: Access System Master via Other Masters tab navigation

**File:** `tests/Other-master/system-master.spec.ts`

**Steps:**
  1. Log in, click 'Other Masters' in sidebar, then click the 'System Master' tab
    - expect: System Master form with 'Add System' heading is displayed
    - expect: Data table loads with system records
