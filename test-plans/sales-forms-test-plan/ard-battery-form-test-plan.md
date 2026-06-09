# ARD Battery Form — Test Plan

## Application Overview

The ARD Battery Form page is part of the ElevatorPlus Sales Forms section. It allows administrators to manage ARD battery configuration records used in elevator sales. The page includes a form to add/update ARD battery records and a searchable, filterable data table with status management (Active/Inactive).

The form contains six fields:
1. **Type of Lift** — multi-select dropdown, **optional**
2. **Type of Machine** — single-select dropdown, **mandatory**
3. **Lift Type** — single-select dropdown, **mandatory**
4. **Passenger** — multi-select dropdown, **mandatory**
5. **Price** — numeric input field, **mandatory** (accepts 0, rejects negatives and non-numeric)
6. **Floors** — multi-select dropdown, **mandatory**

**Page title:** "machine form" (as displayed in the application)
**Sub-title:** "add machine form details" (as displayed in the application)

**Uniqueness rule:** The combination of Type of Lift + Type of Machine + Floors + Lift Type + Passenger must be unique across all records (both Active and Inactive).

The data table toolbar includes: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Update Price" button, and a search input. Pagination controls appear below the table.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-ARD-001: Verify ARD Battery Form page loads successfully

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to the ARD Battery Form from the left sidebar (Sales Forms > ARD Battery).
    - expect: The ARD Battery Form page loads correctly with the form visible.
    - expect: All six fields are visible: Type of Lift, Type of Machine, Lift Type, Passenger, Price, and Floors.
    - expect: The data table is displayed below the form.
    - expect: The Clear and Submit buttons are both visible.

#### 1.2. TC-ARD-002: Verify page title reads "ARD Battery Form"

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Observe the page/form title displayed at the top.
    - expect: The page title reads "ARD Battery Form" (case as displayed in the application).

#### 1.3. TC-ARD-003: Verify sub-title reads "add ARD Battery"

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Observe the sub-title or form heading below the page title.
    - expect: The sub-title reads "add ARD Battery" (case as displayed in the application).

### 2. Mandatory Field Validation — Empty Fields

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ARD-004: Verify validation messages appear for all mandatory fields when form is submitted empty

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Leave all fields empty (do not select or fill anything).
  3. Click the Submit button.
    - expect: Validation error messages appear for all 5 mandatory fields: Type of Machine, Lift Type, Passenger, Price, and Floors.
    - expect: No validation error appears for Type of Lift (it is optional).
    - expect: No record is created in the data table.
    - expect: The form remains in Add mode and is not reset.

#### 2.2. TC-ARD-005: Verify validation message for Type of Machine when left unselected

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory fields except Type of Machine. Leave Type of Machine unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Type of Machine field.
    - expect: No record is created.

#### 2.3. TC-ARD-006: Verify validation message for Lift Type when left unselected

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory fields except Lift Type. Leave Lift Type unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Lift Type field.
    - expect: No record is created.

#### 2.4. TC-ARD-007: Verify validation message for Passenger when left unselected

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory fields except Passenger. Leave Passenger unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Passenger field.
    - expect: No record is created.

#### 2.5. TC-ARD-008: Verify validation message for Price when left empty

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory fields except Price. Leave Price blank.
  3. Click the Submit button.
    - expect: A validation error message appears below the Price field.
    - expect: No record is created.

#### 2.6. TC-ARD-009: Verify validation message for Floors when left unselected

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory fields except Floors. Leave Floors unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Floors field.
    - expect: No record is created.

### 3. Mandatory Field Validation — Whitespace Input

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-ARD-010: Verify Price field rejects whitespace-only input

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory dropdown fields with valid selections (Type of Machine, Lift Type, Passenger, Floors).
  3. Type only spaces (e.g., '   ') in the Price input field.
  4. Click the Submit button.
    - expect: A validation error message appears below the Price field (whitespace-only is treated as empty or invalid).
    - expect: No record is created.

### 4. Price Field Validation — Numeric Constraints

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-ARD-011: Verify Price rejects alphabetic characters

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory dropdown fields with valid selections.
  3. Type alphabetic characters (e.g., 'abc') in the Price field.
  4. Click the Submit button.
    - expect: The Price field either rejects non-numeric keystrokes entirely, or shows a validation error indicating only numeric values are accepted.
    - expect: No record is created.

#### 4.2. TC-ARD-012: Verify Price rejects negative values

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory dropdown fields with valid selections.
  3. Type a negative value (e.g., '-500') in the Price field.
  4. Click the Submit button.
    - expect: A validation error message appears below the Price field indicating negative values are not permitted.
    - expect: No record is created.

#### 4.3. TC-ARD-013: Verify Price accepts zero (0)

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Fill all mandatory dropdown fields with valid selections.
  3. Type '0' in the Price field.
  4. Click the Submit button.
    - expect: No validation error appears for the Price field — zero is a valid value.
    - expect: The record is created successfully.

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-ARD-014: Verify Clear button resets the Add form

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Select values in all dropdown fields and type a value in Price.
  3. Click the Clear button.
    - expect: All dropdown fields are deselected/reset to their default empty/placeholder state.
    - expect: The Price input field is cleared.
    - expect: No record is created.
    - expect: The form heading remains in Add mode.
    - expect: The data table is not affected.

#### 5.2. TC-ARD-015: Verify Clear button clears validation error messages

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Click the Submit button without filling any fields to trigger validation errors.
    - expect: Validation error messages appear for all mandatory fields.
  3. Click the Clear button.
    - expect: All validation error messages disappear.
    - expect: All fields are reset to their default empty/unselected state.

#### 5.3. TC-ARD-016: Verify Clear button in Edit/Update mode resets form to Add mode

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click the Edit (pencil icon) button on an existing record in the data table.
    - expect: The form switches to Update mode with all fields pre-populated including the Status field.
  2. Click the Clear button.
    - expect: The form reverts to Add mode with all fields cleared/deselected.
    - expect: The Status dropdown (only visible in edit mode) is no longer shown.
    - expect: No changes are saved to the original record.

### 6. Submit Button — Add Record Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-ARD-017: Add record with all fields using single values

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Select exactly one value from the Type of Lift multi-select dropdown.
  3. Select one value from the Type of Machine single-select dropdown.
  4. Select one value from the Lift Type single-select dropdown.
  5. Select exactly one value from the Passenger multi-select dropdown.
  6. Enter a valid numeric price (e.g., '50000') in the Price field.
  7. Select exactly one value from the Floors multi-select dropdown.
  8. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: All form fields are reset to their default empty/unselected state.
    - expect: The new ARD battery record appears in the data table with the correct values and Status 'Active'.

#### 6.2. TC-ARD-018: Add record with multi-select values for Type of Lift, Floors, and Passenger

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Select multiple values from the Type of Lift multi-select dropdown (e.g., 2 or more options).
  3. Select one value from the Type of Machine single-select dropdown.
  4. Select one value from the Lift Type single-select dropdown.
  5. Select multiple values from the Passenger multi-select dropdown (e.g., 2 or more options).
  6. Enter a valid numeric price (e.g., '75000') in the Price field.
  7. Select multiple values from the Floors multi-select dropdown (e.g., 2 or more floor options).
  8. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: All form fields reset to empty/unselected state.
    - expect: The new record with multi-value selections appears in the data table with Status 'Active'.

#### 6.3. TC-ARD-019: Add record with only mandatory fields (skip optional Type of Lift)

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Leave the Type of Lift field unselected (it is optional).
  3. Select one value from Type of Machine (mandatory).
  4. Select one value from Lift Type (mandatory).
  5. Select one or more values from Passenger (mandatory).
  6. Enter a valid value (e.g., '30000') in Price (mandatory).
  7. Select one or more values from Floors (mandatory).
  8. Click the Submit button.
    - expect: No validation error appears for Type of Lift.
    - expect: A success toast notification is shown.
    - expect: The new record is created with an empty or blank Type of Lift value and appears in the data table with Status 'Active'.

### 7. Uniqueness Validation — Add Record

**Seed:** `tests/setup/auth.setup.ts`

> **Uniqueness key:** The server enforces uniqueness on the five-field combination: **Type of Lift + Type of Machine + Floors + Lift Type + Passenger**. The duplicate check applies to both Active and Inactive records.

#### 7.1. TC-ARD-020: Adding the exact same combination with multiple values shows duplicate error

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Select multiple values in Type of Lift, one Type of Machine, one Lift Type, multiple Passengers, enter a Price, and select multiple Floors. Click Submit.
    - expect: First record is created successfully (success toast shown, record appears in table).
  3. In the form, re-select the exact same combination: same Type of Lift values, same Type of Machine, same Lift Type, same Passenger values, same Floors values. Enter any Price. Click Submit.
    - expect: The system displays a duplicate entry error message.
    - expect: No new record is created in the data table.

#### 7.2. TC-ARD-021: Adding a single-value combination that matches an existing active record shows error

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Identify an existing active record in the data table. Note its exact combination of Type of Lift, Type of Machine, Floors, Lift Type, and Passenger values.
  2. In the Add form, select the same exact combination of values as the existing active record. Enter any valid Price. Click Submit.
    - expect: The system displays a duplicate entry error message indicating the combination already exists.
    - expect: No new record is created.

#### 7.3. TC-ARD-022: Adding a unique multi-select combination creates a new record successfully

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Select a combination of Type of Lift, Type of Machine, Lift Type, Passenger, Price, and Floors values that does NOT match any existing record (use different values or a different number of selected options).
  3. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: The new record appears in the data table.
    - expect: No duplicate error is shown.

#### 7.4. TC-ARD-023: Submit two combinations where one matches an existing active record — only the duplicate fails

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Identify:
     - Combination A: a fully unique combination not matching any existing record.
     - Combination B: a combination that exactly matches an existing active record.
  2. Submit Combination A (select its values, click Submit).
    - expect: Combination A is created successfully (success toast shown, record appears in table).
  3. Submit Combination B (select its values, enter any Price, click Submit).
    - expect: The system displays a duplicate entry error message.
    - expect: No new record is created for Combination B.
    - expect: Combination A record remains in the table.

#### 7.5. TC-ARD-024: Submit two combinations where one matches an existing inactive record — duplicate still blocked

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Use the Status filter to view Inactive records. Identify the combination (Type of Lift, Type of Machine, Floors, Lift Type, Passenger) of an existing inactive record. Note it as Combination X.
  2. Note a second completely unique combination as Combination Y that does not exist in either active or inactive records.
  3. Switch Status filter back to Active. Submit Combination Y.
    - expect: Combination Y is created successfully (success toast shown).
  4. In the form, select the same values as the inactive record (Combination X). Enter valid Price. Click Submit.
    - expect: The system displays a duplicate/error message — the combination matches an existing inactive record and is still blocked.
    - expect: No new record is created for Combination X.

### 8. Edit / Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-ARD-025: Verify Edit functionality opens form with pre-populated values

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and locate an existing record in the data table.
  2. Click the Edit (pencil icon) button on the record.
    - expect: The form switches to Update mode.
    - expect: All six fields are pre-populated with the existing record's values.
    - expect: A Status dropdown (Active/Inactive) becomes visible in the form.
    - expect: The Submit button label changes to Update (or similar).

#### 8.2. TC-ARD-026: Successfully update an existing ARD battery record with valid new values

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with current values pre-filled.
  2. Modify one or more fields (e.g., change the Price, or change one of the multi-select values) to new valid values that form a unique combination.
  3. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode with all fields cleared.
    - expect: The updated values are reflected in the data table for that record.

#### 8.3. TC-ARD-027: Updating a record to match another existing active combination shows error

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Identify two distinct active records — Record A and Record B. Note the exact combination (Type of Lift, Type of Machine, Floors, Lift Type, Passenger) of Record A.
  2. Click Edit on Record B to open it in Update mode.
    - expect: Update form opens with Record B's current values.
  3. Change Record B's dropdown selections to exactly match Record A's combination (Type of Lift, Type of Machine, Floors, Lift Type, Passenger). Click the Update button.
    - expect: The system displays a duplicate entry error message.
    - expect: Record B is not updated. Its original values remain unchanged in the data table.
    - expect: The form remains in Update mode and is not reset.

#### 8.4. TC-ARD-028: Updating a record to match an existing inactive combination shows error

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Change the Status filter to 'Inactive'. Note the exact combination of an existing inactive record (Combination Z).
  2. Change the Status filter back to 'Active'. Click Edit on any active record to open it in Update mode.
    - expect: Update form opens with the active record's values.
  3. Change the dropdown selections to match Combination Z (the inactive record's combination). Click the Update button.
    - expect: The system displays a duplicate/error message — the combination matches an existing inactive record.
    - expect: The active record is not updated. Its original values remain in the data table.
    - expect: The form remains in Update mode.

#### 8.5. TC-ARD-029: Updating a record with its own same combination does not show duplicate error

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing active record.
    - expect: Update form opens with the record's current values pre-filled.
  2. Without changing any of the uniqueness-determining dropdown fields (Type of Lift, Type of Machine, Floors, Lift Type, Passenger), only modify Price.
  3. Click the Update button.
    - expect: The record is updated successfully with a success toast notification.
    - expect: No duplicate error is shown (the system does not treat a record as a duplicate of itself).

#### 8.6. TC-ARD-030: Verify Clear button in Update mode discards changes and reverts to Add mode

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record to open Update mode.
    - expect: Update form is visible with all fields pre-populated.
  2. Modify one or more fields.
  3. Click the Clear button.
    - expect: The form reverts to Add mode with all fields cleared/deselected.
    - expect: The Status dropdown is hidden.
    - expect: No changes are saved to the database. The original record remains unchanged in the data table.

#### 8.7. TC-ARD-031: Verify mandatory field validation on Update form when fields are cleared

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect all values from one or more mandatory dropdown fields (e.g., Floors, Passenger) and clear the Price field.
  3. Click the Update button.
    - expect: Validation error messages appear for the mandatory fields that were cleared.
    - expect: The record is not updated. The form remains in Update mode.

#### 8.8. TC-ARD-032: Two unique update combinations — one matching existing active, one matching existing inactive — both blocked

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Identify one existing active record and one existing inactive record with known combinations. Note them as Combo-Active and Combo-Inactive.
  2. Click Edit on a third distinct active record (Record C).
  3. Change Record C's combination to exactly match Combo-Active. Click Update.
    - expect: Duplicate error is shown. Record C is not updated.
  4. Without clicking Clear, change Record C's combination to exactly match Combo-Inactive. Click Update.
    - expect: Duplicate error is shown again. Record C is still not updated.
  5. Click Clear.
    - expect: Form reverts to Add mode. Record C remains unchanged in the table.

#### 8.9. TC-ARD-047: Verify all mandatory field validation errors appear when Update is submitted with all mandatory fields empty

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect all values from every mandatory dropdown field (Type of Machine, Lift Type, Passenger, Floors) and clear the Price field. Leave Type of Lift as-is (optional).
  3. Click the Update button.
    - expect: Validation error messages appear for all 5 mandatory fields: Type of Machine, Lift Type, Passenger, Price, and Floors.
    - expect: No validation error appears for Type of Lift (it is optional).
    - expect: The record is not updated. The form remains in Update mode.

#### 8.10. TC-ARD-048: Verify validation error for Type of Machine when unselected during Update

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect the Type of Machine field. Leave all other mandatory fields filled with their pre-populated values.
  3. Click the Update button.
    - expect: A validation error message appears below the Type of Machine field.
    - expect: No record is updated. The form remains in Update mode.

#### 8.11. TC-ARD-049: Verify validation error for Lift Type when unselected during Update

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect the Lift Type field. Leave all other mandatory fields filled with their pre-populated values.
  3. Click the Update button.
    - expect: A validation error message appears below the Lift Type field.
    - expect: No record is updated. The form remains in Update mode.

#### 8.12. TC-ARD-050: Verify validation error for Passenger when unselected during Update

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect all values from the Passenger multi-select field. Leave all other mandatory fields filled.
  3. Click the Update button.
    - expect: A validation error message appears below the Passenger field.
    - expect: No record is updated. The form remains in Update mode.

#### 8.13. TC-ARD-051: Verify validation error for Price when cleared during Update

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Clear the Price input field. Leave all other mandatory fields filled with their pre-populated values.
  3. Click the Update button.
    - expect: A validation error message appears below the Price field.
    - expect: No record is updated. The form remains in Update mode.

#### 8.14. TC-ARD-052: Verify validation error for Floors when unselected during Update

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect all values from the Floors multi-select field. Leave all other mandatory fields filled with their pre-populated values.
  3. Click the Update button.
    - expect: A validation error message appears below the Floors field.
    - expect: No record is updated. The form remains in Update mode.

### 9. Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-ARD-033: Mark an Active record as Inactive via Edit

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page with the default Active filter applied. Note the combination details of the first record (Record X).
  2. Click the Edit icon for Record X.
    - expect: Update form opens with Status showing 'Active'.
  3. Change the Status dropdown from 'Active' to 'Inactive'. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode.
  4. Verify the Active-filtered table.
    - expect: Record X is no longer visible in the Active filter view.
  5. Change the Status filter to 'Inactive'.
    - expect: Record X now appears in the Inactive-filtered table with 'Inactive' status.

#### 9.2. TC-ARD-034: Re-activate an Inactive record via Edit

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Change the Status filter to 'Inactive'. Click Edit on an Inactive record.
    - expect: Update form opens with Status showing 'Inactive'.
  2. Change the Status dropdown from 'Inactive' to 'Active'. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode.
  3. Change the Status filter back to 'Active'.
    - expect: The previously Inactive record now appears in the Active list with 'Active' status.

#### 9.3. TC-ARD-035: Verify default Active filter is applied on page load

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Observe the Status filter dropdown in the data table toolbar without making any changes.
    - expect: The Status filter defaults to 'Active'.
    - expect: Only active ARD battery records are displayed in the data table.

#### 9.4. TC-ARD-036: Verify Active, Inactive, and All status filter options work correctly

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Ensure both active and inactive records exist.
  2. Select 'Active' from the Status filter dropdown.
    - expect: Only records with Active status are displayed.
  3. Select 'Inactive' from the Status filter dropdown.
    - expect: Only records with Inactive status are displayed. If no inactive records exist, an empty state message is shown.
  4. Select 'All' from the Status filter dropdown.
    - expect: Both Active and Inactive records are displayed together.

### 10. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-ARD-037: Verify search filters the data table in real time

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Type a partial or full search term in the search input field that matches one or more existing records.
    - expect: The data table filters dynamically and displays only the matching records.
    - expect: Non-matching records are hidden.
  3. Clear the search field.
    - expect: The data table returns to showing all records matching the current Status filter.

#### 10.2. TC-ARD-038: Verify search with no matching results shows empty state

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Type a search term that does not match any ARD battery record (e.g., 'XYZNOTEXIST99999') in the search field.
    - expect: The data table shows an empty state or 'No records found' message. No data rows are displayed.

### 11. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-ARD-039: Verify rows-per-page dropdown changes the number of displayed rows

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Locate the 'Show:' dropdown in the data table toolbar. Note the default value is '25'.
  2. Change the Show dropdown to '10'.
    - expect: The data table updates to show at most 10 records per page.
    - expect: Pagination controls appear if there are more than 10 total records.
  3. Change the Show dropdown to '50'.
    - expect: The data table updates to show at most 50 records per page.
  4. Change the Show dropdown to '100'.
    - expect: The data table updates to show at most 100 records per page.

#### 11.2. TC-ARD-040: Verify pagination controls navigate between pages correctly

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page. Set the Show dropdown to '10'. Verify there are multiple pages of records.
    - expect: Pagination controls (Previous page, page number buttons, Next page) are visible.
    - expect: The Previous page button is disabled on page 1.
  2. Click the Next page button.
    - expect: The table advances to page 2 showing the next set of records.
    - expect: The page 2 button is highlighted as the current page.
    - expect: The Previous page button becomes enabled.
  3. Click the Previous page button.
    - expect: The table returns to page 1.
    - expect: The Previous page button becomes disabled again.

### 12. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-ARD-041: Verify Update Price button opens the bulk price update modal with correct title

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page.
  2. Click the 'Update Price' button in the data table toolbar.
    - expect: A modal dialog opens for bulk price update.
    - expect: The modal title/header is displayed correctly (e.g., 'Bulk Update ARD Battery Prices' or similar as shown in the application).
    - expect: The modal lists ARD battery records with columns showing current configuration details and an editable 'New Price' input field per record.
    - expect: A search input is visible within the modal.
    - expect: Submit/Update and Cancel buttons are visible in the modal.

#### 12.2. TC-ARD-042: Verify bulk price update with valid new price values updates the data table

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Note the current price of a record. Enter a different valid new price (e.g., '99999') in the New Price input for that record.
  3. Click the Submit/Update button in the modal.
    - expect: The prices for the updated records are saved successfully.
    - expect: The modal closes.
    - expect: The updated price is reflected in the data table for the corresponding record.

#### 12.3. TC-ARD-043: Verify Cancel button closes the Update Price modal without saving changes

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Note the current price of a record. Enter a new price value for that record in the modal.
  3. Click the Cancel button in the modal.
    - expect: The modal closes without saving any changes.
    - expect: The original price remains unchanged in the data table.

#### 12.4. TC-ARD-044: Verify close (X) button closes the Update Price modal without saving changes

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Note the current price of a record. Enter a new price value for that record in the modal.
  3. Click the close icon (X) at the top-right corner of the modal.
    - expect: The modal closes without saving any changes.
    - expect: The original price remains unchanged in the data table.

#### 12.5. TC-ARD-053: Verify search within the Update Price modal filters records

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens with the full list of ARD battery records.
  2. Type a partial search term in the modal's search field that matches one or more records.
    - expect: The modal table filters to show only matching records.
    - expect: Non-matching records are hidden.

#### 12.6. TC-ARD-054: Verify clearing the search input in Update Price modal restores full record list

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Type a search term to filter the modal list.
    - expect: The list is filtered.
  3. Clear the search input completely.
    - expect: The full list of ARD battery records is restored in the modal.

#### 12.7. TC-ARD-055: Verify Update Price modal new price field rejects negative values

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. In the New Price input for any record, type a negative value (e.g., '-100').
  3. Click the Submit/Update button in the modal.
    - expect: A validation error appears for the New Price field indicating negative values are not permitted.
    - expect: The price is not updated. The modal remains open.

#### 12.8. TC-ARD-056: Verify Update Price modal new price field rejects alphabetic characters

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. In the New Price input for any record, type alphabetic characters (e.g., 'abc').
  3. Click the Submit/Update button in the modal.
    - expect: The New Price field either rejects non-numeric keystrokes entirely, or shows a validation error indicating only numeric values are accepted.
    - expect: The price is not updated. The modal remains open.

#### 12.9. TC-ARD-057: Verify Update Price modal new price field accepts zero (0)

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Navigate to the ARD Battery Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. In the New Price input for any record, type '0'.
  3. Click the Submit/Update button in the modal.
    - expect: No validation error appears — zero is a valid price.
    - expect: The price is updated to 0 and reflected in the data table after the modal closes.

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-ARD-045: Unauthenticated access to ARD Battery Form URL redirects to login

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to the ARD Battery Form URL.
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login.
    - expect: The ARD Battery Form page content (form and table) is not shown.

#### 13.2. TC-ARD-046: Access ARD Battery Form via sidebar navigation

**File:** `tests/Sales-forms/ard-battery-form.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on the relevant menu section (e.g., Sales Forms) in the left sidebar.
    - expect: The sub-menu expands to show available form pages.
  2. Click the 'ARD Battery' link in the sub-menu.
    - expect: The ARD Battery Form page loads correctly.
    - expect: The form title and sub-title are visible.
    - expect: The data table with existing records is displayed.
