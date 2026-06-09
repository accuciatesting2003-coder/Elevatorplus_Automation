# Asset Management Module — Test Plans

This directory contains test plans for all masters in the Asset Management module.

## Test Plan Files

| Master | File | Test Cases |
|---|---|---|
| Asset Master | [asset-master.test-plan.md](asset-master.test-plan.md) | TC-AM-001 to TC-AM-022 |
| Asset Product Master | [asset-product-master.test-plan.md](asset-product-master.test-plan.md) | TC-APM-001 to TC-APM-032 |
| Asset Assignment | [asset-assignment.test-plan.md](asset-assignment.test-plan.md) | TC-AA-001 to TC-AA-038 |
| Asset Return | [asset-return.test-plan.md](asset-return.test-plan.md) | TC-AR-001 to TC-AR-035 |
| Asset Report | [asset-report.test-plan.md](asset-report.test-plan.md) | TC-ARR-001 to TC-ARR-047 |

## Total Test Cases: 174

---

## Coverage Summary

### Asset Master (22 TCs)
- Page load & navigation
- Create asset — mandatory/optional field validations
- Is Multi Quantity checkbox behavior
- Edit/update asset
- Entries visibility from Asset Product Master
- Status active/inactive & downstream impact
- Search & filter
- Duplicate name handling

### Asset Product Master (32 TCs)
- Page load & Asset dropdown (active assets only)
- Asset Entries section display
- Add entry — mandatory field validations (Serial No, Qty, Warehouse)
- Add entry — optional fields (Purchase Date, Warranty, Cost, Notes)
- Data type validations (numeric Qty/Cost, date format)
- Multiple entries per asset
- Entries reflected in Asset Master
- Edit & delete entry

### Asset Assignment (38 TCs)
- Page load & form display
- Mandatory field validations (From, Against, Date)
- From dropdown: Warehouse vs Site sub-dropdowns
- Against — Assign to Technician flow
- Against — Assign to Job (Site → Job cascade) + Technician
- Against — Assign to PM (Site → PM cascade) + Technician
- Technician dropdown consistency across all Against options
- Dropdown reset on option switch

### Asset Return (35 TCs)
- Return Against options (Technician / Job / PM)
- Technician dropdown consistency
- Assigned assets display per selection
- Return quantity validation (max, min, partial)
- Done button → Status popup
- Status selection and confirmation
- Post-return qty verification in report
- Switching Return Against resets state

### Asset Report (47 TCs)
- Tab navigation (Inventory, Engineer Wise, Site Wise)
- Inventory: Warehouse & Status filter dropdowns
- Inventory: single and combined filters, empty states
- Inventory: status reflects post-return status from Asset Return
- Engineer Wise: Technician dropdown, asset list, View detail
- Engineer Wise detail: Issued Date, Serial No, Assigned/Available/Returned Qty
- Site Wise: site list, View detail
- Site Wise detail: Asset Names, Assigned Date, Serial No, Assigned/Available/Returned Qty
- Cross-section consistency checks
