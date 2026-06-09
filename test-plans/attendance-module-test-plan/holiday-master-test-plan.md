# Holiday Master Test Plan

## Application Overview

The Holiday Master page is part of the ElevatorPlus Attendance module, accessible at `https://stage.elevatorplus.net/attendance/holiday`. It allows admins to create and manage holidays that apply to the organization's branches.

**Page heading:** "Holiday"

The page is divided into two sections:

### Add Holiday Form (top of page)

**Form heading:** "Add Holiday" — this form is always visible (not in a modal or drawer).

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Text input (`name="name"`, `id="name"`) | Yes | Placeholder: empty |
| Date | Date input (`name="date"`, `id="date"`) | Yes | `min` = today's date; only future dates accepted |
| Branch | React Select multi-select | No | If empty, holiday applies to All Branches |

**Validation messages (on empty Submit):**
- Name empty → "Please enter Holiday"
- Date empty → "Date is required"

**Form buttons:**
- **Clear** — resets all fields to blank
- **Submit** — submits the form and adds the holiday to the table

### Data Table (below the form)

The table uses `react-dataTable` and renders rows as `div[role="row"]`.

**Columns:** Sr. No., Action, Holiday, Date, Branch, Status

- **Action column:** Contains an **Edit** icon (pencil SVG, `title="Edit"`) that pre-populates the form for editing.
- **Holiday column:** The holiday name.
- **Date column:** Date in format `Mon D, YYYY` (e.g., "Jun 6, 2026").
- **Branch column:** Branch names displayed as blue badges (e.g., "Pune", "Satara"). If no branch is selected, displays "All Branches" text.
- **Status column:** `Active` (green badge) or `Inactive` (red badge), wrapped in an `<h5>` element.

**Table toolbar:**
- **Show:** rows-per-page dropdown (options: 10, 25, 50, 100; default 10), id="rows-per-page"
- **Branch:** React Select multi-select filter (default: "All Branches"), id="react-select-4-input"
- **Status:** select dropdown (All, Active, Inactive), id="status-filter"
- **Search:** text input, placeholder "Search Holiday Name"

**Pagination:** numbered page buttons below the table.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Holiday Master page loads successfully

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/attendance/holiday`
   - expect: Page URL contains `/attendance/holiday`
   - expect: Page heading "Holiday" is visible
   - expect: "Add Holiday" form heading is visible
   - expect: Name field is present and empty
   - expect: Date field is present and empty
   - expect: Branch (Optional) dropdown is present
   - expect: Clear and Submit buttons are visible
   - expect: Data table loads with holiday records

#### 1.2. TC-SM-02: All form fields and table elements are visible

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to the Holiday Master page and inspect the UI
   - expect: Label "Name *" is visible with a required asterisk
   - expect: Label "Date *" is visible with a required asterisk
   - expect: Label "Branch (Optional)" is visible
   - expect: Table columns visible: Sr. No., Action, Holiday, Date, Branch, Status
   - expect: Table toolbar contains: Show dropdown, Branch filter, Status filter, Search input

#### 1.3. TC-SM-03: Table loads existing holiday records

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to Holiday Master page and wait for the table to load
   - expect: At least one row is visible in the table
   - expect: Each row has a value in the Holiday, Date, and Status columns
   - expect: The Action column shows an Edit icon for each row

---

### 2. Add Holiday — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Add a holiday with only mandatory fields (no branch — applies to All Branches)

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a unique holiday name (e.g., "Independence Day Test") in the Name field
2. Select a future date (e.g., 7 days from today) in the Date field
3. Leave Branch (Optional) empty
4. Click Submit
   - expect: A success toast/notification appears confirming the holiday was added
   - expect: The new holiday appears in the table with the entered name and date
   - expect: The Branch column for the new row shows "All Branches"
   - expect: The Status column shows "Active"
   - expect: The form fields are cleared after submission (Name, Date, Branch reset)

#### 2.2. TC-ADD-02: Add a holiday with a specific single branch

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a unique holiday name (e.g., "Pune Branch Fest") in the Name field
2. Select a future date in the Date field
3. Click the Branch dropdown and select one branch (e.g., "Pune")
4. Click Submit
   - expect: Success toast appears
   - expect: New row appears in the table with the correct name and date
   - expect: Branch column shows "Pune" as a badge
   - expect: Status is "Active"

#### 2.3. TC-ADD-03: Add a holiday with multiple branches

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a unique holiday name (e.g., "Multi-Branch Holiday") in the Name field
2. Select a future date in the Date field
3. Open Branch dropdown and select two or more branches (e.g., "Pune" and "Satara")
4. Click Submit
   - expect: Success toast appears
   - expect: New row appears with both selected branches shown as badges in the Branch column

---

### 3. Form Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit empty form shows validation errors for Name and Date

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to the Holiday Master page and click Submit without filling any field
   - expect: Inline validation error "Please enter Holiday" appears below the Name field
   - expect: Inline validation error "Date is required" appears below the Date field
   - expect: No holiday is added to the table
   - expect: The form stays open (does not submit)

#### 3.2. TC-VAL-02: Submit with Name only (Date empty) shows Date validation error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a name in the Name field, leave Date empty, and click Submit
   - expect: Inline validation error "Date is required" appears below the Date field
   - expect: No validation error for Name
   - expect: Holiday is not added to the table

#### 3.3. TC-VAL-03: Submit with Date only (Name empty) shows Name validation error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Leave the Name field empty, select a valid future date, and click Submit
   - expect: Inline validation error "Please enter Holiday" appears below the Name field
   - expect: No validation error for Date
   - expect: Holiday is not added to the table

#### 3.4. TC-VAL-04: Past date is not selectable in the Date field

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click the Date field and attempt to select or enter a past date (e.g., yesterday)
   - expect: The native date picker disables dates before today (the `min` attribute is set to today)
   - expect: If a past date is manually typed, the form should not accept it on Submit
   - expect: Validation message appears or the field value is rejected

#### 3.5. TC-VAL-05: Current date (today) is not accepted in the Date field

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Attempt to set the Date field to today's date and click Submit
   - expect: The app rejects today's date (only future dates are allowed per the placeholder "Select a future date for the holiday")
   - expect: A validation error or warning appears indicating today's date is not valid

#### 3.6. TC-VAL-06: Valid future date is accepted

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a valid name and select a date that is at least 1 day in the future, then click Submit
   - expect: No date validation error appears
   - expect: The form submits successfully with a success toast

#### 3.7. TC-VAL-07: Name field accepts special characters and long input

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a holiday name with special characters (e.g., "New Year's Eve – 2027") and a valid future date, then click Submit
   - expect: The form submits successfully
   - expect: The holiday name is saved and displayed correctly in the table

---

### 4. Clear Button

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-CLR-01: Clear button resets all form fields

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a name in the Name field, select a future date, select a branch in Branch dropdown
2. Click the Clear button
   - expect: The Name field is cleared (empty)
   - expect: The Date field is cleared (empty)
   - expect: The Branch dropdown resets to empty/placeholder state
   - expect: No holiday is added to the table

#### 4.2. TC-CLR-02: Clear button also removes validation errors

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click Submit on an empty form to trigger validation errors
   - expect: "Please enter Holiday" and "Date is required" appear
2. Click the Clear button
   - expect: All validation error messages disappear
   - expect: All fields are reset to empty

---

### 5. Edit Holiday

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-EDIT-01: Clicking Edit pre-populates the form with the holiday's data

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Identify a record in the table (e.g., row 1 with name "Teste", date "Jun 6, 2026", branch "Pune")
2. Click the Edit icon (pencil SVG with title="Edit") in the Action column for that row
   - expect: The Name field in the "Add Holiday" form is populated with the holiday's name
   - expect: The Date field is populated with the holiday's date
   - expect: The Branch dropdown reflects the holiday's branch(es)
   - expect: The form heading or button may change to indicate "Edit" mode (if applicable)

#### 5.2. TC-EDIT-02: Successfully updating a holiday name via Edit

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click the Edit icon on an existing holiday row
   - expect: Form is pre-populated
2. Clear the Name field, type a new name (e.g., "Updated Holiday Name"), and click Submit
   - expect: A success toast appears
   - expect: The holiday's name in the table updates to the new value
   - expect: Date and Branch remain unchanged

#### 5.3. TC-EDIT-03: Successfully updating the date of a holiday via Edit

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click Edit on a holiday, change the Date to a different valid future date, and click Submit
   - expect: Success toast appears
   - expect: The Date column in the table reflects the updated date

#### 5.4. TC-EDIT-04: Successfully updating the branch via Edit

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click Edit on a holiday that has specific branches selected, add or remove a branch, and click Submit
   - expect: Success toast appears
   - expect: The Branch column in the table reflects the updated branch selection

#### 5.5. TC-EDIT-05: Edit form validation — Name cannot be empty on update

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click Edit on an existing holiday, clear the Name field entirely, and click Submit
   - expect: Validation error "Please enter Holiday" appears
   - expect: The holiday record is not updated

#### 5.6. TC-EDIT-06: Edit form validation — past/current date not accepted on update

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click Edit on an existing holiday, change the Date to today or a past date, and click Submit
   - expect: The date input prevents or rejects the invalid date
   - expect: An appropriate validation error appears
   - expect: The record is not updated with the invalid date

---

### 6. Branch Dropdown Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-BR-01: Branch dropdown loads all active branches from Branch Master

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click the Branch (Optional) dropdown in the Add Holiday form
   - expect: The dropdown opens and displays a list of branch options
   - expect: All options shown correspond to active branches in the Branch Master
   - expect: Inactive branches from Branch Master are NOT shown in the dropdown

#### 6.2. TC-BR-02: Branch dropdown supports multi-select

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Open the Branch dropdown and select multiple branches one by one
   - expect: Each selected branch appears as a badge/chip inside the dropdown input
   - expect: The dropdown remains open after selecting each branch (allowing multiple selections)
2. Close the dropdown
   - expect: All selected branches are shown as chips in the input

#### 6.3. TC-BR-03: Branch dropdown allows deselecting a previously selected branch

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Open the Branch dropdown and select two branches (e.g., "Pune" and "Satara")
2. Remove one branch by clicking the × on its badge/chip
   - expect: The removed branch disappears from the selection
   - expect: The other branch remains selected

#### 6.4. TC-BR-04: Leaving Branch empty applies holiday to All Branches

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Submit a valid holiday without selecting any branch
   - expect: In the table, the Branch column for the new holiday shows "All Branches"

#### 6.5. TC-BR-05: Branch filter in the table filters records correctly

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to Holiday Master page and locate the Branch filter in the table toolbar
2. Click the Branch filter dropdown and select a specific branch (e.g., "Pune")
   - expect: The table updates to show only holidays assigned to "Pune" (including "All Branches" holidays)
   - expect: Holidays assigned exclusively to other branches (e.g., "Satara" only) are hidden

---

### 7. Status Filter and Search

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-STS-01: Status filter — All shows records of all statuses

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Set the Status filter (id="status-filter") to "All"
   - expect: The table displays both Active and Inactive holidays
   - expect: Green "Active" and red "Inactive" badges are visible in the Status column

#### 7.2. TC-STS-02: Status filter — Active shows only active holidays

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Set the Status filter to "Active"
   - expect: The table displays only rows with "Active" status
   - expect: No "Inactive" badges appear in the Status column

#### 7.3. TC-STS-03: Status filter — Inactive shows only inactive holidays

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Set the Status filter to "Inactive"
   - expect: The table displays only rows with "Inactive" status
   - expect: No "Active" badges appear in the Status column

#### 7.4. TC-SRC-01: Search by holiday name filters the table

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Type a known holiday name (e.g., "Diwali") in the Search input (placeholder: "Search Holiday Name")
   - expect: The table updates to show only holidays whose name matches the search term
   - expect: Rows that do not match are hidden

#### 7.5. TC-SRC-02: Search with partial name returns matching results

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Type a partial name (e.g., "Test") in the Search input
   - expect: All holidays with "Test" in the name are shown
   - expect: Holidays without "Test" in the name are hidden

#### 7.6. TC-SRC-03: Search with a non-existent name returns no records

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Type a non-existent holiday name (e.g., "XXXX_NO_MATCH") in the Search input
   - expect: The table shows an empty state or "No records" message
   - expect: No data rows are visible

#### 7.7. TC-SRC-04: Clearing the Search input restores full list

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Type a search term to filter the table, then clear the Search input
   - expect: All holidays (matching the current Status/Branch filter) reappear
   - expect: The table reverts to showing all records

#### 7.8. TC-COMB-01: Combining Status filter and Search

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Set Status filter to "Active" and type a partial name in Search
   - expect: Only Active holidays whose name matches the search term are shown
   - expect: Inactive holidays and non-matching Active holidays are hidden

---

### 8. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-PAG-01: Default rows per page is 10

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to Holiday Master and inspect the table toolbar
   - expect: The Show dropdown (id="rows-per-page") defaults to "10"
   - expect: At most 10 rows are visible in the table

#### 8.2. TC-PAG-02: Changing rows per page to 25 shows more records

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Change the Show dropdown to "25"
   - expect: The table displays up to 25 records per page
   - expect: If more than 10 but fewer than 25 holidays exist, all fit on one page

#### 8.3. TC-PAG-03: Rows per page options are 10, 25, 50, 100

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Click the Show dropdown and inspect the options
   - expect: The dropdown contains exactly: 10, 25, 50, 100

#### 8.4. TC-PAG-04: Navigate to the next page using pagination

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. With at least 11 records visible (Show = 10), click the "2" page button in the pagination controls
   - expect: The table navigates to page 2 showing the next set of records
   - expect: The page 2 button appears active in the pagination controls
2. Click the "1" page button
   - expect: The table returns to page 1

---

### 9. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-NAV-01: Holiday Master is accessible via the Attendance sidebar menu

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Log in and click "Attendance" in the left sidebar navigation menu to expand it
   - expect: The Attendance submenu expands showing multiple options
   - expect: A "Holiday" link is visible in the expanded submenu
2. Click the "Holiday" link
   - expect: The browser navigates to `https://stage.elevatorplus.net/attendance/holiday`
   - expect: The Holiday Master page loads with the form and table

#### 9.2. TC-NAV-02: Unauthenticated users cannot access the Holiday Master page

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Without logging in (or after logging out), navigate directly to `https://stage.elevatorplus.net/attendance/holiday`
   - expect: The user is redirected to the login page
   - expect: The Holiday Master form and table are not accessible without authentication

#### 9.3. TC-NAV-03: Direct URL navigation works when authenticated

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. While authenticated, navigate directly to `https://stage.elevatorplus.net/attendance/holiday`
   - expect: The page loads successfully without redirecting
   - expect: The Add Holiday form and data table are fully visible and functional

---

### 10. Edge Cases

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-EDGE-01: Duplicate holiday name is handled

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Create a holiday with a specific name and future date (e.g., "Test Holiday Dup", 10 days from now)
2. Attempt to create another holiday with the exact same name on a different date
   - expect: Either the form accepts it (if duplicates are allowed) and adds the second record, OR shows a duplicate error message — verify and document the actual behavior

#### 10.2. TC-EDGE-02: Very long holiday name

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a very long name (e.g., 200 characters) in the Name field, select a valid date, and click Submit
   - expect: The app either accepts the long name or shows a max-length validation error
   - expect: If accepted, the name is visible (possibly truncated) in the Holiday column of the table

#### 10.3. TC-EDGE-03: Holiday added with the earliest possible future date (tomorrow)

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Enter a valid name and set the Date to tomorrow (1 day in the future), then Submit
   - expect: The holiday is created successfully
   - expect: The date displays correctly in the table as the next day's date

#### 10.4. TC-EDGE-04: Page refresh retains table data

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Navigate to the Holiday Master page, note the records in the table
2. Reload the page (F5 / browser refresh)
   - expect: The table reloads and shows the same set of holidays
   - expect: The Add Holiday form is reset to empty state
   - expect: No in-progress form data is retained after reload

#### 10.5. TC-EDGE-05: No results when Status filter returns empty set

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Steps:**
1. Apply a combination of filters (Branch + Status) that results in no matching records (e.g., a branch with no inactive holidays, filtered by "Inactive")
   - expect: The table shows an empty state or "No records found" message
   - expect: No data rows are visible
   - expect: Pagination controls are hidden or show page 1 only

---

### 11. Duplicate Date Validation — Add Holiday

The app must prevent conflicting holidays on the same date. The duplicate check is date + branch scoped: two holidays on the same date are a conflict if they share the same branch coverage (or one covers "All Branches").

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-DUP-ADD-01: Adding a holiday for a date already occupied by an Active holiday (All Branches) shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** An **Active** holiday already exists for a specific date with no branch selected (applies to All Branches).

**Steps:**
1. In the Add Holiday form, enter a different name but select the same date as the existing Active holiday, leave Branch empty
2. Click Submit
   - expect: An error message appears indicating a holiday already exists for that date (e.g., "Holiday already exists for this date" or similar)
   - expect: The new holiday is NOT added to the table
   - expect: The form stays open with the entered values

#### 11.2. TC-DUP-ADD-02: Adding a holiday for a date already occupied by an Inactive holiday (All Branches) shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** An **Inactive** holiday already exists for a specific date with no branch selected (applies to All Branches).

**Steps:**
1. In the Add Holiday form, enter a name and select the same date as the existing Inactive holiday, leave Branch empty
2. Click Submit
   - expect: An error message appears — the app should reject the duplicate even if the existing record is Inactive
   - expect: The new holiday is NOT added to the table
   - expect: The form stays open

#### 11.3. TC-DUP-ADD-03: Adding a holiday for a date+branch where the same branch+date already has an Active record shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** An **Active** holiday already exists for date D assigned to branch "Pune".

**Steps:**
1. In the Add Holiday form, enter a name, select date D, select branch "Pune"
2. Click Submit
   - expect: An error message appears indicating the branch already has a holiday on that date
   - expect: The new holiday is NOT added

#### 11.4. TC-DUP-ADD-04: Adding a holiday for a date+branch where the same branch+date already has an Inactive record shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** An **Inactive** holiday exists for date D assigned to branch "Pune".

**Steps:**
1. In the Add Holiday form, enter a name, select date D, select branch "Pune"
2. Click Submit
   - expect: An error message appears — duplicate check applies regardless of the existing record's status (Active or Inactive)
   - expect: The new holiday is NOT added

#### 11.5. TC-DUP-ADD-05: Adding a holiday for the same date but a different branch is allowed

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** A holiday already exists for date D assigned to branch "Pune" (not All Branches).

**Steps:**
1. In the Add Holiday form, enter a name, select the same date D, select a different branch (e.g., "Satara")
2. Click Submit
   - expect: The form submits successfully with a success toast
   - expect: The new holiday for "Satara" on date D is added to the table
   - expect: Both the "Pune" holiday and the new "Satara" holiday appear in the table for date D

#### 11.6. TC-DUP-ADD-06: Adding a holiday with a specific branch when an "All Branches" holiday already exists for that date shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** A holiday already exists for date D with no branch (applies to All Branches — either Active or Inactive).

**Steps:**
1. In the Add Holiday form, enter a name, select the same date D, select any specific branch (e.g., "Pune")
2. Click Submit
   - expect: An error message appears — since the existing "All Branches" holiday already covers "Pune", adding another holiday for the same date+branch conflicts
   - expect: The new holiday is NOT added

#### 11.7. TC-DUP-ADD-07: Adding a holiday for "All Branches" when a branch-specific holiday already exists for that date shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** A holiday already exists for date D assigned to branch "Pune".

**Steps:**
1. In the Add Holiday form, enter a name, select the same date D, leave Branch empty (All Branches)
2. Click Submit
   - expect: An error message appears — an "All Branches" holiday would conflict with the existing branch-specific holiday on the same date
   - expect: The new holiday is NOT added

---

### 12. Duplicate Date Validation — Edit (Update) Holiday

The same duplicate checks that apply on Add must also apply when editing an existing holiday's date or branch.

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-DUP-EDIT-01: Updating a holiday's date to match an existing Active holiday (All Branches) shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 (All Branches, Active). Holiday B exists for date D2 (different date, any branch).

**Steps:**
1. Click the Edit icon for Holiday B
   - expect: Form pre-populates with Holiday B's data
2. Change Holiday B's date to D1 (the date already used by Active Holiday A) and click Submit
   - expect: An error message appears indicating a holiday already exists for that date
   - expect: Holiday B's date is NOT updated — it retains its original date D2

#### 12.2. TC-DUP-EDIT-02: Updating a holiday's date to match an existing Inactive holiday (All Branches) shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 (All Branches, **Inactive**). Holiday B exists for date D2.

**Steps:**
1. Click Edit for Holiday B, change its date to D1, and click Submit
   - expect: An error message appears — the conflict check covers both Active and Inactive records
   - expect: Holiday B's date is NOT updated

#### 12.3. TC-DUP-EDIT-03: Updating a holiday's branch to a branch that already has a holiday on the same date shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 assigned to "Pune" (Active). Holiday B exists for the same date D1 assigned to "Satara".

**Steps:**
1. Click Edit for Holiday B (currently "Satara" on D1), change its branch to "Pune", and click Submit
   - expect: An error message appears — "Pune" already has a holiday on D1
   - expect: Holiday B's branch is NOT updated

#### 12.4. TC-DUP-EDIT-04: Updating a holiday's branch to a branch that already has an Inactive holiday on the same date shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 assigned to "Pune" (**Inactive**). Holiday B exists for the same date D1 assigned to "Satara".

**Steps:**
1. Click Edit for Holiday B, change its branch from "Satara" to "Pune", and click Submit
   - expect: An error message appears — duplicate check applies regardless of the existing record being Inactive
   - expect: Holiday B is NOT updated

#### 12.5. TC-DUP-EDIT-05: Updating a holiday to a different branch on the same date is allowed when no conflict exists

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 assigned to "Pune". Holiday B exists for date D1 assigned to "Satara". No holiday exists for "Kolhapur" on D1.

**Steps:**
1. Click Edit for Holiday B (currently "Satara" on D1), change its branch to "Kolhapur", and click Submit
   - expect: The update succeeds with a success toast
   - expect: Holiday B's Branch column now shows "Kolhapur"
   - expect: No error message appears

#### 12.6. TC-DUP-EDIT-06: Updating a holiday's date to a date that has an "All Branches" holiday shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 with no branch (All Branches, Active or Inactive). Holiday B is a specific-branch holiday on a different date D2.

**Steps:**
1. Click Edit for Holiday B, change its date to D1, and click Submit
   - expect: An error message appears — the All Branches holiday on D1 conflicts with any branch-specific holiday on the same date
   - expect: Holiday B is NOT updated

#### 12.7. TC-DUP-EDIT-07: Updating a branch-specific holiday to "All Branches" when another holiday exists on the same date shows an error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Holiday A exists for date D1 assigned to "Pune". Holiday B exists for date D1 assigned to "Satara".

**Steps:**
1. Click Edit for Holiday B, remove its branch selection (make it All Branches) and click Submit
   - expect: An error message appears — changing to All Branches on D1 would conflict with Holiday A which also exists on D1
   - expect: Holiday B is NOT updated

#### 12.8. TC-DUP-EDIT-08: Saving an edited holiday without changing the date or branch does not trigger a duplicate error

**File:** `tests/attendance-module/holiday-master.spec.ts`

**Pre-condition:** Any existing holiday in the table.

**Steps:**
1. Click Edit for any holiday, change only the Name (leave Date and Branch as-is), and click Submit
   - expect: The update succeeds with a success toast
   - expect: The name is updated in the table
   - expect: No duplicate error is shown — a record should not conflict with itself
