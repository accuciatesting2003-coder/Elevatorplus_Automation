# Leave Approval Test Plan

## Application Overview

The Leave Approval page is part of the ElevatorPlus Attendance module, accessible at https://stage.elevatorplus.net/attendance/leave-approval. It allows admins and reporting managers to review, approve, or reject employee leave requests. The page has three main sections: (1) an active filters bar at the top, (2) a search and filter toolbar, and (3) a data table listing leave requests.

**Page heading:** "Leave Approval" with an info icon (ℹ️) on the top right of the card.  
**Subtitle:** "Review and approve or reject employee leave requests."

### Active Filters Bar
Displayed below the page heading. Shows currently applied filters as badges (e.g., "ACTIVE FILTERS: 03-05-2026 – 01-06-2026"). A "Clear All" link appears on the right to remove all active filters. A default date range filter (~30-day window from today) is applied automatically on page load.

### Search and Filter Toolbar
Contains two elements side by side:
- **Search Employee Code** input: A text box with an inline SVG search icon (id="search"). Filters the table by employee code as the user types.
- **Filters button** (dark blue, top-right of toolbar): Opens a right-side filter drawer with a backdrop overlay. The drawer contains:
  - **Date Range** filter: A date range picker component. Shows the current active date range (e.g., "May 3, 2026 - Jun 1, 2026"). Default is the current rolling ~30-day window.
  - **Employee Name** filter: A React Select dropdown with placeholder "Select Employee". Allows filtering by a specific employee.
  - **Status** filter: A button group with options — **All** (default), **Pending**, **Approved**, **Rejected**.
  - **Reset** button: Resets all filter fields back to defaults.
  - **Apply** button: Applies the selected filters, closes the drawer, and updates the table.

### Data Table
The table has the following columns: **Sr. No.**, **Action**, **Emp Name**, **Emp Id**, **Leave Type**, **Date**, **Applied On**, **Leave Reason**, **Rejected Reason**, **Status**.

The **Date** column shows the leave date range in the format: "Jun 1 to Jun 1, 2026 Days :1.0".  
The **Action** column shows **Approve** (green) and **Reject** (red) buttons only for **Pending** records. For Approved or Rejected records the Action column shows "-" (no buttons).  
The **Status** column displays: **Pending**, **Approved**, or **Rejected**.

Known leave types include: Comp Off, Sick Leave, Leave Without Pay, Casual Leave.

The table toolbar has a **Rows** dropdown (options: 10, 25, 50, 100; default 10) and numbered pagination controls.

### Approve Action (Confirmation Modal)
Clicking the **Approve** button on a pending row opens a SweetAlert2 confirmation modal:
- Icon: Orange warning (!)
- Title: "Confirmation Required!"
- Message: "Are you sure you want to Approved this leave request?"
- Shows: "Available Balance:- CL: [value], SL: [value]" (employee's current leave balance)
- Buttons: **Cancel** (outlined) and **Yes, Approve!** (blue)
- No text input required.

### Reject Action (Confirmation Modal)
Clicking the **Reject** button on a pending row opens a SweetAlert2 confirmation modal:
- Icon: Orange warning (!)
- Title: "Confirmation Required!"
- Message: "Are you sure you want to Reject this leave request?"
- Shows: "Available Balance:- CL: [value], SL: [value]"
- Shows: **"Reason for Rejection* :"** label with a mandatory textarea input (placeholder: "Enter Reason!")
- Character counter: "Characters left: 150" below the textarea
- Buttons: **Cancel** (outlined) and **Yes, Reject!** (blue)
- Validation: Shows "Reason is required" error if submitted without entering a reason. Modal stays open.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Leave Approval page loads successfully

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/attendance/leave-approval
   - expect: The page URL should be https://stage.elevatorplus.net/attendance/leave-approval
   - expect: The page heading should display "Leave Approval"
   - expect: The subtitle should read "Review and approve or reject employee leave requests"
   - expect: The "ACTIVE FILTERS" bar should be visible with a default date range badge
   - expect: The "Clear All" link should be visible next to the active filter badge
   - expect: The "Search Employee Code" input field should be present and empty
   - expect: The "Filters" button should be visible in the toolbar
   - expect: The data table should load and display leave request records

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to https://stage.elevatorplus.net/attendance/leave-approval and inspect the page
   - expect: An info icon button (ℹ️) should be present on the top-right of the page card
   - expect: The active filters bar should show a date range badge (format: DD-MM-YYYY – DD-MM-YYYY)
   - expect: The "Search Employee Code" input with SVG search icon should be visible and focusable
   - expect: The dark blue "Filters" button should be visible in the top-right of the toolbar
2. Inspect the data table
   - expect: Table columns should be: Sr. No., Action, Emp Name, Emp Id, Leave Type, Date, Applied On, Leave Reason, Rejected Reason, Status
   - expect: All 10 columns should be visible
   - expect: Pending records should show green "Approve" and red "Reject" buttons in the Action column
   - expect: Approved or Rejected records should show "-" in the Action column
   - expect: The Status column should display "Pending", "Approved", or "Rejected" labels
3. Inspect the table toolbar
   - expect: A "Rows" label with a dropdown (options: 10, 25, 50, 100) defaulting to 10 should be present
   - expect: Pagination controls (page number buttons) should be visible below the table

#### 1.3. TC-SM-03: Default date range filter is applied on page load

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page without applying any manual filters
   - expect: The "ACTIVE FILTERS" bar should display a date range badge automatically (default ~30-day window)
   - expect: The table should only display leave requests that fall within the default date range
   - expect: The "Clear All" link should be visible

---

### 2. Filter Drawer — Open, Reset, Apply

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-FLT-01: Filters button opens the filter drawer

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and click the "Filters" button
   - expect: A filter drawer/panel should slide open from the right side of the screen
   - expect: A dark backdrop overlay should appear over the table area
   - expect: The drawer should contain a "Date Range" section with a date range picker
   - expect: The drawer should contain an "Employee Name" section with a "Select Employee" React Select dropdown
   - expect: The drawer should contain a "Status" section with button options: All, Pending, Approved, Rejected
   - expect: A "Reset" button and an "Apply" button should be visible at the bottom of the drawer

#### 2.2. TC-FLT-02: Filter drawer closes without applying when backdrop is clicked

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click the "Filters" button to open the drawer, then click the dark backdrop overlay
   - expect: The filter drawer should close
   - expect: The backdrop overlay should disappear
   - expect: The table data should remain unchanged (no filter applied)
   - expect: The active filters bar should reflect no new filters were added

#### 2.3. TC-FLT-03: Filter by Status — Pending

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", select "Pending" from the Status button group, and click "Apply"
   - expect: The filter drawer should close
   - expect: The table should display only records with "Pending" status
   - expect: No "Approved" or "Rejected" records should be visible in the table
   - expect: All visible records in the Action column should show "Approve" and "Reject" buttons

#### 2.4. TC-FLT-04: Filter by Status — Approved

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", select "Approved" from the Status button group, and click "Apply"
   - expect: The filter drawer should close
   - expect: The table should display only records with "Approved" status
   - expect: All visible records in the Action column should show "-" (no action buttons)
   - expect: No "Pending" or "Rejected" records should be visible

#### 2.5. TC-FLT-05: Filter by Status — Rejected

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", select "Rejected" from the Status button group, and click "Apply"
   - expect: The filter drawer should close
   - expect: The table should display only records with "Rejected" status
   - expect: All visible records should have non-empty "Rejected Reason" values
   - expect: No "Pending" or "Approved" records should be visible

#### 2.6. TC-FLT-06: Filter by Status — All

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", select "All" from the Status button group, and click "Apply"
   - expect: The table should display records of all statuses (Pending, Approved, Rejected)
   - expect: Both records with action buttons and records with "-" should be present

#### 2.7. TC-FLT-07: Filter by Employee Name

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", open the "Select Employee" dropdown in the Employee Name section, select a specific employee (e.g., "Ganesh kadam"), and click "Apply"
   - expect: The filter drawer should close
   - expect: The table should display only leave records for the selected employee
   - expect: The "Emp Name" column should only show the selected employee's name

#### 2.8. TC-FLT-08: Filter by Date Range

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", interact with the Date Range picker to select a specific date range (e.g., from the 1st to the 15th of the current month), and click "Apply"
   - expect: The filter drawer should close
   - expect: The active filters bar should update to reflect the new date range
   - expect: The table should display only leave records with Applied On or leave dates within the selected range

#### 2.9. TC-FLT-09: Combine multiple filters (Employee + Status)

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", select a specific employee in the Employee Name filter, select "Pending" in the Status filter, and click "Apply"
   - expect: The filter drawer should close
   - expect: The table should display only Pending leave records for the selected employee
   - expect: No other employee's records should be visible
   - expect: No Approved or Rejected records should be visible

#### 2.10. TC-FLT-10: Reset button clears all filter inputs in the drawer

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Filters", set a specific employee in the Employee Name filter and choose "Pending" in Status
   - expect: Both filters are populated/changed in the drawer
2. Click the "Reset" button inside the drawer
   - expect: The Employee Name dropdown should revert to "Select Employee" (empty)
   - expect: The Status selection should revert to "All"
   - expect: The Date Range should revert to the default range
   - expect: The drawer should remain open after Reset (not closed)

#### 2.11. TC-FLT-11: Clear All removes active filter badges

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Apply at least one filter via the Filters drawer (e.g., Status = Pending), then click the "Clear All" link in the active filters bar
   - expect: The applied filter badge (e.g., Status = Pending) should be removed from the active filters bar
   - expect: The table should update to show records without the cleared filter applied

---

### 3. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-SRC-01: Search by employee name filters the table

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and type a known employee code (e.g., "ACC003") in the "Search Employee Code" input
   - expect: The table should update to show only records for the employee with that code
   - expect: The "Emp Id" column for all visible rows should match the searched code

#### 3.2. TC-SRC-02: Search by partial employee name  returns matching results

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Type a partial employee code (e.g., "ACC") in the "Search Employee Code" input
   - expect: The table should filter to show all records where the employee code contains "ACC"
   - expect: Records not matching the partial code should be hidden

#### 3.3. TC-SRC-03: Search with a non-existent name  returns no results

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Type a non-existent employee code (e.g., "XXXX9999") in the "Search Employee Code" input
   - expect: The table should show a "no records" or empty state message
   - expect: No data rows should be visible

#### 3.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Type a search term to filter the table, then clear the "Search Employee Code" input by selecting all and deleting
   - expect: The table should restore and display the full list of records based on the current active filters
   - expect: Previously hidden records should reappear

#### 3.5. TC-SRC-05: Search combines with active Status filter

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Open Filters, set Status to "Pending", click Apply, then type an employee code in the search input
   - expect: The table should show only Pending records for the searched employee code
   - expect: Approved/Rejected records for that employee should not appear

---

### 4. Approve Leave — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-APR-01: Clicking Approve on a Pending record opens confirmation modal

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and click the green "Approve" button on a Pending record
   - expect: A SweetAlert2 confirmation modal should appear
   - expect: The modal title should read "Confirmation Required!"
   - expect: The modal message should read "Are you sure you want to Approved this leave request?"
   - expect: The modal should display the employee's leave balance (e.g., "Available Balance:- CL: 0.5, SL: 0.5")
   - expect: A "Cancel" button and a "Yes, Approve!" button should be visible
   - expect: No text input field should be present in the Approve modal

#### 4.2. TC-APR-02: Clicking Cancel in the Approve modal closes the modal without changes

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Approve" on a Pending record to open the confirmation modal, then click the "Cancel" button
   - expect: The modal should close
   - expect: The leave record's Status in the table should still read "Pending"
   - expect: The "Approve" and "Reject" buttons should still be visible for that record

#### 4.3. TC-APR-03: Successfully approving a leave request changes Status to Approved

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Approve" on a Pending record to open the confirmation modal
   - expect: Confirmation modal appears with "Yes, Approve!" button
2. Click the "Yes, Approve!" button
   - expect: The modal should close
   - expect: A success toast notification should appear confirming the approval
   - expect: The record's Status in the table should change from "Pending" to "Approved"
   - expect: The Action column for that record should change from "Approve/Reject" buttons to "-"

#### 4.4. TC-APR-04: Approved record shows approval details in the table

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Approve a pending leave request and observe the record in the table
   - expect: The Status column should display "Approved"
   - expect: The Action column should display "-" (no further action possible)
   - expect: The Leave Reason column may show the approval information

---

### 5. Reject Leave — Happy Path and Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-REJ-01: Clicking Reject on a Pending record opens confirmation modal with reason field

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and click the red "Reject" button on a Pending record
   - expect: A SweetAlert2 confirmation modal should appear
   - expect: The modal title should read "Confirmation Required!"
   - expect: The modal message should read "Are you sure you want to Reject this leave request?"
   - expect: The modal should display the employee's leave balance (e.g., "Available Balance:- CL: 0.5, SL: 0.5")
   - expect: A "Reason for Rejection* :" label with a mandatory textarea input should be visible (placeholder: "Enter Reason!")
   - expect: A character counter "Characters left: 150" should be displayed below the textarea
   - expect: A "Cancel" button and a "Yes, Reject!" button should be visible

#### 5.2. TC-REJ-02: Clicking Cancel in the Reject modal closes the modal without changes

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record to open the confirmation modal, then click the "Cancel" button
   - expect: The modal should close
   - expect: The leave record's Status in the table should still read "Pending"
   - expect: The "Approve" and "Reject" buttons should still be visible for that record

#### 5.3. TC-REJ-03: Submitting rejection without a reason shows validation error

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record to open the modal, leave the "Reason for Rejection" textarea empty, and click "Yes, Reject!"
   - expect: An inline validation error "Reason is required" should appear below the textarea
   - expect: The modal should remain open (not close)
   - expect: The rejection should NOT be submitted
   - expect: No change should occur in the table for that record

#### 5.4. TC-REJ-04: Successfully rejecting a leave request with a reason changes Status to Rejected

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record, type a valid rejection reason (e.g., "Insufficient leave balance") in the textarea, and click "Yes, Reject!"
   - expect: The modal should close
   - expect: A success toast notification should appear confirming the rejection
   - expect: The record's Status in the table should change from "Pending" to "Rejected"
   - expect: The Action column for that record should change from "Approve/Reject" buttons to "-"
   - expect: The "Rejected Reason" column should display the rejection reason entered (e.g., "Insufficient leave balance")

#### 5.5. TC-REJ-05: Character counter decrements as user types the rejection reason

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record, observe the "Characters left: 150" counter, then type some text in the reason textarea
   - expect: The character counter should decrease as characters are typed (e.g., typing 10 characters shows "Characters left: 140")
   - expect: The counter should update in real time as the user types

#### 5.6. TC-REJ-06: Rejected record shows rejection reason in the table

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Reject a pending leave request with the reason "Schedule conflict" and observe the record in the table
   - expect: The Status column should display "Rejected"
   - expect: The Rejected Reason column should display "Schedule conflict"
   - expect: The Action column should display "-"

#### 5.7. TC-REJ-07: Rejection reason input resets when modal is closed and re-opened

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a pending record, type "test reason" in the textarea, then click "Cancel"
   - expect: The modal closes
   - expect: The record status remains "Pending"
2. Click "Reject" again on the same (or any other) Pending record
   - expect: The rejection reason textarea should be empty (not pre-populated with the previously typed text)
   - expect: The character counter should reset to "Characters left: 150"

---

### 6. Status Filter (via Filter Drawer) and Active Filters Display

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-STS-01: Default Status in filter is All (shows all statuses)

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and open the Filters drawer
   - expect: The Status button group should have "All" selected by default
   - expect: The table (within the default date range) should contain records of all statuses

#### 6.2. TC-STS-02: Filtering by Pending shows only pending records with action buttons

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Open Filters, select "Pending", click Apply, and examine the table
   - expect: Every row's Status column should show "Pending"
   - expect: Every row's Action column should show green "Approve" and red "Reject" buttons
   - expect: No rows with "Approved" or "Rejected" status should appear

#### 6.3. TC-STS-03: Filtering by Approved hides action buttons

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Open Filters, select "Approved", click Apply, and examine the table
   - expect: Every row's Status column should show "Approved"
   - expect: Every row's Action column should show "-"
   - expect: No rows with "Pending" or "Rejected" status should appear

#### 6.4. TC-STS-04: Active filters bar updates when filters are applied

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Open Filters, change Status to "Pending", and click Apply
   - expect: The active filters bar should update to reflect the applied Status filter (e.g., show a "Pending" badge or updated date+status badge)
   - expect: The "Clear All" link should be visible in the active filters bar

---

### 7. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-PAG-01: Default rows per page is 10

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page and inspect the "Rows" dropdown in the table toolbar
   - expect: The "Rows" dropdown should default to "10"
   - expect: At most 10 rows should be visible in the table

#### 7.2. TC-PAG-02: Changing rows per page to 25 shows more records

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Change the "Rows" dropdown to "25"
   - expect: The table should display up to 25 records per page
   - expect: If there are more than 10 but fewer than 25 records, all should be visible on one page

#### 7.3. TC-PAG-03: Navigate to next page using pagination controls

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. With "Rows" set to 10 (and more than 10 records in the filtered view), click the "2" (next page) button in the pagination controls
   - expect: The table should navigate to page 2 showing the next set of records
   - expect: The page 2 button should appear active/selected in the pagination controls
2. Click the "1" (previous page) button
   - expect: The table should navigate back to page 1

#### 7.4. TC-PAG-04: Rows per page options are 10, 25, 50, 100

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click the "Rows" dropdown and inspect the available options
   - expect: The dropdown should contain exactly: 10, 25, 50, 100

---

### 8. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-NAV-01: Leave Approval is accessible via the Attendance sidebar menu

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Log in to ElevatorPlus and click "Attendance" in the left sidebar navigation menu to expand it
   - expect: The Attendance submenu should expand showing multiple options
   - expect: A "Leave Approval" link should be visible in the expanded submenu
2. Click the "Leave Approval" link in the submenu
   - expect: The browser should navigate to https://stage.elevatorplus.net/attendance/leave-approval
   - expect: The Leave Approval page should load with the data table and toolbar

#### 8.2. TC-NAV-02: Unauthenticated users cannot access the Leave Approval page

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Without logging in (or after logging out), directly navigate to https://stage.elevatorplus.net/attendance/leave-approval
   - expect: The user should be redirected to the login page
   - expect: The Leave Approval page content should not be accessible without authentication

#### 8.3. TC-NAV-03: Direct URL navigation works when authenticated

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. While authenticated, directly navigate to https://stage.elevatorplus.net/attendance/leave-approval via the address bar
   - expect: The page should load successfully without redirecting
   - expect: The Leave Approval table and toolbar should be fully functional

---

### 9. Edge Cases and State Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-EDGE-01: Already-approved records do not show action buttons

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page, open Filters, set Status to "All", and click Apply
   - expect: Approved records in the table should have "-" in the Action column (no Approve/Reject buttons)
   - expect: Rejected records in the table should also have "-" in the Action column

#### 9.2. TC-EDGE-02: No records state when all filters return empty results

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Open Filters, set Status to "Rejected", select an employee who has no rejected leaves, and click Apply
   - expect: The table body should show an empty state or "no records" message
   - expect: No data rows should be visible

#### 9.3. TC-EDGE-03: Approve modal shows correct leave balance for the selected record

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Approve" on a Pending record and observe the modal
   - expect: The "Available Balance" section in the modal should show CL (Casual Leave) and SL (Sick Leave) balance values specific to that employee
   - expect: The balance values should be numeric (e.g., "CL: 0.5, SL: 0.5")

#### 9.4. TC-EDGE-04: Reject modal shows correct leave balance for the selected record

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record and observe the modal
   - expect: The "Available Balance" section in the reject modal should show CL and SL balance values specific to that employee
   - expect: The balance values should be the same as those shown in the Approve modal for the same record

#### 9.5. TC-EDGE-05: Multiple pending records can be approved/rejected sequentially

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Approve the first Pending record in the table (click Approve → confirm "Yes, Approve!")
   - expect: First record status changes to "Approved" with success toast
2. Immediately approve or reject the second Pending record in the table
   - expect: Second record is also processed successfully with appropriate status change and toast

#### 9.6. TC-EDGE-06: Rejection reason with maximum 150 characters is accepted

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Click "Reject" on a Pending record, type exactly 150 characters in the "Reason for Rejection" textarea, and click "Yes, Reject!"
   - expect: The rejection is submitted successfully with a success toast
   - expect: The character counter should show "Characters left: 0" when 150 characters are entered
   - expect: The record's Rejected Reason column should show the full 150-character reason

#### 9.7. TC-EDGE-07: Page refreshes and reloads with default filter applied

**File:** `tests/attendance/leave-approval.spec.ts`

**Steps:**
1. Navigate to the Leave Approval page, note the active filter (default date range), then reload the page
   - expect: The page should reload and re-apply the default date range filter
   - expect: The active filters bar should show the default date range badge
   - expect: The table should display the same records as before the reload (within the default date range)
