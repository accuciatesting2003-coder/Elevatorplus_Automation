# Task Master (Create Tasks) Test Plan

## Application Overview

The Task Master page is part of the ElevatorPlus **Installation (PMS)** module, accessible at `/master/task-master` (sidebar: Installation (PMS) → Create Tasks). It allows admin users to create and manage tasks linked to specific phases and stages. Tasks are the third and deepest level of the PMS hierarchy: Phase → Stage → Task.

**Dependencies:**
- Depends on **Phase Master**: Phase Name dropdown loads only Active phases.
- Depends on **Stage Master**: Stage Name dropdown is filtered by the selected phase — only stages linked to the selected phase are shown. If no stages exist for the selected phase, the Stage Name dropdown shows no options.

The page has two sections:

**(1) Add Task form** — fields:
- **Phase Name \*** (React Select, helper: "Select the phase name") — mandatory; loads all Active phases
- **Stage Name \*** (React Select, helper: "Select the stage name") — mandatory; dependent on Phase Name; only stages belonging to the selected phase are listed
- **Task Name \*** (text input, helper: "Enter task name") — mandatory
- **Prerequisite Task** (React Select multi-select, helper: "Select pre-task(s)") — optional; allows selecting one or more existing tasks as prerequisites
- **Days Required \*** (number spinbutton, helper: "Enter days") — mandatory; number of days to complete the task
- **Remark Required** (checkbox, default **checked**) — optional
- **Photos Required** (checkbox, default unchecked) — optional
- **Customer Scope of Work** (checkbox, default unchecked) — optional
- **Priority (Add unique priority) \*** (number spinbutton, helper: "Enter priority") — mandatory; must be a unique number

Form buttons: **Clear** and **Submit** (add mode); **Clear** and **Update** (edit mode).

**(2) Data table** — lists all task records with columns: Sr. No., Action (Edit icon), Phase Name, Stage Name, Task Name, Is Allow For All Lifts (Yes/No badge — from the linked phase), Lift Type (from the linked phase), Prerequisite Task, Days Required, Priority, Remark Required (Yes/No badge), Photos Required (Yes/No badge), Our Scope (Yes/No badge — reflects "Customer Scope of Work"), Status (Active/Inactive badge).

The table toolbar includes a **Show** selector (10/25/50/100, default 25), a **Status** filter (All/Active/Inactive, default Active), and a **Search Stage Name** input.

Clicking the Edit icon switches the form to "Update Task" mode, pre-fills all fields, exposes a Status dropdown (Active/Inactive), and changes the action button to "Update".

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Task Master page loads successfully

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Log in and navigate to `https://stage.elevatorplus.net/master/task-master`
     - expect: Page URL is `https://stage.elevatorplus.net/master/task-master`
     - expect: Page title is 'ElevatorPlus'
     - expect: Navbar heading reads 'Task Master'
     - expect: Form heading 'Add Task' is visible
     - expect: Phase Name * React Select is present and empty, helper text 'Select the phase name' visible
     - expect: Stage Name * React Select is present and empty, helper text 'Select the stage name' visible
     - expect: Task Name * text input is present and empty, helper text 'Enter task name' visible
     - expect: Prerequisite Task React Select is present and empty, helper text 'Select pre-task(s)' visible
     - expect: Days Required * spinbutton is present and empty, helper text 'Enter days' visible
     - expect: 'Remark Required' checkbox is present and **checked by default**
     - expect: 'Photos Required' checkbox is present and unchecked
     - expect: 'Customer Scope of Work' checkbox is present and unchecked
     - expect: Priority spinbutton is present and empty, helper text 'Enter priority' visible
     - expect: 'Clear' and 'Submit' buttons are visible
     - expect: Data table is present with columns: Sr. No., Action, Phase Name, Stage Name, Task Name, Is Allow For All Lifts, Lift Type, Prerequisite Task, Days Required, Priority, Remark Required, Photos Required, Our Scope, Status

#### 1.2. TC-SM-02: Verify table toolbar elements

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`
  2. Inspect the data table toolbar
     - expect: Show dropdown present with options 10, 25, 50, 100 (default 25)
     - expect: Status filter present with options All, Active, Inactive (default Active)
     - expect: Search Stage Name input is present
  3. Inspect table column headers
     - expect: Columns: Sr. No., Action, Phase Name, Stage Name, Task Name, Is Allow For All Lifts, Lift Type, Prerequisite Task, Days Required, Priority, Remark Required, Photos Required, Our Scope, Status
     - expect: Sortable columns have sort icons

#### 1.3. TC-SM-03: Task Master is accessible via sidebar navigation

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Log in and click 'Installation (PMS)' in the sidebar
     - expect: Submenu expands showing Phase Master, Create Stages, Create Tasks, PMS Data Import, PMS Checklist
  2. Click 'Create Tasks'
     - expect: Navigates to `/master/task-master`
     - expect: 'Add Task' form is visible

---

### 2. Phase–Stage Dependency

**Seed:** `tests/setup/auth.setup.ts`

#### 2.1. TC-DEP-01: Phase Name dropdown loads only Active phases

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` and click the Phase Name dropdown
     - expect: Dropdown lists all Active phases from Phase Master
     - expect: Inactive phases do NOT appear

#### 2.2. TC-DEP-02: Stage Name dropdown is empty before a phase is selected

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` without selecting a phase
  2. Click the Stage Name dropdown
     - expect: Dropdown shows no options (or a placeholder like 'Select the stage name' with no choices)

#### 2.3. TC-DEP-03: After selecting a phase, Stage Name dropdown loads only stages for that phase

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, select 'Civil Work' from Phase Name dropdown
  2. Click the Stage Name dropdown
     - expect: Only stages linked to 'Civil Work' are listed (e.g. 'Foundation', 'Shaft Construction', 'Machine Room')
     - expect: Stages from other phases do NOT appear

#### 2.4. TC-DEP-04: Changing the selected phase resets and reloads the Stage Name dropdown

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, select 'Phase 1', then select a stage from Stage Name dropdown
     - expect: Stages for Phase 1 are listed
  2. Change the Phase Name selection to 'Phase 2'
     - expect: Stage Name dropdown is reset (previous selection cleared)
     - expect: Stage Name dropdown now lists stages for 'Phase 2', not Phase 1

#### 2.5. TC-DEP-05: If selected phase has no stages, Stage Name dropdown shows no options

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Create a new phase in Phase Master that has no stages yet
  2. Navigate to `/master/task-master`, select that phase from Phase Name dropdown
  3. Click the Stage Name dropdown
     - expect: No options are listed in the dropdown

#### 2.6. TC-DEP-06: Task table shows inherited Is Allow For All Lifts and Lift Type from the phase

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Create a task under a phase with 'Is Allow For All Lifts = Yes' (e.g. 'Phase 1')
     - expect: New table record shows Is Allow For All Lifts = 'Yes', Lift Type = 'All'
  2. Create a task under a phase with 'Is Allow For All Lifts = No' (e.g. 'planning')
     - expect: New table record shows Is Allow For All Lifts = 'No', Lift Type = the specific type of that phase

---

### 3. Add Task — Happy Path

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-ADD-01: Successfully create a task with all mandatory fields and default checkbox values

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`
  2. Select an active phase (e.g. 'Civil Work') from Phase Name
  3. Select a stage (e.g. 'Foundation') from Stage Name
  4. Enter Task Name 'Site Survey and Marking'
  5. Leave Prerequisite Task empty
  6. Enter Days Required '2'
  7. Leave Remark Required checked (default), Photos Required unchecked, Customer Scope of Work unchecked
  8. Enter Priority '1'
  9. Click 'Submit'
     - expect: Success toast appears (e.g. 'Task created successfully!' or similar)
     - expect: Form fields are cleared after submission
     - expect: 'Remark Required' checkbox reverts to checked (default) after clear
     - expect: New record in table: Phase Name = 'Civil Work', Stage Name = 'Foundation', Task Name = 'Site Survey and Marking', Days Required = '2', Priority = '1', Remark Required = 'Yes', Photos Required = 'No', Our Scope = 'No', Status = 'Active'

#### 3.2. TC-ADD-02: Successfully create a task with all checkboxes checked

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, fill all mandatory fields, check 'Remark Required', 'Photos Required', and 'Customer Scope of Work'
  2. Click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows Remark Required = 'Yes', Photos Required = 'Yes', Our Scope = 'Yes'

#### 3.3. TC-ADD-03: Successfully create a task with all checkboxes unchecked

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, fill all mandatory fields, uncheck 'Remark Required' (which is checked by default), leave 'Photos Required' and 'Customer Scope of Work' unchecked
  2. Click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows Remark Required = 'No', Photos Required = 'No', Our Scope = 'No'

#### 3.4. TC-ADD-04: Successfully create a task with a Prerequisite Task selected

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, select a phase and stage that already have tasks
  2. Fill mandatory fields: Task Name 'Dependent Task', Days Required '3', Priority '99'
  3. Select one or more existing tasks from the Prerequisite Task dropdown
     - expect: Selected task name(s) appear as chips/tags in the Prerequisite Task field
  4. Click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows the selected prerequisite task name(s) in the Prerequisite Task column

#### 3.5. TC-ADD-05: Successfully create a task with Days Required = 1 (minimum)

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields with Days Required = '1', click 'Submit'
     - expect: Success toast appears; record shows Days Required = '1'

#### 3.6. TC-ADD-06: Successfully create a task with a large Days Required value

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields with Days Required = '365', click 'Submit'
     - expect: Success toast appears; record shows Days Required = '365'

---

### 4. Mandatory Field Validation

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-VAL-01: Submit with all mandatory fields empty shows validation errors

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` and click 'Submit' without filling any fields
     - expect: Validation error for Phase Name
     - expect: Validation error for Stage Name
     - expect: Validation error for Task Name
     - expect: Validation error for Days Required
     - expect: Validation error for Priority
     - expect: No record is created

#### 4.2. TC-VAL-02: Submit with Phase Name empty shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Leave Phase Name empty, fill all other fields, click 'Submit'
     - expect: Validation error for Phase Name
     - expect: No record is created

#### 4.3. TC-VAL-03: Submit with Stage Name empty shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Select Phase Name, leave Stage Name empty, fill all other mandatory fields, click 'Submit'
     - expect: Validation error for Stage Name
     - expect: No record is created

#### 4.4. TC-VAL-04: Submit with Task Name empty shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Select Phase Name and Stage Name, leave Task Name empty, fill Days Required and Priority, click 'Submit'
     - expect: Validation error for Task Name
     - expect: No record is created

#### 4.5. TC-VAL-05: Submit with Days Required empty shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill Phase Name, Stage Name, Task Name, Priority; leave Days Required empty; click 'Submit'
     - expect: Validation error for Days Required
     - expect: No record is created

#### 4.6. TC-VAL-06: Submit with Priority empty shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill Phase Name, Stage Name, Task Name, Days Required; leave Priority empty; click 'Submit'
     - expect: Validation error for Priority
     - expect: No record is created

#### 4.7. TC-VAL-07: Validation errors clear when valid input is entered

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click 'Submit' with empty form to trigger all validation errors
  2. Fill all mandatory fields with valid values
     - expect: Validation errors disappear as each field is filled
  3. Click 'Submit'
     - expect: Success toast appears

---

### 5. Checkbox Fields Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-CHK-01: Remark Required checkbox is checked by default

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` (fresh load)
     - expect: 'Remark Required' checkbox is checked
     - expect: 'Photos Required' checkbox is unchecked
     - expect: 'Customer Scope of Work' checkbox is unchecked

#### 5.2. TC-CHK-02: Toggling Remark Required reflects correctly in table

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields, uncheck 'Remark Required', click 'Submit'
     - expect: Table record shows Remark Required = 'No'
  2. Fill all mandatory fields, leave 'Remark Required' checked (default), click 'Submit'
     - expect: Table record shows Remark Required = 'Yes'

#### 5.3. TC-CHK-03: Toggling Photos Required reflects correctly in table

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields, check 'Photos Required', click 'Submit'
     - expect: Table record shows Photos Required = 'Yes'
  2. Fill all mandatory fields, leave 'Photos Required' unchecked, click 'Submit'
     - expect: Table record shows Photos Required = 'No'

#### 5.4. TC-CHK-04: Toggling Customer Scope of Work reflects as "Our Scope" in table

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields, check 'Customer Scope of Work', click 'Submit'
     - expect: Table record shows Our Scope = 'Yes'
  2. Fill all mandatory fields, leave 'Customer Scope of Work' unchecked, click 'Submit'
     - expect: Table record shows Our Scope = 'No'

#### 5.5. TC-CHK-05: After form clear, Remark Required reverts to checked (default)

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, uncheck 'Remark Required', check 'Photos Required' and 'Customer Scope of Work'
  2. Click 'Clear'
     - expect: 'Remark Required' is back to checked
     - expect: 'Photos Required' is unchecked
     - expect: 'Customer Scope of Work' is unchecked

---

### 6. Prerequisite Task Field

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-PRE-01: Prerequisite Task field is optional — submitting without it succeeds

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Fill all mandatory fields, leave Prerequisite Task empty, click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows '-' (dash) in the Prerequisite Task column

#### 6.2. TC-PRE-02: Prerequisite Task dropdown lists existing tasks for the selected phase/stage

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Select a Phase Name and Stage Name that have existing tasks
  2. Click the Prerequisite Task dropdown
     - expect: Existing task names for that phase/stage are listed as options

#### 6.3. TC-PRE-03: Multiple prerequisite tasks can be selected

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Select a phase and stage, click Prerequisite Task dropdown and select two existing tasks
     - expect: Both task names appear as chips/tags in the field
  2. Fill other mandatory fields and click 'Submit'
     - expect: Success toast appears
     - expect: Table record shows both task names in the Prerequisite Task column

#### 6.4. TC-PRE-04: A selected prerequisite task can be removed before submission

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Select a prerequisite task from the dropdown (it appears as a chip)
  2. Remove it by clicking the × on the chip
     - expect: The chip is removed; field is empty again
  3. Click 'Submit' with remaining fields filled
     - expect: Success toast appears
     - expect: Table record shows '-' in Prerequisite Task column

---

### 7. Duplicate Prevention

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-DUP-01: Adding a task with the same name under the same phase and stage shows an error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Note an existing task: Phase = 'Civil Work', Stage = 'Foundation', Task = 'Site Survey and Marking'
  2. Select the same Phase and Stage, enter Task Name 'Site Survey and Marking', fill Days Required and Priority, click 'Submit'
     - expect: Error toast appears (e.g. 'Something went wrong.' or a specific duplicate message)
     - expect: No duplicate record is added

#### 7.2. TC-DUP-02: Adding a task with the same name under a different stage is allowed

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Note an existing task name under Stage 'Foundation' (e.g. 'Site Survey and Marking')
  2. Select the same Phase but a different Stage (e.g. 'Machine Room'), enter Task Name 'Site Survey and Marking', fill Days Required and Priority, click 'Submit'
     - expect: Success toast appears (same task name is allowed under a different stage)

#### 7.3. TC-DUP-03: Update task name to duplicate of existing task under same phase and stage shows error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Identify two tasks under the same Phase and Stage (e.g. 'Task A' and 'Task B')
  2. Click Edit on 'Task B', change Task Name to 'Task A', click 'Update'
     - expect: Error toast appears
     - expect: 'Task B' retains its original name

#### 7.4. TC-DUP-04: Duplicate Priority within the same phase/stage shows an error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Note an existing task's Priority under a Phase/Stage (e.g. Priority = '1')
  2. Add a new task with a unique Task Name but the same Priority '1' under the same Phase and Stage, click 'Submit'
     - expect: Error toast appears indicating priority must be unique
     - expect: No record is created

---

### 8. Clear Button Behavior

**Seed:** `tests/setup/auth.setup.ts`

#### 8.1. TC-CLR-01: Clear button resets the Add Task form

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`, fill all fields: select Phase, Stage, enter Task Name, select a Prerequisite Task, enter Days Required, check all checkboxes, enter Priority
  2. Click 'Clear'
     - expect: Phase Name dropdown is reset
     - expect: Stage Name dropdown is reset
     - expect: Task Name input is empty
     - expect: Prerequisite Task dropdown is reset
     - expect: Days Required input is empty
     - expect: 'Remark Required' checkbox is back to **checked** (default)
     - expect: 'Photos Required' checkbox is unchecked
     - expect: 'Customer Scope of Work' checkbox is unchecked
     - expect: Priority input is empty
     - expect: Form heading remains 'Add Task'
     - expect: No toast or error is shown

#### 8.2. TC-CLR-02: Clear button in Edit mode resets form to Add Task state

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the Edit icon on any task record
     - expect: Form heading changes to 'Update Task'
     - expect: All fields are pre-filled
     - expect: Status dropdown is visible
     - expect: 'Update' button is visible
  2. Click 'Clear'
     - expect: Form heading reverts to 'Add Task'
     - expect: All inputs are cleared
     - expect: 'Remark Required' reverts to checked (default)
     - expect: Status dropdown is gone
     - expect: 'Submit' button is back

---

### 9. Edit and Update Operations

**Seed:** `tests/setup/auth.setup.ts`

#### 9.1. TC-EDT-01: Edit icon opens task record in edit mode

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` and click the Edit icon on any row
     - expect: Form heading changes to 'Update Task'
     - expect: Phase Name, Stage Name, Task Name, Prerequisite Task, Days Required, checkbox states, and Priority are pre-filled
     - expect: Status dropdown (Active/Inactive) appears with current status
     - expect: 'Update' button is visible; 'Submit' button is gone

#### 9.2. TC-EDT-02: Successfully update task name

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit on any task, change Task Name to 'Updated Task Name', click 'Update'
     - expect: Success toast appears (e.g. 'Task updated successfully!')
     - expect: Form resets to 'Add Task' with empty fields
     - expect: Table row shows updated Task Name

#### 9.3. TC-EDT-03: Successfully update Days Required

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit on any task, change Days Required to '10', click 'Update'
     - expect: Success toast appears
     - expect: Table shows Days Required = '10' for that record

#### 9.4. TC-EDT-04: Successfully update checkbox values

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit on a task with Remark Required = 'Yes', Photos Required = 'No', Our Scope = 'No'
  2. Uncheck Remark Required, check Photos Required, check Customer Scope of Work; click 'Update'
     - expect: Success toast appears
     - expect: Table shows Remark Required = 'No', Photos Required = 'Yes', Our Scope = 'Yes'

#### 9.5. TC-EDT-05: Successfully add/remove a Prerequisite Task during update

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit on a task with no prerequisite (Prerequisite Task = '-')
  2. Select a task from Prerequisite Task dropdown, click 'Update'
     - expect: Success toast appears; table shows the selected prerequisite task name

#### 9.6. TC-EDT-06: Update task status to Inactive

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit on any Active task, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter 'Active', verify the task is absent
  3. Switch to Status filter 'All'
     - expect: Task appears with 'Inactive' badge

#### 9.7. TC-EDT-07: Update with empty Task Name shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit, clear Task Name field, click 'Update'
     - expect: Validation error for Task Name; no update saved

#### 9.8. TC-EDT-08: Update with empty Days Required shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit, clear Days Required, click 'Update'
     - expect: Validation error for Days Required; no update saved

#### 9.9. TC-EDT-09: Update with empty Priority shows validation error

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click Edit, clear Priority field, click 'Update'
     - expect: Validation error for Priority; no update saved

---

### 10. Status Filter

**Seed:** `tests/setup/auth.setup.ts`

#### 10.1. TC-FLT-01: Status filter defaults to Active

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master`
     - expect: Status filter shows 'Active'; table shows only Active records

#### 10.2. TC-FLT-02: Filter table to show All statuses

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Change Status filter to 'All'
     - expect: Both Active and Inactive records are displayed

#### 10.3. TC-FLT-03: Filter table to show Inactive records only

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Change Status filter to 'Inactive'
     - expect: Only Inactive records are shown, or empty state if none exist

---

### 11. Search Functionality

**Seed:** `tests/setup/auth.setup.ts`

#### 11.1. TC-SRC-01: Search by partial stage name returns matching results

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` and type 'Foundation' in the Search Stage Name input
     - expect: Table filters to show only records where Stage Name contains 'Foundation'

#### 11.2. TC-SRC-02: Search with a non-existent term returns no results

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Type 'XYZNOSTAGENAME999' in the search input
     - expect: Table shows no rows or an empty state message

#### 11.3. TC-SRC-03: Clearing the search input restores the full list

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Type a search term, then clear the search input
     - expect: Full Active task list is restored

---

### 12. Rows Per Page and Pagination

**Seed:** `tests/setup/auth.setup.ts`

#### 12.1. TC-PAG-01: Change rows-per-page to 10

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Navigate to `/master/task-master` and change Show to '10'
     - expect: Up to 10 rows are displayed

#### 12.2. TC-PAG-02: Navigate between pages

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. If multiple pages exist (current data has 4 pages), click 'Next page'
     - expect: Next page of task records is displayed
  2. Click 'Previous page'
     - expect: Returns to the previous page

#### 12.3. TC-PAG-03: Jump to a specific page number

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click page number '3' in the pagination
     - expect: Page 3 records are displayed
     - expect: 'Page 3 is your current page' button is highlighted

---

### 13. Column Sorting

**Seed:** `tests/setup/auth.setup.ts`

#### 13.1. TC-SRT-01: Sort by Phase Name column

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the 'Phase Name' column header
     - expect: Table re-sorts alphabetically A→Z by phase name
  2. Click again → Z→A

#### 13.2. TC-SRT-02: Sort by Stage Name column

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the 'Stage Name' column header → A→Z
  2. Click again → Z→A

#### 13.3. TC-SRT-03: Sort by Task Name column

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the 'Task Name' column header → A→Z
  2. Click again → Z→A

#### 13.4. TC-SRT-04: Sort by Days Required column

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the 'Days Required' column header → ascending numeric order
  2. Click again → descending

#### 13.5. TC-SRT-05: Sort by Priority column

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Click the 'Priority' column header → ascending numeric order
  2. Click again → descending

---

### 14. Inactive Status Management

**Seed:** `tests/setup/auth.setup.ts`

#### 14.1. TC-INA-01: Mark an Active task as Inactive

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Edit an Active task, set Status to 'Inactive', click 'Update'
     - expect: Success toast appears
  2. With Status filter 'Active', verify the task is absent
  3. Switch to Status filter 'Inactive'
     - expect: Task appears with 'Inactive' badge

#### 14.2. TC-INA-02: Re-activate an Inactive task

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Set Status filter 'Inactive', click Edit on Inactive task, set Status to 'Active', click 'Update'
     - expect: Task reappears in Active list

---

### 15. Navigation and Access

**Seed:** `tests/setup/auth.setup.ts`

#### 15.1. TC-NAV-01: Unauthenticated access redirects to login

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Open unauthenticated browser and navigate to `https://stage.elevatorplus.net/master/task-master`
     - expect: User is redirected to the login page

#### 15.2. TC-NAV-02: 'Create Tasks' nav link is active when on Task Master page

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. Log in and navigate to `/master/task-master`
     - expect: 'Installation (PMS)' menu is expanded in the sidebar
     - expect: 'Create Tasks' link is highlighted/active in the submenu

---

### 16. Inter-dependency Integrity Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 16.1. TC-INT-01: Inactive phase does not appear in Phase Name dropdown in Task Master

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. In Phase Master, mark a phase as 'Inactive'
  2. Navigate to `/master/task-master` and open the Phase Name dropdown
     - expect: The now-Inactive phase does NOT appear in the list

#### 16.2. TC-INT-02: Inactive stage does not appear in Stage Name dropdown for its parent phase

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. In Stage Master, mark a stage as 'Inactive'
  2. Navigate to `/master/task-master`, select the parent phase
  3. Open the Stage Name dropdown
     - expect: The now-Inactive stage does NOT appear for that phase

#### 16.3. TC-INT-03: A newly created stage in Stage Master immediately appears in Task Master stage dropdown

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. In Stage Master, create a new stage 'New Stage For Task Test' under 'Phase 1'
  2. Navigate to `/master/task-master`, select 'Phase 1' from Phase Name dropdown
  3. Open the Stage Name dropdown
     - expect: 'New Stage For Task Test' appears in the Stage Name dropdown

#### 16.4. TC-INT-04: A newly created phase in Phase Master immediately appears in Task Master phase dropdown

**File:** `tests/PMS-master/task-master.spec.ts`

**Steps:**
  1. In Phase Master, create a new phase 'Brand New Phase For Task Test'
  2. Navigate to `/master/task-master` and open the Phase Name dropdown
     - expect: 'Brand New Phase For Task Test' appears in the dropdown
