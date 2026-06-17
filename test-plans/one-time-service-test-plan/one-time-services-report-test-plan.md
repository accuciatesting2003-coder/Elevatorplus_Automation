# One Time Services Report — Test Plan

## Application Overview

The **One Time Services Report** is part of the **One Time Services Reports** module,
accessible at
`https://stage.elevatorplus.net/reports/one-time-services/one-time-services-report`
(sidebar: **One Time Services Reports → One-time services Report**). It tracks one-time
service enquiries and their progress status.

Page layout (top to bottom):
- Page heading **"One Time Services Report"** with subtitle *"Track one time service enquiries and their status"*.
- An **Active Filters** bar showing applied filters as chips (a Date Range chip is applied by
  default, e.g. `01-06-2026 - 17-06-2026` — the current month) and a **Clear All** button.
- A row of **4 status summary cards** (each a count + icon):
  1. **Pending**
  2. **Quotation Raised**
  3. **Cancelled**
  4. **Closed by Others**
- A toolbar row with a **Search** box (left) and three buttons (right):
  **Manage Column**, **Export**, **Filters**.
- A data table (ARIA `role="table"` div-grid; headers are `<button>`s).
- A pagination footer with **Previous page / Next page** + numbered pages and a **Rows**
  selector (10 / 25 / 50 / 100, default **25**).

**Search box:** a live (debounced) search with an animated placeholder that cycles through
column names (e.g. "Search One Time Service No.", "Search Contact Person Name", …),
indicating it searches across multiple text columns.

**Data table — 12 columns (in order):**
1. Sr. No. *(not sortable)*
2. View *(renders a "For More Details" icon per row; not sortable)*
3. Enquiry Date
4. One Time Service Number
5. Firm Name
6. Site Name
7. Contact Person Name
8. City
9. Area
10. Branch
11. Total Amount
12. Status *(badge/`h5`: **Pending**, **Quotation Raised**, **Cancelled**, **Closed by Others**)*

All columns except **Sr. No.** and **View** expose a sort icon. **Total Amount** is a
right-aligned number with thousands separators and two decimals. Empty cells render as `-`.

> **Note:** the spec sheet listed 11 columns; the live page additionally includes an
> **Enquiry Date** column (between View and One Time Service Number). This plan covers the
> live 12-column layout.

**View action:** clicking the **"For More Details"** icon in the View column opens the
record's detail view (navigates away from the listing to a detail page). Consistent with the
other report modules, the detail navigation may be driven by router state.

**Filters drawer** (opened via **Filters**; right-side slide-over with a backdrop):
- **Date Range** — date-range picker (defaults to the current month).
- **Status** — button group (`otsStatus`): **All** (default/pressed), **Pending**,
  **Quotation Raised**, **Cancelled**, **Closed by Others**.
- **City** — searchable single-select dropdown ("Select city").
- **Branch** — searchable single-select dropdown ("Select branch").
- **Area** — searchable single-select dropdown ("Select area").
- Footer: **Reset** and **Apply** buttons.
  *(Unlike the OTS Quotation Report, there is no "Quotation Assigned To" filter here.)*

**Manage Column modal:** the same **"Manage Table Columns"** modal as the other OTS reports
(per-column hide/show eye toggle, drag-to-reorder, alignment, width S/M/L/XL, mandatory
locked columns, **Show All**, **Search columns…**, **Cancel** / **Save Configuration**).

**Export:** the **Export** button downloads the current (filtered/searched) dataset.

> **Note:** one-time-service enquiry data is created in the One Time Service workflow; this
> report is read-only. Assert against existing seeded data rather than creating records here.

---

## Test Scenarios

### 1. Smoke & Page Load

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 1.1. TC-SM-01: Report page loads successfully

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/reports/one-time-services/one-time-services-report`.
   - expect: The URL is `/reports/one-time-services/one-time-services-report`.
   - expect: The heading **"One Time Services Report"** and subtitle *"Track one time service enquiries and their status"* are visible.
   - expect: The four status cards, the Search box, **Manage Column**, **Export**, and **Filters** controls are visible.
   - expect: The data table renders rows, or a clear empty state if there are none.

#### 1.2. TC-SM-02: Status summary cards render

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Inspect the card row.
   - expect: Exactly four cards are present, labelled **Pending**, **Quotation Raised**, **Cancelled**, **Closed by Others**.
   - expect: Each card shows a numeric count (zero is shown as `0`).

#### 1.3. TC-SM-03: All 12 columns render in the correct order

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Inspect the table header row.
   - expect: Headers read, in order: Sr. No., View, Enquiry Date, One Time Service Number, Firm Name, Site Name, Contact Person Name, City, Area, Branch, Total Amount, Status.
   - expect: Each row's View cell shows a **For More Details** icon.
   - expect: The Status cell shows a badge such as **Pending** or **Quotation Raised**.

#### 1.4. TC-SM-04: Sr. No. sequential and Total Amount formatted

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Inspect the first rows.
   - expect: Sr. No. increments from 1.
   - expect: Total Amount renders with thousands separators and 2 decimals (e.g. `12,000.00`); zero shows as `0.00`.
   - expect: Empty optional cells render as `-`.

---

### 2. Status Cards Consistency

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 2.1. TC-CARD-01: Card counts reconcile with the grid

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Set Rows per page to 100 so all records for the current filter are on one page.
2. Count grid rows whose Status equals each card label.
   - expect: For each status, the card count equals the number of rows with that status (within the active Date Range filter).

#### 2.2. TC-CARD-02: Card counts update when the Date Range filter changes

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Note the card counts, then apply a different Date Range via **Filters → Apply**.
   - expect: The card counts recompute to reflect the new filtered dataset.

---

### 3. Filtering

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 3.1. TC-FLT-01: Default Date Range applied on load

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Load the report and read the Active Filters bar.
   - expect: A current-month Date Range chip is shown by default and all visible Enquiry Date values fall within it.

#### 3.2. TC-FLT-02: Filter by Date Range

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open **Filters**, set a custom Date Range, and **Apply**.
   - expect: Only records whose Enquiry Date is within the selected range are listed; the Active Filters chip updates.

#### 3.3. TC-FLT-03: Filter by each Status value

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open **Filters**, select **Pending**, and **Apply**.
   - expect: Every visible row's Status is **Pending**.
2. Repeat for **Quotation Raised**, **Cancelled**, and **Closed by Others**.
   - expect: Each filter shows only rows with the matching status (or an empty state if none exist, e.g. Cancelled = 0).
3. Select **All** and **Apply**.
   - expect: Rows of all statuses are listed again.

#### 3.4. TC-FLT-04: Filter by City

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open **Filters**, choose a City, and **Apply**.
   - expect: Only records of the selected City are listed.

#### 3.5. TC-FLT-05: Filter by Branch

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open **Filters**, choose a Branch, and **Apply**.
   - expect: Only records of the selected Branch are listed.

#### 3.6. TC-FLT-06: Filter by Area

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open **Filters**, choose an Area, and **Apply**.
   - expect: Only records of the selected Area are listed.

#### 3.7. TC-FLT-07: Combine multiple filters

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Apply Status + City + Date Range together and **Apply**.
   - expect: The list strictly satisfies all selected criteria simultaneously.

#### 3.8. TC-FLT-08: Reset inside the Filters drawer

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Set several filters, then click **Reset** in the drawer.
   - expect: Drawer controls return to defaults (Status → All, dropdowns cleared, Date Range default).

#### 3.9. TC-FLT-09: Clear All resets active filters

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Apply a non-default combination, then click **Clear All** in the Active Filters bar.
   - expect: Filters reset and the full dataset returns.

#### 3.10. TC-FLT-10: Filter combination with zero matches

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Apply a combination known to produce no results.
   - expect: A clear empty state is shown and all status cards read `0`.

---

### 4. Search

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 4.1. TC-SRC-01: Search by One Time Service Number

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Type an existing service number (e.g. `26-27039`) in the Search box.
   - expect: Only the matching record remains visible.

#### 4.2. TC-SRC-02: Search by Contact Person Name

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Type a contact person name (e.g. `Rutuja`) in the Search box.
   - expect: Only rows with a matching Contact Person Name remain visible.

#### 4.3. TC-SRC-03: Search by Firm/Site Name

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Type a firm/site value (e.g. `Testing Site`).
   - expect: Matching rows remain; others are hidden.

#### 4.4. TC-SRC-04: Search with no results

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Type a value known not to exist.
   - expect: A clear empty state is shown and no data rows render.

#### 4.5. TC-SRC-05: Clearing the search restores the list

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Enter a search term, then clear the Search box.
   - expect: Hidden rows reappear (subject to active filters).

---

### 5. View / Row Detail

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 5.1. TC-VIEW-01: View icon opens the record detail

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Click the **For More Details** icon in the View cell of the first row.
   - expect: The app navigates away from the listing to the record's detail view (URL changes / a detail layout renders).

#### 5.2. TC-VIEW-02: Detail corresponds to the selected row

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Note the One Time Service Number of a row, then click its View icon.
   - expect: The detail view shows the same One Time Service Number / firm / site as the selected row.

#### 5.3. TC-VIEW-03: Returning to the report preserves the listing

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Open a record's detail, then navigate back to the report.
   - expect: The listing renders again with its table and controls intact.

---

### 6. Data Table — Sorting & Pagination

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 6.1. TC-TBL-01: Sort by One Time Service Number

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Click the **One Time Service Number** header once, then again.
   - expect: Ascending then descending sort; rows reorder.

#### 6.2. TC-TBL-02: Sort by Enquiry Date

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Click the **Enquiry Date** header to toggle sort.
   - expect: Rows reorder chronologically.

#### 6.3. TC-TBL-03: Sort by Total Amount (numeric)

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Click the **Total Amount** header.
   - expect: Rows reorder by numeric value (not lexicographically).

#### 6.4. TC-TBL-04: Non-sortable columns have no sort affordance

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Inspect the **Sr. No.** and **View** headers.
   - expect: No sort icon; clicking does not reorder data.

#### 6.5. TC-PAG-01: Change rows per page

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Change the **Rows** selector to 10, 50, then 100.
   - expect: At most the selected number of rows display per page; page count updates.

#### 6.6. TC-PAG-02: Navigate between pages

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. With enough data, click **Next page** then **Previous page**.
   - expect: The correct record set displays for each navigation; Sr. No. stays sequential across pages.

#### 6.7. TC-PAG-03: Pagination disabled when all rows fit one page

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Ensure the record count fits within the selected rows-per-page.
   - expect: **Previous page** and **Next page** are disabled; only page **1** is shown.

---

### 7. Manage Column

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 7.1. TC-MC-01: Manage Column modal opens with correct structure

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Click **Manage Column**.
   - expect: The **"Manage Table Columns"** modal opens with Visible/Hidden counts, **Show All**, a **Search columns…** input, and per-column rows (hide/show, drag, alignment, width).
   - expect: **Cancel** and **Save Configuration** buttons are present.

#### 7.2. TC-MC-02: Hide a column and Save Configuration

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Hide a non-mandatory column (e.g. **Area**) and click **Save Configuration**.
   - expect: The column is removed from the grid.

#### 7.3. TC-MC-03: Cancel discards changes

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Hide a column, then click **Cancel**.
   - expect: The grid is unchanged.

---

### 8. Export

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 8.1. TC-EXP-01: Export the current dataset

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. With default filters, click **Export**.
   - expect: A non-empty file download is triggered.

#### 8.2. TC-EXP-02: Export reflects active filters/search

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Apply a Status + City filter (or a search term), then **Export**.
   - expect: The exported file contains only the rows currently shown.

---

### 9. Navigation & Access

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 9.1. TC-NAV-01: Reachable from the sidebar

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. Expand **One Time Services Reports** and click **One-time services Report**.
   - expect: Navigates to `/reports/one-time-services/one-time-services-report` and the heading is visible.

#### 9.2. TC-NAV-02: Direct URL navigation when authenticated

**File:** `tests/one-time-service/one-time-services-report.spec.ts`

**Steps:**
1. While authenticated, navigate directly to the report URL.
   - expect: The report loads with cards, toolbar, and grid.
</content>
