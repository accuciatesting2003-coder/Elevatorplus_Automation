# Extra Element Master Test Plan

## Application Overview

The Extra Element Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/extra-element-master. It allows admin users to manage extra element records used in elevator sales configurations and estimations. The page is a standard master form layout with two sections: (1) an "Add Extra Element" form at the top containing a mandatory text field "Extra Element Name *" with helper text "Name of this extra element.", an optional "In Customer Scope" checkbox with helper text "Check if this element is within customer scope (no charge).", a mandatory numeric field "Unit Price *" with helper text "Price per unit (for company-supplied elements).", and "Clear" and "Submit" buttons; (2) a data table below listing all extra elements with columns: Sr. No., Action (Edit icon), Extra Element Name, In Customer Scope (True/False badge), Unit Price (₹ amount or 0 for in-scope elements), and Status (Active/Inactive badge). The table toolbar includes a Show rows-per-page dropdown (10, 25, 50, 100; default 25), a Status filter dropdown (All, Active, Inactive; default Active), an "Update Price" button that opens a "Bulk Update Extra Element Prices" modal, and a Search box labeled "Extra Element Name". When "In Customer Scope" checkbox is checked, the Unit Price field is hidden (element is free for the customer). Clicking the Edit icon on a row switches the form heading to "Update Extra Element", pre-fills all fields, and adds a "Status *" dropdown (Active/Inactive) while changing the action button to "Update". Clicking "Clear" in edit mode resets the form back to the blank "Add Extra Element" state. Successful creation shows a toast: "Extra element created successfully!". Submitting an empty Extra Element Name shows inline error: "Please enter extra element name". Submitting an empty Unit Price (when In Customer Scope is unchecked) shows inline error: "Please enter unit price". Submitting a duplicate name returns a toast: "Something went wrong."

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. 1.1. TC-SM-01: Extra Element Master page loads successfully

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/extra-element-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/extra-element-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The breadcrumb or page heading in the navigation bar should display 'Extra Element Master'
    - expect: The 'Add Extra Element' card heading should be visible in the form section
    - expect: The Extra Element Name input field (label: 'Extra Element Name *') should be present and empty
    - expect: The helper text 'Name of this extra element.' should be visible below the Extra Element Name input
    - expect: The 'In Customer Scope' checkbox should be visible and unchecked by default
    - expect: The helper text 'Check if this element is within customer scope (no charge).' should be visible below the checkbox
    - expect: The Unit Price input field (label: 'Unit Price *') should be present and empty
    - expect: The helper text 'Price per unit (for company-supplied elements).' should be visible below the Unit Price input
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display extra element records with columns: Sr. No., Action, Extra Element Name, In Customer Scope, Unit Price, Status

#### 1.2. 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to the Extra Element Master page at /master/extra-element-master
    - expect: The form section heading should read 'Add Extra Element'
    - expect: An info icon button should be present next to the 'Add Extra Element' heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Update Price' button should be present in the toolbar
    - expect: A search box with placeholder 'Extra Element Name' should be present in the toolbar
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Extra Element Name, In Customer Scope, Unit Price, Status
    - expect: Extra Element Name, In Customer Scope, Unit Price, and Status columns should display sort icons indicating they are sortable

### 2. 2. Add Extra Element - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. 2.1. TC-ADD-01: Successfully create a new extra element with In Customer Scope unchecked

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'Add Extra Element' form is displayed with an empty Extra Element Name input and empty Unit Price input
    - expect: The 'In Customer Scope' checkbox is unchecked by default
    - expect: The Unit Price field is visible
  2. Click on the 'Extra Element Name *' input field and type a unique name, for example 'Glass Panelling'
    - expect: The typed text appears in the input field
    - expect: The floating label 'Extra Element Name *' animates upward
  3. Click on the 'Unit Price *' input field and type a valid numeric price, for example '150'
    - expect: The value '150' appears in the Unit Price field
  4. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Extra element created successfully!'
    - expect: The Extra Element Name input is cleared and reset to empty
    - expect: The Unit Price input is cleared and reset to empty
    - expect: The 'In Customer Scope' checkbox remains unchecked
    - expect: The form heading remains 'Add Extra Element'
    - expect: The newly created extra element 'Glass Panelling' appears in the data table with 'In Customer Scope' showing 'False', Unit Price showing '₹ 150', and Status 'Active'

#### 2.2. 2.2. TC-ADD-02: Successfully create a new extra element with In Customer Scope checked

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'Add Extra Element' form is visible with empty fields and 'In Customer Scope' checkbox unchecked
  2. Click on the 'Extra Element Name *' input field and type a unique name, for example 'Govt Compliant Lift'
    - expect: The text 'Govt Compliant Lift' appears in the input field
  3. Click the 'In Customer Scope' checkbox to check it
    - expect: The 'In Customer Scope' checkbox becomes checked
    - expect: The 'Unit Price *' field is hidden/removed from the form (no charge applies)
  4. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Extra element created successfully!'
    - expect: The form resets to empty 'Add Extra Element' state with 'In Customer Scope' unchecked and Unit Price field visible again
    - expect: The newly created extra element 'Govt Compliant Lift' appears in the data table with 'In Customer Scope' showing 'True', Unit Price showing '0', and Status 'Active'

#### 2.3. 2.3. TC-ADD-03: Create an extra element with special characters in the name

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and type a name with special characters such as 'Civil Work - Phase #2 (Extra)' into the Extra Element Name field
    - expect: The input accepts text with special characters including hyphens, hash symbols, and parentheses
  2. Type '200' in the Unit Price field and click the 'Submit' button
    - expect: A success toast 'Extra element created successfully!' is displayed
    - expect: The new extra element record appears in the table with the exact name including special characters

#### 2.4. 2.4. TC-ADD-04: Create an extra element with a large Unit Price value

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, type a unique name such as 'Premium Glass Cabin' in the Extra Element Name field
    - expect: The name appears in the input field
  2. Type a large value such as '99999' in the Unit Price field and click 'Submit'
    - expect: Either a success toast 'Extra element created successfully!' is shown and the record appears in the table with the large price, or an appropriate error is shown if a maximum value is enforced

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. 3.1. TC-VAL-01: Submit form with both mandatory fields empty shows inline errors

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'Add Extra Element' form is visible with empty Extra Element Name and Unit Price fields
  2. Leave both the Extra Element Name and Unit Price inputs empty and click the 'Submit' button directly
    - expect: No API call is made to create an extra element
    - expect: The Extra Element Name input field gets an invalid style applied (red border)
    - expect: An inline error message 'Please enter extra element name' appears below the Extra Element Name field in red text
    - expect: The Unit Price input field gets an invalid style applied (red border)
    - expect: An inline error message 'Please enter unit price' appears below the Unit Price field in red text
    - expect: The data table is not refreshed and no new record is added

#### 3.2. 3.2. TC-VAL-02: Submit form with only Extra Element Name empty

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, leave the Extra Element Name field empty, and type '50' in the Unit Price field
    - expect: The Unit Price field shows '50' and the Extra Element Name field is empty
  2. Click the 'Submit' button
    - expect: An inline error message 'Please enter extra element name' appears below the Extra Element Name field
    - expect: No inline error is shown for the Unit Price field
    - expect: No record is created in the data table

#### 3.3. 3.3. TC-VAL-03: Submit form with only Unit Price empty (In Customer Scope unchecked)

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, type 'Test Element' in the Extra Element Name field, leave the Unit Price field empty, and ensure 'In Customer Scope' is unchecked
    - expect: The Extra Element Name shows 'Test Element', the Unit Price is empty, and the checkbox is unchecked
  2. Click the 'Submit' button
    - expect: An inline error message 'Please enter unit price' appears below the Unit Price field
    - expect: No inline error is shown for the Extra Element Name field
    - expect: No record is created in the data table

#### 3.4. 3.4. TC-VAL-04: Validation errors clear when valid input is entered after failed submission

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click 'Submit' without entering any values to trigger both validation errors
    - expect: Inline error 'Please enter extra element name' is shown below the Extra Element Name input
    - expect: Inline error 'Please enter unit price' is shown below the Unit Price input
  2. Click on the Extra Element Name input and type a valid name such as 'Valid Element'
    - expect: The inline error 'Please enter extra element name' is no longer visible
    - expect: The invalid styling on Extra Element Name input is removed
  3. Click on the Unit Price input and type '75', then click the 'Submit' button
    - expect: The extra element is created successfully
    - expect: A success toast notification 'Extra element created successfully!' appears
    - expect: The form resets to the empty 'Add Extra Element' state

#### 3.5. 3.5. TC-VAL-05: Submit form with only whitespace in Extra Element Name

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, type only spaces (e.g., '   ') into the Extra Element Name input field, type '50' in the Unit Price field
    - expect: The spaces are visible in the Extra Element Name input field
  2. Click the 'Submit' button
    - expect: Either the validation error 'Please enter extra element name' is shown (treating whitespace-only as empty), or a server-side error is returned
    - expect: No extra element with a blank/whitespace name should be created in the table

#### 3.6. 3.6. TC-VAL-06: Submit form with invalid (negative) Unit Price value

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, type 'Test Element Price' in the Extra Element Name field, and type '-10' in the Unit Price field
    - expect: The input accepts the negative value or may block the negative sign depending on the spinbutton type
  2. Click the 'Submit' button
    - expect: Either the form rejects the negative price with an appropriate validation message, or the system handles negative values gracefully (server-side validation may apply)

### 4. 4. Checkbox Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. 4.1. TC-CHK-01: In Customer Scope checkbox is unchecked by default and Unit Price field is visible

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'In Customer Scope' checkbox is unchecked by default
    - expect: The 'Unit Price *' field is visible and accessible in the form
    - expect: The Unit Price field is marked as mandatory (asterisk present)

#### 4.2. 4.2. TC-CHK-02: Checking In Customer Scope hides the Unit Price field

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the 'In Customer Scope' checkbox to check it
    - expect: The 'In Customer Scope' checkbox becomes checked
    - expect: The 'Unit Price *' input field is hidden/removed from the form view
    - expect: The helper text 'Price per unit (for company-supplied elements).' is also hidden

#### 4.3. 4.3. TC-CHK-03: Unchecking In Customer Scope restores the Unit Price field

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, check the 'In Customer Scope' checkbox to hide the Unit Price field, then uncheck it again
    - expect: The 'In Customer Scope' checkbox becomes unchecked
    - expect: The 'Unit Price *' input field reappears in the form
    - expect: The Unit Price field is empty and ready for input

#### 4.4. 4.4. TC-CHK-04: Submitting with In Customer Scope checked only requires Extra Element Name

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, check the 'In Customer Scope' checkbox (Unit Price field disappears), and click the 'Submit' button without entering any name
    - expect: Only the Extra Element Name validation error 'Please enter extra element name' is shown
    - expect: No Unit Price validation error is shown (field is hidden and not required when in customer scope)
  2. Type a unique name such as 'Customer Scope Element' into the Extra Element Name field and click 'Submit'
    - expect: The extra element is created successfully with a success toast
    - expect: The new element appears in the table with 'In Customer Scope' showing 'True' and Unit Price showing '0'

### 5. 5. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. 5.1. TC-DUP-01: Submitting an existing extra element name shows an error

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and note an existing extra element name from the data table (e.g., 'Scaffolding')
    - expect: At least one extra element record is visible in the table
  2. Type the existing name 'Scaffolding' into the Extra Element Name input field and type '5' in the Unit Price field
    - expect: The text is entered in the respective input fields
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the data table
    - expect: The form input is not cleared

#### 5.2. 5.2. TC-DUP-02: Test case-sensitivity for duplicate extra element name

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and note an existing extra element name such as 'Scaffolding'
    - expect: The extra element exists in the table
  2. Type the same name with different casing into the Extra Element Name field, e.g., 'SCAFFOLDING' or 'scaffolding', type '5' in Unit Price, and click 'Submit'
    - expect: Observe whether the system treats this as a duplicate and shows an error toast 'Something went wrong.' or whether it accepts the different casing as a unique name

### 6. 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. 6.1. TC-CLR-01: Clear button resets the Add Extra Element form

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'Add Extra Element' form is visible with empty fields and 'In Customer Scope' unchecked
  2. Type 'Temporary Element Name' into the Extra Element Name field, type '100' into the Unit Price field, and check the 'In Customer Scope' checkbox
    - expect: The name 'Temporary Element Name' is visible in the Extra Element Name input
    - expect: The 'In Customer Scope' checkbox is checked
    - expect: The Unit Price field is hidden
  3. Click the 'Clear' button
    - expect: The Extra Element Name input field is cleared and becomes empty
    - expect: The 'In Customer Scope' checkbox is unchecked
    - expect: The Unit Price field reappears and is empty
    - expect: The form heading still reads 'Add Extra Element'
    - expect: No toast notification or error is shown
    - expect: The data table is not affected

#### 6.2. 6.2. TC-CLR-02: Clear button in Edit mode resets form to Add Extra Element state

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for any extra element record (e.g., 'Golden wash') in the data table
    - expect: The form heading changes to 'Update Extra Element'
    - expect: The Extra Element Name input is pre-filled with 'Golden wash'
    - expect: The 'In Customer Scope' checkbox reflects the existing value
    - expect: The Unit Price field is pre-filled with the existing price (if In Customer Scope is False)
    - expect: A 'Status *' dropdown appears with the current status pre-selected
    - expect: The action button changes to 'Update'
  2. Click the 'Clear' button while in Update Extra Element mode
    - expect: The form heading reverts to 'Add Extra Element'
    - expect: The Extra Element Name input is cleared and empty
    - expect: The 'In Customer Scope' checkbox is unchecked
    - expect: The Unit Price field is empty and visible
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 7. 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. 7.1. TC-EDT-01: Edit icon opens the extra element record in edit mode

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The data table shows at least one extra element record
  2. Click the Edit icon (pencil/edit image) in the Action column of an existing row (e.g., 'Golden wash')
    - expect: The form heading changes from 'Add Extra Element' to 'Update Extra Element'
    - expect: The Extra Element Name input is pre-filled with the extra element name from the selected row (e.g., 'Golden wash')
    - expect: The 'In Customer Scope' checkbox reflects the stored value (checked if True, unchecked if False)
    - expect: If 'In Customer Scope' is False, the Unit Price field is pre-filled with the existing price
    - expect: If 'In Customer Scope' is True, the Unit Price field is hidden
    - expect: A 'Status *' dropdown appears with label 'Status *' and options: 'Select Status', 'Active', 'Inactive'
    - expect: The currently set status ('Active') is pre-selected in the Status dropdown
    - expect: The helper text 'Select active or inactive' is visible below the Status dropdown
    - expect: The action button label changes to 'Update'

#### 7.2. 7.2. TC-EDT-02: Successfully update the extra element name

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for an extra element record (e.g., 'Civil Work')
    - expect: The form is in Update Extra Element mode with 'Civil Work' pre-filled
  2. Clear the Extra Element Name input and type a new unique name, e.g., 'Civil Work Updated'
    - expect: The new name appears in the Extra Element Name input
  3. Click the 'Update' button
    - expect: A success toast notification appears (e.g., 'Extra element updated successfully!')
    - expect: The form resets to the 'Add Extra Element' state with empty inputs
    - expect: The data table refreshes and shows the updated name in the previously edited row

#### 7.3. 7.3. TC-EDT-03: Successfully update the Unit Price in edit mode

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for an extra element record with 'In Customer Scope' as False (e.g., 'PWD' with price ₹25)
    - expect: The form is in Update Extra Element mode with Unit Price showing '25'
  2. Clear the Unit Price field and type a new value such as '30', then click the 'Update' button
    - expect: A success toast notification appears
    - expect: The form resets to 'Add Extra Element' state
    - expect: The data table shows the updated price '₹ 30' for the 'PWD' record

#### 7.4. 7.4. TC-EDT-04: Update In Customer Scope from unchecked to checked in edit mode

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for an extra element where 'In Customer Scope' is False (e.g., 'Scaffolding')
    - expect: The form shows 'Update Extra Element' with 'In Customer Scope' unchecked and Unit Price field visible
  2. Check the 'In Customer Scope' checkbox
    - expect: The checkbox becomes checked
    - expect: The Unit Price field is hidden
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Extra Element' state
    - expect: The data table shows 'In Customer Scope' as 'True' and Unit Price as '0' for the updated record

#### 7.5. 7.5. TC-EDT-05: Update extra element status to Inactive

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for any extra element with 'Active' status
    - expect: The form is in Update Extra Element mode with Status dropdown showing 'Active'
  2. In the Status dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to the 'Add Extra Element' state
    - expect: In the data table (when filtered to 'All' statuses), the edited extra element row now shows 'Inactive' badge in the Status column

#### 7.6. 7.6. TC-EDT-06: Update extra element with empty Extra Element Name shows validation error

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the Edit icon for any extra element record
    - expect: The form is in Update Extra Element mode with the extra element name pre-filled
  2. Clear the Extra Element Name input field completely so it is empty
    - expect: The Extra Element Name input is empty
  3. Click the 'Update' button
    - expect: The inline validation error 'Please enter extra element name' appears below the Extra Element Name input
    - expect: No API update call is made
    - expect: The form remains in Update Extra Element mode without resetting

#### 7.7. 7.7. TC-EDT-07: Update extra element name to a duplicate of an existing extra element

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, note two existing extra element names (e.g., 'Scaffolding' and 'PWD'), and click Edit on 'PWD'
    - expect: The form is in Update Extra Element mode with 'PWD' pre-filled
  2. Clear the Extra Element Name input and type the name of another existing extra element, e.g., 'Scaffolding'
    - expect: 'Scaffolding' is entered in the Extra Element Name input
  3. Click the 'Update' button
    - expect: A toast error message 'Something went wrong.' is displayed
    - expect: The extra element is not updated and the original name 'PWD' remains in the table

### 8. 8. Update Price Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. 8.1. TC-UPR-01: Update Price button opens the Bulk Update Extra Element Prices modal

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The 'Update Price' button is visible in the table toolbar
  2. Click the 'Update Price' button
    - expect: A modal dialog appears with the title 'Bulk Update Extra Element Prices'
    - expect: The modal contains a Search input field
    - expect: A table is displayed with columns: Sr. No., element name, customer scope, unit price, new unit price
    - expect: All active extra elements are listed in the modal table
    - expect: For elements where 'In Customer Scope' is True, the unit price column shows '-' and the 'new unit price' column shows '-' (not editable)
    - expect: For elements where 'In Customer Scope' is False, the unit price column shows the current price and the 'new unit price' column shows an 'Enter new unit price' input field
    - expect: A 'Cancel' button and a 'Submit Updates' button are present at the bottom of the modal

#### 8.2. 8.2. TC-UPR-02: Search within Bulk Update Price modal filters the element list

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the 'Update Price' button to open the modal
    - expect: The modal is open showing all active extra elements
  2. Type a partial name such as 'wash' into the Search field inside the modal
    - expect: The modal table filters to show only extra elements whose names contain 'wash' (e.g., 'Golden wash', 'White Wash')
    - expect: Non-matching rows are hidden from the modal table

#### 8.3. 8.3. TC-UPR-03: Successfully update prices for multiple elements via the modal

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the 'Update Price' button to open the modal
    - expect: The Bulk Update Extra Element Prices modal is open
  2. Enter a new price value (e.g., '15') in the 'Enter new unit price' field for an element with 'In Customer Scope' as False (e.g., 'Golden wash')
    - expect: The new price value '15' is entered in the input field
  3. Click the 'Submit Updates' button
    - expect: A success toast notification is displayed
    - expect: The modal closes
    - expect: The data table refreshes and the updated element shows the new price '₹ 15' in the Unit Price column

#### 8.4. 8.4. TC-UPR-04: Cancel button closes the Bulk Update Price modal without saving

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, click 'Update Price', and enter a new price in one of the input fields inside the modal
    - expect: The modal is open with a modified price value
  2. Click the 'Cancel' button
    - expect: The modal closes without saving any changes
    - expect: The data table still shows the original price values (no update was applied)

#### 8.5. 8.5. TC-UPR-05: Close button closes the Bulk Update Price modal without saving

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click 'Update Price' to open the modal
    - expect: The modal is open
  2. Click the 'X' (Close) button at the top-right of the modal
    - expect: The modal closes
    - expect: No price updates are applied
    - expect: The data table is unchanged

### 9. 9. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. 9.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The Status filter dropdown defaults to 'Active'
    - expect: The table shows only Active records
  2. Verify each row in the table has a green 'Active' badge in the Status column
    - expect: All visible rows display 'Active' status
    - expect: No 'Inactive' rows are displayed

#### 9.2. 9.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and change the Status filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive extra element records
    - expect: Inactive extra elements (if any exist) are shown alongside Active ones with respective 'Active' or 'Inactive' badges

#### 9.3. 9.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and change the Status filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive extra element records are shown in the table, OR a 'No records found' / empty state is shown if there are no Inactive extra elements

### 10. 10. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. 10.1. TC-SRC-01: Search by partial extra element name returns matching results

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The full list of Active extra elements is displayed in the table
  2. Click the 'Extra Element Name' search input field in the table toolbar and type a partial name, e.g., 'wash'
    - expect: The table dynamically filters to show only extra elements whose names contain 'wash' (case-insensitive), e.g., 'Golden wash', 'White Wash'
    - expect: Non-matching rows are hidden

#### 10.2. 10.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and type a name that does not exist, e.g., 'XYZNONEXISTENTELE999', into the Search Extra Element Name input
    - expect: The table shows no rows or an empty state message
    - expect: The table does not show any matching extra element records

#### 10.3. 10.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, type 'civil' into the Extra Element Name search input to filter results
    - expect: The table shows only records matching 'civil'
  2. Clear the search input field completely (delete all text)
    - expect: The table restores to show all Active extra element records as before the search
    - expect: The full unfiltered list is displayed

### 11. 11. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. 11.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master (default shows 25 rows per page)
    - expect: The Show dropdown displays '25' and up to 25 rows are shown in the table
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 11.2. 11.2. TC-PAG-02: Change rows-per-page to 50

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and change the 'Show:' dropdown to '50'
    - expect: The table refreshes to display a maximum of 50 rows per page
    - expect: The Show dropdown displays '50'

#### 11.3. 11.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, set Show to '10', and verify there are multiple pages if more than 10 extra elements exist
    - expect: Pagination controls with Previous page button, page number buttons, and Next page button are visible at the bottom of the table
    - expect: The 'Previous page' button is disabled on page 1
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of 10 records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled again

### 12. 12. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. 12.1. TC-SRT-01: Sort table by Extra Element Name column

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master
    - expect: The data table is loaded with extra element records
  2. Click the 'Extra Element Name' column header button
    - expect: The table re-sorts extra element records alphabetically (A to Z) by Extra Element Name
    - expect: The sort icon on the Extra Element Name column indicates ascending sort order
  3. Click the 'Extra Element Name' column header again
    - expect: The sort order reverses to Z to A (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 12.2. 12.2. TC-SRT-02: Sort table by Unit Price column

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the 'Unit Price' column header button
    - expect: The table re-sorts records by unit price in ascending order (lowest to highest)
    - expect: The sort icon on the Unit Price column updates to indicate ascending sort order
  2. Click the 'Unit Price' column header again
    - expect: The sort order reverses to descending (highest to lowest price)
    - expect: The sort icon updates to indicate descending sort order

#### 12.3. 12.3. TC-SRT-03: Sort table by In Customer Scope column

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master and click the 'In Customer Scope' column header button
    - expect: The table re-sorts records by In Customer Scope value, grouping True and False records
    - expect: The sort icon on the In Customer Scope column updates

#### 12.4. 12.4. TC-SRT-04: Sort table by Status column

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, set Status filter to 'All', then click the 'Status' column header
    - expect: The table re-sorts records grouping Active and Inactive records
    - expect: The sort icon on the Status column updates

### 13. 13. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. 13.1. TC-INA-01: Mark an Active extra element as Inactive and verify it disappears from the Active filter

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master with Status filter set to 'Active'. Note the name of a specific extra element in the list (e.g., 'White Wash')
    - expect: The extra element 'White Wash' is visible in the Active list
  2. Click the Edit icon for 'White Wash' to open it in Update Extra Element mode
    - expect: The form shows 'Update Extra Element' with the Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Extra Element' mode
  4. Verify the table with Status filter 'Active'
    - expect: The extra element 'White Wash' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The extra element 'White Wash' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 13.2. 13.2. TC-INA-02: Re-activate an Inactive extra element

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Navigate to /master/extra-element-master, change Status filter to 'Inactive', and click the Edit icon for an Inactive extra element
    - expect: The form shows 'Update Extra Element' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Extra Element' mode
  3. Change the Status filter back to 'Active'
    - expect: The previously Inactive extra element now appears in the Active list with 'Active' status badge

### 14. 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. 14.1. TC-NAV-01: Access Extra Element Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/master/extra-element-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Extra Element Master page content is not shown

#### 14.2. 14.2. TC-NAV-02: Access Extra Element Master via Sales Masters menu navigation

**File:** `tests/Sales-master/extra-element-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master pages
  2. Look for and click the 'Extra Element' link in the Sales Masters sub-menu
    - expect: The Extra Element Master page at /master/extra-element-master is loaded
    - expect: The page heading 'Extra Element Master' is visible in the navigation bar
    - expect: The 'Add Extra Element' form heading is visible
    - expect: The data table with existing extra element records is displayed
