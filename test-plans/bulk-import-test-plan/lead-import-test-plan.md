# Lead Import Test Plan

## Application Overview

The Lead Import page is part of the ElevatorPlus Bulk Import section, accessible at https://stage.elevatorplus.net/master/lead-import. It allows admin users to manually add individual lead records and view/edit all imported leads. The page has two main sections: (1) an "Add lead Details" form at the top, and (2) a data table listing all lead records below.

### Add Form

The form heading reads "Add lead Details". Next to the heading are two buttons: "Import Logs" (skip — import-related) and an info icon button that opens a side panel. The side panel has heading "Lead Import" with Title, Video, and Note sections (currently empty on staging) and a Close (x) link.

The Add form contains the following fields in order:

1. **Lead Name \*** — mandatory text input — placeholder " " (floating label) — helper text: "Enter the lead name"
2. **Mobile Number\*** — mandatory phone input with country code selector (+91 India default) — helper text: "Enter your contact number"
3. **Alternate Mobile Number** — optional phone input with country code selector (+91 India default) — helper text: "Enter your contact number"
4. **Firm Name** — optional text input — helper text: "Enter the firm name"
5. **Site Name** — optional text input — helper text: "Enter the site name"
6. **Firm Address** — optional text input — helper text: "Enter the firm address"
7. **Email-id** — optional text input — helper text: "Enter email address"
8. **Assign To** — optional searchable dropdown — helper text: "Select assign to"
9. **Lead Source** — optional searchable dropdown — helper text: "Select lead source"
10. **Site Address** — optional text input — helper text: "Enter site address"
11. **Select Site Location** — button that opens a Google Maps modal dialog
12. **Note** — optional text input — helper text: "Enter notes"

Form action buttons: **Clear** and **Submit**.

### Edit (Update) Mode

When the Edit icon is clicked on a table row the form heading changes to "Update lead Details". All fields are pre-filled with the record's stored values. Assign To and Lead Source show their selected values as removable chips inside the dropdown. The Submit button is replaced by an **Update** button. The Clear button resets the form back to Add mode. There is no Status dropdown in the edit form — lead pipeline status (Pending, Won, etc.) is managed through the sales workflow, not this form.

### Google Maps Modal

The "Select Site Location" button opens a modal dialog with heading "Select Site Location". The modal contains a Google Maps region, a "Search for a place" textbox, a draggable pin, an instruction note to drag the pin, a "Confirm" button to save the selection, and a Close (x) button. On confirming, the selected location text is stored and displayed in the Site Location column of the table.

### Data Table

The table toolbar contains:
- **Show:** rows-per-page dropdown (options: 10, 25, 50, 100; default: 25)
- **Status:** filter dropdown (options: All, Pending, Cold, Warm, Hot, Lost, Enquiry Generated; default: **All**) — these are lead pipeline statuses, not Active/Inactive
- **Import Excel** button (skip — import-related)
- **Search** text input (animated placeholder rotates through "Lead Name", "Firm Name", "Mobile Number")

Table columns (17 total):

| # | Column | Sortable | Notes |
|---|--------|----------|-------|
| 1 | Sr. No. | No | Sequential row number |
| 2 | Action | No | Edit icon only — no Delete |
| 3 | Lead Name | Yes | |
| 4 | Mobile Number | Yes | Stored with country code prefix e.g. +918777777777 |
| 5 | Alternate Mobile Number | Yes | Empty if not provided |
| 6 | Firm Name | Yes | |
| 7 | Site Name | Yes | |
| 8 | Firm Address | Yes | |
| 9 | Email-id | Yes | |
| 10 | Assign To | Yes | Name of assignee |
| 11 | Lead Source | Yes | |
| 12 | Ask Details | Yes | "Yes" / "No" h5 badge — reflects Ask Details flag of the selected Lead Source |
| 13 | Note | Yes | |
| 14 | Site Address | No | No sort icon |
| 15 | Site Location | Yes | Full address text from Google Maps, or empty |
| 16 | Additional Info-new | Yes | |
| 17 | Status | Yes | "Pending" / "Won" / "Enquiry Generated" etc. h5 badge |

Pagination: numbered page buttons, Previous/Next page navigation. At 25 rows/page the staging data spans ~13 pages (~325 records).

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Lead Import page loads successfully

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/lead-import
   - expect: The page URL is https://stage.elevatorplus.net/master/lead-import
   - expect: The navbar heading reads 'Lead Import'
   - expect: The form card heading reads 'Add lead Details'
   - expect: The 'Lead Name *' input is present and empty
   - expect: The 'Mobile Number*' phone input is present with '+91' prefix
   - expect: The 'Alternate Mobile Number' phone input is present with '+91' prefix
   - expect: The 'Firm Name', 'Site Name', 'Firm Address', 'Email-id', 'Site Address', 'Note' text inputs are present and empty
   - expect: The 'Assign To' and 'Lead Source' searchable dropdowns are present and empty
   - expect: The 'Select Site Location' button is visible
   - expect: The 'Clear' and 'Submit' buttons are both visible
   - expect: The data table loads with the Status filter defaulting to 'All'

#### 1.2. TC-SM-02: Verify all form fields, table columns, and toolbar layout

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to https://stage.elevatorplus.net/master/lead-import and inspect the form section
   - expect: The form heading reads 'Add lead Details'
   - expect: An 'Import Logs' button is visible next to the heading
   - expect: An info icon button is visible next to the heading
   - expect: All 12 form fields/controls are visible in order: Lead Name, Mobile Number, Alternate Mobile Number, Firm Name, Site Name, Firm Address, Email-id, Assign To, Lead Source, Site Address, Select Site Location, Note
   - expect: 'Lead Name *' has helper text 'Enter the lead name'
   - expect: 'Mobile Number*' has helper text 'Enter your contact number'
   - expect: The 'Clear' and 'Submit' buttons are present
2. Inspect the table toolbar
   - expect: A 'Show:' dropdown with options 10, 25, 50, 100 defaulting to 25 is present
   - expect: A 'Status:' dropdown with options All, Pending, Cold, Warm, Hot, Lost, Enquiry Generated defaulting to 'All' is present
   - expect: An 'Import Excel' button is present
   - expect: A Search text input is present
3. Inspect the table header row
   - expect: All 17 columns are present: Sr. No., Action, Lead Name, Mobile Number, Alternate Mobile Number, Firm Name, Site Name, Firm Address, Email-id, Assign To, Lead Source, Ask Details, Note, Site Address, Site Location, Additional Info-new, Status
   - expect: Columns with sort icons: Lead Name, Mobile Number, Alternate Mobile Number, Firm Name, Site Name, Firm Address, Email-id, Assign To, Lead Source, Ask Details, Note, Site Location, Additional Info-new, Status
   - expect: 'Site Address' column header does NOT have a sort icon
4. Inspect a sample data row
   - expect: Sr. No. cell shows a sequential number
   - expect: Action cell contains only an Edit icon (img alt='Edit') — no Delete icon
   - expect: Mobile Number cell shows the number with country code prefix (e.g. '+918777777777')
   - expect: Ask Details cell shows 'Yes' or 'No' via an h5 badge
   - expect: Status cell shows a pipeline status (e.g. 'Pending', 'Won') via an h5 badge

#### 1.3. TC-SM-03: Info panel opens and closes correctly

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the info icon button next to the 'Add lead Details' heading
   - expect: A side panel opens on the right side of the page
   - expect: The panel heading reads 'Lead Import'
   - expect: The panel contains sections for 'Title:', 'Video:', and 'Note:'
   - expect: A close (x) link/button is present in the panel
2. Click the close link in the info panel
   - expect: The info panel closes
   - expect: The main form and table remain unchanged

---

### 2. Add Lead — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully add a lead with only mandatory fields

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to https://stage.elevatorplus.net/master/lead-import
   - expect: The 'Add lead Details' form is visible with empty fields
2. Type 'Test Lead One' in the 'Lead Name *' field, enter '9876543210' in the Mobile Number field, and click 'Submit'
   - expect: A success toast notification appears confirming creation
   - expect: The 'Lead Name *' input is cleared after submission
   - expect: The 'Mobile Number*' field resets to '+91' prefix only
   - expect: The record 'Test Lead One' appears in the data table with Mobile Number '+919876543210'

#### 2.2. TC-ADD-02: Successfully add a lead with all optional fields filled

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and fill all fields: Lead Name 'Full Lead Test', Mobile Number '9123456780', Alternate Mobile Number '9988776655', Firm Name 'Acme Corp', Site Name 'Acme HQ', Firm Address '123 Main St', Email-id 'test@acme.com', Site Address 'Building A', Note 'Test note'. Select an option from Assign To dropdown. Select an option from Lead Source dropdown. Click 'Submit'.
   - expect: A success toast notification appears confirming creation
   - expect: The form resets after successful submission
   - expect: The record 'Full Lead Test' appears in the table with all provided values visible in their respective columns

#### 2.3. TC-ADD-03: Successfully add a lead with site location selected via Google Maps modal

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter 'Map Lead Test' in 'Lead Name *', enter '9000000001' in 'Mobile Number*'
2. Click the 'Select Site Location' button
   - expect: A modal dialog appears with heading 'Select Site Location'
   - expect: The modal contains a Google Maps region, a 'Search for a place' textbox, a draggable pin, an instruction note, and a 'Confirm' button
3. Type 'Pune' in the 'Search for a place' textbox
   - expect: Google Maps autocomplete suggestions appear in a .pac-container dropdown
4. Click on a suggestion from the autocomplete list
   - expect: The map updates to show the selected location with the pin placed
5. Click the 'Confirm' button
   - expect: The modal closes
   - expect: The 'Select Site Location' button is still visible in the form
6. Click 'Submit'
   - expect: A success toast notification appears confirming creation
   - expect: The record 'Map Lead Test' appears in the table with a location address text in the Site Location column

#### 2.4. TC-ADD-04: Successfully add a lead with special characters in Lead Name

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter 'Lead & Test (2025)' in 'Lead Name *', enter '9000000002' in 'Mobile Number*', and click 'Submit'
   - expect: A success toast notification appears confirming creation
   - expect: The record 'Lead & Test (2025)' appears in the table with the exact name

#### 2.5. TC-ADD-05: Successfully add multiple leads sequentially

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter 'Seq Lead Alpha' and mobile '9000000003', click 'Submit'. Then immediately enter 'Seq Lead Beta' and mobile '9000000004', click 'Submit'.
   - expect: First submission: success toast appears and form resets
   - expect: Second submission: success toast appears and form resets again
   - expect: Both 'Seq Lead Alpha' and 'Seq Lead Beta' appear in the data table

---

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with empty Lead Name shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter a valid mobile number '9000000005' but leave 'Lead Name *' empty, and click 'Submit'
   - expect: An inline validation error appears below the 'Lead Name *' field (e.g. 'Please enter lead name')
   - expect: No new record is created
   - expect: No success toast appears

#### 3.2. TC-VAL-02: Submit form with empty Mobile Number shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter 'Valid Name' in 'Lead Name *', leave 'Mobile Number*' empty (only the '+91' prefix), and click 'Submit'
   - expect: An inline validation error appears below the 'Mobile Number*' field (e.g. 'Please enter mobile number')
   - expect: No new record is created
   - expect: No success toast appears

#### 3.3. TC-VAL-03: Submit form with both mandatory fields empty shows validation errors

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click 'Submit' without entering any values
   - expect: Inline validation errors appear for both 'Lead Name *' and 'Mobile Number*' fields
   - expect: No new record is created

#### 3.4. TC-VAL-04: Validation error clears when valid input is entered after failed submission

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click 'Submit' with empty Lead Name to trigger the validation error
   - expect: Inline validation error is visible below 'Lead Name *'
2. Type 'Fixed Name' in the 'Lead Name *' field
   - expect: The inline validation error is no longer visible as the user starts typing
3. Enter '9000000006' in Mobile Number and click 'Submit'
   - expect: A success toast appears confirming creation

#### 3.5. TC-VAL-05: Clear button removes validation errors

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click 'Submit' on the empty form to trigger validation errors, then click 'Clear'
   - expect: All inline validation errors disappear
   - expect: All form fields are empty/reset

#### 3.6. TC-VAL-06: Submit form with whitespace-only Lead Name shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, type '   ' (spaces only) in the 'Lead Name *' field, enter '9000000007' in 'Mobile Number*', and click 'Submit'
   - expect: An inline validation error appears below the 'Lead Name *' field
   - expect: No new record is created in the data table
   - expect: No success toast appears

---

### 4. Mobile Number Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-MOB-01: Mobile Number field accepts only numeric digits

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and type 'abcXYZ!@#' in the 'Mobile Number*' phone input
   - expect: Non-numeric characters are either rejected (not entered) or stripped, so the field does not contain letters or special characters

#### 4.2. TC-MOB-02: Mobile Number field accepts a valid 10-digit number

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, enter 'Mob Valid Test' in Lead Name, type '9876500001' in Mobile Number, and click 'Submit'
   - expect: A success toast appears confirming creation
   - expect: The table shows '+919876500001' in the Mobile Number column

#### 4.3. TC-MOB-03: Alternate Mobile Number field accepts only numeric digits

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and type 'abcXYZ' in the 'Alternate Mobile Number' phone input
   - expect: Non-numeric characters are either rejected or stripped

#### 4.4. TC-MOB-04: Country code selector changes the prefix in Mobile Number

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the country selector button (showing 'India: + 91') next to the Mobile Number field
   - expect: A country picker list or dropdown appears allowing selection of a different country code
2. Select a different country (e.g. United States)
   - expect: The phone input prefix changes to the new country's code
   - expect: The country flag/label on the selector updates accordingly

---

### 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets the Add form

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page, fill in Lead Name 'Clear Test Lead', Mobile Number '9000000010', Firm Name 'Clear Firm', Note 'clear note', select an Assign To and Lead Source option, then click 'Clear'
   - expect: 'Lead Name *' input is empty
   - expect: 'Mobile Number*' resets to '+91' prefix only
   - expect: 'Alternate Mobile Number' resets to '+91' prefix only
   - expect: 'Firm Name', 'Site Name', 'Firm Address', 'Email-id', 'Site Address', 'Note' inputs are all empty
   - expect: 'Assign To' and 'Lead Source' dropdowns are cleared (no selected chips)
   - expect: The form heading still reads 'Add lead Details'
   - expect: No record is created in the table

#### 5.2. TC-CLR-02: Clear button in Edit mode resets form back to Add mode

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the Edit icon on any table row
   - expect: The form heading changes to 'Update lead Details'
   - expect: The 'Lead Name *' field is pre-filled with the record's lead name
   - expect: The 'Mobile Number*' field is pre-filled with the stored mobile number
   - expect: The 'Assign To' field shows the stored assignee as a chip (if set)
   - expect: The 'Submit' button is replaced by 'Update'
2. Click the 'Clear' button while in Update mode
   - expect: The form heading reverts to 'Add lead Details'
   - expect: All form fields are empty/reset
   - expect: The 'Update' button reverts to 'Submit'

#### 5.3. TC-CLR-03: Clear button in Edit mode with validation error resets the error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record, clear the 'Lead Name *' field completely, click 'Update' to trigger a validation error, then click 'Clear'
   - expect: The inline validation error disappears
   - expect: The form returns to 'Add lead Details' mode with empty fields

---

### 6. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit icon opens record in Update mode with all fields pre-filled

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the Edit icon (img alt='Edit') on a row that has Firm Name, Assign To, and Site Location values set (e.g. row for 'hhg' which has Firm Name 'd2', Assign To 'Neha Palkar', Site Location 'Pune, Maharashtra, India')
   - expect: The form heading changes to 'Update lead Details'
   - expect: 'Lead Name *' is pre-filled with 'hhg'
   - expect: 'Mobile Number*' is pre-filled with the stored number
   - expect: 'Firm Name' is pre-filled with 'd2'
   - expect: 'Assign To' shows 'Neha Palkar' as a selected chip
   - expect: The 'Submit' button is replaced by 'Update'
   - expect: The 'Clear' button remains visible

#### 6.2. TC-EDT-02: Successfully update Lead Name

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record, clear the 'Lead Name *' field, type a new unique name, and click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The form resets to 'Add lead Details' mode
   - expect: The table reflects the updated Lead Name in the corresponding row

#### 6.3. TC-EDT-03: Successfully update Mobile Number

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record, clear the Mobile Number field and type a new 10-digit number, then click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The table reflects the updated Mobile Number (with country code prefix) in the corresponding row

#### 6.4. TC-EDT-04: Successfully update optional fields (Firm Name, Site Name, Note)

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record that has empty Firm Name, type 'Updated Firm', update Note to 'Updated note', and click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The form resets to Add mode
   - expect: The table row shows 'Updated Firm' in the Firm Name column

#### 6.5. TC-EDT-05: Update with empty Lead Name shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on any record, clear the 'Lead Name *' field completely, and click 'Update'
   - expect: An inline validation error appears below 'Lead Name *'
   - expect: No update is submitted
   - expect: No success toast appears

#### 6.6. TC-EDT-06: Update with empty Mobile Number shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on any record, clear the 'Mobile Number*' field completely (remove all digits), and click 'Update'
   - expect: An inline validation error appears below 'Mobile Number*'
   - expect: No update is submitted

#### 6.7. TC-EDT-07: Successfully update Assign To by changing the selection

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record that has an Assign To value. Remove the existing chip by clicking its 'x' button, then select a different user from the dropdown, and click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The table row shows the new assignee in the Assign To column

#### 6.8. TC-EDT-08: Successfully update Lead Source by changing the selection

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record. Select or change the Lead Source dropdown to a different source, and click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The table row reflects the new Lead Source in the Lead Source column
   - expect: The Ask Details column for that row updates to reflect the new Lead Source's Ask Details flag ('Yes'/'No')

#### 6.9. TC-EDT-09: Update site location via Google Maps in Edit mode

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on a record that has no Site Location set. Click 'Select Site Location', search for a location, select an autocomplete suggestion, click 'Confirm', then click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The table row now shows the selected location text in the Site Location column

#### 6.10. TC-EDT-10: Update with whitespace-only Lead Name shows validation error

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click Edit on any record, clear the 'Lead Name *' field completely, type '   ' (spaces only), and click 'Update'
   - expect: An inline validation error appears below the 'Lead Name *' field
   - expect: No update is submitted
   - expect: No success toast appears
   - expect: The form remains in 'Update lead Details' mode with the original record's other values still present

#### 6.11. TC-EDT-11: Updated data is reflected correctly in all columns of the data table

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and note the current values in a record row (Lead Name, Mobile Number, Firm Name, Site Name, Assign To, Lead Source, Note)
2. Click the Edit icon on that row
   - expect: The form opens in 'Update lead Details' mode with all fields pre-filled matching the noted values
3. Change the following fields: update Lead Name to 'Updated Lead Name', Mobile Number to '9111222333', Firm Name to 'Updated Firm', Site Name to 'Updated Site', Note to 'Updated note'
4. Click 'Update'
   - expect: A success toast appears confirming the update
   - expect: The form resets to 'Add lead Details' mode with all fields empty
5. Locate the updated record in the table (search by new Lead Name or scroll to find it)
   - expect: The Lead Name column shows 'Updated Lead Name' exactly
   - expect: The Mobile Number column shows '+919111222333' (with country code prefix)
   - expect: The Firm Name column shows 'Updated Firm' exactly
   - expect: The Site Name column shows 'Updated Site' exactly
   - expect: The Note column shows 'Updated note' exactly
   - expect: No other rows are affected; only the edited record's row is changed

---

### 7. Google Maps Modal

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-MAP-01: Select Site Location button opens the Google Maps modal

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the 'Select Site Location' button
   - expect: A modal dialog appears with the heading 'Select Site Location'
   - expect: The modal contains a Google Maps map region
   - expect: A 'Search for a place' textbox is present
   - expect: A draggable pin is visible on the map
   - expect: A note about dragging the pin to the desired location is visible
   - expect: A 'Confirm' button is present
   - expect: A Close (x) button is present on the modal

#### 7.2. TC-MAP-02: Search for a location and select from autocomplete

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click 'Select Site Location' to open the map modal, then type 'Pune' in the 'Search for a place' textbox
   - expect: Google Maps autocomplete suggestions appear in a .pac-container dropdown below the input
2. Click on one of the autocomplete suggestions
   - expect: The map updates to show the selected location with the pin positioned there
   - expect: The 'Confirm' button is available
3. Click 'Confirm'
   - expect: The modal closes
   - expect: The 'Select Site Location' button is still visible in the form

#### 7.3. TC-MAP-03: Close the map modal without confirming

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click 'Select Site Location' to open the map modal, then click the Close (x) button without clicking 'Confirm'
   - expect: The modal closes
   - expect: No location is stored (Submit proceeds without a site location)
   - expect: The form is unchanged

#### 7.4. TC-MAP-04: Submit with confirmed location shows 'Yes' in Site Location column

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Fill in Lead Name 'Location Yes Test' and Mobile Number '9000000020'. Click 'Select Site Location', search for 'Mumbai', select the first autocomplete result, click 'Confirm', then click 'Submit'
   - expect: A success toast appears confirming creation
   - expect: The record 'Location Yes Test' appears in the table with the selected location address in the Site Location column

#### 7.5. TC-MAP-05: Submit without selecting map location shows empty Site Location column

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Fill in Lead Name 'Location No Test' and Mobile Number '9000000021'. Do NOT click 'Select Site Location'. Click 'Submit'.
   - expect: A success toast appears confirming creation
   - expect: The record 'Location No Test' appears in the table with an empty Site Location cell (no address text)

---

### 8. Assign To Dropdown

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-ASN-01: Assign To dropdown shows searchable user options

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click or type in the 'Assign To' dropdown/searchbox
   - expect: A dropdown list of user options appears
   - expect: The list includes users visible in existing table records (e.g. 'Neha Palkar', 'Srushti', 'Sahil Jadhav')

#### 8.2. TC-ASN-02: Typing in Assign To filters the options

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Type 'Neha' in the Assign To searchbox
   - expect: The dropdown filters to show only options containing 'Neha'
   - expect: Non-matching options are hidden

#### 8.3. TC-ASN-03: Selecting an Assign To option adds a chip to the field

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click the Assign To dropdown and select a user from the list
   - expect: The selected user name appears as a chip/tag inside the Assign To field
   - expect: An 'x' button is present on the chip to remove the selection

#### 8.4. TC-ASN-04: Removing Assign To chip clears the selection

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Select a user in the Assign To dropdown, then click the 'x' on the chip
   - expect: The chip is removed
   - expect: The Assign To field is empty again
   - expect: The dropdown placeholder 'Select assign to' reappears

---

### 9. Lead Source Dropdown

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-LS-01: Lead Source dropdown shows options from Lead Source Master

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the Lead Source dropdown
   - expect: A list of lead source options appears (e.g. 'India Mart', 'Google Lead', 'Facebook', 'Site Visit')

#### 9.2. TC-LS-02: Typing in Lead Source dropdown filters the options

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Type 'Google' in the Lead Source searchbox
   - expect: The dropdown filters to show only lead source options containing 'Google' (e.g. 'Google Lead')

#### 9.3. TC-LS-03: Selecting Lead Source with Ask Details True reflects in Ask Details column

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Enter 'Ask Details Test' in Lead Name, '9000000030' in Mobile Number, select a Lead Source that has Ask Details = True (e.g. 'Site Visit' which has Ask Details: True as shown in the Lead Source Master), and click 'Submit'
   - expect: A success toast appears confirming creation
   - expect: The record 'Ask Details Test' shows 'Yes' in the Ask Details column of the table

#### 9.4. TC-LS-04: Selecting Lead Source with Ask Details False reflects in Ask Details column

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Enter 'Ask No Test' in Lead Name, '9000000031' in Mobile Number, select a Lead Source that has Ask Details = False (e.g. 'India Mart' which has Ask Details: False), and click 'Submit'
   - expect: A success toast appears confirming creation
   - expect: The record 'Ask No Test' shows 'No' in the Ask Details column of the table

---

### 10. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-FLT-01: Default status filter is 'All' showing all pipeline statuses

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and check the Status filter dropdown
   - expect: The Status filter defaults to 'All'
   - expect: The table shows records with mixed statuses (Pending, Won, Enquiry Generated, etc.)

#### 10.2. TC-FLT-02: Filter table by 'Pending' shows only Pending leads

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Status filter dropdown to 'Pending'
   - expect: The table shows only records with Status badge 'Pending'
   - expect: Records with other statuses (Won, Enquiry Generated, etc.) are not visible

#### 10.3. TC-FLT-03: Filter table by 'Won' shows only Won leads

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Status filter dropdown to 'Won'
   - expect: The table shows only records with Status badge 'Won'
   - expect: If no Won records exist, the table shows a no-records message

#### 10.4. TC-FLT-04: Filter table by 'Cold'

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Status filter dropdown to 'Cold'
   - expect: The table shows only records with Status badge 'Cold'
   - expect: If no Cold records exist, the table shows a no-records message

#### 10.5. TC-FLT-05: Filter table by 'Enquiry Generated'

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Status filter dropdown to 'Enquiry Generated'
   - expect: The table shows only records with Status badge 'Enquiry Generated'
   - expect: Records with other statuses are hidden

#### 10.6. TC-FLT-06: Returning to 'All' shows all records

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Set the Status filter to 'Pending', then change it back to 'All'
   - expect: The table shows records of all pipeline statuses again

#### 10.7. TC-FLT-07: Status filter resets to 'All' on page re-navigation

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Status filter to 'Won', navigate to another page (e.g. Dashboard), then navigate back to the Lead Import page
   - expect: The Status filter resets to 'All' upon re-navigation

---

### 11. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRC-01: Search by partial Lead Name returns matching results

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and type 'Srushti' in the Search input
   - expect: The table filters to show only records with 'Srushti' in the Lead Name
   - expect: Records not containing 'Srushti' are hidden

#### 11.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Type 'XYZNONEXISTENT999' in the Search input
   - expect: The table body shows a no-records message
   - expect: No data rows are visible

#### 11.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Type a search term to filter the table, then clear the Search input
   - expect: The table restores and shows the full list based on the current Status filter

#### 11.4. TC-SRC-04: Search is case-insensitive

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Type 'srushti' (all lowercase) in the Search input
   - expect: Records with 'Srushti' (mixed case) appear in the filtered results

#### 11.5. TC-SRC-05: Search applies on top of the Status filter

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Set the Status filter to 'Pending', then type a lead name that exists with both Pending and Won statuses in the Search input
   - expect: Only Pending records matching the search term appear
   - expect: Won records matching the search term do not appear

---

### 12. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and inspect the Show: dropdown
   - expect: The Show: dropdown has '25' selected as default
   - expect: The table shows at most 25 rows

#### 12.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the 'Show:' dropdown to '10'
   - expect: The table shows at most 10 rows
   - expect: Pagination controls (Next page, Previous page) are visible since data spans more than 10 records

#### 12.3. TC-PAG-03: Navigate to next page and back

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. With 'Show:' set to '10', click the 'Next page' button
   - expect: The table navigates to page 2 showing the next set of records
   - expect: The page indicator updates to show page 2 as current
2. Click the 'Previous page' button
   - expect: The table navigates back to page 1
   - expect: The page indicator reverts to page 1

#### 12.4. TC-PAG-04: Change rows-per-page to 50 and 100

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Change the Show: dropdown to '50'
   - expect: The table shows up to 50 records per page
2. Change the Show: dropdown to '100'
   - expect: The table shows up to 100 records per page
   - expect: If total records are 100 or fewer, all fit on one page

#### 12.5. TC-PAG-05: Previous page button is disabled on page 1

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page (defaults to page 1)
   - expect: The 'Previous page' button is disabled
   - expect: The 'Next page' button is enabled (since there are more records)

---

### 13. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-SRT-01: Sort by Lead Name ascending then descending

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and click the 'Lead Name' column header button
   - expect: The table sorts by Lead Name in ascending alphabetical order (A to Z)
   - expect: The sort icon on the column header indicates ascending sort
2. Click the 'Lead Name' column header button a second time
   - expect: The table sorts by Lead Name in descending order (Z to A)

#### 13.2. TC-SRT-02: Sort by Mobile Number

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click the 'Mobile Number' column header button
   - expect: The table sorts by Mobile Number value
   - expect: The sort icon reflects the sort direction

#### 13.3. TC-SRT-03: Sort by Firm Name

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click the 'Firm Name' column header button
   - expect: The table sorts by Firm Name alphabetically
   - expect: Records with empty Firm Name appear at the beginning or end depending on sort direction

#### 13.4. TC-SRT-04: Sort by Assign To

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Click the 'Assign To' column header button
   - expect: The table sorts records by Assign To name

#### 13.5. TC-SRT-05: Sort by Status

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. With Status filter set to 'All', click the 'Status' column header button
   - expect: The table sorts records by pipeline Status (alphabetical or defined order)
   - expect: The sort icon reflects the direction

#### 13.6. TC-SRT-06: Site Address column has no sort

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Navigate to the Lead Import page and inspect the 'Site Address' column header
   - expect: The 'Site Address' column header does NOT have a sort icon
   - expect: Clicking the 'Site Address' column header does not trigger any sort behavior

---

### 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-NAV-01: Lead Import is accessible via the Bulk Import sidebar menu

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Log in and click 'Bulk Import' in the left sidebar navigation to expand it
   - expect: The Bulk Import submenu expands showing PM Import, Job Import, and Lead Import
2. Click the 'Lead Import' link
   - expect: The browser navigates to https://stage.elevatorplus.net/master/lead-import
   - expect: The Lead Import page loads with the 'Add lead Details' form and data table

#### 14.2. TC-NAV-02: Unauthenticated user cannot access the Lead Import page

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. Without logging in, directly navigate to https://stage.elevatorplus.net/master/lead-import
   - expect: The user is redirected to the login page
   - expect: The Lead Import page content is not accessible

#### 14.3. TC-NAV-03: Direct URL navigation works when authenticated

**File:** `tests/bulk-import/lead-import.spec.ts`

**Steps:**
1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/lead-import via the browser address bar
   - expect: The page loads successfully without redirecting
   - expect: The 'Add lead Details' form and data table are fully functional
