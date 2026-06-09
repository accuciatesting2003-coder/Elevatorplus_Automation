# Prefix & Numbering Test Plan

## Application Overview

The Prefix & Numbering page is accessible via Settings Master → App Settings → Prefix & Numbering on the ElevatorPlus staging app at `https://stage.elevatorplus.net`. It controls how document numbers are generated across the application.

The page is divided into two sections:

1. **Financial Year** — governs how the financial year is represented in document prefixes, controlled by the **Prefix Year** dropdown.
2. **Document Series** — contains a **Skip FY Reset** toggle and individual document type rows (each with a configurable pattern, available tokens, and a preview).

---

## Functional Rules

### Financial Year Section — Prefix Year Dropdown Behaviour

| Prefix Year Value | Fields Displayed | `{financialYear}` Token in Available Tokens |
|---|---|---|
| **Automatic** | Financial Year Change On (mandatory, calendar) | Visible |
| **Manual** | Financial Year Change On (mandatory) + Prefix Financial Year (mandatory) | Visible |
| **Not Required** | No additional fields | Hidden |

- When **Not Required** is selected, the `{financialYear}` key is removed from the Available Tokens list.
- If the pattern for any document already contains `{financialYear}` and the user then switches Prefix Year to **Not Required**, an inline error must appear:
  > `{financialYear} cannot be used when Prefix Year is "Not Required"`

### Document Series Section — Pattern Preview

- The preview (visible behind/beside the eye icon) updates to reflect whatever value is typed into the pattern field.

### Document Series Section — Skip FY Reset Toggle

- The **Skip FY Reset** toggle can be enabled or disabled and the state must persist.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-PN-01: Prefix & Numbering page loads successfully

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Log in and navigate to Settings Master → App Settings → Prefix & Numbering
   - expect: The page heading or tab for **"Prefix & Numbering"** is visible
   - expect: The **Financial Year** section is visible
   - expect: The **Document Series** section is visible
   - expect: The **Prefix Year** dropdown is visible

#### 1.2. TC-PN-02: Financial Year section contains the Prefix Year dropdown

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering
2. Locate the **Financial Year** section
   - expect: The **"Prefix Year"** dropdown is present
   - expect: The dropdown contains the options **Automatic**, **Manual**, and **Not Required**

#### 1.3. TC-PN-03: Document Series section contains the Skip FY Reset toggle

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering
2. Locate the **Document Series** section
   - expect: The **"Skip FY Reset"** toggle is visible

---

### 2. Financial Year — Prefix Year: Automatic

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-PN-AUTO-01: Selecting "Automatic" shows Financial Year Change On field

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Financial Year section
2. Select **Automatic** from the **Prefix Year** dropdown
   - expect: The **"Financial Year Change On"** calendar field is visible
   - expect: No other additional financial year fields are shown (Prefix Financial Year field is **not** visible)

#### 2.2. TC-PN-AUTO-02: Financial Year Change On is mandatory when Prefix Year is "Automatic"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Automatic** from Prefix Year
2. Clear the **Financial Year Change On** field (if pre-filled)
3. Attempt to save the form
   - expect: A validation error is shown indicating **Financial Year Change On** is required
   - expect: The form does not save

#### 2.3. TC-PN-AUTO-03: `{financialYear}` token is visible in Available Tokens when Prefix Year is "Automatic"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Automatic** from Prefix Year
2. Locate the **Available Tokens** list (in any document series row)
   - expect: The **`{financialYear}`** key is present in the Available Tokens list

#### 2.4. TC-PN-AUTO-04: Saving with Automatic and a valid Financial Year Change On date persists successfully

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Automatic** from Prefix Year
2. Set a valid date in the **Financial Year Change On** field
3. Save the settings
   - expect: No validation errors are shown
   - expect: Success confirmation is displayed (toast or message)
4. Reload the page
   - expect: Prefix Year is still **Automatic** and the saved date is reflected in Financial Year Change On

---

### 3. Financial Year — Prefix Year: Manual

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-PN-MAN-01: Selecting "Manual" shows Financial Year Change On and Prefix Financial Year fields

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Financial Year section
2. Select **Manual** from the **Prefix Year** dropdown
   - expect: The **"Financial Year Change On"** field is visible
   - expect: The **"Prefix Financial Year"** field is visible

#### 3.2. TC-PN-MAN-02: Financial Year Change On is mandatory when Prefix Year is "Manual"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
2. Clear the **Financial Year Change On** field
3. Fill in a valid value for **Prefix Financial Year**
4. Attempt to save the form
   - expect: A validation error is shown for **Financial Year Change On**
   - expect: The form does not save

#### 3.3. TC-PN-MAN-03: Prefix Financial Year is mandatory when Prefix Year is "Manual"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
2. Fill in a valid date in **Financial Year Change On**
3. Clear the **Prefix Financial Year** field
4. Attempt to save the form
   - expect: A validation error is shown for **Prefix Financial Year**
   - expect: The form does not save

#### 3.4. TC-PN-MAN-04: Both mandatory fields empty when Prefix Year is "Manual" shows two validation errors

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
2. Ensure both **Financial Year Change On** and **Prefix Financial Year** are empty
3. Attempt to save the form
   - expect: Validation errors are shown for both **Financial Year Change On** and **Prefix Financial Year**

#### 3.5. TC-PN-MAN-05: `{financialYear}` token is visible in Available Tokens when Prefix Year is "Manual"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
2. Locate the **Available Tokens** list
   - expect: The **`{financialYear}`** key is present in the Available Tokens list

#### 3.6. TC-PN-MAN-06: Saving with Manual and both fields valid persists successfully

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
2. Set a valid date in **Financial Year Change On** and a valid value in **Prefix Financial Year**
3. Save the settings
   - expect: No validation errors are shown
   - expect: Success confirmation is displayed
4. Reload the page
   - expect: Prefix Year is still **Manual**, and both saved values are reflected

---

### 4. Financial Year — Prefix Year: Not Required

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-PN-NR-01: Selecting "Not Required" hides all financial year sub-fields

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Financial Year section
2. Select **Not Required** from the **Prefix Year** dropdown
   - expect: The **"Financial Year Change On"** field is **not** visible
   - expect: The **"Prefix Financial Year"** field is **not** visible

#### 4.2. TC-PN-NR-02: `{financialYear}` token is hidden from Available Tokens when Prefix Year is "Not Required"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Not Required** from Prefix Year
2. Locate the **Available Tokens** list
   - expect: The **`{financialYear}`** key is **not** present in the Available Tokens list

#### 4.3. TC-PN-NR-03: Using `{financialYear}` in pattern then switching to "Not Required" shows inline error

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, ensure Prefix Year is set to **Automatic** or **Manual**
2. Open any document series row and enter a pattern that includes **`{financialYear}`** (e.g. `INV-{financialYear}-{number}`)
3. Change the **Prefix Year** dropdown to **Not Required**
   - expect: An inline error message is displayed on the affected pattern field:
     > `{financialYear} cannot be used when Prefix Year is "Not Required"`
   - expect: The form cannot be saved while this error is present

#### 4.4. TC-PN-NR-04: Removing `{financialYear}` from pattern clears the error after switching to "Not Required"

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Follow steps 1–3 of TC-PN-NR-03 to trigger the error
2. Edit the pattern to remove `{financialYear}` from the value
   - expect: The inline error message is no longer displayed
   - expect: The form can be saved successfully

#### 4.5. TC-PN-NR-05: Saving with "Not Required" persists successfully

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Not Required** from Prefix Year
2. Ensure no pattern contains `{financialYear}`
3. Save the settings
   - expect: No validation errors are shown
   - expect: Success confirmation is displayed
4. Reload the page
   - expect: Prefix Year is still **Not Required**

---

### 5. Pattern Preview (Eye Icon)

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-PN-PRV-01: Pattern preview reflects typed pattern value

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Document Series section
2. Open any document row that has a pattern input field
3. Clear the current pattern and type a new pattern (e.g. `TEST-{number}`)
4. Click or hover over the **eye icon** adjacent to the pattern field
   - expect: The preview displays the pattern value entered (e.g. `TEST-{number}` or a resolved sample like `TEST-001`)

#### 5.2. TC-PN-PRV-02: Pattern preview updates dynamically as the pattern changes

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Document Series, open any document row
2. Note the current preview value shown next to the eye icon
3. Update the pattern to a different value
   - expect: The preview next to the eye icon reflects the updated pattern (not the old value)

---

### 6. Document Series — Skip FY Reset Toggle

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-PN-SKP-01: Skip FY Reset toggle can be enabled

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Document Series section
2. If the **Skip FY Reset** toggle is currently disabled, enable it
   - expect: Toggle switches to the **enabled** (on) state

#### 6.2. TC-PN-SKP-02: Skip FY Reset toggle can be disabled

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Document Series section
2. If the **Skip FY Reset** toggle is currently enabled, disable it
   - expect: Toggle switches to the **disabled** (off) state

#### 6.3. TC-PN-SKP-03: Skip FY Reset toggle state persists after page reload

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering → Document Series section
2. Note the current state of **Skip FY Reset**; toggle it to the opposite state and save
3. Reload the page
   - expect: **Skip FY Reset** toggle reflects the saved state (does not revert)

---

### 7. Field Visibility Switching Between Prefix Year Options

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-PN-SW-01: Switching from Automatic to Manual shows both mandatory fields

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Automatic** from Prefix Year
   - expect: Only **Financial Year Change On** is visible
2. Change Prefix Year to **Manual**
   - expect: Both **Financial Year Change On** and **Prefix Financial Year** are visible

#### 7.2. TC-PN-SW-02: Switching from Manual to Not Required hides all fields

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Manual** from Prefix Year
   - expect: Both **Financial Year Change On** and **Prefix Financial Year** are visible
2. Change Prefix Year to **Not Required**
   - expect: Both fields are **no longer visible**

#### 7.3. TC-PN-SW-03: Switching from Not Required back to Automatic restores Financial Year Change On

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Not Required** from Prefix Year
   - expect: No financial year fields are visible
2. Change Prefix Year to **Automatic**
   - expect: **Financial Year Change On** is visible again
   - expect: **Prefix Financial Year** is **not** visible

#### 7.4. TC-PN-SW-04: Switching from Not Required back to Manual restores both fields

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering, select **Not Required** from Prefix Year
   - expect: No financial year fields are visible
2. Change Prefix Year to **Manual**
   - expect: Both **Financial Year Change On** and **Prefix Financial Year** are visible

#### 7.5. TC-PN-SW-05: `{financialYear}` token appears/disappears in Available Tokens as Prefix Year toggles

**File:** `tests/app-setting/prefix-numbering.spec.ts`

**Steps:**
1. Navigate to Prefix & Numbering
2. Select **Automatic** — verify `{financialYear}` is in Available Tokens
3. Switch to **Not Required** — verify `{financialYear}` is **not** in Available Tokens
4. Switch to **Manual** — verify `{financialYear}` is back in Available Tokens
5. Switch again to **Not Required** — verify `{financialYear}` is again **not** in Available Tokens
