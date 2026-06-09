# Leave Balances Master Test Plan
claude
## Application Overview

The Leave Balances Master page is part of the ElevatorPlus Attendance module, accessible at /attendance/leave-balances. It is a read-only report page titled "Leave Balance Report" (h2) with the subtitle "View employee leave balances and usage". The page displays leave balance data for all active users registered in User Master. The toolbar contains a Search Employee Name text box and a Filter button (Export Excel and Import Excel buttons exist but are excluded from this test plan). The data table has eight columns — Sr. No., Employee Name, Casual Leave Balance, Sick Leave Balance, Comp Off Balance, Used Casual Leaves, Used Sick Leaves, and Used Comp Offs — all of which are sortable. Numeric values can be whole numbers (0) or decimals (1.5, 2.5, 0.5). Pagination controls appear below the table and include a Rows-per-page dropdown (10/25/50/100, default 10), a Page X of Y indicator, numbered page buttons, and Previous/Next page buttons. The Filter drawer (opened via the Filter button) shows a heading Filter and subtitle Customize your filters, contains a single Employee Name field implemented as a searchable dropdown listing all active employees, and has Reset and Apply buttons along with a close icon. After applying a filter, an Active Filters chip row appears above the toolbar showing each applied filter with an individual remove X icon, plus a Clear All button. There are no add, edit, or delete operations on this page.

## Test Scenarios

### 1. 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Leave Balances page loads successfully

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/attendance/leave-balances
    - expect: The page URL should be https://stage.elevatorplus.net/attendance/leave-balances
    - expect: The page title should be 'ElevatorPlus'
    - expect: The navbar breadcrumb heading should read 'Leave Balances'
    - expect: The page heading 'Leave Balance Report' (h2) should be visible
    - expect: The subtitle 'View employee leave balances and usage' should be visible below the heading
  2. Inspect the toolbar area above the table
    - expect: A Search Employee Name text input should be present
    - expect: An 'Export Excel' button should be visible
    - expect: An 'Import Excel' button should be visible
    - expect: A 'Filter' button should be visible
  3. Inspect the data table
    - expect: The table should load and display employee records without errors
    - expect: The table header row should contain exactly these columns in order: Sr. No., Employee Name, Casual Leave Balance, Sick Leave Balance, Comp Off Balance, Used Casual Leaves, Used Sick Leaves, Used Comp Offs
    - expect: At least one data row should be visible
  4. Inspect the pagination area below the table
    - expect: A 'Rows' dropdown should be visible with options 10, 25, 50, 100 (default 10)
    - expect: A 'Page X of Y' indicator should be shown
    - expect: Previous and Next page navigation buttons should be present

#### 1.2. TC-SM-02: Verify all table columns are present 

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/attendance/leave-balances
    - expect: The page loads successfully
  2. Inspect each column header in the table header row
    - expect: Sr. No. column header should be present
    - expect: Employee Name column header should be present 
    - expect: Casual Leave Balance column header should be present 
    - expect: Sick Leave Balance column header should be present 
    - expect: Comp Off Balance column header should be present
    - expect: Used Casual Leaves column header should be present 
    - expect: Used Sick Leaves column header should be present
    - expect: Used Comp Offs column header should be present claude
  3. Verify data rows in the table body
    - expect: Each row displays a sequential Sr. No. starting from 1
    - expect: Each row displays an Employee Name
    - expect: Each leave balance and usage column shows a numeric value (integer or decimal such as 0, 1, 1.5, 2.5)

### 2. 2. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-SRC-01: Search by partial employee name returns matching results

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and verify the full table is loaded showing multiple pages
    - expect: Multiple employee records are displayed across multiple pages
  2. Type a partial employee name in the Search Employee Name input, e.g. 'Ganesh'
    - expect: The table immediately filters to show only employees whose names contain 'Ganesh' (case-insensitive)
    - expect: The results include 'Ganesh kadam' and 'ganesh 2'
    - expect: Non-matching employee rows are hidden
    - expect: The pagination updates to reflect the reduced result count (e.g. 'Page 1 of 1')

#### 2.2. TC-SRC-02: Search by exact employee name returns a single matching record

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and type an exact employee name in the search box, e.g. 'Accucia Test'
    - expect: The table filters to show exactly one row for 'Accucia Test'
    - expect: The row shows the employee's correct leave data: Casual Leave Balance 1, Sick Leave Balance 2, Comp Off Balance 2, Used Casual Leaves 3, Used Sick Leaves 2, Used Comp Offs 2
    - expect: The pagination shows 'Page 1 of 1'

#### 2.3. TC-SRC-03: Search with a non-existent employee name returns no results

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and type a name that does not exist in the system, e.g. 'XYZNONEXISTENTEMPLOYEE999'
    - expect: The table displays no data rows
    - expect: An empty state or no-results message may appear
    - expect: The pagination shows 'Page 1 of 1' or 0 entries

#### 2.4. TC-SRC-04: Clearing the search input restores the full employee list

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and type 'Ganesh' in the search box to filter the table
    - expect: The table is filtered to show only matching employees
  2. Clear the search input by deleting all typed text
    - expect: The table immediately restores to the full list of employees
    - expect: Pagination returns to its original state (e.g. 'Page 1 of 5')
    - expect: All employees are shown again

#### 2.5. TC-SRC-05: Search is case-insensitive

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and type 'ganesh' (all lowercase) in the search box
    - expect: The table shows both 'Ganesh kadam' and 'ganesh 2', confirming case-insensitive matching
  2. Clear the search and type 'GANESH' (all uppercase)
    - expect: The same results are returned: 'Ganesh kadam' and 'ganesh 2'

### 3. 3. Filter Drawer

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-FLT-01: Filter drawer opens and displays correct elements

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the 'Filter' button in the toolbar
    - expect: A filter drawer slides in or becomes visible
    - expect: The drawer heading 'Filter' (h5) is displayed
    - expect: The subtitle 'Customize your filters' is displayed
    - expect: An Employee Name label and a searchable dropdown field are present
    - expect: A 'Reset' button is present in the drawer
    - expect: An 'Apply' button is present in the drawer
    - expect: A close X icon button is present at the top of the drawer

#### 3.2. TC-FLT-02: Employee Name dropdown lists all active employees

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, click the Filter button, then click on the Employee Name dropdown input
    - expect: A dropdown list appears showing all active employees (approximately 43 entries)
    - expect: A text search input is available within the dropdown to narrow results
    - expect: The placeholder 'Select Employee' is shown when the field is empty
  2. Type 'Ganesh' in the Employee Name search input within the dropdown
    - expect: The dropdown list narrows to show only 'ganesh 2' and 'Ganesh kadam'
    - expect: Approximately 2 results are shown for this search term

#### 3.3. TC-FLT-03: Selecting an employee and clicking Apply filters the table

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, open the Filter drawer, open the Employee Name dropdown, and select 'Ganesh kadam' from the list
    - expect: 'Ganesh kadam' appears as a selected tag/chip inside the Employee Name dropdown field
  2. Click the 'Apply' button
    - expect: The filter drawer closes or hides
    - expect: The main data table refreshes showing only one row for 'Ganesh kadam'
    - expect: An 'Active Filters:' section appears above the toolbar with a chip labeled 'Ganesh kadam' and an X icon
    - expect: A 'Clear All' button appears next to the active filter chips
    - expect: The pagination shows 'Page 1 of 1'

#### 3.4. TC-FLT-04: Active filter chip X icon removes the filter

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, open the Filter drawer, select 'Ganesh kadam', and click Apply
    - expect: The 'Ganesh kadam' chip is visible in the Active Filters section
  2. Click the X icon on the 'Ganesh kadam' filter chip
    - expect: The chip is removed from the Active Filters section
    - expect: The Active Filters section disappears
    - expect: The table restores to show all employees
    - expect: Pagination returns to the full dataset (e.g. 'Page 1 of 5')

#### 3.5. TC-FLT-05: Clear All button removes all active filters and restores full list

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, apply the Employee Name filter for 'Ganesh kadam' using the Filter drawer
    - expect: The table is filtered to one row and an Active Filters chip is shown
  2. Click the 'Clear All' button next to the Active Filters section
    - expect: All filter chips are removed
    - expect: The Active Filters section disappears
    - expect: The table restores to the full employee list
    - expect: Pagination returns to the full dataset (e.g. 'Page 1 of 5')

#### 3.6. TC-FLT-06: Reset button inside the filter drawer clears the selection without applying

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, open the Filter drawer, and select 'Ganesh kadam' in the Employee Name dropdown
    - expect: 'Ganesh kadam' is shown as selected in the field
  2. Click the 'Reset' button inside the drawer (without clicking Apply)
    - expect: The Employee Name selection is cleared and the dropdown reverts to the 'Select Employee' placeholder
    - expect: The table data is unchanged from before the drawer was opened
  3. Click 'Apply' after the reset
    - expect: No filter is applied to the table and the full list of employees is shown

#### 3.7. TC-FLT-07: Close icon on the filter drawer discards unsaved selection

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, open the Filter drawer, select 'Ganesh kadam' in the Employee Name dropdown, and do NOT click Apply
    - expect: 'Ganesh kadam' is selected but no filter chip appears in the main page yet
  2. Click the close X icon at the top of the drawer
    - expect: The filter drawer closes
    - expect: No Active Filters chip appears in the main page
    - expect: The table remains in its previous unfiltered state

### 4. 4. Pagination and Rows Per Page

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-PAG-01: Default pagination state on page load

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances
    - expect: The Rows dropdown shows '10' as the default selection
    - expect: The table displays a maximum of 10 employee rows
    - expect: The pagination indicator shows 'Page 1 of 5' (or the current total based on active employee count)
    - expect: The Previous page button is disabled on page 1
    - expect: Numbered page buttons are visible (1, 2, 3, 4, 5)
    - expect: The Next page button is enabled

#### 4.2. TC-PAG-02: Navigate to next page using the Next button

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances (table is on Page 1)
    - expect: Previous page button is disabled
  2. Click the Next page button
    - expect: The table advances to Page 2
    - expect: The Page 2 button is marked as current
    - expect: New employee rows appear
    - expect: The Previous page button is now enabled

#### 4.3. TC-PAG-03: Navigate to previous page using the Previous button

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click Next page to go to Page 2
    - expect: The table is on Page 2 and Previous page is enabled
  2. Click the Previous page button
    - expect: The table returns to Page 1
    - expect: The Page 1 button is active
    - expect: The Previous page button is disabled again

#### 4.4. TC-PAG-04: Navigate to a specific page using a numbered page button

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Page 3 numbered button
    - expect: The table jumps directly to Page 3
    - expect: The Page 3 button is marked as current
    - expect: Both Previous and Next buttons are enabled

#### 4.5. TC-PAG-05: Previous page button is disabled on page 1

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and confirm the table is on Page 1
    - expect: The Previous page button is disabled and cannot be clicked

#### 4.6. TC-PAG-06: Next page button is disabled on the last page

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the last numbered page button (e.g. Page 5)
    - expect: The Next page button is disabled and cannot be clicked

#### 4.7. TC-PAG-07: Change rows-per-page to 25

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and change the Rows dropdown from '10' to '25'
    - expect: The table shows up to 25 employee rows
    - expect: The pagination page count reduces (e.g. from 'Page 1 of 5' to 'Page 1 of 2')

#### 4.8. TC-PAG-08: Change rows-per-page to 50

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and change the Rows dropdown to '50'
    - expect: The table shows up to 50 employee rows
    - expect: If total active employees are 50 or fewer, all fit on a single page showing 'Page 1 of 1'

#### 4.9. TC-PAG-09: Change rows-per-page to 100

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and change the Rows dropdown to '100'
    - expect: The table shows up to 100 employee rows
    - expect: If total active employees are fewer than 100, all fit on a single page showing 'Page 1 of 1'

### 5. 5. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-SRT-01: Sort by Employee Name ascending then descending

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Employee Name column header once
    - expect: The Employee Name header is marked active/pressed
    - expect: Rows are sorted alphabetically ascending (A to Z)
  2. Click the Employee Name column header a second time
    - expect: The sort reverses to descending (Z to A)
    - expect: The first visible row shows the employee whose name comes last alphabetically

#### 5.2. TC-SRT-02: Sort by Casual Leave Balance ascending then descending

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Casual Leave Balance column header
    - expect: The table sorts by Casual Leave Balance ascending (lowest value first)
    - expect: The Casual Leave Balance header is marked active
  2. Click the Casual Leave Balance header again
    - expect: The sort reverses to descending (highest value first)

#### 5.3. TC-SRT-03: Sort by Sick Leave Balance

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Sick Leave Balance column header
    - expect: The table sorts by Sick Leave Balance ascending
    - expect: The Sick Leave Balance header is marked active
  2. Click the header again
    - expect: The sort reverses to descending

#### 5.4. TC-SRT-04: Sort by Comp Off Balance

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Comp Off Balance column header
    - expect: The table sorts by Comp Off Balance ascending
    - expect: The Comp Off Balance header is marked active

#### 5.5. TC-SRT-05: Sort by Used Casual Leaves

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Used Casual Leaves column header
    - expect: The table sorts by Used Casual Leaves ascending
    - expect: The Used Casual Leaves header is marked active

#### 5.6. TC-SRT-06: Sort by Used Sick Leaves

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Used Sick Leaves column header
    - expect: The table sorts by Used Sick Leaves ascending
    - expect: The Used Sick Leaves header is marked active

#### 5.7. TC-SRT-07: Sort by Used Comp Offs

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and click the Used Comp Offs column header
    - expect: The table sorts by Used Comp Offs ascending
    - expect: The Used Comp Offs header is marked active

### 6. 6. Data Integrity

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-DAT-01: Verify only active users appear in the table

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, set Rows per page to 100, and count the total employee rows displayed
    - expect: All displayed employees are active users from User Master
    - expect: No inactive/disabled users should appear
    - expect: The employee count here matches the count of active users in User Master

#### 6.2. TC-DAT-02: Verify all numeric leave values are non-negative

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and inspect rows across all pages for Casual Leave Balance, Sick Leave Balance, Comp Off Balance, Used Casual Leaves, Used Sick Leaves, and Used Comp Offs columns
    - expect: All values are numeric (integers or decimals such as 0, 1, 1.5, 2.5)
    - expect: No negative values appear in any column
    - expect: Employees with no leave activity display 0 in all columns

#### 6.3. TC-DAT-03: Verify decimal leave balance values display correctly

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and locate the row for 'Ganesh kadam'
    - expect: Casual Leave Balance shows '1.5'
    - expect: Sick Leave Balance shows '1.5'
    - expect: Comp Off Balance shows '0.5'
    - expect: Used Casual Leaves shows '1.5'
    - expect: Used Sick Leaves shows '1.5'
    - expect: Used Comp Offs shows '2.5'
    - expect: Decimal values are displayed without unnecessary trailing zeros

#### 6.4. TC-DAT-04: Verify Sr. No. is sequential starting from 1 on the first page

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and inspect the Sr. No. column for the visible rows on page 1
    - expect: Sr. No. values run from 1 to 10 in sequential order
  2. Navigate to page 2 and check the Sr. No. values
    - expect: Sr. No. numbering is consistent (either continues from 11 or restarts from 1 - document actual behavior)

#### 6.5. TC-DAT-05: Verify the employee list in the filter dropdown matches the table rows

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances, open the Filter drawer, and open the Employee Name dropdown to see the full list
    - expect: The dropdown shows approximately 43 active employees
  2. Close the filter and set Rows per page to 100
    - expect: The count of table rows matches the count of entries in the filter dropdown
    - expect: All employee names in the dropdown have a corresponding row in the table

### 7. 7. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-NAV-01: Unauthenticated direct URL access redirects to login

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Open a new browser context with no authentication state and navigate directly to https://stage.elevatorplus.net/attendance/leave-balances
    - expect: The user is redirected to the login page
    - expect: The Leave Balances report table and controls are not accessible

#### 7.2. TC-NAV-02: Access Leave Balances via Attendance sidebar submenu

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Log in and click Attendance in the left sidebar to expand its submenu
    - expect: The Attendance submenu expands showing: HR Setting, Leave Approval, Week Off Roster, Shift Master, Daily Attendance Report, Monthly Attendance Report, Summary Report, Holiday, Leave Balances
  2. Click Leave Balances in the expanded Attendance submenu
    - expect: The browser navigates to /attendance/leave-balances
    - expect: The page heading 'Leave Balance Report' is visible
    - expect: The data table with employee leave balances is displayed

#### 7.3. TC-NAV-03: Active menu item highlights on the Leave Balances page

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances after logging in
    - expect: The Leave Balances link in the Attendance sidebar submenu is marked as active
    - expect: The Attendance parent item is expanded in the sidebar
    - expect: The navbar breadcrumb heading shows 'Leave Balances'

#### 7.4. TC-NAV-04: Page is read-only with no Add, Edit, or Delete controls

**File:** `tests/Attendance-master/leave-balances-master.spec.ts`

**Steps:**
  1. Navigate to /attendance/leave-balances and inspect all visible UI controls on the page
    - expect: There is no Add button or form to create new leave balance records
    - expect: There is no Edit icon or button on any table row
    - expect: There is no Delete icon or button on any table row
    - expect: The page functions purely as a read-only report view
