# OTS Quotation Report — Test Plan

## Application Overview

The **OTS Quotation Report** is part of the **One Time Services Reports** module, accessible at
`https://stage.elevatorplus.net/reports/one-time-services/quotation-report`
(sidebar: **One Time Services Reports → Quotation Report**). It tracks the quotations
raised against the different quotation types under the One Time Service module.

Page layout (top to bottom):
- Page heading **"OTS Quotation Report"** with subtitle *"Track and manage one-time service quotations"*.
- An **Active Filters** bar showing the currently applied filters as chips (a Date Range
  chip is applied by default, e.g. `01-06-2026 - 17-06-2026` — the current month) and a
  **Clear All** button.
- A toolbar row with a **Search** box (left) and three buttons (right):
  **Manage Column**, **Export**, **Filter**.
- A data table (ARIA `role="table"` div-grid; column headers are `<button>`s).
- A pagination footer: **"Page X of Y"**, a **Rows** selector (10 / 25 / 50 / 100,
  default **25**), and **Previous page / Next page** buttons.

**Search box:** a live (debounced) search with an animated placeholder that cycles through
column names (e.g. "Search Quotation Type", "Search Note", …), indicating it searches across
multiple text columns. There is no separate Apply for search — results filter as you type.

**Data table — 16 visible columns (in order):**
1. Sr. No. *(mandatory, not sortable)*
2. Download Quotation *(mandatory; renders a "Download PDF" icon per row; not sortable)*
3. Quotation Number
4. Quotation Type
5. Basic Amount
6. Tax Amount
7. Total Taxable Amount
8. City
9. Branch
10. Area
11. Quotation Assigned To
12. Firm Name
13. Site Name
14. Quotation Date
15. Notes *(not sortable)*
16. Status *(rendered as a badge/`h5`, e.g. **Confirm**, **Pending**)*

All columns except **Sr. No.**, **Download Quotation**, and **Notes** expose a sort icon.
Amount columns are right-aligned numbers formatted with thousands separators and two
decimals (e.g. `3,234,234.00`). Empty cells render as `-`.

**Hidden-by-default column:** the **Approval Stage** column exists but is hidden by default
(Manage Column shows 16 Visible / 1 Hidden).

**Filter drawer** (opened via **Filter**; renders as a right-side slide-over with a backdrop):
- **Date Range** — date-range picker (defaults to the current month, e.g. `Jun 1, 2026 - Jun 17, 2026`).
- **Status** — a button group (`otsQuotationStatus`): **All** (default/pressed), **Confirm**, **Pending**.
- **City** — searchable single-select dropdown ("Select city").
- **Quotation Assigned To** — searchable single-select dropdown.
- **Branch** — searchable single-select dropdown ("Select branch").
- **Area** — searchable single-select dropdown ("Select area").
- Footer: **Reset** and **Apply** buttons.

**Manage Column modal** (titled **"Manage Table Columns"** with a **System Default** badge):
- A counts header showing **Visible** and **Hidden** column totals, plus a **Show All** checkbox.
- A **Search columns…** input.
- One row per column, each with: a drag-to-reorder handle, a **hide/show** (eye) toggle,
  the column name, an **alignment** toggle (Left/Right), and a **width** selector (S / M / L / XL).
- **Sr. No.** and **Download Quotation** are **mandatory** (locked — cannot be hidden; width disabled).
- Footer: **Cancel** and **Save Configuration**.

**Export:** the **Export** button downloads the current (filtered/searched) dataset as a file.

> **Note:** Quotation data is created elsewhere (the One Time Service / quotation workflow);
> this report is read-only. Tests should assert against existing seeded data rather than
> creating quotations from this page.

---

## Test Scenarios

### 1. Smoke & Page Load

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 1.1. TC-SM-01: Quotation Report page loads successfully

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/reports/one-time-services/quotation-report`.
   - expect: The page URL is `/reports/one-time-services/quotation-report`.
   - expect: The heading **"OTS Quotation Report"** and subtitle *"Track and manage one-time service quotations"* are visible.
   - expect: The **Search** box, **Manage Column**, **Export**, and **Filter** controls are visible.
   - expect: The data table renders with header columns, or a clear empty state if no records exist.
   - expect: An **Active Filters** bar with a default Date Range chip (current month) and a **Clear All** button is visible.

#### 1.2. TC-SM-02: All 16 columns render in the correct order

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Inspect the table header row.
   - expect: Headers read, in order: Sr. No., Download Quotation, Quotation Number, Quotation Type, Basic Amount, Tax Amount, Total Taxable Amount, City, Branch, Area, Quotation Assigned To, Firm Name, Site Name, Quotation Date, Notes, Status.
   - expect: Each non-empty data row has a **Download PDF** icon in the Download Quotation cell.
   - expect: The Status cell shows a badge (e.g. **Confirm** or **Pending**).

#### 1.3. TC-SM-03: Sr. No. is sequential and amounts are formatted

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Inspect the first data rows.
   - expect: Sr. No. increments sequentially starting at 1.
   - expect: Basic Amount, Tax Amount, and Total Taxable Amount display with thousands separators and 2 decimals (e.g. `12,000.00`).
   - expect: Empty/optional cells render as `-`.

---

### 2. Filtering

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 2.1. TC-FLT-01: Default Date Range filter is applied on load

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Load the report and read the Active Filters bar.
   - expect: A Date Range chip for the current month is shown by default.
   - expect: All visible Quotation Date values fall within the displayed range.

#### 2.2. TC-FLT-02: Filter by Date Range

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click **Filter**, pick a custom start/end date in the Date Range picker, and click **Apply**.
   - expect: Only quotations whose Quotation Date falls inside the selected range are listed.
   - expect: The Active Filters bar reflects the new range.

#### 2.3. TC-FLT-03: Filter by Status (Confirm / Pending)

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open **Filter**, select **Confirm** in the Status group, and click **Apply**.
   - expect: Every visible row's Status badge reads **Confirm**.
2. Reopen **Filter**, select **Pending**, and **Apply**.
   - expect: Every visible row's Status badge reads **Pending**.
3. Reopen **Filter**, select **All**, and **Apply**.
   - expect: Rows of all statuses are shown again.

#### 2.4. TC-FLT-04: Filter by City

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open **Filter**, choose a City from the searchable dropdown, and **Apply**.
   - expect: Only quotations belonging to the selected City are listed (other cities excluded).

#### 2.5. TC-FLT-05: Filter by Quotation Assigned To

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open **Filter**, choose an assignee in the **Quotation Assigned To** dropdown, and **Apply**.
   - expect: Only quotations assigned to that person are listed.

#### 2.6. TC-FLT-06: Filter by Branch

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open **Filter**, choose a Branch, and **Apply**.
   - expect: Only quotations of the selected Branch are listed.

#### 2.7. TC-FLT-07: Filter by Area

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open **Filter**, choose an Area, and **Apply**.
   - expect: Only quotations of the selected Area are listed.

#### 2.8. TC-FLT-08: Combine multiple filters

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Apply Date Range + City + Status together and **Apply**.
   - expect: The resulting list strictly satisfies all three criteria simultaneously.

#### 2.9. TC-FLT-09: Reset inside the Filter drawer

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Set several filters in the drawer, then click **Reset** (do not Apply yet).
   - expect: All drawer controls return to their defaults (Status → All, dropdowns cleared, Date Range to default).

#### 2.10. TC-FLT-10: Clear All resets all active filters

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Apply a non-default combination, then click **Clear All** in the Active Filters bar.
   - expect: All filter chips are removed (or reset to default Date Range) and the full dataset returns.

#### 2.11. TC-FLT-11: Filter combination with zero matches

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Apply a filter combination known to match no records and **Apply**.
   - expect: A clear "No records found" empty state is shown; no rows render.

---

### 3. Search

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 3.1. TC-SRC-01: Search by Quotation Number

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Type an existing Quotation Number (e.g. `26-27021`) in the Search box.
   - expect: The matching quotation row is shown; non-matching rows are hidden.

#### 3.2. TC-SRC-02: Search by Quotation Type

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Type a quotation type value (e.g. `Inspection`) in the Search box.
   - expect: Only rows whose Quotation Type matches the term remain visible.

#### 3.3. TC-SRC-03: Search with no results

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Type a value known not to exist (e.g. `ZZZNONEXISTENT`).
   - expect: The grid shows a clear empty state and no data rows.

#### 3.4. TC-SRC-04: Clearing the search restores the list

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Enter a search term, then clear the Search box.
   - expect: The previously hidden rows reappear (subject to the active filters).

#### 3.5. TC-SRC-05: Search handles special characters/spaces gracefully

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Enter special characters and leading/trailing spaces in the Search box.
   - expect: The UI does not crash; results filter (or empty-state) without error.

---

### 4. Data Table — Sorting & Pagination

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 4.1. TC-TBL-01: Sort by a text column (Quotation Number)

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click the **Quotation Number** header once, then again.
   - expect: First click sorts ascending; second click sorts descending; rows reorder accordingly.

#### 4.2. TC-TBL-02: Sort by a numeric column (Total Taxable Amount)

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click the **Total Taxable Amount** header.
   - expect: Rows reorder numerically (not lexicographically) by amount.

#### 4.3. TC-TBL-03: Sort by Quotation Date

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click the **Quotation Date** header to toggle ascending/descending.
   - expect: Rows reorder chronologically.

#### 4.4. TC-TBL-04: Non-sortable columns have no sort affordance

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Inspect the **Sr. No.**, **Download Quotation**, and **Notes** headers.
   - expect: These headers do not display a sort icon and clicking them does not reorder data.

#### 4.5. TC-PAG-01: Change rows per page

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Change the **Rows** selector to 10, then 50, then 100.
   - expect: The page shows at most the selected number of rows; the page count updates.

#### 4.6. TC-PAG-02: Navigate between pages

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. With enough data to paginate, click **Next page**, then **Previous page**.
   - expect: The correct record set and "Page X of Y" indicator update for each navigation; Sr. No. continues sequentially across pages.

#### 4.7. TC-PAG-03: Pagination disabled when all rows fit on one page

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Ensure the record count fits within the selected rows-per-page.
   - expect: **Previous page** and **Next page** are disabled and only page **1** is shown.

---

### 5. Manage Column

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 5.1. TC-MC-01: Manage Column modal opens with correct structure

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click **Manage Column**.
   - expect: A modal titled **"Manage Table Columns"** with a **System Default** badge opens.
   - expect: It shows Visible/Hidden counts (16 Visible / 1 Hidden by default), a **Show All** checkbox, and a **Search columns…** input.
   - expect: Each column row has a drag handle, a hide/show (eye) toggle, an alignment toggle, and a width selector (S/M/L/XL).
   - expect: **Cancel** and **Save Configuration** buttons are present.

#### 5.2. TC-MC-02: Mandatory columns cannot be hidden

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. In the modal, locate **Sr. No.** and **Download Quotation**.
   - expect: Both are marked mandatory (lock indicator); they have no hide toggle and their width selector is disabled.

#### 5.3. TC-MC-03: Hide a column and Save Configuration

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Toggle off (hide) a non-mandatory column (e.g. **Notes**) and click **Save Configuration**.
   - expect: The modal closes and the **Notes** column is removed from the grid.

#### 5.4. TC-MC-04: Show the hidden Approval Stage column

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Open Manage Column, toggle **Approval Stage** to visible, and **Save Configuration**.
   - expect: The **Approval Stage** column now appears in the grid.

#### 5.5. TC-MC-05: Cancel discards changes

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Hide a column in the modal, then click **Cancel**.
   - expect: The grid is unchanged (the column remains visible).

#### 5.6. TC-MC-06: Search columns inside the modal

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Type a column name (e.g. `Tax`) in the **Search columns…** input.
   - expect: Only matching column rows (e.g. Tax Amount, Total Taxable Amount) remain listed.

---

### 6. Download & Export

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 6.1. TC-DL-01: Download a quotation PDF from a row

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Click the **Download PDF** icon in the Download Quotation cell of a row.
   - expect: A PDF download for that quotation is triggered (a download event fires / a file is saved).

#### 6.2. TC-EXP-01: Export the current dataset

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. With no extra filters, click **Export**.
   - expect: A file download is triggered containing the current records (non-empty).

#### 6.3. TC-EXP-02: Export reflects active filters/search

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Apply a City + Status filter (or a search term), then click **Export**.
   - expect: The exported file contains only the rows currently shown on screen.

---

### 7. Navigation & Access

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 7.1. TC-NAV-01: Reachable from the sidebar

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. Expand **One Time Services Reports** in the sidebar and click **Quotation Report**.
   - expect: The browser navigates to `/reports/one-time-services/quotation-report` and the **OTS Quotation Report** heading is visible.

#### 7.2. TC-NAV-02: Direct URL navigation when authenticated

**File:** `tests/one-time-service/quotation-report.spec.ts`

**Steps:**
1. While authenticated, navigate directly to the report URL.
   - expect: The report loads with its heading, toolbar, and grid.
</content>
</invoke>
