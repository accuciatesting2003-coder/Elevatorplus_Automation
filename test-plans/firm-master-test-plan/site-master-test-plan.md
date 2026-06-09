# Site Master - Test Plan

## Application Overview

The Site Master page is part of the ElevatorPlus Firm Masters section, accessible at https://stage.elevatorplus.net/master/site-master. It allows admin users to manage site records associated with firms. The page consists of two main sections: (1) an "Add Site" form at the top, and (2) a data table listing all site records below.

The Add Site form contains the following fields: "Site Name *" (mandatory text input, placeholder "Enter your site name"), "Firm Name *" (mandatory searchable dropdown, placeholder "Select firm"), "Site Address *" (mandatory text input, placeholder "Enter your site address"), "State" (optional text input, placeholder "Enter your state"), "City Name *" (mandatory searchable dropdown, placeholder "Select city"), "Tax ID" (optional text input, placeholder "Enter your Tax ID/GSTIN"), and a "Select Site Location" button that opens a Google Maps modal. The form includes two action buttons: "Clear" and "Submit".

The Google Maps modal opens as a dialog with heading "Select Site Location". It contains a map region, a "Search for a place" textbox, a draggable pin, a note instructing users to drag the pin to the desired location, and a "Confirm" button to confirm the selection. The modal has a Close (x) button.

When the Edit icon is clicked on a table row, the form switches to "Update Site" mode with all fields pre-filled. An additional "Status *" dropdown (options: Select Status, Active, Inactive) appears in the form, and the submit button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), and a "Search Site Name" text input (search by site name initially, toggles to Firm Name after interaction).

Table columns: Sr. No., Actions (Edit icon only, no Delete), Site Name, Firm Name, Site Address, State, City, Tax ID, Site Location (Yes/No badge), Status (Active/Inactive badge).

Pagination: numbered page buttons, Previous/Next page buttons. With default 25 rows and 31+ pages of data visible in the staging environment.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Site Master page loads successfully

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/site-master. Dismiss any 'Maybe Later' popup if it appears.
    - expect: The page URL should be https://stage.elevatorplus.net/master/site-master
    - expect: The navigation bar heading should display 'Site Master'
    - expect: The form card heading should display 'Add Site'
    - expect: The 'Site Name *' text input should be present and empty
    - expect: The 'Firm Name *' dropdown should be present and empty
    - expect: The 'Site Address *' text input should be present and empty
    - expect: The 'State' text input should be present and empty
    - expect: The 'City Name *' dropdown should be present and empty
    - expect: The 'Tax ID' text input should be present and empty
    - expect: The 'Select Site Location' button should be visible
    - expect: The 'Clear' and 'Submit' buttons should both be visible in the form
    - expect: The data table should load and display site records with 'Active' status by default

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master and inspect the form section.
    - expect: The form section heading should read 'Add Site'
    - expect: The 'Site Name *' text input field should be visible and focusable
    - expect: The 'Firm Name *' searchable dropdown should be visible
    - expect: The 'Site Address *' text input field should be visible and focusable
    - expect: The 'State' text input should be visible
    - expect: The 'City Name *' searchable dropdown should be visible
    - expect: The 'Tax ID' text input should be visible
    - expect: The 'Select Site Location' button with a pin icon should be visible
    - expect: The 'Clear' button and 'Submit' button should be present
  2. Inspect the data table toolbar section.
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: A 'Search' text input for searching by Site Name should be present
  3. Inspect the data table header row.
    - expect: Table header columns should include: Sr. No., Actions, Site Name, Firm Name, Site Address, State, City, Tax ID, Site Location, Status
    - expect: All columns should be visible
  4. Inspect a sample table data row.
    - expect: Sr. No. cell should contain a sequential number
    - expect: Actions cell should contain an Edit icon (no Delete icon)
    - expect: Site Name cell should contain the site name text
    - expect: Firm Name cell should contain the associated firm name
    - expect: Site Location cell should display either 'Yes' or 'No'
    - expect: Status cell should display a badge reading 'Active' or 'Inactive'

### 2. 2. Add Site - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Add site with mandatory fields only

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible and empty
  2. Fill in the 'Site Name *' text input with a unique value (e.g. 'Test Site <timestamp>').
    - expect: The input accepts the text
  3. Click the 'Firm Name *' dropdown and type a firm name to search (e.g. 'Firm 1'), then select the first matching option from the list.
    - expect: The dropdown shows matching options
    - expect: The selected firm name appears in the dropdown
  4. Fill in the 'Site Address *' text input with a valid address (e.g. 'Wakad, Pune, Maharashtra, India').
    - expect: The input accepts the text
  5. Click the 'City Name *' dropdown and type a city name (e.g. 'Pune'), then select the first matching option.
    - expect: The dropdown shows matching options
    - expect: The selected city appears in the dropdown
  6. Leave the 'State' and 'Tax ID' fields empty. Click the 'Submit' button.
    - expect: A success toast/alert appears with a message matching /Site has been created successfully/i
    - expect: The form resets to empty 'Add Site' state
    - expect: The newly added site appears in the data table (may require changing status filter to 'All' and searching by site name)

#### 2.2. TC-ADD-02: Add site with all fields including optional fields

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible and empty
  2. Fill in the 'Site Name *' text input with a unique value (e.g. 'Full Site <timestamp>').
    - expect: The input accepts the text
  3. Select a firm from the 'Firm Name *' dropdown (e.g. type 'Stage' and select the first result).
    - expect: Firm name is selected and displayed in the dropdown
  4. Fill in the 'Site Address *' text input with 'Pune, Maharashtra, India'.
    - expect: The input accepts the text
  5. Fill in the optional 'State' text input with 'Maharashtra'.
    - expect: The input accepts the text
  6. Select a city from the 'City Name *' dropdown (e.g. type 'Pune' and select the first result).
    - expect: City name is selected and displayed in the dropdown
  7. Fill in the optional 'Tax ID' text input with 'GSTIN123456'.
    - expect: The input accepts the text
  8. Click the 'Submit' button.
    - expect: A success toast/alert appears with a message matching /Site has been created successfully/i
    - expect: The form resets to empty 'Add Site' state
    - expect: The newly added site appears in the data table with State 'Maharashtra' and Tax ID 'GSTIN123456' when searched

#### 2.3. TC-ADD-03: Add site with map location selected via Google Maps modal

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible and empty
  2. Fill in the 'Site Name *' text input with 'Map Site <timestamp>'.
    - expect: The input accepts the text
  3. Select a firm from the 'Firm Name *' dropdown.
    - expect: Firm name is selected
  4. Fill in the 'Site Address *' text input with 'Wakad, Pune'.
    - expect: The input accepts the text
  5. Select a city from the 'City Name *' dropdown.
    - expect: City name is selected
  6. Click the 'Select Site Location' button.
    - expect: A modal dialog appears with the heading 'Select Site Location'
    - expect: A 'Search for a place' textbox is visible inside the modal
    - expect: A map region is displayed
    - expect: A 'Confirm' button is visible
    - expect: A Close (x) button is visible
  7. In the modal, type 'Wakad, Pune' slowly (using pressSequentially with delay: 100) in the 'Search for a place' textbox. Wait 2 seconds for autocomplete suggestions to appear.
    - expect: Google Maps autocomplete suggestions appear in a .pac-container dropdown below the search input
  8. Click the first suggestion in the autocomplete list (.pac-container .pac-item first). If no suggestion appears, press ArrowDown then Enter as a fallback.
    - expect: The map updates to show the selected location
    - expect: The pin icon moves to the selected location
  9. Click the 'Confirm' button in the modal.
    - expect: The modal closes
    - expect: The 'Select Site Location' button remains in the form area
  10. Click the 'Submit' button.
    - expect: A success toast/alert appears with a message matching /Site has been created successfully/i
    - expect: The form resets to empty 'Add Site' state
    - expect: The newly added site appears in the data table with 'Yes' in the Site Location column

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with all mandatory fields empty

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Ensure all form fields are empty.
    - expect: The 'Add Site' form is visible with all fields empty
  2. Click the 'Submit' button without filling any fields.
    - expect: Validation error message 'Please enter site name' appears below the 'Site Name *' field
    - expect: Validation error message 'Please select firm name' appears below the 'Firm Name *' dropdown
    - expect: Validation error message 'Please enter site address' appears below the 'Site Address *' field
    - expect: Validation error message 'Please select city name' appears below the 'City Name *' dropdown
    - expect: No success toast is shown
    - expect: The form remains open and unfilled

#### 3.2. TC-VAL-02: Submit with Site Name empty, all other mandatory fields filled

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible
  2. Leave the 'Site Name *' field empty. Select a firm from the 'Firm Name *' dropdown, fill in 'Site Address *', and select a city from 'City Name *'.
    - expect: Firm Name, Site Address, and City Name are filled; Site Name is empty
  3. Click the 'Submit' button.
    - expect: Validation error 'Please enter site name' appears below the Site Name field
    - expect: No success toast appears
    - expect: The form remains open

#### 3.3. TC-VAL-03: Submit with Firm Name not selected

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible
  2. Fill in 'Site Name *', 'Site Address *', and select a 'City Name *'. Leave the 'Firm Name *' dropdown unselected.
    - expect: Site Name, Site Address, and City Name are filled; Firm Name is empty
  3. Click the 'Submit' button.
    - expect: Validation error 'Please select firm name' appears below the Firm Name dropdown
    - expect: No success toast appears
    - expect: The form remains open

#### 3.4. TC-VAL-04: Submit with Site Address empty

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible
  2. Fill in 'Site Name *', select a 'Firm Name *', and select a 'City Name *'. Leave 'Site Address *' empty.
    - expect: Site Name, Firm Name, and City Name are filled; Site Address is empty
  3. Click the 'Submit' button.
    - expect: Validation error 'Please enter site address' appears below the Site Address field
    - expect: No success toast appears
    - expect: The form remains open

#### 3.5. TC-VAL-05: Submit with City Name not selected

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Add Site' form is visible
  2. Fill in 'Site Name *', select a 'Firm Name *', and fill in 'Site Address *'. Leave 'City Name *' unselected.
    - expect: Site Name, Firm Name, and Site Address are filled; City Name is empty
  3. Click the 'Submit' button.
    - expect: Validation error 'Please select city name' appears below the City Name dropdown
    - expect: No success toast appears
    - expect: The form remains open

#### 3.6. TC-VAL-06: Whitespace-only Site Name shows validation error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill 'Site Name *' with whitespace only (e.g. '   '). Select a valid firm, fill 'Site Address *' with a valid address, and select a city. Click 'Submit'.
    - expect: Validation error 'Please enter site name' appears (whitespace is trimmed and treated as empty)
    - expect: No record is saved; the form remains open

#### 3.7. TC-VAL-07: Whitespace-only Site Address shows validation error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill 'Site Name *' with a valid unique name. Select a valid firm. Fill 'Site Address *' with whitespace only (e.g. '   '). Select a city. Click 'Submit'.
    - expect: Validation error 'Please enter site address' appears (whitespace is trimmed and treated as empty)
    - expect: No record is saved; the form remains open

### 4. 4. Optional Fields Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-OPT-01: Submit with State field filled

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill in all mandatory fields (Site Name, Firm Name, Site Address, City Name).
    - expect: All mandatory fields are filled
  2. Fill in the optional 'State' field with 'Maharashtra'. Click 'Submit'.
    - expect: A success toast matching /Site has been created successfully/i appears
    - expect: The form resets
    - expect: The newly added site appears in the table with 'Maharashtra' in the State column

#### 4.2. TC-OPT-02: Submit with Tax ID field filled

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill in all mandatory fields.
    - expect: All mandatory fields are filled
  2. Fill in the optional 'Tax ID' field with 'GST1234567890'. Click 'Submit'.
    - expect: A success toast matching /Site has been created successfully/i appears
    - expect: The form resets
    - expect: The newly added site appears in the table with 'GST1234567890' in the Tax ID column

#### 4.3. TC-OPT-03: Submit with both State and Tax ID empty (only mandatory fields filled)

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill in only the mandatory fields: Site Name, Firm Name, Site Address, City Name.
    - expect: Mandatory fields are filled; State and Tax ID are empty
  2. Click the 'Submit' button.
    - expect: A success toast matching /Site has been created successfully/i appears
    - expect: The newly added site appears in the table with '-' in both the State and Tax ID columns

### 5. 5. Dropdown Field Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-DD-01: Firm Name dropdown opens and shows searchable options

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click on the 'Firm Name *' dropdown.
    - expect: The dropdown opens and shows a list of firm names
    - expect: The options are searchable (typing filters the visible options)
    - expect: Multiple firm options are listed (the staging environment has 800+ firm options)
  2. Type 'Firm 1' in the dropdown search input.
    - expect: The list filters to show only entries matching 'Firm 1'
  3. Select the first matching firm from the list.
    - expect: The selected firm name appears as the value in the Firm Name dropdown

#### 5.2. TC-DD-02: Firm Name dropdown validation on empty selection

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the 'Firm Name *' dropdown then press Escape to close it without selecting any option. Fill in all other mandatory fields.
    - expect: No firm is selected in the Firm Name dropdown
  2. Click the 'Submit' button.
    - expect: Validation error 'Please select firm name' appears below the Firm Name dropdown
    - expect: The form is not submitted

#### 5.3. TC-DD-03: City Name dropdown opens and shows searchable options

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click on the 'City Name *' dropdown.
    - expect: The dropdown opens and shows a list of city names
    - expect: The options are searchable (typing filters the visible options)
  2. Type 'Pune' in the dropdown search input.
    - expect: The list filters to show entries matching 'Pune'
  3. Select 'Pune' from the filtered list.
    - expect: 'Pune' appears as the selected value in the City Name dropdown

#### 5.4. TC-DD-04: City Name dropdown validation on empty selection

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill in all mandatory fields except City Name. Leave the City Name dropdown unselected.
    - expect: City Name is empty; all other mandatory fields are filled
  2. Click the 'Submit' button.
    - expect: Validation error 'Please select city name' appears below the City Name dropdown
    - expect: The form is not submitted

### 6. 6. Google Maps Modal Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-MAP-01: Select Site Location button opens the Google Maps modal

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the 'Select Site Location' button.
    - expect: A modal dialog appears with the heading 'Select Site Location'
    - expect: The modal contains a 'Search for a place' textbox
    - expect: The modal contains a Google Map region
    - expect: A note '📍 Select a location' is displayed
    - expect: A note reads 'You can drag the ping icon on the location you want to set and update'
    - expect: A 'Confirm' button is visible at the bottom
    - expect: A Close (x) button is visible at the top-right of the modal

#### 6.2. TC-MAP-02: Search for a location in the modal and select from autocomplete

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Click the 'Select Site Location' button to open the map modal.
    - expect: The map modal is open with a 'Search for a place' textbox visible
  2. Type 'Pune, Maharashtra' slowly (using pressSequentially with delay: 100ms) in the 'Search for a place' textbox. Wait 2 seconds.
    - expect: Google Maps autocomplete suggestions appear in a .pac-container dropdown below the input
  3. Click the first autocomplete suggestion in the .pac-container .pac-item list.
    - expect: The selected suggestion is applied
    - expect: The map pin moves to the selected location
  4. Click the 'Confirm' button.
    - expect: The modal closes
    - expect: Control returns to the main form
    - expect: The 'Select Site Location' button is still visible in the form

#### 6.3. TC-MAP-03: Close the map modal without selecting a location

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Click the 'Select Site Location' button to open the map modal.
    - expect: The map modal opens
  2. Click the Close (x) button in the modal without selecting any location or clicking Confirm.
    - expect: The modal closes
    - expect: The form fields remain in their current state (no location is set from this interaction)

#### 6.4. TC-MAP-04: Submit site with location confirmed from map (Site Location column shows 'Yes')

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Fill all mandatory form fields (Site Name, Firm Name, Site Address, City Name) with valid unique values.
    - expect: All mandatory fields are filled
  2. Click 'Select Site Location', type a location in the search box, select an autocomplete suggestion, then click 'Confirm'.
    - expect: The modal closes after confirming the location
  3. Click 'Submit'.
    - expect: Success toast appears matching /Site has been created successfully/i
    - expect: The site appears in the data table with 'Yes' displayed in the Site Location column

#### 6.5. TC-MAP-05: Submit site without selecting map location (Site Location column shows 'No')

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Fill all mandatory form fields with valid unique values. Do not click 'Select Site Location'.
    - expect: All mandatory fields are filled; no map location has been selected
  2. Click 'Submit'.
    - expect: Success toast appears matching /Site has been created successfully/i
    - expect: The site appears in the data table with 'No' displayed in the Site Location column

### 7. 7. Clear Button Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-CLR-01: Clear button resets all form fields in Add Site mode

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill in the 'Site Name *' field with 'Clear Test Site', select a firm from 'Firm Name *', fill 'Site Address *' with 'Test Address', and select a city from 'City Name *'.
    - expect: All fields are filled with test data
  2. Click the 'Clear' button.
    - expect: The 'Site Name *' field is cleared and shows empty
    - expect: The 'Firm Name *' dropdown is cleared and shows placeholder 'Select firm'
    - expect: The 'Site Address *' field is cleared
    - expect: The 'State' field is cleared
    - expect: The 'City Name *' dropdown is cleared and shows placeholder 'Select city'
    - expect: The 'Tax ID' field is cleared
    - expect: The form heading still shows 'Add Site'
    - expect: No data is submitted to the server

#### 7.2. TC-CLR-02: Clear button in Update Site mode resets the form back to Add Site mode

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the Edit icon on the first row in the data table.
    - expect: The form heading changes to 'Update Site'
    - expect: The form fields are pre-filled with the selected site's data
    - expect: A 'Status *' dropdown appears in the form
    - expect: The submit button changes to 'Update'
  2. Click the 'Clear' button.
    - expect: The form heading changes back to 'Add Site'
    - expect: All form fields are cleared and empty
    - expect: The 'Status *' dropdown is no longer visible
    - expect: The button changes back to 'Submit'

### 8. 8. Edit / Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-EDIT-01: Edit icon populates the Update Site form with correct data

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Identify the first row in the data table and note its Site Name, Firm Name, Site Address, State, City, and Tax ID values. Click the Edit icon (img with name 'Edit') on that row.
    - expect: The form heading changes from 'Add Site' to 'Update Site'
    - expect: The 'Site Name *' field is pre-filled with the row's Site Name
    - expect: The 'Firm Name *' dropdown shows the row's Firm Name
    - expect: The 'Site Address *' field is pre-filled with the row's Site Address
    - expect: The 'State' field is pre-filled with the row's State value (or empty if '-')
    - expect: The 'City Name *' dropdown shows the row's City value
    - expect: The 'Tax ID' field shows the row's Tax ID (or empty if '-')
    - expect: An additional 'Status *' combobox appears with options: Select Status, Active, Inactive
    - expect: The submit button label changes to 'Update'

#### 8.2. TC-EDIT-02: Update a site's Site Name and confirm changes in the table

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the Edit icon on any row. Note the original Site Name displayed in the form.
    - expect: The 'Update Site' form is displayed with the site's current data
  2. Clear the 'Site Name *' field and type a new unique site name (e.g. 'Updated Site <timestamp>').
    - expect: The field shows the new site name
  3. Click the 'Update' button.
    - expect: A success toast appears (e.g. matching /updated successfully/i or /Site has been updated/i)
    - expect: The form resets to 'Add Site' mode
    - expect: The data table row now shows the updated site name

#### 8.3. TC-EDIT-03: Update site status from Active to Inactive

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the Edit icon on a row that currently shows 'Active' status.
    - expect: The 'Update Site' form opens with the 'Status *' dropdown set to 'Active'
  2. Change the 'Status *' dropdown from 'Active' to 'Inactive'. Click the 'Update' button.
    - expect: A success toast appears
    - expect: The form resets to 'Add Site' mode
    - expect: The row's status in the table changes to 'Inactive' (row may disappear from the default Active filter view)

#### 8.4. TC-EDIT-04: Update site with map location and verify Site Location column changes to 'Yes'

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Find a row where Site Location shows 'No'. Click its Edit icon.
    - expect: The 'Update Site' form is populated with that site's data
  2. Click 'Select Site Location', search for 'Pune, Maharashtra', select the first autocomplete suggestion, then click 'Confirm'.
    - expect: The map modal closes after confirming the location
  3. Click the 'Update' button.
    - expect: A success toast appears
    - expect: The row's Site Location column now shows 'Yes'

#### 8.5. TC-EDIT-05: Update validation — Clear mandatory Site Name field and attempt to Update

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click Edit on any row.
    - expect: The 'Update Site' form is populated
  2. Clear the 'Site Name *' field and click the 'Update' button.
    - expect: Validation error 'Please enter site name' appears below the Site Name field
    - expect: No update toast appears
    - expect: The form remains in 'Update Site' mode

### 9. 9. Status Filter Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SF-01: Default status filter shows only Active records

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The Status dropdown in the toolbar shows 'Active' as the selected option
    - expect: All rows visible in the data table have 'Active' in their Status column

#### 9.2. TC-SF-02: Status filter set to 'Inactive' shows only Inactive records

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Locate the Status combobox (using: page.locator('select').filter({ has: page.locator('option[value="false"]') }).first()). Select 'Inactive'.
    - expect: The table refreshes to show only records with 'Inactive' status
    - expect: All visible rows have 'Inactive' in the Status column
    - expect: If no inactive records exist, the table shows an empty state or a 'No data' message

#### 9.3. TC-SF-03: Status filter set to 'All' shows both Active and Inactive records

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the Status dropdown to 'All'.
    - expect: The table refreshes to show all records regardless of status
    - expect: Both 'Active' and 'Inactive' status badges are visible in the Status column
    - expect: The total row count is greater than when only 'Active' filter is applied

### 10. 10. Search Functionality Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRCH-01: Search by site name returns matching records

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the Status filter to 'All'. Locate the search text input and type the name of a site that exists in the table (e.g. 'ganesh site').
    - expect: The table filters to show only rows whose Site Name contains the search term
    - expect: Each visible row contains 'ganesh site' in the Site Name column
  2. Clear the search input.
    - expect: The table refreshes to show all records (respecting the current Status filter)
    - expect: All records are displayed again

#### 10.2. TC-SRCH-02: Search with a term that matches no records

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. In the search text input, type a string unlikely to match any record (e.g. 'xyznonexistent999').
    - expect: The data table shows zero rows or a 'No data found' / empty state message
    - expect: No site records are displayed

#### 10.3. TC-SRCH-03: Search is case-insensitive

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change status filter to 'All'. Type an all-uppercase version of a known site name (e.g. 'GANESH SITE') in the search input.
    - expect: The table returns rows matching 'ganesh site' regardless of case
    - expect: Results are the same as searching with the exact case 'ganesh site'

### 11. 11. Pagination and Rows Per Page Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-PAG-01: Default rows per page is 25 and pagination controls are present

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master.
    - expect: The 'Show:' dropdown displays '25' as the selected value
    - expect: The data table shows at most 25 rows
    - expect: Pagination buttons (Previous page, numbered pages, Next page) are visible
    - expect: The 'Previous page' button is disabled (since page 1 is the current page)
    - expect: Page 1 is shown as the current page

#### 11.2. TC-PAG-02: Change rows per page to 10

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the 'Show:' dropdown to '10'.
    - expect: The data table updates to show at most 10 rows per page
    - expect: The pagination updates to reflect the new total number of pages

#### 11.3. TC-PAG-03: Change rows per page to 50

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the 'Show:' dropdown to '50'.
    - expect: The data table updates to show at most 50 rows per page
    - expect: The pagination updates to reflect fewer total pages

#### 11.4. TC-PAG-04: Navigate to the next page using the Next page button

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Note the site names visible on page 1. Click the 'Next page' button.
    - expect: The table shows the next set of records (page 2)
    - expect: Page 2 button is now marked as the current page
    - expect: The 'Previous page' button is now enabled
    - expect: The site names shown differ from those on page 1
  2. Click the 'Previous page' button.
    - expect: The table returns to showing page 1 records
    - expect: Page 1 is marked as the current page

#### 11.5. TC-PAG-05: Navigate to a specific page number using the page button

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click on the 'Page 2' button in the pagination controls.
    - expect: The table updates to display page 2 records
    - expect: Page 2 is marked as the current page

### 12. 12. Navigation and Access Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Navigate to Site Master via Firm Masters sidebar menu

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Log in and navigate to the application home page. In the left sidebar, click 'Firm Masters' to expand the submenu.
    - expect: The 'Firm Masters' submenu expands
    - expect: The submenu items 'Firm', 'Site', and 'Contact Person' are visible
  2. Click the 'Site' link in the Firm Masters submenu.
    - expect: The browser navigates to /master/site-master
    - expect: The page heading 'Site Master' appears in the navigation bar
    - expect: The 'Add Site' form is visible

#### 12.2. TC-NAV-02: Direct URL navigation to /master/site-master when authenticated

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. While logged in, navigate directly to https://stage.elevatorplus.net/master/site-master in the browser.
    - expect: The Site Master page loads successfully
    - expect: The URL remains https://stage.elevatorplus.net/master/site-master
    - expect: The 'Add Site' form and data table are both visible

#### 12.3. TC-NAV-03: Unauthenticated user is redirected when accessing Site Master

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Without logging in (clear session/cookies), navigate directly to https://stage.elevatorplus.net/master/site-master.
    - expect: The user is redirected to the login page
    - expect: The Site Master page content is not displayed
    - expect: The login form is shown

### 13. 13. Duplicate / Data Integrity Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-DUP-01: Attempt to add a site with a name + firm combination that already exists (Active record)

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Note an existing Active site's Site Name and Firm Name from the table.
    - expect: An existing active site name and its associated firm name are identified
  2. Fill the 'Site Name *' field with the existing site name. Select the SAME firm from the 'Firm Name *' dropdown. Fill in a site address, select any city. Click 'Submit'.
    - expect: An error toast/alert appears with a message matching /already exists|something went wrong/i
    - expect: No new record is added to the table
    - expect: The form remains open

#### 13.2. TC-DUP-02: Add existing Inactive site name + same firm combination shows error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the Status filter to 'Inactive'. Note an existing Inactive site's Site Name and its Firm Name from the table.
    - expect: An existing inactive site name and its associated firm name are identified
  2. Change the Status filter back to 'Active'. Fill 'Site Name *' with the inactive site's name. Select the SAME firm from 'Firm Name *'. Fill in 'Site Address *' and select a city. Click 'Submit'.
    - expect: An error toast/alert appears with a message matching /already exists|something went wrong/i
    - expect: No new record is added to the table

#### 13.3. TC-DUP-03: Case-sensitive duplicate check — Site Name in different case with same firm shows error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Note an existing Active site's Site Name (e.g. 'ganesh site') and its Firm Name.
    - expect: An existing site name is identified
  2. Fill 'Site Name *' with the same name in UPPERCASE (e.g. 'GANESH SITE'). Select the SAME firm from 'Firm Name *'. Fill in 'Site Address *' and select a city. Click 'Submit'.
    - expect: Either an error toast matching /already exists|something went wrong/i appears (case-insensitive duplicate prevention), OR a new record is created (case-sensitive system). Document the actual behaviour.

#### 13.4. TC-DUP-04: Site name + firm name combination is unique — same site name with different firm is ALLOWED (Add case)

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Note an existing Active site's Site Name (e.g. 'Test Site A') and its Firm Name (e.g. 'Firm 1').
    - expect: An existing site name and its firm are identified
  2. Fill 'Site Name *' with the SAME site name ('Test Site A'). Select a DIFFERENT firm from 'Firm Name *' (e.g. 'Firm 2'). Fill in 'Site Address *' and select a city. Click 'Submit'.
    - expect: A success toast matching /Site has been created successfully/i appears
    - expect: The form resets to 'Add Site' mode
    - expect: A new record with 'Test Site A' under 'Firm 2' is visible in the table

#### 13.5. TC-DUP-05: Whitespace-only Site Name shows validation error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill 'Site Name *' with spaces only (e.g. three space characters). Select a valid firm, fill 'Site Address *', and select a city. Click 'Submit'.
    - expect: Validation error 'Please enter site name' appears (whitespace trimmed and treated as empty)
    - expect: No record is saved to the table

#### 13.6. TC-DUP-06: Whitespace-only Site Address shows validation error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Fill 'Site Name *' with a valid unique name. Select a valid firm. Fill 'Site Address *' with spaces only. Select a city. Click 'Submit'.
    - expect: Validation error 'Please enter site address' appears (whitespace trimmed and treated as empty)
    - expect: No record is saved to the table

#### 13.7. TC-DUP-07: Update record — Site name + firm name matching an existing ACTIVE combination shows error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Identify two different Active records: Record A (site name 'Site A', firm 'Firm 1') and Record B (site name 'Site B', firm 'Firm 1').
    - expect: Two distinct active records are identified in the table
  2. Click the Edit icon on Record B to open the Update Site form.
    - expect: The 'Update Site' form is pre-filled with Record B's data
  3. Change the 'Site Name *' to 'Site A' (same as Record A) while keeping Firm Name as 'Firm 1'. Click 'Update'.
    - expect: An error toast/alert appears matching /already exists|something went wrong/i
    - expect: No update is persisted; the record keeps its original site name
    - expect: The form remains in 'Update Site' mode

#### 13.8. TC-DUP-08: Update record — Site name + firm name matching an existing INACTIVE combination shows error

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Change the Status filter to 'Inactive'. Note an Inactive record's Site Name (e.g. 'Inactive Site X') and its Firm Name (e.g. 'Firm 1').
    - expect: An existing inactive site + firm combination is identified
  2. Change the Status filter back to 'Active'. Click the Edit icon on any Active record.
    - expect: The 'Update Site' form opens with the active record's data
  3. Change 'Site Name *' to 'Inactive Site X' and select the SAME firm 'Firm 1'. Click 'Update'.
    - expect: An error toast/alert appears matching /already exists|something went wrong/i
    - expect: No update is persisted

#### 13.9. TC-DUP-09: Update record — Same site name with a DIFFERENT firm is ALLOWED

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Note an existing Active record's Site Name (e.g. 'Common Site') associated with 'Firm 1'.
    - expect: An existing site name and its firm are identified
  2. Click the Edit icon on a DIFFERENT Active record (currently having a different site name, e.g. 'Site Z', associated with 'Firm 2').
    - expect: The 'Update Site' form opens pre-filled with 'Site Z' / 'Firm 2'
  3. Change 'Site Name *' to 'Common Site' while keeping Firm Name as 'Firm 2' (different from 'Firm 1'). Click 'Update'.
    - expect: A success toast matching /updated successfully/i appears
    - expect: The form resets to 'Add Site' mode
    - expect: The updated record shows 'Common Site' under 'Firm 2' in the table

#### 13.10. TC-DUP-10: Update record — Clear mandatory fields (Firm Name, Site Address, City Name) shows validation errors

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the Edit icon on any Active record.
    - expect: The 'Update Site' form is pre-filled with the record's data
  2. Clear the 'Site Name *' field. Click 'Update'.
    - expect: Validation error 'Please enter site name' appears
    - expect: The form remains in 'Update Site' mode
  3. Restore 'Site Name *'. Clear 'Site Address *'. Click 'Update'.
    - expect: Validation error 'Please enter site address' appears
    - expect: The form remains in 'Update Site' mode
  4. Restore 'Site Address *'. Clear the 'Firm Name *' dropdown (if possible via the UI). Click 'Update'.
    - expect: Validation error 'Please select firm name' appears (if the dropdown can be cleared)
    - expect: The form remains in 'Update Site' mode
  5. Click 'Clear' to exit Update mode.
    - expect: The form resets to 'Add Site' mode

### 14. 14. Table Sorting Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-SORT-01: Click Site Name column header to sort

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the 'Site Name' column header button.
    - expect: The table rows reorder — either ascending or descending alphabetical order by Site Name
    - expect: The Site Name column header shows a sort indicator icon
  2. Click the 'Site Name' column header again.
    - expect: The sort order reverses (ascending becomes descending or vice versa)
    - expect: The sort indicator icon updates to reflect the new sort direction

#### 14.2. TC-SORT-02: Click Firm Name column header to sort

**File:** `tests/firm-master/site-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/site-master. Click the 'Firm Name' column header button.
    - expect: The table rows reorder by Firm Name alphabetically
    - expect: The Firm Name column header shows a sort indicator
