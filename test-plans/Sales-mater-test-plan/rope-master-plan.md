# Rope Master - Test Plan

## Application Overview

This test plan covers the Rope Master module located under Sales Masters in the ElevatorPlus application. The module allows administrators to manage rope types and their associated per-metre pricing used in elevator quotation cost estimation. The page is accessible at /master/rope-master after login. It includes a form to add/update rope records with two mandatory fields (Rope Type and Price Per Meter), a searchable and filterable data table, bulk price update functionality via a modal, an Import button for bulk data import, and status management (Active/Inactive). A note on the form warns that changes to this master will impact quotation cost estimation.

## Test Scenarios

### 1. Rope Master

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-RM-001: Verify Rope Master page loads successfully

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Log in to the admin panel using valid credentials (Mobile: 9209365301, Password: Shravani@123).
  2. Navigate to Sales Masters > Rope Master from the left sidebar.
    - expect: Rope Master page loads correctly with the heading 'Rope Master' visible in the navigation bar, the 'Add Rope' form section visible with Rope Type and Price Per Meter fields, and the data table displayed below. The Status filter defaults to 'Active'. The table columns Sr. No., Action, Rope Type, Price Per Meter, Status, and Additional Info-rope Image are all visible.

#### 1.2. TC-RM-002: Verify successful rope record creation with valid data

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Steel Wire Rope 6x19') in the Rope Type field.
  3. Enter a valid numeric price (e.g., '250') in the Price Per Meter field.
  4. Click the Submit button.
    - expect: The rope record is created successfully and appears in the data table with the correct Rope Type ('Steel Wire Rope 6x19') and Price Per Meter ('₹ 250') displayed. The form resets to its default empty state after successful submission.

#### 1.3. TC-RM-003: Verify form submission fails when all fields are empty

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Leave both the Rope Type and Price Per Meter fields empty.
  3. Click the Submit button.
    - expect: Validation error messages are shown for both mandatory fields (Rope Type and Price Per Meter) simultaneously. The form is not submitted and no record is created in the data table.

#### 1.4. TC-RM-004: Verify form submission fails when Rope Type is empty

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Leave the Rope Type field blank.
  3. Enter a valid numeric price (e.g., '150') in the Price Per Meter field.
  4. Click the Submit button.
    - expect: A validation error is shown specifically for the Rope Type field. The form is not submitted and no record is created.

#### 1.5. TC-RM-005: Verify form submission fails when Price Per Meter is empty

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Galvanised Rope') in the Rope Type field.
  3. Leave the Price Per Meter field blank.
  4. Click the Submit button.
    - expect: A validation error is shown specifically for the Price Per Meter field. The form is not submitted and no record is created.

#### 1.6. TC-RM-006: Verify Price Per Meter field rejects alphabetic and special character input

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Test Rope').
  3. Attempt to type alphabetic characters (e.g., 'abc') in the Price Per Meter field (which is a spinbutton/number input).
  4. Click the Submit button.
    - expect: The Price Per Meter field rejects non-numeric input either by blocking the keystrokes entirely (number input behavior) or by showing a validation error. The form is not submitted.

#### 1.7. TC-RM-007: Verify Price Per Meter field rejects negative values

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Negative Test Rope').
  3. Enter a negative value (e.g., '-100') in the Price Per Meter field.
  4. Click the Submit button.
    - expect: A validation error is shown indicating that the Price Per Meter must be a non-negative number. The form is not submitted and no record is created.

#### 1.8. TC-RM-008: Verify Price Per Meter accepts zero as a valid value

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Zero Price Rope') in the Rope Type field.
  3. Enter '0' in the Price Per Meter field.
  4. Click the Submit button.
    - expect: The record is created successfully with a price of 0, displayed as '0' in the data table Price Per Meter column. No validation error is shown.

#### 1.9. TC-RM-009: Verify Price Per Meter accepts decimal values

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a valid Rope Type (e.g., 'Decimal Price Rope') in the Rope Type field.
  3. Enter a decimal value (e.g., '99.50') in the Price Per Meter field.
  4. Click the Submit button.
    - expect: The record is either created successfully with the decimal price displayed in the table, or the system shows a validation error if only integers are accepted. The behavior is consistent and clearly communicated to the user.

#### 1.10. TC-RM-010: Verify duplicate Rope Type is not allowed

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Create a new rope record with Rope Type 'Duplex Steel Rope' and Price Per Meter '300'. Click Submit.
    - expect: The first record is created successfully and appears in the data table.
  2. In the Add Rope form, enter the exact same Rope Type 'Duplex Steel Rope' and a Price Per Meter (e.g., '400'). Click Submit.
    - expect: The system displays a duplicate entry error message and prevents saving the second record with the same Rope Type name. The data table still shows only one record for 'Duplex Steel Rope'.

#### 1.11. TC-RM-011: Verify Clear button resets the Add Rope form

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Enter a Rope Type (e.g., 'Clear Test Rope') in the Rope Type field.
  3. Enter a price (e.g., '500') in the Price Per Meter field.
  4. Click the Clear button.
    - expect: Both form fields (Rope Type and Price Per Meter) are cleared and reset to their default empty state. The form heading remains 'Add Rope'. No record is created. The data table remains unchanged.

#### 1.12. TC-RM-012: Verify Edit functionality for an existing rope record

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Ensure at least one record exists in the data table.
  2. Click the Edit (pencil icon) button on an existing record in the Action column.
    - expect: The form section changes heading to 'Update Rope'. The Rope Type and Price Per Meter fields are pre-populated with the selected record's current values. A Status dropdown (Active/Inactive) becomes visible in the form.
  3. Modify the Rope Type to a new unique value (e.g., append ' Updated') and change the Price Per Meter to a new value (e.g., '999').
  4. Click the Update button.
    - expect: The record is updated with the new values. The changes are reflected in the data table immediately. The form resets back to 'Add Rope' mode with empty fields.

#### 1.13. TC-RM-013: Verify Status can be changed to Inactive during Edit

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click Edit on an existing active record.
    - expect: The 'Update Rope' form opens with Status dropdown showing 'Active'.
  2. Change the Status dropdown from 'Active' to 'Inactive'.
  3. Click the Update button.
    - expect: The record status is changed to Inactive. The record disappears from the table when the default 'Active' filter is applied. The record appears when the 'Inactive' or 'All' status filter is selected.

#### 1.14. TC-RM-014: Verify Clear button on Update form reverts to Add mode

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click Edit on an existing record to open the 'Update Rope' form.
    - expect: The 'Update Rope' form opens with the record's data pre-filled, including the Status dropdown.
  2. Optionally modify some field values.
  3. Click the Clear button.
    - expect: The form is cleared and reverts to 'Add Rope' mode. All fields (Rope Type, Price Per Meter) are emptied and the Status dropdown (only visible in edit mode) is hidden. No changes are saved to the original record.

#### 1.15. TC-RM-015: Verify error when updating a record to match an existing active record

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Note the Rope Type name of an existing active record (Record A).
  2. Click Edit on a different active record (Record B).
    - expect: The 'Update Rope' form opens with Record B's current data.
  3. Change Record B's Rope Type to exactly match the Rope Type of Record A. Click the Update button.
    - expect: The system displays an error message and prevents the update, since it would create a duplicate active entry with the same Rope Type as Record A.


    

#### 1.16. TC-RM-016: Verify default Active status filter on page load

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page without changing any filters.
    - expect: The Status filter dropdown shows 'Active' as the selected default option. Only active rope records are displayed in the data table. All visible records show 'Active' in the Status column.

#### 1.17. TC-RM-017: Verify Active filter shows only active records

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Ensure there are both active and inactive rope records.
  2. Select 'Active' from the Status filter dropdown in the data table toolbar.
    - expect: Only active rope records are displayed. All displayed records show 'Active' in the Status column. Inactive records are not visible.

#### 1.18. TC-RM-018: Verify Inactive filter shows only inactive records

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Select 'Inactive' from the Status filter dropdown in the data table toolbar.
    - expect: Only inactive rope records are displayed. All displayed records show 'Inactive' in the Status column. If no inactive records exist, the table shows an empty state message.

#### 1.19. TC-RM-019: Verify All filter shows both active and inactive records

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Select 'All' from the Status filter dropdown in the data table toolbar.
    - expect: Both active and inactive rope records are displayed in the data table. Records with both 'Active' and 'Inactive' statuses are visible simultaneously.

#### 1.20. TC-RM-020: Verify search functionality filters records by Rope Type

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. In the Search field (labeled 'Search Rope Type'), type a partial or full Rope Type name that exists in the list (e.g., 'Steel').
    - expect: The data table filters in real time and displays only the records whose Rope Type matches the search term. Records not matching the search are hidden.
  3. Clear the search field.
    - expect: The data table returns to showing all records that match the current status filter.

#### 1.21. TC-RM-021: Verify search returns no results for a non-existent Rope Type

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. In the Search field, type a string that does not match any existing Rope Type (e.g., 'XYZNOTEXISTENT').
    - expect: The data table shows an empty state (e.g., 'No records found' or similar message). No records are displayed.

#### 1.22. TC-RM-022: Verify Show entries (rows per page) dropdown changes table display

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Ensure there are more than 10 records across all statuses by using the 'All' filter.
  2. Locate the 'Show' dropdown in the data table toolbar. Confirm the default is '25'. Change it to '10'.
    - expect: The data table updates to show a maximum of 10 records per page. Pagination controls update accordingly.
  3. Change the Show dropdown to '50'.
    - expect: The data table updates to show up to 50 records per page.
  4. Change the Show dropdown to '100'.
    - expect: The data table updates to show up to 100 records per page.

#### 1.23. TC-RM-023: Verify pagination controls work correctly

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. If there are more records than the current page size (default 25), ensure multiple pages exist by switching Status filter to 'All' and rows to '10'.
  2. Click the 'Next page' button in the pagination controls.
    - expect: The data table navigates to page 2, displaying the next set of records. The 'Previous page' button becomes enabled.
  3. Click the 'Previous page' button.
    - expect: The data table returns to page 1. The 'Previous page' button is disabled again when on page 1.

#### 1.24. TC-RM-024: Verify column sorting by Rope Type

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Click the 'Rope Type' column header button in the data table.
    - expect: The data table is sorted by Rope Type in ascending alphabetical order. A sort indicator (arrow icon) is visible on the column header.
  3. Click the 'Rope Type' column header button again.
    - expect: The data table is sorted by Rope Type in descending alphabetical order. The sort indicator changes direction.

#### 1.25. TC-RM-025: Verify column sorting by Status

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Select 'All' from the Status filter to ensure both Active and Inactive records are visible.
  2. Click the 'Status' column header button in the data table.
    - expect: The data table is sorted by Status. A sort indicator (arrow icon) is visible on the Status column header.
  3. Click the 'Status' column header button again.
    - expect: The data table is sorted by Status in the reverse order.

#### 1.26. TC-RM-026: Verify Update Price modal opens correctly

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Click the 'Update Price' button in the data table toolbar.
    - expect: A modal dialog titled 'Bulk Update Rope Prices' opens. The modal contains a Search textbox at the top, and a table with columns: Sr. No., rope type, price per metre, and New price per metre (editable input field for each row). Cancel and Submit Updates buttons are visible at the bottom.

#### 1.27. TC-RM-027: Verify bulk price update with valid new prices

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Rope Prices' modal opens.
  2. Enter a valid new price (e.g., '350') in the 'Enter new price per metre' input for one or more records in the modal table.
  3. Click the 'Submit Updates' button.
    - expect: The prices for the updated records are saved successfully. The modal closes. The updated prices are reflected in the Price Per Meter column in the main data table.

#### 1.28. TC-RM-028: Verify Cancel button closes the Update Price modal without saving

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Rope Prices' modal opens.
  2. Enter new price values in one or more rows in the modal.
  3. Click the 'Cancel' button in the modal.
    - expect: The modal closes without saving any changes. The prices in the main data table remain unchanged.

#### 1.29. TC-RM-029: Verify Close (X) button closes the Update Price modal without saving

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Rope Prices' modal opens.
  2. Enter new price values in one or more rows in the modal.
  3. Click the 'X' (Close) button at the top-right corner of the modal.
    - expect: The modal closes without saving any changes. The prices in the main data table remain unchanged.

#### 1.30. TC-RM-030: Verify search within the Update Price modal filters rows

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page. Click the 'Update Price' button.
    - expect: The 'Bulk Update Rope Prices' modal opens with the full list of rope records.
  2. Type a search term in the Search field within the modal (e.g., a partial rope type name such as 'Steel').
    - expect: The modal table filters to show only rows matching the search term. Unmatched rows are hidden, making it easier to find specific records for price update.
  3. Clear the search field in the modal.
    - expect: All records are displayed again in the modal table.

#### 1.31. TC-RM-031: Verify Import button is accessible
<!-- 
**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Click the 'Import' button in the data table toolbar.
    - expect: A file upload dialog or import interface is presented, allowing the user to select and upload a file (e.g., Excel) to bulk import rope records. -->

<!-- #### 1.32. TC-RM-032: Verify Additional Info-rope Image column displays image links correctly

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Observe the 'Additional Info-rope Image' column in the data table for records that have an associated image.
    - expect: Records with an image display a clickable thumbnail or link in the Additional Info-rope Image column. Records without an image display a '-' placeholder.
  3. Click on an image link/thumbnail in the Additional Info-rope Image column.
    - expect: The image opens in a new browser tab or a preview is shown. -->

#### 1.33. TC-RM-033: Verify unauthenticated user is redirected to login page

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Without logging in (or after clearing authentication cookies/session storage), navigate directly to the URL https://stage.elevatorplus.net/master/rope-master.
    - expect: The application redirects the unauthenticated user to the login page (/login). The Rope Master page content is not accessible.

#### 1.34. TC-RM-034: Verify warning note is displayed on the form

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Observe the form section below the Rope Type and Price Per Meter fields.
    - expect: A warning note is visible stating '⚠ Note: Changes in this master will impact quotation cost estimation.' This note is present in both Add and Update form modes.

#### 1.35. TC-RM-035: Verify helper text is displayed below form fields

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Navigate to Sales Masters > Rope Master page.
  2. Observe the helper text displayed below each form field.
    - expect: Below the Rope Type field, the text 'Name to identify this rope type.' is visible. Below the Price Per Meter field, the text 'Cost of rope per metre (for new quotations).' is visible. These helper texts are present in both Add and Update form modes.

#### 1.36. TC-RM-036: Verify Rope Master is accessible via Sales Masters sidebar navigation

**File:** `tests/Sales-master/rope-master.spec.ts`

**Steps:**
  1. Log in to the ElevatorPlus application. From the left sidebar, click on 'Sales Masters' to expand the submenu.
    - expect: The Sales Masters submenu expands and shows all child menu items.
  2. Click on 'Rope Master' from the expanded Sales Masters submenu.
    - expect: The browser navigates to /master/rope-master and the Rope Master page loads successfully with the 'Rope Master' heading visible in the top navigation bar.
