# Special Feature Master Test Plan

## Application Overview

The Special Feature Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/special-feature-master. It allows admin users to manage special feature records used in elevator sales configurations and estimations. The page is a standard master form layout with two sections: (1) an "Add Special Feature" form at the top containing a mandatory text field "Feature Name *" with helper text "Name of this special feature.", a mandatory dropdown "Door Opening Type *" with helper text "Door type this feature applies to." and options: General, Manual, Automatic, a mandatory text field "Description *" with helper text "Brief description of what this feature includes.", and "Clear" and "Submit" buttons; (2) a data table below listing all special features with columns: Sr. No., Action (Edit icon), Feature Name, Door Opening Type, Description, and Status (Active/Inactive badge). The table toolbar includes a Show rows-per-page dropdown (10, 25, 50, 100; default 25), a Status filter dropdown (All, Active, Inactive; default Active), an Import button, and a Search box. The search box label toggles between "Feature Name" and "Opening Type" depending on context. Clicking the Edit icon on a row switches the form heading to "Update Special Feature", pre-fills all fields (Feature Name, Door Opening Type, Description), and adds a "Status *" dropdown (Active/Inactive) while changing the action button to "Update". Clicking "Clear" in edit mode resets the form back to the blank "Add Special Feature" state. Successful creation shows a toast notification. Submitting with any mandatory field empty shows inline validation errors. Submitting a duplicate name returns a toast: "Something went wrong." Sortable columns include Feature Name, Door Opening Type, and Status.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Special Feature Master page loads successfully

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/special-feature-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/special-feature-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The breadcrumb or page heading in the navigation bar should display 'Special Feature Master'
    - expect: The 'Add Special Feature' card heading should be visible in the form section
    - expect: The Feature Name input field (label: 'Feature Name *') should be present and empty
    - expect: The helper text 'Name of this special feature.' should be visible below the Feature Name input
    - expect: The Door Opening Type dropdown (label: 'Door Opening Type *') should be present with default option 'Select Opening Type'
    - expect: The helper text 'Door type this feature applies to.' should be visible below the Door Opening Type dropdown
    - expect: The Description input field (label: 'Description *') should be present and empty
    - expect: The helper text 'Brief description of what this feature includes.' should be visible below the Description input
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display special feature records with columns: Sr. No., Action, Feature Name, Door Opening Type, Description, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to the Special Feature Master page at /master/special-feature-master
    - expect: The form section heading should read 'Add Special Feature'
    - expect: An info icon button should be present next to the 'Add Special Feature' heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Import' button should be present in the toolbar
    - expect: A search box should be present in the toolbar
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Feature Name, Door Opening Type, Description, Status
    - expect: Feature Name, Door Opening Type, and Status columns should display sort icons indicating they are sortable
    - expect: The Action column should contain an Edit icon for each data row

#### 1.3. TC-SM-03: Verify Door Opening Type dropdown options

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the 'Door Opening Type *' dropdown in the Add Special Feature form
    - expect: The dropdown opens and displays the following options: 'Select Opening Type' (default placeholder), 'General', 'Manual', 'Automatic'
    - expect: The default selected option should be 'Select Opening Type'

### 2. 2. Add Special Feature - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new special feature with Door Opening Type 'General'

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The 'Add Special Feature' form is displayed with all three input fields empty and Door Opening Type set to 'Select Opening Type'
  2. Click on the 'Feature Name *' input field and type a unique name, for example 'Auto Rescue Device'
    - expect: The typed text 'Auto Rescue Device' appears in the Feature Name input field
    - expect: The floating label 'Feature Name *' animates upward
  3. Click the 'Door Opening Type *' dropdown and select 'General'
    - expect: The dropdown shows 'General' as the selected option
  4. Click on the 'Description *' input field and type a description, for example 'Automatically rescues passengers during power failure'
    - expect: The description text appears in the Description input field
  5. Click the 'Submit' button
    - expect: A success toast notification appears confirming the special feature was created
    - expect: The Feature Name input is cleared and reset to empty
    - expect: The Door Opening Type dropdown resets to 'Select Opening Type'
    - expect: The Description input is cleared and reset to empty
    - expect: The form heading remains 'Add Special Feature'
    - expect: The newly created special feature 'Auto Rescue Device' appears in the data table with Door Opening Type 'general', the description value, and Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a new special feature with Door Opening Type 'Manual'

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and fill in: Feature Name = 'Emergency Stop Button', Door Opening Type = 'Manual', Description = 'Manual emergency stop for the lift cabin'
    - expect: All three fields are filled in with the provided values
  2. Click the 'Submit' button
    - expect: A success toast notification appears confirming the special feature was created
    - expect: The form resets to the blank 'Add Special Feature' state
    - expect: The new record 'Emergency Stop Button' appears in the data table with Door Opening Type 'manual' and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a new special feature with Door Opening Type 'Automatic'

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and fill in: Feature Name = 'Voice Announcement System', Door Opening Type = 'Automatic', Description = 'Announces floor numbers automatically'
    - expect: All three fields are filled in with the provided values
  2. Click the 'Submit' button
    - expect: A success toast notification appears confirming the special feature was created
    - expect: The form resets to the blank 'Add Special Feature' state
    - expect: The new record 'Voice Announcement System' appears in the data table with Door Opening Type 'automatic' and Status 'Active'

#### 2.4. TC-ADD-04: Create a special feature with special characters in Feature Name and Description

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and type a Feature Name with special characters such as 'Load Sensor #3 (Heavy-Duty)', select 'General' from Door Opening Type, and type 'Detects overload > 1000 kg & triggers alarm' in the Description field
    - expect: The Feature Name input accepts text with special characters including hash, parentheses, and hyphens
    - expect: The Description input accepts text with special characters
  2. Click the 'Submit' button
    - expect: A success toast notification is displayed
    - expect: The new record appears in the data table with the exact Feature Name including special characters

#### 2.5. TC-ADD-05: Create a special feature with a long Feature Name and Description

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and type a very long Feature Name (e.g., 100+ characters) such as 'Advanced Regenerative Drive System with Automatic Speed Controller and Remote Monitoring', select 'Automatic', and type a long Description
    - expect: The Feature Name and Description fields accept long text input
  2. Click the 'Submit' button
    - expect: Either a success toast is shown and the record is created (with long text displayed or truncated in the table), or an appropriate character-limit validation error is shown

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with all three mandatory fields empty shows inline errors

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The 'Add Special Feature' form is visible with empty Feature Name, default Door Opening Type ('Select Opening Type'), and empty Description
  2. Leave all fields empty (do not enter any text or select any dropdown option) and click the 'Submit' button directly
    - expect: No API call is made to create a special feature
    - expect: The Feature Name input field gets an invalid style applied (e.g., red border)
    - expect: An inline validation error message appears below the Feature Name field
    - expect: The Door Opening Type dropdown gets an invalid style applied
    - expect: An inline validation error message appears below the Door Opening Type dropdown
    - expect: The Description input field gets an invalid style applied
    - expect: An inline validation error message appears below the Description field
    - expect: The data table is not refreshed and no new record is added

#### 3.2. TC-VAL-02: Submit form with only Feature Name empty

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, leave the Feature Name field empty, select 'General' from the Door Opening Type dropdown, and type 'Test Description' in the Description field
    - expect: The Door Opening Type shows 'General', Description shows 'Test Description', and Feature Name is empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Feature Name field
    - expect: No inline error is shown for Door Opening Type or Description
    - expect: No record is created in the data table

#### 3.3. TC-VAL-03: Submit form with only Door Opening Type not selected

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, type 'Test Feature' in the Feature Name field, leave Door Opening Type as 'Select Opening Type' (unselected), and type 'Test Description' in the Description field
    - expect: Feature Name shows 'Test Feature', Door Opening Type is still at default 'Select Opening Type', and Description shows 'Test Description'
  2. Click the 'Submit' button
    - expect: An inline validation error appears for the Door Opening Type dropdown
    - expect: No inline error is shown for Feature Name or Description
    - expect: No record is created in the data table

#### 3.4. TC-VAL-04: Submit form with only Description empty

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, type 'Test Feature' in the Feature Name field, select 'Automatic' from the Door Opening Type dropdown, and leave the Description field empty
    - expect: Feature Name shows 'Test Feature', Door Opening Type shows 'Automatic', and Description is empty
  2. Click the 'Submit' button
    - expect: An inline validation error appears below the Description field
    - expect: No inline error is shown for Feature Name or Door Opening Type
    - expect: No record is created in the data table

#### 3.5. TC-VAL-05: Submit form with Feature Name and Description empty but Door Opening Type selected

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, leave Feature Name and Description empty, and select 'Manual' from the Door Opening Type dropdown
    - expect: Feature Name is empty, Door Opening Type shows 'Manual', and Description is empty
  2. Click the 'Submit' button
    - expect: Inline validation errors appear for both the Feature Name field and the Description field
    - expect: No inline error is shown for Door Opening Type
    - expect: No record is created in the data table

#### 3.6. TC-VAL-06: Validation errors clear when valid input is entered after failed submission

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click 'Submit' without entering any values to trigger all three validation errors
    - expect: Inline validation errors are shown for Feature Name, Door Opening Type, and Description
  2. Click on the Feature Name input and type 'Valid Feature Name'
    - expect: The inline error for Feature Name is no longer visible
    - expect: The invalid styling on the Feature Name input is removed
  3. Select 'General' from the Door Opening Type dropdown
    - expect: The inline error for Door Opening Type is no longer visible
  4. Type 'Valid description text' in the Description field and click the 'Submit' button
    - expect: The inline error for Description is no longer visible
    - expect: The special feature is created successfully
    - expect: A success toast notification appears
    - expect: The form resets to the empty 'Add Special Feature' state

#### 3.7. TC-VAL-07: Submit form with only whitespace in all the mandatory fields 

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, type only spaces (e.g., '   ') into the Feature Name input field, select 'General' from Door Opening Type, and add whilte spece in   description also
    - expect: The spaces are entered in the Feature Name input field
  2. Click the 'Submit' button
    - expect: Either the validation error is shown treating whitespace-only as empty, or a server-side error is returned
    - expect: No special feature with a blank/whitespace-only name should be created in the table

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing Feature Name  with same opening type shows an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note an existing special feature name from the data table (e.g., 'AC')
    - expect: At least one special feature record is visible in the table
  2. Type the existing Feature Name 'AC' into the Feature Name input field, select any door opening type such as 'Automatic', and type any description
    - expect: The text 'AC' is entered in the Feature Name input and other fields are filled
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the data table
    - expect: The form input is not cleared

   

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate Feature Name

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note an existing feature name such as 'Intercom'
    - expect: The feature 'Intercom' exists in the table
  2. Type the same name with different casing into the Feature Name field, e.g., 'INTERCOM' or 'intercom', select existing  door opening type, type a description, and click 'Submit'
    - expect: Observe whether the system treats this as a duplicate and shows an error toast 'Something went wrong.' or whether it accepts the different casing as a unique name

#### 4.3. TC-DUP-03: Submitting an existing active Feature Name with a different Door Opening Type should not show an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note an existing Active record — note both its Feature Name and its Door Opening Type (e.g., Feature Name: 'Intercom', Door Opening Type: 'Automatic')
    - expect: At least one Active special feature record is visible in the table
  2. In the Add Special Feature form, type the same Feature Name 'Intercom' in the Feature Name field, select a **different** Door Opening Type (e.g., 'Manual' instead of 'Automatic'), and type any description
    - expect: The Feature Name field shows 'Intercom', Door Opening Type shows 'Manual', and Description is filled
  3. Click the 'Submit' button
    - expect: A success toast notification appears confirming the special feature was created
    - expect: No error toast 'Something went wrong.' is shown
    - expect: The form resets to the blank 'Add Special Feature' state
    - expect: The new record 'Intercom' with Door Opening Type 'manual' appears in the data table alongside the existing 'Intercom' with Door Opening Type 'automatic'

#### 4.4. TC-DUP-04: Submitting an existing inactive Feature Name with the same Door Opening Type shows an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, change the Status filter to 'Inactive', and note the Feature Name and Door Opening Type of an existing Inactive record (e.g., Feature Name: 'Old Sensor', Door Opening Type: 'General')
    - expect: At least one Inactive special feature record is visible in the Inactive-filtered table
  2. Change the Status filter back to 'Active'. In the Add Special Feature form, type the Inactive record's Feature Name 'Old Sensor', select the **same** Door Opening Type 'General', and type any description
    - expect: The Feature Name field shows 'Old Sensor', Door Opening Type shows 'General', and Description is filled
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No new record is added to the data table
    - expect: The form inputs are not cleared

#### 4.5. TC-DUP-05: Submitting an existing active Feature Name with the same Door Opening Type shows an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note an existing Active record — both its Feature Name and its Door Opening Type (e.g., Feature Name: 'AC', Door Opening Type: 'Automatic')
    - expect: At least one Active special feature record is visible in the table
  2. In the Add Special Feature form, type the same Feature Name 'AC', select the **same** Door Opening Type 'Automatic', and type any description
    - expect: The Feature Name field shows 'AC', Door Opening Type shows 'Automatic', and Description is filled
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the data table
    - expect: The form inputs are not cleared

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Special Feature form

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The 'Add Special Feature' form is visible with empty Feature Name, default Door Opening Type ('Select Opening Type'), and empty Description
  2. Type 'Temporary Feature' into the Feature Name field, select 'Manual' from the Door Opening Type dropdown, and type 'Some temporary description' in the Description field
    - expect: The Feature Name shows 'Temporary Feature'
    - expect: The Door Opening Type shows 'Manual'
    - expect: The Description shows 'Some temporary description'
  3. Click the 'Clear' button
    - expect: The Feature Name input field is cleared and becomes empty
    - expect: The Door Opening Type dropdown resets to 'Select Opening Type'
    - expect: The Description input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Special Feature'
    - expect: No toast notification or error is shown
    - expect: The data table is not affected

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Special Feature state

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature record (e.g., 'Intercom') in the data table
    - expect: The form heading changes to 'Update Special Feature'
    - expect: The Feature Name input is pre-filled with the selected feature name (e.g., 'Intercom')
    - expect: The Door Opening Type dropdown reflects the existing value (e.g., 'Automatic')
    - expect: The Description input is pre-filled with the existing description
    - expect: A 'Status *' dropdown appears with the current status (e.g., 'Active') pre-selected
    - expect: The action button changes to 'Update'
  2. Click the 'Clear' button while in Update Special Feature mode
    - expect: The form heading reverts to 'Add Special Feature'
    - expect: The Feature Name input is cleared and empty
    - expect: The Door Opening Type dropdown resets to 'Select Opening Type'
    - expect: The Description input is cleared and empty
    - expect: The 'Status *' dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 6. 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the special feature record in edit mode

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The data table shows at least one special feature record
  2. Click the Edit icon (pencil/edit image) in the Action column of an existing row (e.g., 'Telephone')
    - expect: The form heading changes from 'Add Special Feature' to 'Update Special Feature'
    - expect: The Feature Name input is pre-filled with the feature name from the selected row (e.g., 'Telephone')
    - expect: The Door Opening Type dropdown reflects the stored value (e.g., 'Automatic')
    - expect: The Description input is pre-filled with the existing description
    - expect: A 'Status *' dropdown appears with label 'Status *' and options: 'Select Status', 'Active', 'Inactive'
    - expect: The currently set status (e.g., 'Active') is pre-selected in the Status dropdown
    - expect: The helper text 'Select active or inactive' is visible below the Status dropdown
    - expect: The action button label changes to 'Update'

#### 6.2. TC-EDT-02: Successfully update the Feature Name

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for a special feature record (e.g., 'Nudging function')
    - expect: The form is in Update Special Feature mode with 'Nudging function' pre-filled in Feature Name
  2. Clear the Feature Name input and type a new unique name, e.g., 'Nudging Function Updated'
    - expect: The new name 'Nudging Function Updated' appears in the Feature Name input
  3. Click the 'Update' button
    - expect: A success toast notification appears confirming the update
    - expect: The form resets to the 'Add Special Feature' state with empty inputs
    - expect: The data table refreshes and shows the updated name in the previously edited row

#### 6.3. TC-EDT-03: Successfully update the Door Opening Type in edit mode

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for a special feature with Door Opening Type 'General' (e.g., 'Nudging function')
    - expect: The form is in Update Special Feature mode with Door Opening Type showing 'General'
  2. Change the Door Opening Type dropdown from 'General' to 'Manual'
    - expect: The Door Opening Type dropdown now shows 'Manual'
  3. Click the 'Update' button
    - expect: A success toast notification appears confirming the update
    - expect: The form resets to 'Add Special Feature' state
    - expect: The data table shows the updated Door Opening Type 'manual' for the edited record

#### 6.4. TC-EDT-04: Successfully update the Description in edit mode

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature record
    - expect: The form is in Update Special Feature mode with Description pre-filled
  2. Clear the Description input and type a new description, e.g., 'Updated description for this feature'
    - expect: The new description text appears in the Description input
  3. Click the 'Update' button
    - expect: A success toast notification appears confirming the update
    - expect: The form resets to 'Add Special Feature' state
    - expect: The data table shows the updated description in the edited row

#### 6.5. TC-EDT-05: Update special feature status to Inactive

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature with 'Active' status
    - expect: The form is in Update Special Feature mode with Status dropdown showing 'Active'
  2. In the Status dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to the 'Add Special Feature' state
    - expect: In the data table (when filtered to 'All' statuses), the edited special feature row now shows 'Inactive' badge in the Status column

#### 6.6. TC-EDT-06: Update special feature with empty Feature Name shows validation error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature record
    - expect: The form is in Update Special Feature mode with the Feature Name pre-filled
  2. Clear the Feature Name input field completely so it is empty
    - expect: The Feature Name input is empty
  3. Click the 'Update' button
    - expect: The inline validation error appears below the Feature Name input
    - expect: No API update call is made
    - expect: The form remains in Update Special Feature mode without resetting

#### 6.7. TC-EDT-07: Update special feature with empty Description shows validation error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature record
    - expect: The form is in Update Special Feature mode
  2. Clear the Description input field completely so it is empty
    - expect: The Description input is empty
  3. Click the 'Update' button
    - expect: The inline validation error appears below the Description input
    - expect: No API update call is made
    - expect: The form remains in Update Special Feature mode without resetting

#### 6.8. TC-EDT-08: Update special feature name to a duplicate of an existing feature

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, note two existing feature names (e.g., 'AC' and 'Telephone'), and click Edit on 'Telephone'
    - expect: The form is in Update Special Feature mode with 'Telephone' pre-filled in Feature Name
  2. Clear the Feature Name input and type the name of another existing feature, e.g., 'AC'
    - expect: 'AC' is entered in the Feature Name input
  3. Click the 'Update' button
    - expect: A toast error message 'Something went wrong.' is displayed
    - expect: The special feature is not updated and the original name 'Telephone' remains in the table

#### 6.9. TC-EDT-09: Update Door Opening Type to 'Select Opening Type' (unselect) in edit mode shows validation error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the Edit icon for any special feature record
    - expect: The form is in Update Special Feature mode with a Door Opening Type pre-selected
  2. Change the Door Opening Type dropdown to 'Select Opening Type' (the default unselected placeholder)
    - expect: The Door Opening Type shows 'Select Opening Type'
  3. Click the 'Update' button
    - expect: An inline validation error appears for the Door Opening Type field
    - expect: No API update call is made
    - expect: The form remains in Update Special Feature mode

#### 6.10. TC-EDT-10: Update with an existing active Feature Name and the same Door Opening Type shows an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note two different Active records — record A (e.g., Feature Name: 'AC', Door Opening Type: 'Automatic') and record B (e.g., Feature Name: 'Intercom', Door Opening Type: 'General')
    - expect: Both Active records are visible in the table
  2. Click the Edit icon for record B ('Intercom')
    - expect: The form is in Update Special Feature mode pre-filled with record B's values
  3. Change the Feature Name to record A's name 'AC' and change the Door Opening Type to record A's type 'Automatic', keeping the description unchanged
    - expect: Feature Name shows 'AC' and Door Opening Type shows 'Automatic'
  4. Click the 'Update' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No update is applied — record B ('Intercom') remains unchanged in the table
    - expect: The form stays in Update Special Feature mode

#### 6.11. TC-EDT-11: Update with an existing inactive Feature Name and the same Door Opening Type shows an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, change the Status filter to 'Inactive', and note an Inactive record's Feature Name and Door Opening Type (e.g., Feature Name: 'Old Sensor', Door Opening Type: 'General')
    - expect: The Inactive record is visible in the table under the Inactive filter
  2. Change the Status filter back to 'Active' and click the Edit icon for any Active record (record B)
    - expect: The form is in Update Special Feature mode pre-filled with record B's values
  3. Change the Feature Name to the Inactive record's name 'Old Sensor' and the Door Opening Type to 'General' (same as the Inactive record), keeping the description unchanged
    - expect: Feature Name shows 'Old Sensor' and Door Opening Type shows 'General'
  4. Click the 'Update' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No update is applied — the original Active record (record B) remains unchanged in the table
    - expect: The form stays in Update Special Feature mode

#### 6.12. TC-EDT-12: Update with an existing active Feature Name but a different Door Opening Type should not show an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and note an existing Active record A's Feature Name and Door Opening Type (e.g., Feature Name: 'AC', Door Opening Type: 'Automatic'). Also note a different Active record B (e.g., Feature Name: 'Intercom', Door Opening Type: 'General')
    - expect: Both Active records are visible in the table
  2. Click the Edit icon for record B ('Intercom')
    - expect: The form is in Update Special Feature mode pre-filled with record B's values
  3. Change the Feature Name to record A's name 'AC' and set the Door Opening Type to a value **different** from record A's type (e.g., 'Manual' instead of 'Automatic'), keeping the description unchanged
    - expect: Feature Name shows 'AC' and Door Opening Type shows 'Manual'
  4. Click the 'Update' button
    - expect: A success toast notification appears confirming the update
    - expect: No error toast is shown
    - expect: The form resets to the blank 'Add Special Feature' state
    - expect: The data table reflects the updated record with Feature Name 'AC' and Door Opening Type 'manual'

#### 6.13. TC-EDT-13: Update with an existing inactive Feature Name but a different Door Opening Type should not show an error

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, change the Status filter to 'Inactive', and note an Inactive record's Feature Name and Door Opening Type (e.g., Feature Name: 'Old Sensor', Door Opening Type: 'General')
    - expect: The Inactive record is visible in the Inactive-filtered table
  2. Change the Status filter back to 'Active' and click the Edit icon for any Active record (record B)
    - expect: The form is in Update Special Feature mode pre-filled with record B's values
  3. Change the Feature Name to the Inactive record's name 'Old Sensor' and set the Door Opening Type to a value **different** from the Inactive record's type (e.g., 'Automatic' instead of 'General'), keeping the description unchanged
    - expect: Feature Name shows 'Old Sensor' and Door Opening Type shows 'Automatic'
  4. Click the 'Update' button
    - expect: A success toast notification appears confirming the update
    - expect: No error toast is shown
    - expect: The form resets to the blank 'Add Special Feature' state
    - expect: The data table reflects the updated record with Feature Name 'Old Sensor' and Door Opening Type 'automatic'

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status (default)

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The Status filter dropdown defaults to 'Active'
    - expect: The table shows only Active records
  2. Verify each row in the table has an 'Active' badge in the Status column
    - expect: All visible rows display 'Active' status
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and change the Status filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive special feature records (if any inactive records exist)
    - expect: Records show respective 'Active' or 'Inactive' status badges

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and change the Status filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive special feature records are shown in the table, OR an empty state message such as 'There are no records to display' is shown if there are no Inactive records

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial Feature Name returns matching results

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The full list of Active special features is displayed in the table
  2. Click the search input field in the table toolbar and type a partial name, e.g., 'Inter'
    - expect: The table dynamically filters to show only special features whose names contain 'Inter' (case-insensitive), e.g., 'Intercom'
    - expect: Non-matching rows are hidden from the table

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and type a name that does not exist, e.g., 'XYZNONEXISTENTFEATURE999', into the search input
    - expect: The table shows no rows or an empty state message such as 'There are no records to display'
    - expect: The table does not show any matching special feature records

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and type 'AC' into the search input to filter results
    - expect: The table filters to show only records matching 'AC'
  2. Clear the search input field completely (delete all text)
    - expect: The table restores to show all Active special feature records as before the search
    - expect: The full unfiltered list is displayed

#### 8.4. TC-SRC-04: Search is case-insensitive

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and type an all-lowercase version of an existing feature name, e.g., 'telephone', in the search input
    - expect: The table shows the matching record 'Telephone' regardless of case
    - expect: The search is treated as case-insensitive

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master (default shows 25 rows per page)
    - expect: The Show dropdown displays '25' and up to 25 rows are shown in the table
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records
    - expect: The Show dropdown displays '10'

#### 9.2. TC-PAG-02: Change rows-per-page to 50

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and change the 'Show:' dropdown to '50'
    - expect: The table refreshes to display a maximum of 50 rows per page
    - expect: The Show dropdown displays '50'

#### 9.3. TC-PAG-03: Change rows-per-page to 100

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and change the 'Show:' dropdown to '100'
    - expect: The table refreshes to display a maximum of 100 rows per page
    - expect: The Show dropdown displays '100'

#### 9.4. TC-PAG-04: Navigate between pages using pagination controls

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, set Show to '10', and verify there are multiple pages if more than 10 special features exist
    - expect: Pagination controls with Previous page button, page number buttons, and Next page button are visible at the bottom of the table
    - expect: The 'Previous page' button is disabled on page 1
  2. Click the 'Next page' button (if available)
    - expect: The table advances to page 2 showing the next set of records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled again

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Feature Name column ascending and descending

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master
    - expect: The data table is loaded with special feature records
  2. Click the 'Feature Name' column header button
    - expect: The table re-sorts special feature records alphabetically (A to Z) by Feature Name
    - expect: The sort icon on the Feature Name column indicates ascending sort order
  3. Click the 'Feature Name' column header again
    - expect: The sort order reverses to Z to A (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 10.2. TC-SRT-02: Sort table by Door Opening Type column

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master and click the 'Door Opening Type' column header button
    - expect: The table re-sorts records by Door Opening Type, grouping entries with the same type together (e.g., all 'automatic' together, then 'general', then 'manual')
    - expect: The sort icon on the Door Opening Type column indicates ascending sort order
  2. Click the 'Door Opening Type' column header again
    - expect: The sort order reverses (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 10.3. TC-SRT-03: Sort table by Status column

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, set Status filter to 'All' to ensure both Active and Inactive records are visible, then click the 'Status' column header
    - expect: The table re-sorts records grouping Active and Inactive records
    - expect: The sort icon on the Status column updates to indicate sort direction
  2. Click the 'Status' column header again
    - expect: The sort order reverses
    - expect: The sort icon updates to indicate the reversed sort direction

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INACT-01: Mark an Active special feature as Inactive and verify it disappears from the Active filter

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master with Status filter set to 'Active'. Note the name of a specific special feature in the list (e.g., 'Telephone')
    - expect: The special feature 'Telephone' is visible in the Active list
  2. Click the Edit icon for 'Telephone' to open it in Update Special Feature mode
    - expect: The form shows 'Update Special Feature' with the Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Special Feature' mode
  4. Verify the table with Status filter set to 'Active'
    - expect: The special feature 'Telephone' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The special feature 'Telephone' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-INACT-02: Re-activate an Inactive special feature

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master, change the Status filter to 'Inactive', and click the Edit icon for an Inactive special feature
    - expect: The form shows 'Update Special Feature' with the Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Special Feature' mode
  3. Change the Status filter back to 'Active'
    - expect: The previously Inactive special feature now appears in the Active list with an 'Active' status badge

#### 11.3. TC-INACT-03: Verify Inactive record does not appear under Active filter

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Navigate to /master/special-feature-master with Status filter set to 'Active'
    - expect: All displayed records show the 'Active' badge in the Status column
    - expect: No records with 'Inactive' badge are visible

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Access Special Feature Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/master/special-feature-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Special Feature Master page content is not shown

#### 12.2. TC-NAV-02: Access Special Feature Master via Sales Masters menu navigation

**File:** `tests/Sales-master/special-feature-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master pages including 'Special Feature'
  2. Click the 'Special Feature' link in the Sales Masters sub-menu
    - expect: The Special Feature Master page at /master/special-feature-master is loaded
    - expect: The page heading 'Special Feature Master' is visible in the navigation bar
    - expect: The 'Add Special Feature' form heading is visible
    - expect: The data table with existing special feature records is displayed
