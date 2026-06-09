# Tax Slab Master Test Plan

## Application Overview

The Tax Slab Master page is accessible only as a tab on the ElevatorPlus Other Masters page at /master/other-master (click the "Tax Slab Master" tab). It allows admin users to manage tax slab percentage records used in quotations. The page has two sections: (1) an "Add Tax Slab" form with one mandatory field — "Tax Slab *" (number/spinbutton input, helper: "Enter the tax slab percentage") and one optional checkbox — "Is Default" (to mark this slab as the system default), along with "Clear" and "Submit" buttons (no "⚠ Note" warning); (2) a data table below listing all tax slabs with columns: Sr. No., Action (Edit icon), Tax Slab (displayed as a percentage, e.g. "18%"), Is Default (shows "Default" badge if marked), and Status. The table toolbar includes a Status filter (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), an "Import" button, and a labeled search "Search: [Search Tax Slab]". Clicking the Edit icon switches the form to "Update Tax Slab" mode, pre-fills Tax Slab value and Is Default checkbox, exposes a Status dropdown (Active / Inactive), and changes the button to "Update". Only one tax slab can be marked as Default at a time. Successful creation shows a toast: "Tax Slab created successfully!". Submitting an empty Tax Slab shows inline error. Submitting a duplicate percentage returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Tax Slab Master tab loads successfully

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/other-master
    - expect: The Other Masters page loads with sub-tabs visible: Ceiling Master, Flooring Master, Controller Master, System Master, Shaft Master, Tax Slab Master
  2. Click the 'Tax Slab Master' tab
    - expect: The 'Add Tax Slab' card heading becomes visible
    - expect: The Tax Slab input (label: 'Tax Slab *') should be present and empty
    - expect: The helper text 'Enter the tax slab percentage' should be visible
    - expect: The 'Is Default' checkbox should be present and unchecked by default
    - expect: No '⚠ Note' warning is present
    - expect: 'Clear' and 'Submit' buttons should be visible
    - expect: The data table should load with columns: Sr. No., Action, Tax Slab, Is Default, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master and click the 'Tax Slab Master' tab
    - expect: The form heading reads 'Add Tax Slab'
  2. Inspect the data table toolbar
    - expect: Show dropdown (10, 25, 50, 100 — default 25) is present
    - expect: Status filter (All, Active, Inactive — default Active) is present
    - expect: An 'Import' button is present
    - expect: A 'Search:' label with 'Search Tax Slab' input is present
  3. Inspect the table headers
    - expect: Columns are: Sr. No., Action, Tax Slab, Is Default, Status
    - expect: Tax Slab, Is Default, and Status have sort icons
  4. Observe existing data in the table
    - expect: Tax slab percentages are shown with '%' suffix (e.g., '18%', '28%', '5%')
    - expect: The row marked as default shows a 'Default' badge in the Is Default column

### 2. Add Tax Slab - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new tax slab without Is Default

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master and click 'Tax Slab Master' tab
    - expect: 'Add Tax Slab' form is visible
  2. Enter a unique tax slab percentage, e.g. '3' (for 3%)
    - expect: Value '3' appears in the Tax Slab input
  3. Leave the 'Is Default' checkbox unchecked
    - expect: Checkbox remains unchecked
  4. Click 'Submit'
    - expect: Toast 'Tax Slab created successfully!' appears
    - expect: Tax Slab input is cleared and Is Default is unchecked
    - expect: Form heading remains 'Add Tax Slab'
    - expect: New record '3%' appears in the table with no Default badge and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a tax slab with Is Default checked

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master and click 'Tax Slab Master' tab
    - expect: 'Add Tax Slab' form is visible
  2. Enter a unique tax slab percentage, e.g. '9'
    - expect: Value '9' is entered
  3. Check the 'Is Default' checkbox
    - expect: Checkbox becomes checked
  4. Click 'Submit'
    - expect: Toast 'Tax Slab created successfully!' appears
    - expect: New record '9%' appears in the table with a 'Default' badge
    - expect: Any previously marked default slab may no longer show the 'Default' badge (only one default allowed)

#### 2.3. TC-ADD-03: Create a tax slab with a decimal percentage

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and enter '2.5' in the Tax Slab input
    - expect: Decimal value is accepted
  2. Click 'Submit'
    - expect: Toast 'Tax Slab created successfully!' appears
    - expect: New record '2.5%' appears in the table

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty Tax Slab shows inline error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', leave Tax Slab empty, and click 'Submit'
    - expect: Inline validation error appears below the Tax Slab input
    - expect: No record is added to the table

#### 3.2. TC-VAL-02: Submit with a negative tax slab value

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', enter '-5' in the Tax Slab input, and click 'Submit'
    - expect: Either a validation error appears (negative values not allowed), or the record is created as-is
    - expect: Observe the behavior for negative values

#### 3.3. TC-VAL-03: Submit with only whitespace in Tax Slab shows validation error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', type only spaces in the Tax Slab input, and click 'Submit'
    - expect: Inline validation error appears (input treated as empty)
    - expect: No tax slab with a blank or whitespace-only value is created

#### 3.5. TC-VAL-05: Validation error clears when valid input is entered

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', click 'Submit' without entering a value
    - expect: Validation error is shown
  2. Enter a valid percentage value
    - expect: Validation error disappears
  3. Click 'Submit'
    - expect: Toast 'Tax Slab created successfully!' appears

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing tax slab percentage shows an error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and note an existing percentage (e.g. '18' for 18%)
    - expect: At least one record is visible
  2. Enter '18' in the Tax Slab input and click 'Submit'
    - expect: Toast error 'Something went wrong.' appears
    - expect: No duplicate record is added

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Tax Slab form

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', enter '22' in Tax Slab, and check 'Is Default'
    - expect: Tax Slab shows '22' and Is Default is checked
  2. Click 'Clear'
    - expect: Tax Slab input is cleared
    - expect: Is Default checkbox is unchecked
    - expect: Form heading remains 'Add Tax Slab'
    - expect: No toast or error is shown

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Tax Slab state

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and click Edit on any record
    - expect: Form shows 'Update Tax Slab' with Tax Slab and Is Default pre-filled; Status dropdown visible; button shows 'Update'
  2. Click 'Clear'
    - expect: Form reverts to 'Add Tax Slab' mode
    - expect: Tax Slab input is empty and Is Default is unchecked
    - expect: Status dropdown is no longer visible
    - expect: Action button reverts to 'Submit'

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the tax slab record in edit mode

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and click the Edit icon on any row
    - expect: Form heading changes to 'Update Tax Slab'
    - expect: Tax Slab input is pre-filled with the selected percentage value
    - expect: Is Default checkbox reflects the current default state
    - expect: Status dropdown (Active / Inactive) appears with current status selected
    - expect: Action button changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the tax slab percentage

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', click Edit on any non-default record, and change the Tax Slab value to a unique percentage (e.g. change from '33.33' to '34')
    - expect: New value is in the input
  2. Click 'Update'
    - expect: Toast 'Tax Slab updated successfully!' appears
    - expect: Form resets to 'Add Tax Slab'; table shows updated percentage

#### 6.3. TC-EDT-03: Mark an existing tax slab as Default via edit

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', click Edit on a non-default tax slab
    - expect: Is Default checkbox is unchecked
  2. Check the 'Is Default' checkbox and click 'Update'
    - expect: Success toast appears
    - expect: The edited record now shows 'Default' badge in the Is Default column
    - expect: The previously default record (if any) no longer shows 'Default' badge

#### 6.4. TC-EDT-04: Update tax slab status to Inactive

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Click Edit on any Active tax slab, set Status to 'Inactive', and click 'Update'
    - expect: Success toast appears
    - expect: When Status filter set to 'All', the record shows 'Inactive' badge

#### 6.5. TC-EDT-05: Update with empty Tax Slab shows validation error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Click Edit, clear the Tax Slab input, and click 'Update'
    - expect: Inline validation error appears
    - expect: No update is saved; form remains in Update mode

#### 6.6. TC-EDT-06: Update tax slab to a duplicate of an existing Active percentage shows error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master' (Status filter: Active), and note an existing Active percentage (e.g. '18%')
    - expect: The record is visible with an Active status badge
  2. Click Edit on a different tax slab, change its value to '18', and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Original percentage is preserved in the table

#### 6.7. TC-EDT-07: Update tax slab to a duplicate of an existing Inactive percentage shows error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', set Status filter to 'Inactive', and note an existing Inactive percentage
    - expect: An Inactive record is visible
  2. Set Status filter back to 'Active', click Edit on an Active tax slab, change its value to match the noted Inactive percentage, and click 'Update'
    - expect: Toast error 'Something went wrong.' appears
    - expect: Update is blocked regardless of the conflicting record's inactive status

#### 6.8. TC-EDT-08: Updating a tax slab with Is Default checked when another Active record has Is Default shows error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and verify that at least one Active record has the 'Default' badge
    - expect: An Active record with 'Default' badge is visible in the table
  2. Click Edit on a different (non-default) Active tax slab
    - expect: Form shows 'Update Tax Slab' with Is Default unchecked
  3. Check the 'Is Default' checkbox and click 'Update'
    - expect: Toast error appears indicating Is Default conflict (e.g. 'Something went wrong.' or a specific error message)
    - expect: The original non-default record remains unchanged in the table

#### 6.9. TC-EDT-09: Updating a tax slab with Is Default checked when another Inactive record has Is Default shows error

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', set Status filter to 'All', and verify that an Inactive record has the 'Default' badge
    - expect: An Inactive record with 'Default' badge is visible when Status filter is 'All'
  2. Set Status filter back to 'Active', click Edit on any Active (non-default) tax slab
    - expect: Form shows 'Update Tax Slab' with Is Default unchecked
  3. Check the 'Is Default' checkbox and click 'Update'
    - expect: Toast error appears indicating Is Default conflict (e.g. 'Something went wrong.' or a specific error message)
    - expect: The active record remains non-default; the inactive default record retains its Default badge

### 7. Is Default Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-DEF-01: Only one tax slab can be marked as Default at a time

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and verify which record shows 'Default' badge (e.g. '18%')
    - expect: Exactly one record has 'Default' badge in the Is Default column
  2. Edit a different tax slab and check 'Is Default', then click 'Update'
    - expect: Success toast appears
  3. Verify the table
    - expect: The newly edited tax slab now shows 'Default' badge
    - expect: The previously default tax slab no longer shows 'Default' badge (only one default allowed)

#### 7.2. TC-DEF-02: New tax slab created without Is Default does not affect existing default

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Note the current default tax slab (e.g. '18%')
    - expect: '18%' has 'Default' badge
  2. Create a new tax slab (e.g. '2%') without checking Is Default
    - expect: New record '2%' appears without 'Default' badge
    - expect: '18%' still has 'Default' badge (unchanged)

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master'
    - expect: Status filter defaults to 'Active'; table shows only Active records

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
    - expect: Both Active and Inactive records are displayed

#### 8.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
    - expect: Only Inactive records shown, or empty state if none exist

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial tax slab value returns matching results

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and type '18' in the 'Search Tax Slab' input
    - expect: Table filters to show only tax slabs matching '18' (e.g. '18%')

#### 9.2. TC-SRC-02: Search with a non-existent value returns no results

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Type '999' in the search input
    - expect: Table shows no rows or an empty state message

#### 9.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Type a search term, then clear the search input
    - expect: The full Active list is restored

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', and change Show to '10'
    - expect: Up to 10 rows are displayed

#### 10.2. TC-PAG-02: Navigate between pages

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. If multiple pages exist, click 'Next page' then 'Previous page'
    - expect: Navigation between pages works correctly

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort table by Tax Slab column

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Navigate to /master/other-master, click 'Tax Slab Master', then click 'Tax Slab' column header
    - expect: Table re-sorts by percentage value in ascending order
  2. Click 'Tax Slab' header again
    - expect: Sort reverses to descending

#### 11.2. TC-SRT-02: Sort table by Is Default column

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Click 'Is Default' column header
    - expect: Records are grouped — Default record appears together with non-default records sorted

#### 11.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click 'Status' column header
    - expect: Records are grouped by status (Active / Inactive)

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active tax slab as Inactive and verify filter behavior

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Edit an Active (non-default) tax slab, set Status to 'Inactive', click 'Update'
    - expect: Success toast appears
  2. With Status filter 'Active', verify the tax slab is absent
    - expect: Tax slab absent from Active list
  3. Switch to 'Inactive' filter
    - expect: Tax slab appears with 'Inactive' badge

#### 12.2. TC-INA-02: Re-activate an Inactive tax slab

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Edit an Inactive tax slab, set Status to 'Active', click 'Update'
    - expect: Tax slab reappears in Active list

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Tax Slab Master without authentication redirects to login

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to https://stage.elevatorplus.net/master/other-master
    - expect: User is redirected to the login page
    - expect: Tax Slab Master content is not accessible

#### 13.2. TC-NAV-02: Access Tax Slab Master via Other Masters tab navigation

**File:** `tests/Other-master/tax-slab-master.spec.ts`

**Steps:**
  1. Log in, click 'Other Masters' in sidebar
    - expect: The Other Masters page loads with 6 sub-tabs visible
  2. Click the 'Tax Slab Master' tab
    - expect: The 'Add Tax Slab' form is visible
    - expect: The data table loads with existing tax slab records
    - expect: The currently active tab is highlighted as 'Tax Slab Master'
