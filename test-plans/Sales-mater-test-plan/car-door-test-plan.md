# Car Door Master - Test Plan

## Overview
This test plan covers the Car Door Master module in the Sales section. The module allows administrators to manage different types of car doors, their opening mechanisms, and their associated pricing.

---

## Fields Summary

| Field | Type | Requirement | Details |
|-------|------|-------------|---------|
| Car Door Name | Text | Mandatory | String identifier for the car door |
| Door Opening Type | Dropdown | Mandatory | Options: Manual, Automatic |
| Price | Numeric | Mandatory | Numeric field which accepts only numbers |

---

## Test Cases

---

### TC-CDM-001: Verify Car Door Master page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in to the admin panel.
  2. Navigate to Sales Master > Car Door Master.
- **Expected Result:** Car Door Master page loads correctly with the form/list view displayed and all 3 fields visible.

---

### TC-CDM-002: Verify successful car door creation with all mandatory fields
- **Type:** Positive
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter a valid Car Door Name (e.g., "Telescopic Door").
  3. Select "Manual" from the Door Opening Type dropdown.
  4. Enter a valid numeric price (e.g., "5000").
  5. Click Save/Submit.
- **Expected Result:** Car door record is created successfully and appears in the data table.

---

### TC-CDM-003: Verify successful car door creation with Automatic opening type
- **Type:** Positive
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter a valid Car Door Name (e.g., "Center Opening Door").
  3. Select "Automatic" from the Door Opening Type dropdown.
  4. Enter a valid numeric price (e.g., "8500").
  5. Click Save/Submit.
- **Expected Result:** Car door record is saved with "Automatic" type and displayed in the list.

---

### TC-CDM-004: Verify form submission fails when Car Door Name is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Leave Car Door Name blank.
  3. Select a Door Opening Type.
  4. Enter a valid Price.
  5. Click Save/Submit.
- **Expected Result:** Validation error is shown for Car Door Name. Form is not submitted.

---

### TC-CDM-005: Verify form submission fails when Door Opening Type is not selected
- **Type:** Negative
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter a valid Car Door Name.
  3. Do not select any option from Door Opening Type dropdown.
  4. Enter a valid Price.
  5. Click Save/Submit.
- **Expected Result:** Validation error is shown for Door Opening Type. Form is not submitted.

---

### TC-CDM-006: Verify form submission fails when Price is empty
- **Type:** Negative
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter a valid Car Door Name.
  3. Select a Door Opening Type.
  4. Leave Price blank.
  5. Click Save/Submit.
- **Expected Result:** Validation error is shown for Price. Form is not submitted.

---

### TC-CDM-007: Verify Price field rejects alphabetic/special character input
- **Type:** Negative
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter alphabetic characters (e.g., "abc") or special characters (e.g., "@#$") in the Price field.
  3. Click Save/Submit.
- **Expected Result:** Field rejects non-numeric input either by blocking keystrokes or showing a validation error.

---

### TC-CDM-008: Verify Price field rejects negative values
- **Type:** Negative
- **Steps:**
  1. Navigate to Car Door Master and click Add/Create.
  2. Enter a negative value (e.g., "-500") in the Price field.
  3. Click Save/Submit.
- **Expected Result:** Validation error is shown for negative price.

---

### TC-CDM-009: Verify duplicate Car Door Name is not allowed
- **Type:** Negative
- **Steps:**
  1. Create a car door record with name "Standard Door".
  2. Attempt to create another car door with the same name "Standard Door".
  3. Click Save/Submit.
- **Expected Result:** System displays a duplicate entry error and prevents saving.

---

### TC-CDM-010: Verify Edit functionality for an existing car door
- **Type:** Positive
- **Steps:**
  1. Navigate to Car Door Master list.
  2. Click Edit on an existing record.
  3. Modify the Price or Door Opening Type and car door name.
  4. Click Save/Submit.
- **Expected Result:** Record is updated with the new values in the data table.

---

### TC-CDM-011: Verify Inactive functionality
- **Type:** Positive
- **Steps:**
  1. Edit an existing car door record.
  2. Change status to "Inactive".
  3. Save the record.
- **Expected Result:** Record is moved to the inactive list and not visible in the default active view.

---

### TC-CDM-012: Verify Cancel/Clear discards unsaved changes
- **Type:** Positive
- **Steps:**
  1. Open Add/Create form.
  2. Fill some data.
  3. Click Cancel or Clear.
- **Expected Result:** Form is cleared/closed, and no record is created.

---

### TC-CDM-013: Verify Car Door Master list displays all created records
- **Type:** Positive
- **Steps:**
  1. Create multiple records with different opening types.
  2. View the Car Door Master list.
- **Expected Result:** All records are displayed correctly with their respective Name, Type, and Price.

---

### TC-CDM-014: Verify mandatory field validation and clear functionality
- **Type:** Negative
- **Steps:**
  1. Leave all mandatory fields (Car Door Name, Door Opening Type, Price) empty.
  2. Click on the Submit button.
  3. Observe the validation error messages.
  4. Click on the Clear button.
- **Expected Result:** System restricts from creating a new entry and shows error messages for all mandatory fields. After clicking Clear, all error messages and form inputs should be cleared.

---

### TC-CDM-015: Verify creation with same opening type but different car door name
- **Type:** Positive
- **Steps:**
  1. Create a record with a specific Opening Type (e.g., "Manual") and a Car Door Name (e.g., "Door A").
  2. Attempt to create another record with the same Opening Type ("Manual") but a different Car Door Name (e.g., "Door B").
  3. Click Save/Submit.
- **Expected Result:** System should allow creating records with the same opening type if the car door name is different.

---

### TC-CDM-016: Verify inactive record display state
- **Type:** Positive
- **Steps:**
  1. Select an existing active record.
  2. Change its status to "Inactive" and save.
  3. Apply the Inactive filter in the data table.
- **Expected Result:** The record should be displayed in the inactive state/list.

---

### TC-CDM-017: Verify duplicate entry restriction for Name and Opening Type
- **Type:** Negative
- **Steps:**
  1. Identify an existing entry with a specific Car Door Name and Opening Type.
  2. Attempt to add a new entry with the exact same Car Door Name and Opening Type.
  3. Click Save/Submit.
- **Expected Result:** System should restrict duplicate entries and show an appropriate error message.

---

### TC-CDM-018: Verify error when updating to an existing active record's details
- **Type:** Negative

- **Steps:**
  1. Edit an existing active record.
  2. Update its Car Door Name and Opening Type to match another existing active record.
  3. Click Save/Submit.
- **Expected Result:** System should show an error message and prevent the update.

---

### TC-CDM-019: Verify error when updating to an existing inactive record's details
- **Type:** Negative
- **Steps:**
  1. Edit an existing active record.
  2. Update its Car Door Name and Opening Type to match an existing inactive record.
  3. Click Save/Submit.
- **Expected Result:** System should show an error message and prevent the update.

---

### TC-CDM-020: Verify default active filter in data table
- **Type:** Positive
- **Steps:**
  1. Navigate to the Car Door Master data table.
- **Expected Result:** By default, the "Active" filter should be applied, and only active records should be displayed.

---

### TC-CDM-021: Verify Active filter functionality
- **Type:** Positive
- **Steps:**
  1. Apply the "Active" filter in the data table.
- **Expected Result:** Only active records should be displayed in the data table.

---

### TC-CDM-022: Verify Inactive filter functionality
- **Type:** Positive
- **Steps:**
  1. Apply the "Inactive" filter in the data table.
- **Expected Result:** All inactive records should be displayed in the data table.

---

### TC-CDM-023: Verify All filter functionality
- **Type:** Positive
- **Steps:**
  1. Apply the "All" filter in the data table.
- **Expected Result:** Both active and inactive records should be displayed in the data table.

---

### TC-CDM-024: Verify search functionality
- **Type:** Positive
- **Steps:**
  1. Enter a valid Door Opening Type or Car Door Name in the search field.
- **Expected Result:** The data table should display only the records that match the search criteria.

---

### TC-CDM-025: Verify export functionality
- **Type:** Positive
- **Steps:**
  1. Click on the Export button.
- **Expected Result:** An Excel file should be downloaded. The exported sheet should contain all data currently present in the data table, including all columns.

---

## Summary

| Category | Count |
|----------|-------|
| Smoke | 1 |
| Positive | 15 |
| Negative | 9 |
| **Total** | **25** |
