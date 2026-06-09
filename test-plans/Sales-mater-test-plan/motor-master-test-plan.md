# Motor Master - Test Plan

## Application Overview

This test plan covers the Motor Master module in the ElevatorPlus application. The module allows administrators to manage motors associated with machines. The page is accessible after login and includes a form to add/update motor records with two mandatory fields: Machine Name (dropdown) and Motor Name (text input). It also features a searchable and filterable data table with status management (Active/Inactive).

## Test Scenarios

### 1. Motor Master

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-MM-001: Verify Motor Master page loads successfully

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to Motor Master from the left sidebar.
    - expect: Motor Master page loads correctly with the Add Motor form visible, the data table displayed, and both mandatory fields (Machine Name dropdown and Motor Name input) visible in the form.

#### 1.2. TC-MM-002: Verify successful motor creation with valid data

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Select a valid machine from the Machine Name dropdown (e.g., the first available option).
  3. Enter a valid Motor Name (e.g., 'Traction Motor 001') in the Motor Name input field.
  4. Click the Submit button.
    - expect: Motor record is created successfully and appears in the data table with the correct Machine Name and Motor Name displayed. The form resets to its default empty state after successful submission.

#### 1.3. TC-MM-003: Verify form submission fails when Machine Name is not selected

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Leave the Machine Name dropdown unselected.
  3. Enter a valid Motor Name (e.g., 'Hydraulic Motor') in the Motor Name field.
  4. Click the Submit button.
    - expect: A validation error is shown for the Machine Name field. The form is not submitted and no record is created.

#### 1.4. TC-MM-004: Verify form submission fails when Motor Name is empty

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Select a valid machine from the Machine Name dropdown.
  3. Leave the Motor Name field blank.
  4. Click the Submit button.
    - expect: A validation error is shown for the Motor Name field. The form is not submitted and no record is created.

#### 1.5. TC-MM-005: Verify mandatory field validation when all fields are empty

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Leave all mandatory fields (Machine Name, Motor Name) empty.
  3. Click the Submit button.
    - expect: Validation error messages are shown for all mandatory fields simultaneously. The form is not submitted.
  4. Click the Clear button.
    - expect: All validation error messages disappear and all form fields are reset to their default empty/unselected state.

#### 1.6. TC-MM-006: Verify duplicate Motor Name under the same Machine is not allowed

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page. Select a Machine Name and enter Motor Name 'Standard Motor'. Click Submit.
    - expect: First record is created successfully.
  2. In the Add Motor form, select the same Machine Name and enter the same Motor Name 'Standard Motor'. Click Submit.
    - expect: The system displays a duplicate entry error message and prevents saving the second record with the same Machine Name and Motor Name combination.

#### 1.7. TC-MM-008: Verify Edit functionality for an existing motor record

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page and locate an existing record in the data table.
  2. Click the Edit (pencil icon) button on an existing record.
    - expect: The form changes to 'Update Motor' mode with the current values pre-populated including Machine Name, Motor Name, and Status field.
  3. Modify the Motor Name to a new valid value.
  4. Click the Update button.
    - expect: The record is updated with the new Motor Name and the changes are reflected in the data table immediately.

#### 1.9. TC-MM-009: Verify Inactive status functionality via Edit

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page and click Edit on an existing active record.
    - expect: The Update Motor form opens with Status field showing 'Active'.
  2. Change the Status dropdown from 'Active' to 'Inactive' and click the Update button.
    - expect: The record status is changed to Inactive. When the default Active filter is applied, the record is no longer visible. The record appears when the Inactive or All filter is applied.

#### 1.10. TC-MM-010: Verify Edit with duplicate Motor Name under same Machine shows error

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page. Ensure at least two active records exist under the same Machine. Note the Motor Name of the second record.
  2. Click Edit on the first record and change its Motor Name to match the second record's Motor Name under the same Machine. Click the Update button.
    - expect: The system displays a duplicate entry error message and prevents the update. The form remains in Update Motor mode.
  3. Click the Clear button to discard changes.
    - expect: The form reverts to Add Motor mode with all fields cleared. No changes are persisted.

#### 1.11. TC-MM-011: Verify Clear button discards unsaved form data

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Select a Machine Name from the dropdown and enter a Motor Name (e.g., 'Test Clear Motor').
  3. Click the Clear button.
    - expect: All form fields (Machine Name, Motor Name) are cleared/reset to their default empty state. No record is created. The data table remains unchanged.

#### 1.12. TC-MM-012: Verify Clear button on Update form resets to Add form state

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page and click Edit on an existing record.
    - expect: The Update Motor form opens with the record's data pre-filled, including the Status field.
  2. Click the Clear button on the Update form.
    - expect: The form is cleared and reverts to 'Add Motor' mode. All fields are emptied and the Status dropdown (only visible in edit mode) is hidden. No changes are saved to the original record.

#### 1.13. TC-MM-013: Verify data table displays all active records correctly

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Observe the data table with the default Active filter applied.
    - expect: The data table displays all active motor records with all columns visible: Sr. No., Action, Machine Name, Motor Name, and Status.

#### 1.14. TC-MM-014: Verify default Active filter is applied on page load

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Observe the Status filter dropdown in the data table toolbar without changing anything.
    - expect: The Status filter dropdown shows 'Active' as the selected default option. Only active motor records are displayed in the data table.

#### 1.15. TC-MM-015: Verify Active filter functionality in data table

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page. Ensure there are both active and inactive records. Select 'Active' from the Status filter dropdown.
    - expect: Only active motor records are displayed. All displayed records show 'Active' in the Status column.

#### 1.16. TC-MM-016: Verify Inactive filter functionality in data table

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Select 'Inactive' from the Status filter dropdown in the data table toolbar.
    - expect: Only inactive motor records are displayed. All displayed records show 'Inactive' in the Status column. If no inactive records exist, the table shows an empty state message.

#### 1.17. TC-MM-017: Verify All filter functionality in data table

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Select 'All' from the Status filter dropdown in the data table toolbar.
    - expect: Both active and inactive motor records are displayed in the data table. Records with both 'Active' and 'Inactive' statuses are visible.

#### 1.18. TC-MM-018: Verify search functionality by Motor Name

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. In the Search field, type a partial or full Motor Name that exists in the list.
    - expect: The data table filters in real time and displays only the records that match the search term. Records not matching the search are hidden.
  3. Clear the search field.
    - expect: The data table returns to showing all records that match the current status filter.

#### 1.19. TC-MM-019: Verify search with no matching results

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Type a search term that does not match any motor record (e.g., 'XYZNOTEXIST99999') in the Search field.
    - expect: The data table shows an empty state or 'No records found' message. No data rows are displayed.

#### 1.20. TC-MM-020: Verify Show entries (rows per page) dropdown functionality

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Locate the 'Show' dropdown in the data table toolbar. Change the number of entries from the default '25' to '10'.
    - expect: The data table updates to show only 10 records per page.
  3. Change the Show dropdown to '50'.
    - expect: The data table updates to show up to 50 records per page.
  4. Change the Show dropdown to '100'.
    - expect: The data table updates to show up to 100 records per page.

#### 1.21. TC-MM-021: Verify Machine Name dropdown opens and displays available options

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page.
  2. Click on the Machine Name dropdown in the Add Motor form.
    - expect: The Machine Name dropdown opens and displays a list of available machines.
  3. Select one of the available machines from the dropdown.
    - expect: The selected machine name is displayed in the dropdown field. The dropdown closes after selection.

#### 1.22. TC-MM-022: Verify inactive motor record is hidden from Active filter and visible in Inactive filter

**File:** `tests/Sales-master/motor-master.spec.ts`

**Steps:**
  1. Navigate to Motor Master page. Edit an existing active record and change its status to 'Inactive'. Click Update.
    - expect: Record is saved as Inactive.
  2. Verify the record is not visible in the data table with the default Active filter applied.
    - expect: The inactivated record is not shown when the Active filter is selected.
  3. Change the Status filter dropdown to 'Inactive'.
    - expect: The data table displays the inactivated record with 'Inactive' status.
