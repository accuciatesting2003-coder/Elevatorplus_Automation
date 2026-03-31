# 🌍 Environment Configuration Guide

## Current Setup

Your project uses **environment-specific configuration files**:

```
.dev.env      → Development/Staging environment (default)
.prod.env     → Production environment
.env.example  → Template file (safe to commit)
```

## How It Works

### 1. Environment File Selection

The `playwright.config.ts` automatically loads the correct file:

```typescript
const envFile = process.env.TEST_ENV === 'prod' ? '.prod.env' : '.dev.env';
dotenv.config({ path: envFile });
```

**Default**: Uses `.dev.env` (staging)
**Production**: Uses `.prod.env` when `TEST_ENV=prod`

### 2. Running Tests in Different Environments

```bash
# Run in DEV/Staging (default)
npx playwright test

# Run in PRODUCTION
TEST_ENV=prod npx playwright test
```

## Environment File Structure

Each environment file (`.dev.env`, `.prod.env`) must contain:

```env
BASE_URL=https://your-domain.com
MOBILE_NUMBER=1234567890
PASSWORD=your-password
```

### Current Environments:

**Development (`.dev.env`)**:
- URL: `https://stage.elevatorplus.net`
- User credentials for staging environment

**Production (`.prod.env`)**:
- URL: `https://demo1.elevatorplus.net`
- User credentials for production environment

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.dev.env` and `.prod.env` in `.gitignore`
- ✅ Store credentials securely (password manager, secrets vault)
- ✅ Use different credentials for each environment
- ✅ Commit `.env.example` as a template
- ✅ Share credential securely with team (1Password, Vault, etc.)

### ❌ DON'T:
- ❌ Commit `.dev.env` or `.prod.env` to git
- ❌ Share credentials in Slack, email, or chat
- ❌ Use production credentials in development
- ❌ Hardcode credentials in test files

## 📋 Setup for New Team Members

1. Copy the example file:
   ```bash
   cp .env.example .dev.env
   cp .env.example .prod.env
   ```

2. Get credentials from team lead (securely)

3. Fill in the actual values:
   ```bash
   # Edit .dev.env
   BASE_URL=https://stage.elevatorplus.net
   MOBILE_NUMBER=<staging-user>
   PASSWORD=<staging-password>

   # Edit .prod.env
   BASE_URL=https://demo1.elevatorplus.net
   MOBILE_NUMBER=<prod-user>
   PASSWORD=<prod-password>
   ```

4. Run tests:
   ```bash
   npx playwright test  # Uses .dev.env
   ```

## 🗑️ Removed Files

### `.env` - REMOVED ✅
**Why?**
- Not used by Playwright config
- Different structure (TEST_URL vs BASE_URL)
- Caused confusion with 3 env files
- Redundant with `.dev.env` and `.prod.env`

## 🔐 Git Protection

The `.gitignore` is configured to protect all environment files:

```gitignore
# Environment files with sensitive credentials
.env
.env.*
!.env.example
```

This means:
- ✅ `.env.example` can be committed (safe template)
- 🔒 `.dev.env` is ignored (contains credentials)
- 🔒 `.prod.env` is ignored (contains credentials)
- 🔒 Any `.env.*` files are ignored

## 🚀 CI/CD Setup

For automated testing in CI/CD pipelines:

```yaml
# GitHub Actions example
env:
  BASE_URL: ${{ secrets.BASE_URL }}
  MOBILE_NUMBER: ${{ secrets.MOBILE_NUMBER }}
  PASSWORD: ${{ secrets.PASSWORD }}
```

Store credentials in:
- GitHub Secrets (GitHub Actions)
- Environment Variables (GitLab CI)
- Secrets Manager (AWS, Azure, GCP)

## 📝 Quick Reference

| Command | Environment | File Used |
|---------|-------------|-----------|
| `npx playwright test` | Staging | `.dev.env` |
| `TEST_ENV=prod npx playwright test` | Production | `.prod.env` |
| `npx playwright test --headed` | Staging | `.dev.env` |
| `TEST_ENV=prod npx playwright test --headed` | Production | `.prod.env` |

## ✅ Verification

Check your current environment:
```bash
# See which file is being used
cat .dev.env

# Verify BASE_URL is loaded
npx playwright test --grep "authenticate" --project=setup
```

The authentication setup will show which URL it's using.

## 🆘 Troubleshooting

### "Cannot find module '.env'"
**Solution**: The `.env` file was removed. Use `.dev.env` or `.prod.env` instead. ✅

### "Login failed: User does not exist"
**Solution**: Check if credentials in `.dev.env` or `.prod.env` match the environment you're testing.

### "BASE_URL is undefined"
**Solution**: Make sure your environment file has `BASE_URL` (not `TEST_URL`).

### Want to add a new environment?
1. Create `.staging.env` or `.qa.env`
2. Update `playwright.config.ts`:
   ```typescript
   const envFile =
     process.env.TEST_ENV === 'prod' ? '.prod.env' :
     process.env.TEST_ENV === 'staging' ? '.staging.env' :
     '.dev.env';
   ```
3. Run with: `TEST_ENV=staging npx playwright test`

---

**Summary**: Your environment setup is now clean, secure, and follows best practices! 🎉
