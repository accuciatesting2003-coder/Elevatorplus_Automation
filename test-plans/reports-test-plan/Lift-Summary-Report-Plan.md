# Lift Summary Report - Test Plan

## Overview
This test plan covers the **Lift Summary Report** (`/reports/lift-summary`), internally titled **"Job History Report"**, which displays the complete service and maintenance history of a **single lift**. The report is **lift-scoped**: nothing is listed until a specific **Site** and **Wing/Lift Name** are selected from the Filter panel. The Filter exposes a **Show Job Number / Show Site** toggle, a mandatory **Site \*** dropdown, and a mandatory **Wing/Lift Name \*** dropdown. The header **Search** box targets Site Name or Job Number depending on the toggle. Instead of an Excel export, the report offers **Download PDF** and **Mail To** actions.

---

## Columns Summary

| # | Column | Notes |
|---|--------|-------|
| 1 | Sr. No. | Row index |
| 2 | Planned Date | DD-MM-YYYY |
| 3 | Actual Date | DD-MM-YYYY |
| 4 | Type | Service type (PM, Breakdown, etc.) |
| 5 | Note for Customer | Free text / "-" |
| 6 | Complaint | Free text / "-" |
| 7 | Issue | Free text / "-" |
| 8 | Work Done | Free text / "-" |
| 9 | Status | Coloured badge |

## Controls Summary

| Control | Behaviour |
|---------|-----------|
| Filter | Show Job Number/Show Site toggle, Site \* (mandatory), Wing/Lift Name \* (mandatory), Reset, Apply |
| Search | Targets Site Name or Job Number per the toggle |
| Download PDF | Generates a PDF of the selected lift's history |
| Mail To | Emails the report |
| Pagination | 10 / 25 / 50 / 100 rows (default 10) |

---

## Test Cases

---

## Test Suite 1: Page Load & Initial State

### TC-LS-001: Lift Summary Report page loads successfully
- **Type:** Smoke
- **Steps:**
  1. Log in to the admin panel.
  2. Navigate to Reports > Lift Summary Report.
- **Expected Result:** The page loads with the "Job History Report" heading and subtitle "View lift service and maintenance history"; the table headers, Download PDF, Mail To, Filter, and Search controls are visible.

### TC-LS-002: Report shows empty state before any lift is selected
- **Type:** Positive
- **Steps:**
  1. Navigate to Lift Summary Report (fresh load).
  2. Observe the table area without selecting any Site/Lift.
- **Expected Result:** The table shows the column headers and a "No records found" empty state, because no lift has been selected yet.

---

## Test Suite 2: Lift Selection (Filter)

### TC-LS-003: Select Site and Wing/Lift then Apply lists the lift history
- **Type:** Positive
- **Steps:**
  1. Click the Filter button.
  2. Select a valid Site from the Site \* dropdown.
  3. Select a valid Wing/Lift Name from the Wing/Lift Name \* dropdown.
  4. Click Apply.
- **Expected Result:** The Filter panel closes and the table lists the selected lift's planned/actual service history rows.

### TC-LS-004: Site and Wing/Lift Name are mandatory
- **Type:** Negative
- **Steps:**
  1. Open the Filter panel.
  2. Leave Site and/or Wing/Lift Name unselected.
  3. Click Apply.
- **Expected Result:** Apply is blocked or a validation message is shown for the missing mandatory field(s); the report does not load data.

### TC-LS-005: Wing/Lift Name options depend on the selected Site (cascading)
- **Type:** Positive
- **Steps:**
  1. Open the Filter panel and select a Site.
  2. Open the Wing/Lift Name dropdown.
  3. Change the Site to a different one and reopen the Wing/Lift Name dropdown.
- **Expected Result:** The Wing/Lift Name list shows only lifts belonging to the selected Site and repopulates/resets when the Site changes.

### TC-LS-006: Show Job Number / Show Site toggle switches the search target
- **Type:** Positive
- **Steps:**
  1. Open the Filter panel.
  2. Toggle "Show Job Number / Show Site".
  3. Observe the header Search box placeholder/target.
- **Expected Result:** The Search box target switches between Site Name and Job Number according to the toggle state.

### TC-LS-007: Reset inside the Filter panel clears selections
- **Type:** Positive
- **Steps:**
  1. Open the Filter panel and select a Site and Wing/Lift Name.
  2. Click Reset.
- **Expected Result:** The Site and Wing/Lift Name selections are cleared back to their default (unselected) state.

### TC-LS-008: Clear All / Active Filters resets the report to the empty state
- **Type:** Positive
- **Steps:**
  1. Select a Site + Wing/Lift and Apply so history is listed.
  2. Click Clear All (or remove the Active Filters chip).
- **Expected Result:** The report returns to the initial "No records found" empty state and the lift selection is cleared.

---

## Test Suite 3: Search Functionality

### TC-LS-009: Search by Site Name (Show Site active)
- **Type:** Positive
- **Steps:**
  1. Ensure the toggle is set to Show Site.
  2. Type a valid Site Name in the Search box.
- **Expected Result:** The listing filters to records matching the entered Site Name.

### TC-LS-010: Search by Job Number (Show Job Number active)
- **Type:** Positive
- **Steps:**
  1. Set the toggle to Show Job Number.
  2. Type a valid Job Number in the Search box.
- **Expected Result:** The listing filters to records matching the entered Job Number.

### TC-LS-011: Search handles special characters and spaces
- **Type:** Positive
- **Steps:**
  1. Enter special characters (`@`, `#`) and leading/trailing spaces in the Search box.
- **Expected Result:** The system handles the input gracefully without crashing and returns an appropriate (possibly empty) result.

### TC-LS-012: Search with no matching value
- **Type:** Negative
- **Steps:**
  1. Enter a value known not to exist in the Search box.
- **Expected Result:** A clear "No records found" empty state is displayed.

---

## Test Suite 4: Data Table & Grid

### TC-LS-013: All 9 columns are visible
- **Type:** Positive
- **Steps:**
  1. Select a lift so history is listed.
  2. Inspect the table header.
- **Expected Result:** All 9 columns are present: Sr. No., Planned Date, Actual Date, Type, Note for Customer, Complaint, Issue, Work Done, Status.

### TC-LS-014: Date and Status formatting
- **Type:** Positive
- **Steps:**
  1. With history listed, inspect the Planned Date, Actual Date, and Status cells.
- **Expected Result:** Dates render as DD-MM-YYYY and Status renders as a coloured badge.

### TC-LS-015: Column sorting works
- **Type:** Positive
- **Steps:**
  1. With history listed, click the Planned Date column header, then the Actual Date, Type, and Status headers.
- **Expected Result:** Each click toggles ascending/descending sort on that column and the rows reorder accordingly.

### TC-LS-016: Empty cells show placeholder
- **Type:** Positive
- **Steps:**
  1. Locate a row where Note/Complaint/Issue/Work Done has no value.
- **Expected Result:** Empty cells render a "-" placeholder.

### TC-LS-017: Sr. No. increments correctly across pages
- **Type:** Positive
- **Steps:**
  1. With enough records to span pages, note the Sr. No. on page 1, then move to page 2.
- **Expected Result:** Sr. No. continues sequentially across pages without resetting or duplicating.

---

## Test Suite 5: Download PDF

### TC-LS-018: Download PDF generates a file
- **Type:** Positive
- **Steps:**
  1. Select a lift so history is listed.
  2. Click Download PDF.
- **Expected Result:** A PDF file of the selected lift's history is generated and downloaded; the file is not empty.

### TC-LS-019: Downloaded PDF content matches the on-screen data
- **Type:** Positive
- **Steps:**
  1. Download the PDF for a listed lift.
  2. Open the PDF and compare with the table.
- **Expected Result:** The PDF contains the same rows and column headers shown on screen.

### TC-LS-020: Download PDF with no lift selected
- **Type:** Negative
- **Steps:**
  1. Without selecting a lift (empty state), click Download PDF.
- **Expected Result:** The action is prevented, or an empty/with-message file is produced — no error/crash.

---

## Test Suite 6: Mail To

### TC-LS-021: Mail To opens the compose dialog
- **Type:** Positive
- **Steps:**
  1. Select a lift so history is listed.
  2. Click Mail To.
- **Expected Result:** A mail/compose dialog opens for sending the report.

### TC-LS-022: Send report to a valid email
- **Type:** Positive
- **Steps:**
  1. Open the Mail To dialog.
  2. Enter a valid email address and send.
- **Expected Result:** A success confirmation/toast is shown indicating the report was sent.

### TC-LS-023: Mail To validates the email field
- **Type:** Negative
- **Steps:**
  1. Open the Mail To dialog.
  2. Enter an invalid or empty email address and attempt to send.
- **Expected Result:** A validation error is shown and the mail is not sent.

---

## Test Suite 7: Pagination

### TC-LS-024: Change rows per page
- **Type:** Positive
- **Steps:**
  1. With history listed, change the Rows per page selector to 10, 25, 50, then 100.
- **Expected Result:** The table re-chunks the records according to the selected page size (default is 10).

### TC-LS-025: Navigate pages
- **Type:** Positive
- **Steps:**
  1. With multiple pages, click Next, Previous, and a specific page number.
- **Expected Result:** The correct set of records is shown for each navigation action.

### TC-LS-026: Page count and Previous disabled on page 1
- **Type:** Positive
- **Steps:**
  1. Observe the "Page X of Y" indicator and the Previous button on page 1.
- **Expected Result:** "Page X of Y" is accurate and the Previous button is disabled on page 1.

---

## Test Suite 8: UI/UX & Error Handling

### TC-LS-027: Loading state during data fetch
- **Type:** Positive
- **Steps:**
  1. Apply a lift selection and observe the table while data loads.
- **Expected Result:** A loading indicator (spinner/skeleton) is shown until the data renders.

### TC-LS-028: Empty state when a lift has no history
- **Type:** Positive
- **Steps:**
  1. Select a valid lift that has no service history.
- **Expected Result:** A clear "No records found" empty state is displayed.

### TC-LS-029: Mobile responsiveness
- **Type:** Positive
- **Steps:**
  1. Open the report on a small/mobile viewport with history listed.
- **Expected Result:** The table scrolls horizontally and controls remain usable.

### TC-LS-030: API failure / timeout handling
- **Type:** Negative
- **Steps:**
  1. Simulate an API failure/timeout while loading the report.
- **Expected Result:** A friendly error message/toast is shown instead of a crash or blank screen.

---

## Test Suite 9: Integrated Validation

### TC-LS-031: Selection → listing → PDF consistency
- **Type:** Positive
- **Steps:**
  1. Select a Site + Wing/Lift and Apply.
  2. Verify the on-screen history.
  3. Click Download PDF and open the file.
- **Expected Result:** The PDF mirrors the listed rows exactly (same records, dates, statuses, headers).

### TC-LS-032: Lift + Job Number search consistency
- **Type:** Positive
- **Steps:**
  1. Select a lift, then search by a Job Number.
  2. Download PDF of the filtered view.
- **Expected Result:** The filtered listing and the PDF both reflect only the searched Job Number's records.

### TC-LS-033: Reset workflow restores empty state
- **Type:** Positive
- **Steps:**
  1. Apply a lift selection so history is listed.
  2. Click Clear All.
- **Expected Result:** The report returns to the initial empty state and the Active Filters chip is cleared.
