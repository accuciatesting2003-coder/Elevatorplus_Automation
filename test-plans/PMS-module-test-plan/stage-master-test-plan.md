# Stage Master (Create Stages) Test Plan

## Application Overview

The Stage Master page is part of the ElevatorPlus **Installation (PMS)** module, accessible at `/master/stage-master` (sidebar: Installation (PMS) → Create Stages). It allows admin users to create and manage stages that are linked to phases from Phase Master. Stages are the second level of the PMS hierarchy: Phase → Stage → Task.

**Dependency:** Stage Master depends on Phase Master. The Phase Name dropdown loads only **Active** phases from Phase Master. When a phase is selected, its associated metadata (Is Allow For All Lifts, Lift Type) is inherited from the phase and displayed in the table.

The page has two sections:

**(1) Add Stage form** — fields:
- **Phase Name \*** (React Select dropdown, helper: "Select the phase name") — mandatory; lists all Active phases from Phase Master
- **Stage Name \*** (text input, helper: "Enter stage name") — mandatory
- **Priority \*** (number spinbutton, helper: "Enter priority") — mandatory

Form buttons: **Clear** and **Submit** (add mode); **Clear** and **Update** (edit mode).

**(2) Data table** — lists all stage records with columns: Sr. No., Action (Edit icon), Phase, Stage Name, Is Allow For All Lifts (Yes/No badge — inherited from the linked phase), Lift Type (inherited from the linked phase), Priority, Status (Active/Inactive badge). The table toolbar includes a **Show** selector (10/25/50/100, default 25), a **Status** filter (All/Active/Inactive, default Active), and a **Search Stage Name** input.

Clicking the Edit icon switches the form to "Update Stage" mode, pre-fills all fields, exposes a Status dropdown (Active/Inactive), and changes the action button to "Update".

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Stage Master page loads successfully

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Log in and navigate to `https://stage.elevatorplus.net/master/stage-master`
     - expect: Page URL is `https://stage.elevatorplus.net/master/stage-master`
     - expect: Page title is 'ElevatorPlus'
     - expect: Navbar heading reads 'Stage Master'
     - expect: Form heading 'Add Stage' is visible
     - expect: Phase Name * React Select is present and empty
     - expect: Stage Name * text input is present and empty, helper text 'Enter stage name' is visible
     - expect: Priority * spinbutton is present and empty, helper text 'Enter priority' is visible
     - expect: 'Clear' and 'Submit' buttons are visible
     - expect: Data table is present with columns: Sr. No., Action, Phase, Stage Name, Is Allow For All Lifts, Lift Type, Priority, Status

#### 1.2. TC-SM-02: Verify table toolbar elements

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`
  2. Inspect the data table toolbar
     - expect: Show dropdown is present with options 10, 25, 50, 100 (default 25)
     - expect: Status filter is present with options All, Active, Inactive (default Active)
     - expect: Search Stage Name text input is present
  3. Inspect table column headers
     - expect: Columns are: Sr. No., Action, Phase, Stage Name, Is Allow For All Lifts, Lift Type, Priority, Status
     - expect: Phase, Stage Name, Is Allow For All Lifts, Lift Type, Priority, and Status column headers have sort icons

#### 1.3. TC-SM-03: Stage Master is accessible via sidebar navigation

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Log in and click 'Installation (PMS)' in the sidebar
     - expect: Submenu expands showing Phase Master, Create Stages, Create Tasks, PMS Data Import, PMS Checklist
  2. Click 'Create Stages'
     - expect: Navigates to `/master/stage-master`
     - expect: 'Add Stage' form is visible

---

### 2. Phase Dependency — Phase Name Dropdown

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-DEP-01: Phase Name dropdown loads all Active phases from Phase Master

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and click the Phase Name * dropdown
     - expect: Dropdown opens and lists phase names
     - expect: All listed phases are Active phases from Phase Master
     - expect: Inactive phases from Phase Master do NOT appear in the dropdown

#### 2.2. TC-DEP-02: Selecting a phase pre-fills and displays phase metadata in the table

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`, select a phase with 'Is Allow For All Lifts = Yes' from the dropdown (e.g. 'Phase 1')
     - expect: Phase Name is selected
  2. Fill Stage Name 'Test Stage Dep' and Priority '5', click 'Submit'
     - expect: Success toast appears
     - expect: New record in table shows Phase = 'Phase 1', Is Allow For All Lifts = 'Yes', Lift Type = 'All'

#### 2.3. TC-DEP-03: Selecting a phase with "Is Allow For All Lifts = No" shows specific lift type in table

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`, select a phase with 'Is Allow For All Lifts = No' (e.g. 'planning')
  2. Fill Stage Name 'Test Stage Specific Lift', Priority '9', click 'Submit'
     - expect: Success toast appears
     - expect: New record in table shows Is Allow For All Lifts = 'No' and Lift Type = the specific lift type of that phase (e.g. 'HIGH SPEED LIFT')

#### 2.4. TC-DEP-04: A phase that becomes Inactive is no longer listed in the dropdown

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. In Phase Master, set a phase to 'Inactive'
  2. Navigate to `/master/stage-master` and open the Phase Name dropdown
     - expect: The now-Inactive phase does NOT appear in the Phase Name dropdown

---

### 3. Add Stage — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-ADD-01: Successfully create a stage under an existing active phase

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`
  2. Select an active phase from Phase Name dropdown (e.g. 'Phase 1')
  3. Enter Stage Name 'Foundation Work'
  4. Enter Priority '1'
  5. Click 'Submit'
     - expect: Success toast appears (e.g. 'Stage created successfully!' or similar)
     - expect: Form fields are cleared after submission
     - expect: Form heading remains 'Add Stage'
     - expect: New record appears in table with Phase = 'Phase 1', Stage Name = 'Foundation Work', Priority = '1', Status = 'Active'

#### 3.2. TC-ADD-02: Create multiple stages under the same phase with different priorities

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`, select phase 'Civil Work', enter Stage Name 'Foundation', Priority '1', click 'Submit'
     - expect: Success toast appears; record in table with Phase = 'Civil Work', Stage Name = 'Foundation', Priority = '1'
  2. Select same phase 'Civil Work', enter Stage Name 'Shaft Construction', Priority '2', click 'Submit'
     - expect: Success toast appears; second record in table with Phase = 'Civil Work', Stage Name = 'Shaft Construction', Priority = '2'

#### 3.3. TC-ADD-03: Create stages under different phases with the same priority value

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Create Stage Name 'Stage A', Priority '1' under 'Phase 1'; click 'Submit'
     - expect: Success
  2. Create Stage Name 'Stage B', Priority '1' under 'Phase 2'; click 'Submit'
     - expect: duplicate error message should be dispalyed 

---

### 4. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-VAL-01: Submit with all fields empty shows validation errors

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and click 'Submit' without filling any fields
     - expect: Validation error appears for Phase Name
     - expect: Validation error appears for Stage Name
     - expect: Validation error appears for Priority
     - expect: No record is created in the table

#### 4.2. TC-VAL-02: Submit with Phase Name empty shows validation error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Leave Phase Name empty, fill Stage Name 'Test Stage', Priority '1', click 'Submit'
     - expect: Validation error for Phase Name appears
     - expect: No record is created

#### 4.3. TC-VAL-03: Submit with Stage Name empty shows validation error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Select a Phase Name, leave Stage Name empty, enter Priority '1', click 'Submit'
     - expect: Validation error for Stage Name appears
     - expect: No record is created

#### 4.4. TC-VAL-04: Submit with Priority empty shows validation error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Select a Phase Name, fill Stage Name 'Test Stage', leave Priority empty, click 'Submit'
     - expect: Validation error for Priority appears
     - expect: No record is created

#### 4.5. TC-VAL-05: Validation errors clear when valid input is entered

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click 'Submit' with empty form to trigger all validation errors
     - expect: Errors visible for all three fields
  2. Fill all three fields with valid values
     - expect: Validation errors disappear
  3. Click 'Submit'
     - expect: Success toast appears

---

### 5. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-DUP-01: Adding a stage with the same name under the same phase shows an error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and note an existing stage under a phase (e.g. Phase = 'Phase 1', Stage Name = 'Stage 1')
  2. Select 'Phase 1', enter Stage Name 'Stage 1', any Priority, click 'Submit'
     - expect: Error toast appears (e.g. 'Something went wrong.' or a duplicate message)
     - expect: No duplicate record is added to the table

#### 5.2. TC-DUP-02: Adding a stage with the same name under a different phase is allowed

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Note an existing stage name under 'Phase 1' (e.g. 'Stage 1')
  2. Select a different phase (e.g. 'Phase 2'), enter Stage Name 'Stage 1', a unique Priority, click 'Submit'
     - expect: Success toast appears (same stage name is allowed under different phases)
     - expect: Record added with Phase = 'Phase 2', Stage Name = 'Stage 1'

#### 5.3. TC-DUP-03: Update stage name to duplicate of existing active stage under the same phase shows error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Identify two different Active stages under the same phase (e.g. 'Stage 1' and 'Stage 2' under 'Phase 1')
  2. Click Edit on 'Stage 2', change Stage Name to 'Stage 1', click 'Update'
     - expect: Error toast appears indicating a duplicate record already exists
     - expect: 'Stage 2' retains its original name in the table

#### 5.4. TC-DUP-04: Adding a stage with same name as an existing inactive stage under the same phase shows error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`, set Status filter to 'Inactive' and note an existing Inactive stage name under a phase (e.g. Phase = 'Phase 1', Stage Name = 'Old Stage')
  2. Set Status filter back to 'Active'
  3. Select 'Phase 1' in the Phase Name dropdown, enter Stage Name 'Old Stage', any unique Priority, click 'Submit'
     - expect: Error toast appears (duplicate check applies regardless of the existing record's status)
     - expect: No new record is created in the table

#### 5.5. TC-DUP-05: Update stage name to duplicate of an existing inactive stage under the same phase shows error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Set Status filter to 'Inactive' and note an Inactive stage name under a phase (e.g. Phase = 'Phase 1', Stage Name = 'Inactive Stage')
  2. Set Status filter back to 'Active'
  3. Click Edit on a different Active stage under 'Phase 1', change its Stage Name to 'Inactive Stage', click 'Update'
     - expect: Error toast appears indicating a duplicate record already exists
     - expect: The edited stage retains its original name in the table

#### 5.6. TC-DUP-06: Update stage name to same name as a stage under a different phase is allowed

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Note the Stage Name of an Active stage under 'Phase 1' (e.g. 'Foundation')
  2. Click Edit on an Active stage under a different phase (e.g. 'Phase 2'), change its Stage Name to 'Foundation', click 'Update'
     - expect: Success toast appears (same stage name is allowed under different phases)
     - expect: Table record now shows Phase = 'Phase 2', Stage Name = 'Foundation'

---

### 6. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-CLR-01: Clear button resets the Add Stage form

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`, select a Phase Name, enter Stage Name 'Some Stage', Priority '3'
     - expect: All fields are populated
  2. Click 'Clear'
     - expect: Phase Name dropdown is reset (empty)
     - expect: Stage Name input is empty
     - expect: Priority input is empty
     - expect: Form heading remains 'Add Stage'
     - expect: No toast or error is shown

#### 6.2. TC-CLR-02: Clear button in Edit mode resets form to Add Stage state

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click the Edit icon on any stage record
     - expect: Form heading changes to 'Update Stage'
     - expect: Phase Name, Stage Name, Priority are pre-filled
     - expect: Status dropdown is visible; 'Update' button is visible
  2. Click 'Clear'
     - expect: Form heading reverts to 'Add Stage'
     - expect: All fields are cleared
     - expect: Status dropdown is no longer visible
     - expect: Action button reverts to 'Submit'

---

### 7. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-EDT-01: Edit icon opens stage record in edit mode

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and click the Edit icon on any row
     - expect: Form heading changes to 'Update Stage'
     - expect: Phase Name, Stage Name, Priority are pre-filled with the record's values
     - expect: Status dropdown (Active/Inactive) appears with the current status
     - expect: 'Update' button is visible; 'Submit' button is gone

#### 7.2. TC-EDT-02: Successfully update stage name

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click Edit on any stage, update Stage Name to 'Updated Stage Name', click 'Update'
     - expect: Success toast appears (e.g. 'Stage updated successfully!')
     - expect: Form resets to 'Add Stage' with empty fields
     - expect: Table row shows the updated Stage Name

#### 7.3. TC-EDT-03: Successfully update priority

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click Edit on any stage, change Priority to a new unique value, click 'Update'
     - expect: Success toast appears
     - expect: Table shows updated Priority

#### 7.4. TC-EDT-04: Update stage status to Inactive

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click Edit on any Active stage, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter 'All', verify the record shows 'Inactive' badge
  3. With Status filter 'Active', verify the record is absent

#### 7.5. TC-EDT-05: Update with empty Stage Name shows validation error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click Edit on any stage, clear the Stage Name field, click 'Update'
     - expect: Validation error appears for Stage Name
     - expect: No update is saved

#### 7.6. TC-EDT-06: Update with empty Priority shows validation error

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click Edit on any stage, clear the Priority field, click 'Update'
     - expect: Validation error appears for Priority
     - expect: No update is saved

---

### 8. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-FLT-01: Status filter defaults to Active

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master`
     - expect: Status filter shows 'Active' as default
     - expect: Table shows only records with 'Active' badge

#### 8.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
     - expect: Both Active and Inactive records are displayed

#### 8.3. TC-FLT-03: Filter table to show Inactive records only

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
     - expect: Only Inactive records are shown, or an empty state if none exist

---

### 9. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-SRC-01: Search by partial stage name returns matching results

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and type 'Foundation' in the Search Stage Name input
     - expect: Table filters to show only records whose Stage Name contains 'Foundation'

#### 9.2. TC-SRC-02: Search with a non-existent name returns no results

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Type 'XYZNOSTAGENAMEEXISTS999' in the search input
     - expect: Table shows no rows or an empty state message

#### 9.3. TC-SRC-03: Clearing search input restores the full list

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Type a search term, verify filtered results, then clear the search input
     - expect: Full Active list is restored

---

### 10. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Navigate to `/master/stage-master` and change Show to '10'
     - expect: Up to 10 rows are displayed

#### 10.2. TC-PAG-02: Navigate between pages

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. If multiple pages exist, click 'Next page'
     - expect: Next page of records is displayed
  2. Click 'Previous page'
     - expect: Returns to the previous page

---

### 11. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRT-01: Sort by Phase column

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click the 'Phase' column header
     - expect: Table re-sorts alphabetically by phase name A→Z
  2. Click again
     - expect: Reverses to Z→A

#### 11.2. TC-SRT-02: Sort by Stage Name column

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click the 'Stage Name' column header
     - expect: Table re-sorts alphabetically by stage name A→Z
  2. Click again
     - expect: Reverses to Z→A

#### 11.3. TC-SRT-03: Sort by Priority column

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Click the 'Priority' column header
     - expect: Table re-sorts ascending numerically
  2. Click again
     - expect: Reverses to descending

#### 11.4. TC-SRT-04: Sort by Status column

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Set Status filter to 'All', then click the 'Status' column header
     - expect: Records are grouped or sorted by Active/Inactive

---

### 12. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-INA-01: Mark an Active stage as Inactive and verify filter behavior

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Edit an Active stage, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter 'Active', verify the stage is absent
  3. Switch to Status filter 'Inactive'
     - expect: Stage appears with 'Inactive' badge

#### 12.2. TC-INA-02: Re-activate an Inactive stage

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Set Status filter 'Inactive', click Edit on an Inactive stage, set Status to 'Active', click 'Update'
     - expect: Success toast appears
  2. Set Status filter 'Active'
     - expect: Stage reappears in the Active list

#### 12.3. TC-INA-03: Inactive stage does not appear in Task Master stage dropdown

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Set a stage to 'Inactive' in Stage Master
  2. Navigate to `/master/task-master`, select the parent phase in Phase Name dropdown
  3. Open the Stage Name dropdown
     - expect: The now-Inactive stage does NOT appear in the Stage Name options

---

### 13. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-NAV-01: Unauthenticated access redirects to login

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to `https://stage.elevatorplus.net/master/stage-master`
     - expect: User is redirected to the login page

#### 13.2. TC-NAV-02: 'Create Stages' nav link is active when on Stage Master page

**File:** `tests/PMS-master/stage-master.spec.ts`

**Steps:**
  1. Log in and navigate to `/master/stage-master`
     - expect: 'Installation (PMS)' menu is expanded in the sidebar
     - expect: 'Create Stages' link is highlighted/active in the submenu
