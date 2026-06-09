# Machine Form - Test Plan

## Application Overview

The Machine Form page is part of the ElevatorPlus Sales Masters section. It allows administrators to manage machine configuration records used in elevator sales. The page includes a form to add/update machine records and a searchable, filterable data table with status management (Active/Inactive).

The form contains nine fields:
1. **Type of Lift** — multi-select dropdown, **optional**
2. **Machine Type** — single-select dropdown, **mandatory**
3. **Motor Name** — multi-select dropdown, **mandatory**
4. **Floors** — multi-select dropdown, **mandatory**
5. **Lift Type** — single-select dropdown, **mandatory**
6. **Passenger** — multi-select dropdown, **mandatory**
7. **Speed** — multi-select dropdown, **mandatory**
8. **Number of Ropes** — numeric input field, **mandatory** (accepts 0, rejects negatives and non-numeric)
9. **Machine Price** — numeric input field, **mandatory** (accepts 0, rejects negatives and non-numeric)

**Uniqueness rule:** The combination of Type of Lift + Machine Type + Motor Name + Floors + Lift Type + Passenger + Speed must be unique across all records (active and inactive).

The data table toolbar includes: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), an "Update Price" button, and a search input. Pagination controls appear below the table.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-MF-001: Verify Machine Form page loads successfully

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to Machine Form from the left sidebar.
    - expect: Machine Form page loads correctly with the form visible and all nine fields (Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed, Number of Ropes, Machine Price) visible.
    - expect: The data table is displayed below the form.
    - expect: The Clear and Submit buttons are both visible.

#### 1.2. TC-MF-002: Verify page title is "machine form"

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Observe the page/form title displayed at the top.
    - expect: The page title reads "machine form" (case as displayed in the application).

#### 1.3. TC-MF-003: Verify sub-title reads "add machine form details"

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Observe the sub-title or form heading below the page title.
    - expect: The sub-title reads "add machine form details" (case as displayed in the application).

### 2. Mandatory Field Validation — Empty Fields

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-MF-004: Verify validation messages appear for all mandatory fields when form is submitted empty

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Leave all fields empty (do not select or fill anything).
  3. Click the Submit button.
    - expect: Validation error messages appear for all 8 mandatory fields: Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed, Number of Ropes, and Machine Price.
    - expect: No validation error appears for Type of Lift (it is optional).
    - expect: No record is created in the data table.
    - expect: The form remains in Add mode and is not reset.

#### 2.2. TC-MF-005: Verify validation message for Machine Type when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Machine Type. Leave Machine Type unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Machine Type field.
    - expect: No record is created.

#### 2.3. TC-MF-006: Verify validation message for Motor Name when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Motor Name. Leave Motor Name unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Motor Name field.
    - expect: No record is created.

#### 2.4. TC-MF-007: Verify validation message for Floors when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Floors. Leave Floors unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Floors field.
    - expect: No record is created.

#### 2.5. TC-MF-008: Verify validation message for Lift Type when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Lift Type. Leave Lift Type unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Lift Type field.
    - expect: No record is created.

#### 2.6. TC-MF-009: Verify validation message for Passenger when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Passenger. Leave Passenger unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Passenger field.
    - expect: No record is created.

#### 2.7. TC-MF-010: Verify validation message for Speed when left unselected

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Speed. Leave Speed unselected.
  3. Click the Submit button.
    - expect: A validation error message appears below the Speed field.
    - expect: No record is created.

#### 2.8. TC-MF-011: Verify validation message for Number of Ropes when left empty

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Number of Ropes. Leave Number of Ropes blank.
  3. Click the Submit button.
    - expect: A validation error message appears below the Number of Ropes field.
    - expect: No record is created.

#### 2.9. TC-MF-012: Verify validation message for Machine Price when left empty

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields except Machine Price. Leave Machine Price blank.
  3. Click the Submit button.
    - expect: A validation error message appears below the Machine Price field.
    - expect: No record is created.

### 3. Mandatory Field Validation — Whitespace Input

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-MF-013: Verify Number of Ropes field rejects whitespace-only input

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields with valid selections.
  3. Type only spaces (e.g., '   ') in the Number of Ropes input field.
  4. Leave Machine Price empty or fill it with a valid value.
  5. Click the Submit button.
    - expect: A validation error message appears below the Number of Ropes field (whitespace-only is treated as empty or invalid).
    - expect: No record is created.

#### 3.2. TC-MF-014: Verify Machine Price field rejects whitespace-only input

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields with valid selections.
  3. Enter a valid value in Number of Ropes.
  4. Type only spaces (e.g., '   ') in the Machine Price input field.
  5. Click the Submit button.
    - expect: A validation error message appears below the Machine Price field.
    - expect: No record is created.

### 4. Numeric Field Validation — Number of Ropes and Machine Price

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-MF-015: Verify Number of Ropes rejects alphabetic characters

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields with valid selections and enter a valid Machine Price.
  3. Type alphabetic characters (e.g., 'abc') in the Number of Ropes field.
  4. Click the Submit button.
    - expect: The Number of Ropes field either rejects the non-numeric keystrokes entirely, or shows a validation error indicating only numeric values are accepted.
    - expect: No record is created.

#### 4.2. TC-MF-016: Verify Machine Price rejects alphabetic characters

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields and enter a valid Number of Ropes.
  3. Type alphabetic characters (e.g., 'abc') in the Machine Price field.
  4. Click the Submit button.
    - expect: The Machine Price field either rejects non-numeric keystrokes, or shows a validation error indicating only numeric values are accepted.
    - expect: No record is created.

#### 4.3. TC-MF-017: Verify Number of Ropes rejects negative values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields with valid selections and enter a valid Machine Price.
  3. Type a negative value (e.g., '-3') in the Number of Ropes field.
  4. Click the Submit button.
    - expect: A validation error message appears below the Number of Ropes field indicating negative values are not permitted.
    - expect: No record is created.

#### 4.4. TC-MF-018: Verify Machine Price rejects negative values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory dropdown fields and enter a valid Number of Ropes.
  3. Type a negative value (e.g., '-500') in the Machine Price field.
  4. Click the Submit button.
    - expect: A validation error message appears below the Machine Price field indicating negative values are not permitted.
    - expect: No record is created.

#### 4.5. TC-MF-019: Verify Number of Ropes accepts zero (0)

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields and enter a valid Machine Price.
  3. Type '0' in the Number of Ropes field.
  4. Click the Submit button.
    - expect: No validation error appears for the Number of Ropes field — zero is a valid value.
    - expect: The record is created successfully.

#### 4.6. TC-MF-020: Verify Machine Price accepts zero (0)

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Fill all mandatory fields and enter a valid Number of Ropes.
  3. Type '0' in the Machine Price field.
  4. Click the Submit button.
    - expect: No validation error appears for the Machine Price field — zero is a valid value.
    - expect: The record is created successfully.

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-MF-021: Verify Clear button resets the Add form

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Select values in all dropdown fields and type values in Number of Ropes and Machine Price.
  3. Click the Clear button.
    - expect: All dropdown fields are deselected/reset to their default empty/placeholder state.
    - expect: Number of Ropes and Machine Price input fields are cleared.
    - expect: No record is created.
    - expect: The form heading remains in Add mode.
    - expect: The data table is not affected.

#### 5.2. TC-MF-022: Verify Clear button clears validation error messages

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Click the Submit button without filling any fields to trigger validation errors.
    - expect: Validation error messages appear for all mandatory fields.
  3. Click the Clear button.
    - expect: All validation error messages disappear.
    - expect: All fields are reset to their default empty/unselected state.

#### 5.3. TC-MF-023: Verify Clear button in Edit/Update mode resets form to Add mode

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click the Edit (pencil icon) button on an existing record in the data table.
    - expect: The form switches to Update mode with all fields pre-populated including the Status field.
  2. Click the Clear button.
    - expect: The form reverts to Add mode with all fields cleared/deselected.
    - expect: The Status dropdown (only visible in edit mode) is no longer shown.
    - expect: No changes are saved to the original record.

### 6. Submit Button — Add Record Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-MF-024: Add record with all fields using single values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Select exactly one value from the Type of Lift multi-select dropdown (e.g., a single lift type option).
  3. Select one value from the Machine Type single-select dropdown.
  4. Select exactly one value from the Motor Name multi-select dropdown.
  5. Select exactly one value from the Floors multi-select dropdown.
  6. Select one value from the Lift Type single-select dropdown.
  7. Select exactly one value from the Passenger multi-select dropdown.
  8. Select exactly one value from the Speed multi-select dropdown.
  9. Enter a valid integer (e.g., '4') in the Number of Ropes field.
  10. Enter a valid numeric price (e.g., '50000') in the Machine Price field.
  11. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: All form fields are reset to their default empty/unselected state.
    - expect: The new machine record appears in the data table with the correct values and Status 'Active'.

#### 6.2. TC-MF-025: Add record with multi-select values for all multi-select fields

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Select multiple values from the Type of Lift multi-select dropdown (e.g., 2 or more options).
  3. Select one value from the Machine Type single-select dropdown.
  4. Select multiple values from the Motor Name multi-select dropdown (e.g., 2 or more options).
  5. Select multiple values from the Floors multi-select dropdown (e.g., 2 or more floor options).
  6. Select one value from the Lift Type single-select dropdown.
  7. Select multiple values from the Passenger multi-select dropdown (e.g., 2 or more options).
  8. Select multiple values from the Speed multi-select dropdown (e.g., 2 or more options).
  9. Enter a valid integer (e.g., '6') in Number of Ropes.
  10. Enter a valid numeric price (e.g., '75000') in Machine Price.
  11. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: All form fields reset to empty/unselected state.
    - expect: The new machine record with multi-value selections appears in the data table with Status 'Active'.

#### 6.3. TC-MF-026: Add record with only mandatory fields (skip optional Type of Lift)

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Leave the Type of Lift field unselected (it is optional).
  3. Select one value from Machine Type (mandatory).
  4. Select one or more values from Motor Name (mandatory).
  5. Select one or more values from Floors (mandatory).
  6. Select one value from Lift Type (mandatory).
  7. Select one or more values from Passenger (mandatory).
  8. Select one or more values from Speed (mandatory).
  9. Enter a valid value (e.g., '3') in Number of Ropes (mandatory).
  10. Enter a valid value (e.g., '30000') in Machine Price (mandatory).
  11. Click the Submit button.
    - expect: No validation error appears for Type of Lift.
    - expect: A success toast notification is shown.
    - expect: The new record is created with an empty or blank Type of Lift value and appears in the data table with Status 'Active'.

### 7. Uniqueness Validation — Add Record (Duplicate Combinations)

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-MF-027: Adding exact same combination with multiple values shows duplicate error

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Select multiple values in Type of Lift, a Machine Type, multiple Motor Names, multiple Floors, a Lift Type, multiple Passengers, multiple Speeds. Enter valid Number of Ropes and Machine Price. Click Submit.
    - expect: First record is created successfully.
  3. In the form, re-select the exact same combination: same Type of Lift values, same Machine Type, same Motor Name values, same Floors values, same Lift Type, same Passenger values, same Speed values. Enter any Number of Ropes and Machine Price. Click Submit.
    - expect: The system displays a duplicate entry error message.
    - expect: No new record is created in the data table.

#### 7.2. TC-MF-028: Adding a single-value combination that already exists as an active record shows error

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Identify an existing active record in the data table. Note its exact combination of Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, and Speed values.
  2. In the Add form, select the same exact combination of values as the existing active record. Enter any valid Number of Ropes and Machine Price. Click Submit.
    - expect: The system displays a duplicate entry error message indicating the combination already exists.
    - expect: No new record is created.

#### 7.3. TC-MF-029: Adding a unique multi-select combination creates a new record successfully

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Select a combination of Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, and Speed values that does NOT match any existing record (use different values or a different number of selected options). Enter valid Number of Ropes and Machine Price.
  3. Click the Submit button.
    - expect: A success toast notification is shown.
    - expect: The new record appears in the data table.
    - expect: No duplicate error is shown.

#### 7.4. TC-MF-030: Attempt to add two new combinations where one matches an existing active record — only the duplicate fails

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Note two distinct sets of combinations to submit:
     - Combination A: a fully unique combination not matching any existing record.
     - Combination B: a combination that exactly matches an existing active record.
  2. Submit Combination A first (select its values, click Submit).
    - expect: Combination A is created successfully (success toast shown, record appears in table).
  3. Submit Combination B (select its values, click Submit).
    - expect: The system displays a duplicate entry error message.
    - expect: No new record is created for Combination B.
    - expect: Combination A record remains in the table.

#### 7.5. TC-MF-031: Attempt to add two new combinations where one matches an existing inactive record — duplicate still blocked

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Use the Status filter to view Inactive records. Identify the combination (Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed) of an existing inactive record. Note it as Combination X.
  2. Note a second completely unique combination as Combination Y that does not exist in active or inactive records.
  3. Switch Status filter back to Active. Submit Combination Y.
    - expect: Combination Y is created successfully.
  4. In the form, select the same values as the inactive record (Combination X). Enter valid Number of Ropes and Machine Price. Click Submit.
    - expect: The system displays a duplicate/error message — the combination matches an existing inactive record and is still blocked.
    - expect: No new record is created for Combination X.

### 8. Edit / Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-MF-032: Verify Edit functionality opens form with pre-populated values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and locate an existing record in the data table.
  2. Click the Edit (pencil icon) button on the record.
    - expect: The form switches to Update mode.
    - expect: All nine fields are pre-populated with the existing record's values.
    - expect: A Status dropdown (Active/Inactive) becomes visible in the form.
    - expect: The Submit button label changes to Update (or similar).

#### 8.2. TC-MF-033: Successfully update an existing machine record with valid new values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click Edit on an existing record.
    - expect: Update form opens with current values pre-filled.
  2. Modify one or more fields (e.g., change Number of Ropes, or change one of the multi-select values) to new valid values.
  3. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode with all fields cleared.
    - expect: The updated values are reflected in the data table for that record.

#### 8.3. TC-MF-034: Updating a record to match another existing active combination shows error

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Identify two distinct active records — Record A and Record B. Note the exact combination (Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed) of Record A.
  2. Click Edit on Record B to open it in Update mode.
    - expect: Update form opens with Record B's current values.
  3. Change Record B's dropdown selections to exactly match Record A's combination (Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed). Click the Update button.
    - expect: The system displays a duplicate entry error message.
    - expect: Record B is not updated. Its original values remain unchanged in the data table.
    - expect: The form remains in Update mode and is not reset.

#### 8.4. TC-MF-035: Updating a record to match an existing inactive combination shows error

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Change the Status filter to 'Inactive'. Note the exact combination of an existing inactive record (Combination Z).
  2. Change the Status filter back to 'Active'. Click Edit on any active record to open it in Update mode.
    - expect: Update form opens with the active record's values.
  3. Change the dropdown selections to match Combination Z (the inactive record's combination). Click the Update button.
    - expect: The system displays a duplicate/error message — the combination matches an existing inactive record.
    - expect: The active record is not updated. Its original values remain in the data table.
    - expect: The form remains in Update mode.

#### 8.5. TC-MF-036: Updating a record with its own same combination does not show duplicate error

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click Edit on an existing active record.
    - expect: Update form opens with the record's current values pre-filled.
  2. Without changing any of the uniqueness-determining dropdown fields (Type of Lift, Machine Type, Motor Name, Floors, Lift Type, Passenger, Speed), only modify Number of Ropes or Machine Price.
  3. Click the Update button.
    - expect: The record is updated successfully with a success toast notification.
    - expect: No duplicate error is shown (the system does not treat a record as a duplicate of itself).

#### 8.6. TC-MF-037: Verify Clear button in Update mode discards changes and reverts to Add mode

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click Edit on an existing record to open Update mode.
    - expect: Update form is visible with all fields pre-populated.
  2. Modify one or more fields.
  3. Click the Clear button.
    - expect: The form reverts to Add mode with all fields cleared/deselected.
    - expect: The Status dropdown is hidden.
    - expect: No changes are saved to the database. The original record remains unchanged in the data table.

#### 8.7. TC-MF-038: Verify mandatory field validation on Update form when fields are cleared

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click Edit on an existing record.
    - expect: Update form opens with all fields pre-populated.
  2. Deselect all values from one or more mandatory dropdown fields (e.g., Motor Name, Floors) and clear Number of Ropes and Machine Price.
  3. Click the Update button.
    - expect: Validation error messages appear for the mandatory fields that were cleared.
    - expect: The record is not updated. The form remains in Update mode.

#### 8.8. TC-MF-039: Verify two unique update combinations — one matching existing active, one matching existing inactive both blocked

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to Machine Form. Identify two existing records (one active, one inactive) with known combinations. Note them as Combo-Active and Combo-Inactive.
  2. Click Edit on a third distinct active record (Record C).
  3. Change Record C's combination to exactly match Combo-Active. Click Update.
    - expect: Duplicate error is shown. Record C is not updated.
  4. Without clicking Clear, change Record C's combination to exactly match Combo-Inactive. Click Update.
    - expect: Duplicate error is shown again. Record C is still not updated.
  5. Click Clear.
    - expect: Form reverts to Add mode. Record C remains unchanged.

### 9. Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-MF-040: Mark an Active machine record as Inactive via Edit

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page with the default Active filter applied. Note the combination details of the first record (e.g., Record X).
  2. Click the Edit icon for Record X.
    - expect: Update form opens with Status showing 'Active'.
  3. Change the Status dropdown from 'Active' to 'Inactive'. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode.
  4. Verify the Active-filtered table.
    - expect: Record X is no longer visible in the Active filter view.
  5. Change the Status filter to 'Inactive'.
    - expect: Record X now appears in the Inactive-filtered table with 'Inactive' status.

#### 9.2. TC-MF-041: Re-activate an Inactive machine record via Edit

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Change the Status filter to 'Inactive'. Click Edit on an Inactive record.
    - expect: Update form opens with Status showing 'Inactive'.
  2. Change the Status dropdown from 'Inactive' to 'Active'. Click the Update button.
    - expect: A success toast notification is shown.
    - expect: The form resets to Add mode.
  3. Change the Status filter back to 'Active'.
    - expect: The previously Inactive record now appears in the Active list with 'Active' status.

#### 9.3. TC-MF-042: Verify default Active filter is applied on page load

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Observe the Status filter dropdown in the data table toolbar without making any changes.
    - expect: The Status filter defaults to 'Active'.
    - expect: Only active machine records are displayed in the data table.

#### 9.4. TC-MF-043: Verify Active, Inactive, and All status filter options work correctly

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Ensure both active and inactive records exist.
  2. Select 'Active' from the Status filter dropdown.
    - expect: Only records with Active status are displayed.
  3. Select 'Inactive' from the Status filter dropdown.
    - expect: Only records with Inactive status are displayed. If no inactive records exist, an empty state message is shown.
  4. Select 'All' from the Status filter dropdown.
    - expect: Both Active and Inactive records are displayed together.

### 10. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-MF-044: Verify search filters the data table in real time

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Type a partial or full search term in the search input field that matches one or more existing records.
    - expect: The data table filters dynamically and displays only the matching records.
    - expect: Non-matching records are hidden.
  3. Clear the search field.
    - expect: The data table returns to showing all records matching the current Status filter.

#### 10.2. TC-MF-045: Verify search with no matching results shows empty state

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Type a search term that does not match any machine record (e.g., 'XYZNOTEXIST99999') in the search field.
    - expect: The data table shows an empty state or 'No records found' message. No data rows are displayed.

### 11. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-MF-046: Verify rows-per-page dropdown changes the number of displayed rows

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Locate the 'Show:' dropdown in the data table toolbar. Note the default value is '25'.
  2. Change the Show dropdown to '10'.
    - expect: The data table updates to show at most 10 records per page.
    - expect: Pagination controls appear if there are more than 10 total records.
  3. Change the Show dropdown to '50'.
    - expect: The data table updates to show at most 50 records per page.
  4. Change the Show dropdown to '100'.
    - expect: The data table updates to show at most 100 records per page.

#### 11.2. TC-MF-047: Verify pagination controls navigate between pages correctly

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page. Set the Show dropdown to '10'. Verify there are multiple pages of records.
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

#### 12.1. TC-MF-048: Verify Update Price button opens the bulk price update modal

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page.
  2. Click the 'Update Price' button in the data table toolbar.
    - expect: A modal dialog opens for bulk price update. The modal lists machine records with their current prices and editable 'New Price' input fields.

#### 12.2. TC-MF-049: Verify bulk price update with valid new price values

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Enter a valid new price (e.g., '99999') in the New Price input for one or more records in the modal.
  3. Click the Submit/Update button in the modal.
    - expect: The prices for the selected records are updated successfully.
    - expect: The modal closes.
    - expect: The updated prices are reflected in the data table.

#### 12.3. TC-MF-050: Verify Cancel/Close button closes the Update Price modal without saving

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click 'Update Price'.
    - expect: Bulk price update modal opens.
  2. Enter new price values for one or more records in the modal.
  3. Click the Cancel button (or the X close button) in the modal.
    - expect: The modal closes without saving any changes.
    - expect: The prices in the data table remain unchanged.

#### 12.4. TC-MF-051: Verify search within the Update Price modal filters records

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Navigate to the Machine Form page and click 'Update Price'.
    - expect: Bulk price update modal opens with the full list of machine records.
  2. Type a search term in the search field within the modal.
    - expect: The modal table filters to show only matching records, making it easier to locate specific machines for price update.

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-MF-052: Unauthenticated access to Machine Form URL redirects to login

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to the Machine Form URL.
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login.
    - expect: The Machine Form page content (form and table) is not shown.

#### 13.2. TC-MF-053: Access Machine Form via sidebar navigation

**File:** `tests/Sales-master/machine-form.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on the relevant menu section (e.g., Sales Masters) in the left sidebar.
    - expect: The sub-menu expands to show available master pages.
  2. Click the 'Machine Form' link in the sub-menu.
    - expect: The Machine Form page loads correctly.
    - expect: The form title and sub-title are visible.
    - expect: The data table with existing records is displayed.
