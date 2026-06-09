# PDF Image Setting Master — Test Plan

**Module:** Settings > PDF Image Settings  
**URL:** `https://stage.elevatorplus.net/setting/pdf-image-setting`  
**Date:** 2026-06-06

---

## Fields Overview

| Field       | Type         | Mandatory | Placeholder           |
|-------------|--------------|-----------|----------------------|
| Image Label | Text input   | Yes       | Enter the image label |
| Height      | Number (spinbutton) | Yes | Enter the height    |
| Width       | Text input   | Yes       | Enter the width       |

**Form Buttons:** Clear, Submit (Add mode) / Update (Edit mode)

**Table Columns:** Sr. No., Action (Edit icon), Image Label, Height, Width

**Table Toolbar:** Show rows (10/25/50/100), Status filter (All/Active/Inactive), Search Image Label

---

## Test Cases

---

### TC-PIS-001 — Page Load and Navigation

**Priority:** High  
**Pre-condition:** User is logged in as Admin.

**Steps:**
1. Navigate to `Settings` in the left sidebar.
2. Click `PDF Image Settings` from the submenu.

**Expected Result:**
- Page URL is `https://stage.elevatorplus.net/setting/pdf-image-setting`.
- Page heading reads **"PDF Image Settings"**.
- Add form section heading reads **"Add PDF Image Setting"**.
- Form displays three fields: **Image Label \***, **Height \***, **Width \***.
- **Clear** and **Submit** buttons are visible.
- Table is visible with columns: Sr. No., Action, Image Label, Height, Width.
- Table toolbar contains Show, Status filter, and Search fields.

---

### TC-PIS-002 — Add Record — Valid Data (Happy Path)

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. In the **Image Label** field, enter a unique label (e.g., `TestImage001`).
2. In the **Height** field, enter a positive integer (e.g., `100`).
3. In the **Width** field, enter a positive integer (e.g., `200`).
4. Click **Submit**.

**Expected Result:**
- A success toast notification appears confirming the record was created.
- The form is cleared/reset after submission.
- The new record appears in the table with correct Image Label, Height, and Width values.

---

### TC-PIS-003 — Add Record — All Fields Empty (Submit without input)

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page with the form empty.

**Steps:**
1. Leave all fields blank.
2. Click **Submit**.

**Expected Result:**
- Validation error messages appear for **Image Label**, **Height**, and **Width** fields.
- No record is created.
- The form remains on the page.

---

### TC-PIS-004 — Add Record — Image Label Empty

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Leave **Image Label** blank.
2. Enter `80` in **Height**.
3. Enter `60` in **Width**.
4. Click **Submit**.

**Expected Result:**
- Validation error appears for the **Image Label** field.
- No record is created.

---

### TC-PIS-005 — Add Record — Height Empty

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `TestImageHeight` in **Image Label**.
2. Leave **Height** blank.
3. Enter `60` in **Width**.
4. Click **Submit**.

**Expected Result:**
- Validation error appears for the **Height** field.
- No record is created.

---

### TC-PIS-006 — Add Record — Width Empty

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `TestImageWidth` in **Image Label**.
2. Enter `80` in **Height**.
3. Leave **Width** blank.
4. Click **Submit**.

**Expected Result:**
- Validation error appears for the **Width** field.
- No record is created.

---

### TC-PIS-007 — Add Record — Duplicate Image Label

**Priority:** Medium  
**Pre-condition:** A record with Image Label `Ceiling` already exists in the table.

**Steps:**
1. Enter `Ceiling` in **Image Label**.
2. Enter `100` in **Height**.
3. Enter `100` in **Width**.
4. Click **Submit**.

**Expected Result:**
- An error/duplicate toast notification appears indicating the Image Label already exists.
- No duplicate record is created in the table.

---

### TC-PIS-008 — Add Record — Height with Non-Numeric Value

**Priority:** Medium  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `TestLabel` in **Image Label**.
2. Attempt to type alphabetic characters (e.g., `abc`) in **Height** (spinbutton field).
3. Enter `50` in **Width**.
4. Click **Submit**.

**Expected Result:**
- The **Height** spinbutton rejects or ignores non-numeric input.
- Validation error appears if the field remains empty or invalid.
- No record is created.

---

### TC-PIS-009 — Add Record — Height with Zero Value

**Priority:** Low  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `TestZeroHeight` in **Image Label**.
2. Enter `0` in **Height**.
3. Enter `50` in **Width**.
4. Click **Submit**.

**Expected Result:**
- Verify whether zero is accepted or a validation error is shown for Height.
- Document actual behavior.

---

### TC-PIS-010 — Add Record — Negative Height Value

**Priority:** Low  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `TestNegHeight` in **Image Label**.
2. Enter `-10` in **Height**.
3. Enter `50` in **Width**.
4. Click **Submit**.

**Expected Result:**
- Validation error appears rejecting negative value in **Height**.
- No record is created.

---

### TC-PIS-011 — Add Record — Very Long Image Label

**Priority:** Low  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter a string of 255+ characters in **Image Label**.
2. Enter `50` in **Height**.
3. Enter `50` in **Width**.
4. Click **Submit**.

**Expected Result:**
- Either the field enforces a max-length limit, or the record is created and truncated/validated gracefully.
- Document actual behavior.

---

### TC-PIS-012 — Clear Button — Resets Form Fields

**Priority:** Medium  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Enter `ClearTest` in **Image Label**.
2. Enter `80` in **Height**.
3. Enter `60` in **Width**.
4. Click **Clear**.

**Expected Result:**
- All three form fields are emptied/reset to their default state.
- No record is created or modified.

---

### TC-PIS-013 — Edit Record — Valid Update

**Priority:** High  
**Pre-condition:** At least one record exists in the table.

**Steps:**
1. Click the **Edit** (pencil) icon on an existing row (e.g., row with Image Label `Machine`).
2. Verify form heading changes to **"Update PDF Image Setting"**.
3. Verify all three fields are pre-populated with the existing record's values.
4. Change **Height** to a new value (e.g., `75`).
5. Change **Width** to a new value (e.g., `65`).
6. Click **Update**.

**Expected Result:**
- A success toast notification appears confirming the record was updated.
- The updated values are reflected in the table row.
- The form resets to "Add PDF Image Setting" mode.

---

### TC-PIS-014 — Edit Record — Clear Button in Edit Mode

**Priority:** Medium  
**Pre-condition:** User has clicked Edit on an existing record (form is in Update mode).

**Steps:**
1. Click Edit on any row to enter Update mode.
2. Modify one or more field values.
3. Click **Clear**.

**Expected Result:**
- Form fields are cleared/reset.
- The form heading may revert to "Add PDF Image Setting" (add mode).
- No changes are saved to the record.

---

### TC-PIS-015 — Edit Record — Clear Mandatory Field and Update

**Priority:** Medium  
**Pre-condition:** User has clicked Edit on an existing record.

**Steps:**
1. Click Edit on any row.
2. Clear the **Image Label** field.
3. Click **Update**.

**Expected Result:**
- Validation error appears for **Image Label**.
- Record is not updated.

---

### TC-PIS-016 — Table — Search by Image Label

**Priority:** High  
**Pre-condition:** Multiple records exist in the table.

**Steps:**
1. In the **Search Image Label** field in the table toolbar, type a known label (e.g., `Cabin`).

**Expected Result:**
- Table filters in real time to show only rows where Image Label contains "Cabin".
- Rows that do not match the search query are hidden.

---

### TC-PIS-017 — Table — Search with No Matching Results

**Priority:** Medium  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. In the **Search Image Label** field, type a string that does not match any existing record (e.g., `zzznomatch`).

**Expected Result:**
- Table shows no rows (or an empty state message).
- Table does not throw an error.

---

### TC-PIS-018 — Table — Search Field Clear (Reset)

**Priority:** Low  
**Pre-condition:** A search term has been entered in the Search field and table is filtered.

**Steps:**
1. Clear the text in the **Search Image Label** field.

**Expected Result:**
- Table reverts to showing all records.

---

### TC-PIS-019 — Table — Status Filter (Active)

**Priority:** Medium  
**Pre-condition:** Multiple records exist with different statuses.

**Steps:**
1. In the **Status** dropdown in the table toolbar, select `Active`.

**Expected Result:**
- Table shows only Active records.
- Inactive records are not displayed.

---

### TC-PIS-020 — Table — Status Filter (Inactive)

**Priority:** Medium  
**Pre-condition:** At least one inactive record exists.

**Steps:**
1. In the **Status** dropdown, select `Inactive`.

**Expected Result:**
- Table shows only Inactive records.
- Active records are not displayed.

---

### TC-PIS-021 — Table — Status Filter (All)

**Priority:** Low  
**Pre-condition:** Status filter is set to Active or Inactive.

**Steps:**
1. In the **Status** dropdown, select `All`.

**Expected Result:**
- Table shows all records regardless of status.

---

### TC-PIS-022 — Table — Rows Per Page (Show 25)

**Priority:** Low  
**Pre-condition:** More than 10 records exist.

**Steps:**
1. Change the **Show** dropdown from `10` to `25`.

**Expected Result:**
- Table updates to display up to 25 records per page.
- Pagination updates accordingly.

---

### TC-PIS-023 — Table — Column Sorting (Image Label)

**Priority:** Medium  
**Pre-condition:** Multiple records exist in the table.

**Steps:**
1. Click the **Image Label** column header button.
2. Observe sort order (ascending).
3. Click the **Image Label** column header button again.
4. Observe sort order (descending).

**Expected Result:**
- First click: Table rows sorted alphabetically A → Z by Image Label.
- Second click: Table rows sorted Z → A by Image Label.

---

### TC-PIS-024 — Table — Column Sorting (Height)

**Priority:** Low  
**Pre-condition:** Multiple records exist in the table.

**Steps:**
1. Click the **Height** column header button once.
2. Click the **Height** column header button again.

**Expected Result:**
- First click: Records sorted by Height in ascending order.
- Second click: Records sorted by Height in descending order.

---

### TC-PIS-025 — Table — Column Sorting (Width)

**Priority:** Low  
**Pre-condition:** Multiple records exist in the table.

**Steps:**
1. Click the **Width** column header button once.
2. Click the **Width** column header button again.

**Expected Result:**
- First click: Records sorted by Width in ascending order.
- Second click: Records sorted by Width in descending order.

---

### TC-PIS-026 — Table — Pagination (Next / Previous)

**Priority:** Medium  
**Pre-condition:** More records exist than the current page size (e.g., more than 10 records with Show=10).

**Steps:**
1. Click the **Next page** button.
2. Verify page 2 loads with the next set of records.
3. Click the **Previous page** button.
4. Verify page 1 is restored.

**Expected Result:**
- Navigation between pages works correctly.
- Records on each page are distinct from other pages.
- "Previous page" is disabled on page 1; "Next page" is disabled on the last page.

---

### TC-PIS-027 — Table — Edit Icon in Row Changes on Edit Mode

**Priority:** Low  
**Pre-condition:** User is on the PDF Image Settings page.

**Steps:**
1. Note the Edit icon/text in the Action cell of row 1.
2. Click the Edit icon on row 1.

**Expected Result:**
- The row's Action cell no longer shows the "Edit" accessible name (icon only, no text label visible in action cell).
- The form switches to Update mode with that row's data pre-filled.

---

### TC-PIS-028 — Add Record — Duplicate of Existing Active Image Label

**Priority:** High  
**Pre-condition:** A record with a specific Image Label (e.g., `Ceiling`) exists in the table with **Active** status.

**Steps:**
1. Enter the same Image Label as an existing active record (e.g., `Ceiling`) in the **Image Label** field.
2. Enter `100` in **Height**.
3. Enter `100` in **Width**.
4. Click **Submit**.

**Expected Result:**
- An error/duplicate message appears indicating the Image Label already exists.
- No new record is created in the table.

---

### TC-PIS-029 — Add Record — Duplicate of Existing Inactive Image Label

**Priority:** High  
**Pre-condition:** A record with a specific Image Label (e.g., `OldFrame`) exists in the table with **Inactive** status.

**Steps:**
1. Enter the same Image Label as an existing inactive record (e.g., `OldFrame`) in the **Image Label** field.
2. Enter `80` in **Height**.
3. Enter `60` in **Width**.
4. Click **Submit**.

**Expected Result:**
- An error/duplicate message appears indicating the Image Label already exists (even though the existing record is inactive).
- No new record is created in the table.

---

### TC-PIS-030 — Update Record — New Label Duplicates Existing Active Record

**Priority:** High  
**Pre-condition:** At least two active records exist (e.g., `Machine` and `Ceiling`).

**Steps:**
1. Click the **Edit** icon on the row with Image Label `Machine`.
2. Clear the **Image Label** field and enter the label of another existing active record (e.g., `Ceiling`).
3. Keep Height and Width values as pre-filled.
4. Click **Update**.

**Expected Result:**
- An error/duplicate message appears indicating the Image Label already exists.
- The record is not updated; original values are preserved.

---

### TC-PIS-031 — Update Record — New Label Duplicates Existing Inactive Record

**Priority:** High  
**Pre-condition:** An active record (e.g., `Machine`) and an inactive record (e.g., `OldFrame`) both exist in the table.

**Steps:**
1. Click the **Edit** icon on the active row with Image Label `Machine`.
2. Clear the **Image Label** field and enter the label of an existing inactive record (e.g., `OldFrame`).
3. Keep Height and Width values as pre-filled.
4. Click **Update**.

**Expected Result:**
- An error/duplicate message appears indicating the Image Label already exists (even though the conflicting record is inactive).
- The record is not updated; original values are preserved.

---

### TC-PIS-032 — Add Record — Whitespace Only in Mandatory Fields

**Priority:** High  
**Pre-condition:** User is on the PDF Image Settings page with the form empty.

**Steps:**
1. Enter only spaces (e.g., `   `) in the **Image Label** field.
2. Enter only spaces in the **Height** field.
3. Enter only spaces in the **Width** field.
4. Click **Submit**.

**Expected Result:**
- Validation error messages appear for all mandatory fields (whitespace-only input is treated as empty).
- No record is created.
- The form remains on the page.

---

### TC-PIS-033 — Update Record — Empty Mandatory Fields

**Priority:** High  
**Pre-condition:** At least one record exists in the table.

**Steps:**
1. Click the **Edit** icon on an existing row.
2. Verify the form switches to **Update PDF Image Setting** mode with all fields pre-populated.
3. Clear the **Image Label** field.
4. Clear the **Height** field.
5. Clear the **Width** field.
6. Click **Update**.

**Expected Result:**
- Validation error messages appear for **Image Label**, **Height**, and **Width** fields.
- The record is not updated; original values are preserved.
- The form remains in Update mode.

---

## Summary

| Test Case | Description                                  | Priority |
|-----------|----------------------------------------------|----------|
| TC-PIS-001 | Page load and navigation                    | High     |
| TC-PIS-002 | Add record — valid data                     | High     |
| TC-PIS-003 | Submit all fields empty                     | High     |
| TC-PIS-004 | Image Label empty                           | High     |
| TC-PIS-005 | Height empty                                | High     |
| TC-PIS-006 | Width empty                                 | High     |
| TC-PIS-007 | Duplicate Image Label                       | Medium   |
| TC-PIS-008 | Non-numeric Height                          | Medium   |
| TC-PIS-009 | Zero Height                                 | Low      |
| TC-PIS-010 | Negative Height                             | Low      |
| TC-PIS-011 | Very long Image Label                       | Low      |
| TC-PIS-012 | Clear button resets form                    | Medium   |
| TC-PIS-013 | Edit record — valid update                  | High     |
| TC-PIS-014 | Clear in edit mode                          | Medium   |
| TC-PIS-015 | Clear mandatory field in edit and update    | Medium   |
| TC-PIS-016 | Search by Image Label                       | High     |
| TC-PIS-017 | Search with no results                      | Medium   |
| TC-PIS-018 | Clear search resets table                   | Low      |
| TC-PIS-019 | Status filter — Active                      | Medium   |
| TC-PIS-020 | Status filter — Inactive                    | Medium   |
| TC-PIS-021 | Status filter — All                         | Low      |
| TC-PIS-022 | Rows per page — Show 25                     | Low      |
| TC-PIS-023 | Column sort — Image Label                   | Medium   |
| TC-PIS-024 | Column sort — Height                        | Low      |
| TC-PIS-025 | Column sort — Width                         | Low      |
| TC-PIS-026 | Pagination next/previous                    | Medium   |
| TC-PIS-027 | Edit icon row state in edit mode            | Low      |
| TC-PIS-028 | Add record — duplicate of existing active Image Label   | High     |
| TC-PIS-029 | Add record — duplicate of existing inactive Image Label | High     |
| TC-PIS-030 | Update record — new label duplicates active record      | High     |
| TC-PIS-031 | Update record — new label duplicates inactive record    | High     |
| TC-PIS-032 | Add record — whitespace only in mandatory fields        | High     |
| TC-PIS-033 | Update record — empty mandatory fields                  | High     |
