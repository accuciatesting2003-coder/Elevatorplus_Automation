# Material Category Master Test Plan

## Application Overview

The Material Category Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/material-category-master. It allows admin users to manage material category records used in elevator sales configurations. The page is a standard master form layout with two sections: (1) an "Add Material Category" form at the top containing a single mandatory field "Material Category Name *" with a helper text "Name to identify this material category.", and "Clear" and "Submit" buttons; (2) a data table below listing all material categories with columns: Sr. No., Action (Edit icon), Material Category Name, and Status. The table includes filtering by Status (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), a search box ("Search category name"), an Import button, and sortable column headers. Clicking the Edit icon on a row switches the form header to "Update Material Category", pre-fills the Material Category Name field, exposes a Status dropdown (Select Status / Active / Inactive) with helper text "Select active or inactive", and changes the action button label to "Update". Clicking "Clear" in either mode resets the form to the blank "Add Material Category" state. Successful creation shows a toast: "Material category created successfully!". Submitting an empty Material Category Name shows inline error: "Please enter material category name". Submitting a duplicate name returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Material Category Master page loads successfully

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/material-category-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/material-category-master
    - expect: The page title should be 'material category master'
    - expect: The 'Add Material Category' card heading should be visible
    - expect: The Material Category Name input field (label: 'Material Category Name *') should be present and empty
    - expect: The helper text 'Name to identify this material category.' should be visible below the input
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display material category records with columns: Sr. No., Action, Material Category Name, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to the Material Category Master page at /master/material-category-master
    - expect: The form section heading should read 'Add Material Category'
    - expect: An info icon button should be present next to the heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Import' button should be present
    - expect: A 'Search category name' search box should be present
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Material Category Name, Status
    - expect: Material Category Name and Status columns should display sort icons indicating they are sortable

### 2. Add Material Category - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new material category with a unique name

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Add Material Category' form is displayed with an empty Material Category Name input
  2. Click on the 'Material Category Name *' input field
    - expect: The field receives focus
    - expect: The floating label 'Material Category Name *' animates upward
  3. Type a unique material category name, for example 'Mechanical'
    - expect: The typed text appears in the input field
  4. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Material category created successfully!'
    - expect: The Material Category Name input is cleared and reset to empty
    - expect: The form heading remains 'Add Material Category'
    - expect: The newly created material category 'Mechanical' appears in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Create a material category with a name containing special characters

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Add Material Category' form is visible and empty
  2. Click the Material Category Name input and type a name with special characters, for example 'Electro-Mechanical & Hydraulic'
    - expect: The input accepts the text with special characters
  3. Click the 'Submit' button
    - expect: A success toast notification with 'Material category created successfully!' is displayed
    - expect: The new material category record appears in the table with the exact name including special characters

#### 2.3. TC-ADD-03: Create a material category with a long name

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Add Material Category' form is visible and empty
  2. Click the Material Category Name input and type a long name of approximately 100 characters, for example 'High-Grade Stainless Steel and Powder-Coated Structural Material Category For Heavy-Duty Installation'
    - expect: The input accepts the long text string
  3. Click the 'Submit' button
    - expect: Either a success toast 'Material category created successfully!' is shown, or an appropriate error message is shown if a character limit is enforced

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Material Category Name shows inline error

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Add Material Category' form is visible with an empty Material Category Name field
  2. Leave the Material Category Name input empty and click the 'Submit' button directly
    - expect: No API call is made to create a material category
    - expect: The Material Category Name input field gets an 'is-invalid' style applied (red border)
    - expect: An inline error message 'Please enter material category name' appears below the Material Category Name field in red text
    - expect: The data table is not refreshed and no new record is added

#### 3.2. TC-VAL-02: Error clears when valid input is entered after failed validation

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and click 'Submit' without entering any material category name to trigger validation error
    - expect: Inline error 'Please enter material category name' is shown below the Material Category Name input
  2. Click on the Material Category Name input field and type a valid name, for example 'Hardware'
    - expect: The inline error message 'Please enter material category name' is no longer visible
    - expect: The input's invalid styling (red border) is removed
  3. Click the 'Submit' button
    - expect: The material category is created successfully
    - expect: A toast notification 'Material category created successfully!' appears

#### 3.3. TC-VAL-03: Submit form with only whitespace in Material Category Name

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and type only spaces (e.g., '   ') into the Material Category Name input field
    - expect: The spaces are visible in the input field
  2. Click the 'Submit' button
    - expect: Either the validation error 'Please enter material category name' is shown (treating whitespace-only as empty), or a server-side error is returned
    - expect: No material category with a blank/whitespace name should be created in the table

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing material category name shows an error

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and note an existing material category name from the data table (e.g., 'Electrical')
    - expect: At least one material category record is visible in the table
  2. Type the existing material category name 'Electrical' exactly (case as stored) into the Material Category Name input field
    - expect: The text is entered in the input field
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the data table
    - expect: The form input is not cleared

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate material category name

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and note an existing material category name, e.g., 'Electrical'
    - expect: The material category exists in the table
  2. Type the same name with different casing into the Material Category Name field, e.g., 'electrical' or 'ELECTRICAL'
    - expect: The text appears in the input
  3. Click the 'Submit' button
    - expect: Observe whether the system treats this as a duplicate and shows an error message

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Material Category form

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Add Material Category' form is visible with an empty Material Category Name field
  2. Type a material category name, for example 'Temporary Category', into the Material Category Name input field
    - expect: The text 'Temporary Category' is visible in the input
  3. Click the 'Clear' button
    - expect: The Material Category Name input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Material Category'
    - expect: No toast notification or error is shown
    - expect: The data table is not affected

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Material Category state

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and click the Edit icon (img[alt='Edit']) for any material category record in the data table
    - expect: The form heading changes to 'Update Material Category'
    - expect: The Material Category Name input is pre-filled with the selected material category's name
    - expect: A Status dropdown (with options 'Select Status', 'Active' and 'Inactive') appears in the form
    - expect: The action button changes to 'Update'
  2. Click the 'Clear' button while in Update Material Category mode
    - expect: The form heading reverts to 'Add Material Category'
    - expect: The Material Category Name input is cleared and empty
    - expect: The Status dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the material category record in edit mode

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The data table shows at least one material category record
  2. Click the Edit icon (img[alt='Edit']) in the Action column of the first row
    - expect: The form heading changes from 'Add Material Category' to 'Update Material Category'
    - expect: The Material Category Name input is pre-filled with the material category name from the selected row
    - expect: A Status dropdown appears with label 'Status *', helper text 'Select active or inactive', and options: 'Select Status', 'Active', 'Inactive'
    - expect: The currently set status ('Active') is pre-selected in the Status dropdown
    - expect: The action button label changes to 'Update'
    - expect: A tooltip showing 'Edit' may be visible near the selected row

#### 6.2. TC-EDT-02: Successfully update the material category name

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and click the Edit icon for any material category record (e.g., 'Common')
    - expect: The form is in Update Material Category mode with 'Common' pre-filled
  2. Clear the Material Category Name input and type a new unique name, e.g., 'Common Updated'
    - expect: The new name appears in the Material Category Name input
  3. Click the 'Update' button
    - expect: A success toast notification appears (e.g., 'Material category updated successfully!')
    - expect: The form resets to the 'Add Material Category' state with an empty input
    - expect: The data table refreshes and shows the updated material category name in the previously edited row

#### 6.3. TC-EDT-03: Update material category status to Inactive

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and click the Edit icon for any material category with 'Active' status
    - expect: The form is in Update Material Category mode with Status dropdown showing 'Active'
  2. In the Status dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to the 'Add Material Category' state
    - expect: In the data table (when filtered to 'All' statuses), the edited material category row now shows 'Inactive' badge in the Status column

#### 6.4. TC-EDT-04: Update material category with empty name shows validation error

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and click the Edit icon for any material category record
    - expect: The form is in Update Material Category mode with the material category name pre-filled
  2. Clear the Material Category Name input field completely so it is empty
    - expect: The Material Category Name input is empty
  3. Click the 'Update' button
    - expect: The inline validation error 'Please enter material category name' appears below the Material Category Name input
    - expect: No API update call is made
    - expect: The form remains in Update Material Category mode without resetting

#### 6.5. TC-EDT-05: Update material category name to a duplicate of an existing one

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master, note two existing material category names (e.g., 'Electrical' and 'Consumable'), and click Edit on 'Consumable'
    - expect: The form is in Update Material Category mode with 'Consumable' pre-filled
  2. Clear the Material Category Name input and type the name of the other existing material category, e.g., 'Electrical'
    - expect: 'Electrical' is entered in the Material Category Name input
  3. Click the 'Update' button
    - expect: A toast error message should be dispalyed 
    - expect: The material category is not updated and the original name 'Consumable' remains in the table

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The Status filter dropdown defaults to 'Active' and the table shows only Active records
  2. Verify each row in the table has a green 'Active' badge in the Status column
    - expect: All visible rows display 'Active' status
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and change the Status filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive material category records
    - expect: Inactive material categories (if any exist) are shown alongside Active ones

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and change the Status filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive material category records are shown in the table, OR a 'No records found' / empty state message is shown if there are no Inactive material categories

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial material category name returns matching results

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The full list of Active material categories is displayed in the table
  2. Click the 'Search category name' input field in the table toolbar and type a partial name, e.g., 'elec'
    - expect: The table dynamically filters to show only material categories whose names contain 'elec' (case-insensitive)
    - expect: Non-matching rows are hidden

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master and type a name that does not exist, e.g., 'XYZNONEXISTENT999', into the Search category name input
    - expect: The table shows no rows or an empty state message
    - expect: The table does not show any matching material category records

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master, type 'elec' into the Search category name input to filter results
    - expect: The table shows only records matching 'elec'
  2. Clear the Search category name input field completely (delete all text)
    - expect: The table restores to show all Active material category records as before the search
    - expect: The full unfiltered list is displayed

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master (default shows 25 rows per page)
    - expect: The Show dropdown displays '25' and up to 25 rows are shown in the table
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 9.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master, set Show to '10' and verify there are multiple pages if more than 10 material categories exist
    - expect: Pagination controls with Previous, page numbers, and Next buttons are visible
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled again

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Material Category Name column

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The data table is loaded with material category records
  2. Click the 'Material Category Name' column header button
    - expect: The table re-sorts material category records alphabetically (A to Z) by Material Category Name
    - expect: The sort icon on the Material Category Name column indicates ascending sort order
  3. Click the 'Material Category Name' column header again
    - expect: The sort order reverses to Z to A (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master, set Status filter to 'All', then click the 'Status' column header
    - expect: The table re-sorts records grouping Active and Inactive material categories
    - expect: The sort icon on the Status column updates

### 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Mark an Active material category as Inactive and verify it disappears from the Active filter

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master with Status filter set to 'Active'. Note the name of a material category in the list (e.g., 'Consumable')
    - expect: The material category 'Consumable' is visible in the Active list
  2. Click the Edit icon for 'Consumable' to open it in Update Material Category mode
    - expect: The form shows 'Update Material Category' with the Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Material Category' mode
  4. Verify the table with Status filter 'Active'
    - expect: The material category 'Consumable' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The material category 'Consumable' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-INA-02: Re-activate an Inactive material category

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master, change Status filter to 'Inactive', and click the Edit icon for an Inactive material category
    - expect: The form shows 'Update Material Category' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Material Category' mode
  3. Change the Status filter back to 'Active'
    - expect: The previously Inactive material category now appears in the Active list with 'Active' status badge

<!-- ### 12. Import Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-IMP-01: Verify Import button is present and clickable

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Navigate to /master/material-category-master
    - expect: The 'Import' button is visible in the table toolbar area
  2. Click the 'Import' button
    - expect: A file chooser dialog opens, OR a modal/panel appears with import instructions and a file upload option
    - expect: The import interface is accessible and functional -->

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Material Category Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/master/material-category-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Material Category Master page content is not shown

#### 13.2. TC-NAV-02: Access Material Category Master via Sales Masters menu navigation

**File:** `tests/Sales-master/material-category-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands to show available sales master pages
  2. Look for and click the 'Material Category' link in the sub-menu
    - expect: The Material Category Master page at /master/material-category-master is loaded
    - expect: The page heading 'Add Material Category' is visible
    - expect: The data table with existing material category records is displayed
