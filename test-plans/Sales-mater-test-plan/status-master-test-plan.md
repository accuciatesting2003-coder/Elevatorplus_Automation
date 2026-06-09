# Status Master Test Plan

## Application Overview

The Status Master page (https://stage.elevatorplus.net/master/status-master) is part of the Sales Masters section in the ElevatorPlus application. It allows administrators to manage statuses used across different modules such as Lead, Breakdown, Enquiries, and PM (Predective Maintenance).

**Add Status Form Fields (all mandatory):**
1. Status Type — dropdown with options: Lead, Breakdown, Enquiries, PM
2. Status Name — text input (no /, \, or , characters allowed)
3. Priority — numeric spinner input (unique priority values for display ordering)
4. Color — native HTML color picker (input[type="color"]) with hex value display

**Edit Mode:** Clicking the Edit icon on a user-created row opens the form with pre-filled values and adds a 5th field — Status (Active/Inactive dropdown). The Submit button becomes Update. Rows without an Edit icon are system-default rows.

**Table Columns:** Sr. No., Action (Edit icon), Status Type, Status Name, Color (hex with color swatch), Priority, Status (Active/Inactive badge)

**Toolbar Controls:**
- Show (rows per page): 10, 25 (default), 50, 100
- Status filter: All, Active (default), Inactive
- Search box: filters by Status Name or Status Type dynamically

**Pagination:** Multi-page navigation with Previous/Next buttons and numbered page buttons. Total of 42 records across 2 pages (with 25 per page default).

**Validation Messages:**
- Status Type empty: "Type is required"
- Status Name empty: "Please enter status name"
- Status Name with /, \, or , characters: "Name cannot contain /, \, or , characters"
- Priority empty: "Please enter priority"

**No import/export buttons observed on this page.**

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Status Master page loads successfully

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/status-master
    - expect: The page title should display 'ElevatorPlus'
    - expect: The breadcrumb/heading should show 'Status Master'
  2. Observe the Add Status form section
    - expect: The form heading 'Add Status' is visible
    - expect: Four form fields are visible: Status Type (dropdown), Status Name (text input), Priority (number input), Color (color picker)
    - expect: Clear and Submit buttons are present
  3. Observe the data table section
    - expect: The table is visible with columns: Sr. No., Action, Status Type, Status Name, Color, Priority (add unique priority), Status
    - expect: At least one row of data is displayed in the table
    - expect: The toolbar shows Show (rows per page), Status filter, and Search input

#### 1.2. TC-SM-02: Status Master is accessible via sidebar navigation

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in with valid credentials and navigate to the dashboard at https://stage.elevatorplus.net/dashboard
    - expect: The dashboard page is loaded successfully
  2. In the left sidebar, click on 'Sales Masters' to expand the submenu
    - expect: The Sales Masters submenu expands and shows child links
  3. Click on 'Status Master' link in the submenu
    - expect: The page navigates to https://stage.elevatorplus.net/master/status-master
    - expect: The Status Master page content loads with the Add Status form and data table

### 2. 2. Add Status — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully add a new Status with Status Type 'Lead'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is displayed
  2. In the Status Type dropdown, select 'Lead'
    - expect: 'Lead' is selected and displayed in the dropdown
  3. In the Status Name field, enter a unique name e.g. 'Test Lead Status'
    - expect: The text 'Test Lead Status' is entered in the Status Name field
  4. In the Priority field, enter a unique numeric value e.g. '99'
    - expect: The value '99' is entered in the Priority field
  5. Click on the Color picker (native color input) and select or enter a hex color e.g. '#FF5733'
    - expect: The color picker shows the selected color and the hex value updates to '#ff5733'
  6. Click the Submit button
    - expect: A success notification/toast message appears confirming the status was added
    - expect: The form fields are cleared/reset after successful submission
    - expect: The new status 'Test Lead Status' appears in the data table

#### 2.2. TC-ADD-02: Successfully add a new Status with Status Type 'Breakdown'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is displayed
  2. In the Status Type dropdown, select 'Breakdown'
    - expect: 'Breakdown' is selected in the dropdown
  3. In the Status Name field, enter 'Breakdown Test Status'
    - expect: The text is entered correctly
  4. In the Priority field, enter '98'
    - expect: The value '98' is entered
  5. Click the Color picker and select a color e.g. '#28a745'
    - expect: The color is selected and the hex value is updated
  6. Click the Submit button
    - expect: A success notification appears
    - expect: The form is reset
    - expect: The new status 'Breakdown Test Status' appears in the data table with Status Type 'Breakdown'

#### 2.3. TC-ADD-03: Successfully add a new Status with Status Type 'Enquiries'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is displayed
  2. Select 'Enquiries' from the Status Type dropdown
    - expect: 'Enquiries' is selected
  3. Enter 'Enquiries Test Status' in the Status Name field
    - expect: Text is entered correctly
  4. Enter '97' in the Priority field
    - expect: Value is entered
  5. Select a color using the color picker (e.g. '#17a2b8')
    - expect: Color is selected
  6. Click Submit
    - expect: Success notification is shown
    - expect: New record 'Enquiries Test Status' appears in the table with Status Type 'Enquiries'

#### 2.4. TC-ADD-04: Successfully add a new Status with Status Type 'PM'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is displayed
  2. Select 'PM' from the Status Type dropdown
    - expect: 'PM' is selected
  3. Enter 'PM Test Status' in the Status Name field
    - expect: Text is entered correctly
  4. Enter '96' in the Priority field
    - expect: Value is entered
  5. Select a color using the color picker (e.g. '#ffc107')
    - expect: Color is selected
  6. Click Submit
    - expect: Success notification is shown
    - expect: New record 'PM Test Status' appears in the table with Status Type 'PM'

### 3. 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit empty form — all fields show validation errors

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is empty with all fields blank
  2. Without filling any fields, click the Submit button
    - expect: The form does not submit
    - expect: Validation error 'Type is required' is displayed below the Status Type dropdown
    - expect: Validation error 'Please enter status name' is displayed below the Status Name field
    - expect: Validation error 'Please enter priority' is displayed below the Priority field
    - expect: No success notification appears

#### 3.2. TC-VAL-02: Submit with only Status Type filled — other fields show errors

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is empty
  2. Select 'Lead' from the Status Type dropdown
    - expect: 'Lead' is selected
  3. Leave Status Name, Priority, and Color fields empty and click Submit
    - expect: Validation error 'Please enter status name' is shown below Status Name
    - expect: Validation error 'Please enter priority' is shown below Priority
    - expect: No 'Type is required' error appears (Status Type is filled)
    - expect: The form does not submit

#### 3.3. TC-VAL-03: Submit with only Status Name filled — other fields show errors

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is empty
  2. Enter 'Test Name' in the Status Name field only and click Submit
    - expect: Validation error 'Type is required' appears below Status Type
    - expect: Validation error 'Please enter priority' appears below Priority
    - expect: The form does not submit

#### 3.4. TC-VAL-04: Submit with only Priority filled — other fields show errors

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is empty
  2. Enter '50' in the Priority field only and click Submit
    - expect: Validation error 'Type is required' appears below Status Type
    - expect: Validation error 'Please enter status name' appears below Status Name
    - expect: The form does not submit

#### 3.5. TC-VAL-05: Status Name with forward slash character triggers validation error

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is displayed
  2. Select 'Lead' from Status Type, enter 'Test/Name' in Status Name, enter '50' in Priority, and click Submit
    - expect: Validation error 'Name cannot contain /, \, or , characters' is shown below the Status Name field
    - expect: The form does not submit

#### 3.6. TC-VAL-06: Status Name with backslash character triggers validation error

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is displayed
  2. Select 'PM' from Status Type, enter 'Test\\Name' in Status Name, enter '50' in Priority, and click Submit
    - expect: Validation error 'Name cannot contain /, \, or , characters' is shown below the Status Name field
    - expect: The form does not submit

#### 3.7. TC-VAL-07: Status Name with comma character triggers validation error

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The form is displayed
  2. Select 'Enquiries' from Status Type, enter 'Test,Name' in Status Name, enter '50' in Priority, and click Submit
    - expect: Validation error 'Name cannot contain /, \, or , characters' is shown below the Status Name field
    - expect: The form does not submit

#### 3.8. TC-VAL-08: Color picker has a default color value and is mandatory

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Color field is visible with a default hex color value (e.g. '#8493d1') pre-populated in the color picker and the hex display span
  2. Select 'Lead' from Status Type, enter 'Color Test' in Status Name, enter '95' in Priority and observe the color picker
    - expect: The color picker shows the default color value
    - expect: The hex display next to the color picker shows the current color code
  3. Change the color by clicking the color picker and selecting a different color
    - expect: The color picker updates to the newly selected color
    - expect: The hex value display next to the picker updates to reflect the new color
  4. Click Submit
    - expect: The form submits successfully with the chosen color
    - expect: The new record in the table displays the correct color hex value

### 4. 4. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DUP-01: Submit a status with a duplicate name and same status type — error should appear

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form and table are visible
  2. Note an existing status name and type from the table (e.g., Status Type 'PM', Status Name 'Test 2')
    - expect: The existing record is confirmed visible in the table
  3. Fill the form with the same Status Type ('PM') and Status Name ('Test 2'), enter Priority '95' and select any color, then click Submit
    - expect: An error notification or inline error message appears indicating a duplicate entry or that the status already exists
    - expect: No new duplicate record is added to the table

#### 4.2. TC-DUP-02: Same name with different Status Type should be allowed

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is visible
  2. Observe that 'Pending' exists for Status Type 'PM' in the table
    - expect: 'Pending' for PM type is confirmed in the table
  3. Fill the form: Status Type = 'Breakdown', Status Name = 'Pending', Priority = '94', select any color, click Submit
    - expect: The form submits successfully (different type + same name is allowed)
    - expect: A success notification appears
    - expect: New 'Breakdown - Pending' record is added to the table

#### 4.3. TC-DUP-03: Submit a status with the same Status Type and Status Name as an existing Inactive record — error should appear

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form and table are visible
  2. Set the Status filter to 'Inactive' and note an existing Inactive record's Status Type and Status Name (e.g., Status Type = 'Lead', Status Name = 'Cancelled')
    - expect: At least one Inactive record is visible (if none exist, first mark a record as Inactive via the Edit form)
  3. Reset the Status filter back to 'Active'
    - expect: The table shows only Active records
  4. Fill the Add Status form: Status Type = same as the noted Inactive record (e.g., 'Lead'), Status Name = same as the noted Inactive record (e.g., 'Cancelled'), Priority = '93', select any color, then click Submit
    - expect: An error notification appears indicating the status name already exists
    - expect: No new record is added to the table
    - expect: The Inactive record is unchanged when the Status filter is set back to 'Inactive'

### 5. 5. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CLR-01: Clear button resets all Add Status form fields

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Add Status form is empty
  2. Fill in all form fields: Status Type = 'Lead', Status Name = 'Clear Test', Priority = '93', select a color from the color picker
    - expect: All fields are filled with the entered values
  3. Click the Clear button
    - expect: The Status Type dropdown resets to 'Select type'
    - expect: The Status Name field is cleared/empty
    - expect: The Priority field is cleared/empty
    - expect: The Color picker resets to its default value (e.g., #000000 or default color)
    - expect: The form heading remains 'Add Status'
    - expect: No data is saved to the table

#### 5.2. TC-CLR-02: Clear button in Edit mode resets the form and returns to Add mode

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible with edit-capable rows
  2. Click the Edit icon on a user-created row (a row that has an Edit icon in the Action column)
    - expect: The form heading changes to 'Update Status'
    - expect: The form is pre-populated with the row's Status Type, Status Name, Priority, Color, and Status (Active/Inactive) values
    - expect: The Submit button changes to 'Update'
    - expect: A 5th field 'Status' dropdown (Active/Inactive) is visible
  3. Click the Clear button without making any changes
    - expect: The form heading reverts to 'Add Status'
    - expect: All form fields are cleared/reset to empty/default values
    - expect: The 5th 'Status' dropdown disappears (not shown in Add mode)
    - expect: The button reverts to 'Submit'
  4. Verify the table data is unchanged
    - expect: The record that was being edited still appears in the table with its original values

### 6. 6. Edit / Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-EDT-01: Edit button loads correct data into the form

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible
  2. Locate a row with an Edit icon (e.g., Row 1: PM, Test 2, #b384d2, Priority 2, Active) and click its Edit icon
    - expect: The form heading changes to 'Update Status'
    - expect: Status Type dropdown shows 'PM'
    - expect: Status Name field shows 'Test 2'
    - expect: Priority field shows '2'
    - expect: Color picker shows '#b384d2'
    - expect: Status dropdown shows 'Active'
    - expect: The 5th field 'Status *' dropdown is visible with options: Active, Inactive

#### 6.2. TC-EDT-02: Successfully update an existing status record

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible
  2. Click the Edit icon on any user-created row
    - expect: The Update Status form is loaded with pre-filled data
  3. Modify the Status Name to 'Updated Status Name', change Priority to '88', select a different color
    - expect: The fields reflect the updated values
  4. Click the Update button
    - expect: A success notification appears
    - expect: The form is cleared/reset to Add mode
    - expect: The table row reflects the updated Status Name, Priority, and Color values

#### 6.3. TC-EDT-03: Update status record — change Status Type

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible
  2. Click the Edit icon on a 'Lead' type row
    - expect: The Update Status form opens with Status Type = 'Lead'
  3. Change Status Type dropdown to 'Enquiries', then click Update
    - expect: A success notification appears
    - expect: The table row reflects the new Status Type 'Enquiries'



#### 6.4. TC-EDT-04: Update a record with the same Status Type and Status Name as an existing Active record — error should appear

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible with Active records loaded
  2. Note two different user-created Active records that share the same Status Type (e.g., two 'Lead' type rows: 'Test Lead Status' and 'Lead In Progress')
    - expect: Both records are confirmed visible in the table
  3. Click the Edit icon on one of the two records (e.g., 'Lead In Progress')
    - expect: The Update Status form opens with the record's data pre-filled
  4. Clear the Status Name field and enter the Status Name of the other existing Active record with the same Status Type (e.g., 'Test Lead Status'), then click the Update button
    - expect: An error notification appears indicating the status name already exists for this type
    - expect: The form remains in Update mode without resetting
    - expect: No duplicate record is created in the table
    - expect: The original record retains its old name in the table

#### 6.5. TC-EDT-05: Update a record with the same Status Type and Status Name as an existing Inactive record — error should appear

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible
  2. Set the Status filter to 'Inactive' and note the Status Type and Status Name of an existing Inactive record (e.g., Status Type = 'Lead', Status Name = 'Cancelled')
    - expect: At least one Inactive record is visible (if none exist, first mark a record as Inactive via the Edit form)
  3. Reset the Status filter back to 'Active'
    - expect: The table shows only Active records
  4. Click the Edit icon on any Active user-created row that has a different name (e.g., 'Lead In Progress')
    - expect: The Update Status form opens with the record pre-filled
  5. Change the Status Type to match the Inactive record's type (e.g., 'Lead') and clear the Status Name, then enter the Inactive record's name (e.g., 'Cancelled'), then click the Update button
    - expect: An error notification appears indicating the status name already exists for this type (even though the conflicting record is Inactive)
    - expect: The form remains in Update mode without resetting
    - expect: No changes are saved to the table for the record being edited

#### 6.6. TC-EDT-06: Update status — mark a record as Inactive

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is visible
  2. Click the Edit icon on any user-created row
    - expect: The Update Status form opens with Status dropdown showing 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click Update
    - expect: A success notification appears
    - expect: The row in the table now shows the Status badge as 'Inactive'

### 7. 7. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-FLT-01: Status filter defaults to 'Active' and shows only active records

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Status filter dropdown in the toolbar shows 'Active' as the default selected option
    - expect: All records displayed in the table have the Status badge 'Active'

#### 7.2. TC-FLT-02: Status filter 'All' shows all records regardless of status

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Status filter defaults to 'Active'
  2. Change the Status filter dropdown to 'All'
    - expect: The table displays all records including both Active and Inactive entries
    - expect: The total record count may increase compared to the Active-only view

#### 7.3. TC-FLT-03: Status filter 'Inactive' shows only inactive records or empty state

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Status filter is visible
  2. Change the Status filter dropdown to 'Inactive'
    - expect: If no inactive records exist: the message 'There are no records to display' is shown in the table
    - expect: If inactive records exist: only records with Status badge 'Inactive' are displayed

#### 7.4. TC-FLT-04: Status filter correctly resets pagination to page 1 when changed

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master and navigate to page 2
    - expect: Page 2 is displayed
  2. Change the Status filter from 'Active' to 'All'
    - expect: The table resets to page 1
    - expect: Page 1 is highlighted as the current page in the pagination control

### 8. 8. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SRC-01: Search by Status Name filters results correctly

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The search input is visible in the toolbar area and shows placeholder 'Search Name'
  2. Type 'Pending' in the search input box
    - expect: The table filters in real-time to show only rows where Status Name contains 'Pending'
    - expect: Rows for PM-Pending, Enquiries-Pending, and Lead-Pending are shown
    - expect: The pagination updates to reflect the filtered count

#### 8.2. TC-SRC-02: Search by partial Status Name

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The search input is visible
  2. Type 'can' in the search input box (partial match for 'Cancelled')
    - expect: The table shows rows where Status Name contains 'can' (case-insensitive)
    - expect: Rows like 'Cancelled' for PM and Enquiries types are shown

#### 8.3. TC-SRC-03: Search with no matching results shows empty state

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The search input is visible
  2. Type 'XYZNONEXISTENT12345' in the search input box
    - expect: The table shows the message 'There are no records to display'
    - expect: No data rows are visible

#### 8.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The search input is visible
  2. Type 'Pending' in the search box, then clear the input field
    - expect: After clearing, the full list of status records is restored
    - expect: The table pagination also resets accordingly

#### 8.5. TC-SRC-05: Search placeholder updates based on context (Name vs Type)

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The search box area shows 'Search Name' label
  2. Observe the search placeholder text in different states (default Add mode vs after Edit mode)
    - expect: In default state the search area shows 'Search Name'
    - expect: After clicking Edit on a record and then pressing Clear, the search context label may show 'Search Type'

### 9. 9. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PAG-01: Default rows per page is 25 and pagination shows 2 pages for 42 total records

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The Show (rows per page) dropdown defaults to '25'
    - expect: The table shows 25 rows on page 1
    - expect: The pagination shows Page 1 and Page 2 buttons
    - expect: The Previous page button is disabled on page 1

#### 9.2. TC-PAG-02: Change rows per page to 10

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: Rows per page defaults to 25
  2. Change the Show dropdown to '10'
    - expect: The table updates to display only 10 rows per page
    - expect: The pagination updates to show additional page buttons (e.g., pages 1 through 5 for 42 records)
    - expect: The table resets to page 1

#### 9.3. TC-PAG-03: Change rows per page to 50 — all records fit on one page

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: Rows per page defaults to 25
  2. Change the Show dropdown to '50'
    - expect: All records (42 total) are displayed on a single page
    - expect: The pagination shows only Page 1 with Previous and Next buttons both disabled

#### 9.4. TC-PAG-04: Change rows per page to 100 — all records fit on one page

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: Rows per page defaults to 25
  2. Change the Show dropdown to '100'
    - expect: All available records are displayed on a single page
    - expect: The pagination shows only Page 1

#### 9.5. TC-PAG-05: Navigate to page 2 using the page button

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: Page 1 is the current page (rows per page = 25)
  2. Click the 'Page 2' button in the pagination control
    - expect: The table loads page 2 records (rows 26 onwards)
    - expect: The 'Page 2' button is highlighted as the current page
    - expect: The 'Previous page' button becomes enabled
    - expect: The 'Next page' button is disabled since page 2 is the last page

#### 9.6. TC-PAG-06: Navigate using Next and Previous page buttons

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: Page 1 is active, Previous page button is disabled
  2. Click the 'Next page' button
    - expect: Page 2 is loaded and the 'Page 2 is your current page' button is active
    - expect: The Next page button becomes disabled
  3. Click the 'Previous page' button
    - expect: Page 1 is loaded and the 'Page 1 is your current page' button is active
    - expect: The Previous page button becomes disabled again

### 10. 10. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRT-01: Sort by Status Type column

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is displayed
  2. Click the 'Status Type' column header button
    - expect: The table rows are sorted by Status Type in ascending alphabetical order (Breakdown, Enquiries, Lead, PM)
    - expect: The column header shows a sort indicator
  3. Click the 'Status Type' column header again
    - expect: The sort order reverses to descending (PM, Lead, Enquiries, Breakdown)

#### 10.2. TC-SRT-02: Sort by Status Name column

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is displayed
  2. Click the 'Status Name' column header button
    - expect: The table rows are sorted by Status Name in ascending alphabetical order (e.g., Cancelled, Close by Others, Cold, ...)
    - expect: The column header shows a sort indicator (pressed state)
  3. Click the 'Status Name' column header again
    - expect: The sort order reverses to descending alphabetical order

#### 10.3. TC-SRT-03: Sort by Priority column

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is displayed
  2. Click the 'Priority (add unique priority)' column header button
    - expect: The table rows are sorted by Priority in ascending numeric order (1, 1, 1, 2, 2, 3...)
    - expect: The column header shows a sort indicator
  3. Click the column header again
    - expect: The sort order reverses to descending numeric order

#### 10.4. TC-SRT-04: Sort by Status column

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master and set the Status filter to 'All'
    - expect: All records including Active and Inactive are displayed
  2. Click the 'Status' column header button
    - expect: The table rows are sorted by Status value (Active/Inactive) in alphabetical order
  3. Click the 'Status' column header again
    - expect: The sort order reverses

#### 10.5. TC-SRT-05: Sort by Color column

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The data table is displayed
  2. Click the 'Color' column header button
    - expect: The table rows are sorted by Color hex value in ascending order
    - expect: The column header shows a sort indicator

### 11. 11. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INACT-01: Mark a user-created status as Inactive via Edit form

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The table shows active records
  2. Click the Edit icon on any user-created row (one with an Edit icon)
    - expect: The Update Status form opens with Status dropdown showing 'Active'
  3. Change the Status dropdown from 'Active' to 'Inactive' and click the Update button
    - expect: A success notification appears
    - expect: The table row now shows 'Inactive' in the Status column
  4. Set the Status filter to 'Inactive'
    - expect: The record that was just set to Inactive appears in the filtered table

#### 11.2. TC-INACT-02: Inactive records are hidden when Status filter is set to 'Active'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master, ensure at least one Inactive record exists
    - expect: The table is loaded
  2. Set the Status filter to 'Active'
    - expect: Only Active records are shown
    - expect: Inactive records are not visible in the table
  3. Set the Status filter to 'Inactive'
    - expect: Only Inactive records are shown

#### 11.3. TC-INACT-03: Reactivate an Inactive record by setting Status back to Active

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master, set Status filter to 'Inactive' to find an inactive record
    - expect: At least one Inactive record is visible (if none exist, first make one inactive via TC-INACT-01)
  2. Click the Edit icon on an Inactive user-created row
    - expect: The Update Status form opens with Status dropdown showing 'Inactive'
  3. Change the Status dropdown from 'Inactive' to 'Active' and click Update
    - expect: A success notification appears
    - expect: The record is no longer shown under the 'Inactive' filter
    - expect: The record appears again when the 'Active' filter is selected

### 12. 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Unauthenticated user is redirected to login page

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Without logging in, directly navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The user is redirected to the login page at https://stage.elevatorplus.net/login
    - expect: The Status Master page content is not accessible

#### 12.2. TC-NAV-02: Page heading in the navigation bar shows 'Status Master'

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The top navigation bar / breadcrumb area shows the heading 'Status Master'
    - expect: The page title in the browser tab shows 'ElevatorPlus'

#### 12.3. TC-NAV-03: Status Master is listed under Sales Masters in the sidebar

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to the dashboard
    - expect: The sidebar is visible
  2. Expand the 'Sales Masters' sidebar section by clicking on it
    - expect: The Sales Masters submenu expands
    - expect: A 'Status Master' link with URL /master/status-master is present in the submenu list

#### 12.4. TC-NAV-04: Navigating away from the page and back preserves the default state

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The page loads with the Add Status form and table
  2. Navigate to the Dashboard page and then navigate back to https://stage.elevatorplus.net/master/status-master
    - expect: The Status Master page reloads with the Add Status form in default empty state
    - expect: The Status filter defaults back to 'Active'
    - expect: The rows per page defaults to 25
    - expect: The search input is empty

#### 12.5. TC-NAV-05: Info tooltip button on the Add Status form is clickable

**File:** `tests/Sales-master/status-master.spec.ts`

**Steps:**
  1. Log in and navigate to https://stage.elevatorplus.net/master/status-master
    - expect: The 'Add Status' form heading is visible with a small info icon button next to it
  2. Click the info icon button (the circle-i icon) next to the 'Add Status' heading
    - expect: A tooltip or information popup appears with helpful context about the form or fields
