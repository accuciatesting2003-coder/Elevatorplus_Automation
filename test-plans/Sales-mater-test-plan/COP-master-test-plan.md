# COP Master Test Plan

## Application Overview

The COP Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/cop-master. It allows admin users to manage COP (Car Operating Panel) records used in elevator sales quotation cost estimations. The page has two main sections: (1) an "Add COP" form at the top, and (2) a data table listing all COP records below.

The Add COP form contains five fields: "COP Name *" (mandatory text input, helper text: "Name for this COP (Car Operating Panel) type."), "COP Price (for G+5) *" (mandatory numeric input, helper text: "Price for the COP." — the "(for G+5)" in the label is dynamic and reflects the Floor Structure value configured in Settings > Configuration Settings > Floor Structure field, which is currently set to "5" making the bracket display "(for G+5)"), "COP Per Floor Increase *" (mandatory numeric input, helper text: "Additional COP cost per floor."), "LOP Name (optional)" (optional text input, helper text: "Name for the LOP (Landing Operating Panel), if applicable."), and "LOP Price *" (mandatory numeric input, helper text: "Price for the LOP."). The form includes a warning note "⚠ Note: Changes in this master will impact quotation cost estimation." and two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update COP" mode with all five fields pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive) and the action button changes to "Update".

The data table toolbar includes: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Update Price" button, an "Import" button, and a "Search Cop Name" search text box.

Table columns are: Sr. No., Action (Edit icon), COP Name, COP Price, COP Per Floor Increase, LOP Name, LOP Price, and Status. Pagination controls (Previous page, page number buttons, Next page) appear below the table.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: COP Master page loads successfully

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/cop-master
    - expect: The page title should be 'COP master'
    - expect: The 'Add COP' card heading should be visible
    - expect: The 'COP Name *' input field should be present and empty
    - expect: The 'COP Price (for G+5) *' input field should be present and empty
    - expect: The 'COP Per Floor Increase *' input field should be present and empty
    - expect: The 'LOP Name (optional)' input field should be present and empty
    - expect: The 'LOP Price *' input field should be present and empty
    - expect: The warning note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display COP records

#### 1.2. TC-SM-02: Verify page elements, table columns, and toolbar layout

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to the COP Master page at https://stage.elevatorplus.net/master/cop-master
    - expect: The form section heading should read 'Add COP'
    - expect: An info icon button should be present next to the 'Add COP' heading
  2. Inspect the data table toolbar above the table
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25 selected)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active selected)
    - expect: An 'Update Price' button should be present in the toolbar
    - expect: An 'Import' button should be present in the toolbar
    - expect: A 'Search Cop Name' text input should be present in the toolbar
  3. Inspect the table header row
    - expect: Column headers should include: Sr. No., Action, COP Name, COP Price, COP Per Floor Increase, LOP Name, LOP Price, and Status
    - expect: The COP Name and Status columns should be sortable (clickable header buttons)

#### 1.3. TC-SM-03: Verify all mandatory and optional form field labels

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and inspect each form field label
    - expect: The first field label should read 'COP Name *' with helper text 'Name for this COP (Car Operating Panel) type.'
    - expect: The second field label should read 'COP Price (for G+5) *' with helper text 'Price for the COP.'
    - expect: The third field label should read 'COP Per Floor Increase *' with helper text 'Additional COP cost per floor.'
    - expect: The fourth field label should read 'LOP Name (optional)' with helper text 'Name for the LOP (Landing Operating Panel), if applicable.'
    - expect: The fifth field label should read 'LOP Price *' with helper text 'Price for the LOP.'
    - expect: Fields marked with '*' (COP Name, COP Price, COP Per Floor Increase, LOP Price) are mandatory; LOP Name is optional (no asterisk)

### 2. Add COP - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new COP with all mandatory fields filled and LOP Name omitted

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The 'Add COP' form is displayed with all input fields empty
  2. Click on the 'COP Name *' input field and type a unique name, e.g., 'Standard Push Button COP'
    - expect: The typed text 'Standard Push Button COP' appears in the input
    - expect: The floating label 'COP Name *' animates upward
  3. Click on the 'COP Price (for G+5) *' input field and type a numeric value, e.g., '5000'
    - expect: The value '5000' appears in the input field
  4. Click on the 'COP Per Floor Increase *' input field and type a numeric value, e.g., '200'
    - expect: The value '200' appears in the input field
  5. Leave the 'LOP Name (optional)' field empty (do not type anything)
    - expect: The LOP Name input remains empty
  6. Click on the 'LOP Price *' input field and type a numeric value, e.g., '1500'
    - expect: The value '1500' appears in the input field
  7. Click the 'Submit' button
    - expect: A success toast notification appears (e.g., 'COP created successfully!')
    - expect: All input fields are cleared and reset to empty
    - expect: The form heading remains 'Add COP'
    - expect: The newly created COP 'Standard Push Button COP' appears in the data table with Status 'Active'
    - expect: The LOP Name column for the new record is empty or displays a dash '-'

#### 2.2. TC-ADD-02: Successfully create a new COP with LOP Name filled

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The 'Add COP' form is visible with all fields empty
  2. Fill all fields: COP Name = 'Touch Screen COP', COP Price = '8000', COP Per Floor Increase = '300', LOP Name = 'Touch Screen LOP', LOP Price = '2500'
    - expect: All entered values appear in their respective input fields
  3. Click the 'Submit' button
    - expect: A success toast notification appears
    - expect: All input fields are cleared and reset to empty
    - expect: The newly created record 'Touch Screen COP' appears in the table with LOP Name showing 'Touch Screen LOP' and Status 'Active'

#### 2.3. TC-ADD-03: Verify LOP Name is truly optional — form submits without LOP Name

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'Optional LOP Test COP', COP Price = '1000', COP Per Floor Increase = '100', LOP Price = '500'. Leave LOP Name completely empty.
    - expect: The LOP Name field remains empty with no validation error shown
    - expect: All other mandatory fields are filled
  2. Click the 'Submit' button
    - expect: No validation error is shown for the LOP Name field
    - expect: A success toast notification appears
    - expect: The new COP record is created successfully and appears in the table
    - expect: The LOP Name column for the new record is empty or shows '-'

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty COP Name shows inline error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Price = '1000', COP Per Floor Increase = '100', LOP Price = '500'. Leave COP Name empty.
    - expect: COP Price, COP Per Floor Increase, and LOP Price fields show their entered values
    - expect: COP Name input remains empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the COP Name field
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.2. TC-VAL-02: Submit form with empty COP Price shows inline error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'Price Validation Test', COP Per Floor Increase = '100', LOP Price = '500'. Leave COP Price empty.
    - expect: COP Name, COP Per Floor Increase, and LOP Price fields show their entered values
    - expect: COP Price input remains empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the COP Price field
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.3. TC-VAL-03: Submit form with empty COP Per Floor Increase shows inline error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'Floor Increase Validation Test', COP Price = '1000', LOP Price = '500'. Leave COP Per Floor Increase empty.
    - expect: COP Name, COP Price, and LOP Price fields show their entered values
    - expect: COP Per Floor Increase input remains empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the COP Per Floor Increase field
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.4. TC-VAL-04: Submit form with empty LOP Price shows inline error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'LOP Price Validation Test', COP Price = '1000', COP Per Floor Increase = '100'. Leave LOP Price empty.
    - expect: COP Name, COP Price, and COP Per Floor Increase fields show their entered values
    - expect: LOP Price input remains empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the LOP Price field
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.5. TC-VAL-05: Submit completely empty form shows errors on all mandatory fields

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and click the 'Submit' button without entering any values
    - expect: Inline validation errors appear below COP Name, COP Price, COP Per Floor Increase, and LOP Price fields
    - expect: No validation error appears for LOP Name (it is optional)
    - expect: No new COP record is created in the data table
    - expect: The form remains in 'Add COP' mode

#### 3.6. TC-VAL-06: LOP Name is optional — verify no error shown when LOP Name is blank on submit

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in all mandatory fields: COP Name = 'LOP Name Optional Check', COP Price = '100', COP Per Floor Increase = '10', LOP Price = '50'. Leave LOP Name blank.
    - expect: All mandatory fields are filled, LOP Name is empty
  2. Click the 'Submit' button
    - expect: No validation error is shown for the LOP Name field
    - expect: The record is created successfully (success toast shown)
    - expect: The new record appears in the table with an empty or '-' LOP Name column

#### 3.7. TC-VAL-07: Submit form with only whitespace in all mandatory fields shows inline errors

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The 'Add COP' form is visible with all fields empty
  2. Type only spaces (e.g., '   ') into the 'COP Name *' input field
    - expect: Spaces appear to be entered in the field
  3. Type only spaces (e.g., '   ') into the 'COP Price (for G+5) *' input field
    - expect: Spaces appear to be entered in the field
  4. Type only spaces (e.g., '   ') into the 'COP Per Floor Increase *' input field
    - expect: Spaces appear to be entered in the field
  5. Type only spaces (e.g., '   ') into the 'LOP Price *' input field
    - expect: Spaces appear to be entered in the field
  6. Click the 'Submit' button
    - expect: Inline validation errors appear below the COP Name, COP Price, COP Per Floor Increase, and LOP Price fields (whitespace-only input should be treated as empty)
    - expect: No new COP record is created in the data table
    - expect: The form remains in 'Add COP' mode and is not reset

#### 3.8. TC-VAL-08: Enter alphabetic and special characters in price input fields shows error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill COP Name = 'Price Input Test'
    - expect: COP Name field shows 'Price Input Test'
  2. In the 'COP Price (for G+5) *' field, type alphabetic and special characters, e.g., 'abc!@#'
    - expect: Either the field rejects non-numeric input entirely (characters are not typed), OR the characters appear in the field
  3. In the 'COP Per Floor Increase *' field, type alphabetic and special characters, e.g., 'xyz$%^'
    - expect: Either the field rejects non-numeric input entirely, OR the characters appear in the field
  4. In the 'LOP Price *' field, type alphabetic and special characters, e.g., '&*()'
    - expect: Either the field rejects non-numeric input entirely, OR the characters appear in the field
  5. Click the 'Submit' button
    - expect: Inline validation errors appear below COP Price, COP Per Floor Increase, and LOP Price fields indicating only numeric values are accepted
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.9. TC-VAL-09: Negative values should not be allowed in price related fields

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'Negative Price Test'
    - expect: COP Name field shows 'Negative Price Test'
  2. In the 'COP Price (for G+5) *' field, type a negative value, e.g., '-500'
    - expect: Either the field rejects the minus sign and does not accept the negative value, OR '-500' appears in the field
  3. In the 'COP Per Floor Increase *' field, type a negative value, e.g., '-100'
    - expect: Either the field rejects the negative value, OR '-100' appears in the field
  4. In the 'LOP Price *' field, type a negative value, e.g., '-200'
    - expect: Either the field rejects the negative value, OR '-200' appears in the field
  5. Click the 'Submit' button
    - expect: Inline validation errors appear below COP Price, COP Per Floor Increase, and LOP Price fields indicating negative values are not permitted
    - expect: No new COP record is created in the data table
    - expect: The form is not reset

#### 3.10. TC-VAL-10: Zero (0) should be accepted in all price related fields

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and fill in COP Name = 'Zero Price Test'
    - expect: COP Name field shows 'Zero Price Test'
  2. In the 'COP Price (for G+5) *' field, type '0'
    - expect: The value '0' appears in the COP Price field
  3. In the 'COP Per Floor Increase *' field, type '0'
    - expect: The value '0' appears in the COP Per Floor Increase field
  4. In the 'LOP Price *' field, type '0'
    - expect: The value '0' appears in the LOP Price field
  5. Click the 'Submit' button
    - expect: No validation error appears for any of the price fields — zero is a valid value
    - expect: A success toast notification appears (e.g., 'COP created successfully!')
    - expect: The new record 'Zero Price Test' appears in the data table with COP Price = 0, COP Per Floor Increase = 0, and LOP Price = 0

### 4. COP Price Floor Structure Display

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-FLS-01: Verify the floor structure bracket is displayed in the COP Price label

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and inspect the label text of the second form field
    - expect: The label for the second input field should read 'COP Price (for G+5) *'
    - expect: The bracket text '(for G+5)' is visible as part of the COP Price field label
    - expect: The bracket is not editable — it is static display text

#### 4.2. TC-FLS-02: Verify the bracket text reflects the Floor Structure configured in Settings > Configuration Settings

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/settings and click on 'Configuration Settings'
    - expect: The Configuration Settings page opens
  2. Locate the 'Floor Structure (G+ number of floor)*' input field and note its current value (e.g., '5')
    - expect: The Floor Structure field is visible with a numeric value (currently '5')
  3. Navigate to https://stage.elevatorplus.net/master/cop-master and inspect the COP Price field label
    - expect: The bracket in the COP Price label matches the Floor Structure value from Settings: if Floor Structure is '5' in configuration setting under setting , the label reads 'COP Price (for G+5) *'
    - expect: The dynamic bracket correctly reflects the configured floor structure from the configuration setting under setting

### 5. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-DUP-01: Submitting an existing Active COP Name shows an error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and note an existing COP name from the data table (e.g., 'COP1')
    - expect: At least one COP record is visible in the table
  2. Type the existing COP name 'COP1' exactly into the COP Name input field, then fill COP Price = '100', COP Per Floor Increase = '10', LOP Price = '50'
    - expect: The values are entered in their respective fields
  3. Click the 'Submit' button
    - expect: A toast error message appears (e.g., 'Something went wrong.')
    - expect: No duplicate record is added to the data table
    - expect: The form input values are not cleared

#### 5.2. TC-DUP-02: Test case-sensitivity for duplicate COP Name

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and note an existing COP name, e.g., 'COP1'. Type the same name with different casing (e.g., 'cop1' or 'Cop1') in the COP Name field, then fill COP Price = '100', COP Per Floor Increase = '10', LOP Price = '50'
    - expect: The text is entered in the input field
  2. Click the 'Submit' button
    - expect: Observe whether the application treats the differently-cased name as a duplicate (shows error) or allows it as a unique name (shows success)

#### 5.3. TC-DUP-03: Add a new record with the same name as an existing Inactive COP shows error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and change the Status filter to 'Inactive'. Note the COP Name of any Inactive record visible in the table (e.g., 'Inactive COP Test')
    - expect: At least one Inactive COP record is visible in the table
  2. Change the Status filter back to 'Active'. In the 'Add COP' form, type the same name as the Inactive record (e.g., 'Inactive COP Test') into the 'COP Name *' field, then fill COP Price = '100', COP Per Floor Increase = '10', LOP Price = '50'
    - expect: The name of the Inactive record is entered in the COP Name input
  3. Click the 'Submit' button
    - expect: A toast error message appears (e.g., 'Something went wrong.') indicating the name already exists in the system even though the existing record is Inactive
    - expect: No new COP record is created in the data table
    - expect: The form input values are not cleared

### 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets the Add COP form

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The 'Add COP' form is visible with all input fields empty
  2. Type values into all fields: COP Name = 'Temp COP', COP Price = '999', COP Per Floor Increase = '99', LOP Name = 'Temp LOP', LOP Price = '499'
    - expect: All typed values are visible in their respective input fields
  3. Click the 'Clear' button
    - expect: All input fields (COP Name, COP Price, COP Per Floor Increase, LOP Name, LOP Price) are cleared and become empty
    - expect: The form heading still reads 'Add COP'
    - expect: The action button still reads 'Submit'
    - expect: No toast notification or error is shown
    - expect: The data table is not affected or refreshed

#### 6.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add COP state

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and click the Edit icon for any COP record in the data table
    - expect: The form heading changes to 'Update COP'
    - expect: All five fields (COP Name, COP Price, COP Per Floor Increase, LOP Name, LOP Price) are pre-filled with the selected record's values
    - expect: A 'Status *' dropdown is shown with the current status pre-selected (e.g., 'Active')
    - expect: The action button label changes from 'Submit' to 'Update'
  2. Click the 'Clear' button while in Update COP mode
    - expect: The form heading reverts to 'Add COP'
    - expect: All input fields (COP Name, COP Price, COP Per Floor Increase, LOP Name, LOP Price) are cleared and empty
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database
    - expect: No toast notification is shown

### 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDT-01: Edit icon opens the COP record in Update COP mode with pre-filled fields

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The data table shows at least one COP record
  2. Click the Edit icon in the Action column of any row, e.g., the row with COP Name 'COP1'
    - expect: The form heading changes from 'Add COP' to 'Update COP'
    - expect: The 'COP Name *' input is pre-filled with the selected row's COP Name (e.g., 'COP1')
    - expect: The 'COP Price (for G+5) *' input is pre-filled with the record's COP Price value
    - expect: The 'COP Per Floor Increase *' input is pre-filled with the record's COP Per Floor Increase value
    - expect: The 'LOP Name (optional)' input is pre-filled with the record's LOP Name value (or empty if blank)
    - expect: The 'LOP Price *' input is pre-filled with the record's LOP Price value
    - expect: A 'Status *' dropdown appears with options 'Select Status', 'Active', 'Inactive' and the current status pre-selected
    - expect: The action button label changes to 'Update'

#### 7.2. TC-EDT-02: Successfully update a COP record

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and click the Edit icon for a COP record (e.g., 'COP2')
  2. update all the fields with new values 
  3. Click the 'Update' button
    - expect: A success toast notification appears (e.g., 'COP updated successfully!')
    - expect: The form resets to 'Add COP' state with all fields cleared
    - expect: The data table refreshes and shows the updated values in the previously edited row

#### 7.3. TC-EDT-03: Update COP with empty mandatory fields shows validation errors

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and click the Edit icon for any COP record
    - expect: The form is in 'Update COP' mode with all fields pre-filled
  2. Clear the 'COP Name *' input field completely so it is empty, then click the 'Update' button
    - expect: An inline validation error appears below the COP Name field
    - expect: No API update call is made
    - expect: The form remains in 'Update COP' mode without resetting

#### 7.4. TC-EDT-04: Update COP name to a duplicate of an existing Active COP shows error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master, note two distinct existing Active COP names (e.g., 'COP1' and 'COP2'), and click the Edit icon for 'COP2'
    - expect: The form is in 'Update COP' mode with 'COP2' pre-filled in COP Name
  2. Clear the COP Name input and type the name of the other existing Active COP, e.g., 'COP1'
    - expect: 'COP1' appears in the COP Name input
  3. Click the 'Update' button
    - expect: A toast error message appears (e.g., 'Something went wrong.')
    - expect: The COP record is not updated and the original name 'COP2' remains in the table

#### 7.5. TC-EDT-05: Update COP status to Inactive

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and click the Edit icon for any COP with 'Active' status
    - expect: The form is in 'Update COP' mode with the 'Status *' dropdown showing 'Active'
  2. In the 'Status *' dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add COP' mode
    - expect: When the table Status filter is set to 'All', the edited COP row shows 'Inactive' in the Status column

#### 7.6. TC-EDT-06: Update an existing Active COP name to match an existing Inactive COP name shows error

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and change the Status filter to 'Inactive'. Note the COP Name of any Inactive record (e.g., 'Discontinued COP')
    - expect: At least one Inactive COP record is visible in the table
  2. Change the Status filter to 'Active'. Click the Edit icon for any Active COP record (e.g., 'COP2') to open it in 'Update COP' mode
    - expect: The form heading changes to 'Update COP' with the COP Name pre-filled as 'COP2'
  3. Clear the 'COP Name *' input and type the name of the Inactive COP noted in step 1 (e.g., 'Discontinued COP')
    - expect: The Inactive COP's name appears in the COP Name input
  4. Click the 'Update' button
    - expect: A toast error message appears (e.g., 'Something went wrong.') — the name is already taken by an Inactive record and cannot be reused
    - expect: The Active COP record is not updated and its original name 'COP2' remains unchanged in the table
    - expect: The form remains in 'Update COP' mode and is not reset

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The 'Status:' filter dropdown defaults to 'Active'
    - expect: The data table shows only records with 'Active' status
    - expect: All visible rows display an 'Active' badge in the Status column
    - expect: No 'Inactive' rows are displayed

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and change the 'Status:' filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive COP records
    - expect: Inactive COP records (if any exist) are shown alongside Active ones

#### 8.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and change the 'Status:' filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive COP records are shown in the table, OR an empty state message is shown if there are no Inactive COP records

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial and complete  COP name returns matching results

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The full list of Active COP records is displayed in the table
  2. Click the 'Search Cop Name' input field in the table toolbar and type a partial name and also check with complete cop name , e.g., 'COP'
    - expect: The table dynamically filters to show only COP records whose names contain 'COP' (case-insensitive)
    - expect: Non-matching rows are hidden from the table

#### 9.2. TC-SRC-02: Search with a non-existent COP name returns no results

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and type a name that does not exist, e.g., 'XYZNONEXISTENTCOP999', into the 'Search Cop Name' input
    - expect: The table shows no rows or displays an empty state / 'no records found' message
    - expect: No COP records matching the search text are displayed

#### 9.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and type 'Push' into the 'Search Cop Name' input to filter results
    - expect: The table shows only records matching 'Push'
  2. Clear the 'Search Cop Name' input field completely (delete all text)
    - expect: The table restores to show all Active COP records as before the search
    - expect: The full unfiltered list is displayed

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master (default shows 25 rows per page)
    - expect: The 'Show:' dropdown displays '25' as the selected value
    - expect: Up to 25 rows are shown in the table
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total COP records

#### 10.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master, set Show to '10', and verify there are multiple pages
    - expect: Pagination controls with 'Previous page', page number buttons, and 'Next page' are visible
    - expect: The 'Previous page' button is disabled on page 1
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled again

#### 10.3. TC-PAG-03: Change rows-per-page to 50 and 100

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master and change the 'Show:' dropdown to '50'
    - expect: The table displays up to 50 rows per page
    - expect: If total records are fewer than 50, all records are shown on a single page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table displays up to 100 rows per page
    - expect: If total records are fewer than 100, all records are shown on a single page

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort table by COP Name column

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master
    - expect: The data table is loaded with COP records
  2. Click the 'COP Name' column header button
    - expect: The table re-sorts COP records alphabetically (A to Z) by COP Name
    - expect: The sort icon on the COP Name column indicates ascending sort order
  3. Click the 'COP Name' column header button again
    - expect: The sort order reverses to Z to A (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 11.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master, set the Status filter to 'All', then click the 'Status' column header button
    - expect: The table re-sorts records grouping Active and Inactive records together
    - expect: The sort icon on the Status column updates to indicate sort direction
  2. Click the 'Status' column header button again
    - expect: The sort order reverses
    - expect: The sort icon updates to indicate the reversed sort direction

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Deactivate an Active COP and verify it disappears from the Active filter

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master with the Status filter set to 'Active'. Note the name of an existing Active COP record (e.g., 'Wooden COP')
    - expect: The COP 'Wooden COP' is visible in the Active list
  2. Click the Edit icon for 'Wooden COP' to open it in 'Update COP' mode
    - expect: The form shows 'Update COP' with Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add COP' mode
  4. Verify the table with Status filter still set to 'Active'
    - expect: The COP 'Wooden COP' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The COP 'Wooden COP' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 12.2. TC-INA-02: Re-activate an Inactive COP

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/cop-master, change Status filter to 'Inactive', and click the Edit icon for an Inactive COP
    - expect: The form shows 'Update COP' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add COP' mode
  3. Change the Status filter back to 'Active'
    - expect: The previously Inactive COP now appears in the Active list with an 'Active' status badge and disappear from the inacive records 

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Unauthenticated access to COP Master URL redirects to login page

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state / no session cookies) and navigate directly to https://stage.elevatorplus.net/master/cop-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The COP Master page content (form and table) is not shown
    - expect: The login form with mobile number and password fields is visible

#### 13.2. TC-NAV-02: Access COP Master via Sales Masters sidebar navigation

**File:** `tests/Sales-master/cop-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master links
  2. Look for and click the 'COP Master' link in the Sales Masters sub-menu
    - expect: The COP Master page at /master/cop-master is loaded
    - expect: The page heading 'Add COP' is visible in the form section
    - expect: The data table with existing COP records is displayed
