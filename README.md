# 🎭 Playwright Test Automation - ElevatorPlus

End-to-end test automation for ElevatorPlus application using Playwright with TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests (auto-authenticates first)
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed
```

## 📋 Features

✅ **Automatic Authentication** - Login once, reuse session across all tests
✅ **Multi-Environment Support** - Dev/Staging and Production configurations
✅ **Parallel Execution** - Fast test runs with parallel execution
✅ **Cross-Browser Testing** - Chromium, Firefox, and WebKit
✅ **Rich Reporting** - HTML reports with screenshots and videos
✅ **Type Safety** - Full TypeScript support

## 📁 Project Structure

```
playwright-project/
├── docs/                           # 📚 Documentation
│   ├── QUICK-START.md             # Quick reference guide
│   ├── AUTH-SETUP-README.md       # Authentication system guide
│   ├── ENVIRONMENT-SETUP.md       # Environment configuration
│   └── SETUP-SUMMARY.md           # Setup overview
├── tests/                          # 🧪 Test files
│   ├── setup/
│   │   └── auth.setup.ts          # Global authentication setup
│   ├── login.spec.ts              # Login tests (no auth)
│   └── example-authenticated.spec.ts  # Authenticated tests
├── test-plans/                     # 📝 Test plan documents
├── .auth/                          # 🔒 Saved authentication state (gitignored)
├── .env.example                    # Template for environment variables
├── .dev.env                        # Development/Staging config (gitignored)
├── .prod.env                       # Production config (gitignored)
├── playwright.config.ts            # Playwright configuration
└── package.json                    # Dependencies
```

## 🌍 Environment Configuration

The project supports multiple environments:

```bash
# Run in development/staging (default)
npx playwright test

# Run in production
TEST_ENV=prod npx playwright test
```

### Setup Environment Files

1. Copy the example file:
   ```bash
   cp .env.example .dev.env
   cp .env.example .prod.env
   ```

2. Fill in your credentials:
   ```env
   BASE_URL=https://stage.elevatorplus.net
   MOBILE_NUMBER=1234567890
   PASSWORD=your-password
   ```

See [docs/ENVIRONMENT-SETUP.md](docs/ENVIRONMENT-SETUP.md) for details.

## 🔐 Authentication

This project uses Playwright's `storageState` for efficient authentication:

- ✅ Login happens **once** before all tests
- ✅ Session is **reused** across all tests
- ✅ No login boilerplate in test files
- ✅ Tests run much **faster**

**Write tests without worrying about authentication:**

```typescript
test('my test', async ({ page }) => {
  await page.goto('/user-master');
  // You're already logged in!
});
```

See [docs/AUTH-SETUP-README.md](docs/AUTH-SETUP-README.md) for details.

## 🧪 Running Tests

```bash
# All tests (with authentication)
npx playwright test

# Specific test file
npx playwright test tests/example-authenticated.spec.ts

# Specific browser
npx playwright test --project=chromium

# Login tests (without authentication)
npx playwright test tests/login.spec.ts --project=chromium-no-auth

# Debug mode
npx playwright test --debug

# Show report
npx playwright show-report
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test execution status
- Screenshots on failure
- Video recordings
- Network logs
- Console logs

## 🔧 Configuration

The `playwright.config.ts` includes:

- **4 Projects**: `setup`, `chromium`, `firefox`, `webkit`, `chromium-no-auth`
- **Auto-retry**: Failed tests retry in CI
- **Parallel execution**: Maximum performance
- **Rich artifacts**: Screenshots, videos, traces
- **Environment-based**: Switches between `.dev.env` and `.prod.env`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK-START.md](docs/QUICK-START.md) | Quick reference for common commands |
| [AUTH-SETUP-README.md](docs/AUTH-SETUP-README.md) | Authentication system explained |
| [ENVIRONMENT-SETUP.md](docs/ENVIRONMENT-SETUP.md) | Environment configuration guide |
| [SETUP-SUMMARY.md](docs/SETUP-SUMMARY.md) | Complete setup overview |

## 🛠️ Tech Stack

- **Playwright** - Browser automation framework
- **TypeScript** - Type-safe test code
- **dotenv** - Environment variable management
- **Node.js** - Runtime environment

## 📝 Writing Tests

### Authenticated Tests (Most Common)

```typescript
import { test, expect } from '@playwright/test';

test('verify user master page', async ({ page }) => {
  await page.goto('/user-master');

  await expect(page.getByRole('heading', { name: 'User Master' }))
    .toBeVisible();
});
```

### Non-Authenticated Tests (Login, Public Pages)

Use the `chromium-no-auth` project for tests that shouldn't use authentication:

```typescript
test('login page loads', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('button', { name: 'Login' }))
    .toBeVisible();
});
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Write tests following existing patterns
3. Run tests locally before pushing
4. Ensure all tests pass in CI

## 🆘 Troubleshooting

### Authentication fails
```bash
# Delete saved auth and retry
rm -rf .auth/
npx playwright test
```

### Tests fail with "not logged in"
Check that your `.dev.env` or `.prod.env` has correct credentials.

### "Cannot find module" errors
```bash
npm install
```

### Want to see tests run?
```bash
npx playwright test --headed
```

## 📞 Support

- Check [docs/](docs/) for detailed guides
- Review test plans in [test-plans/](test-plans/)
- Run `npx playwright test --help` for CLI options

## 🎯 Test Coverage

Current test suites:
- ✅ Login flow (positive, negative, security, edge cases)
- ✅ Authentication setup
- ✅ Example authenticated tests (User, Employee, Department masters)

## 🔄 CI/CD Integration

For CI/CD pipelines, set environment variables:

```yaml
env:
  BASE_URL: ${{ secrets.BASE_URL }}
  MOBILE_NUMBER: ${{ secrets.MOBILE_NUMBER }}
  PASSWORD: ${{ secrets.PASSWORD }}
```

## 📄 License

[Your License Here]

---

**Built with ❤️ using Playwright**

For detailed guides, see the [docs/](docs/) folder.
