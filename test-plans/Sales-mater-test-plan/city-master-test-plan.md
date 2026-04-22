# City Master - Test Plan

## Overview
This test plan covers the City Master module in the admin panel. The module allows administrators to create and manage city records with associated cost configurations and assignments.

---

## Fields Summary

| Field | Type | Requirement |
|-------|------|-------------|
| City Name | Text | Mandatory |
| Transportation Cost | Numeric | Mandatory |
| Outward Transportation Cost | Numeric | Optional |
| Installation Cost | Numeric | Mandatory |
| Installation Cost Per Floor Increase | Numeric | Mandatory |
| Machine Hoisting | Numeric | Mandatory |
| Machine Hoisting Per Floor Increase | Numeric | Mandatory |
| City Manager/Head | Dropdown (User list) | Optional |
| City Head Signature | File Upload (PNG, JPEG, JPG only) | Optional |

---

## Test Cases

---

### TC-CM-001: Verify City Master page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in to the admin panel.
  2. Navigate to City Master.
- **Expected Result:** City Master page loads with the form/list view displayed correctly and all 9 fields are visible.

---

### TC-CM-002: Verify successful city creation with all mandatory fields filled
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter a valid city name (e.g., "Mumbai").
  3. Enter valid numeric values for Transportation Cost, Installation Cost, Installation Cost Per Floor Increase, Machine Hoisting, Machine Hoisting Per Floor Increase.
  4. Leave optional fields empty.
  5. Click Save/Submit.
- **Expected Result:** City record is created successfully and appears in the data table.

---

### TC-CM-003: Verify successful city creation with all fields filled
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter a valid city name.
  3. Enter valid numeric values for all numeric fields (including optional Outward Transportation Cost).
  4. Select a user from the City Manager/Head dropdown.
  5. Upload a valid PNG/JPEG/JPG image as City Head Signature.
  6. Click Save/Submit.
- **Expected Result:** City record is saved with all fields, the assigned city manager is shown, and the uploaded signature is stored. added record shoud be displayed in data table

---

### TC-CM-004: Verify form submission fails when City Name is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Leave City Name blank.
  3. Fill all other mandatory fields with valid data.
  4. Click Save/Submit.
- **Expected Result:** Validation error is shown for City Name. Form is not submitted.

---

### TC-CM-005: Verify form submission fails when Transportation Cost is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter a valid city name.
  3. Leave Transportation Cost blank.
  4. Fill remaining mandatory fields.
  5. Click Save/Submit.
- **Expected Result:** Validation error is shown for Transportation Cost. Form is not submitted.

---

### TC-CM-006: Verify form submission fails when Installation Cost is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter a valid city name and Transportation Cost.
  3. Leave Installation Cost blank.
  4. Fill remaining mandatory fields.
  5. Click Save/Submit.
- **Expected Result:** Validation error is shown for Installation Cost. Form is not submitted.

---

### TC-CM-007: Verify form submission fails when Installation Cost Per Floor Increase is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields except Installation Cost Per Floor Increase.
  3. Click Save/Submit.
- **Expected Result:** Validation error is shown for Installation Cost Per Floor Increase. Form is not submitted.

---

### TC-CM-008: Verify form submission fails when Machine Hoisting is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields except Machine Hoisting.
  3. Click Save/Submit.
- **Expected Result:** Validation error is shown for Machine Hoisting. Form is not submitted.

---

### TC-CM-009: Verify form submission fails when Machine Hoisting Per Floor Increase is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields except Machine Hoisting Per Floor Increase.
  3. Click Save/Submit.
- **Expected Result:** Validation error is shown for Machine Hoisting Per Floor Increase. Form is not submitted.

---

### TC-CM-010: Verify numeric fields reject alphabetic/special character input
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter alphabetic characters (e.g., "abc") in Transportation Cost field.
  3. Repeat for: Outward Transportation Cost, Installation Cost, Installation Cost Per Floor Increase, Machine Hoisting, Machine Hoisting Per Floor Increase.
  4. Click Save/Submit.
- **Expected Result:** Each numeric field rejects non-numeric input — either by not allowing typing or by showing a validation error.

---

### TC-CM-011: Verify numeric fields reject negative values (if applicable)
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter a negative number (e.g., "-100") in Transportation Cost.
  3. Repeat for all other numeric fields.
  4. Click Save/Submit.
- **Expected Result:** Validation error is shown for negative values, or the field does not accept negative input.

---

### TC-CM-012: Verify numeric fields reject zero (if applicable)
- **Type:** Boundary
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter "0" in each mandatory numeric field one at a time.
  3. Click Save/Submit.
- **Expected Result:** System either accepts or rejects zero based on business rules. Validate consistent behavior.

---

### TC-CM-013: Verify City Manager/Head dropdown loads all users
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Click on the City Manager/Head dropdown.
- **Expected Result:** Dropdown opens and displays a list of all available user names fetched from the system.

---

### TC-CM-014: Verify selecting a user from City Manager/Head dropdown
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Click the City Manager/Head dropdown.
  3. Select any user from the list.
- **Expected Result:** The selected user name is shown in the dropdown field. The user is assigned to the city upon saving.

---

### TC-CM-015: Verify City Manager/Head is optional — form saves without selecting a user
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Leave City Manager/Head unselected.
  4. Click Save/Submit.
- **Expected Result:** City record is saved successfully without a city manager assigned.

---

### TC-CM-016: Verify City Head Signature accepts PNG file
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Upload a valid .png file in City Head Signature.
  4. Click Save/Submit.
- **Expected Result:** PNG file is accepted and saved successfully.

---

### TC-CM-017: Verify City Head Signature accepts JPEG file
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Upload a valid .jpeg file in City Head Signature.
  4. Click Save/Submit.
- **Expected Result:** JPEG file is accepted and saved successfully.

---

### TC-CM-018: Verify City Head Signature accepts JPG file
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Upload a valid .jpg file in City Head Signature.
  4. Click Save/Submit.
- **Expected Result:** JPG file is accepted and saved successfully.

---

### TC-CM-019: Verify City Head Signature rejects unsupported file types
- **Type:** Negative
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Attempt to upload a .pdf file in City Head Signature.
  4. Repeat with .gif, .bmp, .docx, .txt files.
  5. Click Save/Submit.
- **Expected Result:** Unsupported file types are rejected with an appropriate error message (e.g., "Only PNG, JPEG, JPG files are allowed").

---

### TC-CM-020: Verify City Head Signature is optional — form saves without uploading an image
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Fill all mandatory fields.
  3. Leave City Head Signature empty.
  4. Click Save/Submit.
- **Expected Result:** City record is saved successfully without a signature image.

---

### TC-CM-021: Verify City Name accepts only text and rejects purely numeric input (if applicable)
- **Type:** Boundary
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter only numbers (e.g., "12345") in City Name.
  3. Click Save/Submit.
- **Expected Result:** Validate system behavior — ideally shows a warning or accepts based on business rules.

---

### TC-CM-022: Verify duplicate city name is not allowed
- **Type:** Negative
- **Steps:**
  1. Create a city record with city name "Chennai".
  2. Attempt to create another city with the same name "Chennai".
  3. Click Save/Submit.
- **Expected Result:** System displays a duplicate entry error and prevents saving.

---

### TC-CM-023: Verify Edit functionality for an existing city
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master list.
  2. Click Edit on an existing city record.
  3. Modify any field (e.g., update Transportation Cost).
  4. Click Save/Submit.
- **Expected Result:** City record is updated with the new values.

---

### TC-CM-024: Verify inactive functionality for an existing city
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master list.
  2. Click edit icon
  3.navigate to the status dropdown
  4. select inactive option 
  5. click on update button
  6. veriry that record in data table 
  7. that record should not display in active it's should visible only if  all and inactive filetrs are applied 
- **Expected Result:** City record is removed from the list active list  and it should visible only in inactive and all list in the data table 

---

### TC-CM-025: Verify Cancel/Close discards unsaved changes
- **Type:** Positive
- **Steps:**
  1. Navigate to City Master and click Add/Create.
  2. Enter data in some fields.
  3. Click clear without saving.
- **Expected Result:** No record is created and the form is dismissed without saving any data.

---

### TC-CM-026: Verify City Master list displays created city records
- **Type:** Positive
- **Steps:**
  1. Create one or more city records.
  2. Navigate to the City Master list view.
- **Expected Result:** All created city records are displayed in the list with correct field values.

---

### TC-CM-027: Verify assigned City Manager appears correctly in city details
- **Type:** Positive
- **Steps:**
  1. Create a city and assign a City Manager/Head from the dropdown.
  2. Save and open the city record.
- **Expected Result:** The assigned city manager's name is correctly displayed in the city record details.

---

## Summary

| Category | Count |
|----------|-------|
| Smoke | 1 |
| Positive | 14 |
| Negative | 9 |
| Boundary | 3 |
| **Total** | **27** |
