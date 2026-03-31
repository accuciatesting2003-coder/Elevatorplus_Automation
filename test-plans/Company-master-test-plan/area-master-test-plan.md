# Area Master Test Plan

## Application Overview

Area Master is a sub-module under Company Masters in the ElevatorPlus application (https://stage.elevatorplus.net/master/area-master). It manages geographic areas associated with branches. The page has two main sections: (1) Add/Update Area form with fields - Branch Name (dropdown, required), Area Name (text, required), Area Code (text, required), and Status (dropdown - Active/Inactive, shown only on edit); (2) A data table listing all areas with columns: Sr. No., Action (Edit icon), Branch Name, Area Name, Area Code, and Status. The table supports filtering by Status (All/Active/Inactive), pagination size (10/25/50/100), and search by Branch Name / Area Name. Column headers support sorting. The form toggles between "Add Area" and "Update Area" modes. There is no delete functionality - only Edit.

## Test Scenarios

### Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| 1.1 | Add Area | Submit form with all valid fields (Branch + Area Name + Area Code) → form resets on success | Positive |
| 1.2 | Add Area | Click Cancel after filling form → all fields clear, heading stays "Add Area" | Positive |
| 2.1 | Add Area Validation | Submit with Branch not selected → "Please select branch name" error visible | Negative |
| 2.2 | Add Area Validation | Submit with Area Name empty → validation error visible, URL unchanged | Negative |
| 2.3 | Add Area Validation | Submit with Area Code empty → validation error visible, URL unchanged | Negative |
| 2.4 | Add Area Validation | Submit with all fields empty → at least one validation error visible | Negative |
| 2.5 | Add Area Validation | Submit duplicate area name for same branch (known record "PCMC" / Pune) → error/toast visible | Negative |
| 2.6 | Add Area Validation | Inactivate an existing record → re-add same name under same branch → error visible; record restored after | Negative |
| 2.7 | Add Area Validation | Add same area name under Pune, then same name under Nagpur → both succeed, no error | Positive |
| 2.8 | Add Area Validation | Create fresh area under Pune → inactivate it → try add same name under Nagpur → error + row count = 0 → try edit existing Nagpur record to that name → error; cleanup restores area to Active | Negative |
| 2.9 | Add Area Validation | Pick first active Pune row → inactivate it → try add same name under Nagpur → error + row count = 0 → try edit existing Nagpur record to that name → error; cleanup restores record to Active | Negative |
| 3.1 | Update Area | Edit first row, change Area Name → update succeeds, new name visible in table; original name restored | Positive |
| 3.2 | Update Area | Edit first row, change status to Inactive → verified in Inactive filter; restored to Active | Positive |
| 3.3 | Update Area | Edit first row, type "Discarded Change", cancel → form resets, table still shows original name | Positive |
| 3.4 | Update Area | Edit first row, change name to match second row's name → duplicate error visible; cancel | Negative |
| 3.5 | Update Area | Clear Area Name in edit form → click Update → validation error, stays on "Update Area" | Negative |
| 4.1 | Search and Filter | Search by "Pune" → all visible rows contain "Pune"; clear restores all records | Positive |
| 4.2 | Search and Filter | Search by "PCMC" → first row contains "PCMC"; clear restores | Positive |
| 4.3 | Search and Filter | Search "XYZNOTEXIST99999" → row count ≤ 1 (empty state) | Negative |
| 4.4 | Search and Filter | Status filter default is "Active" → all visible rows show Active badge | Positive |
| 4.5 | Search and Filter | Switch filter to Inactive → all visible rows show Inactive badge (or empty table) | Positive |
| 4.6 | Search and Filter | Change page size: default 25 → 10 (≤10 rows) → 50 (≤50 rows) | Positive |
| 4.7 | Search and Filter | Click Branch Name column header → rows sorted ascending; click again → descending | Positive |
| 5.1 | UI and UX | All page elements visible: heading, form fields, Submit/Cancel buttons, all 6 column headers, Show/Status filters, search box | Positive |
| 5.2 | UI and UX | Branch dropdown opens and shows "Pune"; selecting it displays value in control | Positive |
| 5.3 | UI and UX | Pagination shows Previous/Page 1/Next buttons; Previous is disabled on page 1 | Positive |
| 5.4 | UI and UX | Edit icon (img) present in the Action column of the first table row | Positive |
| 5.5 | UI and UX | Active status badge (rendered as h5) is visible in the first table row | Positive |

**Total: 23 tests | 5 suites | 17 Positive | 6 Negative**

---

### 1. Add Area

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. Add area with all valid fields

**File:** `tests/company-master/area-master/positive/add-area-valid.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Verify the Add Area form is visible with heading 'Add Area'
  3. Click on Branch Name dropdown and select a valid branch (e.g., 'Pune')
  4. Enter a unique area name in the Area Name field (e.g., 'Test Area')
  5. Enter a unique area code in the Area Code field (e.g., 'TA01')
  6. Click the Submit button
  7. Verify success toast/message is displayed
  8. Verify the new area appears in the table

**Expected Results:**
  - Form should accept all valid inputs
  - Submit button click should trigger API call
  - Success message/toast should be shown
  - Newly added area should appear in the data table
  - Form should reset after successful submission

#### 1.2. Cancel add area form resets fields

**File:** `tests/company-master/area-master/positive/add-area-cancel.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Select a branch from the Branch Name dropdown
  3. Enter an area name in the Area Name field
  4. Enter an area code in the Area Code field
  5. Click the Cancel button
  6. Verify the form fields are cleared/reset

**Expected Results:**
  - Cancel button should clear all form fields
  - Form heading should remain 'Add Area'
  - No data should be submitted to the server
  - Table should remain unchanged

### 2. Add Area Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. Submit Add Area form with empty Branch Name

**File:** `tests/company-master/area-master/negative/add-area-empty-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Leave the Branch Name dropdown unselected
  3. Enter a valid area name in the Area Name field
  4. Enter a valid area code in the Area Code field
  5. Click the Submit button
  6. Verify validation error is shown for Branch Name

**Expected Results:**
  - Validation error message should appear for Branch Name field
  - Form should not be submitted
  - User should remain on the same page

#### 2.2. Submit Add Area form with empty Area Name

**File:** `tests/company-master/area-master/negative/add-area-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Select a valid branch from the Branch Name dropdown
  3. Leave the Area Name field empty
  4. Enter a valid area code in the Area Code field
  5. Click the Submit button
  6. Verify validation error is shown for Area Name

**Expected Results:**
  - Validation error message should appear for Area Name field
  - Form should not be submitted
  - User should remain on the same page

#### 2.3. Submit Add Area form with empty Area Code

**File:** `tests/company-master/area-master/negative/add-area-empty-code.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Select a valid branch from the Branch Name dropdown
  3. Enter a valid area name in the Area Name field
  4. Leave the Area Code field empty
  5. Click the Submit button
  6. Verify validation error is shown for Area Code

**Expected Results:**
  - Validation error message should appear for Area Code field
  - Form should not be submitted
  - User should remain on the same page

#### 2.4. Submit Add Area form with all fields empty

**File:** `tests/company-master/area-master/negative/add-area-all-empty.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Leave all form fields empty (Branch Name, Area Name, Area Code)
  3. Click the Submit button
  4. Verify validation errors are displayed for all required fields

**Expected Results:**
  - Validation errors should appear for all required fields
  - Form should not be submitted
  - User should remain on the same page

#### 2.5. Add duplicate area name for same branch

**File:** `tests/company-master/area-master/negative/add-area-duplicate.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Note an existing area name and its branch from the table (e.g., Branch: 'Pune', Area Name: 'PCMC')
  3. Select the same branch from the Branch Name dropdown
  4. Enter the same area name that already exists
  5. Enter a different area code
  6. Click the Submit button
  7. Verify an error/warning is shown for duplicate entry

**Expected Results:**
  - Error or warning message should be shown for duplicate area name under the same branch
  - Duplicate area should not be added to the table

#### 2.6. Inactivate active record then adding same area name under same branch shows error

**File:** `tests/company-master/area-master/negative/add-area-inactive-same-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load with Active records
  3. Read the Branch Name, Area Name, and Area Code from the first active row
  4. Click the Edit icon on that row
  5. Change the Status dropdown to 'Inactive' and click Update
  6. Verify form resets to 'Add Area'
  7. Select the same branch from the Branch Name dropdown
  8. Enter the same area name and area code
  9. Click the Submit button
  10. Verify an error/duplicate message is displayed
  11. Restore: switch Status filter to 'Inactive', find the record, set it back to 'Active'

**Expected Results:**
  - Even after inactivating a record, its area name remains reserved for that branch
  - Attempting to re-add the same name under the same branch should show a duplicate error
  - Record should not be created again

#### 2.7. Add same area name under a different branch should succeed

**File:** `tests/company-master/area-master/positive/add-area-same-name-different-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Select branch 'Pune', enter a unique area name (e.g., `SharedArea<timestamp>`) and area code
  3. Click Submit and verify success (form resets to 'Add Area')
  4. Select a different branch (e.g., 'Nagpur')
  5. Enter the same area name with a different area code
  6. Click Submit
  7. Verify form resets to 'Add Area' with no error

**Expected Results:**
  - The same area name is allowed across different branches
  - Both records should be created successfully
  - No error or warning should appear

#### 2.8. Duplicate area name across branches blocked even when original area is inactive (add and edit via new record)

**File:** `tests/company-master/area-master/negative/add-area-inactive-cross-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Create a new area under branch 'Pune' with a unique name (e.g., `InactiveArea<timestamp>`)
  3. Verify form resets to 'Add Area'
  4. Find the newly created record in the table and click its Edit icon
  5. Change Status to 'Inactive' and click Update
  6. Verify form resets to 'Add Area'
  7. Select branch 'Nagpur', enter the same area name and a different area code
  8. Click Submit
  9. Verify an error/toast message is visible
  10. Verify the record was NOT created — table shows 0 rows matching area name + 'Nagpur'
  11. Switch Status filter to 'All', find an existing Nagpur record and click its Edit icon
  12. Change its Area Name to the inactive area name and click Update
  13. Verify an error/toast message is visible
  14. Click Cancel to discard
  15. Restore: switch Status filter to 'Inactive', find the Pune record and set it back to 'Active'

**Expected Results:**
  - An inactive area name is still globally reserved — it cannot be used in any other branch (add or edit)
  - Error message must be visible on both the add attempt and the edit attempt
  - Negative assertion: no Nagpur row with that name should appear in the table after the failed add

#### 2.9. Inactivate an existing active record and verify its name is blocked on a different branch (add and edit)

**File:** `tests/company-master/area-master/negative/add-area-inactive-existing-cross-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load; skip if no Pune rows exist
  3. Read the Area Name from the first active Pune row
  4. Click its Edit icon, change Status to 'Inactive', and click Update
  5. Verify form resets to 'Add Area'
  6. Select branch 'Nagpur', enter the same area name and a unique area code
  7. Click Submit
  8. Verify an error/toast message is visible
  9. Verify 0 rows in the table match both the area name and 'Nagpur' (negative assertion)
  10. Switch Status filter to 'All', find the first Nagpur row and click its Edit icon
  11. Change its Area Name to the target name and click Update
  12. Verify an error/toast message is visible
  13. Click Cancel to discard
  14. Restore: switch Status filter to 'Inactive', find the Pune record by name and set it back to 'Active'

**Expected Results:**
  - Inactivating an existing area does not free up its name for other branches
  - Both add and edit attempts with the inactive area name on a different branch must be blocked
  - Error message must be visible in both cases
  - No new record should be created under the different branch

### 3. Update Area

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. Edit area and update with valid data

**File:** `tests/company-master/area-master/positive/edit-area-valid.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load with area records
  3. Click the Edit (pencil) icon for the first area record
  4. Verify the form heading changes to 'Update Area'
  5. Verify the Branch Name, Area Name, Area Code, and Status fields are pre-populated
  6. Update the Area Name field with a new value
  7. Update the Area Code field with a new value
  8. Click the Update button
  9. Verify success toast/message is displayed
  10. Verify the updated values are reflected in the table

**Expected Results:**
  - Clicking Edit should populate the form with existing area data
  - Form heading should change to 'Update Area'
  - Status dropdown should appear in edit mode
  - Update button should save changes successfully
  - Success message/toast should be displayed
  - Updated area details should be visible in the table

#### 3.2. Edit area and change status to Inactive

**File:** `tests/company-master/area-master/positive/edit-area-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Click the Edit icon for an Active area record
  4. Verify Status dropdown is visible with 'Active' selected
  5. Change Status dropdown to 'Inactive'
  6. Click the Update button
  7. Verify success message is displayed
  8. Verify the area status is now 'Inactive' in the table

**Expected Results:**
  - Status dropdown should be visible only in edit mode
  - Status can be changed from Active to Inactive
  - Updated status should be reflected in the table

#### 3.3. Cancel edit form discards changes

**File:** `tests/company-master/area-master/positive/edit-area-cancel.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Click the Edit icon for any area record
  3. Modify the Area Name field
  4. Click the Cancel button
  5. Verify the form resets to Add Area mode
  6. Verify the table still shows the original area name

**Expected Results:**
  - Cancel should discard any unsaved changes
  - Form should revert to 'Add Area' heading and empty fields
  - No changes should be persisted in the table

#### 3.4. Edit existing record and submit with duplicate area name shows error

**File:** `tests/company-master/area-master/negative/edit-area-duplicate-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load; skip if fewer than 2 rows exist
  3. Read the Area Name from the second table row
  4. Click the Edit icon on the first row
  5. Change the Area Name to match the second row's name
  6. Click the Update button
  7. Verify an error/toast message is visible for duplicate
  8. Click Cancel to discard changes

**Expected Results:**
  - Updating an area with a name that already exists in the same branch should be blocked
  - Error message should be visible
  - No changes should be persisted

#### 3.5. Submit Update Area form with empty Area Name

**File:** `tests/company-master/area-master/negative/edit-area-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Click the Edit icon for any area record
  3. Clear the Area Name field
  4. Click the Update button
  5. Verify validation error is shown for Area Name

**Expected Results:**
  - Validation error should appear for the empty Area Name field
  - Update should not proceed
  - User should remain in Update Area mode

### 4. Search and Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. Search areas by Branch Name

**File:** `tests/company-master/area-master/ui/search-by-branch.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Verify the search placeholder shows 'Search Branch Name'
  4. Type a valid branch name (e.g., 'Pune') in the search box
  5. Verify the table filters to show only rows matching the branch name
  6. Clear the search box
  7. Verify all records are restored

**Expected Results:**
  - Search box should filter table results in real-time or on input
  - Only matching branch name records should be displayed
  - Clearing search should restore the full list

#### 4.2. Search areas by Area Name

**File:** `tests/company-master/area-master/ui/search-by-area-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Type a valid area name (e.g., 'PCMC') in the search box
  4. Verify the table filters to show only matching area name records
  5. Clear the search and verify full list is restored

**Expected Results:**
  - Search should filter by area name
  - Matching records should be displayed
  - Non-matching records should be hidden

#### 4.3. Search with no matching results

**File:** `tests/company-master/area-master/ui/search-no-results.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Type a search term that doesn't match any area (e.g., 'XYZNOTEXIST')
  4. Verify the table shows a 'No records found' message or empty state

**Expected Results:**
  - Table should show empty state or 'No records found' message
  - No data rows should be displayed

#### 4.4. Filter areas by Status - Active

**File:** `tests/company-master/area-master/ui/filter-by-status-active.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Verify Status filter defaults to 'Active'
  4. Confirm all visible records show 'Active' status
  5. Change Status filter to 'All'
  6. Verify both Active and Inactive records appear (if any exist)

**Expected Results:**
  - Default filter should be 'Active'
  - Active filter should show only active area records
  - 'All' filter should show all records regardless of status

#### 4.5. Filter areas by Status - Inactive

**File:** `tests/company-master/area-master/ui/filter-by-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Change the Status filter to 'Inactive'
  4. Verify only inactive area records are displayed
  5. If no inactive areas exist, verify empty state is shown

**Expected Results:**
  - Inactive filter should show only inactive area records
  - All displayed records should have 'Inactive' status badge
  - Empty state shown if no inactive records exist

#### 4.6. Change page size (rows per page)

**File:** `tests/company-master/area-master/ui/pagination-page-size.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Verify the default page size is 25
  4. Change the Show dropdown to '10'
  5. Verify at most 10 rows are displayed
  6. Change the Show dropdown to '50'
  7. Verify at most 50 rows are displayed

**Expected Results:**
  - Default page size should be 25
  - Changing page size should update visible rows accordingly
  - Pagination buttons should update correctly

#### 4.7. Sort table by column headers

**File:** `tests/company-master/area-master/ui/sort-by-columns.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Click the 'Branch Name' column header to sort ascending
  4. Verify rows are sorted alphabetically by Branch Name
  5. Click the 'Branch Name' column header again to sort descending
  6. Verify rows are sorted in reverse alphabetical order
  7. Click the 'Area Name' column header and verify sort
  8. Click the 'Area Code' column header and verify sort

**Expected Results:**
  - Column headers with sort icons should toggle ascending/descending sort
  - Table data should reorder correctly on each click
  - Sort icon should reflect current sort direction

### 5. UI and UX

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. Verify Area Master page layout and elements

**File:** `tests/company-master/area-master/ui/page-layout.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Verify the page heading 'Area Master' is displayed in the navigation bar
  3. Verify the 'Add Area' form section is present with heading 'Add Area'
  4. Verify Branch Name dropdown, Area Name textbox, and Area Code textbox are visible
  5. Verify the Submit and Cancel buttons are visible
  6. Verify the data table section is visible below the form
  7. Verify table headers: Sr. No., Action, Branch Name, Area Name, Area Code, Status
  8. Verify the Status filter, Show dropdown, and Search box are present above the table

**Expected Results:**
  - Page heading 'Area Master' should be visible
  - All form fields should be visible and accessible
  - Submit and Cancel buttons should be visible
  - Table with correct column headers should be displayed
  - Filter controls (Status, Show, Search) should be visible

#### 5.2. Verify Branch Name dropdown options

**File:** `tests/company-master/area-master/ui/branch-dropdown-options.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Click on the Branch Name dropdown in the Add Area form
  3. Verify the dropdown opens and shows available branches
  4. Verify the search/filter functionality within the dropdown
  5. Select a branch and verify it appears in the dropdown field
  6. Verify the clear (X) icon appears to deselect the branch

**Expected Results:**
  - Branch Name dropdown should open on click
  - Available branches should be listed
  - Search within dropdown should filter options
  - Selected branch should display in the field
  - Clear icon should deselect the branch

#### 5.3. Verify table pagination controls

**File:** `tests/company-master/area-master/ui/pagination-controls.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Verify pagination controls are visible below the table
  4. Verify Previous page button is disabled when on page 1
  5. Verify Next page button state based on total records
  6. If multiple pages exist, click Next page and verify page changes
  7. Verify current page number is highlighted

**Expected Results:**
  - Pagination should be present when records exist
  - Previous button should be disabled on first page
  - Next button should be disabled on last page
  - Current page number should be highlighted/active

#### 5.4. Verify Edit icon tooltip

**File:** `tests/company-master/area-master/ui/edit-icon-tooltip.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Hover over the Edit icon (pencil) in the Action column for any row
  4. Verify a tooltip 'Edit' appears on hover

**Expected Results:**
  - Edit icon should display a tooltip with text 'Edit' on hover

#### 5.5. Verify Status badge styling

**File:** `tests/company-master/area-master/ui/status-badge.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/area-master
  2. Wait for the table to load
  3. Verify Active records show a green/positive 'Active' badge
  4. Change Status filter to 'Inactive' (or add an inactive area first)
  5. Verify Inactive records show a different styled 'Inactive' badge

**Expected Results:**
  - Active status should have distinct positive styling (e.g., green badge)
  - Inactive status should have distinct negative styling (e.g., red/grey badge)
