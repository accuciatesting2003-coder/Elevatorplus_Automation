# Configuration Setting Test Plan

## Application Overview

The Configuration Setting page is accessible via Settings → App Settings → Configuration Setting on the ElevatorPlus staging app at `https://stage.elevatorplus.net`. It is a settings page containing two sections:

1. **Guide Rail / Bracket** — A set of numeric/text input fields and two checkboxes that configure guide rail and bracket pricing, dimensions, and module behaviour. All fields are mandatory.
2. **Wiring Information** — A set of numeric/text input fields that configure wiring pricing for standard lifts and goods lifts. All fields are mandatory.

### Section 1: Guide Rail / Bracket Fields

| # | Field Name | Type | Mandatory |
|---|---|---|---|
| 1 | Guide Rail Height | Input (number) | Yes |
| 2 | Bracket Size | Input (number) | Yes |
| 3 | Sensor Price | Input (number) | Yes |
| 4 | Pit | Input (number) | Yes |
| 5 | Overhead | Input (number) | Yes |
| 6 | Floor Structure | Input (number) | Yes |
| 7 | RCR Cost | Input (number) | Yes |
| 8 | Incentive in % | Input (number) | Yes |
| 9 | Profit | Input (number) | Yes |
| 10 | Operational Cost | Input (number) | Yes |
| 11 | OSG Rope Price | Input (number) | Yes |
| 12 | Bracket Use in Set | Checkbox | Yes |
| 13 | Guide Rail and Bracket Type | Checkbox | Yes |

**Bracket Use in Set checkbox behaviour:**
- **Checked** → Two additional fields appear in the Type of Lift Master form: **No of Guide Rails in the Set** and **No of Bracket in the Set**.
- **Unchecked** → Those two additional fields are hidden from the Type of Lift Master form.

**Guide Rail and Bracket Type checkbox behaviour:**
- **Checked** → A **Guide Rail and Bracket Master** is added under Sales Master in the navigation/master list.
- **Unchecked** → The Guide Rail and Bracket Master is hidden from Sales Master.

### Section 2: Wiring Information Fields

| # | Field Name | Type | Mandatory |
|---|---|---|---|
| 1 | Wiring Name | Input (text) | Yes |
| 2 | Wiring Price | Input (number) | Yes |
| 3 | Wiring Per Floor Increase | Input (number) | Yes |
| 4 | Wiring Price for Goods Lift | Input (number) | Yes |
| 5 | Wiring Per Floor Increase for Goods Lift | Input (number) | Yes |

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Configuration Setting tab loads successfully

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net`
   - expect: App loads and user is authenticated
2. Navigate to Settings → App Settings → Configuration Setting
   - expect: The Configuration Setting page loads without errors
   - expect: Two section headings are visible: **Guide Rail / Bracket** and **Wiring Information**

#### 1.2. TC-SM-02: Verify Guide Rail / Bracket section fields are present

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
   - expect: The **Guide Rail / Bracket** section is visible
2. Inspect the form fields within the section
   - expect: The following input fields are present: Guide Rail Height, Bracket Size, Sensor Price, Pit, Overhead, Floor Structure, RCR Cost, Incentive in %, Profit, Operational Cost, OSG Rope Price
   - expect: The **Bracket Use in Set** checkbox is present
   - expect: The **Guide Rail and Bracket Type** checkbox is present

#### 1.3. TC-SM-03: Verify Wiring Information section fields are present

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
   - expect: The **Wiring Information** section is visible
2. Inspect the form fields within the section
   - expect: The following input fields are present: Wiring Name, Wiring Price, Wiring Per Floor Increase, Wiring Price for Goods Lift, Wiring Per Floor Increase for Goods Lift
   - expect: All five fields are editable

#### 1.4. TC-SM-04: Verify existing saved values are pre-populated

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
   - expect: All input fields are pre-populated with previously saved values (not empty by default on a configured system)
   - expect: The Bracket Use in Set checkbox reflects the saved checked/unchecked state
   - expect: The Guide Rail and Bracket Type checkbox reflects the saved checked/unchecked state

---

### 2. Happy Path — Save Configuration

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-SAV-01: Successfully save valid values in Guide Rail / Bracket section

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Enter valid numeric values in all Guide Rail / Bracket input fields (e.g. Guide Rail Height: 3000, Bracket Size: 150, Sensor Price: 500, Pit: 1200, Overhead: 800, Floor Structure: 600, RCR Cost: 2000, Incentive in %: 5, Profit: 10, Operational Cost: 1500, OSG Rope Price: 750)
   - expect: Values are accepted and shown in the inputs
3. Click Save / Submit
   - expect: Success toast or confirmation message appears
   - expect: The page retains the saved values on reload

#### 2.2. TC-SAV-02: Successfully save valid values in Wiring Information section

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Enter valid values in all Wiring Information fields (e.g. Wiring Name: "Standard Wiring", Wiring Price: 2000, Wiring Per Floor Increase: 500, Wiring Price for Goods Lift: 3000, Wiring Per Floor Increase for Goods Lift: 700)
   - expect: Values are accepted and shown in the inputs
3. Click Save / Submit
   - expect: Success toast or confirmation message appears
   - expect: The page retains the saved wiring values on reload

#### 2.3. TC-SAV-03: Successfully save both sections together

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Fill in valid values for all fields in both Guide Rail / Bracket and Wiring Information sections
3. Click Save / Submit
   - expect: Success toast or confirmation message appears
   - expect: All values are persisted correctly on page reload

---

### 3. Mandatory Field Validation — Guide Rail / Bracket

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-VAL-01: Submit with empty Guide Rail Height shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Clear the **Guide Rail Height** field and click Save / Submit
   - expect: Inline validation error appears for Guide Rail Height
   - expect: Form is not saved

#### 3.2. TC-VAL-02: Submit with empty Bracket Size shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Bracket Size** field and click Save / Submit
   - expect: Inline validation error appears for Bracket Size
   - expect: Form is not saved

#### 3.3. TC-VAL-03: Submit with empty Sensor Price shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Sensor Price** field and click Save / Submit
   - expect: Inline validation error appears for Sensor Price
   - expect: Form is not saved

#### 3.4. TC-VAL-04: Submit with empty Pit shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Pit** field and click Save / Submit
   - expect: Inline validation error appears for Pit
   - expect: Form is not saved

#### 3.5. TC-VAL-05: Submit with empty Overhead shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Overhead** field and click Save / Submit
   - expect: Inline validation error appears for Overhead
   - expect: Form is not saved

#### 3.6. TC-VAL-06: Submit with empty Floor Structure shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Floor Structure** field and click Save / Submit
   - expect: Inline validation error appears for Floor Structure
   - expect: Form is not saved

#### 3.7. TC-VAL-07: Submit with empty RCR Cost shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **RCR Cost** field and click Save / Submit
   - expect: Inline validation error appears for RCR Cost
   - expect: Form is not saved

#### 3.8. TC-VAL-08: Submit with empty Incentive in % shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Incentive in %** field and click Save / Submit
   - expect: Inline validation error appears for Incentive in %
   - expect: Form is not saved

#### 3.9. TC-VAL-09: Submit with empty Profit shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Profit** field and click Save / Submit
   - expect: Inline validation error appears for Profit
   - expect: Form is not saved

#### 3.10. TC-VAL-10: Submit with empty Operational Cost shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Operational Cost** field and click Save / Submit
   - expect: Inline validation error appears for Operational Cost
   - expect: Form is not saved

#### 3.11. TC-VAL-11: Submit with empty OSG Rope Price shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **OSG Rope Price** field and click Save / Submit
   - expect: Inline validation error appears for OSG Rope Price
   - expect: Form is not saved

---

### 4. Mandatory Field Validation — Wiring Information

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-WIR-VAL-01: Submit with empty Wiring Name shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Clear the **Wiring Name** field and click Save / Submit
   - expect: Inline validation error appears for Wiring Name
   - expect: Form is not saved

#### 4.2. TC-WIR-VAL-02: Submit with empty Wiring Price shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Wiring Price** field and click Save / Submit
   - expect: Inline validation error appears for Wiring Price
   - expect: Form is not saved

#### 4.3. TC-WIR-VAL-03: Submit with empty Wiring Per Floor Increase shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Wiring Per Floor Increase** field and click Save / Submit
   - expect: Inline validation error appears for Wiring Per Floor Increase
   - expect: Form is not saved

#### 4.4. TC-WIR-VAL-04: Submit with empty Wiring Price for Goods Lift shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Wiring Price for Goods Lift** field and click Save / Submit
   - expect: Inline validation error appears for Wiring Price for Goods Lift
   - expect: Form is not saved

#### 4.5. TC-WIR-VAL-05: Submit with empty Wiring Per Floor Increase for Goods Lift shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Clear the **Wiring Per Floor Increase for Goods Lift** field and click Save / Submit
   - expect: Inline validation error appears for Wiring Per Floor Increase for Goods Lift
   - expect: Form is not saved

#### 4.6. TC-WIR-VAL-06: Submit with all Wiring Information fields empty shows validation errors for all

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Clear all five Wiring Information fields
3. Click Save / Submit
   - expect: Inline validation errors appear for all five wiring fields
   - expect: Form is not saved

---

### 5. Bracket Use in Set Checkbox Behaviour

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-BKT-01: Checking "Bracket Use in Set" shows additional fields in Type of Lift Master

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Check the **Bracket Use in Set** checkbox
   - expect: Checkbox becomes checked
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Navigate to the Type of Lift Master (Sales Master → Type of Lift)
   - expect: The **No of Guide Rails in the Set** field is displayed in the Type of Lift Master form
   - expect: The **No of Bracket in the Set** field is displayed in the Type of Lift Master form

#### 5.2. TC-BKT-02: Unchecking "Bracket Use in Set" hides additional fields from Type of Lift Master

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Uncheck the **Bracket Use in Set** checkbox
   - expect: Checkbox becomes unchecked
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Navigate to the Type of Lift Master (Sales Master → Type of Lift)
   - expect: The **No of Guide Rails in the Set** field is NOT displayed in the Type of Lift Master form
   - expect: The **No of Bracket in the Set** field is NOT displayed in the Type of Lift Master form

#### 5.3. TC-BKT-03: Toggling "Bracket Use in Set" persists the state on page reload

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting and check (or uncheck) **Bracket Use in Set**, then click Save / Submit
   - expect: Success confirmation appears
2. Reload the Configuration Setting page
   - expect: The **Bracket Use in Set** checkbox reflects the saved state

---

### 6. Guide Rail and Bracket Type Checkbox Behaviour

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-GRT-01: Checking "Guide Rail and Bracket Type" adds Guide Rail and Bracket Master under Sales Master

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Check the **Guide Rail and Bracket Type** checkbox
   - expect: Checkbox becomes checked
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Navigate to Masters → Sales Master
   - expect: The **Guide Rail and Bracket Master** is visible in the Sales Master list/navigation

#### 6.2. TC-GRT-02: Unchecking "Guide Rail and Bracket Type" hides Guide Rail and Bracket Master from Sales Master

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to the Configuration Setting page
2. Uncheck the **Guide Rail and Bracket Type** checkbox
   - expect: Checkbox becomes unchecked
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Navigate to Masters → Sales Master
   - expect: The **Guide Rail and Bracket Master** is NOT visible in the Sales Master list/navigation

#### 6.3. TC-GRT-03: Toggling "Guide Rail and Bracket Type" persists the state on page reload

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting and check (or uncheck) **Guide Rail and Bracket Type**, then click Save / Submit
   - expect: Success confirmation appears
2. Reload the Configuration Setting page
   - expect: The **Guide Rail and Bracket Type** checkbox reflects the saved state

---

### 7. Input Field Boundary and Edge Case Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-BND-01: Enter zero (0) in numeric fields and save

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting and enter 0 in each of the numeric Guide Rail / Bracket fields
2. Click Save / Submit
   - expect: Either the form saves successfully with value 0, or a validation error appears indicating zero is not allowed — observe and document the actual behaviour

#### 7.2. TC-BND-02: Enter negative values in numeric fields and save

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Enter a negative number (e.g. -100) in the **Guide Rail Height** field
2. Click Save / Submit
   - expect: Either a validation error appears (negative values not allowed), or the value is saved — observe and document the actual behaviour

#### 7.3. TC-BND-03: Enter decimal values in numeric fields and save

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Enter a decimal number (e.g. 12.5) in the **Sensor Price** and **Wiring Price** fields
2. Click Save / Submit
   - expect: Decimal values are accepted and saved correctly, or a validation error appears if decimals are not allowed — observe and document the actual behaviour

#### 7.4. TC-BND-04: Enter alphabetic/special characters in numeric fields shows validation error

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Attempt to type alphabetic characters (e.g. "abc") or special characters (e.g. "@#$") in the **Guide Rail Height** input
   - expect: Non-numeric characters are either rejected by the input or trigger a validation error on submit
   - expect: The form is not saved with invalid character input

#### 7.5. TC-BND-05: Incentive in % accepts values between 0 and 100

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Enter 5 in the **Incentive in %** field and click Save / Submit
   - expect: Value 5 is saved successfully
2. Enter 150 in the **Incentive in %** field and click Save / Submit
   - expect: Either a validation error appears (value exceeds 100%) or the value is saved — observe and document the actual behaviour

#### 7.6. TC-BND-06: Profit field accepts values between 0 and 100

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Enter 10 in the **Profit** field and click Save / Submit
   - expect: Value 10 is saved successfully
2. Enter 150 in the **Profit** field and click Save / Submit
   - expect: Either a validation error appears or the value is saved — observe and document the actual behaviour

#### 7.7. TC-BND-07: Wiring Name field rejects only whitespace

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Enter only spaces in the **Wiring Name** field and click Save / Submit
   - expect: Inline validation error appears (treated as empty)
   - expect: Form is not saved

---

### 8. Update (Re-save) Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-UPD-01: Update a numeric field value and save persists the new value

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting and note the current **Guide Rail Height** value
2. Change the **Guide Rail Height** to a different valid value
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Reload the Configuration Setting page
   - expect: The **Guide Rail Height** field shows the newly saved value

#### 8.2. TC-UPD-02: Update the Wiring Name and save persists the new value

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting and note the current **Wiring Name** value
2. Clear the **Wiring Name** field and enter a new name
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Reload the Configuration Setting page
   - expect: The **Wiring Name** field shows the newly saved name

#### 8.3. TC-UPD-03: Update multiple fields at once and save persists all changes

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Navigate to Configuration Setting
2. Change multiple fields (e.g. Sensor Price, Pit, Wiring Price, Wiring Per Floor Increase) simultaneously
3. Click Save / Submit
   - expect: Success toast or confirmation appears
4. Reload the Configuration Setting page
   - expect: All changed fields show the newly saved values

---

### 9. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-NAV-01: Access Configuration Setting without authentication redirects to login

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Open an unauthenticated browser and navigate directly to the Configuration Setting URL
   - expect: User is redirected to the login page
   - expect: Configuration Setting content is not accessible

#### 9.2. TC-NAV-02: Access Configuration Setting via the Settings navigation menu

**File:** `tests/setting-module/app-setting/configuration-setting.spec.ts`

**Steps:**
1. Log in and click **Settings** in the sidebar
   - expect: The Settings section expands
2. Click **App Settings** → **Configuration Setting**
   - expect: The Configuration Setting page loads with both sections visible: Guide Rail / Bracket and Wiring Information
   - expect: All fields are accessible and editable
