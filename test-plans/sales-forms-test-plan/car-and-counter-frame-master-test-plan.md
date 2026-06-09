# Car and Counter Frame Master Test Plan

## Application Overview

The Car and Counter Frame Master page is part of the ElevatorPlus Sales Forms section, accessible at /forms/car-counter (sidebar: Sales Forms > Car And Car Counter Frame). It requires the "Automatic Calculation for Quotation" module to be enabled (Settings > App Settings > Module Settings). It allows admin users to manage car and counter frame records used in elevator quotation cost estimation. The page is a standard master form layout with two sections: (1) an "Add Car And Counter Frame" form at the top containing six fields — "Type Of Lift" (optional multi-select dropdown, helper: "Select the type of lift"), "Type of Machine *" (mandatory multi-select dropdown, helper: "Select the machine type", options: Hydraulic / Geared / Screw Driven / Rack and Pinion), "Lift Type *" (mandatory single-select combobox, helper: "Select the lift type", options: Passenger Lift / Goods Lift, default: Passenger Lift), "Passenger *" (mandatory multi-select tag dropdown, helper: "Select passenger or capacity"), "Speed" (optional multi-select dropdown, helper: "Select the speed"), and "Price *" (mandatory numeric spinbutton, helper: "Enter the price") — along with "Clear" and "Submit" buttons and a note "⚠ Note: Changes in this master will impact quotation cost estimation."; (2) a data table below listing all car and counter frame records with columns: Sr. No., Action (Edit icon), Type Of Lift, Type of Machine, Lift Type, Passengers/Capacity, Speed, Price, Status. The table includes filtering by Status (All / Active / Inactive, default: Active), a rows-per-page selector (10 / 25 / 50 / 100, default: 25), an "Update Price" button, an "Import Excel" button, an "Export Excel" button, and a "Search Passengers/Capacity" search box. Clicking the Edit icon on a row switches the form header to "Update Car And Counter Frame", pre-fills all fields, exposes a Status dropdown (Select Status / Active / Inactive), disables the Lift Type combobox (cannot be changed in edit mode), and changes the action button label to "Update". Clicking "Clear" in either mode resets the form to the blank "Add Car And Counter Frame" state. Successful creation toast: **"Car Counter has been created successfully"**. Successful update toast: **"Car Counter has been updated successfully!"**. Duplicate error toast: **"A record with the same machine, type of lift, and passenger/capacity combination already exists."** — this fires when the combination of **Type of Machine + Type Of Lift + Lift Type + Passenger/Capacity** matches an existing record (Active or Inactive). Key facts confirmed by live testing: (a) Speed is NOT part of the uniqueness key; (b) records with empty Type Of Lift bypass the duplicate check; (c) the form does NOT reset after a duplicate error — field values are preserved; (d) the duplicate check covers both Active and Inactive records; (e) Lift Type (Passenger Lift / Goods Lift) is part of the uniqueness key — the same Machine + Type Of Lift + Passenger combination with different Lift Types are treated as distinct records.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Car and Counter Frame Master page loads successfully

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/forms/car-counter
    - expect: The page URL should be https://stage.elevatorplus.net/forms/car-counter
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Car And Counter Frame' card heading should be visible
    - expect: The Type of Lift multi-select dropdown field should be present
    - expect: The Type of Machine single-select dropdown field (mandatory) should be present
    - expect: The Lift Type single-select dropdown field (mandatory) should be present with default option 'Passenger Lift'
    - expect: The Passenger multi-select tag input field (mandatory) should be present
    - expect: The Speed multi-select dropdown field should be present
    - expect: The Price numeric input field (mandatory) should be present and empty
    - expect: The note '⚠ Note: Changes in this master will impact quotation cost estimation.' should be visible
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display car and counter frame records

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to the Car and Counter Frame Master page at /forms/car-counter
    - expect: The form section heading should read 'Add Car And Counter Frame'
    - expect: An info icon button should be present next to the heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Update Price' button should be present
    - expect: An 'Import Excel' button should be present
    - expect: An 'Export Excel' button should be present
    - expect: A 'Search Passengers/Capacity' search box should be present
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Type Of Lift, Type of Machine, Lift Type, Passengers/Capacity, Speed, Price, Status
    - expect: Sortable columns should display sort icons

### 2. Add Record - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new record with only mandatory fields (Passenger Lift, no optional fields)

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter
    - expect: The 'Add Car And Counter Frame' form is displayed with empty fields
  2. Leave Type of Lift empty (optional field). Select a value from the Type of Machine dropdown (e.g. 'Gearless'). Confirm Lift Type is set to 'Passenger Lift' (default). Select a passenger value from the Passenger multi-select (e.g. '8'). Leave Speed empty (optional field). Enter '5000' in the Price field.
    - expect: Type of Machine shows the selected value
    - expect: Lift Type shows 'Passenger Lift'
    - expect: Passenger field shows '8' tag
    - expect: Price field shows '5000'
  3. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Car Counter has been created successfully'
    - expect: The form fields are cleared and reset to empty
    - expect: The form heading remains 'Add Car And Counter Frame'
    - expect: The newly created record appears in the data table with correct values and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a record for Goods Lift with mandatory fields

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, select a Type of Machine (e.g. 'Geared'), select 'Goods Lift' from the Lift Type dropdown, select a passenger/capacity value (e.g. '816 kg'), and enter Price '3500'
    - expect: 'Goods Lift' is selected in the Lift Type dropdown
    - expect: The capacity tag is added to the Passenger field
    - expect: Price shows '3500'
  2. Click 'Submit'
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: The new record appears in the table showing 'Goods Lift' in the Lift Type column

#### 2.3. TC-ADD-03: Successfully create a record with all optional fields populated

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and select one or more values in the Type of Lift multi-select (e.g. 'Passenger Lift'). Select a Type of Machine (e.g. 'Gearless'). Confirm Lift Type is 'Passenger Lift'. Select multiple Passenger values (e.g. '8', '13'). Select one or more Speed values (e.g. '1.0 m/s'). Enter Price '7500'.
    - expect: Type of Lift shows selected tags
    - expect: Type of Machine shows selected value
    - expect: Lift Type shows 'Passenger Lift'
    - expect: Passenger shows '8', '13' tags
    - expect: Speed shows selected tag(s)
    - expect: Price shows '7500'
  2. Click 'Submit'
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: All field values including optional fields appear correctly in the data table

#### 2.4. TC-ADD-04: Successfully create a record with multiple Passenger values

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, select a Type of Machine, keep Lift Type as 'Passenger Lift', and add multiple passenger tags (e.g. '4', '6', '8'). Enter Price '4000'.
    - expect: Three tags '4', '6', '8' appear in the Passenger field
  2. Click 'Submit'
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: The new record shows all passenger values in the Passengers/Capacity column

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Type of Machine shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Leave Type of Machine unselected. Fill in all other mandatory fields (Lift Type, Passenger, Price). Click 'Submit'.
    - expect: A validation error appears for the Type of Machine field (e.g. 'Please select machine type' or 'Select machine type')
    - expect: No API call is made to create a record
    - expect: No new record is added to the data table

#### 3.2. TC-VAL-02: Submit form with empty Lift Type shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Select a Type of Machine. Leave Lift Type unselected (if possible). Select Passenger and enter Price. Click 'Submit'.
    - expect: A validation error appears for the Lift Type field
    - expect: No record is created

#### 3.3. TC-VAL-03: Submit form with empty Passenger shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Select a Type of Machine and Lift Type. Leave Passenger field empty (no tags). Enter Price '5000'. Click 'Submit'.
    - expect: A validation error appears for the Passenger field (e.g. 'Please select passenger')
    - expect: No record is created

#### 3.4. TC-VAL-04: Submit form with empty Price shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Select a Type of Machine, Lift Type, and Passenger. Leave Price empty. Click 'Submit'.
    - expect: A validation error appears for the Price field (e.g. 'Please enter price.')
    - expect: No record is created

#### 3.5. TC-VAL-05: Submit completely empty form shows validation errors on all mandatory fields

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Submit' without filling any fields
    - expect: Validation errors appear for Type of Machine, Passenger, and Price at minimum
    - expect: No API call is made
    - expect: No record is created

#### 3.6. TC-VAL-06: Validation errors clear when valid input is entered after a failed submit

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Submit' without filling any fields to trigger all validation errors
    - expect: Validation error messages are shown for required fields
  2. Fill in all mandatory fields (Type of Machine, Lift Type, Passenger, Price) with valid values
    - expect: Validation error messages disappear as each field is filled
  3. Click 'Submit'
    - expect: Toast 'Car Counter has been created successfully' appears

### 4. Duplicate Prevention — ADD Records

**Seed:** `tests/setup/auth.setup.ts`

> **Uniqueness key (verified by live testing):** The server enforces uniqueness on the **four-field combination: Type of Machine + Type Of Lift + Lift Type + Passenger/Capacity**. Speed is NOT part of the key. Records where Type Of Lift is empty ("-") bypass the duplicate check entirely. The form preserves its field values after a duplicate error (does not reset). The duplicate check applies to both Active and Inactive records. The same Machine + Type Of Lift + Passenger combination but with different Lift Type (e.g. Passenger Lift vs Goods Lift) is treated as a distinct record and does NOT trigger a duplicate error.

#### 4.1. TC-DUP-ADD-01: Submit exact match of Type Of Lift + Machine Type + Lift Type + Passenger matching an existing Active record — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter (Status filter: Active) and locate an existing record with a non-empty Type Of Lift value — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'
    - expect: The record is visible in the Active list with a non-empty Type Of Lift column
  2. Select the same Type Of Lift value ('shrisha'), the same Type of Machine ('Geared'), keep Lift Type as 'Passenger Lift', select the same Passenger value ('6'). Speed can be any value or empty. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added to the data table
    - expect: The form is NOT reset — all field values remain filled so the user can correct the entry

#### 4.2. TC-DUP-ADD-02: Submit same Type Of Lift + Machine + Lift Type + Passenger with different Speed — duplicate error still fires (Speed is not in uniqueness key)

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and locate an existing record with a non-empty Type Of Lift — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6', Speed: '0.4'
    - expect: The record is visible
  2. Select the same Type Of Lift, Type of Machine, Lift Type, and Passenger, but select a **different** Speed (e.g. '0.5' instead of '0.4'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added — the different Speed does NOT bypass the duplicate check
    - expect: Form values remain intact after the error

#### 4.3. TC-DUP-ADD-03: Submit exact match of multiselect Type Of Lift + Machine + Lift Type + multiselect Passenger — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and locate an existing record with multiple Type Of Lift values and multiple Passenger values — e.g. Type Of Lift: 'HIGH SPEED LIFT, Nova Lift, Neha lift', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6, 4, 8, 10'
    - expect: The multi-value record is visible in the table
  2. Select the same set of Type Of Lift values ('HIGH SPEED LIFT', 'Nova Lift', 'Neha lift'), same Type of Machine ('Geared'), same Lift Type, same Passenger values ('6', '4', '8', '10'). Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is added

#### 4.4. TC-DUP-ADD-04: Submit exact match of Type Of Lift + Machine + Lift Type + Passenger of an existing Inactive record — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Status filter to 'Inactive', and locate an Inactive record with a non-empty Type Of Lift value. Note its Type Of Lift, Type of Machine, Lift Type, and Passenger values
    - expect: At least one Inactive record with a non-empty Type Of Lift is visible
  2. Set Status filter back to 'Active'. Fill in the same Type Of Lift, Type of Machine, Lift Type, and Passenger as the Inactive record. Enter any Price and click 'Submit'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: No new record is created — duplicate check applies regardless of the conflicting record's Active/Inactive status

#### 4.5. TC-DUP-ADD-05: Submit with Type Of Lift empty — no duplicate error even if Machine + Passenger match an existing record

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and note an existing record where Type Of Lift is blank ('-') — e.g. Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'
    - expect: The record is visible with '-' in the Type Of Lift column
  2. Leave Type Of Lift **empty**. Select the same Type of Machine, Lift Type, and Passenger. Enter any Price and click 'Submit'
    - expect: Toast **'Car Counter has been created successfully'** appears — no error
    - expect: A new record IS created; when Type Of Lift is empty, the duplicate check does not fire

#### 4.6. TC-DUP-ADD-06: Submit partial overlap of multiselect Passenger — subset of existing multi-passenger record — no duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and locate an existing record with a non-empty Type Of Lift and multiple Passenger values — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6, 4, 8, 10'
    - expect: The multi-passenger record is visible
  2. Select the same Type Of Lift and Type of Machine, but add only a **single** Passenger tag that is a subset of the existing record's values (e.g. only '8'). Enter any Price and click 'Submit'
    - expect: Toast **'Car Counter has been created successfully'** appears — no error
    - expect: A new record IS created; partial Passenger overlap does not trigger the duplicate check

#### 4.7. TC-DUP-ADD-07: Submit partial overlap of multiselect Type Of Lift — only some values matching — no duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and locate an existing record with multiple Type Of Lift values — e.g. Type Of Lift: 'HIGH SPEED LIFT, Nova Lift, Neha lift', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6, 4, 8, 10'
    - expect: The record is visible
  2. Select only a **subset** of the Type Of Lift values (e.g. only 'Nova Lift'), same Type of Machine, Lift Type, and Passenger. Enter any Price and click 'Submit'
    - expect: Toast **'Car Counter has been created successfully'** appears — no error
    - expect: A new record IS created; a partial subset of Type Of Lift values is treated as a different combination

#### 4.8. TC-DUP-ADD-08: Submit same Type Of Lift + Machine + Passenger but different Lift Type — no duplicate error (Lift Type is part of the key)

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and locate an existing record with a non-empty Type Of Lift and Passenger Lift — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'
    - expect: The record is visible in the table with Lift Type = 'Passenger Lift'
  2. Select the same Type Of Lift ('shrisha'), same Type of Machine ('Geared'), same Passenger ('6'), but select **'Goods Lift'** as the Lift Type (different from the existing record's 'Passenger Lift'). Enter any Price and click 'Submit'
    - expect: Toast **'Car Counter has been created successfully'** appears — no error
    - expect: A new record IS created; different Lift Type makes it a distinct combination even though the other three fields match

### 4B. Duplicate Prevention — UPDATE Records

**Seed:** `tests/setup/auth.setup.ts`

> **Same uniqueness key applies to updates:** When editing a record, changing Type of Machine + Type Of Lift + Lift Type + Passenger/Capacity to match an existing record triggers the same duplicate error. Speed changes alone do not affect the check. Note: Lift Type is disabled in edit mode, so it cannot be changed — this means Lift Type is fixed per record and only the other three fields (Type of Machine, Type Of Lift, Passenger/Capacity) can be tested for update duplicate scenarios.

#### 4B.1. TC-DUP-UPD-01: Update Type Of Lift + Machine Type + Passenger to exactly match another Active record (same Lift Type) — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter (Status filter: Active) and note an existing record with a non-empty Type Of Lift — e.g. record B: Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'. Click Edit on a **different** record (record A) that has a different combination
    - expect: Form is in 'Update Car And Counter Frame' mode with record A's values pre-filled
  2. On record A's edit form: change Type Of Lift to 'shrisha', change Type of Machine to 'Geared', keep Lift Type as 'Passenger Lift', change Passenger to '6' (matching record B). Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Record A is NOT updated; original values remain in the table
    - expect: Form stays in 'Update Car And Counter Frame' mode with the entered (conflicting) values

#### 4B.2. TC-DUP-UPD-02: Update to match combination with different Speed — duplicate error still fires

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and note record B with non-empty Type Of Lift — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6', Speed: '0.4'. Click Edit on a different record (record A)
    - expect: Form is in Update mode for record A
  2. Change record A's fields to match record B's Type Of Lift + Machine + Passenger, but set Speed to a **different** value (e.g. '1.0'). Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: The different Speed does NOT bypass the duplicate check; update is blocked

#### 4B.3. TC-DUP-UPD-03: Update to match combination of an existing Inactive record — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Status filter to 'Inactive', and note an Inactive record with non-empty Type Of Lift. Note its Type Of Lift + Type of Machine + Passenger values
    - expect: At least one Inactive record with non-empty Type Of Lift is visible
  2. Set Status filter to 'Active'. Click Edit on an Active record. Change its Type Of Lift, Type of Machine, and Passenger to match the Inactive record. Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked even when the conflicting record is Inactive

#### 4B.4. TC-DUP-UPD-04: Update — clear Type Of Lift to empty while keeping same Machine + Passenger as another empty-Type-Of-Lift record — no error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and note a record where Type Of Lift is '-' (empty) — e.g. Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'. Click Edit on a different record that currently has a Type Of Lift value
    - expect: Form is in Update mode with Type Of Lift pre-filled
  2. Remove all Type Of Lift tags (clear the field to empty). Keep the same Type of Machine and Passenger. Click 'Update'
    - expect: Toast **'Car Counter has been updated successfully!'** appears — no error
    - expect: When Type Of Lift is cleared to empty, the duplicate check does not fire

#### 4B.5. TC-DUP-UPD-05: Update multiselect Passenger to exactly match another record's Passenger set — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and note record B with non-empty Type Of Lift and multiple Passenger values — e.g. Type Of Lift: 'HIGH SPEED LIFT, Nova Lift, Neha lift', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6, 4, 8, 10'. Click Edit on a record (record A) that has the same Type Of Lift and Machine but different Passenger values
    - expect: Form is in Update mode for record A
  2. Remove record A's Passenger tags and add the same set as record B ('6', '4', '8', '10'). Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked

### 5. Optional Fields Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-OPT-01: Create a record without Type of Lift and without Speed (both optional)

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Leave Type of Lift empty. Select a Type of Machine. Select Lift Type 'Passenger Lift'. Select a Passenger value. Leave Speed empty. Enter Price '4500'. Click 'Submit'.
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: The record is created successfully without optional field values
    - expect: The new row in the table shows blank or empty values in the Type of Lift and Speed columns

#### 5.2. TC-OPT-02: Create a record with Type of Lift populated but Speed empty

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Select one or more values in the Type of Lift dropdown. Select a Type of Machine and Lift Type. Add a Passenger value. Leave Speed empty. Enter Price. Click 'Submit'.
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: Type of Lift value appears in the table row; Speed column is blank

#### 5.3. TC-OPT-03: Create a record with Speed populated but Type of Lift empty

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. Leave Type of Lift empty. Select a Type of Machine and Lift Type. Add a Passenger value. Select one or more Speed values. Enter Price. Click 'Submit'.
    - expect: Toast 'Car Counter has been created successfully' appears
    - expect: Speed value appears in the table row; Type of Lift column is blank

### 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets the Add form to empty state

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and fill in all fields (Type of Lift, Type of Machine, Lift Type, Passenger, Speed, Price)
    - expect: All fields contain entered values
  2. Click the 'Clear' button
    - expect: Type of Lift is cleared (no tags or selections)
    - expect: Type of Machine is cleared
    - expect: Lift Type reverts to default ('Passenger Lift')
    - expect: Passenger tags are removed
    - expect: Speed is cleared
    - expect: Price input is cleared
    - expect: The form heading still reads 'Add Car And Counter Frame'
    - expect: No toast or error is shown

#### 6.2. TC-CLR-02: Clear button in Edit mode resets form to Add state

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click the Edit icon for any record
    - expect: The form heading changes to 'Update Car And Counter Frame'
    - expect: All fields are pre-filled with the selected record's values
    - expect: The Status dropdown appears
    - expect: The action button shows 'Update'
  2. Click the 'Clear' button while in Update mode
    - expect: The form heading reverts to 'Add Car And Counter Frame'
    - expect: All form fields are cleared
    - expect: The Status dropdown is no longer visible
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDT-01: Edit icon opens the record in edit mode with pre-filled values

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click the Edit icon (Action column) on any row
    - expect: The form heading changes from 'Add Car And Counter Frame' to 'Update Car And Counter Frame'
    - expect: Type of Machine is pre-filled with the record's value
    - expect: Lift Type is pre-filled but disabled (cannot be changed in edit mode)
    - expect: Passenger field shows the existing capacity tags
    - expect: Type of Lift, Speed, and Price are pre-filled
    - expect: A Status dropdown appears with label 'Status *' and options: 'Active', 'Inactive'
    - expect: The currently set status is pre-selected
    - expect: The action button label changes to 'Update'

#### 7.2. TC-EDT-02: Successfully update Price and Passenger values

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click Edit on any record
    - expect: Form is in Update mode
  2. Change the Price to a new value (e.g. '9999'). Optionally add an additional Passenger tag. Click 'Update'.
    - expect: A success toast notification appears (message 'Car Counter has been updated successfully!')
    - expect: The form resets to 'Add Car And Counter Frame' state
    - expect: The data table refreshes showing the updated values in the edited row

#### 7.3. TC-EDT-03: Update record status to Inactive

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click Edit on any Active record. Select 'Inactive' from the Status dropdown and click 'Update'.
    - expect: A success toast 'Car Counter has been updated successfully!' is displayed
    - expect: When Status filter is set to 'All', the edited record shows 'Inactive' badge in the Status column

#### 7.4. TC-EDT-04: Update with empty Price shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, click Edit on any record, then clear the Price field and click 'Update'
    - expect: Inline validation error appears for the Price field
    - expect: No API update call is made
    - expect: The form remains in Update mode

#### 7.5. TC-EDT-05: Update with empty Passenger shows validation error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, click Edit on any record, remove all tags from the Passenger field and click 'Update'
    - expect: Inline validation error appears for the Passenger field
    - expect: No update is saved
    - expect: The form remains in Update mode

#### 7.6. TC-EDT-06: Verify Lift Type is disabled in edit mode

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click Edit on any record. Attempt to interact with the Lift Type dropdown.
    - expect: The Lift Type dropdown is disabled and cannot be changed
    - expect: The existing Lift Type value remains displayed

#### 7.7. TC-EDT-07: Update Type Of Lift + Machine + Passenger to match an existing Active record — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and note an existing Active record with a non-empty Type Of Lift — e.g. Type Of Lift: 'shrisha', Type of Machine: 'Geared', Lift Type: 'Passenger Lift', Passenger: '6'. Click Edit on a **different** Active record
    - expect: Form is in 'Update Car And Counter Frame' mode
  2. Change Type Of Lift to 'shrisha', Type of Machine to 'Geared', keep Lift Type as 'Passenger Lift', change Passenger to '6' (matching the noted record). Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Record is NOT updated; original values remain in the table

#### 7.8. TC-EDT-08: Update Type Of Lift + Machine + Passenger to match an existing Inactive record — shows duplicate error

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Status filter to 'Inactive', and note an Inactive record with non-empty Type Of Lift. Note its Type Of Lift + Type of Machine + Passenger. Set Status filter to 'Active'. Click Edit on an Active record. Change its Type Of Lift, Type of Machine, and Passenger to match the Inactive record. Click 'Update'
    - expect: Toast error **'A record with the same machine, type of lift, and passenger/capacity combination already exists.'** appears
    - expect: Update is blocked even when the conflicting record is Inactive

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter
    - expect: The Status filter dropdown defaults to 'Active'
    - expect: The table shows only records with 'Active' status badge
    - expect: No 'Inactive' rows are displayed

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and change the Status filter to 'All'
    - expect: The table refreshes to display both Active and Inactive records
    - expect: Inactive records (if any) are shown alongside Active ones

#### 8.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and change the Status filter to 'Inactive'
    - expect: Only Inactive records are shown, OR an empty state message is shown if none exist

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial value returns matching results

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter. In the search box, type a partial value that matches an existing record (e.g. part of a machine type name)
    - expect: The table filters to show only matching records
    - expect: Non-matching rows are hidden

#### 9.2. TC-SRC-02: Search with a non-existent value returns no results

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and type 'XYZNONEXISTENT999' in the search box
    - expect: The table shows no rows or an empty state message

#### 9.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, type a partial value to filter the table
    - expect: Table is filtered to show matching records
  2. Clear the search input completely
    - expect: The table restores to show all Active records (matching the current Status filter)

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter (default shows 25 rows per page) and change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 10.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Show to '10', and verify multiple pages exist. Click the 'Next page' button.
    - expect: The table advances to page 2
    - expect: The 'Previous page' button becomes enabled
  2. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort table by Price column

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click the 'Price' column header
    - expect: The table re-sorts by price in ascending order
    - expect: The sort icon on the Price column indicates ascending sort
  2. Click the 'Price' column header again
    - expect: The sort order reverses to descending
    - expect: The sort icon updates to indicate descending sort

#### 11.2. TC-SRT-02: Sort table by Lift Type column

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click the 'Lift Type' column header
    - expect: The table re-sorts by Lift Type (grouping Passenger Lift and Goods Lift records)
    - expect: The sort icon on the Lift Type column updates

#### 11.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Status filter to 'All', then click the 'Status' column header
    - expect: Records are sorted by status (Active / Inactive)
    - expect: The sort icon on Status column updates

### 12. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-UPP-01: Update Price modal opens with correct title

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click the 'Update Price' button
    - expect: A modal opens
    - expect: The modal title reads 'Bulk Update Car And Counter Frame Prices' or similar
    - expect: The modal lists car and counter frame records with editable price fields

#### 12.2. TC-UPP-02: Update price for a record and verify updated price in data table

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Update Price'. In the modal, locate a record and change its price to a new value (e.g. '12000'). Click the save/update button in the modal.
    - expect: Success feedback appears (toast or inline confirmation)
    - expect: The modal closes or the list refreshes
  2. Verify in the main data table
    - expect: The updated record now shows the new price '12000' in the Price column

#### 12.3. TC-UPP-03: Search functionality in Update Price modal filters records

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Update Price'. In the modal's search field, type a partial search term.
    - expect: The list in the modal filters to show only matching records
  2. Clear the search input in the modal
    - expect: The full list of records is restored in the modal

#### 12.4. TC-UPP-04: Cancel button in Update Price modal closes without saving

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Update Price'. Change a price value in the modal, then click the 'Cancel' button.
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

#### 12.5. TC-UPP-05: Close (X) button in Update Price modal closes without saving

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter and click 'Update Price'. Change a price value in the modal, then click the close icon (X) at the top of the modal.
    - expect: The modal closes
    - expect: The original price is preserved in the data table (no change was saved)

### 13. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-INA-01: Mark an Active record as Inactive and verify filter behavior

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter (Status filter: Active). Note the combination of a visible record. Click Edit on that record, change Status to 'Inactive', and click 'Update'.
    - expect: A success toast 'Car Counter has been updated successfully!' is displayed
  2. Verify with Status filter 'Active'
    - expect: The record no longer appears in the Active-filtered table
  3. Change Status filter to 'Inactive'
    - expect: The record now appears with an 'Inactive' badge in the Status column

#### 13.2. TC-INA-02: Re-activate an Inactive record

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Navigate to /forms/car-counter, set Status filter to 'Inactive', click Edit on an Inactive record, change Status to 'Active', and click 'Update'.
    - expect: A success toast 'Car Counter has been updated successfully!' is displayed
  2. Change the Status filter back to 'Active'
    - expect: The previously Inactive record now appears in the Active list with an 'Active' badge

### 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-NAV-01: Access Car and Counter Frame Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/forms/car-counter
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Car and Counter Frame Master page content is not shown

#### 14.2. TC-NAV-02: Access Car and Counter Frame Master requires sales_forms module permission

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Log in as an admin user whose company does NOT have the 'sales_forms' module enabled and navigate to https://stage.elevatorplus.net/forms/car-counter
    - expect: The user is redirected to the 'not authorized' page (/not-authorized)
    - expect: The Car and Counter Frame Master page content is not shown

#### 14.3. TC-NAV-03: Access Car and Counter Frame Master via Sales Form Master menu navigation

**File:** `tests/Sales-forms/car-counter-frame-master.spec.ts`

**Steps:**
  1. Log in as an admin user with 'sales_forms' module enabled and click the 'Sales Masters' or 'Sales Form Master' section in the left sidebar
    - expect: The sidebar expands to show sub-items including 'Car and Counter Frame Master' or similar label
  2. Click on the 'Car and Counter Frame Master' menu item
    - expect: The page navigates to /forms/car-counter
    - expect: The page heading 'Add Car And Counter Frame' is visible
    - expect: The data table with existing records is displayed
