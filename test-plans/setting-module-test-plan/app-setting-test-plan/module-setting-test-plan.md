# Module Settings Test Plan

## Application Overview

The Module Settings page is accessible via Settings Master → App Settings → Module Settings on the ElevatorPlus staging app at `https://stage.elevatorplus.net`. It is a toggle-based settings page that controls the availability of specific feature modules across the admin panel.

Each module has a toggle switch that can be **enabled** or **disabled**. Some toggles affect only their own activation state and have no further impact on the admin panel (toggle-only modules). Others produce visible changes in masters, user access sections, and report menus in the admin panel when their state changes.

---

### Modules With No Admin Panel Impact (Toggle-Only)

These modules can be turned on or off; the only thing to verify is that the toggle saves correctly. They do **not** show or hide any section elsewhere in the admin panel.

| # | Toggle Name |
|---|---|
| 1 | PM Inspection Required |
| 2 | Material Delivered |
| 3 | Customer OTP Enabled |
| 4 | Enable Two-Factor Authentication |
| 5 | International Payment |
| 6 | Material Notes Arrival |
| 7 | Sales Order Required |
| 8 | Show Material Used in Jobs |

---

### Modules With Admin Panel Impact

#### 1. One-Time Service Contract

| Toggle State | Expected Impact |
|---|---|
| **Enabled** | Admin panel → a separate **"One Time Services"** section is displayed under masters, containing two entries: **Quotation Report** and **One-Time Services Report** |
| **Enabled** | User Access (non-admin) → Service Master → **One Time Service Inspection Checklist** checkbox is visible |
| **Enabled** | User Access (non-admin) → Service Master → **Checklist Dropdown Master** checkbox is visible |
| **Enabled** | User Access (non-admin) → Manage Service Codes → Add Service Code → **Type** dropdown contains the option **One Time Service** |
| **Enabled** | User Access (non-admin) → Reports section → **One Time Service Report** checkbox is visible |
| **Enabled** | User Access (non-admin) → Reports section → **One Time Service Quotation Report** checkbox is visible |
| **Enabled** | User Access (non-admin) → App User Access → **One Time Services** section is visible |
| **Enabled** | App Settings → Prefix Configuration → **One Time Service Quotation** row is visible |
| **Enabled** | App Settings → Prefix Configuration → **One-Time Service** row is visible |
| **Disabled** | All of the above are hidden / not displayed |

#### 2. Kit Supply

| Toggle State | Expected Impact |
|---|---|
| **Enabled** | Product Category Master (MATL Management) → **Kit Based Category** checkbox is displayed in the add/edit form |
| **Disabled** | The **Kit Based Category** checkbox is not displayed |

#### 3. Modernization Contract

| Toggle State | Expected Impact |
|---|---|
| **Enabled** | App User Access → **Modernization Inspection** checkbox is displayed |
| **Enabled** | App Settings → Prefix & Numbering → **Modernization Job** row is visible |
| **Enabled** | App Settings → Prefix & Numbering → **Modernization Quotation** row is visible |
| **Disabled** | The **Modernization Inspection** checkbox is not displayed |
| **Disabled** | App Settings → Prefix & Numbering → **Modernization Job** row is hidden |
| **Disabled** | App Settings → Prefix & Numbering → **Modernization Quotation** row is hidden |

#### 4. Automatic Calculation for Quotation

| Toggle State | Expected Impact |
|---|---|
| **Enabled** | User Master → User Access → **Sales Forms** section is  displayed |
| **Enabled** | User Master → User Access → Sales Master section → **Material Category Master** checkbox is  displayed |
| **Enabled** | User Master → User Access → Sales Master section → **Material Master** checkbox is  displayed |
| **Enabled** | Masters → **Sales Forms** section is  displayed |
| **Enabled** | Other Master → Ceiling Master form → **Price** field is displayed |
| **Enabled** | Other Master → Flooring Master form → **Price** field is displayed |
| **Enabled** | Other Master → Shaft Master form → **Price** field is displayed |
| **Disabled** | Sales Forms section **not ** displayed in User Access and under Masters |
| **Disabled** | Material Category Master and Material Master checkboxes **not * displayed in Sales Master section |
| **Disabled** | Price field is **not** displayed in Ceiling Master, Flooring Master, and Shaft Master forms |

---

### User Type Verification Rules

- **Admin user:** When a toggle is disabled, verify that the corresponding master or section is not displayed in the admin panel. No need to check User Access checkboxes for the admin user type (all accesses are displayed by default for admin).
- **Non-admin user (Ganesh Kadam):** For the four impactful toggles, verify the User Access checkboxes/sections in Ganesh Kadam's user record in User Master to confirm they are displayed or hidden according to the toggle state.

---

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/setup/auth.setup.ts`

#### 1.1. TC-SM-01: Module Settings page loads successfully

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Log in and navigate to Settings Master → App Settings → Module Settings
   - expect: Page URL contains `/settings` (or the Module Settings tab is active)
   - expect: The "Module Settings" tab/heading is visible
   - expect: At least one toggle switch is visible on the page

#### 1.2. TC-SM-02: All expected impactful module toggles are present

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
   - expect: Toggle labeled **"One Time Service Contract"** is visible
   - expect: Toggle labeled **"Kit Supply"** is visible
   - expect: Toggle labeled **"Modernization Contract"** is visible
   - expect: Toggle labeled **"Automatic Calculation for Quotation"** is visible

#### 1.3. TC-SM-03: Toggle state is preserved after page refresh

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Note the current state (enabled/disabled) of the "Kit Supply" toggle
3. If disabled, enable it; if enabled, disable it and note the new state
4. Reload the page
   - expect: The "Kit Supply" toggle reflects the saved state (not reverted to the previous value)

---

### 2. Toggle-Only Modules — Enable, Disable, and Persist

**Seed:** `tests/setup/auth.setup.ts`

> For each of the following toggles: enable it and verify the enabled state, refresh the page and verify it stays enabled, then disable it and verify the disabled state, refresh again and verify it stays disabled. No other admin panel checks are needed.

#### 2.1. TC-TOG-01: PM Inspection Required toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **PM Inspection Required** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **PM Inspection Required** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.2. TC-TOG-02: Material Delivered toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Material Delivered** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Material Delivered** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.3. TC-TOG-03: Customer OTP Enabled toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Customer OTP Enabled** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Customer OTP Enabled** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.4. TC-TOG-04: Enable Two-Factor Authentication toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Enable Two-Factor Authentication** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Enable Two-Factor Authentication** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.5. TC-TOG-05: International Payment toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **International Payment** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **International Payment** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.6. TC-TOG-06: Material Notes Arrival toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Material Notes Arrival** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Material Notes Arrival** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.7. TC-TOG-07: Sales Order Required toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Sales Order Required** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Sales Order Required** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

#### 2.8. TC-TOG-08: Show Material Used in Jobs toggle enables, disables, and persists

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings
2. Enable the **Show Material Used in Jobs** toggle
   - expect: Toggle is in the **enabled** (on) state
3. Reload the page
   - expect: Toggle remains **enabled**
4. Disable the **Show Material Used in Jobs** toggle
   - expect: Toggle is in the **disabled** (off) state
5. Reload the page
   - expect: Toggle remains **disabled**

---

### 3. One-Time Service Contract

**Seed:** `tests/setup/auth.setup.ts`

#### 3.1. TC-OTS-01: Enabling One-Time Service Contract shows "One Time Services" section in admin panel

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to the admin panel masters/menu
   - expect: A section named **"One Time Services"** is visible
   - expect: Under that section, **"Quotation Report"** master is displayed
   - expect: Under that section, **"One-Time Services Report"** master is displayed

#### 3.2. TC-OTS-02: Disabling One-Time Service Contract hides "One Time Services" section

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to the admin panel masters/menu
   - expect: The **"One Time Services"** section is **not** displayed
   - expect: "Quotation Report" (under One Time Services) is **not** displayed
   - expect: "One-Time Services Report" (under One Time Services) is **not** displayed

#### 3.3. TC-OTS-03: Enabling One-Time Service Contract shows related checkboxes in non-admin User Access (Service Master)

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → go to User Access
3. Locate the **Service Master** section
   - expect: **"One Time Service Inspection Checklist"** checkbox is visible
   - expect: **"Checklist Dropdown Master"** checkbox is visible

#### 3.4. TC-OTS-04: Disabling One-Time Service Contract hides those checkboxes in non-admin User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → go to User Access → Service Master section
   - expect: **"One Time Service Inspection Checklist"** checkbox is **not** visible
   - expect: **"Checklist Dropdown Master"** checkbox is **not** visible

#### 3.5. TC-OTS-05: Enabling One-Time Service Contract shows "One Time Service" in Add Service Code Type dropdown

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to Manage Service Codes → click **Add Service Code**
3. Open the **Type** dropdown
   - expect: The option **"One Time Service"** is present in the dropdown

#### 3.6. TC-OTS-06: Disabling One-Time Service Contract removes "One Time Service" from Type dropdown

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to Manage Service Codes → click **Add Service Code** → open the **Type** dropdown
   - expect: The option **"One Time Service"** is **not** present in the dropdown

#### 3.7. TC-OTS-07: Enabling One-Time Service Contract shows report checkboxes in non-admin User Access (Reports section)

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → User Access → **Reports** section
   - expect: **"One Time Service Report"** checkbox is visible
   - expect: **"One Time Service Quotation Report"** checkbox is visible

#### 3.8. TC-OTS-08: Disabling One-Time Service Contract hides report checkboxes in non-admin User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → User Access → Reports section
   - expect: **"One Time Service Report"** checkbox is **not** visible
   - expect: **"One Time Service Quotation Report"** checkbox is **not** visible

#### 3.9. TC-OTS-09: Enabling One-Time Service Contract shows "One Time Services" section in App User Access (non-admin)

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → **App User Access**
   - expect: **"One Time Services"** section is visible

#### 3.10. TC-OTS-10: Disabling One-Time Service Contract hides "One Time Services" in App User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → App User Access
   - expect: **"One Time Services"** section is **not** visible

#### 3.11. TC-OTS-11: Enabling One-Time Service Contract shows "One Time Service Quotation" and "One-Time Service" rows in Prefix Configuration

**File:** `tests/setting-module/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **One-Time Service Contract** toggle is **enabled**
2. Navigate to App Settings → **Prefix Configuration** (`/settings/configure?tab=prefix`)
   - expect: **"One Time Service Quotation"** row is visible
   - expect: **"One-Time Service"** row is visible

#### 3.12. TC-OTS-12: Disabling One-Time Service Contract hides "One Time Service Quotation" and "One-Time Service" rows in Prefix Configuration

**File:** `tests/setting-module/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to App Settings → **Prefix Configuration** (`/settings/configure?tab=prefix`)
   - expect: **"One Time Service Quotation"** row is **not** visible
   - expect: **"One-Time Service"** row is **not** visible

---

### 4. Kit Supply

**Seed:** `tests/setup/auth.setup.ts`

#### 4.1. TC-KIT-01: Enabling Kit Supply shows "Kit Based Category" checkbox in Product Category Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Kit Supply** toggle is **enabled**
2. Navigate to MATL Management → **Product Category Master** → click **Add** (or open any existing record)
   - expect: The **"Kit Based Category"** checkbox is visible in the form

#### 4.2. TC-KIT-02: Disabling Kit Supply hides "Kit Based Category" checkbox

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Kit Supply** toggle
2. Navigate to MATL Management → **Product Category Master** → click **Add** (or open any existing record)
   - expect: The **"Kit Based Category"** checkbox is **not** visible in the form

---

### 5. Modernization Contract

**Seed:** `tests/setup/auth.setup.ts`

#### 5.1. TC-MOD-01: Enabling Modernization Contract shows "Modernization Inspection" checkbox in App User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Modernization Contract** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → **App User Access**
   - expect: **"Modernization Inspection"** checkbox is visible

#### 5.2. TC-MOD-02: Disabling Modernization Contract hides "Modernization Inspection" checkbox

**File:** `tests/setting-module/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Modernization Contract** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → App User Access
   - expect: **"Modernization Inspection"** checkbox is **not** visible

#### 5.3. TC-MOD-03: Enabling Modernization Contract shows "Modernization Job" and "Modernization Quotation" rows in Prefix & Numbering

**File:** `tests/setting-module/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Modernization Contract** toggle is **enabled**
2. Navigate to App Settings → **Prefix & Numbering** (`/settings/configure?tab=prefix`)
   - expect: **"Modernization Job"** row is visible
   - expect: **"Modernization Quotation"** row is visible

#### 5.4. TC-MOD-04: Disabling Modernization Contract hides "Modernization Job" and "Modernization Quotation" rows in Prefix & Numbering

**File:** `tests/setting-module/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Modernization Contract** toggle
2. Navigate to App Settings → **Prefix & Numbering** (`/settings/configure?tab=prefix`)
   - expect: **"Modernization Job"** row is **not** visible
   - expect: **"Modernization Quotation"** row is **not** visible

---

### 6. Automatic Calculation for Quotation

**Seed:** `tests/setup/auth.setup.ts`

#### 6.1. TC-ACQ-01: Enabling Automatic Calculation displayes  "Sales Forms" section in User Access (User Master)

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → **User Access**
   - expect: **"Sales Forms"** section is is  displayed

#### 6.2. TC-ACQ-02: Disabling Automatic Calculation hides  "Sales Forms" section in User Access (User Master)

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → User Access
   - expect: **"Sales Forms"** section should not  displayed

#### 6.3. TC-ACQ-03: Enabling Automatic Calculation displayes "Material Category Master" and "Material Master" in Sales Master User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to User Master → open **Ganesh Kadam**'s record → User Access → **Sales Master** section
   - expect: **"Material Category Master"** checkbox is **is ** displayed
   - expect: **"Material Master"** checkbox is **is ** displayed

#### 6.4. TC-ACQ-04: Disabling Automatic Calculation hides  "Material Category Master" and "Material Master" in Sales Master User Access

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to User Master → open **Ganesh Kadam**'s record → User Access → Sales Master section
   - expect: **"Material Category Master"** checkbox **not ** displayed
   - expect: **"Material Master"** checkbox **not ** displayed

#### 6.5. TC-ACQ-05: Enabling Automatic Calculation hides "Sales Forms" section under Masters for admin user 

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to the Masters menu/listing
   - expect: **"Sales Forms"** section is  displayed under Masters

#### 6.6. TC-ACQ-06: Disabling Automatic Calculation hides  "Sales Forms" section under Masters for admin user 

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to the Masters menu/listing
   - expect: **"Sales Forms"** section should not  displayed under Masters

#### 6.7. TC-ACQ-07: Enabling Automatic Calculation shows Price field in Ceiling Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to Other Master → **Ceiling Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is visible in the form

#### 6.8. TC-ACQ-08: Disabling Automatic Calculation hides Price field in Ceiling Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to Other Master → **Ceiling Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is **not** visible in the form

#### 6.9. TC-ACQ-09: Enabling Automatic Calculation shows Price field in Flooring Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to Other Master → **Flooring Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is visible in the form

#### 6.10. TC-ACQ-10: Disabling Automatic Calculation hides Price field in Flooring Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to Other Master → **Flooring Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is **not** visible in the form

#### 6.11. TC-ACQ-11: Enabling Automatic Calculation shows Price field in Shaft Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and ensure the **Automatic Calculation for Quotation** toggle is **enabled**
2. Navigate to Other Master → **Shaft Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is visible in the form

#### 6.12. TC-ACQ-12: Disabling Automatic Calculation hides Price field in Shaft Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to Other Master → **Shaft Master** → click **Add** (or open any existing record)
   - expect: The **Price** field is **not** visible in the form

---

### 7. Admin User Type — Master Visibility After Toggle Disable

> For the admin user,user access never dispalyed because admin have all the access by default 

**Seed:** `tests/setup/auth.setup.ts`

#### 7.1. TC-ADM-01: Admin user — One-Time Service Contract disabled hides "One Time Services" section

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Log in as an **admin user**, navigate to Module Settings and **disable** the **One-Time Service Contract** toggle
2. Navigate to the admin panel masters/menu
   - expect: The **"One Time Services"** section is **not** displayed
   - expect: Quotation Report and One-Time Services Report (under One Time Services) are **not** displayed

#### 7.2. TC-ADM-02: Admin user — Kit Supply disabled hides "Kit Based Category" checkbox in Product Category Master

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Log in as **admin**, navigate to Module Settings and **disable** the **Kit Supply** toggle
2. Navigate to MATL Management → Product Category Master → open the Add/Edit form
   - expect: **"Kit Based Category"** checkbox is **not** visible



#### 7.3. TC-ADM-03: Admin user — Automatic Calculation disabled hides  Sales Forms section under Masters

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Log in as **admin**, navigate to Module Settings and **disable** the **Automatic Calculation for Quotation** toggle
2. Navigate to the Masters menu/listing
   - expect: **"Sales Forms"** section **is** displayed under Masters
3. Navigate to Other Master → Ceiling Master → Add/Edit form
   - expect: **Price** field is **not** displayed

#### 7.4. TC-ADM-04: Admin user — Automatic Calculation enabled shows  Sales Forms under Masters and shows Price fields

**File:** `tests/app-setting/module-setting.spec.ts`

**Steps:**
1. Log in as **admin**, navigate to Module Settings and **enable** the **Automatic Calculation for Quotation** toggle
2. Navigate to the Masters menu/listing
   - expect: **"Sales Forms"** section is **not** displayed under Masters
3. Navigate to Other Master → Ceiling Master → Add/Edit form
   - expect: **Price** field is visible
4. Navigate to Other Master → Flooring Master → Add/Edit form
   - expect: **Price** field is visible
5. Navigate to Other Master → Shaft Master → Add/Edit form
   - expect: **Price** field is visible
