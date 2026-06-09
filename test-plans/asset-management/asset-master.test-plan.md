# Test Plan: Asset Master

## Module: Asset Management > Asset Master

---

## Test Suite 1: Page Load & Navigation

### TC-AM-001: Asset Master page loads successfully
- Navigate to Asset Management > Asset Master
- Verify the page title/heading is visible
- Verify the "Add Asset" / create button is present
- Verify the asset list table is rendered

---

## Test Suite 2: Create Asset — Validations

### TC-AM-002: Submit empty form shows validation errors
- Click the Add/Create button to open the form
- Leave all fields empty and click Save/Submit
- Verify mandatory field error appears for "Asset Name"

### TC-AM-003: Asset Name accepts valid text
- Open the create form
- Enter a valid asset name (e.g., "Laptop")
- Click Save
- Verify success toast/message appears
- Verify the new asset appears in the list

### TC-AM-004: Asset Name field is required
- Open the create form
- Leave Asset Name blank, toggle "Is Multi Quantity" checkbox
- Click Save
- Verify validation error is shown for Asset Name

### TC-AM-005: Asset Name rejects blank/whitespace-only input
- Open the create form
- Enter only spaces in the Asset Name field
- Click Save
- Verify validation error is shown

### TC-AM-006: Asset Name accepts long string
- Open the create form
- Enter a 255-character asset name
- Click Save
- Verify the asset is created or appropriate max-length validation fires

---

## Test Suite 3: Is Multi Quantity Checkbox

### TC-AM-007: Is Multi Quantity checkbox is unchecked by default
- Open the create form
- Verify "Is Multi Quantity" checkbox is unchecked by default

### TC-AM-008: Is Multi Quantity checkbox can be toggled on
- Open the create form
- Enter a valid asset name
- Check the "Is Multi Quantity" checkbox
- Click Save
- Verify asset is saved with multi-quantity enabled (visible in list or detail)

### TC-AM-009: Is Multi Quantity checkbox can be toggled off
- Open the create form
- Enter a valid asset name
- Ensure "Is Multi Quantity" is unchecked
- Click Save
- Verify asset is saved without multi-quantity flag

---

## Test Suite 4: Edit / Update Asset

### TC-AM-010: Edit button opens pre-filled form
- From the asset list, click Edit on an existing asset
- Verify the form opens with existing Asset Name pre-filled
- Verify "Is Multi Quantity" reflects the saved state

### TC-AM-011: Update Asset Name successfully
- Open edit form for an existing asset
- Clear the Asset Name and enter a new valid name
- Click Save/Update
- Verify success message
- Verify updated name appears in the list

### TC-AM-012: Cannot save edit with empty Asset Name
- Open edit form
- Clear the Asset Name field
- Click Save
- Verify validation error for Asset Name

### TC-AM-013: Toggle Is Multi Quantity during edit
- Open edit form for an asset with Is Multi Quantity = false
- Toggle the checkbox to true
- Save
- Verify the change is persisted

---

## Test Suite 5: Asset Entries visible under Asset Master

### TC-AM-014: Asset with no entries shows empty entries section
- Open/expand an asset that has no product entries
- Verify the entries section is empty or shows appropriate empty state message

### TC-AM-015: Asset entries from Asset Product Master are displayed
- Prerequisite: at least one entry exists under an asset via Asset Product Master
- Open/expand that asset in Asset Master
- Verify the entries are listed with serial number, quantity, purchase date, warranty, cost, warehouse, notes columns

### TC-AM-016: Entries data matches what was entered in Asset Product Master
- Compare entry values in Asset Master view against what was created in Asset Product Master
- Verify serial number, quantity, purchase date, warehouse match exactly

---

## Test Suite 6: Status / Active-Inactive

### TC-AM-017: Newly created asset defaults to Active status
- Create a new asset
- Verify status column shows Active (or equivalent)

### TC-AM-018: Asset status can be toggled to Inactive
- From the list, toggle status of an active asset to Inactive
- Verify status changes
- Verify inactive asset does NOT appear in Asset Product Master dropdown

### TC-AM-019: Inactive asset does not appear in dependent dropdowns
- Set an asset to Inactive
- Navigate to Asset Product Master
- Open the Asset dropdown
- Verify the deactivated asset is not listed

---

## Test Suite 7: Search & Filter

### TC-AM-020: Search by asset name filters results
- Enter an existing asset name in the search/filter field
- Verify only matching assets are shown

### TC-AM-021: Search with non-existent name shows no results
- Enter a name that does not exist
- Verify "No records found" or equivalent message

---

## Test Suite 8: Asset Name Uniqueness

### TC-AM-022: Duplicate asset name (both active) shows error while adding
- Create an asset with name "TestAsset" (Active)
- Attempt to create another asset with the same name "TestAsset"
- Verify an appropriate error message (duplicate not allowed)

### TC-AM-023: Duplicate asset name matching an inactive record shows error while adding
- Ensure an asset named "InactiveAsset" exists with Inactive status
- Attempt to create a new asset with the name "InactiveAsset"
- Verify an error is shown — uniqueness is enforced against both active and inactive records

### TC-AM-024: Updating asset name to an existing active asset name shows error
- Open the edit form for any asset
- Change the Asset Name to a name already used by another active asset
- Click Save
- Verify an appropriate duplicate/uniqueness error message

### TC-AM-025: Updating asset name to an existing inactive asset name shows error
- Open the edit form for any asset
- Change the Asset Name to a name already used by an inactive asset
- Click Save
- Verify an appropriate error message — uniqueness check applies to inactive records too

### TC-AM-026: Updating asset name to its own current name saves successfully
- Open the edit form for an asset (e.g., name = "Laptop")
- Make no change to the Asset Name (or retype the same name)
- Click Save
- Verify success — no false duplicate error for the same record

---

## Test Suite 9: Is Multi Quantity — Non-Editable After Creation

### TC-AM-027: Is Multi Quantity checkbox is disabled/read-only in edit form
- Create an asset with "Is Multi Quantity" checked (true)
- Open the edit form for that asset
- Verify the "Is Multi Quantity" checkbox is disabled or read-only and cannot be changed

### TC-AM-028: Is Multi Quantity = false cannot be changed to true after creation
- Create an asset with "Is Multi Quantity" unchecked (false)
- Open the edit form for that asset
- Verify the "Is Multi Quantity" checkbox is disabled or read-only
- Attempt to toggle it (if UI allows interaction)
- Verify no change is saved — value remains false after Save

### TC-AM-029: Is Multi Quantity = true cannot be changed to false after creation
- Create an asset with "Is Multi Quantity" checked (true)
- Open the edit form for that asset
- Verify the "Is Multi Quantity" checkbox is disabled or read-only
- Attempt to toggle it off (if UI allows interaction)
- Verify no change is saved — value remains true after Save
