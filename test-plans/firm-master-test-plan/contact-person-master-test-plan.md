# Contact Person Master - Test Plan

## Application Overview

The Contact Person Master page (URL: /master/contact-person-master) is part of the Firm Masters section in the ElevatorPlus staging application. It allows users to add, view, edit, and manage contact persons associated with firms and their sites.

**Add Form Fields:**
- Contact Person Name (mandatory, floating-label text input, helper: "Enter contact person name")
- Firm Name (mandatory, searchable dropdown with 808+ firms, helper: "Select firm")
- Site Name (mandatory, searchable dropdown filtered by selected firm, helper: "Select site")
- Contact No. (mandatory, phone number input with country-code picker defaulting to +91 India, helper: "Enter your contact number")
- Email (optional, floating-label text input, helper: "Enter your email ID")
- Note (optional, floating-label text input, helper: "Enter your note here")

**Validation messages:** "Please enter contact person name" | "Please select firm name" | "Please select site name" | "Please enter contact number"

**Edit Mode:** Clicking the Edit icon loads all existing field values into the form, renames the heading to "Update Contact Person", adds a Status dropdown (Active/Inactive), and renames the Submit button to "Update".

**Table Columns:** Sr. No. | Action (Edit icon) | Contact Person Name | Firm Name | Site Name | Contact No. | Email | Note | Status (displayed as h5 heading badge)

**Toolbar:** Show rows dropdown (10/25/50/100, default 25) | Status filter dropdown (All/Active/Inactive, default Active) | Search box (labeled "Owner Name" which searches contact person name)

**Pagination:** Previous/Next page buttons plus numbered pages

**Firm-Site Dependency:** The Site Name dropdown is filtered to show only sites belonging to the selected firm. When a different firm is selected, the Site Name dropdown resets/clears.

**Confirmed test firms with sites:**
- Firm 1 (919090909089) — sites: "Duplicate Site 2", "Duplicate S1"
- Pulse (919876543210) — sites: "Site Galaxy", "SIte Aura"

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Contact Person Master page loads successfully

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/contact-person-master
    - expect: The page title heading shows 'Contact Person Master'
    - expect: The add form with heading 'Add Contact Person' is visible
    - expect: The data table with columns Sr. No., Action, Contact Person Name, Firm Name, Site Name, Contact No., Email, Note, Status is visible
    - expect: The toolbar shows Show rows, Status filter, and Search elements

#### 1.2. TC-SM-02: Add form contains all required fields

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and inspect the add form
    - expect: Contact Person Name text input with floating label and asterisk is visible
    - expect: Firm Name searchable dropdown with asterisk is visible
    - expect: Site Name searchable dropdown with asterisk is visible
    - expect: Contact No. input with country-code picker defaulting to +91 India and asterisk is visible
    - expect: Email text input without asterisk is visible
    - expect: Note text input without asterisk is visible
    - expect: Clear button and Submit button are visible

#### 1.3. TC-SM-03: Firm Name dropdown is searchable and loads options

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Click on the Firm Name dropdown
    - expect: A dropdown list of firm options appears
  2. Type 'Firm 1' in the Firm Name dropdown search box
    - expect: The dropdown filters to show firms matching 'Firm 1', including 'Firm 1 (919090909089)'

#### 1.4. TC-SM-04: Table displays records with pagination

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and examine the data table
    - expect: The table shows up to 25 rows by default
    - expect: Pagination controls (Previous, page numbers, Next) are visible
    - expect: Each row has an Edit icon in the Action column

### 2. Add Contact Person - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Add a new contact person with all mandatory fields

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: The 'Add Contact Person' form is displayed
  2. Enter 'Test Contact Person' in the Contact Person Name field
    - expect: The text 'Test Contact Person' appears in the Contact Person Name field
  3. Click the Firm Name dropdown and search for 'Firm 1', then select 'Firm 1 (919090909089)'
    - expect: 'Firm 1 (919090909089)' is selected in the Firm Name field
    - expect: The Site Name dropdown becomes available and shows sites for Firm 1
  4. Click the Site Name dropdown and select 'Duplicate S1'
    - expect: 'Duplicate S1' is selected in the Site Name field
  5. Enter '9876543210' in the Contact No. field
    - expect: The phone number is entered and displayed with the +91 prefix
  6. Click the Submit button
    - expect: A success toast message appears confirming the contact person was added
    - expect: The form is cleared/reset to empty state
    - expect: The new contact person 'Test Contact Person' appears in the data table with Firm Name 'Firm 1' and Site Name 'Duplicate S1'

#### 2.2. TC-ADD-02: Add a new contact person with all fields including optional ones

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: The 'Add Contact Person' form is displayed
  2. Enter 'Full Fields Contact' in the Contact Person Name field
    - expect: The name is entered
  3. Search for and select 'Firm 1 (919090909089)' in the Firm Name dropdown
    - expect: Firm is selected
  4. Select 'Duplicate Site 2' from the Site Name dropdown
    - expect: Site is selected
  5. Enter '8765432109' in the Contact No. field
    - expect: Phone number is entered
  6. Enter 'fullfields@test.com' in the Email field
    - expect: Email is entered
  7. Enter 'This is a test note for contact person' in the Note field
    - expect: Note is entered
  8. Click the Submit button
    - expect: A success toast message appears
    - expect: The form clears/resets
    - expect: The new record 'Full Fields Contact' appears in the table with Firm Name 'Firm 1', Site Name 'Duplicate Site 2', the phone number, email 'fullfields@test.com', and note populated

### 3. Mandatory Field Validation Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with all fields empty shows all validation errors

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page with the form in its default empty state
    - expect: All form fields are empty
  2. Click the Submit button without filling in any fields
    - expect: Validation error 'Please enter contact person name' appears below the Contact Person Name field
    - expect: Validation error 'Please select firm name' appears below the Firm Name field
    - expect: Validation error 'Please select site name' appears below the Site Name field
    - expect: Validation error 'Please enter contact number' appears below the Contact No. field
    - expect: No record is submitted or added to the table

#### 3.2. TC-VAL-02: Submit form with only Contact Person Name missing

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: Form is empty
  2. Select 'Firm 1 (919090909089)' in the Firm Name dropdown, select 'Duplicate S1' in the Site Name dropdown, and enter '9876543210' in the Contact No. field — but leave Contact Person Name empty
    - expect: All non-name fields are filled
  3. Click the Submit button
    - expect: Validation error 'Please enter contact person name' appears below the Contact Person Name field
    - expect: No record is submitted

#### 3.3. TC-VAL-03: Submit form with only Firm Name missing

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: Form is empty
  2. Enter 'Test Name' in Contact Person Name and '9876543210' in Contact No., but do not select a Firm Name or Site Name
    - expect: Name and phone are entered
  3. Click the Submit button
    - expect: Validation error 'Please select firm name' appears below the Firm Name field
    - expect: Validation error 'Please select site name' appears below the Site Name field
    - expect: No record is submitted

#### 3.4. TC-VAL-04: Submit form with Firm selected but Site Name missing

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: Form is empty
  2. Enter 'Test Name' in Contact Person Name, select 'Firm 1 (919090909089)' in Firm Name, and enter '9876543210' in Contact No. — but do not select a Site Name
    - expect: Name, firm, and phone are filled; site is empty
  3. Click the Submit button
    - expect: Validation error 'Please select site name' appears below the Site Name field
    - expect: No record is submitted

#### 3.5. TC-VAL-05: Submit form with only Contact No. missing

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: Form is empty
  2. Enter 'Test Name' in Contact Person Name, select 'Firm 1 (919090909089)' in Firm Name, select 'Duplicate S1' in Site Name — but leave Contact No. empty
    - expect: Name, firm, and site are filled; contact no. is empty
  3. Click the Submit button
    - expect: Validation error 'Please enter contact number' appears below the Contact No. field
    - expect: No record is submitted

#### 3.6. TC-VAL-06: Whitespace-only Contact Person Name shows validation error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Enter only spaces (e.g., '   ') in the Contact Person Name field. Select 'Firm 1 (919090909089)' in Firm Name, select 'Duplicate S1' in Site Name, and enter '9876543210' in Contact No. Click Submit.
    - expect: Validation error 'Please enter contact person name' appears below the Contact Person Name field (whitespace is trimmed and treated as empty)
    - expect: No record is submitted or added to the table

#### 3.7. TC-VAL-07: Whitespace-only Contact No. shows validation error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Enter 'Test Name' in Contact Person Name, select 'Firm 1 (919090909089)' in Firm Name, select 'Duplicate S1' in Site Name, and enter only spaces (e.g., '   ') in the Contact No. field. Click Submit.
    - expect: Validation error 'Please enter contact number' appears below the Contact No. field (whitespace is trimmed and treated as empty)
    - expect: No record is submitted or added to the table

### 4. Optional Fields Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-OPT-01: Submit without Email — form submits successfully

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and fill in Contact Person Name, Firm Name (Firm 1), Site Name (Duplicate S1), and Contact No. — leave Email and Note empty
    - expect: All mandatory fields are filled; optional fields are empty
  2. Click the Submit button
    - expect: The form submits successfully with a success toast message
    - expect: The new record appears in the table with the Email column showing blank or '-'

#### 4.2. TC-OPT-02: Submit without Note — form submits successfully

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and fill in all mandatory fields and Email — leave Note empty
    - expect: Mandatory fields and Email are filled; Note is empty
  2. Click the Submit button
    - expect: The form submits successfully with a success toast message
    - expect: The new record appears in the table with the Note column showing blank or '-'

#### 4.3. TC-OPT-03: Email field accepts valid email format

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Fill in all mandatory fields, then enter 'validtest@example.com' in the Email field
    - expect: The email is accepted without validation errors
  2. Click the Submit button
    - expect: The form submits successfully
    - expect: The email 'validtest@example.com' appears in the Email column of the new table row

### 5. Dropdown Dependency Tests (Firm to Site)

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-DEP-01: Selecting a firm populates Site Name dropdown with only that firm's sites

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: Both Firm Name and Site Name dropdowns are empty
  2. Click the Firm Name dropdown, search for 'Firm 1', and select 'Firm 1 (919090909089)'
    - expect: 'Firm 1 (919090909089)' is selected in Firm Name field
  3. Click the Site Name dropdown to view available options
    - expect: The Site Name dropdown shows exactly the sites belonging to Firm 1: 'Duplicate Site 2' and 'Duplicate S1'
    - expect: No sites from other firms are shown

#### 5.2. TC-DEP-02: Changing the firm resets the Site Name dropdown

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page, select 'Firm 1 (919090909089)' in Firm Name, and then select 'Duplicate S1' in Site Name
    - expect: Firm 1 is selected and 'Duplicate S1' is selected in Site Name
  2. Click the Firm Name dropdown, clear the current selection by clicking the X/clear icon or typing a new firm name, search for 'Pulse', and select 'Pulse (919876543210)'
    - expect: 'Pulse (919876543210)' is now selected in the Firm Name field
    - expect: The Site Name dropdown is reset/cleared and no longer shows 'Duplicate S1'
  3. Click the Site Name dropdown to view available options
    - expect: The Site Name dropdown shows only the sites belonging to Pulse firm: 'Site Galaxy' and 'SIte Aura'
    - expect: Sites from Firm 1 ('Duplicate S1', 'Duplicate Site 2') are NOT shown

#### 5.3. TC-DEP-03: Site Name dropdown shows no options when no Firm is selected

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page with the form in a fresh state and do not select any firm
    - expect: The Firm Name dropdown shows no selection
  2. Click the Site Name dropdown without having selected a firm
    - expect: The Site Name dropdown shows no options (empty list or 'No options' message), indicating it requires a firm selection first

#### 5.4. TC-DEP-04: Selecting a firm with no sites results in empty Site Name dropdown

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and search for and select a firm that has no associated sites in the Firm Name dropdown
    - expect: A firm with no sites is selected in the Firm Name field
  2. Click the Site Name dropdown
    - expect: The Site Name dropdown shows no options (e.g., 'No options' message)
  3. Fill in Contact Person Name and Contact No., then click Submit
    - expect: Validation error 'Please select site name' appears
    - expect: No record is submitted

#### 5.5. TC-DEP-05: Site Name dropdown is searchable within the filtered firm's sites

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Select 'Pulse (919876543210)' in the Firm Name dropdown to load its sites
    - expect: Pulse is selected and the Site Name dropdown is populated with Pulse sites
  2. Click the Site Name dropdown and type 'Galaxy' to search
    - expect: The dropdown filters to show 'Site Galaxy' matching the search term
  3. Select 'Site Galaxy' from the filtered results
    - expect: 'Site Galaxy' is selected in the Site Name field

### 6. Clear Button Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets all form fields in Add mode

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and fill in all fields: Contact Person Name = 'Clear Test', Firm Name = 'Firm 1 (919090909089)', Site Name = 'Duplicate S1', Contact No. = '9876543210', Email = 'clear@test.com', Note = 'Clear note'
    - expect: All fields are populated
  2. Click the Clear button
    - expect: Contact Person Name field is empty
    - expect: Firm Name dropdown shows no selection
    - expect: Site Name dropdown shows no selection
    - expect: Contact No. field is reset (shows only +91 prefix)
    - expect: Email field is empty
    - expect: Note field is empty
    - expect: The form heading still shows 'Add Contact Person'

#### 6.2. TC-CLR-02: Clear button in Edit mode cancels the edit and resets the form

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and click the Edit icon on any row in the table
    - expect: The form heading changes to 'Update Contact Person'
    - expect: All fields are populated with the existing record values
    - expect: A Status dropdown is visible in the form
    - expect: The Update button is visible
  2. Click the Clear button
    - expect: The form heading changes back to 'Add Contact Person'
    - expect: All form fields are cleared/reset to empty
    - expect: The Status dropdown is no longer visible in the form
    - expect: The button changes back to 'Submit'

### 7. Edit and Update Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDIT-01: Edit icon loads existing record values into the form

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and identify a row in the table (e.g., row 1: Contact Person = 'Shubham Check', Firm = 'Same', Site = 'SK')
    - expect: The row with known values is visible in the table
  2. Click the Edit icon on that row
    - expect: The form heading changes to 'Update Contact Person'
    - expect: The Contact Person Name field shows the existing name ('Shubham Check')
    - expect: The Firm Name dropdown shows the existing firm ('Same')
    - expect: The Site Name dropdown shows the existing site ('SK')
    - expect: The Contact No. field shows the existing phone number
    - expect: The Status dropdown appears showing the current status ('Active' or 'Inactive')
    - expect: The Submit button is replaced by an 'Update' button

#### 7.2. TC-EDIT-02: Successfully update an existing contact person's name

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and click the Edit icon on any existing row
    - expect: Form is in Update mode with existing values loaded
  2. Clear the Contact Person Name field and type a new name, e.g., 'Updated Contact Name'
    - expect: The new name is entered in the field
  3. Click the Update button
    - expect: A success toast message appears
    - expect: The form resets to 'Add Contact Person' mode
    - expect: The updated record appears in the table with the new name 'Updated Contact Name'

#### 7.3. TC-EDIT-03: Change status from Active to Inactive via edit mode

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page with the default Status filter 'Active', and click the Edit icon on any 'Active' row
    - expect: Form loads in Update mode with Status dropdown showing 'Active'
  2. Change the Status dropdown from 'Active' to 'Inactive'
    - expect: 'Inactive' is now selected in the Status dropdown
  3. Click the Update button
    - expect: A success toast message appears
    - expect: The form resets to Add mode
    - expect: The record no longer appears in the table (since the Status filter defaults to Active only)
    - expect: Changing the Status filter to 'All' or 'Inactive' shows the record with 'Inactive' status

#### 7.4. TC-EDIT-04: Clear all mandatory fields in Update mode and click Update — all validation errors appear

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and click the Edit icon on any row.
    - expect: The form heading changes to 'Update Contact Person'
    - expect: All fields are pre-filled with the existing record's values
  2. Clear the Contact Person Name field (backspace or triple-click and delete).
    - expect: The Contact Person Name field is empty
  3. Clear the Contact No. field.
    - expect: The Contact No. field is empty (shows only the +91 prefix)
  4. Click the Update button.
    - expect: Validation error 'Please enter contact person name' appears below the Contact Person Name field
    - expect: Validation error 'Please enter contact number' appears below the Contact No. field
    - expect: No update is submitted to the server
    - expect: The form remains in 'Update Contact Person' mode

#### 7.5. TC-EDIT-05: Clear each mandatory field individually in Update mode and verify validation error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Click the Edit icon on any row. Clear only the Contact Person Name field, keep all other fields as-is, then click Update.
    - expect: Validation error 'Please enter contact person name' appears
    - expect: No update is submitted
  2. Restore the Contact Person Name. Clear only the Contact No. field, then click Update.
    - expect: Validation error 'Please enter contact number' appears
    - expect: No update is submitted
  3. Restore the Contact No. Click Clear to exit Update mode.
    - expect: The form resets to 'Add Contact Person' mode

#### 7.6. TC-EDIT-06: Whitespace-only values in mandatory fields in Update mode show validation errors

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Click the Edit icon on any existing row.
    - expect: Form is in Update mode with existing values loaded
  2. Clear the Contact Person Name field and type only spaces (e.g., '   '). Click Update.
    - expect: Validation error 'Please enter contact person name' appears (whitespace is trimmed and treated as empty)
    - expect: No update is submitted
  3. Restore the Contact Person Name. Clear the Contact No. field and type only spaces. Click Update.
    - expect: Validation error 'Please enter contact number' appears (whitespace trimmed)
    - expect: No update is submitted

### 8. Status Filter Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-STS-01: Default Status filter shows Active records only

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: The Status filter dropdown in the toolbar shows 'Active' as the default selected value
    - expect: The table displays only records with 'Active' status in the Status column

#### 8.2. TC-STS-02: Selecting 'All' in Status filter shows both Active and Inactive records

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and change the Status filter dropdown from 'Active' to 'All'
    - expect: The table refreshes and shows records with both Active and Inactive statuses

#### 8.3. TC-STS-03: Selecting 'Inactive' in Status filter shows only Inactive records

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and change the Status filter dropdown to 'Inactive'
    - expect: The table shows only records with 'Inactive' status, or shows an empty table if no inactive records exist

### 9. Search Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRCH-01: Search box filters records by Contact Person Name

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and locate the search box labeled 'Owner Name' in the toolbar
    - expect: The search box is visible and empty
  2. Type 'Shubham' in the search box
    - expect: The table filters and shows only records where the Contact Person Name contains 'Shubham' (e.g., 'Shubham Check', 'Shubham 2')
    - expect: Records not matching 'Shubham' in the Contact Person Name are hidden

#### 9.2. TC-SRCH-02: Search with a term that matches no records shows empty table

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page
    - expect: The table shows records
  2. Type 'ZZZNORECORDMATCH' in the search box
    - expect: The table shows no records
    - expect: An empty state or empty table body is displayed

#### 9.3. TC-SRCH-03: Clearing the search box restores all records

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and type 'Shubham' in the search box to filter records
    - expect: Records are filtered
  2. Clear the search box by deleting all typed text
    - expect: The table restores all records and shows the default list

#### 9.4. TC-SRCH-04: Search is case-insensitive

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and type 'shubham' (all lowercase) in the search box
    - expect: The table shows records matching 'Shubham' regardless of case, such as 'Shubham Check' and 'Shubham 2'

### 10. Pagination Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Default page size is 25 rows

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and observe the Show rows dropdown and the table
    - expect: The Show rows dropdown shows '25' as the selected value
    - expect: The table displays up to 25 rows of data

#### 10.2. TC-PAG-02: Changing Show rows dropdown to 10 updates the table

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and change the Show rows dropdown from 25 to 10
    - expect: The table now shows only 10 rows per page
    - expect: The pagination updates to reflect more pages

#### 10.3. TC-PAG-03: Changing Show rows dropdown to 50 updates the table

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and change the Show rows dropdown from 25 to 50
    - expect: The table shows up to 50 rows per page
    - expect: The pagination updates to reflect fewer pages

#### 10.4. TC-PAG-04: Navigating to the next page shows the next set of records

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and note the first record visible on page 1
    - expect: Page 1 is active and shows the first 25 records
  2. Click the 'Next page' button or click on 'Page 2'
    - expect: Page 2 becomes active
    - expect: The table shows a different set of records (row numbers 26 onward)
    - expect: The 'Previous page' button becomes enabled

#### 10.5. TC-PAG-05: Previous page button is disabled on page 1

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page (starts on page 1)
    - expect: The 'Previous page' button is in a disabled state on page 1

#### 10.6. TC-PAG-06: Changing page size resets to page 1

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page, go to page 2, then change the Show rows dropdown to 50
    - expect: The table resets to page 1 with 50 rows per page

### 11. Duplicate Prevention Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-DUP-01: Submitting a duplicate combination (same name, firm, and site) shows an error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and identify an existing contact person record in the table (e.g., 'O1' with Firm 1 and Duplicate S1)
    - expect: Existing record 'O1' with Firm 'Firm 1' and Site 'Duplicate S1' is visible in the table
  2. Fill in the add form with the exact same values: Contact Person Name = 'O1', Firm Name = 'Firm 1 (919090909089)', Site Name = 'Duplicate S1', Contact No. = '9090909089', then click Submit
    - expect: An error toast or validation message appears indicating a duplicate record exists
    - expect: No new duplicate record is added to the table

#### 11.2. TC-DUP-02: Submitting a duplicate combination matching an existing Inactive record shows an error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Change the Status filter to 'Inactive' and note the Contact Person Name, Firm Name, and Site Name of any existing Inactive record.
    - expect: An existing Inactive record is identified with its exact name, firm, and site values
  2. Change the Status filter back to 'Active'. Fill in the add form with the same Contact Person Name, Firm Name, and Site Name as the Inactive record, enter any valid Contact No., then click Submit.
    - expect: An error toast appears indicating a duplicate record exists (the system prevents reusing an inactive record's combination)
    - expect: No new record is added to the table

#### 11.3. TC-DUP-03: Update a record to match an existing Active combination shows an error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Note the Contact Person Name, Firm Name, and Site Name of an existing Active record (Record A, e.g., 'O1' / Firm 1 / Duplicate S1).
    - expect: Record A is visible in the table
  2. Click the Edit icon on a different Active record (Record B).
    - expect: The Update Contact Person form is pre-filled with Record B's values
  3. Change the Contact Person Name, Firm Name, and Site Name to exactly match Record A's values, then click Update.
    - expect: An error toast appears indicating a duplicate record exists
    - expect: The update is not persisted; Record B retains its original values
    - expect: The form remains in Update mode

#### 11.4. TC-DUP-04: Update a record to match an existing Inactive combination shows an error

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Change the Status filter to 'Inactive' and note the Contact Person Name, Firm Name, and Site Name of an Inactive record.
    - expect: An existing Inactive record's combination is identified
  2. Change the Status filter back to 'Active'. Click the Edit icon on any Active record.
    - expect: The Update Contact Person form loads with the Active record's values
  3. Change the Contact Person Name, Firm Name, and Site Name to exactly match the Inactive record's values, then click Update.
    - expect: An error toast appears indicating a duplicate record exists (inactive combination is still protected)
    - expect: The update is not persisted; the Active record retains its original values
    - expect: The form remains in Update mode

#### 11.5. TC-DUP-05: Case-sensitivity check — same name in different case with same firm and site

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page. Note an existing Active record's Contact Person Name (e.g., 'O1'), Firm Name, and Site Name.
    - expect: An existing record is identified
  2. Fill in the add form with the same name in a different case (e.g., 'o1' all lowercase), the same Firm Name, and the same Site Name. Enter a valid Contact No., then click Submit.
    - expect: Either an error toast appears (system is case-insensitive for duplicate prevention), OR a new record is created (system is case-sensitive). Document the actual observed behaviour.

#### 11.7. TC-DUP-07: Same contact person name with different firm is allowed

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the Contact Person Master page and note that 'Srushti' exists with firm 'Cloud Firm' and site 'X1'
    - expect: The existing record is visible
  2. Fill in the add form: Contact Person Name = 'Srushti', Firm Name = 'Pulse (919876543210)' (a different firm), Site Name = 'Site Galaxy', Contact No. = '9876543210', then click Submit
    - expect: The form submits successfully (same name but different firm+site combination is unique)
    - expect: The new record 'Srushti' with Firm 'Pulse' and Site 'Site Galaxy' appears in the table

### 12. Navigation Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Contact Person link in Firm Masters sidebar navigates to the page

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate to the ElevatorPlus app and click on 'Firm Masters' in the sidebar to expand its submenu
    - expect: The Firm Masters submenu expands showing Firm, Site, and Contact Person links
  2. Click on the 'Contact Person' link in the Firm Masters submenu
    - expect: The browser navigates to /master/contact-person-master
    - expect: The page heading shows 'Contact Person Master'
    - expect: The add form and data table are displayed

#### 12.2. TC-NAV-02: Direct URL navigation loads the page correctly

**File:** `tests/firm-master/contact-person-master.spec.ts`

**Steps:**
  1. Navigate directly to https://stage.elevatorplus.net/master/contact-person-master
    - expect: The page loads successfully without redirect
    - expect: The page top-bar heading shows 'Contact Person Master'
    - expect: The 'Add Contact Person' form and data table are visible
