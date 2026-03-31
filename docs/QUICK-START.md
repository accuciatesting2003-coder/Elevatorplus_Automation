# 🚀 Quick Start - Playwright with Authentication

## Write Your First Authenticated Test

```typescript
import { test, expect } from '@playwright/test';

test('my feature test', async ({ page }) => {
  // You're already logged in! Just navigate and test
  await page.goto('/your-page');

  // Write your assertions
  await expect(page.getByRole('heading')).toBeVisible();
});
```

## Run Tests

```bash
# Run all tests (auto-authenticates first)
npx playwright test

# Run in headed mode to see the browser
npx playwright test --headed

# Run specific test file
npx playwright test tests/example-authenticated.spec.ts

# Run with UI mode (recommended for development)
npx playwright test --ui
```

## Project Structure

```
playwright-project/
├── .auth/user.json          # Saved login session (auto-generated)
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts    # Login happens here (automatic)
│   ├── login.spec.ts        # Tests login page (no auth)
│   └── *.spec.ts           # Your tests (auto-authenticated)
├── playwright.config.ts     # Config with auth setup
└── .env                     # Credentials (BASE_URL, MOBILE_NUMBER, PASSWORD)
```

## Common Commands

```bash
# First time setup (already done!)
npx playwright install

# Run tests
npx playwright test

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests without authentication (for login tests)
npx playwright test --project=chromium-no-auth

# Show test report
npx playwright show-report

# Debug tests
npx playwright test --debug

# Re-authenticate (if credentials change)
rm -rf .auth/ && npx playwright test
```

## That's It! 🎉

Authentication happens automatically. Just write tests and run them.

See `AUTH-SETUP-README.md` for detailed documentation.
