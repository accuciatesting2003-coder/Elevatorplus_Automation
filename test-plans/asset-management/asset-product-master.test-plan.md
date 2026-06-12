# Test Plan: Asset Product Master

## Module: Asset Management > Asset Product Master

---

## Test Suite 1: Page Load & Asset Dropdown

### TC-APM-001: Asset Product Master page loads successfully
- Navigate to Asset Management > Asset Product Master
- Verify page heading is visible
- Verify the Asset dropdown is present

### TC-APM-002: Asset dropdown loads only active assets
- Open the Asset dropdown
- Verify all options correspond to Active assets created in Asset Master
- Verify no Inactive assets appear in the list

### TC-APM-003: Asset dropdown is mandatory
- Leave the Asset dropdown unselected and attempt to proceed
- Verify validation error or that the entries section is not accessible

---

## Test Suite 2: Asset Entries Section — Display

### TC-APM-004: Asset Entries section appears after selecting an asset
- Select a valid active asset from the dropdown
- Verify the "Asset Entries" section renders below

### TC-APM-005: Asset Entries section is empty for a new asset
- Select an asset that has no entries yet
- Verify the entries table/list is empty or shows empty state

### TC-APM-006: Existing entries displayed for asset with prior entries
- Select an asset that already has entries
- Verify entries are listed with all columns: serial number, quantity, purchase date, warranty, cost, warehouse, notes

---

## Test Suite 3: Add New Asset Entry — Validations

### TC-APM-007: Submit entry form with all fields empty shows validation errors
- Select an asset and open the Add Entry form
- Leave all fields blank, click Save/Add
- Verify mandatory field errors for: Serial Number, Quantity, Warehouse

### TC-APM-008: Serial Number is mandatory
- Fill all other required fields, leave Serial Number blank
- Click Save
- Verify validation error for Serial Number

### TC-APM-009: Quantity is mandatory
- Fill all other required fields, leave Quantity blank
- Click Save
- Verify validation error for Quantity

### TC-APM-010: Warehouse is mandatory
- Fill all other required fields, leave Warehouse blank
- Click Save
- Verify validation error for Warehouse

### TC-APM-011: Purchase Date is optional — entry saves without it
- Fill Serial Number, Quantity, Warehouse; leave Purchase Date empty
- Click Save
- Verify entry is saved successfully

### TC-APM-012: Warranty is optional — entry saves without it
- Fill required fields; leave Warranty empty
- Click Save
- Verify entry is saved successfully

### TC-APM-013: Cost is optional — entry saves without it
- Fill required fields; leave Cost empty
- Click Save
- Verify entry is saved successfully

### TC-APM-014: Notes is optional — entry saves without it
- Fill required fields; leave Notes empty
- Click Save
- Verify entry is saved successfully

---

## Test Suite 4: Add New Asset Entry — Valid Data

### TC-APM-015: Create entry with only mandatory fields
- Select an asset
- Enter: Serial Number = "SN-001", Quantity = "1", Warehouse = select valid warehouse
- Click Save
- Verify success message
- Verify new entry appears in the entries list

### TC-APM-016: Create entry with all fields filled
- Select an asset
- Enter: Serial Number = "SN-002", Quantity = "5", Purchase Date = valid date, Warranty = "1 year", Cost = "5000", Warehouse = select valid warehouse, Notes = "Test note"
- Click Save
- Verify success message
- Verify all field values appear correctly in the entries list

### TC-APM-017: Quantity accepts only numeric  and decimal values
- Enter a non-numeric value (e.g., "abc") in Quantity
- Verify validation error or field rejects non-numeric input

### TC-APM-018: Quantity must be positive
- Enter 0 or negative value in Quantity
- Verify validation error

### TC-APM-019: Cost accepts only numeric/decimal values
- Enter a non-numeric value in Cost
- Verify validation error or field rejects non-numeric input

### TC-APM-020: Purchase Date accepts valid date format
- Enter a valid date (e.g., "01/01/2024") in Purchase Date
- Verify it is accepted

### TC-APM-021: Purchase Date rejects future dates (if business rule applies)
- Enter a future date in Purchase Date
- Verify if business rule restricts future dates

---

## Test Suite 5: Multiple Entries for Same Asset

### TC-APM-022: Multiple entries can be added under the same asset
- Select an asset and add entry #1
- Add entry #2 with a different serial number
- Verify both entries appear in the list

### TC-APM-023: Duplicate serial number under same asset (if restricted)
- Add two entries with the same serial number under the same asset
- Verify appropriate error or allow based on business rules

---

## Test Suite 6: Entries Reflected in Asset Master

### TC-APM-024: Entries added in Asset Product Master appear in Asset Master
- Add entries under asset "Laptop" in Asset Product Master
- Navigate to Asset Master, find "Laptop"
- Verify the same entries are visible under that asset

### TC-APM-025: Entry count matches between Asset Product Master and Asset Master
- Verify the number of entries shown in Asset Master matches those entered in Asset Product Master

---

## Test Suite 7: Edit Asset Entry

### TC-APM-026: Edit option available for each entry
- Select an asset with existing entries
- Verify each entry has an Edit button/icon

### TC-APM-027: Edit entry pre-fills existing data
- Click Edit on an entry
- Verify all fields are pre-filled with existing values

### TC-APM-028: Update Serial Number successfully
- Edit an entry, change the Serial Number
- Save and verify updated value in list

### TC-APM-029: Update Quantity successfully
- Edit an entry, change the Quantity
- Save and verify updated value

### TC-APM-030: Clear mandatory field during edit shows error
- Edit an entry, clear Serial Number
- Click Save
- Verify validation error

---

## Test Suite 8: Delete Asset Entry

### TC-APM-031: Delete entry removes it from the list
- Click Delete on an entry
- Confirm the deletion prompt (if any)
- Verify entry no longer appears in the list

### TC-APM-032: Delete last entry leaves empty state
- Delete all entries under an asset
- Verify the entries section shows empty state
