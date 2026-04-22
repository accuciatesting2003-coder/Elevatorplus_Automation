# System Master Test Plan

## Application Overview

System Master is a sub-module under Other Masters in the ElevatorPlus application (https://stage.elevatorplus.net/master/system-master). It manages system records used across the application. The page has two main sections: (1) Add/Update System form with a single field — System Name (text, **required**, accepts numeric values, must be unique), and two action buttons — Submit and Clear; (2) A data table listing all system records with columns: Sr. No., Action (Edit icon), System Name, and Status. The table supports filtering by Status (All/Active/Inactive), pagination size (Show dropdown), and a search box. The form toggles between "Add System" and "Update System" modes. There is no delete functionality — only Edit.

## Test Scenarios

### Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| 1.1 | Add System | Submit form with a valid unique System Name → form resets on success, new row appears in table | Positive |
| 1.2 | Add System | Submit form with a numeric-only System Name → form submits successfully | Positive |
| 1.3 | Add System | Submit form with an alphanumeric System Name → form submits successfully | Positive |
| 1.4 | Add System | Click Clear after filling System Name → field cleared, heading stays "Add System" | Positive |
| 2.1 | Add System Validation | Submit with System Name empty → validation error visible | Negative |
| 2.2 | Add System Validation | Submit duplicate System Name (active record) → error/toast visible, no duplicate row added | Negative |
| 2.3 | Add System Validation | Inactivate an existing record → try to add the same System Name again → error visible | Negative |
| 3.1 | Update System | Edit first row, change System Name → update succeeds, new name visible in table; original restored | Positive |
| 3.2 | Update System | Edit first row, change status to Inactive → record moves to Inactive filter; restored to Active | Positive |
| 3.3 | Update System | Edit first row, modify name, click Clear → form resets to Add mode, table unchanged | Positive |
| 3.4 | Update System | Edit first row, change name to an existing active record's name → duplicate error visible | Negative |
| 3.5 | Update System | Clear System Name in edit form → click Update → validation error, stays on "Update System" | Negative |
| 4.1 | Data Table Verification | Add new system → verify row appears in table with correct System Name and Active status | Positive |
| 4.2 | Data Table Verification | Search by System Name → only matching rows visible; clear search restores all records | Positive |
| 4.3 | Data Table Verification | Search with non-existent term → empty state or "No records found" message | Negative |
| 4.4 | Data Table Verification | Status filter default is "Active" → all visible rows show Active status | Positive |
| 4.5 | Data Table Verification | Switch filter to Inactive → all rows show Inactive status (or empty state) | Positive |
| 4.6 | Data Table Verification | Switch filter to All → both Active and Inactive records are visible | Positive |
| 4.7 | Data Table Verification | Inactivate a record → switch to Inactive filter → record visible; switch to Active → record absent | Positive |
| 4.8 | Data Table Verification | Change page size via Show dropdown: 10 → ≤10 rows; 25 → ≤25 rows; 50 → ≤50 rows | Positive |
| 5.1 | UI and UX | All page elements visible: heading, System Name field, Submit/Clear buttons, table headers, filter/search controls | Positive |
| 5.2 | UI and UX | System Name field accepts text, numbers, and alphanumeric values | Positive |
| 5.3 | UI and UX | Pagination shows Previous/Page 1/Next; Previous is disabled on page 1 | Positive |
| 5.4 | UI and UX | Edit icon present in the Action column of the first table row | Positive |
| 5.5 | UI and UX | Status badge (Active/Inactive) is visible in the Status column of each table row | Positive |

**Total: 25 tests | 5 suites | 19 Positive | 6 Negative**

---

### 1. Add System

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. Add system with a valid unique System Name

**File:** `tests/other-master/system-master/positive/add-system-valid.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Verify the Add System form is visible with heading 'Add System'
  3. Enter a unique system name in the System Name field (e.g., `TestSystem<timestamp>`)
  4. Click the Submit button
  5. Verify a success toast/message is displayed
  6. Verify the form field is cleared/reset after successful submission
  7. Verify the new system row appears in the data table with the correct System Name and Active status

**Expected Results:**
  - Form accepts a valid unique system name
  - Submit triggers the API call
  - Success message/toast is shown
  - Newly added system appears in the data table with the correct System Name
  - Status defaults to Active
  - Form resets after successful submission

#### 1.2. Add system with a numeric-only System Name

**File:** `tests/other-master/system-master/positive/add-system-numeric-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Enter a unique numeric-only value in the System Name field (e.g., `100<timestamp>`)
  3. Click the Submit button
  4. Verify a success toast/message is displayed
  5. Verify the new row appears in the data table with the entered numeric System Name

**Expected Results:**
  - System Name field accepts numeric values
  - Form submits successfully with a numeric-only name
  - New record appears in the table with the correct numeric name

#### 1.3. Add system with an alphanumeric System Name

**File:** `tests/other-master/system-master/positive/add-system-alphanumeric-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Enter a unique alphanumeric value in the System Name field (e.g., `System123<timestamp>`)
  3. Click the Submit button
  4. Verify a success toast/message is displayed
  5. Verify the new row appears in the data table with the entered alphanumeric System Name

**Expected Results:**
  - System Name field accepts alphanumeric input
  - Form submits successfully
  - New record appears in the table with the correct alphanumeric name

#### 1.4. Clear form resets the System Name field

**File:** `tests/other-master/system-master/positive/add-system-clear.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Enter a value in the System Name field (e.g., `ClearTest`)
  3. Click the Clear button
  4. Verify the System Name field is empty/reset
  5. Verify the form heading still reads 'Add System'

**Expected Results:**
  - Clear button empties the System Name field
  - Form heading remains 'Add System'
  - No data is submitted to the server
  - Table remains unchanged

---

### 2. Add System Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. Submit form with empty System Name field

**File:** `tests/other-master/system-master/negative/add-system-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Leave the System Name field empty
  3. Click the Submit button
  4. Verify a validation error is shown for the System Name field

**Expected Results:**
  - Validation error appears for the System Name field
  - Form is not submitted
  - User remains on the same page

#### 2.2. Submit duplicate System Name (active record)

**File:** `tests/other-master/system-master/negative/add-system-duplicate-active.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Note an existing System Name from the Active records in the table (e.g., the first row's name)
  3. Enter the same System Name in the form field
  4. Click the Submit button
  5. Verify an error or warning toast is shown indicating duplicate System Name
  6. Verify no duplicate row is added to the table

**Expected Results:**
  - Error or warning message appears for duplicate System Name
  - Duplicate record is not added to the table
  - System Names must be globally unique

#### 2.3. Inactivate an existing record and try to add the same System Name again

**File:** `tests/other-master/system-master/negative/add-system-duplicate-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Note the System Name of the first Active record in the table
  3. Click the Edit icon for that record
  4. Change the Status dropdown from 'Active' to 'Inactive'
  5. Click the Update button
  6. Verify success toast is displayed
  7. Verify the record no longer appears under the Active filter
  8. In the Add System form, enter the same System Name that was just inactivated
  9. Click the Submit button
  10. Verify an error or warning is shown — the system should not allow adding a duplicate name even if the existing record is inactive
  11. Cleanup: switch to Inactive filter, click Edit on the inactivated record, restore Status to 'Active', click Update

**Expected Results:**
  - Inactivating a record does not free up the System Name for reuse
  - Attempting to add the same name again (whether active or inactive) is blocked with an error
  - The duplicate record is not created

---

### 3. Update System

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. Edit system and update with a new valid System Name

**File:** `tests/other-master/system-master/positive/edit-system-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the data table to load
  3. Note the current System Name of the first row
  4. Click the Edit icon for the first row
  5. Verify the form heading changes to 'Update System'
  6. Verify the System Name field is pre-populated with the row's value
  7. Change the System Name field to a new unique name (e.g., `UpdatedSystem<timestamp>`)
  8. Click the Update button
  9. Verify a success toast/message is displayed
  10. Verify the updated System Name is reflected in the data table
  11. Cleanup: click Edit on the updated row and revert to the original name

**Expected Results:**
  - Clicking Edit populates the form with existing system data
  - Form heading changes to 'Update System'
  - Update button saves the new System Name successfully
  - Success message/toast is displayed
  - Updated name appears in the table
  - Original name is restored after cleanup

#### 3.2. Edit system and change status to Inactive

**File:** `tests/other-master/system-master/positive/edit-system-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Click the Edit icon for an Active record
  4. Verify the Status dropdown is visible and shows 'Active'
  5. Change the Status dropdown to 'Inactive'
  6. Click the Update button
  7. Verify success message is displayed
  8. Verify the record no longer appears under the Active filter
  9. Switch the Status filter to 'Inactive' and confirm the record is visible there
  10. Verify the record does NOT appear when the Active filter is applied
  11. Cleanup: click Edit on the record in Inactive view, set Status back to 'Active', click Update

**Expected Results:**
  - Status dropdown is available in edit/update mode
  - Status can be changed from Active to Inactive
  - Success message is shown after update
  - Record is visible only under the Inactive filter after update
  - Record does not appear in Active filter
  - Record restored to Active after cleanup

#### 3.3. Click Clear in Update mode discards changes

**File:** `tests/other-master/system-master/positive/edit-system-clear.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Click the Edit icon for any system record
  3. Verify the form heading reads 'Update System'
  4. Modify the System Name field to a different value
  5. Click the Clear button
  6. Verify the form resets to 'Add System' mode with an empty System Name field
  7. Verify the table still shows the original unchanged System Name for that row

**Expected Results:**
  - Clear button discards unsaved changes
  - Form resets to 'Add System' heading with the field cleared
  - No changes are persisted to the data table

#### 3.4. Update System Name to match an existing active record's name

**File:** `tests/other-master/system-master/negative/edit-system-duplicate-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load; skip if fewer than 2 rows exist
  3. Note the System Name from the second table row
  4. Click the Edit icon on the first row
  5. Change the System Name field to match the second row's name
  6. Click the Update button
  7. Verify an error/toast message is visible for duplicate System Name
  8. Click Clear to discard changes
  9. Verify the table still shows the original first row name

**Expected Results:**
  - Updating a system with a name that already exists is blocked
  - Error or warning message is visible
  - No changes are persisted to the table

#### 3.5. Submit Update form with empty System Name field

**File:** `tests/other-master/system-master/negative/edit-system-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Click the Edit icon for any system record
  3. Clear the System Name field completely
  4. Click the Update button
  5. Verify a validation error is shown for the System Name field
  6. Verify the form remains in 'Update System' mode

**Expected Results:**
  - Validation error appears for the empty System Name field
  - Update does not proceed
  - User remains in 'Update System' mode

---

### 4. Data Table Verification

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. Verify newly added system record appears correctly in the table

**File:** `tests/other-master/system-master/positive/verify-data-in-table.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Enter a unique system name (e.g., `VerifySystem<timestamp>`)
  3. Click the Submit button
  4. Verify success message is displayed
  5. In the data table, search for the newly added system name
  6. Verify the row appears with:
     - System Name = entered name
     - Status = `Active`
  7. Cleanup: edit the record and set status to Inactive

**Expected Results:**
  - The newly added row must display the System Name exactly as entered
  - Status should default to Active
  - Record is immediately visible in the data table after submission

#### 4.2. Search system by name in the table

**File:** `tests/other-master/system-master/positive/search-system.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Note the System Name from the first visible row
  4. Type that name in the search box
  5. Verify only rows matching the search term are displayed
  6. Clear the search box
  7. Verify all records are restored

**Expected Results:**
  - Search filters table results in real-time or on input
  - Only rows matching the search term are shown
  - Clearing the search restores the full list

#### 4.3. Search with no matching results

**File:** `tests/other-master/system-master/negative/search-no-results.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Type a search term that matches no system name (e.g., `XYZNOTEXIST99999`)
  4. Verify the table shows an empty state or "No records found" message

**Expected Results:**
  - Table shows empty state or "No records found" message
  - No data rows are displayed for an unmatched search term

#### 4.4. Status filter defaults to Active

**File:** `tests/other-master/system-master/positive/filter-status-active-default.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Verify the Status filter is set to 'Active' by default
  4. Verify all visible rows show Active status

**Expected Results:**
  - Default Status filter is 'Active'
  - All displayed rows have Active status

#### 4.5. Filter by Inactive status

**File:** `tests/other-master/system-master/positive/filter-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Change the Status filter to 'Inactive'
  4. Verify only Inactive system records are displayed
  5. If no inactive records exist, verify an empty state is shown

**Expected Results:**
  - Inactive filter shows only Inactive system records
  - All displayed rows show Inactive status
  - Empty state shown if no inactive records exist

#### 4.6. Filter by All status

**File:** `tests/other-master/system-master/positive/filter-status-all.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Change the Status filter to 'All'
  4. Verify that both Active and Inactive records are visible in the table

**Expected Results:**
  - 'All' filter shows every record regardless of status
  - Both Active and Inactive status badges are present among the displayed rows

#### 4.7. Inactivated record appears only in Inactive/All filters, not in Active filter

**File:** `tests/other-master/system-master/positive/inactive-record-filter-visibility.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Note the System Name of the first Active record
  3. Click the Edit icon for that record
  4. Change the Status dropdown to 'Inactive' and click Update
  5. Verify success toast is displayed
  6. Verify the Active filter (default view) does NOT show the inactivated record
  7. Switch the Status filter to 'Inactive' and verify the record IS visible
  8. Switch the Status filter to 'All' and verify the record IS visible with Inactive status
  9. Cleanup: edit the record in Inactive view and restore Status to 'Active'

**Expected Results:**
  - Inactivated record is absent from the Active filter
  - Inactivated record is visible in the Inactive filter
  - Inactivated record is visible in the All filter with Inactive badge
  - Record is restored to Active after cleanup

#### 4.8. Change page size via Show dropdown

**File:** `tests/other-master/system-master/positive/show-filter-page-size.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Note the default page size shown in the Show dropdown
  4. Change the Show dropdown to '10'
  5. Verify at most 10 rows are displayed
  6. Change the Show dropdown to '25'
  7. Verify at most 25 rows are displayed
  8. Change the Show dropdown to '50'
  9. Verify at most 50 rows are displayed

**Expected Results:**
  - Changing the Show dropdown updates the number of visible rows accordingly
  - Pagination controls update to reflect the new page size
  - No data is lost when changing page size

---

### 5. UI and UX

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. Verify System Master page layout and all elements

**File:** `tests/other-master/system-master/ui/page-layout.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Verify the page heading 'System Master' is displayed
  3. Verify the Add System form section is present with heading 'Add System'
  4. Verify the System Name field is visible and accessible
  5. Verify the Submit and Clear buttons are visible and enabled
  6. Verify the data table section is visible below the form
  7. Verify table headers are present: Sr. No., Action, System Name, Status
  8. Verify the Status filter dropdown, Show dropdown, and Search box are present above the table

**Expected Results:**
  - Page heading 'System Master' is visible
  - System Name form field is visible
  - Submit and Clear buttons are visible and clickable
  - Table with correct column headers is displayed
  - Filter controls (Status, Show, Search) are visible above the table

#### 5.2. Verify System Name field accepts text, numbers, and alphanumeric values

**File:** `tests/other-master/system-master/ui/field-type-validation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Click on the System Name field and type alphabetic text (e.g., 'SystemABC')
  3. Verify the field accepts the text input
  4. Clear the field and type a numeric-only value (e.g., '12345')
  5. Verify the field accepts the numeric input
  6. Clear the field and type an alphanumeric value (e.g., 'System123')
  7. Verify the field accepts the alphanumeric input

**Expected Results:**
  - System Name field accepts text, numeric, and alphanumeric input
  - No input restrictions are applied on character type

#### 5.3. Verify table pagination controls

**File:** `tests/other-master/system-master/ui/pagination-controls.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load
  3. Verify pagination controls are visible below the table
  4. Verify the Previous page button is disabled when on page 1
  5. Verify the current page number is highlighted or active
  6. If multiple pages exist, click Next page and verify the page changes
  7. Verify the Next page button is disabled on the last page

**Expected Results:**
  - Pagination is present when records exist
  - Previous button is disabled on page 1
  - Next button is disabled on the last page
  - Current page number is highlighted/active

#### 5.4. Verify Edit icon is present in Action column

**File:** `tests/other-master/system-master/ui/edit-icon-present.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load with at least one record
  3. Verify the Action column of the first row contains an Edit icon (pencil/img)
  4. Hover over the Edit icon and verify a tooltip (e.g., 'Edit') appears if applicable
  5. Click the Edit icon and verify the form switches to 'Update System' mode with the System Name pre-filled

**Expected Results:**
  - Edit icon is visible in the Action column for each row
  - Clicking the icon loads the row's data into the form in Update mode
  - Form heading changes to 'Update System'

#### 5.5. Verify Status badge is visible in each table row

**File:** `tests/other-master/system-master/ui/status-badge-visible.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/system-master
  2. Wait for the table to load with at least one record
  3. Verify the Status column is present in the table
  4. Verify the first row displays a Status badge (e.g., 'Active' shown as a badge/h5 element)
  5. Switch filter to 'Inactive' (if records exist) and verify Inactive badge is displayed

**Expected Results:**
  - Status column is visible in the data table
  - Each row has a visible Active or Inactive status badge
  - Badge reflects the actual status of the record
