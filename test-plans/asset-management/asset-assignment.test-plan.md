# Test Plan: Asset Assignment

## Module: Asset Management > Asset Assignment

---

## Test Suite 1: Page Load & Initial State

### TC-AA-001: Asset Assignment page loads successfully
- Navigate to Asset Management > Asset Assignment
- Verify the page heading is visible
- Verify the Add/Create Assignment button is present
- Verify the assignments list/table is rendered

### TC-AA-002: Form opens on clicking Add/Create button
- Click Add/Create button
- Verify the assignment form opens with empty fields
- Verify "From", "Against", and "Date of Assignment" fields are present

---

## Test Suite 2: Form Validation — Mandatory Fields

### TC-AA-003: Submit empty form shows validation errors
- Open the assignment form
- Leave all fields empty, click Save/Submit
- Verify validation errors for: From, Against, Date of Assignment

### TC-AA-004: From dropdown is mandatory
- Select Against and Date, leave From empty
- Click Save
- Verify validation error for From

### TC-AA-005: Against dropdown is mandatory
- Select From and Date, leave Against empty
- Click Save
- Verify validation error for Against

### TC-AA-006: Date of Assignment is mandatory
- Select From and Against, leave Date empty
- Click Save
- Verify validation error for Date of Assignment

---

## Test Suite 3: From Dropdown — Warehouse Selection

### TC-AA-007: From dropdown contains "Warehouse" and "Site" options
- Open the From dropdown
- Verify exactly two options: "Warehouse" and "Site"

### TC-AA-008: Selecting Warehouse shows Warehouse sub-dropdown
- Select "Warehouse" from the From dropdown
- Verify a secondary Warehouse dropdown appears
- Verify it is populated with all available warehouses

### TC-AA-009: Warehouse sub-dropdown is mandatory when Warehouse selected
- Select "Warehouse" from From dropdown
- Leave the Warehouse sub-dropdown unselected
- Fill remaining required fields, click Save
- Verify validation error for Warehouse sub-dropdown

### TC-AA-010: Warehouse sub-dropdown lists all warehouses
- Select "Warehouse" from From
- Open the Warehouse sub-dropdown
- Verify all warehouses are listed

### TC-AA-011: Selecting Site shows Site sub-dropdown
- Select "Site" from the From dropdown
- Verify a secondary Site dropdown appears
- Verify it is populated with all available sites

### TC-AA-012: Site sub-dropdown is mandatory when Site selected
- Select "Site" from From, leave Site sub-dropdown unselected
- Fill remaining required fields, click Save
- Verify validation error for Site sub-dropdown

### TC-AA-013: Switching From selection clears previous sub-dropdown
- Select "Warehouse" and choose a warehouse
- Switch From to "Site"
- Verify the Warehouse sub-dropdown disappears and Site sub-dropdown appears (without old value)

---

## Test Suite 4: Against Dropdown — Assign to Technician

### TC-AA-014: Against dropdown contains three options
- Open Against dropdown
- Verify options: "Assign to Technician", "Assign to Job", "Assign to PM"

### TC-AA-015: Selecting "Assign to Technician" shows Technician dropdown
- Select "Assign to Technician" from Against
- Verify the Technician dropdown appears
- Verify it is populated with all available technicians

### TC-AA-016: Technician dropdown is mandatory
- Select "Assign to Technician", leave Technician unselected
- Fill other required fields, click Save
- Verify validation error for Technician

### TC-AA-017: Complete Technician assignment saves successfully
- Select From = "Warehouse", choose a warehouse
- Select Against = "Assign to Technician", choose a technician
- Set Date of Assignment
- Click Save
- Verify success message
- Verify assignment appears in the list

---

## Test Suite 5: Against Dropdown — Assign to Job

### TC-AA-018: Selecting "Assign to Job" shows Site dropdown first
- Select "Assign to Job" from Against
- Verify Site dropdown appears
- Verify Job Number dropdown does NOT appear until a site is selected

### TC-AA-019: Job Number dropdown loads based on selected Site
- Select "Assign to Job", choose a Site
- Verify Job Number dropdown appears and is populated with jobs for that site

### TC-AA-020: Site dropdown is mandatory for Assign to Job
- Select "Assign to Job", leave Site unselected
- Attempt to save
- Verify validation error for Site

### TC-AA-021: Job Number dropdown is mandatory
- Select "Assign to Job", select a Site, leave Job Number unselected
- Attempt to save
- Verify validation error for Job Number

### TC-AA-022: Technician dropdown is also present for Assign to Job
- Select "Assign to Job"
- Verify Technician dropdown is present (same across all three Against options)
- Verify it is populated

### TC-AA-023: Complete Job assignment saves successfully
- Select From = "Site", choose a site
- Select Against = "Assign to Job", choose a Site, choose a Job Number, choose a Technician
- Set Date of Assignment
- Click Save
- Verify success message

### TC-AA-024: Changing Site in Assign to Job resets Job Number
- Select "Assign to Job", select Site A, note Job Numbers
- Change to Site B
- Verify Job Number dropdown resets and loads jobs for Site B

---

## Test Suite 6: Against Dropdown — Assign to PM

### TC-AA-025: Selecting "Assign to PM" shows Site dropdown first
- Select "Assign to PM" from Against
- Verify Site dropdown appears
- Verify PM Number dropdown does NOT appear until a site is selected

### TC-AA-026: PM Number dropdown loads based on selected Site
- Select "Assign to PM", choose a Site
- Verify PM Number dropdown appears with PM numbers for that site

### TC-AA-027: Site dropdown is mandatory for Assign to PM
- Select "Assign to PM", leave Site unselected
- Attempt to save
- Verify validation error for Site

### TC-AA-028: PM Number dropdown is mandatory
- Select "Assign to PM", select a Site, leave PM Number unselected
- Attempt to save
- Verify validation error for PM Number

### TC-AA-029: Technician dropdown is present for Assign to PM
- Select "Assign to PM"
- Verify Technician dropdown is present and populated

### TC-AA-030: Complete PM assignment saves successfully
- Select From = "Warehouse", choose a warehouse
- Select Against = "Assign to PM", choose a Site, choose a PM Number, choose a Technician
- Set Date of Assignment
- Click Save
- Verify success message

### TC-AA-031: Changing Site in Assign to PM resets PM Number
- Select "Assign to PM", select Site A, note PM Numbers
- Change to Site B
- Verify PM Number dropdown resets and loads PMs for Site B

---

## Test Suite 7: Technician Dropdown Consistency

### TC-AA-032: Technician dropdown is the same across all three Against options
- Select "Assign to Technician" — note technician list
- Switch to "Assign to Job" — note technician list
- Switch to "Assign to PM" — note technician list
- Verify all three show identical technician options

---

## Test Suite 8: Date of Assignment

### TC-AA-033: Date of Assignment accepts valid date
- Enter a valid date
- Verify it is accepted and saved

### TC-AA-034: Date of Assignment uses date picker
- Click the Date of Assignment field
- Verify a date picker opens
- Select a date and verify it populates the field

---

## Test Suite 9: Switching Against Option

### TC-AA-035: Switching Against clears previously visible sub-dropdowns
- Select "Assign to Technician", choose a technician
- Switch to "Assign to Job"
- Verify technician-specific state is cleared; Site and Job dropdowns appear fresh

### TC-AA-036: Switching Against from Job to PM resets dropdowns
- Select "Assign to Job", choose Site and Job
- Switch to "Assign to PM"
- Verify Job Number dropdown disappears; PM Number dropdown appears
- Verify Site dropdown resets

---

## Test Suite 10: Assignment List

### TC-AA-037: Created assignments appear in the list
- Create an assignment
- Verify it appears in the assignments list with correct From, Against, Date columns

### TC-AA-038: Assignment list shows all assignment types
- Create one of each type (Technician, Job, PM)
- Verify all three appear in the list
