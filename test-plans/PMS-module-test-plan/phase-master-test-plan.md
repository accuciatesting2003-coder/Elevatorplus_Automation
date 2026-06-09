# Phase Master Test Plan

## Application Overview

The Phase Master page is part of the ElevatorPlus **Installation (PMS)** module, accessible at `/master/phase-master` (also reachable via the sidebar: Installation (PMS) → Phase Master). It allows admin users to create and manage installation phases that are assigned to elevator projects.

The page has two sections:

**(1) Add Phase form** — contains the following fields:
- **Phase Name \*** (text input, helper: "Enter the phase name") — mandatory
- **Priority \*** (number spinbutton, helper: "Enter unique priority number") — mandatory; must be a unique number
- **Description \*** (text input, helper: "Enter the description") — mandatory
- **Is Allow For All Lifts** (checkbox, default unchecked) — optional; controls visibility of the Select Lift Type dropdown
- **Select Lift Type** (React Select dropdown) — mandatory when "Is Allow For All Lifts" is **unchecked**; **hidden** when checkbox is **checked**
- **Select Lift** (React Select dropdown, labeled "Lift" in the UI, shows "Select Lift" as placeholder) — optional in all cases

Conditional rule: when "Is Allow For All Lifts" is checked, the Select Lift Type dropdown hides and the Lift Type column records "All". When unchecked, Select Lift Type is visible and mandatory, and records the selected lift type.

Form buttons: **Clear** and **Submit** (add mode); **Clear** and **Update** (edit mode).

**(2) Data table** — lists all phase records with columns: Sr. No., Action (Edit icon), Phase Name, Is Allow For All Lifts (Yes/No badge), Lift Type, Lift, Priority, Description, Status (Active/Inactive badge). The table toolbar includes a **Show** selector (10/25/50/100, default 25), a **Status** filter (All/Active/Inactive, default Active), and a **Search Phase Name** input.

Clicking the Edit icon switches the form to "Update Phase" mode, pre-fills all fields, exposes the Status dropdown (Active/Inactive), and changes the action button to "Update".

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Phase Master page loads successfully

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Log in and navigate to `https://stage.elevatorplus.net/master/phase-master`
     - expect: Page URL is `https://stage.elevatorplus.net/master/phase-master`
     - expect: Page title is 'ElevatorPlus'
     - expect: Navbar heading reads 'Phase Master'
     - expect: Form heading 'Add Phase' is visible
     - expect: Phase Name * input is present and empty
     - expect: Priority * spinbutton is present and empty
     - expect: Description * input is present and empty
     - expect: 'Is Allow For All Lifts' checkbox is present and unchecked
     - expect: Select Lift Type dropdown is visible (checkbox is unchecked by default)
     - expect: Select Lift dropdown is visible
     - expect: 'Clear' and 'Submit' buttons are visible
     - expect: Data table is present with columns: Sr. No., Action, Phase Name, Is Allow For All Lifts, Lift Type, Lift, Priority, Description, Status

#### 1.2. TC-SM-02: Verify form helper texts and table toolbar elements

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
     - expect: Helper text 'Enter the phase name' is visible below Phase Name
     - expect: Helper text 'Enter unique priority number' is visible below Priority
     - expect: Helper text 'Enter the description' is visible below Description
  2. Inspect the data table toolbar
     - expect: Show dropdown is present with options 10, 25, 50, 100 (default 25)
     - expect: Status filter is present with options All, Active, Inactive (default Active)
     - expect: 'Search Phase Name' search input is present
  3. Inspect table column headers
     - expect: Columns are: Sr. No., Action, Phase Name, Is Allow For All Lifts, Lift Type, Lift, Priority, Description, Status
     - expect: Phase Name, Is Allow For All Lifts, Lift Type, Lift, Priority, Description, and Status have sort icons

#### 1.3. TC-SM-03: Phase Master is accessible via sidebar navigation

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Log in and click 'Installation (PMS)' in the sidebar
     - expect: Submenu expands showing 'Phase Master', 'Create Stages', 'Create Tasks', 'PMS Data Import', 'PMS Checklist'
  2. Click 'Phase Master'
     - expect: Navigates to `/master/phase-master`
     - expect: 'Add Phase' form is visible

---

### 2. Add Phase — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a phase with "Is Allow For All Lifts" checked (no lift type required)

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
     - expect: 'Add Phase' form is visible with empty fields and 'Is Allow For All Lifts' unchecked
  2. Check the 'Is Allow For All Lifts' checkbox
     - expect: Select Lift Type dropdown is hidden
     - expect: Select Lift dropdown remains visible
  3. Enter Phase Name as 'Installation Phase A'
  4. Enter Priority as '10'
  5. Enter Description as 'Initial installation phase for all lift types'
  6. Click 'Submit'
     - expect: Success toast appears (e.g. 'Phase created successfully!' or similar)
     - expect: Form fields are cleared after submission
     - expect: Form heading reverts to 'Add Phase'
     - expect: New record appears in the table with Phase Name 'Installation Phase A', Is Allow For All Lifts = 'Yes', Lift Type = 'All', Priority = '10', Status = 'Active'

#### 2.2. TC-ADD-02: Successfully create a phase with "Is Allow For All Lifts" unchecked and a specific lift type selected

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` with 'Is Allow For All Lifts' unchecked (default)
     - expect: Select Lift Type dropdown is visible and empty
  2. Enter Phase Name as 'Civil Work Phase'
  3. Enter Priority as '5'
  4. Enter Description as 'Pre-installation civil work'
  5. Select a lift type from the Select Lift Type dropdown (e.g. 'HIGH SPEED LIFT')
     - expect: Selected lift type is shown in the dropdown
  6. Click 'Submit'
     - expect: Success toast appears
     - expect: New record in table shows Phase Name 'Civil Work Phase', Is Allow For All Lifts = 'No', Lift Type = 'HIGH SPEED LIFT', Priority = '5', Status = 'Active'

#### 2.3. TC-ADD-03: Successfully create a phase with Select Lift also selected 
**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
  2. Check 'Is Allow For All Lifts'
  3. Enter Phase Name 'Full Install Phase', Priority '20', Description 'Complete installation'
  4. Select a value from the Select Lift dropdown (e.g. 'New Lift')
     - expect: Selected lift value is shown in the dropdown
  5. Click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows Lift column = 'New Lift'

#### 2.4. TC-ADD-04: Successfully create a phase with Select Lift left empty shows error message

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
  2. Check 'Is Allow For All Lifts', enter Phase Name 'Phase No Lift', Priority '30', Description 'Test no lift selected'
  3. Leave Select Lift empty
  4. Click 'Submit'
     - expect:error  toast appears
     

---

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with all mandatory fields empty shows validation errors

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and click 'Submit' without filling any fields
     - expect: Inline validation error appears for Phase Name
     - expect: Inline validation error appears for Priority
     - expect: Inline validation error appears for Description
     - expect: No record is created in the table

#### 3.2. TC-VAL-02: Submit with Phase Name empty shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, leave Phase Name empty, fill Priority '1', Description 'test', check 'Is Allow For All Lifts', click 'Submit'
     - expect: Inline validation error appears for Phase Name
     - expect: No record is created

#### 3.3. TC-VAL-03: Submit with Priority empty shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, fill Phase Name 'Test Phase', leave Priority empty, fill Description 'test', check 'Is Allow For All Lifts', click 'Submit'
     - expect: Inline validation error appears for Priority
     - expect: No record is created

#### 3.4. TC-VAL-04: Submit with Description empty shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, fill Phase Name 'Test Phase', Priority '1', leave Description empty, check 'Is Allow For All Lifts', click 'Submit'
     - expect: Inline validation error appears for Description
     - expect: No record is created

#### 3.5. TC-VAL-05: Submit with Select Lift Type empty when checkbox is unchecked shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` (ensure 'Is Allow For All Lifts' is unchecked)
  2. Fill Phase Name 'Test Phase', Priority '1', Description 'test description'
  3. Leave Select Lift Type empty
  4. Click 'Submit'
     - expect: Validation error appears for Select Lift Type
     - expect: No record is created

#### 3.6. TC-VAL-06: Validation errors clear when valid input is entered

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and click 'Submit' to trigger all validation errors
     - expect: Validation errors visible for Phase Name, Priority, Description
  2. Fill all mandatory fields with valid values
     - expect: Validation errors disappear as each field is filled
  3. Click 'Submit'
     - expect: Success toast appears

---

### 4. Conditional Visibility — "Is Allow For All Lifts" Checkbox

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-COND-01: Unchecked checkbox shows Select Lift Type dropdown (mandatory)

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
     - expect: 'Is Allow For All Lifts' checkbox is unchecked by default
     - expect: Select Lift Type dropdown is visible in the form
     - expect: Select Lift dropdown is also visible

#### 4.2. TC-COND-02: Checking the checkbox hides Select Lift Type dropdown

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` (checkbox unchecked)
     - expect: Select Lift Type dropdown is visible
  2. Check the 'Is Allow For All Lifts' checkbox
     - expect: Select Lift Type dropdown disappears from the form
     - expect: Select Lift dropdown remains visible (optional field is unaffected)

#### 4.3. TC-COND-03: Unchecking the checkbox re-shows Select Lift Type dropdown

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, check 'Is Allow For All Lifts'
     - expect: Select Lift Type dropdown is hidden
  2. Uncheck 'Is Allow For All Lifts'
     - expect: Select Lift Type dropdown reappears and is empty
     - expect: Select Lift Type is now mandatory (submitting without it should show an error)

#### 4.4. TC-COND-04: Select Lift Type is not required when checkbox is checked

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, check 'Is Allow For All Lifts'
  2. Fill Phase Name 'All Lift Phase Test', Priority '99', Description 'Testing optional lift type'
  3. Do not select any Select Lift Type (it should be hidden)
  4. Click 'Submit'
     - expect: Success toast appears (no validation error for lift type)
     - expect: Record in table shows Is Allow For All Lifts = 'Yes', Lift Type = 'All'

#### 4.5. TC-COND-05: Table reflects "All" for Lift Type when checkbox was checked during creation

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Create a phase with 'Is Allow For All Lifts' checked
     - expect: New record in table shows 'Yes' badge in the Is Allow For All Lifts column
     - expect: Lift Type column shows 'All'
  2. Create another phase with 'Is Allow For All Lifts' unchecked and a specific lift type selected
     - expect: New record shows 'No' badge in the Is Allow For All Lifts column
     - expect: Lift Type column shows the selected lift type name

---

### 5. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-DUP-01: Submitting a duplicate Phase Name shows an error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and note an existing phase name from the table (e.g. 'Civil Work')
  2. Fill Phase Name with 'Civil Work', Priority '50', Description 'duplicate test', check 'Is Allow For All Lifts'
  3. Click 'Submit'
     - expect: Error toast appears (e.g. 'Something went wrong.' or a specific duplicate message)
     - expect: No duplicate record is added to the table



#### 5.3. TC-DUP-03: Case-sensitivity for duplicate phase name

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Note an existing phase name (e.g. 'Phase 1') and attempt to create 'phase 1' (lowercase)
     - expect: Observe whether the system treats different-cased names as duplicates

#### 5.4. TC-DUP-04: Add phase name identical to an existing active phase with the same lift combination shows error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and note an existing Active record with its exact combination — for example Phase Name = 'Civil Work', Is Allow For All Lifts = 'Yes', Lift = 'New Lift'
  2. Fill Phase Name 'Civil Work', check 'Is Allow For All Lifts', select the same Lift value ('New Lift'), enter any unique Priority and Description
  3. Click 'Submit'
     - expect: Error toast appears indicating a duplicate record already exists
     - expect: No new record is added to the table (the existing record count for 'Civil Work' with that combination does not increase)

#### 5.5. TC-DUP-05: Update phase name to a duplicate of an existing active phase (same lift combination) shows error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and identify two different Active records — e.g. Record A: 'Phase 1' (Lift = 'New Lift') and Record B: 'Civil Work' (Lift = 'New Lift')
  2. Click the Edit icon on Record B ('Civil Work')
     - expect: Form opens in 'Update Phase' mode with 'Civil Work' pre-filled
  3. Change Phase Name to 'Phase 1' (same name as Record A), keep Lift = 'New Lift' (same combination as Record A)
  4. Click 'Update'
     - expect: Error toast appears indicating a duplicate record already exists
     - expect: Record B retains its original Phase Name 'Civil Work' in the table

#### 5.6. TC-DUP-06: Same phase name with "New Lift" and "Modernization" as Select Lift should be added successfully (different lift combination)

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, check 'Is Allow For All Lifts', fill Phase Name 'Common Phase Test', enter a unique Priority and Description, select 'New Lift' from the Select Lift dropdown
  2. Click 'Submit'
     - expect: Success toast appears
     - expect: Record 'Common Phase Test' with Lift = 'New Lift' is added to the table
  3. Again fill Phase Name 'Common Phase Test' with a different unique Priority and Description, check 'Is Allow For All Lifts', select 'Modernization' from the Select Lift dropdown
  4. Click 'Submit'
     - expect: Success toast appears (system allows the same phase name when the lift value differs)
     - expect: Table now contains two records with Phase Name 'Common Phase Test' — one with Lift = 'New Lift' and one with Lift = 'Modernization'

#### 5.7. TC-DUP-07: Same phase name with different Select Lift values (different specific lift names) should be added successfully

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, leave 'Is Allow For All Lifts' unchecked, fill Phase Name 'Shared Phase Test', enter a unique Priority and Description, select a specific Lift Type (e.g. 'HIGH SPEED LIFT') and a specific Lift from Select Lift (e.g. 'New Lift')
  2. Click 'Submit'
     - expect: Success toast appears
     - expect: Record added to the table with Phase Name 'Shared Phase Test' and the selected Lift
  3. Again fill Phase Name 'Shared Phase Test' with a different unique Priority and Description, keep the same Lift Type but select a different Lift value from the Select Lift dropdown (e.g. 'Modernization')
  4. Click 'Submit'
     - expect: Success toast appears (system allows the same phase name when the lift name differs)
     - expect: Table shows two records named 'Shared Phase Test' with different values in the Lift column

---

### 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets the Add Phase form

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, fill Phase Name 'Some Phase', Priority '5', Description 'Some description', check 'Is Allow For All Lifts', select a value in Select Lift
     - expect: All fields contain values and checkbox is checked
  2. Click 'Clear'
     - expect: Phase Name input is empty
     - expect: Priority input is empty
     - expect: Description input is empty
     - expect: 'Is Allow For All Lifts' checkbox is unchecked
     - expect: Select Lift Type dropdown is visible again (since checkbox reverted to unchecked)
     - expect: Select Lift dropdown is reset
     - expect: Form heading remains 'Add Phase'
     - expect: No toast or error is shown

#### 6.2. TC-CLR-02: Clear button in Edit mode resets form to Add Phase state

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and click the Edit icon on any record
     - expect: Form heading changes to 'Update Phase'
     - expect: Phase Name, Priority, Description are pre-filled
     - expect: Status dropdown is visible
     - expect: 'Update' button is visible
  2. Click 'Clear'
     - expect: Form heading reverts to 'Add Phase'
     - expect: All inputs are cleared
     - expect: 'Is Allow For All Lifts' checkbox is unchecked
     - expect: Status dropdown is no longer visible
     - expect: Action button reverts to 'Submit'

---

### 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDT-01: Edit icon opens the phase record in edit mode

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and click the Edit icon on any row
     - expect: Form heading changes to 'Update Phase'
     - expect: Phase Name, Priority, Description inputs are pre-filled with the record's values
     - expect: 'Is Allow For All Lifts' checkbox reflects the record's value
     - expect: Status dropdown (Active/Inactive) appears with the record's current status
     - expect: 'Update' button is visible; 'Submit' button is gone

#### 7.2. TC-EDT-02: Successfully update phase name and description

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`, click Edit on any row, update Phase Name to 'Updated Phase Name' and Description to 'Updated description'
  2. Click 'Update'
     - expect: Success toast appears (e.g. 'Phase updated successfully!')
     - expect: Form resets to 'Add Phase' with empty fields
     - expect: Table row shows updated Phase Name and Description

#### 7.3. TC-EDT-03: Update phase — check "Is Allow For All Lifts" to remove lift type constraint

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on a record where Is Allow For All Lifts = 'No' (has a specific lift type)
     - expect: 'Is Allow For All Lifts' is unchecked, Select Lift Type shows the current value
  2. Check the 'Is Allow For All Lifts' checkbox
     - expect: Select Lift Type dropdown hides
  3. Click 'Update'
     - expect: Success toast appears
     - expect: Table record now shows Is Allow For All Lifts = 'Yes' and Lift Type = 'All'

#### 7.4. TC-EDT-04: Update phase — uncheck "Is Allow For All Lifts" and select a specific lift type

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on a record where Is Allow For All Lifts = 'Yes'
     - expect: 'Is Allow For All Lifts' is checked, Select Lift Type is hidden
  2. Uncheck 'Is Allow For All Lifts'
     - expect: Select Lift Type dropdown appears
  3. Select a specific lift type (e.g. 'HIGH SPEED LIFT')
  4. Click 'Update'
     - expect: Success toast appears
     - expect: Table record now shows Is Allow For All Lifts = 'No' and Lift Type = 'HIGH SPEED LIFT'

#### 7.5. TC-EDT-05: Update phase status to Inactive

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on any Active phase, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter set to 'All', verify the record shows 'Inactive' badge
  3. With Status filter set to 'Active', verify the record is absent

#### 7.6. TC-EDT-06: Update with empty Phase Name shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on any phase, clear the Phase Name field, click 'Update'
     - expect: Inline validation error appears for Phase Name
     - expect: No update is saved

#### 7.7. TC-EDT-07: Update with empty Priority shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on any phase, clear the Priority field, click 'Update'
     - expect: Inline validation error appears for Priority
     - expect: No update is saved

#### 7.8. TC-EDT-08: Update with empty Description shows validation error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on any phase, clear the Description field, click 'Update'
     - expect: Inline validation error appears for Description
     - expect: No update is saved

#### 7.9. TC-EDT-09: Update with Select Lift Type empty when checkbox is unchecked shows error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click Edit on any phase, ensure 'Is Allow For All Lifts' is unchecked, clear the Select Lift Type dropdown, click 'Update'
     - expect: Validation error appears for Select Lift Type
     - expect: No update is saved

#### 7.10. TC-EDT-10: Update phase name to a duplicate of an existing active phase shows error

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Note an existing Active phase name (e.g. 'Civil Work')
  2. Click Edit on a different phase, change its name to 'Civil Work', click 'Update'
     - expect: Error toast appears
     - expect: Original name is preserved in the table

---

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Status filter defaults to Active

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master`
     - expect: Status filter shows 'Active' as default
     - expect: Table shows only records with 'Active' badge in the Status column

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
     - expect: Table shows both Active and Inactive records

#### 8.3. TC-FLT-03: Filter table to show Inactive records only

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
     - expect: Only Inactive records are shown, or an empty state if none exist
     - expect: No Active badge is visible in the Status column

#### 8.4. TC-FLT-04: Switching filter from Inactive back to Active restores Active records

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Inactive', then switch back to 'Active'
     - expect: Table shows only Active records again

---

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial phase name returns matching results

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and type 'Phase' in the 'Search Phase Name' input
     - expect: Table filters to show only records whose Phase Name contains 'Phase'

#### 9.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Type 'XYZNONEXISTENTPHASE999' in the search input
     - expect: Table shows no rows or displays an empty state message

#### 9.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Type a search term, verify filtered results, then clear the search input
     - expect: Full Active list is restored

#### 9.4. TC-SRC-04: Search is case-insensitive

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Type a known phase name in uppercase (e.g. 'CIVIL WORK')
     - expect: Table shows records whose Phase Name contains 'civil work' regardless of case

---

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and change Show to '10'
     - expect: Up to 10 rows are displayed in the table

#### 10.2. TC-PAG-02: Change rows-per-page to 50

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Change Show to '50'
     - expect: Up to 50 rows are displayed

#### 10.3. TC-PAG-03: Navigate between pages when multiple pages exist

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. If multiple pages exist, click 'Next page'
     - expect: Next page of records is displayed
  2. Click 'Previous page'
     - expect: Returns to the previous page

---

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort table by Phase Name column

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Navigate to `/master/phase-master` and click the 'Phase Name' column header
     - expect: Table re-sorts alphabetically A→Z
  2. Click 'Phase Name' header again
     - expect: Sort reverses to Z→A

#### 11.2. TC-SRT-02: Sort table by Priority column

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click the 'Priority' column header
     - expect: Table re-sorts in ascending numeric order
  2. Click 'Priority' header again
     - expect: Sort reverses to descending numeric order

#### 11.3. TC-SRT-03: Sort table by Is Allow For All Lifts column

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click the 'Is Allow For All Lifts' column header
     - expect: Records are grouped or sorted by Yes/No value

#### 11.4. TC-SRT-04: Sort table by Lift Type column

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Click the 'Lift Type' column header
     - expect: Records sort alphabetically by Lift Type value

#### 11.5. TC-SRT-05: Sort table by Status column

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click the 'Status' column header
     - expect: Records are grouped or sorted by Active/Inactive status

---

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active phase as Inactive and verify filter behavior

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Edit an Active phase, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter 'Active', verify the phase is no longer listed
     - expect: Phase is absent from Active list
  3. Switch to Status filter 'Inactive'
     - expect: Phase appears with 'Inactive' badge in Status column

#### 12.2. TC-INA-02: Re-activate an Inactive phase

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Inactive', click Edit on an Inactive phase, set Status to 'Active', click 'Update'
     - expect: Success toast appears
  2. Set Status filter to 'Active'
     - expect: The re-activated phase appears in the Active list

---

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Unauthenticated access to Phase Master redirects to login

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Open an unauthenticated browser and navigate to `https://stage.elevatorplus.net/master/phase-master`
     - expect: User is redirected to the login page

#### 13.2. TC-NAV-02: Phase Master navigation link is active when on the Phase Master page

**File:** `tests/PMS-master/phase-master.spec.ts`

**Steps:**
  1. Log in and navigate to `/master/phase-master`
     - expect: 'Installation (PMS)' menu is expanded in the sidebar
     - expect: 'Phase Master' link is highlighted/active in the submenu
