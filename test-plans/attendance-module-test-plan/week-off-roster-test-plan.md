# Week Off Roster Test Plan

## Application Overview

The Week Off Roster page is part of the ElevatorPlus Attendance module, accessible at `https://stage.elevatorplus.net/attendance/week-off-roster`. It allows Admins and HR users to manually assign or remove weekly off days for individual active employees on a week-by-week basis.

**Page heading:** "Week Off Roster"
**Page subtitle:** "Manage weekly off schedules for employees"

---

### Page Layout

#### Toolbar (above the table)

| Element | Type | Description |
|---|---|---|
| `<` (Previous week) | Icon button | Navigates to the previous week |
| Week range label | Text | Displays current week range e.g., "Jun 1 to Jun 7, 2026" |
| `>` (Next week) | Icon button | Navigates to the next week |
| Date | Native date input | Selecting any date navigates the table to the week containing that date |
| Search Employee Name | Text input | Filters the employee list by name (real-time search) |
| ⓘ (Info icon) | Icon button | Opens a help/information side panel about the Week Off Roster |

#### Data Table

Displays all active users as rows. One row per user.

**Columns:** Sr. No., Employee Name, Mon [date], Tue [date], Wed [date], Thu [date], Fri [date], Sat [date], Sun [date]

All columns have sort buttons (ascending/descending).

---

### Cell Types

| Cell Display | Button State | Interactive? | Meaning |
|---|---|---|---|
| `-` (future/today) | `button "-"` with `title="Click to mark weekly off"`, `cursor=pointer` | Yes — click to add week off | Date is available, can be marked as week off |
| `-` (past date) | `button "-"` without `cursor=pointer` | No — read-only | Past date, cannot retroactively add week off |
| `Week Off` (pink badge, enabled) | `button "Week Off"` with `title="Click to remove this weekly off"`, `cursor=pointer` | Yes — click to remove | Manually assigned week off, can be removed |
| `Week Off` (pink badge, disabled) | `button "Week Off" [disabled]` | No — read-only | Week off configured in User Master for that user's weekly off day — cannot be removed from the roster |
| Holiday name (red text) | `heading [level=6]` with holiday name | No — read-only | Company holiday from Holiday Master, non-editable |

---

### Legend (Note bar below toolbar)

- **Pink "Week Off" badge** → "Weekly off (from user settings or manually marked)"
- **Red text** (Holiday) → "Company holiday (non-editable)"
- **"-"** → "Available - Click to mark weekly off"

---

### Business Rules

1. **Past dates are read-only**: "-" cells for past dates cannot be clicked to add week off.
2. **Holidays are non-editable**: When a company holiday exists for a date, that date cell shows the holiday name (red h6 text) and cannot be marked as week off.
3. **User Master week offs are non-editable in roster**: Week offs configured per-user in the User Master (e.g., Sunday as the user's weekly off day) appear as a disabled pink badge and cannot be removed from this page — they must be changed in the User Master itself.
4. **Only manually-added week offs can be removed**: Clicking an enabled "Week Off" badge (title="Click to remove this weekly off") removes the week off.
5. **Week off impacts attendance reports**: When a day is marked as week off for a user (either from User Master or manually via roster), it shows as "Week Off" (not "Absent") in the Daily Attendance Report, Monthly Attendance Report, and Summary Report for that date.
6. **User Master week off repeats every week**: A week off day configured in User Master appears as a disabled badge on that day for every week viewed in the roster.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Week Off Roster page loads successfully

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/attendance/week-off-roster`
   - expect: Page URL contains `/attendance/week-off-roster`
   - expect: Page heading "Week Off Roster" is visible
   - expect: Page subtitle "Manage weekly off schedules for employees" is visible
   - expect: Week range label (e.g., "Jun 1 to Jun 7, 2026") is visible
   - expect: Previous week `<` button is visible
   - expect: Next week `>` button is visible
   - expect: Date input field is visible and shows a date in MM/DD/YYYY format
   - expect: "Search Employee Name" search input is visible
   - expect: Table loads with employee rows

#### 1.2. TC-SM-02: All table columns are present

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and inspect the table header
   - expect: Column headers visible: Sr. No., Employee Name, Mon [date], Tue [date], Wed [date], Thu [date], Fri [date], Sat [date], Sun [date]
   - expect: All column headers have sort buttons

#### 1.3. TC-SM-03: All active users are listed

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and wait for the table to load
   - expect: At least one employee row is visible
   - expect: Each row shows the employee's name in the Employee Name column
   - expect: Each day column cell shows one of: "-", "Week Off" badge, or a holiday name
   - expect: all active user present in the user master should be displayed 

#### 1.4. TC-SM-04: Legend / Note bar is displayed correctly

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and inspect the legend
   - expect: A pink "Week Off" badge is visible in the legend with label "Weekly off (from user settings or manually marked)"
   - expect: A red "Holiday" label is visible with text "Company holiday (non-editable)"
   - expect: A "-" indicator is visible with label "Available - Click to mark weekly off"

---

### 2. Week Navigation

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-NAV-01: Click Next (>) navigates to the next week

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Note the current week range label (e.g., "Jun 1 to Jun 7, 2026")
2. Click the `>` (Next week) button
   - expect: The week range label updates to the next 7-day week (e.g., "Jun 8 to Jun 14, 2026")
   - expect: Table column headers update to Mon, Jun 8 / Tue, Jun 9 / ... / Sun, Jun 14
   - expect: Employee rows reload with week off data for the new week

#### 2.2. TC-NAV-02: Click Previous (<) navigates to the prior week

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Click the `<` (Previous week) button
   - expect: The week range label updates to the previous 7-day week (e.g., "May 25 to May 31, 2026")
   - expect: Table column headers update to Mon, May 25 / ... / Sun, May 31
   - expect: Employee rows reload with week off data for that week

#### 2.3. TC-NAV-03: Clicking Next then Previous returns to the original week

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Note the current week range label
2. Click `>` (Next week)
   - expect: Week range changes to next week
3. Click `<` (Previous week)
   - expect: Week range returns to the original week
   - expect: The table shows the same data as before the navigation

#### 2.4. TC-NAV-04: Date picker navigates to the week containing the selected date

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Enter a specific date (e.g., 06/15/2026) in the Date input field
   - expect: The week range label updates to the week containing June 15 (e.g., "Jun 15 to Jun 21, 2026")
   - expect: Column headers show Mon Jun 15 through Sun Jun 21
   - expect: Employee rows reload with data for that week

#### 2.5. TC-NAV-05: Week navigation defaults to the current week on page load

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page without any URL parameters
   - expect: The week range label shows the current calendar week (Monday to Sunday containing today's date)
   - expect: The Date input shows today's date
   - expect: Column headers display the days of the current week

---

### 3. Mark Week Off (Add)

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-ADD-01: Clicking a "-" cell on a future date marks it as Week Off

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A future date column exists in the current week's view with a "-" (available) cell for an employee.

**Steps:**
1. Navigate to the Week Off Roster page (use next week if all future dates in current week are blocked)
2. Identify an employee row with a "-" cell on a future date
3. Verify the cell has `title="Click to mark weekly off"` and `cursor=pointer`
4. Click the "-" cell
   - expect: A success toast "Week Off added successfully!" appears
   - expect: The clicked cell changes from "-" to a pink "Week Off" badge
   - expect: The "Week Off" badge has `title="Click to remove this weekly off"` and `cursor=pointer`
   - expect: Other employee rows are unaffected

#### 3.2. TC-ADD-02: Week Off can be added for any future day of the week excluding holiday (Mon–Sun)

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a future week where no holidays are configured
2. For each day column (Mon through Sun), click the "-" cell for any available employee
   - expect: Each click shows the success toast "Week Off added successfully!"
   - expect: Each clicked cell changes to a pink "Week Off" badge

#### 3.3. TC-ADD-03: Multiple week offs can be added for the same employee in one week

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a week with future dates
2. For a single employee, click "-" on two different days (e.g., Monday and Wednesday)
   - expect: First click shows toast "Week Off added successfully!" and Mon changes to "Week Off"
   - expect: Second click shows toast "Week Off added successfully!" and Wed changes to "Week Off"
   - expect: The employee now shows Week Off on both Mon and Wed

#### 3.4. TC-ADD-04: Week Off can be added for multiple employees on the same date

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a week with a future date column
2. Click the "-" cell on the same future date column for two different employees
   - expect: Each click shows the success toast
   - expect: Both employee rows show the "Week Off" badge on that date
   - expect: Other employee rows on that date are unaffected

---

### 4. Remove Week Off

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-REM-01: Clicking an enabled "Week Off" badge removes the week off

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A manually added "Week Off" badge (enabled, `cursor=pointer`, `title="Click to remove this weekly off"`) exists for an employee on a future date.

**Steps:**
1. Navigate to the Week Off Roster page and locate a manually added "Week Off" cell
2. Click the "Week Off" badge
   - expect: A success toast appears confirming the week off was removed
   - expect: The cell reverts to "-" with `title="Click to mark weekly off"` and `cursor=pointer`
   - expect: Other week off cells for that employee are unaffected

#### 4.2. TC-REM-02: Removing week off re-enables the cell for future re-addition

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Add a week off for a future date by clicking "-"
   - expect: Cell becomes enabled "Week Off" badge
2. Click the "Week Off" badge to remove it
   - expect: Cell reverts to "-" with `cursor=pointer`
3. Click "-" again to re-add the week off
   - expect: Toast appears and cell becomes "Week Off" again

---

### 5. Holiday Constraint

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-HOL-01: Company holiday dates display the holiday name and are not clickable

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A company holiday exists in the current week (visible as red text in a day column).

**Steps:**
1. Navigate to a week that contains a company holiday
2. Locate the holiday cell (shows holiday name in red h6 text)
   - expect: The cell displays the holiday name as a heading (not a button)
   - expect: The cell has no interactive button — it is NOT clickable
   - expect: Attempting to click the holiday cell does not add a week off
   - expect: No toast appears when clicking a holiday cell

#### 5.2. TC-HOL-02: Holiday applies to all employees — no user can get week off on that date via roster

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A company holiday exists for a specific date.

**Steps:**
1. Navigate to the week containing the holiday
2. Inspect every employee row for that date column
   - expect: All employee rows show the holiday name in red (not "-" or "Week Off")
   - expect: No employee has a clickable "-" or removable "Week Off" on the holiday date

#### 5.3. TC-HOL-03: Non-holiday dates in the same week remain editable

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A company holiday exists on one specific day of a week.

**Steps:**
1. Navigate to the week containing the holiday
2. Inspect non-holiday future dates in the same week for an employee
   - expect: Future non-holiday date cells show "-" with `cursor=pointer` (available)
   - expect: These cells can still be clicked to add week off

---

### 6. Past Date Constraints

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-PAST-01: Past date "-" cells are not clickable

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a week that includes past dates (e.g., the current week when today is mid-week)
2. Locate past date columns (Mon, Tue if today is Thursday or later)
3. Inspect "-" cells in past date columns for employees without any week off on those dates
   - expect: The "-" cell is rendered as `button "-"` without `cursor=pointer`
   - expect: Clicking the past date "-" cell does not add a week off
   - expect: No toast appears when interacting with a past date available cell

#### 6.2. TC-PAST-02: Existing "Week Off" on a past date is read-only

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has a week off marked on a past date (manually added previously) that appears as an enabled `button "Week Off"` with `cursor=pointer`.

**Steps:**
1. Navigate to a week with past dates where an employee has a manually added week off
2. Verify the "Week Off" badge on the past date is `cursor=pointer` (editable)
3. Click the "Week Off" badge
   - expect: The week off is removed successfully (toast appears)
   - expect: The cell reverts to a disabled "-" (past date, cannot re-add)
   - **Note:** Verify actual app behavior — past manually-added week offs may or may not be removable depending on app logic.

---

### 7. Employee Search

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-SRC-01: Search by full employee name filters the table

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and wait for the full employee list to load
2. Type a known employee's full name (e.g., "Adnan Shaikh") in the "Search Employee Name" input
   - expect: The table filters to show only "Adnan Shaikh"
   - expect: All other employee rows are hidden
   - expect: The filtered row still shows all 7 day columns with correct data

#### 7.2. TC-SRC-02: Search by partial employee name returns matching results

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Type a partial name (e.g., "Riya") in the search input
   - expect: All employees whose name contains "Riya" are shown
   - expect: Employees without "Riya" in the name are hidden

#### 7.3. TC-SRC-03: Search is case-insensitive

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Type an employee's name in lowercase (e.g., "adnan shaikh") in the search input
   - expect: The matching employee(s) are shown regardless of the case difference

#### 7.4. TC-SRC-04: Search with a non-existent name returns empty results

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Type a name that doesn't exist (e.g., "XXXX_NO_MATCH") in the search input
   - expect: The table shows an empty state or "No records" message
   - expect: No employee rows are visible

#### 7.5. TC-SRC-05: Clearing the search input restores the full employee list

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Type a partial name to filter the list, then clear the search input
   - expect: All employees reappear in the table
   - expect: The table reverts to the full unfiltered list

---

### 8. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-SORT-01: Clicking "Sr. No." column sorts employees by serial number

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Click the "Sr. No." column header button
   - expect: Employees sort ascending by Sr. No. (1, 2, 3, …)
2. Click the "Sr. No." column header again
   - expect: Employees sort descending by Sr. No. (50, 49, 48, …)

#### 8.2. TC-SORT-02: Clicking "Employee Name" column sorts alphabetically

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Click the "Employee Name" column header button
   - expect: Employees sort in ascending alphabetical order (A → Z)
2. Click the "Employee Name" column header again
   - expect: Employees sort in descending alphabetical order (Z → A)

#### 8.3. TC-SORT-03: Sorting is preserved when navigating weeks

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Click "Employee Name" to sort alphabetically
2. Click `>` to navigate to next week
   - expect: Employees remain sorted alphabetically in the next week view

---

### 9. Impact on Attendance Reports

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-RPT-01: Week Off shows in Daily Attendance Report instead of Absent

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A week off has been manually added for a specific employee on a specific date. The attendance system would otherwise show "Absent" for that employee on that date.

**Steps:**
1. In the Week Off Roster, add a week off for Employee A on a specific date (e.g., next Monday)
   - expect: Toast "Week Off added successfully!" appears
2. Navigate to `https://stage.elevatorplus.net/attendance/daily-attendance`
3. Set the date filter to the date for which week off was added
4. Locate Employee A's row
   - expect: The attendance column for that date shows "Week Off" (not "Absent")
   - expect: No "Absent" status is shown for the week off date

#### 9.2. TC-RPT-02: Week Off shows in Monthly Attendance Report instead of Absent

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A week off has been manually added for a specific employee on a specific date in the current month.

**Steps:**
1. In the Week Off Roster, add a week off for Employee A on a future date in the current month
2. Navigate to `https://stage.elevatorplus.net/attendance/monthly-attendance`
3. Set the month/year filter to the current month
4. Locate Employee A's row and the date column for the week off date
   - expect: The cell shows "Week Off" or the Week Off indicator (not "Absent" or empty)

#### 9.3. TC-RPT-03: Week Off shows in Summary Report instead of Absent

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A week off has been manually added for a specific employee.

**Steps:**
1. In the Week Off Roster, add a week off for Employee A on a future date
2. Navigate to `https://stage.elevatorplus.net/attendance/summary-report`
3. Filter by Employee A and the relevant date range
   - expect: The Summary Report shows "Week Off" for the date where week off was added
   - expect: The "Absent" count is not incremented for the week off date

#### 9.4. TC-RPT-04: Removing a week off reverts the attendance report back to Absent

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** A week off has been added and verified in the attendance reports.

**Steps:**
1. In the Week Off Roster, remove the previously added week off for Employee A by clicking the "Week Off" badge
   - expect: Success toast appears (week off removed)
2. Check the Daily Attendance Report for the same date and employee
   - expect: The status reverts to "Absent" (or original status) — no longer shows "Week Off"

---

### 10. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-ACC-01: Week Off Roster is accessible via Attendance sidebar

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Log in and click "Attendance" in the left sidebar to expand the submenu
   - expect: Attendance submenu expands
   - expect: "Week Off Roster" link is visible in the submenu
2. Click "Week Off Roster"
   - expect: Browser navigates to `https://stage.elevatorplus.net/attendance/week-off-roster`
   - expect: The Week Off Roster page loads with the table and toolbar

#### 10.2. TC-ACC-02: Direct URL navigation works when authenticated

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. While authenticated, navigate directly to `https://stage.elevatorplus.net/attendance/week-off-roster`
   - expect: Page loads successfully without redirecting to login
   - expect: The toolbar and employee table are fully visible

#### 10.3. TC-ACC-03: Unauthenticated users cannot access the Week Off Roster

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Without logging in (or after logging out), navigate directly to `https://stage.elevatorplus.net/attendance/week-off-roster`
   - expect: The user is redirected to the login page
   - expect: The Week Off Roster table is not accessible without authentication

---

### 11. Info Panel

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-INFO-01: Clicking the ⓘ icon opens the help/information panel

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page
2. Click the ⓘ (info) icon in the top-right corner of the main content area
   - expect: A side panel or drawer opens with information about the Week Off Roster feature
   - expect: The panel includes a title "Week Off" and descriptive notes
3. Close the panel (press Escape or click the close button)
   - expect: The panel closes and the table is fully visible again

---

### 12. Edge Cases

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-EDGE-01: A week containing only holidays — no week off can be added

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** Multiple holidays exist in a given week covering all 7 days.

**Steps:**
1. Navigate to a week where all 7 days have a company holiday configured
   - expect: Every cell for every employee shows the holiday name (red h6)
   - expect: No "-" or editable "Week Off" cells are visible for any employee on any day
   - expect: No week off can be added for any employee in that week

#### 12.2. TC-EDGE-02: Page refresh retains the same week view

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a specific week (e.g., via date picker or week navigation)
2. Reload the page (F5 / browser refresh)
   - expect: The page loads and defaults back to the current week (not the previously navigated week, unless URL encodes the week)
   - expect: The table shows the correct week off data for the loaded week

#### 12.3. TC-EDGE-03: Employee with all 7 days as week off is handled correctly

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to a future week with no holidays
2. Add week off for a single employee on all 7 available days
   - expect: All 7 cells change to "Week Off" badge with `title="Click to remove this weekly off"`
   - expect: A success toast appears for each addition
   - expect: Other employees' data is not affected

#### 12.5. TC-EDGE-05: Navigating far into the future shows all future dates as editable

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Click `>` multiple times (e.g., 10 times) to navigate 10 weeks into the future
   - expect: Week range label updates correctly for each click
   - expect: All 7 day cells for employees show "-" with `cursor=pointer` (editable, assuming no holidays that far out)
   - expect: The week off roster functions correctly for far-future weeks

#### 12.6. TC-EDGE-06: Search + week navigation combination works correctly

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Type a partial name in the Search input to filter to 2-3 employees
2. Navigate to the next week using the `>` button
3. Add a week off for one of the filtered employees
   - expect: The search filter remains active
   - expect: The week off is added only for the selected employee
   - expect: Toast appears confirming week off was added
4. Clear the search input
   - expect: All employees are shown
   - expect: The added week off is visible in the correct employee's row for the current week

---

### 13. Loading State

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-LOAD-01: Table shows loading state while data is being fetched

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and observe the initial load
   - expect: A loading indicator ("Loading...") is briefly visible while data is fetched
   - expect: Once data is fetched, the table populates with employee rows
   - expect: No permanent loading state remains after data is loaded

#### 13.2. TC-LOAD-02: Loading state appears briefly when navigating between weeks

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Steps:**
1. Navigate to the Week Off Roster page and wait for initial load
2. Click `>` (Next week)
   - expect: A brief loading indicator may appear while fetching the next week's data
   - expect: Employee rows update with new week data after loading completes

---

### 14. User Master Week Off Integration

Week offs configured per user in the User Master (e.g., a user's designated weekly off day like Sunday) are automatically reflected in the Week Off Roster as **disabled** (non-editable) pink badges. These cannot be modified from the roster page — changes must be made in the User Master.

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-UM-01: User Master week off day appears as a disabled badge in the roster

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has a weekly off day configured in the User Master (e.g., Sunday is their designated weekly off).

**Steps:**
1. Navigate to the Week Off Roster page
2. Locate the employee row for the user who has a week off day set in User Master
3. Find the column corresponding to their configured weekly off day (e.g., Sun, Jun 7)
   - expect: The cell displays a pink "Week Off" badge
   - expect: The badge is `disabled` — no `cursor=pointer`, no `title="Click to remove this weekly off"`
   - expect: The badge is visually identical to manually-added week off badges (same pink colour) but non-interactive

#### 14.2. TC-UM-02: User Master week off appears consistently across all weeks

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has Sunday configured as their weekly off day in User Master.

**Steps:**
1. Navigate to the Week Off Roster page and note the employee's Sunday column shows a disabled "Week Off" badge
2. Click `>` to navigate to the next week
   - expect: The employee's Sunday column in the new week also shows the disabled "Week Off" badge
3. Click `>` again (two more weeks ahead)
   - expect: The same disabled "Week Off" badge appears on Sunday for all viewed weeks
   - expect: The pattern repeats regardless of which week is viewed

#### 14.3. TC-UM-03: User Master week off day cannot be removed from the roster page

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has a weekly off day configured in User Master (visible as a disabled badge in the roster).

**Steps:**
1. Locate the disabled "Week Off" badge for the employee's User Master–configured day
2. Click or interact with the disabled badge
   - expect: No action occurs — no toast, no state change, no API call
   - expect: The badge remains disabled
3. Navigate to the User Master and verify the week off day is still set there
   - expect: The User Master still shows the employee's configured weekly off day unchanged

#### 14.4. TC-UM-04: Manual week off can be added on a day different from the User Master week off day

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has Sunday configured as their weekly off day in User Master (Sunday shows disabled badge). A future weekday (e.g., Wednesday) is available.

**Steps:**
1. In the Week Off Roster, navigate to a week with a future Wednesday
2. Click the "-" cell for Wednesday for that employee
   - expect: Toast "Week Off added successfully!" appears
   - expect: Wednesday changes to an enabled pink "Week Off" badge (`cursor=pointer`, `title="Click to remove this weekly off"`)
   - expect: Sunday still shows the disabled "Week Off" badge (User Master–sourced, unaffected)
   - expect: The employee now shows Week Off on both Sunday (from User Master) and Wednesday (manually added)

#### 14.5. TC-UM-05: Changing week off day in User Master reflects in the roster

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee currently has Sunday as their weekly off day in User Master (shows as disabled badge on Sundays in the roster).

**Steps:**
1. Navigate to User Master and change the employee's weekly off day from Sunday to Saturday
2. Navigate back to `https://stage.elevatorplus.net/attendance/week-off-roster`
3. Locate the employee's row
   - expect: The Sunday column no longer shows a disabled "Week Off" badge — it now shows "-" (available)
   - expect: The Saturday column now shows a disabled "Week Off" badge (reflecting the new User Master setting)
   - expect: This change is reflected consistently across all weeks in the roster

#### 14.6. TC-UM-06: User Master week off day shows as Week Off in daily, monthly and summery  attendance reports

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has Sunday configured as their weekly off day in User Master. A past Sunday exists in the attendance period.

**Steps:**
1. Navigate to `https://stage.elevatorplus.net/attendance/daily-attendance`
2. Set the date filter to a Sunday for the employee who has Sunday as their User Master week off day
   - expect: The employee's attendance shows "Week Off" (not "Absent") for that Sunday
3. Navigate to `https://stage.elevatorplus.net/attendance/monthly-attendance`
4. Set the month to include the same Sunday
   - expect: The Sunday column for that employee shows "Week Off"
5. Navigate to `https://stage.elevatorplus.net/attendance/summary-report`
   - expect: The summary reflects "Week Off" for all configured weekly off days (from User Master) in the report period

#### 14.7. TC-UM-07: User with no week off day configured in User Master shows no disabled badges

**File:** `tests/attendance-module/week-off-roster.spec.ts`

**Pre-condition:** An employee has no weekly off day configured in User Master (no default weekly off set).

**Steps:**
1. Navigate to the Week Off Roster page and locate the employee with no User Master week off day
2. Navigate to a week with no company holidays
   - expect: All 7 day columns for that employee show "-" with `cursor=pointer` (no disabled badges)
   - expect: Any "Week Off" badge visible for this employee must be a manually added one (enabled badge)
