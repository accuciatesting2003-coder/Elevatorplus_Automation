# Cabin Master Test Plan

## Application Overview

The Cabin Master page is part of the ElevatorPlus Sales Masters section, accessible at /master/cabin-master. It allows admin users to manage cabin type records used in elevator sales configurations. The page is a standard master form layout with two sections: (1) an "Add Cabin" form at the top containing a single mandatory field "Cabin Name" with a helper text "Name to identify this cabin type.", and "Clear" and "Submit" buttons; (2) a data table below listing all cabins with columns: Sr. No., Action (Edit icon), Cabin Name, Additional Info-Cabin Image, Additional Info-Sneha Test Image, Additional Info-Shravani Cabin, and Status. The table includes filtering by Status (All / Active / Inactive), a rows-per-page selector (10 / 25 / 50 / 100), a search box ("Search Cabin Name"), an Import button, and sortable column headers. Clicking the Edit icon on a row switches the form header to "Update Cabin", pre-fills the Cabin Name field, exposes a Status dropdown (Active / Inactive), and changes the action button label to "Update". Clicking "Clear" in either mode resets the form to the blank "Add Cabin" state. Successful creation shows a toast: "Cabin created successfully!". Submitting an empty Cabin Name shows inline error: "Please enter cabin name". Submitting a duplicate name returns a toast: "Something went wrong."

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Cabin Master page loads successfully

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Log in to the application using valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/cabin-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/cabin-master
    - expect: The page title should be 'ElevatorPlus'
    - expect: The 'Add Cabin' card heading should be visible
    - expect: The Cabin Name input field (id: cabin_name, label: 'Cabin Name *') should be present and empty
    - expect: The helper text 'Name to identify this cabin type.' should be visible below the input
    - expect: The 'Clear' button and 'Submit' button should both be visible
    - expect: The data table should load and display cabin records with columns: Sr. No., Action, Cabin Name, Additional Info-cabin Image, Additional Info-sneha Test Image, Additional Info-shravani Cabin, Status

#### 1.2. TC-SM-02: Verify page elements and layout

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to the Cabin Master page at /master/cabin-master
    - expect: The form section heading should read 'Add Cabin'
    - expect: An info icon button (id: info-tooltip) should be present next to the heading
  2. Inspect the data table toolbar above the list
    - expect: A 'Show:' rows-per-page dropdown should exist with options: 10, 25, 50, 100 (default 25)
    - expect: A 'Status:' filter dropdown should exist with options: All, Active, Inactive (default Active)
    - expect: An 'Import' button should be present
    - expect: A 'Search Cabin Name' search box should be present
  3. Inspect the table header row
    - expect: Column headers should be: Sr. No., Action, Cabin Name, Additional Info-cabin Image, Additional Info-sneha Test Image, Additional Info-shravani Cabin, Status
    - expect: Cabin Name and Status columns should display sort icons indicating they are sortable

### 2. Add Cabin - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new cabin with a unique name

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Add Cabin' form is displayed with an empty Cabin Name input
  2. Click on the 'Cabin Name *' input field (id: cabin_name)
    - expect: The field receives focus
    - expect: The floating label 'Cabin Name *' animates upward
  3. Type a unique cabin name, for example 'Wood Panel Cabin'
    - expect: The typed text appears in the input field
  4. Click the 'Submit' button
    - expect: A success toast notification appears with message 'Cabin created successfully!'
    - expect: The Cabin Name input is cleared and reset to empty
    - expect: The form heading remains 'Add Cabin'
    - expect: The newly created cabin 'Wood Panel Cabin' appears as the first row in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Create a cabin with a name containing special characters

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Add Cabin' form is visible and empty
  2. Click the Cabin Name input and type a name with special characters, for example 'Grade #304 Stainless Steel - Mirror'
    - expect: The input accepts the text with special characters
  3. Click the 'Submit' button
    - expect: A success toast notification with 'Cabin created successfully!' is displayed
    - expect: The new cabin record appears in the table with the exact name including special characters

#### 2.3. TC-ADD-03: Create a cabin with a long cabin name

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Add Cabin' form is visible and empty
  2. Click the Cabin Name input and type a long name of approximately 100 characters, for example 'Powder-coated Mirror Stainless Steel Grade 304 Cabin Type With Hairline Finish And Gold Design Long'
    - expect: The input accepts the long text string
  3. Click the 'Submit' button
    - expect: Either a success toast 'Cabin created successfully!' is shown, or an appropriate error message is shown if a character limit is enforced
    - expect: If successful, the new cabin appears in the table with the full or truncated name

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Cabin Name shows inline error

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Add Cabin' form is visible with an empty Cabin Name field
  2. Leave the Cabin Name input empty and click the 'Submit' button directly
    - expect: No API call is made to create a cabin
    - expect: The Cabin Name input field gets an 'is-invalid' style applied (red border)
    - expect: An inline error message 'Please enter cabin name' appears below the Cabin Name field in red text
    - expect: The data table is not refreshed and no new record is added

#### 3.2. TC-VAL-02: Error clears when valid input is entered after failed validation

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and click 'Submit' without entering any cabin name to trigger validation error
    - expect: Inline error 'Please enter cabin name' is shown below the Cabin Name input
  2. Click on the Cabin Name input field and type a valid name, for example 'Valid Cabin'
    - expect: The inline error message 'Please enter cabin name' is no longer visible
    - expect: The input's invalid styling (red border) is removed
  3. Click the 'Submit' button
    - expect: The cabin is created successfully
    - expect: A toast notification 'Cabin created successfully!' appears

#### 3.3. TC-VAL-03: Submit form with only whitespace in Cabin Name

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and type only spaces (e.g., '   ') into the Cabin Name input field
    - expect: The spaces are visible in the input field
  2. Click the 'Submit' button
    - expect: Either the validation error 'Please enter cabin name' is shown (treating whitespace-only as empty), or a server-side error is returned
    - expect: No cabin with a blank/whitespace name should be created in the table

### 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submitting an existing cabin name shows an error

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and note an existing cabin name from the data table (e.g., 'meta cabin')
    - expect: At least one cabin record is visible in the table
  2. Type the existing cabin name 'meta cabin' exactly (case as stored) into the Cabin Name input field
    - expect: The text is entered in the input field
  3. Click the 'Submit' button
    - expect: A toast error message 'Something went wrong.' appears
    - expect: No duplicate record is added to the data table
    - expect: The form input is not cleared

#### 4.2. TC-DUP-02: Test case-sensitivity for duplicate cabin name

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and note an existing cabin name, e.g., 'meta cabin'
    - expect: The cabin exists in the table
  2. Type the same name with different casing into the Cabin Name field, e.g., 'Meta Cabin' or 'META CABIN'
    - expect: The text appears in the input
  3. Click the 'Submit' button
    - expect: Observe whether the system treats this as a duplicate and shows error mesage
    

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add Cabin form

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Add Cabin' form is visible with an empty Cabin Name field
  2. Type a cabin name, for example 'Temporary Cabin Name', into the Cabin Name input field
    - expect: The text 'Temporary Cabin Name' is visible in the input
  3. Click the 'Clear' button
    - expect: The Cabin Name input field is cleared and becomes empty
    - expect: The form heading still reads 'Add Cabin'
    - expect: No toast notification or error is shown
    - expect: The data table is not affected

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form to Add Cabin state

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and click the Edit icon (img[alt='Edit']) for any cabin record in the data table
    - expect: The form heading changes to 'Update Cabin'
    - expect: The Cabin Name input is pre-filled with the selected cabin's name
    - expect: A Status dropdown (with options 'Active' and 'Inactive') appears in the form
    - expect: The action button changes to 'Update'
  2. Click the 'Clear' button while in Update Cabin mode
    - expect: The form heading reverts to 'Add Cabin'
    - expect: The Cabin Name input is cleared and empty
    - expect: The Status dropdown is no longer visible in the form
    - expect: The action button reverts to 'Submit'
    - expect: No data changes are made to the database

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens the cabin record in edit mode

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The data table shows at least one cabin record
  2. Click the Edit icon (pencil/edit image) in the Action column of the first row
    - expect: The form heading changes from 'Add Cabin' to 'Update Cabin'
    - expect: The Cabin Name input is pre-filled with the cabin name from the selected row
    - expect: A Status dropdown appears with label 'Status *' and options: 'Select Status', 'Active', 'Inactive'
    - expect: The currently set status ('Active') is pre-selected in the Status dropdown
    - expect: The action button label changes to 'Update'
    - expect: The form scrolls into view so the user can see the populated fields
    - expect: A tooltip showing 'Edit' may be visible near the selected row
    updated data should be displayed in data table

#### 6.2. TC-EDT-02: Successfully update the cabin name

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and click the Edit icon for any cabin record (e.g., 'New Cabin')
    - expect: The form is in Update Cabin mode with 'New Cabin' pre-filled
  2. Clear the Cabin Name input and type a new unique name, e.g., 'Updated Cabin Name Test'
    - expect: The new name appears in the Cabin Name input
  3. Click the 'Update' button
    - expect: A success toast notification appears (e.g., 'Cabin updated successfully!')
    - expect: The form resets to the 'Add Cabin' state with an empty input
    - expect: The data table refreshes and shows the updated cabin name in the previously edited row

#### 6.3. TC-EDT-03: Update cabin status to Inactive

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and click the Edit icon for any cabin with 'Active' status
    - expect: The form is in Update Cabin mode with Status dropdown showing 'Active'
  2. In the Status dropdown, select 'Inactive'
    - expect: The Status dropdown now shows 'Inactive' as the selected value
  3. Click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to the 'Add Cabin' state
    - expect: In the data table (when filtered to 'All' statuses), the edited cabin row now shows 'Inactive' badge in the Status column

#### 6.4. TC-EDT-04: Update cabin with empty Cabin Name shows validation error

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and click the Edit icon for any cabin record
    - expect: The form is in Update Cabin mode with the cabin name pre-filled
  2. Clear the Cabin Name input field completely so it is empty
    - expect: The Cabin Name input is empty
  3. Click the 'Update' button
    - expect: The inline validation error 'Please enter cabin name' appears below the Cabin Name input
    - expect: No API update call is made
    - expect: The form remains in Update Cabin mode without resetting

#### 6.5. TC-EDT-05: Update cabin name to a duplicate of an existing cabin

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master, note two existing cabin names (e.g., 'SS Mirror' and 'SS Cabin'), and click Edit on 'SS Cabin'
    - expect: The form is in Update Cabin mode with 'SS Cabin' pre-filled
  2. Clear the Cabin Name input and type the name of the other existing cabin, e.g., 'SS Mirror'
    - expect: 'SS Mirror' is entered in the Cabin Name input
  3. Click the 'Update' button
    - expect: A toast error message 'Something went wrong.' is displayed
    - expect: The cabin is not updated and the original name 'SS Cabin' remains in the table

### 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Filter table by Active status

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The Status filter dropdown defaults to 'Active' and the table shows only Active records
  2. Verify each row in the table has a green 'Active' badge in the Status column
    - expect: All visible rows display 'Active' status
    - expect: No 'Inactive' rows are displayed

#### 7.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and change the Status filter dropdown from 'Active' to 'All'
    - expect: The dropdown shows 'All' as the selected option
  2. Observe the data table after selecting 'All'
    - expect: The table refreshes to display both Active and Inactive cabin records
    - expect: Inactive cabins (if any exist) are shown alongside Active ones

#### 7.3. TC-FLT-03: Filter table by Inactive status

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and change the Status filter dropdown to 'Inactive'
    - expect: The dropdown shows 'Inactive' as the selected option
  2. Observe the data table
    - expect: Only Inactive cabin records are shown in the table, OR a 'No records found' / empty state message is shown if there are no Inactive cabins

### 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by partial cabin name returns matching results

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The full list of Active cabins is displayed in the table
  2. Click the 'Search Cabin Name' input field in the table toolbar and type a partial name, e.g., 'cabin'
    - expect: The table dynamically filters to show only cabins whose names contain 'cabin' (case-insensitive)
    - expect: Non-matching rows are hidden

#### 8.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master and type a name that does not exist, e.g., 'XYZNONEXISTENTCABIN999', into the Search Cabin Name input
    - expect: The table shows no rows or an empty state message
    - expect: The table does not show any matching cabin records

#### 8.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master, type 'meta' into the Search Cabin Name input to filter results
    - expect: The table shows only records matching 'meta'
  2. Clear the Search Cabin Name input field completely (delete all text)
    - expect: The table restores to show all Active cabin records as before the search
    - expect: The full unfiltered list is displayed

### 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master (default shows 25 rows per page)
    - expect: The Show dropdown displays '25' and up to 25 rows are shown in the table
  2. Change the 'Show:' dropdown from '25' to '10'
    - expect: The table refreshes to display a maximum of 10 rows
    - expect: Pagination controls appear if there are more than 10 total records

#### 9.2. TC-PAG-02: Navigate between pages using pagination controls

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master, set Show to '10' and verify there are multiple pages if more than 10 cabins exist
    - expect: Pagination controls with Previous, page numbers, and Next buttons are visible
  2. Click the 'Next page' button
    - expect: The table advances to page 2 showing the next set of 10 records
    - expect: The page 2 button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
  3. Click the 'Previous page' button
    - expect: The table returns to page 1
    - expect: The 'Previous page' button becomes disabled again

### 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort table by Cabin Name column

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The data table is loaded with cabin records
  2. Click the 'Cabin Name' column header button
    - expect: The table re-sorts cabin records alphabetically (A to Z) by Cabin Name
    - expect: The sort icon on the Cabin Name column indicates ascending sort order
  3. Click the 'Cabin Name' column header again
    - expect: The sort order reverses to Z to A (descending)
    - expect: The sort icon updates to indicate descending sort order

#### 10.2. TC-SRT-02: Sort table by Status column

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master, set Status filter to 'All', then click the 'Status' column header
    - expect: The table re-sorts records grouping Active and Inactive records
    - expect: The sort icon on the Status column updates

### 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INA-01: Mark an Active cabin as Inactive and verify it disappears from the Active filter

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master with Status filter set to 'Active'. Note the name of the first cabin in the list (e.g., 'Test Cabin Unique XYZ123')
    - expect: The cabin 'Test Cabin Unique XYZ123' is visible in the Active list
  2. Click the Edit icon for 'Test Cabin Unique XYZ123' to open it in Update Cabin mode
    - expect: The form shows 'Update Cabin' with the Status dropdown set to 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Cabin' mode
  4. Verify the table with Status filter 'Active'
    - expect: The cabin 'Test Cabin Unique XYZ123' no longer appears in the Active-filtered table
  5. Change the Status filter to 'Inactive'
    - expect: The cabin 'Test Cabin Unique XYZ123' now appears in the Inactive-filtered table with an 'Inactive' status badge

#### 11.2. TC-INA-02: Re-activate an Inactive cabin

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master, change Status filter to 'Inactive', and click the Edit icon for an Inactive cabin
    - expect: The form shows 'Update Cabin' with Status dropdown showing 'Inactive'
  2. Change the Status dropdown from 'Inactive' to 'Active' and click the 'Update' button
    - expect: A success toast notification is displayed
    - expect: The form resets to 'Add Cabin' mode
  3. Change the Status filter back to 'Active'
    - expect: The previously Inactive cabin now appears in the Active list with 'Active' status badge

### 12. Import Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-IMP-01: Verify Import button is present and clickable

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Navigate to /master/cabin-master
    - expect: The 'Import' button is visible in the table toolbar area
  2. Click the 'Import' button
    - expect: A file chooser dialog opens, OR a modal/panel appears with import instructions and a file upload option
    - expect: The import interface is accessible and functional

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Access Cabin Master page via direct URL without authentication redirects to login

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Open a new browser context (no authentication state) and navigate directly to https://stage.elevatorplus.net/master/cabin-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Cabin Master page content is not shown

#### 13.2. TC-NAV-02: Access Cabin Master via Sales Masters menu navigation

**File:** `tests/Sales-master/cabin-master.spec.ts`

**Steps:**
  1. Log in and navigate to the Dashboard. Click on 'Sales Masters' in the left sidebar navigation
    - expect: The Sales Masters sub-menu expands or navigates to show available sales master pages
  2. Look for and click the 'Cabin Master' link in the sub-menu
    - expect: The Cabin Master page at /master/cabin-master is loaded
    - expect: The page heading 'Add Cabin' is visible
    - expect: The data table with existing cabin records is displayed
