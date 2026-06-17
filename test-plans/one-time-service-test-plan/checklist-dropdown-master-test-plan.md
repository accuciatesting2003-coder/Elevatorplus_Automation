# Checklist Dropdown Master — Test Plan

## Application Overview

The **Checklist Dropdown Master** is part of the **Service Masters** module, accessible at
`https://stage.elevatorplus.net/master/checklist-dropdown-master`
(sidebar: **Service Masters → Checklist Dropdown Master**). It manages the reusable dropdown
label options used by service checklists, scoped by a service **Type**.

The navbar/page heading reads **"Checklist Dropdown Master"**. The page has two sections:
(1) an **"Add CheckList Dropdown"** form at the top, and (2) a data table listing existing
records below.

**Add CheckList Dropdown form** — heading **"Add CheckList Dropdown"** with an **info icon**
button beside it. Fields:
- **Type** — dropdown (**mandatory**). Options: **Select type** (default placeholder) and
  **One Time Service**. Helper text: *"Select the service type for this dropdown."*
- **DropDown Label \*** — text input (**mandatory**). Helper text: *"Enter the label for this
  dropdown option."*
- Action buttons: **Clear** and **Submit**.

**Edit / Update mode** — clicking the **Edit** icon on a table row switches the form to
**"Update CheckList Dropdown"** with the fields pre-filled, plus an additional field:
- **Status \*** — dropdown. Options: **Select Status**, **Active**, **Inactive**. Helper
  text: *"Select active or inactive."*

In Update mode the **Submit** button is replaced by **Update**; **Clear** remains and resets
the form back to **Add CheckList Dropdown** mode.

**Table toolbar:**
- **Show:** rows-per-page dropdown — options 10 / 25 / 50 / 100, default **25**.
- **Status:** filter dropdown — options **All**, **Active**, **Inactive**, default **Active**.
- There is **no Search box**, **no Import** button, and **no Export** button on this master.

**Data table — 5 columns:**
1. Sr. No. *(not sortable)*
2. Action *(Edit icon only — no Delete; not sortable)*
3. Service Type *(e.g. "One Time Service")*
4. DropDown Label
5. Status *(badge/`h5`: **Active** / **Inactive**)*

**Service Type**, **DropDown Label**, and **Status** headers expose a sort icon.

**Pagination footer:** **Previous page / Next page** + numbered pages.

> The form mirrors the conventions of other ElevatorPlus masters (e.g. Type of Enquiry):
> a top Add form that toggles into an inline Update form with an added Status dropdown,
> a Status listing filter defaulting to Active, success/error toasts on submit, and
> duplicate prevention.

---

## Test Scenarios

### 1. Smoke & Layout

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 1.1. TC-SM-01: Page loads successfully

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Log in and navigate to `https://stage.elevatorplus.net/master/checklist-dropdown-master`.
   - expect: The URL is `/master/checklist-dropdown-master`.
   - expect: The navbar heading reads **"Checklist Dropdown Master"**.
   - expect: The form card heading reads **"Add CheckList Dropdown"**.
   - expect: The **Type** dropdown (default "Select type") and the empty **DropDown Label \*** input are present.
   - expect: **Clear** and **Submit** buttons are visible.
   - expect: The data table loads with **Active** records by default.

#### 1.2. TC-SM-02: Verify form fields, helper text, toolbar, and columns

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Inspect the form section.
   - expect: An info icon button is present next to the **Add CheckList Dropdown** heading.
   - expect: The **Type** dropdown lists exactly: **Select type**, **One Time Service**.
   - expect: Helper text *"Select the service type for this dropdown."* appears under Type.
   - expect: Helper text *"Enter the label for this dropdown option."* appears under DropDown Label.
2. Inspect the table toolbar.
   - expect: A **Show:** dropdown (10/25/50/100, default 25) is present.
   - expect: A **Status:** dropdown (All/Active/Inactive, default Active) is present.
   - expect: There is **no** Search box, **no** Import button, and **no** Export button.
3. Inspect the table header and a sample row.
   - expect: Columns are: Sr. No., Action, Service Type, DropDown Label, Status.
   - expect: The Action cell contains only an **Edit** icon (no Delete).
   - expect: Service Type, DropDown Label, and Status headers have sort icons.
   - expect: The Status cell shows an **Active** or **Inactive** badge.

#### 1.3. TC-SM-03: Info panel/tooltip opens

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Click the info icon button next to the **Add CheckList Dropdown** heading.
   - expect: An info tooltip/panel with guidance about the Type and DropDown Label fields is shown (or toggles open); the form and table remain accessible.

---

### 2. Add — Happy Path

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 2.1. TC-ADD-01: Create a new dropdown label

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Select **One Time Service** in the **Type** dropdown, type a unique value (e.g. `Lift Inspection OK`) in **DropDown Label \***, and click **Submit**.
   - expect: A success toast appears confirming creation.
   - expect: The form resets — Type back to "Select type" and DropDown Label cleared.
   - expect: The new record appears in the table with Service Type **One Time Service**, the entered label, and Status **Active**.

#### 2.2. TC-ADD-02: Create a label with special characters

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Select **One Time Service**, type `Door Sensor & Alignment (v2)` in DropDown Label, and **Submit**.
   - expect: A success toast appears and the record appears with the exact label.

#### 2.3. TC-ADD-03: Create multiple records sequentially

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Add `Checklist A`, **Submit**, then add `Checklist B`, **Submit**.
   - expect: Each submission shows a success toast and resets the form.
   - expect: Both `Checklist A` and `Checklist B` appear in the table with Status **Active**.

---

### 3. Mandatory Field Validation

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 3.1. TC-VAL-01: Submit with both fields empty

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Without selecting a Type or entering a label, click **Submit**.
   - expect: Inline validation errors appear (Type required and/or DropDown Label required).
   - expect: No record is created and no success toast appears.

#### 3.2. TC-VAL-02: Submit with Type selected but DropDown Label empty

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Select **One Time Service**, leave DropDown Label empty, and click **Submit**.
   - expect: An inline validation error appears under **DropDown Label \***.
   - expect: No record is created.

#### 3.3. TC-VAL-03: Submit with DropDown Label filled but Type = "Select type"

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Leave Type on the default **Select type**, type a label, and click **Submit**.
   - expect: An inline validation error appears for the **Type** field.
   - expect: No record is created.

#### 3.4. TC-VAL-04: Whitespace-only DropDown Label is rejected

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Select **One Time Service**, type only spaces in DropDown Label, and **Submit**.
   - expect: A validation error appears (or submission is blocked); no record is created.

#### 3.5. TC-VAL-05: Validation error clears after valid input

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Trigger the empty-form validation errors, then select a Type and type a valid label.
   - expect: The corresponding inline validation errors clear as valid input is provided.
2. Click **Submit**.
   - expect: A success toast appears and the record is created.

---

### 4. Duplicate Prevention

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 4.1. TC-DUP-01: Duplicate label for the same Type is rejected

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Note an existing Active record's label, select the same **Type** (One Time Service), type that exact label, and **Submit**.
   - expect: An error toast (e.g. "Something went wrong.") appears.
   - expect: No duplicate record is added.

#### 4.2. TC-DUP-02: Case-sensitivity behavior for duplicates

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. For an existing label (e.g. `TEST`), submit a differently-cased version (e.g. `test`) under the same Type.
   - expect: If case-insensitive, an error toast appears and no duplicate is created.
   
#### 4.3. TC-DUP-03: Duplicate matching an Inactive record

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Using the **Status:** filter, note an Inactive record's label. Switch back, and submit that label under the same Type.
   - expect: An error toast appears; no new record is created (the system treats it as a duplicate).

---

### 5. Clear Button Behavior

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 5.1. TC-CLR-01: Clear resets the Add form

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Select a Type, type a label, then click **Clear**.
   - expect: Type resets to **Select type** and DropDown Label is emptied.
   - expect: The form heading still reads **Add CheckList Dropdown**; no record is created.

#### 5.2. TC-CLR-02: Clear in Update mode reverts to Add mode

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Click **Edit** on a row, then click **Clear** while in Update mode.
   - expect: The heading reverts to **Add CheckList Dropdown**.
   - expect: Type resets to **Select type**, DropDown Label is cleared, and the **Status \*** dropdown disappears.
   - expect: The **Update** button reverts to **Submit**.

---

### 6. Edit & Update

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 6.1. TC-EDT-01: Edit opens Update mode with pre-filled fields and a Status dropdown

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Click the **Edit** icon on a table row.
   - expect: The form heading changes to **"Update CheckList Dropdown"**.
   - expect: **Type** is pre-selected (e.g. One Time Service) and **DropDown Label \*** is pre-filled with the record's label.
   - expect: A **Status \*** dropdown appears with the current status selected and helper text *"Select active or inactive."*
   - expect: The **Submit** button is replaced by **Update**; **Clear** remains.

#### 6.2. TC-EDT-02: Update the DropDown Label

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Edit a record, change the DropDown Label to a new unique value, and click **Update**.
   - expect: A success toast appears and the form resets to Add mode.
   - expect: The table row reflects the updated label.

#### 6.3. TC-EDT-03: Update with an empty DropDown Label is blocked

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Edit a record, clear the DropDown Label, and click **Update**.
   - expect: An inline validation error appears; no update is submitted.

#### 6.4. TC-EDT-04: Update label to match another existing record is rejected

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Edit a record and change its label to that of another existing record (same Type), then **Update**.
   - expect: The update is **silently rejected** — unlike create (which shows an "already exists" toast), the update produces no toast, the form stays in **Update CheckList Dropdown** mode, and the original record remains unchanged. *(Observed app behaviour.)*

#### 6.5. TC-EDT-05: Change Status Active → Inactive

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Edit an Active record, set **Status \*** to **Inactive**, and click **Update**.
   - expect: A success toast appears and the form resets.
   - expect: With the **Status:** filter on **Active**, the record no longer appears.
   - expect: With the filter on **Inactive** or **All**, the record appears.

#### 6.6. TC-EDT-06: Change Status Inactive → Active (re-activate)

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Set the **Status:** filter to **Inactive**, click **Edit** on an Inactive record, set **Status \*** to **Active**, and **Update**.
   - expect: A success toast appears.
   - expect: The record reappears under the **Active** filter and is gone from the **Inactive** view.

---

### 7. Status Listing Filter

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 7.1. TC-FLT-01: Default filter shows only Active records

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Load the page and read the **Status:** filter.
   - expect: It defaults to **Active** and the table shows only Active records.

#### 7.2. TC-FLT-02: Filter to Inactive

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Change **Status:** to **Inactive**.
   - expect: Only Inactive records are shown; if none exist, an empty/no-records state appears.

#### 7.3. TC-FLT-03: Filter to All

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Change **Status:** to **All**.
   - expect: Both Active and Inactive records are listed.

---

### 8. Rows Per Page, Sorting & Pagination

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 8.1. TC-PAG-01: Default rows-per-page is 25

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Inspect the **Show:** dropdown.
   - expect: **25** is selected by default.

#### 8.2. TC-PAG-02: Change rows-per-page and paginate

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Set **Show:** to **10** (assuming more than 10 records exist), then click **Next page** and **Previous page**.
   - expect: At most 10 rows show per page; navigation moves between pages correctly.
2. With all records fitting one page, verify the pager.
   - expect: **Previous page** and **Next page** are disabled and only page **1** is shown.

#### 8.3. TC-SRT-01: Sort by DropDown Label

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Click the **DropDown Label** header once, then again.
   - expect: Ascending then descending alphabetical sort; rows reorder.

#### 8.4. TC-SRT-02: Sort by Service Type and Status

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. With **Status:** set to **All**, click the **Service Type** header, then the **Status** header.
   - expect: Each click sorts by that column and the sort icon reflects the direction.

---

### 9. Navigation & Access

**Seed:** `tests/fixtures/auth-fixture.ts`

#### 9.1. TC-NAV-01: Reachable from the Service Masters sidebar

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. Expand **Service Masters** in the sidebar and click **Checklist Dropdown Master**.
   - expect: Navigates to `/master/checklist-dropdown-master` and the **Add CheckList Dropdown** form and table render.

#### 9.2. TC-NAV-02: Direct URL navigation when authenticated

**File:** `tests/Service-master/checklist-dropdown-master.spec.ts`

**Steps:**
1. While authenticated, navigate directly to the master URL.
   - expect: The page loads with its form heading and data table.
</content>
