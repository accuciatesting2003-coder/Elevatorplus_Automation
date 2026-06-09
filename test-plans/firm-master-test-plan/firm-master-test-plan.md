# Firm Master - Test Plan

## Application Overview

The Firm Master page is part of the ElevatorPlus Firm Masters section, accessible at https://stage.elevatorplus.net/master/firm-master. It allows admin users to manage firm records used across the system. The page has two main sections: (1) an "Add Firm" form at the top, and (2) a data table listing all firm records below.

The Add Firm form contains five fields: "Firm Name *" (mandatory text input), "Registered Address *" (mandatory text input), "Contact No" (optional numeric-only input), "Email" (optional email-format input), and "Tax ID" (optional text input). The form includes two action buttons: "Clear" and "Submit".

When the Edit icon is clicked on a table row, the form switches to "Update Firm" mode with all fields pre-filled plus an additional "Status *" dropdown (options: Select Status, Active, Inactive), and the action button changes to "Update". Clicking "Clear" in Update mode resets the form back to Add mode.

The data table toolbar contains: a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25), a "Status:" filter dropdown (options: All, Active, Inactive; default Active), and a "Search Firm" text input.

---

## Fields Summary

| Field | Type | Requirement | Validation |
|-------|------|-------------|------------|
| Firm Name | Text Input | Mandatory | Required |
| Registered Address | Text Input | Mandatory | Required |
| Contact No | Numeric Input | Optional | Numeric only |
| Email | Text Input | Optional | Valid email format |
| Tax ID | Text Input | Optional | None |

---

## Test Scenarios

---

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Firm Master page loads successfully

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Log in with valid credentials (mobile: 9209365301, password: Shravani@123) and navigate to https://stage.elevatorplus.net/master/firm-master
    - expect: The page URL should be https://stage.elevatorplus.net/master/firm-master
    - expect: The page title in the navigation bar should read 'Firm Master' or 'Firm'
    - expect: The form card heading should display 'Add Firm'
    - expect: The 'Firm Name *' input field should be present and empty
    - expect: The 'Registered Address *' input field should be present and empty
    - expect: The 'Contact No' input field should be present and empty
    - expect: The 'Email' input field should be present and empty
    - expect: The 'Tax ID' input field should be present and empty
    - expect: The 'Clear' button and 'Submit' button should both be visible in the form
    - expect: The data table should load and display firm records with 'Active' status by default

#### 1.2. TC-SM-02: Verify all page elements, table columns, and toolbar layout

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/firm-master and inspect the form section
    - expect: The form section heading should read 'Add Firm'
    - expect: The 'Firm Name *' text input field should be visible and focusable
    - expect: The 'Registered Address *' text input field should be visible and focusable
    - expect: The 'Contact No' input field should be visible
    - expect: The 'Email' input field should be visible
    - expect: The 'Tax ID' input field should be visible
    - expect: The 'Clear' button and 'Submit' button should be present
  2. Inspect the data table toolbar section
    - expect: A 'Show:' label with a rows-per-page dropdown (options: 10, 25, 50, 100) defaulting to 25 should be present
    - expect: A 'Status:' label with a filter dropdown (options: All, Active, Inactive) defaulting to Active should be present
    - expect: A 'Search:' label with a 'Search Firm' text input should be present
  3. Inspect the data table header row
    - expect: Table header columns should include: Sr. No., Action, Firm Name, Registered Address, Contact No, Email, Tax ID, Status
    - expect: All columns should be visible
  4. Inspect a sample table data row
    - expect: Sr. No. cell should contain a sequential number
    - expect: Action cell should contain an Edit icon — no Delete icon
    - expect: Firm Name cell should contain the firm name text
    - expect: Status cell should display a badge/label reading 'Active' or 'Inactive'

---

### 2. Add Firm - Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-ADD-01: Successfully create a new Firm with only mandatory fields filled

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/master/firm-master
    - expect: Page loads with 'Add Firm' form visible
  2. Enter 'ABC Elevators Pvt Ltd' in 'Firm Name *', enter '123 Industrial Area, Pune' in 'Registered Address *', leave Contact No, Email, and Tax ID empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form fields should be cleared after successful submission
    - expect: The record 'ABC Elevators Pvt Ltd' should appear in the data table with Status 'Active'

#### 2.2. TC-ADD-02: Successfully create a new Firm with all fields filled

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and click Add/Create
  2. Enter 'XYZ Lifts Co.' in 'Firm Name *', '456 MG Road, Bangalore' in 'Registered Address *', '9876543210' in 'Contact No', 'xyzlifts@example.com' in 'Email', 'TAX12345IN' in 'Tax ID', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The form should reset after successful submission
    - expect: The record 'XYZ Lifts Co.' should appear in the data table with all fields correctly displayed and Status 'Active'

#### 2.3. TC-ADD-03: Successfully create a Firm with only Firm Name and Registered Address (optional fields empty)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, enter 'Skyrise Elevators' in 'Firm Name *', enter 'Plot 7, MIDC Nashik' in 'Registered Address *', leave all optional fields blank, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record 'Skyrise Elevators' should appear in the data table with empty values for Contact No, Email, and Tax ID, and Status 'Active'

#### 2.4. TC-ADD-04: Successfully create a Firm with Contact No filled (optional)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter '9123456780' in 'Contact No', leave Email and Tax ID empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should appear in the data table with the correct Contact No displayed

#### 2.5. TC-ADD-05: Successfully create a Firm with Email filled (optional)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'contact@elevatorsfirm.com' in 'Email', leave Contact No and Tax ID empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should appear in the data table with the correct Email displayed

#### 2.6. TC-ADD-06: Successfully create a Firm with Tax ID filled (optional)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'GSTIN27AAFCT1234Z' in 'Tax ID', leave Contact No and Email empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should appear in the data table with the correct Tax ID displayed

#### 2.7. TC-ADD-07: Successfully create multiple Firm records sequentially

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in 'Firm One' and its address, click 'Submit', then immediately fill in 'Firm Two' with a different address, and click 'Submit' again
    - expect: First submission: success toast appears and fields are cleared
    - expect: Second submission: success toast appears and fields are cleared again
    - expect: Both records 'Firm One' and 'Firm Two' appear in the data table with Status 'Active'

---

### 3. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit form with both mandatory fields empty shows validation errors

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and click the 'Submit' button without entering any value in any field
    - expect: An inline validation error message should appear below the 'Firm Name *' input field (e.g., 'Please enter firm name')
    - expect: An inline validation error message should appear below the 'Registered Address *' input field (e.g., 'Please enter registered address')
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.2. TC-VAL-02: Submit form with Firm Name empty shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, leave 'Firm Name *' blank, enter '123 Main Street, Mumbai' in 'Registered Address *', fill optional fields if desired, and click 'Submit'
    - expect: An inline validation error message should appear below the 'Firm Name *' input field
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.3. TC-VAL-03: Submit form with Registered Address empty shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, enter 'Valid Firm Name' in 'Firm Name *', leave 'Registered Address *' blank, and click 'Submit'
    - expect: An inline validation error message should appear below the 'Registered Address *' input field
    - expect: No new record should be created in the data table
    - expect: No success toast should appear

#### 3.4. TC-VAL-04: Validation error clears when valid input is entered after failed submission

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Submit' on the empty form to trigger the validation errors
    - expect: Inline validation errors are displayed for Firm Name and Registered Address
  2. Type 'Premier Elevators' in the 'Firm Name *' field
    - expect: The inline validation error for Firm Name should no longer be visible
  3. Type '789 Park Street, Chennai' in 'Registered Address *' and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should appear in the data table

#### 3.5. TC-VAL-05: Submit form with only whitespace in Firm Name shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, type '   ' (spaces only) in the 'Firm Name *' field, fill in a valid 'Registered Address *', and click 'Submit'
    - expect: Inline validation error should be displayed for Firm Name
    - expect: No new record should be created in the data table

#### 3.6. TC-VAL-06: Submit form with only whitespace in Registered Address shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in a valid 'Firm Name *', type '   ' (spaces only) in 'Registered Address *', and click 'Submit'
    - expect: Inline validation error should be displayed for Registered Address
    - expect: No new record should be created in the data table

#### 3.7. TC-VAL-07: Clicking Clear on invalid (empty-submitted) form removes validation errors

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Submit' on empty form to trigger validation errors, then click the 'Clear' button
    - expect: All inline validation errors should no longer be visible
    - expect: All input fields should be empty
    - expect: The form heading should still read 'Add Firm'

---

### 4. Contact No Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-CON-01: Contact No accepts valid numeric input

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter '9876543210' in 'Contact No', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should be created with Contact No '9876543210' displayed correctly in the data table

#### 4.2. TC-CON-02: Contact No rejects alphabetic characters

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'abcdefghij' in 'Contact No', and click 'Submit'
    - expect: The field should either reject non-numeric characters during typing (characters not appearing), or display a validation error on submit (e.g., 'Contact No must contain only numbers')
    - expect: No new record should be created with an invalid Contact No

#### 4.3. TC-CON-03: Contact No rejects alphanumeric input

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter '9876abc210' in 'Contact No', and click 'Submit'
    - expect: The field should reject non-numeric characters or display a validation error on submit
    - expect: No new record should be created with an invalid Contact No

#### 4.4. TC-CON-04: Contact No rejects special characters

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter '+91-9876543210' in 'Contact No', and click 'Submit'
    - expect: The field should reject non-numeric characters (special characters like +, - should not be accepted) or display a validation error on submit
    - expect: No new record should be created with an invalid Contact No

#### 4.5. TC-CON-05: Contact No is optional — form saves without it

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in 'Firm Name *' and 'Registered Address *', leave 'Contact No' empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record is saved successfully with an empty Contact No field

---

### 5. Email Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-EML-01: Email accepts valid email format

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'info@firmabc.com' in 'Email', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should be created with Email 'info@firmabc.com' displayed correctly in the data table

#### 5.2. TC-EML-02: Email accepts valid email with subdomain

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'contact@sales.firm.co.in' in 'Email', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should be created with the email displayed correctly

#### 5.3. TC-EML-03: Email rejects input without '@' symbol

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'invalidemail.com' in 'Email' (missing @), and click 'Submit'
    - expect: A validation error message should appear below the 'Email' field (e.g., 'Please enter a valid email address')
    - expect: No new record should be created with an invalid email

#### 5.4. TC-EML-04: Email rejects input without domain extension

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'user@domain' in 'Email' (no .com/.in extension), and click 'Submit'
    - expect: A validation error message should appear below the 'Email' field
    - expect: No new record should be created with an invalid email

#### 5.5. TC-EML-05: Email rejects input with only '@' symbol

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter '@' in 'Email', and click 'Submit'
    - expect: A validation error message should appear below the 'Email' field
    - expect: No new record should be created

#### 5.6. TC-EML-06: Email rejects plaintext with no format

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'notanemail' in 'Email', and click 'Submit'
    - expect: A validation error message should appear below the 'Email' field
    - expect: No new record should be created with invalid email format

#### 5.7. TC-EML-07: Email is optional — form saves without it

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in 'Firm Name *' and 'Registered Address *', leave 'Email' empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record is saved successfully with an empty Email field

---

### 6. Tax ID Field

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-TAX-01: Tax ID accepts alphanumeric input

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in mandatory fields, enter 'GSTIN27AABCT1234Z1Z5' in 'Tax ID', and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record should be created with the Tax ID displayed correctly in the data table

#### 6.2. TC-TAX-02: Tax ID is optional — form saves without it

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in 'Firm Name *' and 'Registered Address *', leave 'Tax ID' empty, and click 'Submit'
    - expect: A success toast notification should appear confirming creation
    - expect: The record is saved successfully with an empty Tax ID field

---

### 7. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-DUP-01: Submitting an existing Active Firm Name shows an error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, note an existing Active record's firm name (e.g., 'ABC Elevators Pvt Ltd'), enter the same firm name in 'Firm Name *', enter a different address in 'Registered Address *', and click 'Submit'
    - expect: An error toast message should appear (e.g., 'Something went wrong.' or 'Firm name already exists')
    - expect: No duplicate record should be added to the table

#### 7.2. TC-DUP-02: Test case-sensitivity for duplicate Firm Name

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, type the existing firm name in different case (e.g., 'abc elevators pvt ltd' when 'ABC Elevators Pvt Ltd' exists) in 'Firm Name *', enter an address, and click 'Submit'
    - expect: If the system is case-insensitive, an error toast should appear and no duplicate is created
    - expect: If the system is case-sensitive, a new record may be created — note the behavior for documentation

#### 7.3. TC-DUP-03: Submitting an existing Inactive Firm Name shows an error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive firm record (e.g., 'Old Firm Ltd'). Then change the filter back to 'Active'. In the 'Firm Name *' field, enter the name of the Inactive record observed, enter a different address in 'Registered Address *', and click 'Submit'
    - expect: An error toast message should appear (e.g., 'Something went wrong.' or 'Firm name already exists')
    - expect: No new record should be created with the Inactive firm's name
    - expect: The form should remain on the page without resetting

---

### 8. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-CLR-01: Clear button resets the Add Firm form

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page, fill in all fields ('Firm Name *', 'Registered Address *', 'Contact No', 'Email', 'Tax ID'), then click the 'Clear' button
    - expect: The 'Firm Name *' input field should be empty/cleared
    - expect: The 'Registered Address *' input field should be empty/cleared
    - expect: The 'Contact No' input field should be empty/cleared
    - expect: The 'Email' input field should be empty/cleared
    - expect: The 'Tax ID' input field should be empty/cleared
    - expect: The form heading should still read 'Add Firm'
    - expect: No record should have been created in the data table

#### 8.2. TC-CLR-02: Clear button in Edit/Update mode resets form back to Add Firm state

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and click the 'Edit' icon on any table row
    - expect: The form heading changes to 'Update Firm'
    - expect: The 'Firm Name *' field is pre-filled with the record's name
    - expect: The 'Registered Address *' field is pre-filled with the record's address
    - expect: Contact No, Email, and Tax ID fields reflect the record's stored values
    - expect: A 'Status *' dropdown appears with the current status pre-selected
    - expect: An 'Update' button replaces the 'Submit' button
    - expect: The 'Clear' button remains visible
  2. Click the 'Clear' button while in Update Firm mode
    - expect: The form heading reverts to 'Add Firm'
    - expect: All input fields are cleared and empty
    - expect: The 'Status *' dropdown disappears
    - expect: The 'Update' button reverts back to 'Submit' button

#### 8.3. TC-CLR-03: Clear button in Update mode with validation error resets the error state

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Firm Name *' field, click 'Update' to trigger the validation error, then click 'Clear'
    - expect: After clicking 'Clear', the inline validation error should not be visible
    - expect: The form should return to 'Add Firm' mode with all fields empty

---

### 9. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-EDT-01: Edit icon opens record in Update Firm mode with pre-filled fields

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and click the 'Edit' icon on a row with known values
    - expect: The form heading changes from 'Add Firm' to 'Update Firm'
    - expect: The 'Firm Name *' input field is pre-filled with the record's firm name
    - expect: The 'Registered Address *' input field is pre-filled with the record's registered address
    - expect: The 'Contact No' field reflects the stored value (or is empty if not set)
    - expect: The 'Email' field reflects the stored value (or is empty if not set)
    - expect: The 'Tax ID' field reflects the stored value (or is empty if not set)
    - expect: A 'Status *' dropdown appears with the current status pre-selected (e.g., 'Active')
    - expect: The 'Submit' button is replaced by an 'Update' button
    - expect: The 'Clear' button remains visible

#### 9.2. TC-EDT-02: Successfully update Firm Name

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record, clear the 'Firm Name *' field, type 'Updated Firm Name Ltd', keep all other fields unchanged, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode with empty fields
    - expect: The data table should reflect the updated firm name 'Updated Firm Name Ltd' in the corresponding row

#### 9.3. TC-EDT-03: Successfully update Registered Address

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record, clear the 'Registered Address *' field, type '999 New Address, Hyderabad', keep all other fields unchanged, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode
    - expect: The data table row should show the updated registered address '999 New Address, Hyderabad'

#### 9.4. TC-EDT-04: Successfully add Contact No during update (previously empty)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has no Contact No set, enter '8001234567' in the 'Contact No' field, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode
    - expect: The data table row should now display '8001234567' in the Contact No column

#### 9.5. TC-EDT-05: Successfully update Contact No to a new value

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has a Contact No set, clear the 'Contact No' field, enter '7009876543', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The data table row should reflect the updated Contact No '7009876543'

#### 9.6. TC-EDT-06: Successfully remove Contact No during update (set to empty)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has a Contact No set, clear the 'Contact No' field (leave it empty), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The data table row should show an empty value for Contact No

#### 9.7. TC-EDT-07: Successfully add Email during update (previously empty)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has no Email set, enter 'newfirm@example.com' in the 'Email' field, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The data table row should now display 'newfirm@example.com' in the Email column

#### 9.8. TC-EDT-08: Successfully update Email to a new valid value

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has an Email set, clear the 'Email' field, enter 'updated@newdomain.org', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The data table row should reflect the updated Email 'updated@newdomain.org'

#### 9.9. TC-EDT-09: Successfully update Tax ID

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record, update the 'Tax ID' field to a new value (e.g., 'NEWTAX9876'), and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The data table row should reflect the updated Tax ID 'NEWTAX9876'

#### 9.10. TC-EDT-10: Update with empty Firm Name field shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Firm Name *' input field (so it is empty), and click 'Update'
    - expect: Inline validation error should appear below the 'Firm Name *' input field
    - expect: No update should be submitted
    - expect: No success or error toast should appear

#### 9.11. TC-EDT-11: Update with empty Registered Address field shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Registered Address *' input field (so it is empty), and click 'Update'
    - expect: Inline validation error should appear below the 'Registered Address *' input field
    - expect: No update should be submitted
    - expect: No success or error toast should appear

#### 9.12. TC-EDT-12: Update Contact No to invalid (non-numeric) value shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Contact No' field, enter 'abcdefgh' (alphabetic characters) in 'Contact No', and click 'Update'
    - expect: The field should either reject non-numeric characters during typing or display a validation error on Update
    - expect: No update should be submitted with invalid Contact No

#### 9.13. TC-EDT-13: Update Email to invalid format shows validation error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a record, clear the 'Email' field, enter 'bademail.format' (missing @ and domain), and click 'Update'
    - expect: A validation error message should appear below the 'Email' field
    - expect: No update should be submitted with an invalid email format

#### 9.14. TC-EDT-14: Update Firm Name to match an existing Active record name shows error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on one record (e.g., 'Skyrise Elevators'), change its Firm Name to the name of another existing active record (e.g., 'XYZ Lifts Co.'), and click 'Update'
    - expect: An error toast (e.g., 'Something went wrong.' or 'Firm name already exists') should appear
    - expect: The original record should remain unchanged in the table

#### 9.15. TC-EDT-15: Update Lead Source status from Active to Inactive

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on an active firm record, keep all fields unchanged, change the 'Status *' dropdown from 'Active' to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode
    - expect: The firm record should no longer appear in the table when the Status filter is set to 'Active'
    - expect: The record should appear when the Status filter is changed to 'Inactive' or 'All'

#### 9.16. TC-EDT-16: Update Firm status from Inactive to Active (re-activate record)

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the Status filter dropdown to 'Inactive' and click the 'Edit' icon on an Inactive firm record
    - expect: The 'Update Firm' form opens with the record pre-filled and Status set to 'Inactive'
    - expect: All fields reflect the stored values
  2. Change the 'Status *' dropdown to 'Active' and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode
    - expect: The re-activated record should no longer appear when the Status filter is set to 'Inactive'
    - expect: The record should appear again when the Status filter is set to 'Active'

#### 9.17. TC-EDT-17: All fields are preserved after editing and updating without changes

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Click 'Edit' on a firm record that has all fields filled (firm name, address, contact no, email, tax id), do not change anything, and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The form resets to 'Add Firm' mode
    - expect: The data table row should still show all original values unchanged

#### 9.18. TC-EDT-18: Update Firm Name to match an existing Inactive record name shows error

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' and note the name of any Inactive firm record (e.g., 'Old Firm Ltd'). Change the Status filter back to 'Active' and click the 'Edit' icon on any Active record
    - expect: The form is in 'Update Firm' mode with the Active record's name pre-filled
  2. Clear the 'Firm Name *' input and type the name of the existing Inactive record (e.g., 'Old Firm Ltd'), then click 'Update'
    - expect: An error toast message should appear (e.g., 'Something went wrong.' or 'Firm name already exists')
    - expect: The original Active record should remain unchanged in the table
    - expect: No duplicate record should be created
    - expect: The form should remain in 'Update Firm' mode without resetting

---

### 10. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-FLT-01: Default status filter shows Active records only

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and check the 'Status:' filter dropdown default value
    - expect: The 'Status:' filter dropdown should default to 'Active'
    - expect: The table should display only records with an 'Active' status badge
    - expect: No 'Inactive' status records should be visible in the table

#### 10.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All'
    - expect: The table should display both Active and Inactive records
    - expect: Records with both 'Active' and 'Inactive' status badges should be visible

#### 10.3. TC-FLT-03: Filter table to show only Inactive records

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'Inactive'
    - expect: The table should display only records with an 'Inactive' status badge
    - expect: No 'Active' records should be visible
    - expect: If no Inactive records exist, the table should show a 'no records' message

#### 10.4. TC-FLT-04: Status filter resets when navigating away and back

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the 'Status:' filter dropdown to 'All', then navigate to another page (e.g., Dashboard), and navigate back to the Firm Master page
    - expect: The Status filter should reset to the default value 'Active' upon re-navigation

---

### 11. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRC-01: Search by partial Firm Name returns matching results

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and type 'ABC' in the 'Search Firm' input box
    - expect: The table should filter to show only records containing 'ABC' in the Firm Name (e.g., 'ABC Elevators Pvt Ltd')
    - expect: Records not containing 'ABC' should be hidden

#### 11.2. TC-SRC-02: Search by complete Firm Name returns exact matching result

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Type the exact name of an existing firm (e.g., 'XYZ Lifts Co.') in the 'Search Firm' input box
    - expect: Only the record with that exact firm name should be displayed in the table
    - expect: All other records should be hidden

#### 11.3. TC-SRC-03: Search with a non-existent  firm name returns no results

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Type 'XYZNONEXISTENTFIRM999' in the 'Search Firm' input box
    - expect: The table body should show a 'no records' message (e.g., 'There are no records to display')
    - expect: No data rows should be visible in the table

#### 11.4. TC-SRC-04: Clearing the search input restores the full list

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Type a search term to filter the table, then clear the 'Search Firm' input
    - expect: The table should restore and display the full list of records based on the current Status filter
    - expect: Previously hidden records should reappear

#### 11.5. TC-SRC-05: Search is case-insensitive

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Type 'abc elevators' (all lowercase) in the 'Search Firm' input box when 'ABC Elevators Pvt Ltd' exists
    - expect: The record 'ABC Elevators Pvt Ltd' should appear in the filtered results even though the casing differs

#### 11.6. TC-SRC-06: Search filters apply on top of the active Status filter

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Active', then type 'XYZ' in the 'Search Firm' input box
    - expect: Only Active records containing 'XYZ' in the Firm Name should appear
    - expect: Inactive records matching 'XYZ' should not appear

---

### 12. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Navigate to the Firm Master page and inspect the 'Show:' dropdown in the table toolbar
    - expect: The 'Show:' dropdown should have '25' selected as the default value

#### 12.2. TC-PAG-02: Change rows-per-page to 10

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '10'
    - expect: The table should display a maximum of 10 rows
    - expect: If there are more than 10 records, pagination controls (Next page, Previous page) should appear

#### 12.3. TC-PAG-03: Navigate between pages using pagination controls

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Set 'Show:' to '10' to enable pagination (assuming more than 10 records exist), then click the 'Next page' button
    - expect: The table should navigate to the next page showing the next set of records
    - expect: The current page indicator should update
  2. Click the 'Previous page' button
    - expect: The table should navigate back to the previous page
    - expect: The current page indicator should revert to page 1

#### 12.4. TC-PAG-04: Change rows-per-page to 50 and then 100

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the 'Show:' dropdown to '50'
    - expect: The table should display up to 50 records per page
  2. Change the 'Show:' dropdown to '100'
    - expect: The table should display up to 100 records per page
    - expect: All records should be visible on a single page if the total count is 100 or fewer

---

### 13. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-INACT-01: Inactive records are hidden from the Active filter view by default

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive firm record exists (by editing a record and setting it to Inactive), then navigate to the Firm Master page
    - expect: The Status filter defaults to 'Active'
    - expect: The Inactive record should not appear in the table under the Active filter

#### 13.2. TC-INACT-02: Inactive records are visible when filtering by Inactive or All

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Ensure at least one Inactive record exists. Change the Status filter to 'Inactive'
    - expect: Only Inactive records should be displayed in the table
    - expect: Active records should be hidden
  2. Change the Status filter to 'All'
    - expect: Both Active and Inactive records should appear in the table

#### 13.3. TC-INACT-03: Edit icon is available for Inactive records

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Change the Status filter to 'Inactive' to reveal inactive records, then click the 'Edit' icon on an Inactive record
    - expect: The 'Update Firm' form should open with the record's data pre-filled
    - expect: The 'Status *' dropdown should show 'Inactive' as the current selection
    - expect: All fields (Firm Name, Registered Address, Contact No, Email, Tax ID) should reflect the stored values for the inactive record

#### 13.4. TC-INACT-04: Field values are preserved when a record is inactivated and reactivated

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Edit a record that has all fields filled, change the Status to 'Inactive', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record should no longer appear under the Active filter
  2. Change the Status filter to 'Inactive', click 'Edit' on the record, change Status back to 'Active', and click 'Update'
    - expect: A success toast notification should appear confirming the update
    - expect: The record should reappear under the Active filter with all field values preserved

---

### 14. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-NAV-01: Firm Master is accessible via the Firm Masters sidebar menu

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Log in to ElevatorPlus and click 'Firm Masters' in the left sidebar navigation menu to expand it
    - expect: The Firm Masters submenu should expand showing available sub-masters
    - expect: A 'Firm Master' link should be visible in the expanded submenu
  2. Click the 'Firm Master' link in the submenu
    - expect: The browser should navigate to https://stage.elevatorplus.net/master/firm-master
    - expect: The Firm Master page should load with the 'Add Firm' form and data table

#### 14.2. TC-NAV-02: Unauthenticated users cannot access the Firm Master page

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. Without logging in (or after logging out), directly navigate to https://stage.elevatorplus.net/master/firm-master
    - expect: The user should be redirected to the login page
    - expect: The Firm Master page content should not be accessible without authentication

#### 14.3. TC-NAV-03: Direct URL navigation to Firm Master works when authenticated

**File:** `tests/Firm-master/firm-master.spec.ts`

**Steps:**
  1. While authenticated, directly navigate to https://stage.elevatorplus.net/master/firm-master via the browser address bar
    - expect: The page should load successfully without redirecting
    - expect: The 'Add Firm' form and data table should be fully functional

---

## Summary

| Category | Count |
|----------|-------|
| Smoke | 2 |
| Add Firm - Happy Path | 7 |
| Mandatory Field Validation | 7 |
| Contact No Validation | 5 |
| Email Validation | 7 |
| Tax ID | 2 |
| Duplicate Prevention | 3 |
| Clear Button Behavior | 3 |
| Edit and Update Operations | 18 |
| Status Filter | 4 |
| Search Functionality | 6 |
| Rows Per Page / Pagination | 4 |
| Inactive Status Management | 4 |
| Navigation and Access | 3 |
| **Total** | **75** |
