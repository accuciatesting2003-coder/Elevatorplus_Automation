# ElevatorPlus Login Test Plan

## Application Overview

ElevatorPlus Login Page - A mobile number-based authentication system with country code selection. The login flow requires users to enter their mobile number with a country code prefix. After entering a valid mobile number, users click the Login button to proceed to OTP verification. The page includes a Forgot Password link for password recovery and supports multiple country codes.

## Test Scenarios

### 1. Positive Test Cases

**Seed:** `tests/seed.spec.ts`

#### 1.1. Login with valid mobile number - Existing user

**File:** `tests/login/positive/login-valid-existing-user.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter a valid 10-digit mobile number in the mobile number field
  3. Click the Login button
  4. Verify that the user is redirected to OTP verification page or appropriate next step
  5. Verify success message or appropriate indication of progress

**Expected Results:**
  - Login button should be clickable after entering valid number
  - User should be redirected to OTP verification page
  - No error messages should be displayed
  - Progress indicator or success message should appear

#### 1.2. Login with valid mobile number - Different country codes

**File:** `tests/login/positive/login-different-country-codes.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Click on the country selector button
  3. Select different countries from the dropdown (e.g., India +91, United Kingdom +44, UAE +971)
  4. Enter valid mobile number for selected country
  5. Click the Login button
  6. Verify the country code is properly applied

**Expected Results:**
  - Country selector should show list of all countries
  - Selected country code should be displayed
  - Mobile number should be formatted according to selected country
  - Login should proceed with correct country code

#### 1.3. Verify Forgot Password link navigation

**File:** `tests/login/positive/forgot-password-link.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Click on the 'Forgot Password?' link
  3. Verify navigation to forgot password page

**Expected Results:**
  - User should be redirected to /forgot-password page
  - Forgot password page should display email input field
  - Back to login link should be available

#### 1.4. Verify logo navigation to home

**File:** `tests/login/positive/logo-home-navigation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Click on the ElevatorPlus logo
  3. Verify navigation to home page

**Expected Results:**
  - User should be redirected to home page (/)

### 2. Negative Test Cases

**Seed:** `tests/seed.spec.ts`

#### 2.1. Login with empty mobile number

**File:** `tests/login/negative/login-empty-mobile.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Leave the mobile number field empty
  3. Click the Login button

**Expected Results:**
  - Validation error message 'Enter a valid mobile number' should be displayed
  - User should remain on the login page
  - No navigation should occur

#### 2.2. Login with invalid mobile number format

**File:** `tests/login/negative/login-invalid-format.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter less than 10 digits (e.g., 123)
  3. Click the Login button

**Expected Results:**
  - Validation error should be displayed
  - User should remain on the login page
  - No API call should be made for invalid format

#### 2.3. Login with non-existent user

**File:** `tests/login/negative/login-non-existent-user.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter a valid format mobile number that doesn't exist in system
  3. Click the Login button

**Expected Results:**
  - Error alert 'User does not exists' should be displayed
  - User should remain on the login page
  - Error message should be dismissible

#### 2.4. Login with special characters in mobile number

**File:** `tests/login/negative/login-special-characters.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter special characters in the mobile field (e.g., !@#$%)
  3. Click the Login button

**Expected Results:**
  - Special characters should not be accepted
  - Validation error should be displayed
  - User should remain on login page

#### 2.5. Login with extremely long mobile number

**File:** `tests/login/negative/login-long-number.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter more than 15 digits in mobile number field
  3. Click the Login button

**Expected Results:**
  - Field should truncate or show validation error
  - Login should not proceed
  - Appropriate error message should be displayed

#### 2.6. Verify search functionality in country selector

**File:** `tests/login/negative/country-selector-search.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Click on country selector button
  3. Type in the search box to filter countries
  4. Verify search results
  5. Try searching for non-existent country

**Expected Results:**
  - Country list should filter based on search input
  - Search should work for valid country names
  - No results or appropriate message for invalid search

### 3. UI and UX Test Cases

**Seed:** `tests/seed.spec.ts`

#### 3.1. Verify mobile number auto-formatting

**File:** `tests/login/ui/mobile-auto-formatting.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Start typing a mobile number
  3. Observe the auto-formatting behavior
  4. Try entering numbers rapidly
  5. Try deleting and re-entering numbers

**Expected Results:**
  - Mobile number should be formatted according to country code
  - Format should apply automatically as user types
  - Formatting should handle edge cases like backspace

#### 3.2. Verify error message display and dismissal

**File:** `tests/login/ui/error-message-display.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Trigger an error (non-existent user)
  3. Observe error message display
  4. Click the close button on error alert

**Expected Results:**
  - Error alert should be clearly visible
  - Error should contain descriptive message
  - Close button should dismiss the error
  - After dismissal, form should be ready for new input

#### 3.3. Verify responsive design on different screen sizes

**File:** `tests/login/ui/responsive-design.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Resize browser to mobile viewport (375x667)
  3. Verify layout and element sizes
  4. Resize to tablet viewport (768x1024)
  5. Verify layout adaptation
  6. Resize to desktop viewport (1920x1080)
  7. Verify desktop layout

**Expected Results:**
  - All elements should be properly visible on mobile
  - Touch targets should be appropriately sized on mobile
  - Layout should adapt properly on tablet
  - Desktop layout should utilize available space appropriately

#### 3.4. Verify keyboard navigation and accessibility

**File:** `tests/login/ui/keyboard-navigation.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Use Tab key to navigate through form elements
  3. Verify focus indicators
  4. Use Enter key to submit form
  5. Use Escape key to close dropdowns/modals

**Expected Results:**
  - Tab order should be logical (mobile field -> country selector -> login button -> forgot password)
  - Focus should be clearly visible on all interactive elements
  - Enter key should submit the form from mobile field
  - Escape key should close country selector dropdown

#### 3.5. Verify country selector search functionality

**File:** `tests/login/ui/country-selector-search.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Click on country selector button
  3. Type country name in search box (e.g., 'India')
  4. Verify filtered results
  5. Clear search and verify all countries shown

**Expected Results:**
  - Search box should be focused when dropdown opens
  - Typing should filter country list in real-time
  - Matching countries should be highlighted or shown first
  - Clearing search should restore full list

### 4. Security Test Cases

**Seed:** `tests/seed.spec.ts`

#### 4.1. Verify SQL injection attempts in mobile field

**File:** `tests/login/security/sql-injection.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter SQL injection payloads in mobile field (e.g., ' OR 1=1 --', '; DROP TABLE users--')
  3. Click the Login button

**Expected Results:**
  - Input should be sanitized or rejected
  - No database errors should be exposed to user
  - Generic error message should be displayed
  - Application should not crash or behave unexpectedly

#### 4.2. Verify XSS attempts in mobile field

**File:** `tests/login/security/xss-attempt.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter XSS payloads in mobile field (e.g., <script>alert('xss')</script>)
  3. Click the Login button

**Expected Results:**
  - Scripts should not be executed
  - Input should be sanitized
  - Error message should not contain raw input
  - No XSS vulnerabilities should be exploitable

#### 4.3. Verify rate limiting on login attempts

**File:** `tests/login/security/rate-limiting.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter invalid mobile number
  3. Click Login button multiple times rapidly (e.g., 10 times in 10 seconds)
  4. Observe response after multiple attempts

**Expected Results:**
  - After threshold, requests should be rate limited
  - Appropriate rate limit message should be displayed
  - IP or device should be temporarily blocked
  - System should recover after rate limit period

#### 4.4. Verify API endpoint security

**File:** `tests/login/security/api-security.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Open network tab in browser DevTools
  3. Enter mobile number and click Login
  4. Inspect the API request and response
  5. Verify no sensitive data in URL parameters
  6. Verify proper HTTPS is used

**Expected Results:**
  - API endpoint should use HTTPS
  - Mobile number should be in request body, not URL
  - Response should not expose sensitive system information
  - Proper error handling should be in place

### 5. Integration Test Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. Complete login flow with OTP

**File:** `tests/login/integration/complete-login-flow.spec.ts`

**Steps:**
  1. Navigate to https://stage.elevatorplus.net/login
  2. Enter valid registered mobile number
  3. Click Login button
  4. Verify OTP page is loaded
  5. Enter valid OTP (if available in test environment)
  6. Complete the authentication flow
  7. Verify user is logged in and redirected appropriately

**Expected Results:**
  - Seamless transition from login to OTP page
  - OTP page should display the mobile number
  - Successful OTP verification should log user in
  - User should be redirected to dashboard or home page
  - Session should be established

#### 5.2. Forgot password flow integration

**File:** `tests/login/integration/forgot-password-flow.spec.ts`

**Steps:**
  1. Navigate to login page
  2. Click Forgot Password link
  3. Enter email address
  4. Submit forgot password request
  5. Navigate back to login
  6. Verify login flow still works

**Expected Results:**
  - Forgot password flow should complete successfully
  - Navigation back to login should work
  - Login should be possible after password reset
