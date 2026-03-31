# Playwright Authentication Setup

This project uses Playwright's `storageState` feature for efficient authentication across tests.

## How It Works

### 1. **Global Setup** (`tests/setup/auth.setup.ts`)
- Runs **once** before all tests
- Logs in with credentials from `.env` file
- Saves the authenticated session to `.auth/user.json`
- All subsequent tests reuse this session

### 2. **Test Projects** (`playwright.config.ts`)
- **`setup`** - Runs the authentication setup first
- **`chromium`, `firefox`, `webkit`** - Use the saved authentication state
- **`chromium-no-auth`** - Runs login tests without authentication

## Benefits

✅ **Faster Tests** - Login happens once, not for every test
✅ **More Reliable** - No repeated login attempts that could fail
✅ **Cleaner Tests** - No login boilerplate in every test file
✅ **Parallel Execution** - All tests can run in parallel while authenticated

## Usage

### Running Authenticated Tests

```bash
# Run all tests (setup runs automatically first)
npx playwright test

# Run specific test file (uses saved authentication)
npx playwright test tests/example-authenticated.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
```

### Running Login Tests (No Auth)

```bash
# Login tests run without pre-authentication
npx playwright test tests/login.spec.ts --project=chromium-no-auth
```

### Force Re-Authentication

If you need to login again (e.g., credentials changed):

```bash
# Delete the saved auth state
rm -rf .auth/

# Run tests again - setup will re-authenticate
npx playwright test
```

## File Structure

```
playwright-project/
├── .auth/
│   └── user.json              # Saved authentication state (gitignored)
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts      # Global authentication setup
│   ├── login.spec.ts          # Login tests (no auth)
│   └── example-authenticated.spec.ts  # Tests using auth
└── playwright.config.ts       # Config with setup project
```

## Writing Authenticated Tests

Simply write your test - authentication is automatic:

```typescript
import { test, expect } from '@playwright/test';

test('my authenticated test', async ({ page }) => {
  // User is already logged in!
  await page.goto('/protected-page');

  // Write your test...
});
```

## Environment Variables Required

Make sure these are in your `.env` file:

```env
BASE_URL=https://stage.elevatorplus.net
MOBILE_NUMBER=9209365301
PASSWORD=Shravani@123
```

## Troubleshooting

### Authentication fails during setup
- Check credentials in `.env` file
- Verify the login flow in `auth.setup.ts` matches your app
- Run setup in headed mode: `npx playwright test --project=setup --headed`

### Tests fail with "not logged in"
- Delete `.auth/` folder and run tests again
- Check if session expired (increase session timeout in app)

### Want to test as different users?
Create multiple auth setup files:
- `auth.admin.setup.ts` → `.auth/admin.json`
- `auth.user.setup.ts` → `.auth/user.json`

Then create separate projects in config for each role.

## Migration from seed.spec.ts

**Old approach (seed.spec.ts):**
```typescript
test('setup authenticated session', async ({ page }) => {
  await loginHelper.loginAsValidUser();
  // ... login logic
});
```

**New approach (automatic):**
```typescript
test('my test', async ({ page }) => {
  // Already logged in! Just use the app
  await page.goto('/dashboard');
});
```

No more seed files needed - authentication is handled globally! 🎉
