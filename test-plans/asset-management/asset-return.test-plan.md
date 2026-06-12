# Test Plan: Asset Return

## Module: Asset Management > Asset Return

---

## Test Suite 1: Page Load & Initial State

### TC-AR-001: Asset Return page loads successfully
- Navigate to Asset Management > Asset Return
- Verify the page heading is visible
- Verify the "Return Against" dropdown is present

### TC-AR-002: Return Against dropdown contains three options
- Open the "Return Against" dropdown
- Verify exactly three options: "Return from Technician", "Return from Job", "Return from PM"

---

## Test Suite 2: Return Against — Return from Technician

### TC-AR-003: Selecting "Return from Technician" shows Technician dropdown
- Select "Return from Technician" from Return Against
- Verify Technician Name dropdown appears
- Verify it is populated with all technicians who have assigned assets

### TC-AR-004: Technician dropdown is mandatory
- Select "Return from Technician", leave Technician unselected
- Attempt to proceed/save
- Verify validation error for Technician

### TC-AR-005: Selecting a technician loads assigned assets
- Select "Return from Technician", choose a technician who has assigned assets
- Verify the assigned assets list/table is displayed
- Verify assets match those assigned to the selected technician

### TC-AR-006: No assets shown for technician with no assignments
- Select "Return from Technician", choose a technician with no assigned assets
- Verify empty state message is shown

---

## Test Suite 3: Return Against — Return from Job

### TC-AR-007: Selecting "Return from Job" shows Job Number dropdown
- Select "Return from Job" from Return Against
- Verify Job Number dropdown appears
- Verify Technician Name dropdown is also present

### TC-AR-008: Job Number dropdown is populated with relevant job numbers
- Select "Return from Job"
- Open Job Number dropdown
- Verify jobs with assigned assets are listed

### TC-AR-009: Technician dropdown is present for Return from Job
- Select "Return from Job"
- Verify Technician Name dropdown is visible and populated (same as other options)

### TC-AR-010: Selecting a Job Number loads assets assigned against that job
- Select "Return from Job", choose a Job Number
- Verify assets assigned to that job are listed

### TC-AR-011: Job Number is mandatory
- Select "Return from Job", leave Job Number unselected
- Attempt to proceed
- Verify validation error for Job Number

---

## Test Suite 4: Return Against — Return from PM

### TC-AR-012: Selecting "Return from PM" shows PM Number dropdown
- Select "Return from PM" from Return Against
- Verify PM Number dropdown appears
- Verify Technician Name dropdown is also present

### TC-AR-013: PM Number dropdown is populated with relevant PM numbers
- Select "Return from PM"
- Open PM Number dropdown
- Verify PMs with assigned assets are listed

### TC-AR-014: Technician dropdown is present for Return from PM
- Select "Return from PM"
- Verify Technician Name dropdown is visible and populated

### TC-AR-015: Selecting a PM Number loads assets assigned against that PM
- Select "Return from PM", choose a PM Number
- Verify assets assigned to that PM are listed

### TC-AR-016: PM Number is mandatory
- Select "Return from PM", leave PM Number unselected
- Attempt to proceed
- Verify validation error for PM Number

---

## Test Suite 5: Technician Dropdown Consistency

### TC-AR-017: Technician dropdown is the same across all three Return Against options
- Select "Return from Technician" — note technician list
- Switch to "Return from Job" — note technician list
- Switch to "Return from PM" — note technician list
- Verify all three show identical technician options

---

## Test Suite 6: Assigned Assets Display

### TC-AR-018: Assigned assets list shows correct columns
- Select a return option and choose a valid entity (technician/job/PM)
- Verify the assets table shows: Asset Name, Serial Number, Assigned Quantity, Available Quantity columns

### TC-AR-019: Asset quantities reflect current assigned state
- Verify quantities shown match those assigned in Asset Assignment

### TC-AR-020: Multiple assets listed if multiple assets assigned
- If multiple assets were assigned to the selected entity
- Verify all appear in the list

---

## Test Suite 7: Selecting Asset and Quantity for Return

### TC-AR-021: Can select an asset from the assigned assets list
- Click on / check an asset in the assigned list
- Verify it is selected/highlighted

### TC-AR-022: Quantity field is present for selected asset
- Select an asset from the list
- Verify a Quantity input field is visible/editable for return quantity

### TC-AR-023: Return quantity cannot exceed assigned quantity
- Select an asset
- Enter a return quantity greater than assigned qty
- Verify validation error or quantity is capped

### TC-AR-024: Return quantity must be greater than zero
- Select an asset
- Enter 0 or negative quantity
- Verify validation error

### TC-AR-025: Return quantity accepts valid partial return
- Select an asset with Assigned Qty = 5
- Enter return quantity = 3
- Verify no validation error

---

## Test Suite 8: Done Button & Status Popup

### TC-AR-026: Done button is present after selecting asset and quantity
- Select an asset and enter return quantity
- Verify the "Done" button is active/visible

### TC-AR-027: Clicking Done opens status popup
- Select an asset, enter return quantity, click Done
- Verify a popup/modal opens asking for asset return status

### TC-AR-028: Status popup contains status options
- Open the Done popup
- Verify status options are listed (e.g., Good, Damaged, Under Repair, etc.)

### TC-AR-029: Status is required in the popup
- Open the Done popup, leave status unselected, click Confirm/Submit
- Verify validation error for status

### TC-AR-030: Selecting status and confirming completes the return
- Select a valid status in the popup
- Click Confirm/Submit
- Verify success message
- Verify returned asset is reflected correctly (available qty updates, returned qty updates)

---

## Test Suite 9: Post-Return Verification

### TC-AR-031: Returned asset appears in Asset Report with correct status
- Complete a return with status "Good"
- Navigate to Asset Report > Inventory
- Verify the returned asset appears with the status selected while returning the asset

### TC-AR-032: Assigned quantity decreases after return
- Note assigned qty before return
- Complete a partial return
- Verify assigned/available qty updated correctly

### TC-AR-033: Full return removes asset from assigned list
- Complete a full return (all assigned qty returned)
- Navigate back to Asset Return, select the same entity
- Verify the fully returned asset no longer appears (or shows 0 available)

---

## Test Suite 10: Switching Return Against Option

### TC-AR-034: Switching Return Against clears previous selections
- Select "Return from Technician", choose a technician, view assets
- Switch to "Return from Job"
- Verify technician assets are cleared; Job Number dropdown appears fresh

### TC-AR-035: Switching Return Against resets asset list
- Select an option and load assets
- Switch to a different Return Against option
- Verify the previous assets list is cleared
