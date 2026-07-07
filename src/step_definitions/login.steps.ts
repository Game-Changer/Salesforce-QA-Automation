import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';

// Browser automation steps (navigation, Lightning rendering) regularly exceed
// Cucumber's 5s default step timeout
setDefaultTimeout(60 * 1000);
import { BrowserManager } from '../utils/BrowserManager';
import { loginPage } from '../pages/LoginPage';
import { homePage } from '../pages/HomePage';
import { SalesforceLogin } from '../salesforce/SalesforceLogin';
import { Logger } from '../utils/Logger';
import { Config } from '../utils/config';

Before(async function () {
  try {
    Logger.info('========== Starting Test Scenario ==========');
    Config.validate();
    await BrowserManager.launchBrowser();
    Logger.pass('Browser launched successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Setup failed: ${errorMessage}`);
    throw error;
  }
});

After(async function () {
  try {
    Logger.info('========== Closing Browser ==========');
    await BrowserManager.closeBrowser();
    Logger.pass('Browser closed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Teardown failed: ${errorMessage}`);
  }
});

// --- Navigation + page validation ------------------------------------------

Given('User navigates to the Salesforce login page', async function () {
  try {
    await loginPage.navigateToLoginPage();
    Logger.pass('User successfully navigated to login page');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to navigate to login page: ${errorMessage}`);
    throw error;
  }
});

Then('User is on the Salesforce login page', async function () {
  try {
    await loginPage.verifyOnLoginPage();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Login page validation failed: ${errorMessage}`);
    throw error;
  }
});

When('User clicks the Use Custom Domain link', async function () {
  try {
    await loginPage.clickUseCustomDomain();
    Logger.pass('User clicked the Use Custom Domain link');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to click Use Custom Domain link: ${errorMessage}`);
    throw error;
  }
});

Then('User is navigated to the Custom Domain page', async function () {
  try {
    await loginPage.verifyOnCustomDomainPage();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Custom Domain page validation failed: ${errorMessage}`);
    throw error;
  }
});

When('User enters the custom domain from environment', async function () {
  try {
    const loginUrl = Config.SF_LOGIN_URL;
    // The custom domain field appends ".my.salesforce.com", so capture everything before it
    // e.g. https://orgname.develop.my.salesforce.com -> orgname.develop
    const domainMatch = loginUrl.match(/https:\/\/(.+)\.my\.salesforce\.com/);
    if (!domainMatch || !domainMatch[1]) {
      throw new Error(`Could not extract domain from URL: ${loginUrl}`);
    }
    await loginPage.enterCustomDomain(domainMatch[1]);
    Logger.pass('User entered the custom domain from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter custom domain: ${errorMessage}`);
    throw error;
  }
});

When('User enters custom domain {string}', async function (domain: string) {
  try {
    await loginPage.enterCustomDomain(domain);
    Logger.pass('User entered custom domain');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter custom domain: ${errorMessage}`);
    throw error;
  }
});

When('User clicks the Continue button', async function () {
  try {
    await loginPage.clickContinue();
    Logger.pass('User clicked the Continue button');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to click Continue: ${errorMessage}`);
    throw error;
  }
});

Then('User is navigated to the org login page', async function () {
  try {
    await loginPage.verifyOnOrgLoginPage();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Org login page validation failed: ${errorMessage}`);
    throw error;
  }
});

// --- Credentials ------------------------------------------------------------

When('User enters the valid username from environment', async function () {
  try {
    await loginPage.enterUsername(Config.SF_USERNAME);
    Logger.pass('User entered the username from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter username: ${errorMessage}`);
    throw error;
  }
});

When('User enters username {string}', async function (username: string) {
  try {
    await loginPage.enterUsername(username);
    Logger.pass('User entered username');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter username: ${errorMessage}`);
    throw error;
  }
});

When('User enters the valid password from environment', async function () {
  try {
    await loginPage.enterPassword(Config.SF_PASSWORD);
    Logger.pass('User entered the password from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter password: ${errorMessage}`);
    throw error;
  }
});

When('User enters password {string}', async function (password: string) {
  try {
    await loginPage.enterPassword(password);
    Logger.pass('User entered password');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter password: ${errorMessage}`);
    throw error;
  }
});

When('User clicks the Log In button', async function () {
  try {
    await loginPage.clickLogin();
    Logger.pass('User clicked the Log In button');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to click Log In: ${errorMessage}`);
    throw error;
  }
});

// --- End-state validations ---------------------------------------------------

Then('User validates the Salesforce home page is loaded', async function () {
  try {
    await homePage.verifyHomePageLoaded();
    Logger.pass('User validated the Salesforce home page is loaded');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Home page validation failed: ${errorMessage}`);
    throw error;
  }
});

Then('User validates the login error message is displayed', async function () {
  try {
    const isVisible = await loginPage.isErrorMessageVisible();
    if (!isVisible) {
      throw new Error('Login error message is not visible');
    }
    const errorText = await loginPage.getErrorMessage();
    Logger.pass(`User validated the login error message: ${errorText}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Error message validation failed: ${errorMessage}`);
    throw error;
  }
});

// --- Composite flows ----------------------------------------------------------

Given('User logs in with valid credentials', async function () {
  try {
    await SalesforceLogin.loginWithValidCredentials();
    Logger.pass('User logged in successfully with valid credentials');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Login with valid credentials failed: ${errorMessage}`);
    throw error;
  }
});
