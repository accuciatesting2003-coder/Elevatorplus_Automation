# Company Profile Test Plan

## Application Overview

The Company Profile page is accessible via Settings Master → App Settings → Company Profile on the ElevatorPlus staging app at https://stage.elevatorplus.net. It is a settings form (not a CRUD data table) divided into three sections: **Company Information**, **Company Logo**, and **Company Address**. Changes are saved via a single Save/Submit button; successful save shows a success toast.

**Section 1 — Company Information** fields:
- **Country Code** (mandatory): read-only display that auto-updates when Currency is changed; reflects the country code of the selected currency's country.
- **Currency** (mandatory): dropdown loading all countries with their currencies.
- **Date Format** (optional): dropdown of date format options (e.g. DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD). The selected format affects how dates are displayed in all master data tables and how date inputs accept values across the application.
- **Company Name** (mandatory): free-text input.
- **Company Mobile Number** (mandatory): phone input with a country-code prefix dropdown.
- **Tax ID** (optional): free-text input.

**Section 2 — Company Logo** fields:
- **Logo** (mandatory): file upload accepting **JPG and PNG only**. Invalid formats (PDF, GIF, SVG, WEBP, TXT, etc.) must be rejected with a validation error. The uploaded logo is displayed on the login page and in the admin panel top-left corner. Test files: `tests/test-data/company-logo-jpg.jpg` and `tests/test-data/company-logo-png.png`.

**Save behaviour:** On first-time setup (no data saved yet) all three sections are mandatory and the form cannot be saved unless each section is complete. Once data has been saved at least once, each section can be updated and saved independently without requiring the other sections to be re-entered.

**Unsaved Changes Guard:** When the user edits any field and then tries to switch to another tab within the Company & Identity page (Module Settings, Prefix & Numbering, Configuration Settings, Integrations), a dialog titled **"Unsaved Changes"** appears with message *"You have unsaved changes on this tab. What would you like to do?"* and three buttons:
- **Stay Here** — closes the dialog and keeps the user on Company & Identity with all unsaved changes preserved.
- **Discard Changes** — discards all unsaved changes and switches to the target tab.
- **Save & Switch** — saves the current changes immediately (without a separate "Are you sure?" confirmation dialog), then switches to the target tab. If the save has validation errors (e.g. "Logo is required"), the errors are shown and the switch does not happen.

**Section 3 — Company Address** fields:
- **Billing Address** (mandatory): free-text input.
- **Shipping Address** (mandatory): free-text input.
- **Same as Billing Address** (checkbox): when checked, populates the Shipping Address field with the Billing Address value.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Company Profile page loads successfully

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Log in and navigate to Settings Master → App Settings
   - expect: The App Settings page loads
2. Click 'Company Profile'
   - expect: The Company Profile page/section is displayed
   - expect: Three sections are visible: 'Company Information', 'Company Logo', 'Company Address'

#### 1.2. TC-SM-02: Company Information section has all expected fields

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Settings Master → App Settings → Company Profile
   - expect: 'Company Information' section heading is visible
   - expect: Country Code field is present (may be read-only/display only)
   - expect: Currency dropdown is present
   - expect: Date Format dropdown is present
   - expect: Company Name input is present
   - expect: Company Mobile Number input is present with country-code prefix dropdown
   - expect: Tax ID input is present

#### 1.3. TC-SM-03: Company Logo section has file upload field

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
   - expect: 'Company Logo' section heading is visible
   - expect: A logo upload control is present
   - expect: If a logo is already uploaded, the current logo preview is shown

#### 1.4. TC-SM-04: Company Address section has all expected fields

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
   - expect: 'Company Address' section heading is visible
   - expect: Billing Address input is present
   - expect: 'Same as Billing Address' checkbox is present
   - expect: Shipping Address input is present

---

### 2. Company Information — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-CI-01: Successfully save company information with all mandatory fields

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
   - expect: Form is loaded with existing values (if any)
2. Select a Currency from the Currency dropdown (e.g. 'India — INR')
   - expect: Currency is selected
   - expect: Country Code field updates to reflect India's country code (+91)
3. Enter 'Test Company Pvt Ltd' in the Company Name field
   - expect: Value is accepted
4. Select country code in the mobile number prefix dropdown and enter '9876543210'
   - expect: Mobile number is entered
5. Leave Tax ID empty (optional)
6. Click Save/Submit
   - expect: Success toast appears (e.g. 'Company profile updated successfully!' or similar)
   - expect: Saved values are retained on the form

#### 2.2. TC-CI-02: Successfully save with all fields including optional ones

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Select a Currency (e.g. 'United States — USD')
   - expect: Country Code updates to +1
3. Select Date Format 'DD-MM-YYYY'
   - expect: Date Format is selected
4. Enter company name 'Test Corp LLC'
5. Enter mobile number '1234567890' with appropriate country code
6. Enter Tax ID 'TAXID001234'
7. Click Save/Submit
   - expect: Success toast appears
   - expect: All entered values persist on the form after save

---

### 3. Currency and Country Code Interaction

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-CUR-01: Country Code auto-updates when Currency is changed

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Note the current Country Code value
3. Select Currency 'India — INR' from the dropdown
   - expect: Country Code field updates to '+91' (India's country code)
4. Change Currency to 'United States — USD'
   - expect: Country Code field updates to '+1' (US country code)
5. Change Currency to 'United Kingdom — GBP'
   - expect: Country Code field updates to '+44' (UK country code)

#### 3.2. TC-CUR-02: Currency dropdown loads all country data

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Open the Currency dropdown
   - expect: Multiple country entries with their currencies are listed
   - expect: Each entry shows country name and currency code/symbol
   - expect: Common currencies like INR, USD, EUR, GBP are present in the list

#### 3.3. TC-CUR-03: Country Code field is read-only and cannot be manually edited

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to directly type or modify the Country Code field
   - expect: The field does not accept manual input (it is driven only by the Currency selection)

---

### 4. Date Format — Effect Across Masters

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-DF-01: Select DD-MM-YYYY date format and verify dates in master data tables

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page and select Date Format 'DD-MM-YYYY'
2. Click Save/Submit
   - expect: Success toast appears
3. Navigate to any master that shows dates in its data table (e.g. a master with a created date or a date column)
   - expect: Dates in the data table are displayed in DD-MM-YYYY format (e.g. '04-06-2026')

#### 4.2. TC-DF-02: Date inputs in masters accept input in the selected date format (DD-MM-YYYY)

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Date Format is set to 'DD-MM-YYYY' and saved on Company Profile page
2. Navigate to any master that has a date input field
   - expect: The date input placeholder or format hint shows DD-MM-YYYY
   - expect: Entering a date as DD-MM-YYYY (e.g. '04-06-2026') is accepted

#### 4.3. TC-DF-03: Changing date format updates display in masters accordingly

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile and select Date Format 'MM-DD-YYYY', click Save
   - expect: Success toast appears
2. Navigate to a master that shows dates in data table
   - expect: Dates are now displayed in MM-DD-YYYY format (e.g. '06-04-2026')
3. Return to Company Profile, change Date Format back to 'DD-MM-YYYY', click Save
   - expect: Dates in master data tables revert to DD-MM-YYYY format

#### 4.4. TC-DF-04: Leaving Date Format unselected (optional) does not block form save

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile and ensure all mandatory fields are filled
2. Clear or leave Date Format unselected (if possible)
3. Click Save/Submit
   - expect: Form saves successfully without error on Date Format
   - expect: Success toast appears

---

### 5. Company Name Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CN-01: Submit with empty Company Name shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, fill all fields except Company Name (clear it if pre-filled)
2. Click Save/Submit
   - expect: Inline validation error appears on Company Name field
   - expect: Form is not saved; no success toast

#### 5.2. TC-CN-02: Company Name accepts alphanumeric and special characters

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, enter 'ElevatorPlus Pvt. Ltd. & Co.' in Company Name
2. Click Save/Submit
   - expect: Value is accepted and saved successfully (success toast appears)

---

### 6. Company Mobile Number Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-MOB-01: Submit with empty Mobile Number shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, fill all other mandatory fields but leave Company Mobile Number empty
2. Click Save/Submit
   - expect: Inline validation error appears on Company Mobile Number field
   - expect: Form is not saved

#### 6.2. TC-MOB-02: Mobile Number country-code prefix dropdown works correctly

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, click the country-code prefix dropdown in Company Mobile Number
   - expect: Country list is displayed with country codes
2. Select a country (e.g. India +91)
   - expect: +91 is shown as prefix for the mobile number input
3. Enter '9876543210' in the mobile number field
   - expect: Full number with prefix is reflected

#### 6.3. TC-MOB-03: Mobile Number field rejects non-numeric input

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, enter 'abcdef' in the Company Mobile Number input
   - expect: Either the input rejects non-numeric characters, or validation error appears on save

---

### 7. Tax ID — Optional Field

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-TAX-01: Form saves successfully without Tax ID (optional field)

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, fill all mandatory fields and leave Tax ID empty
2. Click Save/Submit
   - expect: Success toast appears; form saves without error

#### 7.2. TC-TAX-02: Tax ID accepts alphanumeric value and saves successfully

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, enter 'GSTIN27ABCDE1234F1Z5' in Tax ID
2. Click Save/Submit
   - expect: Tax ID value is saved; success toast appears
   - expect: Tax ID field retains the entered value after save

---

### 8. Company Logo — Upload

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-LOGO-01: Upload JPG logo successfully

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. In the Company Logo section, upload `tests/test-data/company-logo-jpg.jpg`
   - expect: A preview of the uploaded JPG logo is displayed in the section
3. Click Save/Submit (with other mandatory fields filled)
   - expect: Success toast appears
   - expect: The logo preview remains after save

#### 8.2. TC-LOGO-02: Upload PNG logo successfully

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Upload `tests/test-data/company-logo-png.png` in the Company Logo section
   - expect: A preview of the PNG logo is displayed
3. Click Save/Submit
   - expect: Success toast appears

#### 8.3. TC-LOGO-03: Uploaded logo appears on the login page

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Upload a logo (JPG or PNG) and save on Company Profile
   - expect: Success toast appears
2. Log out and navigate to the login page
   - expect: The uploaded company logo is displayed on the login page

#### 8.4. TC-LOGO-04: Uploaded logo appears on admin panel top-left corner

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Upload a logo and save on Company Profile
   - expect: Success toast appears
2. Navigate to any page inside the admin panel
   - expect: The uploaded logo appears in the top-left corner of the admin panel header/navbar

#### 8.5. TC-LOGO-05: Logo field is mandatory — save without uploading logo shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile on a fresh state where no logo has been uploaded
2. Fill all other mandatory fields
3. Click Save/Submit without uploading a logo
   - expect: Validation error appears on the Logo field
   - expect: Form is not saved; no success toast

#### 8.6. TC-LOGO-06: Replacing an existing logo with a new file updates the preview

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile where a logo is already set
2. Upload a different logo file (e.g. switch from JPG to PNG)
   - expect: The preview updates to show the newly selected logo
3. Click Save/Submit
   - expect: Success toast appears
   - expect: The new logo is displayed on the login page and admin panel header

---

### 9. Company Address — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-ADDR-01: Save with both Billing and Shipping addresses filled

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Enter '123, Business Park, Pune - 411001' in Billing Address
3. Enter '456, Warehouse Road, Mumbai - 400001' in Shipping Address
4. Click Save/Submit
   - expect: Success toast appears
   - expect: Both addresses are retained on the form after save

#### 9.2. TC-ADDR-02: 'Same as Billing Address' checkbox copies Billing to Shipping

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Enter '123, Business Park, Pune - 411001' in Billing Address
3. Check the 'Same as Billing Address' checkbox
   - expect: Shipping Address field is automatically populated with '123, Business Park, Pune - 411001'
   - expect: Shipping Address field may become read-only or disabled while the checkbox is checked
4. Click Save/Submit
   - expect: Success toast appears
   - expect: Both addresses show '123, Business Park, Pune - 411001'

#### 9.3. TC-ADDR-03: Unchecking 'Same as Billing Address' allows editing Shipping Address independently

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, check 'Same as Billing Address' so Shipping mirrors Billing
   - expect: Shipping Address is populated with Billing Address value
2. Uncheck the 'Same as Billing Address' checkbox
   - expect: Shipping Address field becomes editable again
3. Clear and enter a different value in Shipping Address
   - expect: Shipping Address accepts the new value independently
4. Click Save/Submit
   - expect: Success toast appears; Billing and Shipping have different values

#### 9.4. TC-ADDR-04: Changing Billing Address when 'Same as Billing Address' is checked updates Shipping Address

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, enter a billing address and check 'Same as Billing Address'
   - expect: Shipping Address mirrors Billing Address
2. Update the Billing Address to a new value '789 New Street, Delhi - 110001'
   - expect: Shipping Address field also updates to '789 New Street, Delhi - 110001' in real time

---

### 10. Company Address — Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-ADDR-VAL-01: Submit without Billing Address shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, fill all mandatory fields except Billing Address (leave empty)
2. Click Save/Submit
   - expect: Inline validation error appears on Billing Address field
   - expect: Form is not saved; no success toast

#### 10.2. TC-ADDR-VAL-02: Submit without Shipping Address shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, fill all mandatory fields except Shipping Address (leave empty, 'Same as Billing Address' unchecked)
2. Click Save/Submit
   - expect: Inline validation error appears on Shipping Address field
   - expect: Form is not saved; no success toast

#### 10.3. TC-ADDR-VAL-03: Shipping Address not required to be filled manually when 'Same as Billing Address' is checked

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, enter a valid Billing Address
2. Check 'Same as Billing Address'
   - expect: Shipping Address is auto-filled from Billing Address
3. Click Save/Submit (do not manually fill Shipping Address)
   - expect: Form saves successfully; no validation error on Shipping Address

---

### 11. Mandatory Field Validation — Full Form

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-FVAL-01: Submit completely empty Company Information section shows errors on mandatory fields

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile on a fresh state or clear all fields
2. Click Save/Submit without entering any data
   - expect: Validation errors appear on: Currency, Company Name, Company Mobile Number, Billing Address, Shipping Address, and Logo (if none uploaded)
   - expect: Optional fields (Date Format, Tax ID) do not show errors

#### 11.2. TC-FVAL-02: Filling all mandatory fields and saving clears all validation errors

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Trigger validation errors by clicking Save with empty fields
   - expect: Errors are shown on mandatory fields
2. Fill all mandatory fields correctly
3. Click Save/Submit
   - expect: All validation errors clear
   - expect: Success toast appears

---

### 12. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-NAV-01: Access Company Profile without authentication redirects to login

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Open an unauthenticated browser and navigate directly to the Company Profile settings URL
   - expect: User is redirected to the login page
   - expect: Company Profile content is not accessible

#### 12.2. TC-NAV-02: Navigate to Company Profile via Settings Master → App Settings

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Log in and click 'Settings' or 'Settings Master' in the sidebar
   - expect: Settings module opens
2. Click 'App Settings' sub-menu
   - expect: App Settings page loads
3. Click 'Company Profile'
   - expect: Company Profile page opens with all three sections visible
   - expect: Previously saved data is pre-populated in the form fields

---

### 13. Company Logo — Invalid File Format Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-LOGO-INV-01: Upload a PDF file shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload a `.pdf` file via the logo upload control
   - expect: Either the file picker restricts selection to image files only (PDF not selectable), or an error message appears (e.g. 'Invalid file format. Please upload JPG or PNG only.')
   - expect: No PDF preview is shown; the logo field remains unset or retains the previous logo

#### 13.2. TC-LOGO-INV-02: Upload a GIF file shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload a `.gif` file via the logo upload control
   - expect: Validation error appears indicating only JPG/PNG are accepted
   - expect: GIF is not accepted; logo field is not updated

#### 13.3. TC-LOGO-INV-03: Upload a SVG file shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload a `.svg` file via the logo upload control
   - expect: Validation error appears indicating only JPG/PNG are accepted
   - expect: SVG is not accepted

#### 13.4. TC-LOGO-INV-04: Upload a WEBP file shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload a `.webp` file via the logo upload control
   - expect: Validation error appears indicating only JPG/PNG are accepted
   - expect: WEBP is not accepted

#### 13.5. TC-LOGO-INV-05: Upload a text or non-image file shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload a `.txt` or `.csv` file via the logo upload control
   - expect: Validation error appears; non-image file is rejected
   - expect: No preview is shown; logo field is unchanged

#### 13.6. TC-LOGO-INV-06: Valid JPG upload after an invalid file attempt succeeds

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile page
2. Attempt to upload an invalid file (e.g. `.pdf`) — observe the error
3. Upload `tests/test-data/company-logo-jpg.jpg`
   - expect: Error clears and JPG preview is displayed correctly
4. Click Save/Submit
   - expect: Success toast appears; JPG logo is saved

---

### 14. Initial Data Entry vs. Section-Wise Update Behaviour

**Seed:** `tests/setup/auth.setup.ts`

> **Context:** When the Company Profile has no saved data yet (first-time setup), all three sections — Company Information, Company Logo, and Company Address — are mandatory and must be filled before the form can be submitted. Once data has been saved at least once, each section can be updated independently without requiring the other sections to be re-filled.

#### 14.1. TC-INIT-01: First-time save requires all three sections to be filled

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile on a fresh state where no data has been saved yet
2. Fill only the Company Information section (Currency, Company Name, Mobile Number) and click Save/Submit
   - expect: Validation errors appear on the Company Logo section (no logo uploaded) and Company Address section (Billing/Shipping empty)
   - expect: Form is not saved until all three sections are complete
3. Also upload a logo but leave Company Address empty, click Save/Submit
   - expect: Validation error still appears on Company Address section
4. Fill all three sections completely and click Save/Submit
   - expect: Success toast appears; all data is saved

#### 14.2. TC-INIT-02: First-time save requires logo to be uploaded (not just Company Information and Address)

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile on a fresh state
2. Fill Company Information (all mandatory fields) and Company Address (both addresses) but skip the logo upload
3. Click Save/Submit
   - expect: Validation error appears on the Logo field
   - expect: Form is not saved

#### 14.3. TC-UPD-01: After initial save, Company Information can be updated independently

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Company Profile already has data saved in all three sections (pre-condition)
2. Navigate to Company Profile — verify existing data is pre-populated
3. Modify only the Company Name field (e.g. append ' Updated')
4. Click Save/Submit (without touching Company Logo or Company Address)
   - expect: Success toast appears
   - expect: Only Company Name is updated; logo and address values are unchanged

#### 14.4. TC-UPD-02: After initial save, Company Logo can be updated independently

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Company Profile already has data saved in all three sections
2. Navigate to Company Profile — a logo preview is already shown
3. Upload a different logo (e.g. switch from `company-logo-jpg.jpg` to `company-logo-png.png`) without changing any other field
4. Click Save/Submit
   - expect: Success toast appears
   - expect: New logo is reflected on the login page and admin panel header
   - expect: Company Information and Company Address values remain unchanged

#### 14.5. TC-UPD-03: After initial save, Company Address can be updated independently

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Company Profile already has data saved in all three sections
2. Navigate to Company Profile — existing addresses are pre-filled
3. Modify only the Billing Address (e.g. '999, Updated Street, Pune - 411002') without touching Company Information or Company Logo
4. Click Save/Submit
   - expect: Success toast appears
   - expect: Updated Billing Address is saved; Company Information and Logo are unchanged

#### 14.6. TC-UPD-04: After initial save, saving a section with its own mandatory field empty still shows validation error

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Company Profile already has data saved in all three sections
2. Navigate to Company Profile and clear the Company Name field
3. Click Save/Submit
   - expect: Validation error appears on Company Name (mandatory within its section)
   - expect: Form is not saved even though other sections are already populated

#### 14.7. TC-UPD-05: After initial save, Currency change (and resulting Country Code update) can be saved independently

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Ensure Company Profile already has data saved
2. Navigate to Company Profile, change the Currency to a different country (e.g. from INR to USD)
   - expect: Country Code updates automatically to match the new currency's country
3. Click Save/Submit without changing any other section
   - expect: Success toast appears; new Currency and Country Code are saved
   - expect: Logo and Address remain unchanged

---

### 15. Unsaved Changes Navigation Guard

**Seed:** `tests/setup/auth.setup.ts`

> **Context:** The Company & Identity page has a navigation guard that intercepts tab switches when there are unsaved changes. The guard dialog — **"Unsaved Changes"** — appears only when switching between the internal tabs (Company & Identity, Module Settings, Prefix & Numbering, Configuration Settings, Integrations). It does NOT appear for sidebar navigation. The dialog offers three choices: **Stay Here**, **Discard Changes**, and **Save & Switch**.

#### 15.1. TC-UNS-01: Editing a field and switching tabs shows the "Unsaved Changes" dialog

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile (Company & Identity tab)
   - expect: Page loads with Company & Identity content visible
2. Edit the Company Name field (e.g. append a character)
   - expect: Field value changes
3. Click the 'Module Settings' tab without saving
   - expect: A dialog with heading 'Unsaved Changes' appears
   - expect: Dialog message reads: 'You have unsaved changes on this tab. What would you like to do?'
   - expect: Three buttons are visible: 'Stay Here', 'Discard Changes', 'Save & Switch'

#### 15.2. TC-UNS-02: "Stay Here" closes the dialog and keeps the user on Company & Identity with changes intact

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, edit Company Name (e.g. append 'X'), then click 'Module Settings'
   - expect: 'Unsaved Changes' dialog appears
2. Click 'Stay Here'
   - expect: Dialog closes
   - expect: The page remains on Company & Identity tab (Company Information section still visible)
   - expect: The unsaved change (appended 'X') is still present in the Company Name field
   - expect: URL remains `?tab=company`

#### 15.3. TC-UNS-03: "Discard Changes" discards unsaved edits and switches to the target tab

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, edit Company Name (e.g. append 'X'), then click 'Module Settings'
   - expect: 'Unsaved Changes' dialog appears
2. Click 'Discard Changes'
   - expect: Dialog closes
   - expect: The page switches to Module Settings tab (Module Setting content becomes visible)
   - expect: URL changes to `?tab=modules`
   - expect: If the user switches back to Company & Identity, the Company Name shows the original saved value (the 'X' was discarded)

#### 15.4. TC-UNS-04: "Save & Switch" saves changes and switches to the target tab without a separate confirmation dialog

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, note the current Company Name value
2. Edit Company Name (e.g. append 'SAVED'), then click 'Prefix & Numbering'
   - expect: 'Unsaved Changes' dialog appears
3. Click 'Save & Switch'
   - expect: No separate 'Are you sure?' confirmation dialog appears — save proceeds directly
   - expect: The page switches to Prefix & Numbering tab
   - expect: Success toast 'Setting has been saved successfully!' appears
   - expect: Switching back to Company & Identity shows the saved value (with 'SAVED' appended)
4. Restore: switch back to Company & Identity, revert the name, save normally

#### 15.5. TC-UNS-05: "Save & Switch" with a validation error shows the error and does not switch

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile, clear the Company Name field (mandatory)
2. Click 'Module Settings'
   - expect: 'Unsaved Changes' dialog appears
3. Click 'Save & Switch'
   - expect: Validation error 'Please enter company name' appears on the Company Name field
   - expect: The page does NOT switch to Module Settings (stays on Company & Identity content)
   - expect: No success toast appears

#### 15.6. TC-UNS-06: No dialog appears when switching tabs without any unsaved changes

**File:** `tests/app-setting/company-profile.spec.ts`

**Steps:**
1. Navigate to Company Profile without making any changes
2. Click 'Module Settings'
   - expect: No 'Unsaved Changes' dialog appears
   - expect: Page switches directly to Module Settings content
3. Click 'Company & Identity'
   - expect: Page switches back without any dialog
