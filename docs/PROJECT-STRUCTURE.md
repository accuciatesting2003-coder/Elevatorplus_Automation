# Playwright Test Project Structure

## Overview
Centralized configuration approach for testing multiple masters/modules in ElevatorPlus.

## Directory Structure

```
playwright-project/
├── playwright.config.ts          # Base URL configured here
├── tests/
│   ├── config/
│   │   └── test-config.ts        # All URLs, credentials, locators
│   ├── helpers/
│   │   └── login-helper.ts       # Reusable login methods
│   ├── seed.spec.ts             # Setup file for test planning
│   ├── login.spec.ts            # Your existing login tests
│   └── masters/
│       ├── user-master.spec.ts   # User Master tests
```

## Key Files

### 1. playwright.config.ts
```typescript
use: {
  baseURL: 'https://stage.elevatorplus.net',
}
```
**Benefit**: Now use `page.goto('/login')` instead of `page.goto('https://stage.elevatorplus.net/login')`

### 2. tests/config/test-config.ts
Contains:
- Base URL
- All master/module URLs
- Test credentials
- Timeouts
- Reusable locators

### 3. tests/helpers/login-helper.ts
Reusable methods:
- `loginAsValidUser()` - Quick login
- `loginWithMobile()` - Login with specific credentials
- `dismissErrorAlert()` - Handle errors
- `verifyErrorMessage()` - Validate errors

## Usage Examples

### In Your Test Files:

```typescript
import { test, expect } from '@playwright/test';
import { testConfig } from '../config/test-config';
import { createLoginHelper } from '../helpers/login-helper';

test.describe('My Master Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginHelper = createLoginHelper(page);
    await loginHelper.loginAsValidUser();

    // Navigate to your master - using relative URL!
    await page.goto(testConfig.urls.masters.userMaster);
  });

  test('should work', async ({ page }) => {
    // Your test code here
  });
});
```

## Adding a New Master

### Step 1: Add URL to test-config.ts
```typescript
masters: {
  newMaster: '/new-master',  // Add this
}
```

### Step 2: (Optional) Add seed test in seed.spec.ts
```typescript
test('setup for new master tests', async ({ page }) => {
  const loginHelper = createLoginHelper(page);
  await loginHelper.loginAsValidUser();
  await page.goto(testConfig.urls.masters.newMaster);
  console.log('✓ Seed setup for New Master completed');
});
```

### Step 3: Create test file tests/masters/new-master.spec.ts
Use the template from user-master.spec.ts

## Benefits

| Before | After |
|--------|-------|
| `await page.goto('https://stage.elevatorplus.net/login')` | `await page.goto('/login')` |
| URL hardcoded in every test | One source of truth |
| Login code repeated everywhere | `await loginHelper.loginAsValidUser()` |
| Credentials scattered | All in `testConfig.credentials` |
| Hard to update URL when staging changes | Change in one place |

## Quick Reference

```typescript
// Navigate with relative URLs
await page.goto('/login');                    // Uses baseURL
await page.goto(testConfig.urls.login);       // Also works

// Login helper
const loginHelper = createLoginHelper(page);
await loginHelper.loginAsValidUser();
await loginHelper.loginWithMobile('9876543210', 'password123');

// Access credentials
testConfig.credentials.validUser.mobile
testConfig.credentials.validUser.password

// Access URLs
testConfig.urls.baseUrl
testConfig.urls.masters.userMaster
testConfig.urls.masters.employeeMaster
```
