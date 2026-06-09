# WhatsApp Template Master Test Plan

## Application Overview

The WhatsApp Template Master page is part of the ElevatorPlus Settings module, accessible via Settings → Whatsapp Templates at `https://stage.elevatorplus.net/setting/whatsapp-templates`. It allows admin users to create and manage WhatsApp message templates used across different modules.

The page has two sections: (1) an "Add Whatsapp Template" form at the top, and (2) a data table listing all templates below.

### Add Form Fields

| Field | Type | Mandatory | Helper Text |
|---|---|---|---|
| Whatsapp Template Name * | Text input | Yes | "Enter the template name" |
| Template Category * | Dropdown | Yes | "Select a template category" |
| Template Content * | Textarea | Yes | "Enter template content" |
| Media (optional) | File upload (drag-and-drop) | No | "Upload image, PDF, video or PPT." |

**Template Category options:** Leads, Enquiries, Jobs, PM, Breakdown, Others

**Media accepted formats:** PNG, JPG, PDF, MP4, PPT/PPTX — max size 50 MB

**Form buttons:** Clear, Submit

An info (ⓘ) button is present next to the "Add Whatsapp Template" heading.

### Update Form

Clicking the Edit icon on any table row switches the form to **"Update Whatsapp Template"** mode. All existing values are pre-filled. An additional **Status \*** dropdown (options: Select Status, Active, Inactive; helper: "Select Status") appears. The Submit button is replaced by **Update**. There is no Clear button in Update mode.

### Uniqueness Rule

The template name must be **unique per Template Category** (case-insensitive). Constraints:
- Same name + same category → **blocked** (error)
- Same name in ALL CAPS or any mixed case + same category → **blocked** (case-insensitive check)
- Same name + **different** category → **allowed**
- Duplicate check applies against **both Active and Inactive** records

### Attachment Display in Table

| File Type | Attachment Column Shows |
|---|---|
| PNG / JPG | "Image Attachment" label with icon link |
| PDF | "PDF Attachment" label with icon link |
| PPT / PPTX | "PPT Attachment" label with icon link |
| MP4 (video) | Icon link only (no text label) |
| None | Empty cell |

### Table

**Toolbar:** Show (10/25/50/100, default 25) · Status filter (All/Active/Inactive, default Active) · Search (placeholder "Search...")

**Columns:** Sr. No. · Action (Edit icon only) · Whatsapp Template Name · Template Category · Template Content · Status · Attachment

**Existing records used in duplicate test cases:**
- "test" – Leads – Active (no attachment)
- "test" – Enquiries – Active (no attachment)
- "Enquiry Generated" – Enquiries – **Inactive** (no attachment)

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-WAT-SM-01: WhatsApp Template page loads successfully

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/setting/whatsapp-templates`
   - expect: Page URL is `https://stage.elevatorplus.net/setting/whatsapp-templates`
   - expect: Page title in the navigation bar reads "Whatsapp Templates"
   - expect: The form card heading reads "Add Whatsapp Template"
   - expect: The data table loads with at least one row

#### 1.2. TC-WAT-SM-02: Verify all Add form elements are present

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
   - expect: "Whatsapp Template Name *" text input is present and empty
   - expect: Helper text "Enter the template name" is visible below the name input
   - expect: "Template Category *" dropdown is present showing "Select a category" placeholder
   - expect: Helper text "Select a template category" is visible below the category dropdown
   - expect: "Template Content *" textarea is present and empty
   - expect: Helper text "Enter template content" is visible below the content textarea
   - expect: Media upload area is present with label "Media (Optional)"
   - expect: Media upload area shows text "Upload or drag and drop" and "PNG, JPG, PDF, MP4, PPT (max 50MB)"
   - expect: Helper text "Upload image, PDF, video or PPT." is visible below the upload area
   - expect: "Clear" and "Submit" buttons are both visible
   - expect: An info (ⓘ) button is present next to the "Add Whatsapp Template" heading

#### 1.3. TC-WAT-SM-03: Verify Template Category dropdown options

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates` and click the "Template Category *" dropdown
   - expect: Dropdown contains options: Leads, Enquiries, Jobs, PM, Breakdown, Others

#### 1.4. TC-WAT-SM-04: Verify table columns and toolbar

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates` and inspect the table
   - expect: Table header columns are: Sr. No., Action, Whatsapp Template Name, Template Category, Template Content, Status, Attachment
   - expect: Toolbar has a "Show:" rows-per-page dropdown (options: 10, 25, 50, 100; default 25)
   - expect: Toolbar has a "Status:" filter dropdown (options: All, Active, Inactive; default Active)
   - expect: Toolbar has a "Search:" label with a "Search..." text input
   - expect: There is no Import or Export button on this page

---

### 2. Add Template — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-WAT-ADD-01: Add a new template with mandatory fields only (no media)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
   - expect: "Add Whatsapp Template" form is visible
2. Enter "AutoTest NoMedia" in "Whatsapp Template Name *"
3. Select "Others" from "Template Category *"
4. Enter "This is an automated test template" in "Template Content *"
5. Click "Submit"
   - expect: Success toast message appears (e.g. "Whatsapp template created successfully!")
   - expect: Form fields are cleared after submission
   - expect: Form heading remains "Add Whatsapp Template"
   - expect: The new record "AutoTest NoMedia" with category "Others" appears in the table

#### 2.2. TC-WAT-ADD-02: Add a template with an image attachment (JPG/PNG)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "AutoTest Image" in "Whatsapp Template Name *"
3. Select "Others" from "Template Category *"
4. Enter "Template with image media" in "Template Content *"
5. Upload a JPG or PNG file via the Media upload area
   - expect: Uploaded file name or preview is shown in the upload area
6. Click "Submit"
   - expect: Success toast appears
   - expect: The new record appears in the table
   - expect: The Attachment column for this record shows "Image Attachment" with an icon link

#### 2.3. TC-WAT-ADD-03: Add a template with a PDF attachment

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "AutoTest PDF" in "Whatsapp Template Name *"
3. Select "Others" from "Template Category *"
4. Enter "Template with PDF media" in "Template Content *"
5. Upload a PDF file via the Media upload area
   - expect: Uploaded file name is shown in the upload area
6. Click "Submit"
   - expect: Success toast appears
   - expect: The new record appears in the table
   - expect: The Attachment column for this record shows "PDF Attachment" with an icon link

#### 2.4. TC-WAT-ADD-04: Add a template with a PPT/PPTX attachment

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "AutoTest PPT" in "Whatsapp Template Name *"
3. Select "Others" from "Template Category *"
4. Enter "Template with PPT media" in "Template Content *"
5. Upload a PPT or PPTX file via the Media upload area
   - expect: Uploaded file name is shown in the upload area
6. Click "Submit"
   - expect: Success toast appears
   - expect: The new record appears in the table
   - expect: The Attachment column for this record shows "PPT Attachment" with an icon link

#### 2.5. TC-WAT-ADD-05: Add a template with an MP4 video attachment

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "AutoTest Video" in "Whatsapp Template Name *"
3. Select "Others" from "Template Category *"
4. Enter "Template with video media" in "Template Content *"
5. Upload an MP4 file via the Media upload area
   - expect: Uploaded file name is shown in the upload area
6. Click "Submit"
   - expect: Success toast appears
   - expect: The new record appears in the table
   - expect: The Attachment column for this record shows an icon/link (no text label for MP4)

#### 2.6. TC-WAT-ADD-06: Add same template name with a different category (should succeed)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" with category "Leads" exists (Active).

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "test" in "Whatsapp Template Name *"
3. Select "PM" from "Template Category *" (different from "Leads")
4. Enter "Testing cross-category uniqueness" in "Template Content *"
5. Click "Submit"
   - expect: Success toast appears — record is created without error
   - expect: New row "test" / "PM" appears in the table

---

### 3. Add Template — Validation (Mandatory Fields)

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-WAT-VAL-01: Submit with all fields empty

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click "Submit" without filling any field
   - expect: Inline validation error appears on "Whatsapp Template Name *" field
   - expect: Inline validation error appears on "Template Category *" field
   - expect: Inline validation error appears on "Template Content *" field
   - expect: No record is created; form remains in "Add Whatsapp Template" mode

#### 3.2. TC-WAT-VAL-02: Submit without Whatsapp Template Name

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Leave "Whatsapp Template Name *" empty
3. Select "Leads" from "Template Category *"
4. Enter "Some content" in "Template Content *"
5. Click "Submit"
   - expect: Inline validation error on "Whatsapp Template Name *"
   - expect: No record is created

#### 3.3. TC-WAT-VAL-03: Submit without Template Category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "Missing Category Test" in "Whatsapp Template Name *"
3. Leave "Template Category *" at "Select a category"
4. Enter "Some content" in "Template Content *"
5. Click "Submit"
   - expect: Inline validation error on "Template Category *"
   - expect: No record is created

#### 3.4. TC-WAT-VAL-04: Submit without Template Content

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "Missing Content Test" in "Whatsapp Template Name *"
3. Select "Leads" from "Template Category *"
4. Leave "Template Content *" empty
5. Click "Submit"
   - expect: Inline validation error on "Template Content *"
   - expect: No record is created

---

### 4. Add Template — Duplicate Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-WAT-DUP-ADD-01: Add duplicate name (exact match) against an existing Active record in the same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" with category "Leads" is Active.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "test" in "Whatsapp Template Name *"
3. Select "Leads" from "Template Category *"
4. Enter "Duplicate attempt content" in "Template Content *"
5. Click "Submit"
   - expect: Error message is displayed (e.g. toast "Something went wrong" or inline error indicating duplicate)
   - expect: No new record is created in the table

#### 4.2. TC-WAT-DUP-ADD-02: Add duplicate name (exact match) against an existing Inactive record in the same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "Enquiry Generated" with category "Enquiries" is **Inactive**.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "Enquiry Generated" in "Whatsapp Template Name *"
3. Select "Enquiries" from "Template Category *"
4. Enter "Duplicate of inactive record" in "Template Content *"
5. Click "Submit"
   - expect: Error message is displayed — duplicate blocked even against inactive records
   - expect: No new record is created in the table

#### 4.3. TC-WAT-DUP-ADD-03: Add same name in ALL UPPERCASE against an existing Active record in same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" with category "Leads" is Active.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "TEST" in "Whatsapp Template Name *" (uppercase version of "test")
3. Select "Leads" from "Template Category *"
4. Enter "Uppercase duplicate attempt" in "Template Content *"
5. Click "Submit"
   - expect: Error message is displayed — system treats "TEST" and "test" as the same name (case-insensitive)
   - expect: No new record is created in the table

#### 4.4. TC-WAT-DUP-ADD-04: Add same name in mixed case against an existing Active record in same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" with category "Leads" is Active.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "Test" in "Whatsapp Template Name *" (mixed case of "test")
3. Select "Leads" from "Template Category *"
4. Enter "Mixed case duplicate attempt" in "Template Content *"
5. Click "Submit"
   - expect: Error message is displayed — case-insensitive duplicate blocked
   - expect: No new record is created in the table

#### 4.5. TC-WAT-DUP-ADD-05: Add same name with a different category (should succeed — cross-category allowed)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" with category "Leads" is Active. No record "test" exists for category "Breakdown".

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "test" in "Whatsapp Template Name *"
3. Select "Breakdown" from "Template Category *" (different category)
4. Enter "Cross category allowed test" in "Template Content *"
5. Click "Submit"
   - expect: Success toast — record is created without any error
   - expect: New row "test" / "Breakdown" appears in the table

---

### 5. Update Template — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-WAT-UPD-01: Edit icon opens Update form with pre-filled values

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click the Edit icon on any existing row (e.g. "test" / Leads)
   - expect: Form heading changes to "Update Whatsapp Template"
   - expect: "Whatsapp Template Name *" is pre-filled with the record's name
   - expect: "Template Category *" shows the record's category as selected
   - expect: "Template Content *" is pre-filled with the record's content
   - expect: "Status *" dropdown is visible and shows the current status (Active/Inactive)
   - expect: "Update" button is present; no "Clear" button is visible
   - expect: No "Submit" button is present in Update mode

#### 5.2. TC-WAT-UPD-02: Update template name successfully

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on an existing record
3. Clear the "Whatsapp Template Name *" field and type a new unique name
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row reflects the updated name

#### 5.3. TC-WAT-UPD-03: Update template content successfully

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on an existing record
3. Clear "Template Content *" and enter updated content text
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row shows updated content

#### 5.4. TC-WAT-UPD-04: Add image attachment during update

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on a record that has no attachment (e.g. "test" / Leads)
3. Upload a JPG or PNG file via the Media upload area
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row now shows "Image Attachment" icon link in the Attachment column

#### 5.5. TC-WAT-UPD-05: Add PDF attachment during update

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on a record that has no attachment
3. Upload a PDF file via the Media upload area
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row now shows "PDF Attachment" icon link in the Attachment column

#### 5.6. TC-WAT-UPD-06: Add PPT attachment during update

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on a record that has no attachment
3. Upload a PPT or PPTX file via the Media upload area
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row now shows "PPT Attachment" icon link in the Attachment column

#### 5.7. TC-WAT-UPD-07: Add MP4 video attachment during update

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on a record that has no attachment
3. Upload an MP4 file via the Media upload area
4. Click "Update"
   - expect: Success toast appears
   - expect: Table row now shows an icon link (no text label) in the Attachment column for the MP4

#### 5.8. TC-WAT-UPD-08: Update status from Active to Inactive

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates` (Status filter: Active)
2. Click Edit on any Active record
3. Select "Inactive" from the "Status *" dropdown
4. Click "Update"
   - expect: Success toast appears
   - expect: The record disappears from the Active-filtered table view
5. Change Status filter to "Inactive"
   - expect: The updated record appears with an "Inactive" status badge

#### 5.9. TC-WAT-UPD-09: Update status from Inactive back to Active

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates` and set Status filter to "Inactive"
2. Click Edit on an Inactive record (e.g. "Enquiry Generated" / Enquiries)
3. Select "Active" from the "Status *" dropdown
4. Click "Update"
   - expect: Success toast appears
   - expect: The record disappears from the Inactive-filtered view
5. Change Status filter to "Active"
   - expect: The record now appears with an "Active" status badge

---

### 6. Update Template — Duplicate Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-WAT-DUP-UPD-01: Update name to an existing Active record's name in the same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Two Active records exist — "test" / Leads and "lead" / Leads.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on the "lead" / Leads record
3. Change the name from "lead" to "test"
4. Keep "Template Category *" as "Leads"
5. Click "Update"
   - expect: Error message is displayed — duplicate name in same category blocked
   - expect: The record is NOT updated; original name "lead" is preserved in the table

#### 6.2. TC-WAT-DUP-UPD-02: Update name to an existing Inactive record's name in the same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** "Enquiry Generated" / Enquiries is Inactive. "test" / Enquiries is Active.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on the Active "test" / Enquiries record
3. Change the name from "test" to "Enquiry Generated"
4. Keep "Template Category *" as "Enquiries"
5. Click "Update"
   - expect: Error message is displayed — duplicate blocked even against inactive records
   - expect: The record is NOT updated

#### 6.3. TC-WAT-DUP-UPD-03: Update name to UPPERCASE of an existing Active record in same category

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** "lead" / Leads is Active.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on any Leads record that is NOT "lead" (e.g. the "test" / Leads record)
3. Change the name to "LEAD" (uppercase of the existing "lead")
4. Keep "Template Category *" as "Leads"
5. Click "Update"
   - expect: Error message is displayed — case-insensitive duplicate blocked
   - expect: The record is NOT updated

#### 6.4. TC-WAT-DUP-UPD-04: Update name to same name but change to a different category (should succeed)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** "test" / Leads is Active. No record "test" exists for "Breakdown" category.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on the "test" / Leads record
3. Keep the name as "test"
4. Change "Template Category *" from "Leads" to "Breakdown"
5. Click "Update"
   - expect: Success toast appears — updating to same name in a different category is allowed
   - expect: The row now shows "test" / "Breakdown" in the table

#### 6.5. TC-WAT-DUP-UPD-05: Update without changing the name (keeping same name + same category)

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on any existing record (e.g. "pm" / PM)
3. Change only the "Template Content *" to updated text (keep name and category unchanged)
4. Click "Update"
   - expect: Success toast appears — saving the same name to the same record is allowed
   - expect: Table row reflects the updated content

---

### 7. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-WAT-CLR-01: Clear button resets Add form

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Enter "Some Name" in "Whatsapp Template Name *"
3. Select "Leads" from "Template Category *"
4. Enter "Some content" in "Template Content *"
5. Click "Clear"
   - expect: "Whatsapp Template Name *" field is cleared/empty
   - expect: "Template Category *" resets to "Select a category"
   - expect: "Template Content *" field is cleared/empty
   - expect: Media upload area resets (any selected file is removed)
   - expect: Form heading remains "Add Whatsapp Template"

#### 7.2. TC-WAT-CLR-02: Clicking Clear while in Update mode reverts form to Add mode

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Note:** The Update form does not display a Clear button; this test verifies behavior if/when a clear action is triggered (e.g. via keyboard or a revealed button).

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Click Edit on any existing row — form enters "Update Whatsapp Template" mode
3. If a "Clear" or cancel action is available, trigger it
   - expect: Form heading reverts to "Add Whatsapp Template"
   - expect: All fields are cleared/reset to default empty state
   - expect: "Status *" dropdown is no longer visible
   - expect: "Submit" button is shown again instead of "Update"

---

### 8. Search and Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-WAT-SRCH-01: Search by template name

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Type "breakdown" in the "Search..." input
   - expect: Table filters to show only rows where Whatsapp Template Name contains "breakdown"
   - expect: Records not matching "breakdown" are not shown
3. Clear the search input
   - expect: All Active records are shown again

#### 8.2. TC-WAT-SRCH-02: Filter by Active status

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Confirm the Status filter defaults to "Active"
   - expect: Only records with "Active" status badge are shown in the table
   - expect: No "Inactive" status badges are visible

#### 8.3. TC-WAT-SRCH-03: Filter by Inactive status

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Select "Inactive" from the Status filter dropdown
   - expect: Only records with "Inactive" status badge are shown
   - expect: Record "Enquiry Generated" (Enquiries – Inactive) is visible
   - expect: No "Active" status badges are visible

#### 8.4. TC-WAT-SRCH-04: Filter by All status

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Select "All" from the Status filter dropdown
   - expect: Both Active and Inactive records are shown
   - expect: The Inactive record "Enquiry Generated" is visible alongside Active records

---

### 9. Table Display — Attachment Column

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-WAT-ATT-01: Attachment column shows "Image Attachment" for image files

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "JObs Video" / Jobs has a JPEG image attached.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Locate the row "JObs Video" / Jobs
   - expect: Attachment cell shows "Image Attachment" text with an icon link
   - expect: The link href points to an image file (jpg/jpeg/png extension)

#### 9.2. TC-WAT-ATT-02: Attachment column shows "PDF Attachment" for PDF files

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "jobs pdf" / Jobs has a PDF attached.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Locate the row "jobs pdf" / Jobs
   - expect: Attachment cell shows "PDF Attachment" text with an icon link
   - expect: The link href points to a PDF file (.pdf extension)

#### 9.3. TC-WAT-ATT-03: Attachment column shows "PPT Attachment" for PPT files

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "breakdown PPT" / Enquiries has a PPTX attached.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Locate the row "breakdown PPT" / Enquiries
   - expect: Attachment cell shows "PPT Attachment" text with an icon link
   - expect: The link href points to a PPT/PPTX file (.pptx extension)

#### 9.4. TC-WAT-ATT-04: Attachment column shows icon link (no label) for MP4 video files

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "pm" / PM has an MP4 video attached.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Locate the row "pm" / PM
   - expect: Attachment cell shows an icon/link element with no text label
   - expect: The link href points to an MP4 file (.mp4 extension)

#### 9.5. TC-WAT-ATT-05: Attachment column is empty for records with no media

**File:** `tests/setting-module/whatsapp-template.spec.ts`

**Precondition:** Record "test" / Leads has no attachment.

**Steps:**
1. Navigate to `/setting/whatsapp-templates`
2. Locate the row "test" / Leads
   - expect: Attachment cell is empty (no link, no text)
