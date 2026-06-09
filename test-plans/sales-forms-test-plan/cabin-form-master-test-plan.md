# Cabin Form Master Test Plan

## Application Overview

The Cabin Form Master page is part of the ElevatorPlus Sales Forms section, accessible at /forms/cabin-form (sidebar: Sales Forms > Cabin). It allows admin users to manage cabin pricing records used in elevator quotation cost estimation. The page is a standard master form layout with two sections: (1) an "Add Cabin" form at the top containing five fields — "Type Of Lift" (optional multi-select dropdown, helper: "Select the type of lift"), "Select Cabin *" (mandatory multi-select dropdown, helper: "Select cabin"), "Lift Type *" (mandatory single-select dropdown, helper: "Select the lift type", options: Passenger Lift / Goods Lift, default: Passenger Lift), "Passenger *" (mandatory multi-select dropdown, helper: "Select passenger or capacity"), and "Price *" (mandatory numeric input, helper: "Enter the price") — along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table below listing all cabin records with columns: Sr. No., Action (Edit icon), Type Of Lift, Cabin, Lift Type, Passenger/Capacity, Price, Status. The table includes filtering by Status (All / Active / Inactive, default: Active), a rows-per-page selector (10 / 25 / 50 / 100, default: 25), and a search box. Clicking the Edit icon on a row switches the form header to "Update Cabin", pre-fills all fields, exposes a Status dropdown (Active / Inactive, default: Active), disables the Lift Type dropdown (cannot be changed in edit mode), and changes the action button label to "Update". Clicking "Clear" in either mode resets the form to the blank "Add Cabin" state. Successful creation toast: **"Cabin has been created successfully"**. Successful update toast: **"Cabin has been updated successfully!"**. Duplicate error toast: **"A record with the same cabin, type of lift, and passenger/capacity combination already exists."** — this error fires when a submitted combination matches an existing record on the three-field uniqueness key: **Cabin + Type Of Lift + Passenger/Capacity**. Important behaviors: (a) records where Type Of Lift is empty ("-") bypass the duplicate check entirely and can be created freely; (b) Price is NOT part of the uniqueness key; (c) the form does NOT reset after a duplicate error — all field values are preserved so the user can correct the entry; (d) the duplicate check applies to both Active and Inactive records.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Cabin Form Master page loads successfully

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/forms/cabin-form
    - expect: The page URL should be https://stage.elevatorplus.net/forms/cabin-form
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Cabin' card heading should be visible
    - expect: The Type Of Lift multi-select dropdown (optional) should be present
    - expect: The Select Cabin multi-select dropdown (mandatory) should be present
    - expect: The Lift Type single-select dropdown (mandatory) should be present with default option 'Passenger Lift'
    - expect: The Passenger multi-select dropdown (mandatory) should be present
    - expect: The Price numeric input field (mandatory) should be present and empty
    - expect: The note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display cabin records

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to the Cabin Form Master page at /forms/cabin
    - expect: The form section heading should read 'Add Cabin'
    - expect: An info icon button should be present next to the heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: A search box should be present
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Type Of Lift, Cabin, Lift Type, Passenger/Capacity, Price, Status
    - expect: Sortable columns should display sort icons

### 2. Add Record — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new record with only mandatory fields (no Type Of Lift)

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin
    - expect: The 'Add Cabin' form is displayed with empty fields
  2. Leave Type Of Lift empty (optional). Select a cabin value from the Select Cabin dropdown (e.g. 'SS Mirror'). Confirm Lift Type is set to 'Passenger Lift' (default). Select a passenger value (e.g. '8'). Enter '5000' in the Price field.
    - expect: Select Cabin shows the selected value
    - expect: Lift Type shows 'Passenger Lift'
    - expect: Passenger field shows '8'
    - expect: Price field shows '5000'
  3. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Cabin has been created successfully'
    - expect: The form fields are cleared and reset to empty
    - expect: The form heading remains 'Add Cabin'
    - expect: The newly created record appears in the data table with correct values and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a record for Goods Lift with mandatory fields

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, select a cabin value from Select Cabin (e.g. 'SS Mirror'), select 'Goods Lift' from the Lift Type dropdown, select a passenger/capacity value (e.g. '816 kg'), and enter Price '3500'
    - expect: 'Goods Lift' is selected in the Lift Type dropdown
    - expect: The passenger/capacity is selected
    - expect: Price shows '3500'
  2. Click 'Submit'
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: The new record appears in the table showing 'Goods Lift' in the Lift Type column

#### 2.3. TC-ADD-03: Successfully create a record with all fields populated including optional Type Of Lift

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and select one or more values in the Type Of Lift multi-select (e.g. 'Passenger Lift'). Select one or more cabin values from Select Cabin (e.g. 'SS Mirror'). Confirm Lift Type is 'Passenger Lift'. Select multiple Passenger values (e.g. '8', '13'). Enter Price '7500'.
    - expect: Type Of Lift shows selected tags
    - expect: Select Cabin shows selected tags
    - expect: Lift Type shows 'Passenger Lift'
    - expect: Passenger shows '8', '13' tags
    - expect: Price shows '7500'
  2. Click 'Submit'
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: All field values including Type Of Lift appear correctly in the data table

#### 2.4. TC-ADD-04: Successfully create a record with multiple Passenger values

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, select a cabin value, keep Lift Type as 'Passenger Lift', and add multiple passenger tags (e.g. '4', '6', '8'). Enter Price '4000'.
    - expect: Three tags '4', '6', '8' appear in the Passenger field
  2. Click 'Submit'
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: The new record shows all passenger values in the Passenger/Capacity column

#### 2.5. TC-ADD-05: Successfully create a record with multiple Select Cabin values

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and select multiple cabin values from Select Cabin (e.g. 'SS Mirror', 'Wood Panel'). Select Lift Type and Passenger, enter Price.
    - expect: Multiple cabin tags appear in the Select Cabin field
  2. Click 'Submit'
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: The new record shows all cabin values in the Cabin column

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Select Cabin shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Leave Select Cabin unselected. Fill in all other mandatory fields (Lift Type, Passenger, Price). Click 'Submit'.
    - expect: A validation error appears for the Select Cabin field (e.g. 'Please select cabin')
    - expect: No API call is made to create a record
    - expect: No new record is added to the data table

#### 3.2. TC-VAL-02: Submit form with empty Lift Type shows validation error (Add mode only — Lift Type is disabled in Update mode)

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Select a cabin. Clear or leave Lift Type unselected (if possible). Select Passenger and enter Price. Click 'Submit'.
    - expect: A validation error appears for the Lift Type field
    - expect: No record is created
  > **Note:** In Update/Edit mode, the Lift Type dropdown is **disabled** and cannot be cleared, so this validation cannot be triggered during an update. The field is locked to its original value when a record is edited.

#### 3.3. TC-VAL-03: Submit form with empty Passenger shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Select a cabin and Lift Type. Leave Passenger field empty (no tags). Enter Price '5000'. Click 'Submit'.
    - expect: A validation error appears for the Passenger field (e.g. 'Please select passenger')
    - expect: No record is created

#### 3.4. TC-VAL-04: Submit form with empty Price shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Select a cabin, Lift Type, and Passenger. Leave Price empty. Click 'Submit'.
    - expect: A validation error appears for the Price field (e.g. 'Please enter price.')
    - expect: No record is created

#### 3.5. TC-VAL-05: Submit completely empty form shows validation errors on all mandatory fields

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click 'Submit' without filling any fields
    - expect: Validation errors appear for Select Cabin, Passenger, and Price at minimum
    - expect: No API call is made
    - expect: No record is created

#### 3.6. TC-VAL-06: Validation errors clear when valid input is entered after a failed submit

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click 'Submit' without filling any fields to trigger all validation errors
    - expect: Validation error messages are shown for required fields
  2. Fill in all mandatory fields (Select Cabin, Lift Type, Passenger, Price) with valid values
    - expect: Validation error messages disappear as each field is filled
  3. Click 'Submit'
    - expect: Toast 'Cabin has been created successfully' appears

### 4. Duplicate Prevention — ADD Records

**Seed:** `tests/setup/auth.setup.ts`

> **Uniqueness key (mirrors Car and Counter Frame logic):** The server enforces uniqueness on the **three-field combination: Cabin + Type Of Lift + Passenger/Capacity**. Price is NOT part of the key. Records where Type Of Lift is empty ("-") bypass the duplicate check entirely and can be created freely even if Cabin + Passenger match an existing record. The form preserves its field values after a duplicate error (does not reset). The duplicate check applies to both Active and Inactive records.

#### 4.1. TC-DUP-ADD-01: Submit exact match of Type Of Lift + Cabin + Passenger matching an existing Active record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin (Status filter: Active) and note an existing record that has a Type Of Lift value — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible in the Active list with a non-empty Type Of Lift column
  2. Select the same Type Of Lift value ('Nova Lift'), select the same Cabin ('SS Mirror'), keep Lift Type as 'Passenger Lift', select the same Passenger value ('8'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: The form is NOT reset — all field values remain filled so the user can correct the entry

#### 4.2. TC-DUP-ADD-02: Submit exact match with different Price — duplicate error still fires (Price is not in uniqueness key)

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record with a non-empty Type Of Lift — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8', Price: '5000'
    - expect: The record is visible
  2. Select the same Type Of Lift, Cabin, Lift Type, and Passenger, but enter a **different** Price (e.g. '9999'). Click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added — a different Price does NOT bypass the duplicate check
    - expect: Form values remain intact after the error

#### 4.3. TC-DUP-ADD-03: Submit exact match of multiselect Type Of Lift + multiselect Passenger — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record with multiple Type Of Lift values and multiple Passenger values — e.g. Type Of Lift: 'Nova Lift, HIGH SPEED LIFT', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'
    - expect: The multi-value record is visible in the table
  2. Select the same set of Type Of Lift values ('Nova Lift', 'HIGH SPEED LIFT'), same Cabin ('SS Mirror'), same Passenger values ('6', '8', '10'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added

#### 4.4. TC-DUP-ADD-04: Submit matching combination of an existing Inactive record with Type Of Lift — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'Inactive', and note an Inactive record that has a non-empty Type Of Lift value — note its Type Of Lift, Cabin, Lift Type, and Passenger values
    - expect: At least one Inactive record with a non-empty Type Of Lift is visible
  2. Set Status filter back to 'Active'. Fill in the same Type Of Lift, Cabin, Lift Type, and Passenger as the Inactive record. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is created — duplicate check applies regardless of the conflicting record's Active/Inactive status

#### 4.5. TC-DUP-ADD-05: Submit with Type Of Lift empty — no duplicate error even if Cabin + Passenger match an existing record

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record where Type Of Lift is blank ('-') — e.g. Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible with '-' in the Type Of Lift column
  2. Leave Type Of Lift **empty**. Select the same Cabin, Lift Type, and Passenger. Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears — no error
    - expect: A new record IS created; when Type Of Lift is empty, the duplicate check does not fire

#### 4.6. TC-DUP-ADD-06: Submit with a single Passenger value that already exists in an active multi-select Passenger record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record with a non-empty Type Of Lift and multiple Passenger values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'
    - expect: The multi-passenger record is visible
  2. Select the same Type Of Lift and Cabin, but add only a **single** Passenger tag that is already present in the existing record (e.g. only '8'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: Form values remain intact after the error

#### 4.7. TC-DUP-ADD-07: Submit with a single Type Of Lift value that already exists in an active multi-select Type Of Lift record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record with multiple Type Of Lift values — e.g. Type Of Lift: 'Nova Lift, HIGH SPEED LIFT', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The multi-Type-Of-Lift record is visible
  2. Select only a **single** Type Of Lift value that is already present in the existing record (e.g. only 'Nova Lift'), same Cabin, Lift Type, and Passenger. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: Form values remain intact after the error

#### 4.8. TC-DUP-ADD-08: Create with a Passenger value not present in any existing active combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record with multiple Passenger values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'
    - expect: The record is visible in the Active list
  2. Select the same Type Of Lift and Cabin, but select a **different** Passenger value that does NOT appear anywhere in that record (e.g. '4'). Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears — no duplicate error
    - expect: The new record is added to the data table

#### 4.9. TC-DUP-ADD-09: Create with multiple Passenger values where one overlaps with an existing active combination — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible in the Active list
  2. Select the same Type Of Lift and Cabin, then add **multiple** Passenger values where **one** of them matches the existing record (e.g. '6' and '8'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added — a single overlapping Passenger value is sufficient to trigger the duplicate check
    - expect: Form values remain intact after the error

#### 4.10. TC-DUP-ADD-10: Create with multiple Passenger values where none overlap with an existing active combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible in the Active list
  2. Select the same Type Of Lift and Cabin, then add **multiple** Passenger values that **none** of them overlap with the existing record (e.g. '4' and '6'). Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears — no duplicate error
    - expect: The new record is added to the data table

#### 4.11. TC-DUP-ADD-11: Create with a Cabin value already present in an active multi-select Cabin record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing record that contains multiple Cabin values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror, Wood Panel', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The multi-cabin record is visible in the Active list
  2. Select the same Type Of Lift, Lift Type, and Passenger. In Select Cabin, choose only a **single** Cabin value that already exists in the multi-select record (e.g. only 'SS Mirror'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: Form values remain intact after the error

#### 4.12. TC-DUP-ADD-12: Create with a new Cabin value not present in any active combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and identify a Cabin value that does not appear in any existing Active record for the chosen Type Of Lift + Passenger combination
    - expect: The chosen Cabin value is not present in any Active record's Cabin column for that combination
  2. Select any Type Of Lift and Passenger (whose combination does not exist with this new Cabin value). Select the new Cabin value. Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears
    - expect: The new record appears in the data table with the new Cabin value

#### 4.13. TC-DUP-ADD-13: Create with a new Type Of Lift value not present in any active combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and identify a Type Of Lift value that does not appear in any existing Active record for the chosen Cabin + Passenger combination
    - expect: The chosen Type Of Lift value is not present in any Active record's Type Of Lift column for that Cabin + Passenger combination
  2. Select the new Type Of Lift value. Select any Cabin and Passenger combination that does not already exist with this Type Of Lift. Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears
    - expect: The new record appears in the data table with the new Type Of Lift value

#### 4.14. TC-DUP-ADD-14: Create partially matching an Inactive record combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'Inactive', and note an Inactive record with a non-empty Type Of Lift and multiple Passenger values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'
    - expect: The Inactive record is visible
  2. Set Status filter back to 'Active'. Select the same Type Of Lift and Cabin as the Inactive record, but choose a **different** Passenger value that is NOT present in the Inactive record's Passenger list (e.g. '4'). Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears — partial match against an Inactive record is not a duplicate
    - expect: The new record is added to the data table

#### 4.15. TC-DUP-ADD-15: Create where Type Of Lift, Cabin, and Passenger values all overlap with existing active multi-select records — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record where all three key fields have multi-select values — e.g. Type Of Lift: 'Nova Lift, HIGH SPEED LIFT', Cabin: 'SS Mirror, Wood Panel', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'
    - expect: The record is visible in the Active list
  2. Fill in a combination where at least one Type Of Lift value, one Cabin value, and one Passenger value each overlap with the existing record (e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Passenger: '8'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: Form values remain intact after the error

#### 4.16. TC-DUP-ADD-16: Create where at least one field value is unique while others overlap — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible
  2. Overlap two of the three key fields with the existing record but use a **unique** value for the third field — e.g. same Type Of Lift ('Nova Lift') and same Cabin ('SS Mirror'), but select a Passenger value that does NOT appear in any existing record for this combination. Enter any Price and click 'Submit'
    - expect: Toast **'Cabin has been created successfully'** appears — a unique value in any key field prevents the duplicate check from firing
    - expect: The new record is added to the data table

#### 4.17. TC-DUP-ADD-17: Create with multiple Type Of Lift values where one overlaps with an existing active combination — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible in the Active list
  2. Select **multiple** Type Of Lift values where **one** of them matches the existing record (e.g. 'Nova Lift' and 'HIGH SPEED LIFT'). Select the same Cabin, Lift Type, and Passenger as the existing record. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added — a single overlapping Type Of Lift value triggers the duplicate check
    - expect: Form values remain intact after the error

#### 4.18. TC-DUP-ADD-18: Create with multiple Cabin values where one overlaps with an existing active combination — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'
    - expect: The record is visible in the Active list
  2. Select **multiple** Cabin values where **one** of them matches the existing record (e.g. 'SS Mirror' and 'Wood Panel'). Select the same Type Of Lift, Lift Type, and Passenger. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added — a single overlapping Cabin value triggers the duplicate check
    - expect: Form values remain intact after the error

### 4B. Duplicate Prevention — UPDATE Records

**Seed:** `tests/setup/auth.setup.ts`

> **Same uniqueness key applies to updates:** When editing a record, changing Cabin + Type Of Lift + Passenger/Capacity to match an existing record triggers the same duplicate error. Price changes alone do not affect the check. When Type Of Lift is cleared to empty, the duplicate check does not fire.

#### 4B.1. TC-DUP-UPD-01: Update Type Of Lift + Cabin + Passenger to exactly match another Active record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin (Status filter: Active) and note an existing record with a non-empty Type Of Lift — e.g. record B: Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'. Click Edit on a **different** record (record A) that has a different combination
    - expect: Form is in 'Update Cabin' mode with record A's values pre-filled
  2. On record A's edit form: change Type Of Lift to 'Nova Lift', change Cabin to 'SS Mirror', keep Lift Type as 'Passenger Lift' (disabled), change Passenger to '8' (matching record B). Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Record A is NOT updated; original values remain in the table
    - expect: Form stays in 'Update Cabin' mode with the entered (conflicting) values

#### 4B.2. TC-DUP-UPD-02: Update to match combination with different Price — duplicate error still fires

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note record B with non-empty Type Of Lift — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8', Price: '5000'. Click Edit on a different record (record A)
    - expect: Form is in Update mode for record A
  2. Change record A's fields to match record B's Type Of Lift + Cabin + Passenger, but keep or change Price to a **different** value (e.g. '9999'). Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: A different Price does NOT bypass the duplicate check; update is blocked

#### 4B.3. TC-DUP-UPD-03: Update to match combination of an existing Inactive record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'Inactive', and note an Inactive record with non-empty Type Of Lift. Note its Type Of Lift + Cabin + Passenger values
    - expect: At least one Inactive record with non-empty Type Of Lift is visible
  2. Set Status filter to 'Active'. Click Edit on an Active record. Change its Type Of Lift, Cabin, and Passenger to match the Inactive record. Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked even when the conflicting record is Inactive

#### 4B.4. TC-DUP-UPD-04: Update multiselect Passenger to exactly match another record's Passenger set — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note record B with non-empty Type Of Lift and multiple Passenger values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'. Click Edit on a record (record A) that has the same Type Of Lift and Cabin but different Passenger values
    - expect: Form is in Update mode for record A
  2. Remove record A's Passenger tags and add the same set as record B ('6', '8', '10'). Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked

#### 4B.5. TC-DUP-UPD-05: Update to a unique Passenger value not present in any existing active combination — succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click Edit on any Active record
    - expect: Form is in 'Update Cabin' mode with the record's values pre-filled
  2. Change the Passenger field to a value that does NOT exist in any other Active record with the same Type Of Lift + Cabin combination. Click 'Update'
    - expect: Toast **'Cabin has been updated successfully!'** appears
    - expect: The table refreshes showing the updated Passenger value in the edited row
    - expect: No duplicate error is triggered

#### 4B.6. TC-DUP-UPD-06: Update using a single value that already exists within an active multi-select record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record with multi-select Passenger values — e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '6, 8, 10'. Click Edit on a **different** Active record that has the same Type Of Lift and Cabin but a different Passenger value
    - expect: Form is in 'Update Cabin' mode with the record's values pre-filled
  2. Change the Passenger field to a **single** value that already appears in the noted multi-select record (e.g. '8'). Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked — a single overlapping Passenger value is sufficient to trigger the duplicate check
    - expect: Form stays in 'Update Cabin' mode with the entered values

### 5. Optional Field Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-OPT-01: Create a record without Type Of Lift and without Speed (both optional)

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Leave Type Of Lift empty. Select a Cabin, Lift Type, and Passenger. Enter Price. Click 'Submit'.
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: The record is created successfully without a Type Of Lift value
    - expect: The new row in the table shows blank or '-' in the Type Of Lift column

#### 5.2. TC-OPT-02: Create a record with Type Of Lift populated — succeeds when no conflicting record exists

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. Select one or more values in the Type Of Lift multi-select. Select Cabin, Lift Type, Passenger with a combination that does not already exist. Enter Price. Click 'Submit'.
    - expect: Toast 'Cabin has been created successfully' appears
    - expect: Type Of Lift value appears in the table row

### 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets the Add form to empty state

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and fill in all fields (Type Of Lift, Select Cabin, Lift Type, Passenger, Price)
    - expect: All fields contain entered values
  2. Click the 'Clear' button
    - expect: Type Of Lift is cleared (no tags)
    - expect: Select Cabin is cleared (no tags)
    - expect: Lift Type reverts to default ('Passenger Lift')
    - expect: Passenger tags are removed
    - expect: Price input is cleared
    - expect: The form heading still reads 'Add Cabin'
    - expect: No toast or error is shown

#### 6.2. TC-CLR-02: Clear button in Edit mode resets form to Add state

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click the Edit icon for any record
    - expect: The form heading changes to 'Update Cabin'
    - expect: All fields are pre-filled with the selected record's values
    - expect: The Status dropdown appears
    - expect: The action button shows 'Update'
  2. Click the 'Clear' button while in Update mode
    - expect: The form heading reverts to 'Add Cabin'
    - expect: All form fields are cleared
    - expect: The Status dropdown is no longer visible
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDT-01: Edit icon opens the record in edit mode with pre-filled values

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click the Edit icon (Action column) on any row
    - expect: The form heading changes from 'Add Cabin' to 'Update Cabin'
    - expect: Select Cabin is pre-filled with the record's cabin values
    - expect: Lift Type is pre-filled but **disabled** (cannot be changed in edit mode)
    - expect: Passenger field shows the existing capacity tags
    - expect: Type Of Lift and Price are pre-filled with their existing values
    - expect: A Status dropdown appears with label 'Status *' and options: 'Active', 'Inactive'
    - expect: The currently set status is pre-selected
    - expect: The action button label changes to 'Update'

#### 7.2. TC-EDT-02: Successfully update Price

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click Edit on any record
    - expect: Form is in Update mode
  2. Change the Price to a new value (e.g. '9999'). Click 'Update'.
    - expect: A success toast notification appears with message 'Cabin has been updated successfully!'
    - expect: The form resets to 'Add Cabin' state
    - expect: The data table refreshes showing the updated Price in the edited row

#### 7.3. TC-EDT-03: Update record status to Inactive

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click Edit on any Active record. Select 'Inactive' from the Status dropdown and click 'Update'.
    - expect: A success toast 'Cabin has been updated successfully!' is displayed
    - expect: When Status filter is set to 'All', the edited record shows an 'Inactive' badge in the Status column

#### 7.4. TC-EDT-04: Update with empty Price shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, click Edit on any record, then clear the Price field and click 'Update'
    - expect: Inline validation error appears for the Price field
    - expect: No API update call is made
    - expect: The form remains in Update mode

#### 7.5. TC-EDT-05: Update with empty Passenger shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, click Edit on any record, remove all tags from the Passenger field and click 'Update'
    - expect: Inline validation error appears for the Passenger field
    - expect: No update is saved
    - expect: The form remains in Update mode

#### 7.6. TC-EDT-06: Update with empty Select Cabin shows validation error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, click Edit on any record, remove all tags from the Select Cabin field and click 'Update'
    - expect: Inline validation error appears for the Select Cabin field
    - expect: No update is saved
    - expect: The form remains in Update mode

#### 7.7. TC-EDT-07: Verify Lift Type is disabled in edit mode

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click Edit on any record. Attempt to interact with the Lift Type dropdown.
    - expect: The Lift Type dropdown is disabled and cannot be changed
    - expect: The existing Lift Type value remains displayed

#### 7.8. TC-EDT-08: Update Type Of Lift + Cabin + Passenger to match an existing Active record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and note an existing Active record with a non-empty Type Of Lift value (e.g. Type Of Lift: 'Nova Lift', Cabin: 'SS Mirror', Lift Type: 'Passenger Lift', Passenger: '8'). Click Edit on a **different** Active record.
    - expect: Form is in 'Update Cabin' mode
  2. Change the Type Of Lift, Cabin, and Passenger to exactly match the noted record's values. Click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, lift type, and passenger/capacity combination already exists.'** appears
    - expect: The record is NOT updated; original values remain in the table

#### 7.9. TC-EDT-09: Update Type Of Lift + Cabin + Passenger to match an existing Inactive record — shows duplicate error

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'Inactive', note an Inactive record's combination. Set Status filter to 'Active'. Click Edit on an Active record. Change its Type Of Lift, Cabin, and Passenger to match the Inactive record and click 'Update'
    - expect: Toast error **'A record with the same cabin, type of lift, lift type, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked even when the conflicting record is Inactive

#### 7.10. TC-EDT-10: Verify Type Of Lift is optional in Update mode — clearing it and saving succeeds

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click Edit on any Active record that has a non-empty Type Of Lift value
    - expect: Form is in 'Update Cabin' mode with Type Of Lift pre-filled with the existing value(s)
  2. Remove all Type Of Lift tags (clear the field to empty). Leave all other fields (Cabin, Passenger, Price) unchanged. Click 'Update'
    - expect: Toast **'Cabin has been updated successfully!'** appears — Type Of Lift is optional and can be removed during an update
    - expect: The updated record shows '-' (empty) in the Type Of Lift column
    - expect: No validation error is triggered for the empty Type Of Lift field

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin
    - expect: The Status filter dropdown defaults to 'Active'
    - expect: The table shows only records with 'Active' status badge
    - expect: No 'Inactive' rows are displayed

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and change the Status filter to 'All'
    - expect: The table refreshes to display both Active and Inactive records
    - expect: Inactive records (if any) are shown alongside Active ones

#### 8.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and change the Status filter to 'Inactive'
    - expect: Only Inactive records are shown, OR an empty state message is shown if none exist

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial value returns matching results

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin. In the search box, type a partial value that matches an existing record (e.g. part of a cabin name)
    - expect: The table filters to show only matching records
    - expect: Non-matching rows are hidden

#### 9.2. TC-SRC-02: Search with a non-existent value returns no results

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and type 'XYZNONEXISTENT999' in the search box
    - expect: The table shows no rows or an empty state message

#### 9.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, type a partial value to filter the table
    - expect: Table is filtered to show matching records
  2. Clear the search input completely
    - expect: The table restores to show all Active records (matching the current Status filter)

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin (default shows 25 rows per page) and change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 10.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Show to '10', and verify multiple pages exist. Click the 'Next page' button.
    - expect: The table advances to page 2
    - expect: The 'Previous page' button becomes enabled
  2. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort table by Price column

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click the 'Price' column header
    - expect: The table re-sorts by price in ascending order
    - expect: The sort icon on the Price column indicates ascending sort
  2. Click the 'Price' column header again
    - expect: The sort order reverses to descending
    - expect: The sort icon updates to indicate descending sort

#### 11.2. TC-SRT-02: Sort table by Lift Type column

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin and click the 'Lift Type' column header
    - expect: The table re-sorts by Lift Type (grouping Passenger Lift and Goods Lift records)
    - expect: The sort icon on the Lift Type column updates

#### 11.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'All', then click the 'Status' column header
    - expect: Records are sorted by status (Active / Inactive)
    - expect: The sort icon on Status column updates

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active record as Inactive and verify filter behavior

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin (Status filter: Active). Note the combination of a visible record. Click Edit on that record, change Status to 'Inactive', and click 'Update'.
    - expect: A success toast 'Cabin has been updated successfully!' is displayed
  2. Verify with Status filter 'Active'
    - expect: The record no longer appears in the Active-filtered table
  3. Change Status filter to 'Inactive'
    - expect: The record now appears with an 'Inactive' badge in the Status column

#### 12.2. TC-INA-02: Re-activate an Inactive record

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Navigate to /forms/cabin, set Status filter to 'Inactive', click Edit on an Inactive record, change Status to 'Active', and click 'Update'.
    - expect: A success toast 'Cabin has been updated successfully!' is displayed
  2. Change the Status filter back to 'Active'
    - expect: The previously Inactive record now appears in the Active list with an 'Active' badge

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Cabin Form Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/forms/cabin-form
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Cabin Form Master page content is not shown

#### 13.2. TC-NAV-02: Access Cabin Form Master requires sales_forms module permission

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Log in as an admin user whose company does NOT have the 'sales_forms' module enabled and navigate to https://stage.elevatorplus.net/forms/cabin-form
    - expect: The user is redirected to the 'not authorized' page (/not-authorized)
    - expect: The Cabin Form Master page content is not shown

#### 13.3. TC-NAV-03: Access Cabin Form Master via Sales Forms menu navigation

**File:** `tests/Sales-forms/cabin-form-master.spec.ts`

**Steps:**
  1. Log in as an admin user with 'sales_forms' module enabled and click the 'Sales Forms' section in the left sidebar
    - expect: The sidebar expands to show sub-items including 'Cabin' or similar label
  2. Click on the 'Cabin' menu item
    - expect: The page navigates to /forms/cabin
    - expect: The page heading 'Add Cabin' is visible
    - expect: The data table with existing records is displayed
