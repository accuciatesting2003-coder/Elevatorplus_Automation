# Landing Door Master - Test Plan

## Application Overview

This test plan covers the Landing Door Master module located under Sales Masters in the ElevatorPlus application. The module allows administrators to manage different types of landing doors, their door opening mechanisms, and their associated pricing. The page is accessible at /master/landing-door-master after login. It includes a form to add/update landing door records, a searchable and filterable data table, bulk price update functionality, Excel import/export, and status management (Active/Inactive).

## Test Scenarios

### 1. Landing Door Master

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-LDM-001: Verify Landing Door Master page loads successfully

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to Sales Masters > Landing Door from the left sidebar.
    - expect: Landing Door Master page loads correctly with the Add Landing Door form visible, the data table displayed, and all 3 mandatory fields (Landing Door Name, Door Opening Type, Price) visible in the form.

#### 1.2. TC-LDM-002: Verify successful landing door creation with Manual opening type

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name (e.g., 'Steel Frame Landing Door') in the Landing Door Name field.
  3. Select 'Manual' from the Door Opening Type dropdown.
  4. Enter a valid numeric price (e.g., '5000') in the Price field.
  5. Click the Submit button.
    - expect: Landing door record is created successfully and appears in the data table with the correct name, 'manual' opening type, and price displayed.

#### 1.3. TC-LDM-003: Verify successful landing door creation with Automatic opening type

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name (e.g., 'Glass Automatic Landing Door') in the Landing Door Name field.
  3. Select 'Automatic' from the Door Opening Type dropdown.
  4. Enter a valid numeric price (e.g., '8500') in the Price field.
  5. Click the Submit button.
    - expect: Landing door record is saved with 'automatic' type and displayed in the data table with the correct values.

#### 1.4. TC-LDM-004: Verify form submission fails when Landing Door Name is empty

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Leave the Landing Door Name field blank.
  3. Select a Door Opening Type (e.g., 'Manual') from the dropdown.
  4. Enter a valid numeric Price (e.g., '3000').
  5. Click the Submit button.
    - expect: A validation error is shown for the Landing Door Name field. The form is not submitted and no record is created.

#### 1.5. TC-LDM-005: Verify form submission fails when Door Opening Type is not selected

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name (e.g., 'Wooden Landing Door').
  3. Do not select any option from the Door Opening Type dropdown (leave it as 'Select Opening Type').
  4. Enter a valid numeric Price (e.g., '2500').
  5. Click the Submit button.
    - expect: A validation error is shown for the Door Opening Type field. The form is not submitted.

#### 1.6. TC-LDM-006: Verify form submission fails when Price is empty

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name (e.g., 'Aluminium Landing Door').
  3. Select 'Automatic' from the Door Opening Type dropdown.
  4. Leave the Price field blank.
  5. Click the Submit button.
    - expect: A validation error is shown for the Price field. The form is not submitted.

#### 1.7. TC-LDM-007: Verify Price field rejects alphabetic and special character input

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name and select a Door Opening Type.
  3. Enter alphabetic characters (e.g., 'abc') in the Price field.
  4. Click the Submit button.
    - expect: The Price field rejects non-numeric input either by blocking keystrokes or by displaying a validation error. The form is not submitted.

#### 1.8. TC-LDM-008: Verify Price field rejects negative values

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name and select a Door Opening Type.
  3. Enter a negative value (e.g., '-500') in the Price field.
  4. Click the Submit button.
    - expect: A validation error is shown indicating that the price must be a positive number. The form is not submitted.

#### 1.9. TC-LDM-009: Verify duplicate Landing Door Name is not allowed

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and create a record with Landing Door Name 'Standard Landing Door', Door Opening Type 'Manual', and Price '1000'. Click Submit.
    - expect: First record is created successfully.
  2. In the same Add Landing Door form, enter the same Landing Door Name 'Standard Landing Door', select same opening type which is selected for privious record  , and enter a Price. Click Submit.
    - expect: The system displays a duplicate entry error message and prevents saving the second record with the same name.

#### 1.10. TC-LDM-010: Verify Edit functionality for an existing landing door record

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and locate an existing record in the data table.
  2. Click the Edit (pencil icon) button on an existing record.
    - expect: The form changes to 'Update Landing Door' mode with the current values pre-populated including the Status field.
  3. Modify the Landing Door Name, Door Opening Type, and/or Price to new valid values.
  4. Click the Update button.
    - expect: The record is updated with the new values and the changes are reflected in the data table immediately.

#### 1.11. TC-LDM-011: Verify Inactive status functionality

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and click Edit on an existing active record.
    - expect: The Update Landing Door form opens with Status field showing 'Active'.
  2. Change the Status dropdown from 'Active' to 'Inactive'.
  3. Click the Update button.
    - expect: The record status is changed to Inactive. When the default Active filter is applied, the record is no longer visible. The record appears when the Inactive or All filter is applied.

#### 1.12. TC-LDM-012: Verify Clear button discards unsaved form data

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter data in the Landing Door Name field (e.g., 'Test Clear Door'), select a Door Opening Type, and enter a Price.
  3. Click the Clear button.
    - expect: All form fields (Landing Door Name, Door Opening Type, Price) are cleared/reset to their default empty state. No record is created. The data table remains unchanged.

#### 1.13. TC-LDM-013: Verify data table displays all active records correctly

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Observe the data table with the default Active filter applied.
    - expect: The data table displays all active landing door records with all columns visible: Sr. No., Action, Landing Door Name, Door Opening Type, Price, Additional Info columns (Image, File, String, Date, Multiline), and Status.

#### 1.14. TC-LDM-014: Verify mandatory field validation when all fields are empty

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Leave all mandatory fields (Landing Door Name, Door Opening Type, Price) empty.
  3. Click the Submit button.
    - expect: Validation error messages are shown for all three mandatory fields simultaneously. The form is not submitted.
  4. Click the Clear button.
    - expect: All validation error messages disappear and all form fields are reset to their default empty/unselected state.

#### 1.15. TC-LDM-015: Verify creation of two records with same opening type but different names

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page. Create a record with Landing Door Name 'Door Type A', Door Opening Type 'Manual', and Price '1000'. Click Submit.
    - expect: First record 'Door Type A' is created successfully.
  2. In the Add Landing Door form, enter Landing Door Name 'Door Type B', select the same Door Opening Type 'Manual', and enter Price '2000'. Click Submit.
    - expect: The system allows creating the second record with the same opening type ('Manual') but a different name. Both records appear in the data table.

#### 1.16. TC-LDM-016: Verify inactive record display state with Inactive filter

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page. Edit an existing active record and change its status to 'Inactive'. Click Update.
    - expect: Record is saved as Inactive.
  2. In the data table, change the Status filter dropdown from 'Active' to 'Inactive'.
    - expect: The data table displays only inactive records, including the record just set to Inactive. The record shows 'Inactive' status.

#### 1.17. TC-LDM-017: Verify duplicate entry restriction for same Name and Opening Type combination

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page. Identify an existing record with a specific Landing Door Name and Door Opening Type combination.
  2. Attempt to create a new record with the exact same Landing Door Name and the same Door Opening Type. Click Submit.
    - expect: The system shows an error message indicating the duplicate entry is not allowed. The form is not submitted and no new record is created.

#### 1.18. TC-LDM-018: Verify error when updating a record to match another existing active record

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page. Note the details (Landing Door Name and Door Opening Type) of an existing active record (Record A).
  2. Click Edit on a different active record (Record B).
    - expect: Update Landing Door form opens with Record B's current data.
  3. Change Record B's Landing Door Name and Door Opening Type to match exactly the values of Record A. Click the Update button.
    - expect: The system displays an error message and prevents the update, since it would create a duplicate active entry matching Record A.

#### 1.19. TC-LDM-019: Verify error when updating a record to match an existing inactive record

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page. Identify the details (Landing Door Name and Door Opening Type) of an existing inactive record using the Inactive filter.
  2. Click Edit on an active record and change its Landing Door Name and Door Opening Type to exactly match those of the inactive record. Click the Update button.
    - expect: The system displays an error message and prevents the update, preventing creation of an entry that matches an existing inactive record.

#### 1.20. TC-LDM-020: Verify default Active filter is applied on page load

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Observe the Status filter dropdown in the data table toolbar without changing anything.
    - expect: The Status filter dropdown shows 'Active' as the selected default option. Only active landing door records are displayed in the data table.

#### 1.21. TC-LDM-021: Verify Active filter functionality in data table

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Ensure there are both active and inactive records. Select 'Active' from the Status filter dropdown in the data table toolbar.
    - expect: Only active landing door records are displayed. All displayed records show 'Active' in the Status column.

#### 1.22. TC-LDM-022: Verify Inactive filter functionality in data table

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Select 'Inactive' from the Status filter dropdown in the data table toolbar.
    - expect: Only inactive landing door records are displayed. All displayed records show 'Inactive' in the Status column. If no inactive records exist, the table shows an empty state message.

#### 1.23. TC-LDM-023: Verify All filter functionality in data table

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Select 'All' from the Status filter dropdown in the data table toolbar.
    - expect: Both active and inactive landing door records are displayed in the data table. Records with both 'Active' and 'Inactive' statuses are visible.

#### 1.24. TC-LDM-024: Verify search functionality by Landing Door Name

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. In the Search field (labeled 'Search Landing Door Name' or 'Search Door Opening Type'), type a partial or full Landing Door Name that exists in the list (e.g., 'Steel').
    - expect: The data table filters in real time and displays only the records that match the search term. Records not matching the search are hidden.
  3. Clear the search field.
    - expect: The data table returns to showing all records that match the current status filter.

#### 1.25. TC-LDM-025: Verify Export Excel functionality

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Click the 'Export Excel' button in the data table toolbar.
    - expect: An Excel file is downloaded to the user's system. The exported sheet contains all data currently displayed in the data table, including all columns: Sr. No., Landing Door Name, Door Opening Type, Price, and Status (and any Additional Info columns if populated).

#### 1.26. TC-LDM-026: Verify Update Price (Bulk Price Update) modal opens correctly

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Click the 'Update Price' button in the data table toolbar.
    - expect: A modal dialog titled 'Bulk Update Landing Door Prices' opens. The modal contains a search box and a table listing all landing door records with columns: Sr. No., Landing Door Name, Opening Type, Price, and New Price (editable text input for each row).

#### 1.27. TC-LDM-027: Verify bulk price update with valid new prices

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and click 'Update Price' button.
    - expect: Bulk Update Landing Door Prices modal opens.
  2. Enter a valid new price (e.g., '9999') in the 'Enter new price' input for one or more records in the modal table.
  3. Click the 'Submit Updates' button.
    - expect: The prices for the selected records are updated successfully. The modal closes. The updated prices are reflected in the data table on the Landing Door Master page.

#### 1.28. TC-LDM-028: Verify Cancel button closes the Update Price modal without saving

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and click 'Update Price' button.
    - expect: Bulk Update Landing Door Prices modal opens.
  2. Enter new price values in one or more rows in the modal.
  3. Click the 'Cancel' button in the modal.
    - expect: The modal closes without saving any changes. The prices in the data table remain unchanged.

#### 1.29. TC-LDM-029: Verify search within the Update Price modal

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and click 'Update Price' button.
    - expect: Bulk Update Landing Door Prices modal opens with full list of records.
  2. Type a search term in the Search field within the modal (e.g., a partial landing door name).
    - expect: The modal table filters to show only matching records based on the search term, making it easier to find specific records for price update.

#### 1.30. TC-LDM-030: Verify Show entries (rows per page) dropdown functionality

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Locate the 'Show' dropdown in the data table toolbar. Change the number of entries from the default '25' to '10'.
    - expect: The data table updates to show only 10 records per page.
  3. Change the Show dropdown to '50'.
    - expect: The data table updates to show up to 50 records per page.
  4. Change the Show dropdown to '100'.
    - expect: The data table updates to show up to 100 records per page.

#### 1.31. TC-LDM-031: Verify Price field accepts zero as a valid value

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Enter a valid Landing Door Name (e.g., 'Zero Price Door') and select a Door Opening Type.
  3. Enter '0' in the Price field and click Submit.
    - expect: The record is created successfully with a price of 0 (displayed as '0' or '₹ 0' in the data table).

#### 1.32. TC-LDM-032: Verify Update Price modal closes using the X (Close) button

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page and click the 'Update Price' button.
    - expect: Bulk Update Landing Door Prices modal opens.
  2. Click the 'X' (Close) button at the top-right of the modal.
    - expect: The modal closes without saving any changes. The data table remains unchanged.

<!-- #### 1.33. TC-LDM-033: Verify column sorting functionality in the data table

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Click on the 'Landing Door Name' column header button.
    - expect: The data table is sorted by Landing Door Name in ascending alphabetical order. A sort indicator (arrow icon) is visible on the column header.
  3. Click the 'Landing Door Name' column header button again.
    - expect: The data table is sorted by Landing Door Name in descending alphabetical order. -->

#### 1.34. TC-LDM-034: Verify Clear button on Update form resets to Add form state

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Click Edit on an existing record to open the 'Update Landing Door' form.
    - expect: The Update Landing Door form opens with the record's data pre-filled, including the Status field.
  3. Click the Clear button on the Update form.
    - expect: The form is cleared and reverts to 'Add Landing Door' mode. All fields are emptied and the Status dropdown (only visible in edit mode) is hidden. No changes are saved to the original record.

#### 1.35. TC-LDM-035: Verify Import Excel button is accessible

**File:** `tests/Sales-master/landing-door-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Landing Door Master page.
  2. Click the 'Import Excel' button in the data table toolbar.
    - expect: A file upload dialog or import interface is presented, allowing the user to select and upload an Excel file to bulk import landing door records.
