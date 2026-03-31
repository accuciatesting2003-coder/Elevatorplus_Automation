/**
 * Test Data Management
 *
 * Centralized test data for consistent testing
 */

/**
 * User credentials for different environments
 */
export const testUsers = {
  validUser: {
    mobile: process.env.MOBILE_NUMBER || '9209365301',
    password: process.env.PASSWORD || 'Shravani@123',
  },
  invalidUser: {
    mobile: '1234567890',
    password: 'WrongPassword123',
  },
};

/**
 * Test mobile numbers for various scenarios
 */
export const testMobileNumbers = {
  valid: '9876543210',
  invalid: {
    tooShort: '123',
    tooLong: '123456789012345678',
    specialChars: '!@#$%^&*()',
    letters: 'abcdefghij',
  },
  nonExistent: '1234567890',
  inactive: '7499890080',
};

/**
 * Security test payloads
 */
export const securityPayloads = {
  sqlInjection: "' OR 1=1 --",
  xss: "<script>alert('xss')</script>",
  commandInjection: '; rm -rf /',
  pathTraversal: '../../../etc/passwd',
};

/**
 * Test URLs
 */
export const testUrls = {
  login: '/login',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  userMaster: '/user-master',
  employeeMaster: '/employee-master',
  departmentMaster: '/department-master',
};

/**
 * Common test messages
 */
export const testMessages = {
  errors: {
    userNotExist: 'User does not exists',
    invalidMobile: 'Enter a valid mobile number',
    userInactive: /not.*active.*user|inactive|deactivated|suspended|disabled|account.*not.*active/i,
  },
};

/**
 * Test timeouts (in milliseconds)
 */
export const testTimeouts = {
  short: 1000,
  medium: 3000,
  long: 5000,
  veryLong: 10000,
};

/**
 * Generate random test data
 */
export const generateTestData = {
  /**
   * Generate random mobile number
   */
  mobile: (): string => {
    return '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  },

  /**
   * Generate random email
   */
  email: (): string => {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  },

  /**
   * Generate random name
   */
  name: (): string => {
    const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  },

  /**
   * Generate random password
   */
  password: (): string => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },
};

/**
 * Sample user data for testing
 */
export const sampleUsers = {
  admin: {
    name: 'Accucia Test',
    email: 'sanjaynarwade@accucia.com',
    mobile: '9623568023',
    UserType: 'Admin',
  },
  employee: {
    name: 'Ganesh kadam',
    email: 'kadamshravani0703@gmail.com',
    mobile: '7499890089',
    UserType:'Service',
  },
};
