# Designation Master Test Plan

## Application Overview

Designation Master is a sub-module under Company Masters in the ElevatorPlus application (https://stage.elevatorplus.net/master/designation-master). It manages employee designations along with their leave and discount entitlements. The page has two main sections: (1) Add/Update Designation form with fields — Designation (text, **required**, must be unique), Max Discount (numeric, **required**), Casual Leaves (numeric, optional), Sick Leaves (numeric, optional), and two action buttons — Submit and Clear; (2) A data table listing all designations with columns: Sr. No., Action (Edit icon), Designation, Max Discount, Casual Leaves, Sick Leaves, and Status. The table supports filtering by Status (All/Active/Inactive), pagination size (10/25/50/100), search, and column sorting. An Export button allows downloading the table data as an Excel file. The form toggles between "Add Designation" and "Update Designation" modes. There is no delete functionality — only Edit.

## Test Scenarios

### Summary

| # | Suite | Test Case | Type |
|---|-------|-----------|------|
| 1.1 | Add Designation | Submit form with all valid fields → form resets on success, new row appears in table | Positive |
| 1.2 | Add Designation | Click Clear after filling form → all fields cleared, heading stays "Add Designation" | Positive |
| 2.1 | Add Designation Validation | Submit with Designation empty → validation error visible | Negative |
| 2.2 | Add Designation Validation | Submit with Max Discount empty → validation error visible | Negative |
| 2.3 | Add Designation Validation | Submit with Casual Leaves empty → form submits successfully (optional field) | Positive |
| 2.4 | Add Designation Validation | Submit with Sick Leaves empty → form submits successfully (optional field) | Positive |
| 2.5 | Add Designation Validation | Submit with all fields empty → validation errors visible for Designation and Max Discount only | Negative |
| 2.6 | Add Designation Validation | Submit duplicate Designation name → error/toast visible, no duplicate row added | Negative |
| 2.7 | Add Designation Validation | Enter text in Max Discount field → field should reject or not accept non-numeric input | Negative |
| 2.8 | Add Designation Validation | Enter text in Casual Leaves field → field should reject or not accept non-numeric input | Negative |
| 2.9 | Add Designation Validation | Enter text in Sick Leaves field → field should reject or not accept non-numeric input | Negative |
| 2.10 | Add Designation Validation | Enter negative value in numeric fields → validation error or rejection | Negative |
| 3.1 | Update Designation | Edit first row, change Designation name → update succeeds, new name visible in table; original restored | Positive |
| 3.2 | Update Designation | Edit first row, change numeric values → update succeeds, new values visible in table; original restored | Positive |
| 3.3 | Update Designation | Edit first row, change status to Inactive → verified in Inactive filter; restored to Active | Positive |
| 3.4 | Update Designation | Edit first row, type new values, click Clear → form resets, table still shows original data | Positive |
| 3.5 | Update Designation | Edit first row, change name to match another row's name → duplicate error visible; cancel | Negative |
| 3.6 | Update Designation | Clear Designation field in edit form → click Update → validation error, stays on "Update Designation" | Negative |
| 4.1 | Data Table Verification | Add new designation → verify all four values appear correctly in the data table row | Positive |
| 4.2 | Data Table Verification | Search by designation name → only matching rows visible; clear restores all records | Positive |
| 4.3 | Data Table Verification | Search with non-existent term → empty state or "No records found" | Negative |
| 4.4 | Data Table Verification | Status filter default is "Active" → all visible rows show Active status | Positive |
| 4.5 | Data Table Verification | Switch filter to Inactive → all visible rows show Inactive status (or empty table) | Positive |
| 4.6 | Data Table Verification | Change page size: default 10/25 → 10 (≤10 rows) → 50 (≤50 rows) | Positive |
| 4.7 | Data Table Verification | Click Designation column header → rows sorted ascending; click again → descending | Positive |
| 5.1 | Export | Click Export button → Excel file downloaded | Positive |
| 5.2 | Export | Exported Excel file contains correct column headers | Positive |
| 5.3 | Export | Exported Excel file data matches visible table data | Positive |
| 5.4 | Export | Export with Active filter applied → only Active records in file | Positive |
| 6.1 | UI and UX | All page elements visible: heading, form fields, Submit/Clear buttons, table headers, filter/search controls | Positive |
| 6.2 | UI and UX | Numeric fields accept only numbers; Designation accepts text | Positive |
| 6.3 | UI and UX | Pagination shows Previous/Page 1/Next; Previous is disabled on page 1 | Positive |
| 6.4 | UI and UX | Edit icon present in Action column of first table row | Positive |

**Total: 33 tests | 6 suites | 24 Positive | 9 Negative**

---

### 1. Add Designation

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. Add designation with all valid fields

**File:** `tests/company-master/designation-master/positive/add-designation-valid.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Verify the Add Designation form is visible with heading 'Add Designation'
  3. Enter a unique designation name in the Designation field (e.g., `TestDesignation<timestamp>`)
  4. Enter a valid numeric value in Max Discount (e.g., `10`)
  5. Enter a valid numeric value in Casual Leaves (e.g., `12`)
  6. Enter a valid numeric value in Sick Leaves (e.g., `6`)
  7. Click the Submit button
  8. Verify success toast/message is displayed
  9. Verify the form fields are cleared/reset after successful submission
  10. Verify the new designation row appears in the data table with the correct values

**Expected Results:**
  - Form should accept all valid inputs
  - Submit button triggers API call
  - Success message/toast is shown
  - Newly added designation appears in the data table with correct Designation, Max Discount, Casual Leaves, and Sick Leaves values
  - Form resets after successful submission

#### 1.2. Clear form resets all fields

**File:** `tests/company-master/designation-master/positive/add-designation-clear.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter values in all four fields: Designation, Max Discount, Casual Leaves, Sick Leaves
  3. Click the Clear button
  4. Verify all form fields are empty/reset
  5. Verify the form heading still reads 'Add Designation'

**Expected Results:**
  - Clear button removes all entered values
  - Form heading remains 'Add Designation'
  - No data is submitted to the server
  - Table remains unchanged

---

### 2. Add Designation Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. Submit form with empty Designation field

**File:** `tests/company-master/designation-master/negative/add-designation-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Leave the Designation field empty
  3. Enter valid values in Max Discount, Casual Leaves, and Sick Leaves
  4. Click the Submit button
  5. Verify a validation error is shown for the Designation field

**Expected Results:**
  - Validation error appears for the Designation field
  - Form is not submitted
  - User remains on the same page

#### 2.2. Submit form with empty Max Discount field

**File:** `tests/company-master/designation-master/negative/add-designation-empty-max-discount.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a valid designation name
  3. Leave the Max Discount field empty
  4. Enter valid values in Casual Leaves and Sick Leaves
  5. Click the Submit button
  6. Verify a validation error is shown for the Max Discount field

**Expected Results:**
  - Validation error appears for the Max Discount field
  - Form is not submitted
  - User remains on the same page

#### 2.3. Submit form with empty Casual Leaves field (optional — should succeed)

**File:** `tests/company-master/designation-master/positive/add-designation-empty-casual-leaves.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a unique designation name
  3. Enter a valid value in Max Discount
  4. Leave the Casual Leaves field empty
  5. Enter a valid value in Sick Leaves
  6. Click the Submit button
  7. Verify the form submits successfully (no validation error for Casual Leaves)
  8. Verify the form resets to "Add Designation"

**Expected Results:**
  - Casual Leaves is optional — no validation error is shown when left empty
  - Form submits successfully when only Designation and Max Discount are filled
  - New designation appears in the data table

#### 2.4. Submit form with empty Sick Leaves field (optional — should succeed)

**File:** `tests/company-master/designation-master/positive/add-designation-empty-sick-leaves.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a unique designation name
  3. Enter a valid value in Max Discount
  4. Enter a valid value in Casual Leaves
  5. Leave the Sick Leaves field empty
  6. Click the Submit button
  7. Verify the form submits successfully (no validation error for Sick Leaves)
  8. Verify the form resets to "Add Designation"

**Expected Results:**
  - Sick Leaves is optional — no validation error is shown when left empty
  - Form submits successfully when only Designation and Max Discount are filled
  - New designation appears in the data table

#### 2.5. Submit form with all fields empty

**File:** `tests/company-master/designation-master/negative/add-designation-all-empty.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Leave all form fields empty (Designation, Max Discount, Casual Leaves, Sick Leaves)
  3. Click the Submit button
  4. Verify validation errors are displayed for Designation and Max Discount only
  5. Verify no validation error appears for Casual Leaves or Sick Leaves

**Expected Results:**
  - Validation errors appear for Designation and Max Discount (mandatory fields)
  - No validation error appears for Casual Leaves and Sick Leaves (optional fields)
  - Form is not submitted
  - User remains on the same page

#### 2.6. Submit duplicate designation name

**File:** `tests/company-master/designation-master/negative/add-designation-duplicate.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Note an existing designation name from the table (e.g., first row's Designation value)
  3. Enter the same designation name in the Designation field
  4. Enter valid numeric values in Max Discount, Casual Leaves, and Sick Leaves
  5. Click the Submit button
  6. Verify an error or warning toast is shown indicating duplicate designation
  7. Verify no duplicate row is added to the table

**Expected Results:**
  - Error or warning message appears for duplicate Designation name
  - Duplicate designation is not added to the table
  - Designation names must be globally unique

#### 2.7. Enter non-numeric text in Max Discount field

**File:** `tests/company-master/designation-master/negative/add-designation-text-in-max-discount.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a valid designation name
  3. Type alphabetic characters (e.g., 'abc') in the Max Discount field
  4. Verify the field either rejects the input or shows a validation error
  5. Attempt to click Submit and verify form is not submitted

**Expected Results:**
  - Max Discount field should only accept numeric input
  - Non-numeric input is rejected or flagged with a validation error
  - Form is not submitted with invalid data

#### 2.8. Enter non-numeric text in Casual Leaves field

**File:** `tests/company-master/designation-master/negative/add-designation-text-in-casual-leaves.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a valid designation name and valid Max Discount
  3. Type alphabetic characters (e.g., 'abc') in the Casual Leaves field
  4. Verify the field either rejects the input or shows a validation error
  5. Attempt to click Submit and verify form is not submitted

**Expected Results:**
  - Casual Leaves field should only accept numeric input
  - Non-numeric input is rejected or flagged
  - Form is not submitted with invalid data

#### 2.9. Enter non-numeric text in Sick Leaves field

**File:** `tests/company-master/designation-master/negative/add-designation-text-in-sick-leaves.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a valid designation name, valid Max Discount, and valid Casual Leaves
  3. Type alphabetic characters (e.g., 'abc') in the Sick Leaves field
  4. Verify the field either rejects the input or shows a validation error
  5. Attempt to click Submit and verify form is not submitted

**Expected Results:**
  - Sick Leaves field should only accept numeric input
  - Non-numeric input is rejected or flagged
  - Form is not submitted with invalid data

#### 2.10. Enter negative values in numeric fields

**File:** `tests/company-master/designation-master/negative/add-designation-negative-values.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a valid designation name
  3. Enter `-5` in Max Discount field
  4. Enter `-3` in Casual Leaves field
  5. Enter `-2` in Sick Leaves field
  6. Click the Submit button
  7. Verify validation error(s) are shown or the form is rejected

**Expected Results:**
  - Negative numeric values should be rejected for Max Discount, Casual Leaves, and Sick Leaves
  - Validation error(s) should be visible
  - Form should not be submitted with negative values

---

### 3. Update Designation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. Edit designation and update with a new valid name

**File:** `tests/company-master/designation-master/positive/edit-designation-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the data table to load
  3. Note the current Designation name of the first row
  4. Click the Edit icon for the first row
  5. Verify the form heading changes to 'Update Designation'
  6. Verify all four fields (Designation, Max Discount, Casual Leaves, Sick Leaves) are pre-populated with the row's values
  7. Change the Designation field to a new unique name (e.g., `UpdatedDesig<timestamp>`)
  8. Click the Update button
  9. Verify a success toast/message is displayed
  10. Verify the updated designation name is reflected in the table
  11. Restore: click Edit on the updated row and revert to the original name

**Expected Results:**
  - Clicking Edit populates the form with existing designation data
  - Form heading changes to 'Update Designation'
  - Update button saves the new designation name successfully
  - Success message/toast is displayed
  - Updated name appears in the table
  - Original name is restored after cleanup

#### 3.2. Edit designation and update numeric values

**File:** `tests/company-master/designation-master/positive/edit-designation-numeric-values.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the data table to load
  3. Note the current Max Discount, Casual Leaves, and Sick Leaves values of the first row
  4. Click the Edit icon for the first row
  5. Update Max Discount to a new value (e.g., `15`)
  6. Update Casual Leaves to a new value (e.g., `14`)
  7. Update Sick Leaves to a new value (e.g., `8`)
  8. Click the Update button
  9. Verify a success toast/message is displayed
  10. Verify the updated numeric values are visible in the table row
  11. Restore: click Edit on the row and revert to original numeric values

**Expected Results:**
  - All numeric fields can be updated successfully
  - Success message/toast is displayed
  - Updated values appear correctly in the table
  - Original values restored after cleanup

#### 3.3. Edit designation and change status to Inactive

**File:** `tests/company-master/designation-master/positive/edit-designation-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Click the Edit icon for an Active designation record
  4. Verify the Status dropdown is visible and shows 'Active'
  5. Change the Status dropdown to 'Inactive'
  6. Click the Update button
  7. Verify success message is displayed
  8. Verify the record is no longer visible in the Active filter (or shows Inactive status)
  9. Switch filter to 'Inactive' and confirm the record appears there
  10. Restore: click Edit on the record in Inactive view and set Status back to 'Active'

**Expected Results:**
  - Status dropdown is visible only in edit/update mode
  - Status can be changed from Active to Inactive
  - Success message is displayed after update
  - Record moves to Inactive filter after update
  - Record restored to Active after cleanup

#### 3.4. Click Clear in update mode discards changes

**File:** `tests/company-master/designation-master/positive/edit-designation-clear.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Click the Edit icon for any designation row
  3. Verify form heading reads 'Update Designation'
  4. Modify the Designation name and numeric fields
  5. Click the Clear button
  6. Verify the form resets to 'Add Designation' mode with empty fields
  7. Verify the table still shows the original unchanged values

**Expected Results:**
  - Clear button discards unsaved changes
  - Form resets to 'Add Designation' heading with all fields cleared
  - No changes are persisted to the data table

#### 3.5. Update designation with a duplicate name shows error

**File:** `tests/company-master/designation-master/negative/edit-designation-duplicate-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load; skip if fewer than 2 rows exist
  3. Note the Designation name from the second table row
  4. Click the Edit icon on the first row
  5. Change the Designation field to match the second row's name
  6. Click the Update button
  7. Verify an error/toast message is visible for duplicate designation
  8. Click Clear to discard changes
  9. Verify the table still shows the original first row name

**Expected Results:**
  - Updating a designation with a name that already exists is blocked
  - Error or warning message is visible
  - No changes are persisted to the table

#### 3.6. Submit Update form with empty Designation field

**File:** `tests/company-master/designation-master/negative/edit-designation-empty-name.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Click the Edit icon for any designation row
  3. Clear the Designation field completely
  4. Click the Update button
  5. Verify a validation error is shown for the Designation field
  6. Verify the form remains in 'Update Designation' mode

**Expected Results:**
  - Validation error appears for the empty Designation field
  - Update does not proceed
  - User remains in 'Update Designation' mode

---

### 4. Data Table Verification

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. Verify newly added designation appears correctly in the table

**File:** `tests/company-master/designation-master/positive/verify-data-in-table.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Enter a unique designation name (e.g., `VerifyDesig<timestamp>`)
  3. Enter `20` in Max Discount, `10` in Casual Leaves, `7` in Sick Leaves
  4. Click the Submit button
  5. Verify success message is displayed
  6. In the data table, search for the newly added designation name
  7. Verify the row appears with:
     - Designation = entered name
     - Max Discount = `20`
     - Casual Leaves = `10`
     - Sick Leaves = `7`
     - Status = `Active`
  8. Cleanup: edit the record and set status to Inactive, or delete if supported

**Expected Results:**
  - The newly added row must display all four values exactly as entered
  - Status should default to Active
  - All column values in the row match the submitted form data

#### 4.2. Search designation by name in table

**File:** `tests/company-master/designation-master/positive/search-designation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Note the designation name from the first visible row
  4. Type that name in the search box
  5. Verify only rows matching the search term are displayed
  6. Clear the search box
  7. Verify all records are restored

**Expected Results:**
  - Search filters table results in real-time or on input
  - Only rows matching the search term are shown
  - Clearing search restores the full list

#### 4.3. Search with no matching results

**File:** `tests/company-master/designation-master/negative/search-no-results.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Type a search term that matches no designation (e.g., `XYZNOTEXIST99999`)
  4. Verify the table shows an empty state or "No records found" message

**Expected Results:**
  - Table shows empty state or "No records found" message
  - No data rows are displayed for an unmatched search term

#### 4.4. Status filter defaults to Active

**File:** `tests/company-master/designation-master/positive/filter-status-active.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Verify the Status filter is set to 'Active' by default
  4. Verify all visible rows show Active status

**Expected Results:**
  - Default Status filter is 'Active'
  - All displayed rows have Active status

#### 4.5. Filter by Inactive status

**File:** `tests/company-master/designation-master/positive/filter-status-inactive.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Change the Status filter to 'Inactive'
  4. Verify only Inactive designation records are displayed
  5. If no inactive records exist, verify empty state is shown

**Expected Results:**
  - Inactive filter shows only Inactive designation records
  - All displayed rows show Inactive status
  - Empty state shown if no inactive records exist

#### 4.6. Change page size (rows per page)

**File:** `tests/company-master/designation-master/positive/pagination-page-size.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Note the default page size (10 or 25)
  4. Change the Show dropdown to '10'
  5. Verify at most 10 rows are displayed
  6. Change the Show dropdown to '50'
  7. Verify at most 50 rows are displayed

**Expected Results:**
  - Changing page size updates the number of visible rows accordingly
  - Pagination buttons update correctly

#### 4.7. Sort table by Designation column

**File:** `tests/company-master/designation-master/positive/sort-by-designation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Click the 'Designation' column header to sort ascending
  4. Verify rows are sorted alphabetically by Designation name
  5. Click the 'Designation' column header again to sort descending
  6. Verify rows are sorted in reverse alphabetical order

**Expected Results:**
  - Clicking column header toggles ascending/descending sort
  - Table data reorders correctly
  - Sort icon reflects current sort direction

---

### 5. Export

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. Click Export button triggers file download

**File:** `tests/company-master/designation-master/positive/export-button-download.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load with at least one record
  3. Set up a download listener to capture the downloaded file
  4. Click the Export button
  5. Verify a file download is triggered
  6. Verify the downloaded file has an `.xlsx` or `.xls` extension (Excel format)

**Expected Results:**
  - Clicking the Export button triggers a file download
  - Downloaded file is in Excel format (.xlsx or .xls)
  - No error messages are shown

#### 5.2. Exported Excel file contains correct column headers

**File:** `tests/company-master/designation-master/positive/export-column-headers.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Click the Export button and capture the downloaded file
  4. Open/parse the downloaded Excel file
  5. Verify the file contains the expected column headers: Designation, Max Discount, Casual Leaves, Sick Leaves, Status (and Sr. No. if exported)

**Expected Results:**
  - Excel file contains the correct column headers matching the data table
  - Column names match the table headers displayed on the page

#### 5.3. Exported file data matches visible table data

**File:** `tests/company-master/designation-master/positive/export-data-matches-table.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Read the data from the first 3–5 visible rows (Designation, Max Discount, Casual Leaves, Sick Leaves)
  4. Click the Export button and capture the downloaded Excel file
  5. Parse the Excel file and verify the rows match the data noted from the table

**Expected Results:**
  - Data in the exported Excel file matches the data visible in the table
  - All four field values per row are correctly exported
  - No data is missing or corrupted in the export

#### 5.4. Export respects Active status filter

**File:** `tests/company-master/designation-master/positive/export-with-filter.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Set Status filter to 'Active'
  3. Note the total number of Active rows visible in the table
  4. Click the Export button and capture the downloaded Excel file
  5. Verify the Excel file contains only Active designation records
  6. Verify the row count in the file matches the Active record count in the table

**Expected Results:**
  - Exported file reflects the currently applied filter (Active only)
  - Row count in Excel matches the count visible in the table under the Active filter
  - No Inactive records appear in the exported file when Active filter is applied

---

### 6. UI and UX

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. Verify Designation Master page layout and elements

**File:** `tests/company-master/designation-master/ui/page-layout.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Verify the page heading 'Designation Master' is displayed
  3. Verify the Add Designation form section is present with heading 'Add Designation'
  4. Verify the following form fields are visible: Designation (text), Max Discount (numeric), Casual Leaves (numeric), Sick Leaves (numeric)
  5. Verify the Submit and Clear buttons are visible and enabled
  6. Verify the Export button is visible above or near the data table
  7. Verify the data table section is visible below the form
  8. Verify table headers are present: Sr. No., Action, Designation, Max Discount, Casual Leaves, Sick Leaves, Status
  9. Verify the Status filter, Show dropdown, and Search box are present above the table

**Expected Results:**
  - Page heading 'Designation Master' is visible
  - All four form fields are visible and accessible
  - Submit and Clear buttons are visible
  - Export button is visible
  - Table with correct column headers is displayed
  - Filter controls (Status, Show, Search) are visible

#### 6.2. Verify field type restrictions

**File:** `tests/company-master/designation-master/ui/field-type-validation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Click on the Designation field and type alphanumeric text (e.g., 'Manager 2024')
  3. Verify the field accepts the text input
  4. Click on the Max Discount field and type '25'
  5. Verify the field accepts the numeric input
  6. Try typing 'abc' in the Max Discount field
  7. Verify the field rejects or flags non-numeric input
  8. Repeat steps 6–7 for Casual Leaves and Sick Leaves fields

**Expected Results:**
  - Designation field accepts text/alphanumeric input
  - Max Discount, Casual Leaves, and Sick Leaves fields accept only numeric input
  - Non-numeric input in numeric fields is rejected or triggers a validation error

#### 6.3. Verify table pagination controls

**File:** `tests/company-master/designation-master/ui/pagination-controls.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load
  3. Verify pagination controls are visible below the table
  4. Verify the Previous page button is disabled when on page 1
  5. Verify the Next page button state based on total records
  6. If multiple pages exist, click Next page and verify the page changes
  7. Verify the current page number is highlighted or active

**Expected Results:**
  - Pagination is present when records exist
  - Previous button is disabled on page 1
  - Next button is disabled on the last page
  - Current page number is highlighted/active

#### 6.4. Verify Edit icon is present in Action column

**File:** `tests/company-master/designation-master/ui/edit-icon-present.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/designation-master
  2. Wait for the table to load with at least one record
  3. Verify the Action column of the first row contains an Edit icon (pencil/img)
  4. Hover over the Edit icon and verify a tooltip (e.g., 'Edit') appears
  5. Click the Edit icon and verify the form switches to 'Update Designation' mode

**Expected Results:**
  - Edit icon is visible in the Action column for each row
  - Tooltip is shown on hover
  - Clicking the icon loads the row's data into the form in Update mode
