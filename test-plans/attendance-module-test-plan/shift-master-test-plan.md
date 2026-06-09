# Shift Master Test Plan

## Application Overview

The Shift Master page is part of the ElevatorPlus Attendance module, accessible at `https://stage.elevatorplus.net/attendance/shift`. It allows admins to create and manage work shift records that are used for employee attendance tracking.

**Page heading (navbar):** "Shift Master"

The page is divided into two sections:

### Add Shift Form (top of page)

**Form heading:** "Add Shift" — always visible inline (not a modal or drawer).

| Field | Type | Required | Helper Text |
|---|---|---|---|
| Shift Name | Text input (`textbox "Shift Name *"`) | Yes | "Enter Shift" |
| Start Time | Time input (`textbox "Start Time *"`) | Yes | "Select start time" |
| End Time | Time input (`textbox "End Time *"`) | Yes | "Select end time" |
| Full Day Hours | Number input (`spinbutton "Full Day Hours *"`) | Yes | "Enter hours" |
| Half Day Hours | Number input (`spinbutton "Half Day Hours *"`) | Yes | "Enter hours" |

**Form buttons:**
- **Clear** — resets all fields to blank
- **Submit** — submits the form and adds the record to the table

**Business rules enforced by the form:**
1. End time must be greater than (after) start time.
2. Full day hours must be greater than half day hours.
3. Start time and end time minutes must be one of: `00`, `15`, or `30` — no other minute values are accepted.
4. Shift name must be unique. **Known bug:** the app currently accepts the same shift name differing only in letter case (e.g., "Morning Shift" and "morning shift" are saved as two separate records). The expected behaviour is case-insensitive uniqueness enforcement.

### Data Table (below the form)

The table uses `react-dataTable` and renders rows as `div[role="row"]`.

**Columns:** Sr. No., Action, Shift Name, Start Time, End Time, Status, Working Hours

- **Action column:** Contains an **Edit** icon (pencil SVG, `title="Edit"`). Clicking it switches the form to "Update Shift" mode and pre-fills all fields.
- **Start Time / End Time columns:** Display in 12-hour AM/PM format (e.g., "9:00 AM", "5:30 PM").
- **Status column:** `Active` or `Inactive` badge, wrapped in an `<h5>` element.
- **Working Hours column:** Shows the calculated shift duration followed by min-thresholds in the format `H.MM (min:- FDH : X, HDH : Y)`, where FDH = Full Day Hours and HDH = Half Day Hours.

**Table toolbar:**
- **Show:** rows-per-page dropdown (options: 10, 25, 50, 100; default 25)
- **Status:** select dropdown (All, Active, Inactive; default Active)
- **Export Excel:** button to export the current table view
- **Search:** text input, placeholder "Search Shift Name"

**Pagination:** numbered page buttons below the table.

**Edit mode additional field:**
When the Edit icon is clicked the form heading changes to "Update Shift", all fields are pre-filled, a **Status \*** dropdown (options: Active, Inactive) appears, and the action button changes to "Update".

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Shift Master page loads successfully

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/attendance/shift`
   - expect: Page URL is `https://stage.elevatorplus.net/attendance/shift`
   - expect: Page title is `ElevatorPlus`
   - expect: Navbar heading "Shift Master" is visible
   - expect: Form heading "Add Shift" is visible
   - expect: Shift Name input is present and empty
   - expect: Start Time input is present and empty
   - expect: End Time input is present and empty
   - expect: Full Day Hours input is present and empty
   - expect: Half Day Hours input is present and empty
   - expect: "Clear" and "Submit" buttons are visible
   - expect: Data table loads with columns: Sr. No., Action, Shift Name, Start Time, End Time, Status, Working Hours

#### 1.2. TC-SM-02: Verify table toolbar elements

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`
   - expect: Show dropdown defaults to "25"
   - expect: Status filter defaults to "Active"
   - expect: "Export Excel" button is visible
   - expect: Search input with placeholder "Search Shift Name" is visible
   - expect: Table displays rows with all required columns

---

### 2. Add Shift — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new shift with valid data

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`
   - expect: "Add Shift" form is visible with empty fields
2. Fill Shift Name with a unique name (e.g., `Morning Shift Test`)
3. Set Start Time to `09:00 AM`
4. Set End Time to `05:00 PM`
5. Fill Full Day Hours with `8`
6. Fill Half Day Hours with `4`
7. Click "Submit"
   - expect: Success toast "Shift created successfully!" appears
   - expect: All form fields are cleared after submission
   - expect: Form heading remains "Add Shift"
   - expect: New record appears in the table with correct Shift Name, Start Time (9:00 AM), End Time (5:00 PM), Status "Active"

#### 2.2. TC-ADD-02: Create a shift spanning midnight (overnight shift)

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name `Night Shift Test`, Start Time `10:00 PM`, End Time `06:00 AM`, Full Day Hours `8`, Half Day Hours `4`
   - expect: Fields accept the overnight time values
2. Click "Submit"
   - expect: Success toast appears and record is created

#### 2.3. TC-ADD-03: Create a shift with minimum valid duration (30 minutes)

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name `Short Test Shift`, Start Time `08:00 AM`, End Time `08:30 AM`, Full Day Hours `0.5`, Half Day Hours `0.25`
2. Click "Submit"
   - expect: Shift is created successfully

---

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with all fields empty shows validation errors

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click "Submit" without filling any fields
   - expect: Validation error(s) appear for all required fields (Shift Name, Start Time, End Time, Full Day Hours, Half Day Hours)
   - expect: No record is added to the table

#### 3.2. TC-VAL-02: Submit with empty Shift Name shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, leave Shift Name empty, fill valid Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Inline validation error appears below Shift Name
   - expect: No record is created

#### 3.3. TC-VAL-03: Submit without Start Time shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, leave Start Time empty, fill End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error appears for Start Time
   - expect: No record is created

#### 3.4. TC-VAL-04: Submit without End Time shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, Start Time `09:00 AM`, leave End Time empty, fill Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error appears for End Time
   - expect: No record is created

#### 3.5. TC-VAL-05: Submit without Full Day Hours shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, Start Time `09:00 AM`, End Time `05:00 PM`, leave Full Day Hours empty, fill Half Day Hours `4`, click "Submit"
   - expect: Validation error appears for Full Day Hours
   - expect: No record is created

#### 3.6. TC-VAL-06: Submit without Half Day Hours shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `8`, leave Half Day Hours empty, click "Submit"
   - expect: Validation error appears for Half Day Hours
   - expect: No record is created

#### 3.7. TC-VAL-07: Validation errors clear when valid input is entered

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click "Submit" without filling any fields
   - expect: Validation errors are shown
2. Fill all fields with valid values
   - expect: Validation errors disappear
3. Click "Submit"
   - expect: Success toast appears and record is created

---

### 4. Time Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-TIME-01: End time must be after start time — submitting reversed times shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name with a unique name, set Start Time to `05:00 PM`, set End Time to `09:00 AM` (end before start for the same day), fill Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error or toast error appears indicating end time must be after start time
   - expect: No record is created

#### 4.2. TC-TIME-02: Start time equal to end time shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name with a unique name, set Start Time to `09:00 AM`, set End Time to `09:00 AM`, fill Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error appears (equal times are not a valid shift)
   - expect: No record is created

#### 4.3. TC-TIME-03: Only 00, 15, or 30 minutes are accepted for Start Time

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, attempt to set Start Time minutes to `45` (e.g., `09:45 AM`), fill End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error appears indicating only 00, 15, or 30 minute values are allowed
   - expect: No record is created
2. Attempt minutes `10` (e.g., `09:10 AM`)
   - expect: Same validation error
3. Attempt minutes `05` (e.g., `09:05 AM`)
   - expect: Same validation error

#### 4.4. TC-TIME-04: Only 00, 15, or 30 minutes are accepted for End Time

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, set Start Time to `09:00 AM`, attempt End Time with minutes `45` (e.g., `05:45 PM`), Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Validation error appears for invalid end time minutes
   - expect: No record is created

#### 4.5. TC-TIME-05: Valid minute values (00, 15, 30) are accepted for both times

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name `Valid Minutes Test`, Start Time `09:15 AM`, End Time `05:30 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Record is created successfully (both :15 and :30 minutes are accepted)
2. Clear form, fill Shift Name `Valid Zero Test`, Start Time `08:00 AM`, End Time `04:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Record is created successfully (:00 minutes accepted)

---

### 5. Hours Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-HRS-01: Full day hours must be greater than half day hours — equal values show error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name with a unique name, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `4`, Half Day Hours `4` (equal values), click "Submit"
   - expect: Validation error appears indicating full day hours must be greater than half day hours
   - expect: No record is created

#### 5.2. TC-HRS-02: Half day hours greater than full day hours shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name with a unique name, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `3`, Half Day Hours `5` (half > full), click "Submit"
   - expect: Validation error appears indicating full day hours must exceed half day hours
   - expect: No record is created

#### 5.3. TC-HRS-03: Full day hours greater than half day hours is accepted

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name `Hours Valid Test`, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Record is created successfully

#### 5.4. TC-HRS-04: Zero value for Full Day Hours shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill Shift Name, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `0`, Half Day Hours `0`, click "Submit"
   - expect: Validation error is shown for invalid hours values

---

### 6. Duplicate Prevention and Case Sensitivity

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-DUP-01: Submitting an existing shift name shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift` and note an existing shift name in the table (e.g., "General Shift")
2. Fill Shift Name `General Shift`, Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: Error toast "Something went wrong." (or equivalent) appears
   - expect: No duplicate record is added to the table

#### 6.2. TC-DUP-02: Submitting an existing shift name in different case — known bug

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift` and note an existing Active shift name, e.g., "General Shift"
2. Fill Shift Name `general shift` (all lowercase), Start Time `09:00 AM`, End Time `05:00 PM`, Full Day Hours `8`, Half Day Hours `4`, click "Submit"
   - expect: **EXPECTED (correct behaviour):** Error toast appears because shift names should be unique regardless of case
   - expect: **ACTUAL (known bug):** App currently accepts "general shift" as a new record even though "General Shift" already exists

#### 6.3. TC-DUP-03: Submitting existing shift name in UPPERCASE — known bug

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift` and note an existing Active shift name, e.g., "General Shift"
2. Fill Shift Name `GENERAL SHIFT` (all uppercase), fill valid time and hours, click "Submit"
   - expect: **EXPECTED (correct behaviour):** Duplicate error is returned
   - expect: **ACTUAL (known bug):** App currently creates the record

#### 6.4. TC-DUP-04: Submitting existing shift name in mixed case — known bug

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift` and note an existing shift name, e.g., "General Shift"
2. Fill Shift Name `gEnErAl ShIfT`, fill valid time and hours, click "Submit"
   - expect: **EXPECTED (correct behaviour):** Duplicate error is returned
   - expect: **ACTUAL (known bug):** App may currently create the record

---

### 7. Clear Button Behaviour

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-CLR-01: Clear button resets the Add Shift form

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, fill all fields with valid data
   - expect: All fields contain values
2. Click "Clear"
   - expect: Shift Name, Start Time, End Time, Full Day Hours, and Half Day Hours are cleared
   - expect: Form heading remains "Add Shift"
   - expect: No toast or error is shown

#### 7.2. TC-CLR-02: Clear button in Edit mode resets form to Add Shift state

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click the Edit icon on any record
   - expect: Form heading changes to "Update Shift"; all fields are pre-filled; Status dropdown is visible; action button reads "Update"
2. Click "Clear"
   - expect: Form reverts to "Add Shift" mode with all fields empty
   - expect: Status dropdown is no longer visible
   - expect: Action button reverts to "Submit"

---

### 8. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-EDT-01: Edit icon opens the shift record in edit mode

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click the Edit icon on any row
   - expect: Form heading changes to "Update Shift"
   - expect: Shift Name, Start Time, End Time, Full Day Hours, Half Day Hours are pre-filled with the row's current values
   - expect: Status dropdown (Active / Inactive) appears and shows current status
   - expect: Action button changes to "Update"

#### 8.2. TC-EDT-02: Successfully update shift name and times

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click Edit on an existing record, change Shift Name to a unique new name, change End Time to a valid new value, click "Update"
   - expect: Success toast "Shift updated successfully!" appears
   - expect: Form resets to "Add Shift" mode with empty fields
   - expect: Updated values are reflected in the data table

#### 8.3. TC-EDT-03: Update shift status to Inactive

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click Edit on any Active shift, set Status to "Inactive", click "Update"
   - expect: Success toast appears
2. Verify with Status filter set to "All"
   - expect: The record now shows an "Inactive" badge

#### 8.4. TC-EDT-04: Re-activate an Inactive shift

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Set Status filter to "Inactive", click Edit on an Inactive shift, change Status to "Active", click "Update"
   - expect: Shift reappears in the Active-filtered table

#### 8.5. TC-EDT-05: Update with empty Shift Name shows validation error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click Edit on any record, clear the Shift Name field, click "Update"
   - expect: Inline validation error appears for Shift Name
   - expect: No update is saved

#### 8.6. TC-EDT-06: Update shift name to an existing shift name shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, note two existing Active shift names (e.g., "General Shift" and "Short Shift")
2. Click Edit on "Short Shift", change its name to "General Shift", click "Update"
   - expect: Error toast appears
   - expect: Original name is preserved in the table

#### 8.7. TC-EDT-07: Update with invalid time values shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click Edit on any record, change End Time to a value with invalid minutes (e.g., 45), click "Update"
   - expect: Validation error appears for invalid time minutes
   - expect: No update is saved

#### 8.8. TC-EDT-08: Update with full day hours less than half day hours shows error

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click Edit on any record, set Full Day Hours to `2`, Half Day Hours to `5`, click "Update"
   - expect: Validation error appears
   - expect: No update is saved

---

### 9. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-FLT-01: Status filter defaults to Active

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`
   - expect: Status filter shows "Active" selected
   - expect: All visible rows show "Active" status badge

#### 9.2. TC-FLT-02: Filter table to show all statuses

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Change Status filter to "All"
   - expect: Both Active and Inactive records are displayed

#### 9.3. TC-FLT-03: Filter table to show only Inactive records

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Change Status filter to "Inactive"
   - expect: Only Inactive records are shown, or an empty state if none exist

---

### 10. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-SRC-01: Search by partial shift name returns matching results

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, type `Shift` in the Search input
   - expect: Table filters to show only records whose Shift Name contains "Shift"

#### 10.2. TC-SRC-02: Search is case-insensitive

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, type `general` (lowercase) in the Search input
   - expect: Records matching "General" (regardless of case) are shown

#### 10.3. TC-SRC-03: Search with a non-existent name returns no results

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Type `XYZNONEXISTENTSHIFT999` in the Search input
   - expect: Table shows no rows or an empty-state message

#### 10.4. TC-SRC-04: Clearing the search restores the full filtered list

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Type a search term, then clear the search input
   - expect: The full Active list is restored

---

### 11. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, change Show to "10"
   - expect: Up to 10 rows are displayed per page

#### 11.2. TC-PAG-02: Navigate between pages when multiple pages exist

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. If record count exceeds rows-per-page, click "Next page"
   - expect: Next page of records loads
2. Click "Previous page"
   - expect: Previous page is restored

---

### 12. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-SRT-01: Sort table by Shift Name

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`, click "Shift Name" column header
   - expect: Table re-sorts alphabetically A→Z
2. Click "Shift Name" again
   - expect: Sort reverses to Z→A

#### 12.2. TC-SRT-02: Sort table by Start Time

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click "Start Time" column header
   - expect: Table re-sorts by start time ascending
2. Click "Start Time" again
   - expect: Sort reverses to descending

#### 12.3. TC-SRT-03: Sort table by End Time

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click "End Time" column header
   - expect: Table re-sorts by end time ascending
2. Click "End Time" again
   - expect: Sort reverses to descending

#### 12.4. TC-SRT-04: Sort table by Status (when All filter is active)

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Set Status filter to "All", click "Status" column header
   - expect: Records are grouped by status value

#### 12.5. TC-SRT-05: Sort table by Working Hours

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Click "Working Hours" column header
   - expect: Table re-sorts by calculated working hours ascending
2. Click "Working Hours" again
   - expect: Sort reverses to descending

---

### 13. Export Excel

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-EXP-01: Export Excel button triggers a file download

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Navigate to `/attendance/shift`
   - expect: "Export Excel" button is visible
2. Click "Export Excel"
   - expect: A file download is triggered (`.xlsx` or `.xls` format)
   - expect: No error toast appears

---

### 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-NAV-01: Accessing Shift Master without authentication redirects to login

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Open an unauthenticated browser and navigate directly to `https://stage.elevatorplus.net/attendance/shift`
   - expect: User is redirected to the login page

#### 14.2. TC-NAV-02: Access Shift Master via sidebar navigation

**File:** `tests/attendance-module/shift-master.spec.ts`

**Steps:**
1. Log in, click "Attendance" in the sidebar to expand the submenu
   - expect: "Shift Master" link is visible under Attendance
2. Click "Shift Master"
   - expect: Page navigates to `/attendance/shift`
   - expect: "Add Shift" form and data table are visible
