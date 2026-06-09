# HR Setting Master Test Plan

## Application Overview

The HR Setting page is part of the ElevatorPlus Attendance module, accessible at https://stage.elevatorplus.net/attendance/hr-setting via **Attendance > HR Setting** in the left sidebar. It allows admin users to configure company-wide HR attendance policies that apply to **all employees**.

This is a **single-record settings page** — not a CRUD master with a list/table. The form always shows the currently saved configuration, pre-populated with existing values. There is no Add/Delete operation; the only action is **Submit** to update the settings.

**Page heading:** "HR Setting" (breadcrumb in topbar and sidebar link)

### Form Fields

The form contains **10 mandatory fields** (marked with `*`) and **2 optional checkboxes**:

| # | Field Label | Type | Required | Helper Text |
|---|---|---|---|---|
| 1 | Week Offs (Per Week) * | Text input | Yes | Number of week offs allowed per week. |
| 2 | Casual Leaves (Yearly) * | Text input | Yes | Total casual leaves per year. |
| 3 | Sick Leaves (Yearly) * | Text input | Yes | Total sick leaves per year. |
| 4 | Casual Leaves Applicable After (In Months) * | Text input | Yes | Months before casual leaves become applicable. |
| 5 | Comp Offs Expire After(in Days) * | Text input | Yes | Days after which comp offs expire. |
| 6 | Leaves Expire Date | Date input | No | Date when all pending leaves expire. |
| 7 | Late Mark (In Minutes) * | Number (spinbutton) | Yes | Minutes after which an employee is marked late. |
| 8 | Max Carry Forward Casual Leaves (Yearly) * | Text input | Yes | Max casual leaves that can carry forward yearly. |
| 9 | Max Carry Forward Sick Leaves (Yearly) * | Text input | Yes | Max sick leaves that can carry forward yearly. |
| 10 | Max Sick Leaves Per Month * | Text input | Yes | Max sick leaves allowed per month. |
| 11 | Selfie Mandatory | Checkbox | No | Makes selfie capture mandatory for attendance. |
| 12 | Attendance Comment | Checkbox | No | Makes attendance comment mandatory for employees. |

### Submit Flow

Clicking the **Submit** button opens a **SweetAlert2 confirmation dialog**:
- Icon: Orange warning (!)
- Title: "Are you sure?"
- Message: "Changes will be applied to all employees, you won't be able to revert this!"
- Buttons: **Cancel** (outlined) and **Confirm** (blue)

On **Confirm** with valid data: Toast notification **"HR Setting has been saved successfully!"** appears and the settings are persisted.

On **Cancel**: Dialog closes, no changes are saved, form retains current values.

### Form Information Panel

An info icon button ("Form Information") is located next to the card heading. Clicking it opens a right-side panel with:
- **Title:** HR Settings
- **Note:** Descriptions of all form fields

### No Clear Button

There is **no Clear button** on this form. To reset values, the user must manually edit each field back to the desired value.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: HR Setting page loads successfully

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Log in with valid credentials and navigate to https://stage.elevatorplus.net/attendance/hr-setting
   - expect: Page URL should be https://stage.elevatorplus.net/attendance/hr-setting
   - expect: Page heading in topbar should display "HR Setting"
   - expect: Attendance > HR Setting should be highlighted as active in the sidebar
   - expect: The form card with heading "HR Setting" should be visible
   - expect: All 12 form fields should be present and visible
   - expect: All 10 mandatory fields should be pre-populated with existing values (not empty)
   - expect: The Submit button should be visible and enabled

#### 1.2. TC-SM-02: Verify all form fields, labels, and helper texts are present

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to https://stage.elevatorplus.net/attendance/hr-setting and inspect the form
   - expect: "Week Offs (Per Week) *" label and input with helper "Number of week offs allowed per week." are present
   - expect: "Casual Leaves (Yearly) *" label and input with helper "Total casual leaves per year." are present
   - expect: "Sick Leaves (Yearly) *" label and input with helper "Total sick leaves per year." are present
   - expect: "Casual Leaves Applicable After (In Months) *" label and input with helper "Months before casual leaves become applicable." are present
   - expect: "Comp Offs Expire After(in Days) *" label and input with helper "Days after which comp offs expire." are present
   - expect: "Leaves Expire Date" label and date input with helper "Date when all pending leaves expire." are present (no asterisk — optional)
   - expect: "Late Mark (In Minutes) *" label and number input with helper "Minutes after which an employee is marked late." are present
   - expect: "Max Carry Forward Casual Leaves (Yearly) *" label and input with helper "Max casual leaves that can carry forward yearly." are present
   - expect: "Max Carry Forward Sick Leaves (Yearly) *" label and input with helper "Max sick leaves that can carry forward yearly." are present
   - expect: "Max Sick Leaves Per Month *" label and input with helper "Max sick leaves allowed per month." are present
   - expect: "Selfie Mandatory" label with checkbox is present (no asterisk — optional)
   - expect: "Attendance Comment" label with checkbox is present (no asterisk — optional)
   - expect: A single "Submit" button is present at the bottom right of the form

#### 1.3. TC-SM-03: Form Information panel opens and closes correctly

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and click the info icon ("Form Information") button next to the card heading
   - expect: A right-side information panel should appear
   - expect: The panel heading should display "HR Setting"
   - expect: A "Title: HR Settings" entry should be visible
   - expect: A "Note:" section with field descriptions should be visible
2. Close the information panel by clicking the close (X) link or navigating away
   - expect: The panel should close and the form should be visible again

---

### 2. Update Settings — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-UPD-01: Successfully update HR settings with all mandatory fields filled

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to https://stage.elevatorplus.net/attendance/hr-setting
   - expect: Form is pre-filled with existing values
2. Update "Week Offs (Per Week)" to a valid numeric value (e.g., change to "2")
   - expect: Input accepts and shows the new value
3. Click "Submit"
   - expect: SweetAlert2 confirmation dialog appears with title "Are you sure?"
   - expect: Dialog message reads "Changes will be applied to all employees, you won't be able to revert this!"
   - expect: "Cancel" and "Confirm" buttons are visible
4. Click "Confirm"
   - expect: Toast notification "HR Setting has been saved successfully!" appears
   - expect: Dialog closes
   - expect: Form retains the updated values

#### 2.2. TC-UPD-02: Update Leaves Expire Date (optional date field)

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and set a new date in the "Leaves Expire Date" field (e.g., change from current to a future date like 2027-12-31)
   - expect: Date field accepts the new date value
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Leaves Expire Date field retains the newly selected date after save

#### 2.3. TC-UPD-03: Clear Leaves Expire Date (optional field can be empty)

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and clear the "Leaves Expire Date" field
   - expect: Field becomes empty (no date selected)
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: No validation error for the optional date field when empty

#### 2.4. TC-UPD-04: Toggle Selfie Mandatory checkbox and save

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and note the current state of "Selfie Mandatory" checkbox (checked or unchecked)
2. Toggle the "Selfie Mandatory" checkbox (check if unchecked; uncheck if checked)
   - expect: Checkbox state changes immediately on click
3. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Checkbox reflects the newly toggled state after save
4. Reload the page
   - expect: Checkbox persists the toggled state

#### 2.5. TC-UPD-05: Toggle Attendance Comment checkbox and save

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and note the current state of "Attendance Comment" checkbox
2. Toggle the "Attendance Comment" checkbox
   - expect: Checkbox state changes on click
3. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Checkbox retains the toggled state after save

#### 2.6. TC-UPD-06: Update all mandatory fields with new valid values and save

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and update each mandatory field to a valid numeric value:
   - Week Offs (Per Week): e.g., 1
   - Casual Leaves (Yearly): e.g., 8
   - Sick Leaves (Yearly): e.g., 5
   - Casual Leaves Applicable After (In Months): e.g., 3
   - Comp Offs Expire After(in Days): e.g., 45
   - Late Mark (In Minutes): e.g., 10
   - Max Carry Forward Casual Leaves (Yearly): e.g., 4
   - Max Carry Forward Sick Leaves (Yearly): e.g., 2
   - Max Sick Leaves Per Month: e.g., 2
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: All updated values persist after save

---

### 3. Confirmation Dialog Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-CNF-01: Submit button opens confirmation dialog

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page (with all fields filled) and click "Submit"
   - expect: SweetAlert2 confirmation dialog appears
   - expect: Dialog has an orange warning icon
   - expect: Dialog title reads "Are you sure?"
   - expect: Dialog message reads "Changes will be applied to all employees, you won't be able to revert this!"
   - expect: "Cancel" and "Confirm" buttons are present

#### 3.2. TC-CNF-02: Clicking Cancel in confirmation dialog closes it without saving

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, modify a field value (e.g., change Week Offs to a different value), and click "Submit" to open the confirmation dialog
   - expect: Confirmation dialog is open with the warning message
2. Click "Cancel" in the confirmation dialog
   - expect: Dialog closes without saving
   - expect: Form still shows the modified (unsaved) value in the field
   - expect: No toast notification appears
   - expect: Page stays on the HR Setting page

#### 3.3. TC-CNF-03: Clicking Confirm in confirmation dialog saves settings

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, make any change to a field, click "Submit" to open the confirmation dialog, then click "Confirm"
   - expect: Dialog closes
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: The changed value is persisted (visible after page reload)

---

### 4. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-VAL-01: Submit with empty Week Offs field — validation or server error

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear the "Week Offs (Per Week)" field (leave it empty), and click "Submit" → "Confirm"
   - expect: Either inline validation error appears on the field before dialog (client-side), OR the server rejects the save and shows an error toast/message
   - expect: Settings are NOT saved if the field is empty

#### 4.2. TC-VAL-02: Submit with empty Casual Leaves field — validation or server error

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear the "Casual Leaves (Yearly)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving
   - expect: "Casual Leaves (Yearly)" field error is shown

#### 4.3. TC-VAL-03: Submit with empty Sick Leaves field — validation or server error

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear the "Sick Leaves (Yearly)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.4. TC-VAL-04: Submit with empty Casual Leaves Applicable After field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Casual Leaves Applicable After (In Months)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.5. TC-VAL-05: Submit with empty Comp Offs Expire After field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Comp Offs Expire After(in Days)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.6. TC-VAL-06: Submit with empty Late Mark field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Late Mark (In Minutes)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.7. TC-VAL-07: Submit with empty Max Carry Forward Casual Leaves field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Max Carry Forward Casual Leaves (Yearly)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.8. TC-VAL-08: Submit with empty Max Carry Forward Sick Leaves field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Max Carry Forward Sick Leaves (Yearly)" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

#### 4.9. TC-VAL-09: Submit with empty Max Sick Leaves Per Month field

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear "Max Sick Leaves Per Month" field, and click "Submit" → "Confirm"
   - expect: Validation error or server error prevents saving

---

### 5. Input Value Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-INP-01: Numeric fields accept valid positive integers

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and enter valid positive integer values in all mandatory numeric fields (e.g., Week Offs = 2, Casual Leaves = 10, etc.)
   - expect: All fields accept and display the entered values
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears

#### 5.2. TC-INP-02: Late Mark (In Minutes) field only accepts numbers and should accepts valid min number for example it shpuld not accepts greater than 59 0r 60  (spinbutton)

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and try to enter a non-numeric value (e.g., "abc") in the "Late Mark (In Minutes)" spinbutton field
   - expect: Non-numeric input is either rejected (not entered) or the field value defaults to its current numeric value
   - expect: The field does not accept alphabetic characters

#### 5.3. TC-INP-03: Fields retain correct values after page reload

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, note all current field values, then reload the page
   - expect: All fields are pre-populated with the same values as before the reload
   - expect: No field is cleared or reset to a default after reload

#### 5.4. TC-INP-04: Zero value in numeric field behavior

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and enter "0" in the "Week Offs (Per Week)" field
   - expect: Observe whether 0 is accepted as a valid value or rejected with a validation error
2. Click "Submit" → "Confirm"
   - expect: Note whether the save succeeds or an error is shown for zero values

#### 5.5. TC-INP-05: Decimal value in text-type numeric fields

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and enter a decimal value (e.g., "1.5") in "Week Offs (Per Week)" field
   - expect: Observe whether decimals are accepted or rejected
2. Click "Submit" → "Confirm"
   - expect: Note whether the server accepts or rejects decimal input for integer-only fields

---

### 6. Checkbox Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CHK-01: Selfie Mandatory checkbox toggles correctly

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and observe the initial state of "Selfie Mandatory" checkbox
   - expect: Checkbox is either checked or unchecked
2. Click the checkbox to toggle it
   - expect: Checkbox state changes immediately (checked → unchecked or vice versa)
3. Click the checkbox again to revert
   - expect: Checkbox returns to the original state

#### 6.2. TC-CHK-02: Attendance Comment checkbox toggles correctly

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and observe the initial state of "Attendance Comment" checkbox
2. Click the checkbox to toggle it
   - expect: Checkbox state changes immediately
3. Click again to revert
   - expect: Checkbox returns to its original state

#### 6.3. TC-CHK-03: Both checkboxes can be unchecked simultaneously

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page; if both checkboxes are checked, uncheck both "Selfie Mandatory" and "Attendance Comment"
   - expect: Both checkboxes are unchecked
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Both checkboxes remain unchecked after save

#### 6.4. TC-CHK-04: Both checkboxes can be checked simultaneously

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page; if both checkboxes are unchecked, check both "Selfie Mandatory" and "Attendance Comment"
   - expect: Both checkboxes are checked
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Both checkboxes remain checked after save

---

### 7. Leaves Expire Date Field

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-DTE-01: Date field accepts a valid future date

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and set "Leaves Expire Date" to a valid future date (e.g., 2028-03-31)
   - expect: Date is accepted and displayed in the date input
2. Click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
   - expect: Leaves Expire Date shows the newly set date after save

#### 7.2. TC-DTE-02: Date field should not  accepts a past date

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and set "Leaves Expire Date" to a past date (e.g., 2024-01-01)
   - expect: Observe whether the field accepts a past date or shows a validation error
2. Click "Submit" → "Confirm"
   - expect: Date field should not  accepts a past date


#### 7.3. TC-DTE-03: Clearing Leaves Expire Date and saving

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, clear the "Leaves Expire Date" field so it is empty, and click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears (field is optional)
   - expect: Leaves Expire Date field is empty after save

---

### 8. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-NAV-01: HR Setting is accessible via the Attendance sidebar menu

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Log in to ElevatorPlus and click "Attendance" in the left sidebar navigation to expand it
   - expect: The Attendance submenu expands showing: HR Setting, Leave Approval, Week Off Roster, Shift Master, Daily Attendance Report, Monthly Attendance Report, Summary Report, Holiday, Leave Balances
2. Click "HR Setting" in the Attendance submenu
   - expect: Browser navigates to https://stage.elevatorplus.net/attendance/hr-setting
   - expect: The HR Setting form loads with all fields pre-populated
   - expect: "HR Setting" link is highlighted as active in the sidebar

#### 8.2. TC-NAV-02: Direct URL navigation works when authenticated

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. While authenticated, navigate directly to https://stage.elevatorplus.net/attendance/hr-setting via address bar
   - expect: Page loads successfully without redirecting to login
   - expect: The HR Setting form is fully visible and functional

#### 8.3. TC-NAV-03: Unauthenticated users are redirected to login

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Without logging in (or after logging out), navigate directly to https://stage.elevatorplus.net/attendance/hr-setting
   - expect: User is redirected to the login page
   - expect: HR Setting page content is not accessible without authentication

---

### 9. Page State and Data Persistence

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-PRS-01: Settings persist correctly after page reload

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, update a field (e.g., set "Late Mark (In Minutes)" to a unique value like "20"), click "Submit" → "Confirm"
   - expect: Toast "HR Setting has been saved successfully!" appears
2. Reload the page
   - expect: "Late Mark (In Minutes)" field shows the value "20" that was just saved
   - expect: All other fields retain their previously saved values

#### 9.2. TC-PRS-02: Cancelling the confirmation dialog does not persist changes

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and note the current value of "Casual Leaves (Yearly)"
2. Change "Casual Leaves (Yearly)" to a different value (e.g., from 6 to 12), click "Submit" to open the confirmation dialog, then click "Cancel"
   - expect: Dialog closes with no save
   - expect: Form still shows the modified (but unsaved) value "12" in the field (state persists in the UI but not on the server)
3. Reload the page
   - expect: "Casual Leaves (Yearly)" reverts to the original value (e.g., 6), confirming the change was not saved

#### 9.3. TC-PRS-03: Navigating away from the page without saving does not alter settings

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page, change a field value (e.g., "Week Offs (Per Week)" from 1 to 5), and navigate away to another page WITHOUT clicking Submit
   - expect: No confirmation prompt for unsaved changes (observe if any)
2. Navigate back to https://stage.elevatorplus.net/attendance/hr-setting
   - expect: "Week Offs (Per Week)" shows the original saved value (1), not the changed value (5)
   - expect: The unsaved change is discarded on navigation

---

### 10. Edge Cases

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-EDGE-01: Very large numeric value in mandatory fields

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and enter an extremely large number (e.g., "9999") in "Casual Leaves (Yearly)", then click "Submit" → "Confirm"
   - expect: Observe whether the server accepts or rejects very large values
   - expect: If accepted, toast "HR Setting has been saved successfully!" appears

#### 10.2. TC-EDGE-02: Negative value in numeric fields

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and try entering a negative value (e.g., "-5") in "Week Offs (Per Week)", then click "Submit" → "Confirm"
   - expect: Observe whether negative values are accepted by the form or rejected with a validation error
   - expect: If rejected, the error message is displayed near the relevant field

#### 10.3. TC-EDGE-03: Alphabetic characters in numeric fields

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and type alphabetic text (e.g., "abc") in "Sick Leaves (Yearly)" field
   - expect: Observe whether the field rejects non-numeric input immediately or on submit
2. Click "Submit" → "Confirm"
   - expect: An appropriate validation error or server error is shown
   - expect: Settings are NOT saved with invalid input

#### 10.4. TC-EDGE-04: Max Carry Forward Sick Leaves should not  greater than Total Sick Leaves

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and set "Sick Leaves (Yearly)" to "3" and "Max Carry Forward Sick Leaves (Yearly)" to "10" (carry forward > total)
2. Click "Submit" → "Confirm"
expect:  Max Carry Forward Sick Leaves should not  greater than Total Sick Leaves
   

#### 10.5. TC-EDGE-05: Max Carry Forward Casual Leaves should not  greater than Total Casual Leaves

**File:** `tests/attendance/hr-setting.spec.ts`

**Steps:**
1. Navigate to the HR Setting page and set "Casual Leaves (Yearly)" to "3" and "Max Carry Forward Casual Leaves (Yearly)" to "10"
2. Click "Submit" → "Confirm"
   expect: Max Carry Forward Casual Leaves should not  greater than Total Casual Leaves


