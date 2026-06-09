# Test Plan: Asset Report

## Module: Asset Management > Asset Report

---

## Test Suite 1: Page Load & Tab Navigation

### TC-ARR-001: Asset Report page loads successfully
- Navigate to Asset Management > Asset Report
- Verify the page heading is visible
- Verify three tabs/sections are present: Inventory, Engineer Wise, Site Wise

### TC-ARR-002: Inventory tab is active by default
- Verify that on page load the Inventory section is displayed by default

### TC-ARR-003: Engineer Wise tab navigates correctly
- Click on "Engineer Wise" tab
- Verify the Engineer Wise section content loads

### TC-ARR-004: Site Wise tab navigates correctly
- Click on "Site Wise" tab
- Verify the Site Wise section content loads

---

## Test Suite 2: Inventory Section — Filters

### TC-ARR-005: Inventory section shows Warehouse and Status dropdowns
- Navigate to the Inventory tab
- Verify the Warehouse dropdown is present
- Verify the Status dropdown is present

### TC-ARR-006: Warehouse dropdown is populated with available warehouses
- Open the Warehouse dropdown
- Verify all warehouses are listed

### TC-ARR-007: Status dropdown is populated with asset statuses
- Open the Status dropdown
- Verify status options match statuses used during Asset Return (e.g., Good, Damaged, Under Repair, etc.)

### TC-ARR-008: Inventory data loads without filters (all data)
- Navigate to Inventory tab without selecting any filter
- Verify inventory data is displayed (all warehouse, all statuses)

---

## Test Suite 3: Inventory Section — Filtering

### TC-ARR-009: Filter by Warehouse shows only that warehouse's assets
- Select a specific warehouse from the Warehouse dropdown
- Verify the displayed assets belong only to the selected warehouse

### TC-ARR-010: Filter by Status shows only assets with that status
- Select a specific status from the Status dropdown
- Verify only assets with that status are shown

### TC-ARR-011: Filter by both Warehouse and Status
- Select a specific warehouse and a specific status
- Verify results are filtered by both criteria simultaneously

### TC-ARR-012: No results when filter combination has no matching data
- Select a warehouse and status combination with no data
- Verify "No records found" or equivalent empty state

### TC-ARR-013: Clearing filters restores all data
- Apply a filter, then clear/reset the filters
- Verify all inventory data is restored

### TC-ARR-014: Asset returned with status "Good" appears in Inventory with "Good" status
- Prerequisite: complete an asset return with status = Good
- Navigate to Inventory, filter by that status
- Verify the asset appears

### TC-ARR-015: Asset returned with status "Damaged" appears filtered under "Damaged"
- Prerequisite: complete a return with status = Damaged
- Filter Inventory by Damaged status
- Verify the asset is listed

---

## Test Suite 4: Inventory Section — Data Columns

### TC-ARR-016: Inventory table displays expected columns
- Navigate to Inventory
- Verify columns include: Asset Name, Serial Number, Warehouse, Status, Quantity (or similar expected columns)

### TC-ARR-017: Data in inventory matches what was entered in Asset Product Master
- Cross-check serial number and warehouse values with data from Asset Product Master

---

## Test Suite 5: Engineer Wise Section — Technician Dropdown

### TC-ARR-018: Engineer Wise section shows Technician Name dropdown
- Navigate to Engineer Wise tab
- Verify the Technician Name dropdown is present

### TC-ARR-019: Technician dropdown lists all technicians
- Open the Technician Name dropdown
- Verify all technicians (including those with assigned assets) are listed

### TC-ARR-020: No data shown before selecting a technician
- Navigate to Engineer Wise without selecting a technician
- Verify the assets section is empty or shows a prompt to select a technician

---

## Test Suite 6: Engineer Wise Section — Asset Data

### TC-ARR-021: Selecting a technician loads their assigned assets
- Select a technician who has assigned assets
- Verify the assets list/table is populated

### TC-ARR-022: No assets shown for technician with no assignments
- Select a technician with no assigned assets
- Verify empty state message

### TC-ARR-023: Engineer Wise table has View button for each asset
- Select a technician with assets
- Verify each asset row has a "View" button

### TC-ARR-024: Clicking View opens detailed data for that asset
- Click the View button on an asset row
- Verify a detail view/modal opens

### TC-ARR-025: Detail view shows Issued Date
- Open the detail view for an asset
- Verify Issued Date column is present and populated

### TC-ARR-026: Detail view shows Serial Number
- Verify Serial Number column is present in the detail view

### TC-ARR-027: Detail view shows Assigned Qty
- Verify Assigned Qty column is present and reflects correct value

### TC-ARR-028: Detail view shows Available Qty
- Verify Available Qty column is present and correct

### TC-ARR-029: Detail view shows Returned Qty
- Verify Returned Qty column is present and correct

### TC-ARR-030: Available Qty = Assigned Qty - Returned Qty
- Verify: Available Qty = Assigned Qty - Returned Qty for each row

### TC-ARR-031: Returned Qty updates correctly after an asset return
- Note Returned Qty before a return
- Perform an asset return for the same technician
- Refresh/re-open the Engineer Wise view
- Verify Returned Qty has increased accordingly

---

## Test Suite 7: Site Wise Section — Site Display

### TC-ARR-032: Site Wise section displays site-level asset data
- Navigate to Site Wise tab
- Verify sites with asset assignments are listed

### TC-ARR-033: Site Wise table has View button for each site
- Verify each site row has a "View" button

### TC-ARR-034: Clicking View opens detailed asset data for the site
- Click View on a site row
- Verify a detail view opens

### TC-ARR-035: Site Wise detail shows Assigned Asset Names
- Verify the detail view lists all assigned asset names for that site

### TC-ARR-036: Site Wise detail shows Assigned Dates
- Verify Assigned Date column is present in the detail view

### TC-ARR-037: Site Wise detail shows Serial Number
- Verify Serial Number column is present in the detail view

### TC-ARR-038: Site Wise detail shows Assigned Qty
- Verify Assigned Qty column is present and correct

### TC-ARR-039: Site Wise detail shows Available Qty
- Verify Available Qty column is present and correct

### TC-ARR-040: Site Wise detail shows Returned Qty
- Verify Returned Qty column is present and correct

### TC-ARR-041: Available Qty = Assigned Qty - Returned Qty (Site Wise)
- Verify the qty arithmetic is correct in Site Wise detail view

### TC-ARR-042: Returned asset data is reflected in Site Wise report
- Complete a return against a Job/PM linked to a site
- Navigate to Site Wise, open that site's detail
- Verify Returned Qty updated and Available Qty decreased

---

## Test Suite 8: Cross-Section Consistency

### TC-ARR-043: Total returned qty is consistent across Inventory, Engineer Wise, Site Wise
- Return an asset with qty = 2 (for a technician on a specific site)
- Verify Inventory shows status with qty 2
- Verify Engineer Wise shows Returned Qty = 2 for that technician
- Verify Site Wise shows Returned Qty = 2 for that site

### TC-ARR-044: Asset Report reflects real-time state after new assignments
- Assign an asset after viewing the report
- Refresh the report
- Verify new assignment data appears

---

## Test Suite 9: Empty States

### TC-ARR-045: Inventory empty state when no assets exist in warehouse
- Apply a filter for a warehouse with no assets
- Verify empty state message

### TC-ARR-046: Engineer Wise empty state when no assignments exist
- Select a technician with no assignments
- Verify empty state message

### TC-ARR-047: Site Wise empty state when no assignments exist for a site
- If a site has no asset assignments
- Verify it either doesn't appear or shows empty state on View
