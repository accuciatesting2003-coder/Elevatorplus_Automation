# Type of Lift Master - Test Plan

## Application Overview

This test plan covers the Type of Lift Master module located under Sales Masters in the ElevatorPlus application. The module allows administrators to manage different types of lifts (Passenger Lift / Goods Lift), their associated codes, and cost configurations including Licensing Cost, Man Power Cost, Extra Rope in Mtr, and Filler Weight Price Per Kg. The page is accessible at /master/type-of-lift-master after login. It includes a form to add/update lift type records, a searchable and filterable data table, bulk price update functionality (Bulk Update Lift Type Prices modal), Excel import, status management (Active/Inactive), and a note warning that changes impact quotation cost estimation. The form title changes between "Add Type of Lift" and "Update Type of Lift" depending on the mode. In edit mode an additional Status field (Active/Inactive) is shown and the Lift Type dropdown is disabled.

## Test Scenarios

### 1. Type of Lift Master

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-TLM-001: Verify Type of Lift Master page loads successfully

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to Sales Masters > Type of Lift from the left sidebar (URL: /master/type-of-lift-master).
    - expect: The page loads with the heading 'Type Of Lift Master' visible in the top navigation bar.
    - expect: The 'Add Type of Lift' form is visible on the left with the following fields: Type of Lift Name (mandatory), Lift Code (mandatory), Lift Type dropdown (mandatory), Licensing Cost (mandatory), Man Power Cost (optional), Extra Rope in Mtr (optional), Filler Weight Price Per kg (optional).
    - expect: The data table on the right displays existing records with columns: Sr. No., Action, Type of Lift Name, Lift Code, Lift Type, Licensing Cost, For Single Free PM Service, Extra Rope in Mtr, Filler Weight Price Per kg, Status.
    - expect: The toolbar above the table shows: Show entries dropdown (default 25), Status filter (default Active), Update Price button, Import Excel button, and a Search field labeled 'Search Type of Lift'.
    - expect: A warning note is displayed below the form fields: '⚠ Note: Changes in this master will impact quotation cost estimation.'
    - expect: Clear and Submit buttons are present below the form.

#### 1.2. TC-TLM-002: Verify successful Type of Lift creation with Passenger Lift type and all mandatory fields

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'Economy Passenger Lift') in the 'Type of Lift Name *' textbox.
    - expect: The Lift Code field auto-populates with an uppercase version derived from the entered name (e.g., 'ECONOMY PASSENGER LIFT').
  3. Verify the Lift Type dropdown defaults to 'Passenger Lift'. If needed, select 'Passenger Lift' from the 'Lift Type *' combobox (options: Select Lift Type, Passenger Lift, Goods Lift).
  4. Enter a valid numeric Licensing Cost (e.g., '5000') in the 'Licensing Cost *' spinbutton.
  5. Leave Man Power Cost, Extra Rope in Mtr, and Filler Weight Price Per kg fields empty.
  6. Click the 'Submit' button.
    - expect: A success message is displayed confirming the record was created.
    - expect: The new record 'Economy Passenger Lift' appears in the data table with Lift Type 'Passenger Lift', Licensing Cost '₹ 5,000', and Status 'Active'.
    - expect: The form resets to an empty 'Add Type of Lift' state.

#### 1.3. TC-TLM-003: Verify successful Type of Lift creation with Goods Lift type

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'Industrial Goods Carrier') in the 'Type of Lift Name *' textbox.
  3. Select 'Goods Lift' from the 'Lift Type *' combobox.
  4. Enter a valid Licensing Cost (e.g., '3000') in the 'Licensing Cost *' spinbutton.
  5. Click the 'Submit' button.
    - expect: The record 'Industrial Goods Carrier' is created with Lift Type 'Goods Lift' and displayed in the data table.
    - expect: Licensing Cost is shown as '₹ 3,000' in the table.

#### 1.4. TC-TLM-004: Verify successful creation with all optional fields filled

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a Type of Lift Name (e.g., 'Premium Cargo Lift') in the 'Type of Lift Name *' textbox.
  3. Select 'Goods Lift' from the 'Lift Type *' combobox.
  4. Enter '8000' in the 'Licensing Cost *' spinbutton.
  5. Enter '500' in the 'Man Power Cost' spinbutton.
  6. Enter '10' in the 'Extra Rope in Mtr' spinbutton.
  7. Enter '250' in the 'Filler Weight Price Per kg' textbox.
  8. Click the 'Submit' button.
    - expect: The record is created successfully with all fields saved.
    - expect: The data table row shows: Name 'Premium Cargo Lift', Lift Type 'Goods Lift', Licensing Cost '₹ 8,000', For Single Free PM Service '500', Extra Rope in Mtr '10', Filler Weight Price Per kg '₹ 250', Status 'Active'.

#### 1.5. TC-TLM-005: Verify form submission fails when Type of Lift Name is empty

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Leave the 'Type of Lift Name *' textbox blank.
  3. Select 'Passenger Lift' from the 'Lift Type *' combobox.
  4. Enter a valid Licensing Cost (e.g., '2000') in the 'Licensing Cost *' spinbutton.
  5. Click the 'Submit' button.
    - expect: A validation error is displayed for the Type of Lift Name field (e.g., field is highlighted or an error message appears).
    - expect: The form is not submitted and no new record is created in the data table.

#### 1.6. TC-TLM-006: Verify form submission fails when Lift Type is not selected

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'Test Lift No Type') in the 'Type of Lift Name *' textbox.
  3. Ensure the 'Lift Type *' combobox shows 'Select Lift Type' (i.e., no option is selected).
  4. Enter a valid Licensing Cost (e.g., '1000') in the 'Licensing Cost *' spinbutton.
  5. Click the 'Submit' button.
    - expect: A validation error is displayed for the Lift Type field.
    - expect: The form is not submitted and no new record is created.

#### 1.7. TC-TLM-007: Verify form submission fails when Licensing Cost is empty

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'No Cost Lift') in the 'Type of Lift Name *' textbox.
  3. Select 'Passenger Lift' from the 'Lift Type *' combobox.
  4. Leave the 'Licensing Cost *' spinbutton empty.
  5. Click the 'Submit' button.
    - expect: A validation error is displayed for the Licensing Cost field.
    - expect: The form is not submitted and no new record is created.

#### 1.8. TC-TLM-008: Verify validation when all mandatory fields are empty

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Leave all fields empty (Type of Lift Name, Lift Type set to 'Select Lift Type', Licensing Cost blank).
  3. Click the 'Submit' button.
    - expect: Validation error messages are shown for all three mandatory fields simultaneously (Type of Lift Name, Lift Type, Licensing Cost).
    - expect: The form is not submitted and no record is created in the data table.
  4. Click the 'Clear' button.
    - expect: All validation error messages disappear and all form fields reset to their default empty/unselected state.

#### 1.9. TC-TLM-009: Verify Lift Code auto-generation from Type of Lift Name

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Click on the 'Type of Lift Name *' textbox and type 'Standard Traction Lift' character by character.
    - expect: As the name is typed, the 'Lift Code *' textbox auto-populates with an uppercase representation (e.g., 'STANDARD TRACTION LIFT').
  3. Manually clear the Lift Code field and enter a custom code (e.g., 'STL-CUSTOM').
    - expect: The Lift Code field accepts manual editing and retains the custom code 'STL-CUSTOM'.

#### 1.10. TC-TLM-010: Verify Licensing Cost field rejects alphabetic and special character input

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name and select a Lift Type.
  3. Attempt to type alphabetic characters (e.g., 'abc') in the 'Licensing Cost *' spinbutton.
    - expect: The spinbutton field does not accept or display alphabetic input (number input type blocks non-numeric characters).
  4. Attempt to type special characters (e.g., '@#$') in the 'Licensing Cost *' spinbutton.
    - expect: The field rejects or ignores special character input.
    - expect: Click Submit — if any non-numeric value managed to appear, a validation error is shown and the form is not submitted.

#### 1.11. TC-TLM-011: Verify Licensing Cost field rejects negative values

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'Negative Cost Test') and select 'Passenger Lift'.
  3. Enter '-1000' in the 'Licensing Cost *' spinbutton.
  4. Click the 'Submit' button.
    - expect: A validation error is shown indicating the licensing cost must be a positive number, or the value is rejected.
    - expect: The form is not submitted and no record is created.

#### 1.12. TC-TLM-012: Verify Licensing Cost accepts zero as a valid value

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter a valid Type of Lift Name (e.g., 'Zero Cost Lift') in the 'Type of Lift Name *' textbox.
  3. Select 'Passenger Lift' from the 'Lift Type *' combobox.
  4. Enter '0' in the 'Licensing Cost *' spinbutton.
  5. Click the 'Submit' button.
    - expect: The record is created successfully with Licensing Cost displayed as '0' or '₹ 0' in the data table.
    - expect: The new record appears in the table with Status 'Active'.

#### 1.13. TC-TLM-013: Verify duplicate Type of Lift Name with same Lift Type is rejected

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Create a record with Type of Lift Name 'Standard Duplex Lift', Lift Type 'Passenger Lift', and Licensing Cost '1500'. Click Submit.
    - expect: First record 'Standard Duplex Lift' is created successfully and appears in the data table.
  2. In the Add Type of Lift form, enter the exact same Type of Lift Name 'Standard Duplex Lift', select the same Lift Type 'Passenger Lift', and enter a Licensing Cost. Click Submit.
    - expect: The system displays a duplicate entry error message and prevents saving the second record with the same name and lift type combination.

#### 1.14. TC-TLM-014: Verify same Type of Lift Name can be used with different Lift Type

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Create a record with Type of Lift Name 'Multipurpose Lift', Lift Type 'Passenger Lift', and Licensing Cost '2000'. Click Submit.
    - expect: Record 'Multipurpose Lift' (Passenger Lift) is created successfully.
  2. In the Add Type of Lift form, enter the same Type of Lift Name 'Multipurpose Lift', but select Lift Type 'Goods Lift', and enter Licensing Cost '2500'. Click Submit.
    - expect: The system allows creating a second record with the same name but a different lift type.
    - expect: Both records ('Multipurpose Lift - Passenger Lift' and 'Multipurpose Lift - Goods Lift') appear in the data table.

#### 1.15. TC-TLM-015: Verify Edit functionality for an existing record

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Locate an existing record in the data table.
  2. Click the Edit icon (pencil/Edit img) in the Action column of an existing record.
    - expect: The form heading changes from 'Add Type of Lift' to 'Update Type of Lift'.
    - expect: The form is pre-populated with the record's current values for all fields: Type of Lift Name, Lift Code, Lift Type (disabled/read-only in edit mode), Licensing Cost, Man Power Cost, Extra Rope in Mtr, Filler Weight Price Per kg.
    - expect: An additional 'Status *' combobox appears in the update form with options: Select Status, Active, Inactive.
  3. Modify the Type of Lift Name to a new valid value (e.g., append ' Updated').
  4. Modify the Licensing Cost to a new value (e.g., '9999').
  5. Click the 'Update' button.
    - expect: The record is updated with the new values.
    - expect: The updated values are reflected in the data table immediately.
    - expect: The form reverts to the 'Add Type of Lift' state.

#### 1.16. TC-TLM-016: Verify Lift Type field is disabled in Edit mode

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Click the Edit icon for any existing record.
    - expect: The 'Update Type of Lift' form opens with all current values pre-filled.
  3. Attempt to interact with the 'Lift Type *' combobox in the update form.
    - expect: The Lift Type dropdown is disabled (read-only) in edit mode — the user cannot change the Lift Type of an existing record.
    - expect: The combobox is visually indicated as disabled.

#### 1.17. TC-TLM-017: Verify setting a record status to Inactive

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the Edit icon on an existing active record.
    - expect: The 'Update Type of Lift' form opens with Status field showing 'Active'.
  2. Change the 'Status *' combobox from 'Active' to 'Inactive'.
  3. Click the 'Update' button.
    - expect: The record status is changed to 'Inactive'.
    - expect: With the default Active filter applied in the data table, the record is no longer visible.
    - expect: When the Inactive or All filter is applied, the record appears with status 'Inactive'.

#### 1.18. TC-TLM-018: Verify restoring a record from Inactive to Active

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Change the Status filter dropdown to 'Inactive' to view inactive records.
    - expect: Inactive records are displayed in the data table.
  2. Click the Edit icon on an existing inactive record.
    - expect: The 'Update Type of Lift' form opens with the Status field showing 'Inactive'.
  3. Change the 'Status *' combobox from 'Inactive' to 'Active'.
  4. Click the 'Update' button.
    - expect: The record status is changed back to 'Active'.
    - expect: When the Active filter is applied, the record reappears in the data table with status 'Active'.

#### 1.19. TC-TLM-019: Verify Clear button discards unsaved form data in Add mode

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Enter data in the following fields: Type of Lift Name (e.g., 'Clear Test Lift'), Licensing Cost (e.g., '1234'), Man Power Cost (e.g., '100'), Extra Rope in Mtr (e.g., '5'), Filler Weight Price Per kg (e.g., '50').
  3. Click the 'Clear' button.
    - expect: All form fields (Type of Lift Name, Lift Code, Lift Type, Licensing Cost, Man Power Cost, Extra Rope in Mtr, Filler Weight Price Per kg) are cleared/reset to their default empty state.
    - expect: The Lift Type dropdown reverts to 'Passenger Lift' or the default option.
    - expect: No record is created. The data table remains unchanged.

#### 1.20. TC-TLM-020: Verify Clear button on Update form resets to Add form state

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the Edit icon on an existing record.
    - expect: The 'Update Type of Lift' form opens with the record's current data pre-filled, including the Status field.
  2. Click the 'Clear' button on the Update form.
    - expect: The form is cleared and reverts to 'Add Type of Lift' mode.
    - expect: All fields are emptied and the Status dropdown (only visible in edit mode) is hidden.
    - expect: No changes are saved to the original record in the data table.

#### 1.21. TC-TLM-021: Verify default Active status filter on page load

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Observe the Status filter combobox in the data table toolbar without changing anything.
    - expect: The Status filter combobox shows 'Active' as the selected default option.
    - expect: Only active Type of Lift records are displayed in the data table.
    - expect: All visible records show 'Active' in the Status column.

#### 1.22. TC-TLM-022: Verify Active filter shows only active records

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Ensure there are both active and inactive records in the system.
  2. Select 'Active' from the Status filter combobox in the data table toolbar.
    - expect: Only active Type of Lift records are displayed.
    - expect: All displayed records show 'Active' in the Status column.
    - expect: Inactive records are not visible.

#### 1.23. TC-TLM-023: Verify Inactive filter shows only inactive records

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Select 'Inactive' from the Status filter combobox in the data table toolbar.
    - expect: Only inactive Type of Lift records are displayed in the data table.
    - expect: All displayed records show 'Inactive' in the Status column.
    - expect: If no inactive records exist, the table shows an empty state or 'No records found' message.

#### 1.24. TC-TLM-024: Verify All filter shows both active and inactive records

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Select 'All' from the Status filter combobox in the data table toolbar.
    - expect: Both active and inactive Type of Lift records are displayed in the data table.
    - expect: Records with 'Active' and 'Inactive' status values are both visible.

#### 1.25. TC-TLM-025: Verify Search functionality by Type of Lift Name

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Type a partial or full Type of Lift Name that exists in the table (e.g., 'Passenger') in the 'Search Type of Lift' textbox in the data table toolbar.
    - expect: The data table filters in real time, displaying only records whose Type of Lift Name matches the search term.
    - expect: Records not matching the search term are hidden.
  3. Clear the search field (delete all typed text).
    - expect: The data table returns to showing all records matching the current status filter.

#### 1.26. TC-TLM-026: Verify Show entries dropdown controls pagination

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
    - expect: The 'Show:' combobox defaults to '25' entries per page.
  2. Change the 'Show:' combobox from '25' to '10'.
    - expect: The data table updates to show a maximum of 10 records per page.
    - expect: Pagination controls update accordingly.
  3. Change the 'Show:' combobox to '50'.
    - expect: The data table updates to show up to 50 records per page.
  4. Change the 'Show:' combobox to '100'.
    - expect: The data table updates to show up to 100 records per page.

#### 1.27. TC-TLM-027: Verify Update Price (Bulk Update Lift Type Prices) modal opens correctly

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Click the 'Update Price' button in the data table toolbar.
    - expect: A modal dialog titled 'Bulk Update Lift Type Prices' opens.
    - expect: The modal contains a Search input field.
    - expect: The modal table displays records with the following columns: Sr. No., Type Of Lift, Lift Type, Man Power Cost, Extra Rope In Mtr, Filler Weight Price Per Kg, New Filler Weight Price Per Kg (editable input with placeholder 'Enter new filler weight price per k'), Price (current licensing cost), New Price (editable input with placeholder 'Enter new price').
    - expect: Cancel and Submit Updates buttons are present at the bottom of the modal.

#### 1.28. TC-TLM-028: Verify bulk price update with valid new prices submits successfully

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Lift Type Prices' modal opens.
  2. Enter a valid new price (e.g., '9500') in the 'Enter new price' input for one or more records in the modal table.
  3. Click the 'Submit Updates' button.
    - expect: The prices for the updated records are saved successfully.
    - expect: The modal closes after submission.
    - expect: The updated Licensing Cost values are reflected in the data table on the Type of Lift Master page.

#### 1.29. TC-TLM-029: Verify Cancel button closes the Update Price modal without saving

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Lift Type Prices' modal opens.
  2. Enter new price values in one or more rows in the modal.
  3. Click the 'Cancel' button in the modal.
    - expect: The modal closes without saving any changes.
    - expect: The Licensing Cost values in the data table remain unchanged.

#### 1.30. TC-TLM-030: Verify search within the Bulk Update Lift Type Prices modal

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Lift Type Prices' modal opens with the full list of lift type records.
  2. Type a search term in the Search input within the modal (e.g., 'Passenger').
    - expect: The modal table filters to show only records matching the search term.
    - expect: Records not matching are hidden, making it easier to find specific records for price update.
  3. Clear the search field in the modal.
    - expect: The full list of records is restored in the modal table.

#### 1.31. TC-TLM-031: Verify X (Close) button dismisses the Update Price modal without saving

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Lift Type Prices' modal opens.
  2. Enter new price values in one or more rows in the modal.
  3. Click the 'X' (Close) button at the top-right corner of the modal.
    - expect: The modal closes without saving any changes.
    - expect: The data table on the Type of Lift Master page remains unchanged.

#### 1.32. TC-TLM-032: Verify Import Excel modal opens with correct elements

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Click the 'Import Excel' button in the data table toolbar.
    - expect: A modal dialog titled 'Import Excel' opens.
    - expect: The modal contains: a 'Choose File' file upload button for selecting an Excel file, a 'Download Import Format' button to download a template Excel file, an 'Import Excel' submit button, and a 'Cancel' button.
  3. Click the 'Download Import Format' button.
    - expect: An Excel template file is downloaded to the user's system for reference on the correct import format.
  4. Click the 'Cancel' button.
    - expect: The Import Excel modal closes without uploading any file.

<!-- #### 1.33. TC-TLM-033: Verify Import Excel with a valid Excel file

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Import Excel' button.
    - expect: The 'Import Excel' modal opens.
  2. Click 'Download Import Format' to obtain the correct Excel template. Fill in valid lift type data in the template (Type of Lift Name, Lift Code, Lift Type, Licensing Cost).
  3. Click the 'Choose File' button in the modal and select the prepared Excel file.
    - expect: The selected file name is shown next to the Choose File button.
  4. Click the 'Import Excel' submit button.
    - expect: The system processes the file and imports the records.
    - expect: A success message is displayed.
    - expect: The new records appear in the data table. -->

#### 1.34. TC-TLM-034: Verify Import Excel rejects an invalid or wrong-format file  

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page. Click the 'Import Excel' button.
    - expect: The 'Import Excel' modal opens.
  2. Click the 'Choose File' button and select a non-Excel file (e.g., a .txt or .pdf file) or an Excel file with incorrect column headers.
  3. Click the 'Import Excel' submit button.
    - expect: The system displays an error message indicating the file format is invalid or the data is incorrect.
    - expect: No records are imported into the data table.

#### 1.35. TC-TLM-035: Verify column header sorting in the data table

**File:** `tests/Sales-master/type-of-lift-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Type of Lift Master page.
  2. Click the 'Type of Lift Name' column header button in the data table.
    - expect: The data table is sorted by Type of Lift Name in ascending alphabetical order.
    - expect: A sort indicator (arrow icon) is visible on the column header.
  3. Click the 'Type of Lift Name' column header button again.
    - expect: The data table is sorted by Type of Lift Name in descending alphabetical order.
  4. Click the 'Lift Code' column header button.
    - expect: The data table is sorted by Lift Code alphabetically.
    - expect: A sort indicator is visible on the Lift Code column header.
  5. Click the 'Licensing Cost' column header button.
    - expect: The data table is sorted by Licensing Cost in ascending numeric order.
