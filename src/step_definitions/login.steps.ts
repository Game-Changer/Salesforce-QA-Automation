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

Given('User navigates to Salesforce login page', async function () {
  try {
    await loginPage.navigateToLoginPage();
    Logger.pass('User successfully navigated to login page');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to navigate to login page: ${errorMessage}`);
    throw error;
  }
});

When('User selects custom domain option', async function () {
  try {
    await loginPage.clickUseCustomDomain();
    Logger.pass('User selected custom domain option');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to select custom domain: ${errorMessage}`);
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

When('User enters custom domain from environment', async function () {
  try {
    const loginUrl = Config.SF_LOGIN_URL;
    // The custom domain field appends ".my.salesforce.com", so capture everything before it
    // e.g. https://orgname.develop.my.salesforce.com -> orgname.develop
    const domainMatch = loginUrl.match(/https:\/\/(.+)\.my\.salesforce\.com/);
    if (!domainMatch || !domainMatch[1]) {
      throw new Error(`Could not extract domain from URL: ${loginUrl}`);
    }
    const domain = domainMatch[1];
    await loginPage.enterCustomDomain(domain);
    Logger.pass('User entered custom domain from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter custom domain: ${errorMessage}`);
    throw error;
  }
});

When('User clicks continue', async function () {
  try {
    await loginPage.clickContinue();
    Logger.pass('User clicked continue');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to click continue: ${errorMessage}`);
    throw error;
  }
});

When('User enters username {string}', async function (username: string) {
  try {
    await loginPage.enterUsername(username);
    Logger.pass(`User entered username`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter username: ${errorMessage}`);
    throw error;
  }
});

When('User enters valid username from environment', async function () {
  try {
    const username = Config.SF_USERNAME;
    await loginPage.enterUsername(username);
    Logger.pass('User entered username from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter username: ${errorMessage}`);
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

When('User enters valid password from environment', async function () {
  try {
    const password = Config.SF_PASSWORD;
    await loginPage.enterPassword(password);
    Logger.pass('User entered password from environment');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to enter password: ${errorMessage}`);
    throw error;
  }
});

When('User clicks login button', async function () {
  try {
    await loginPage.clickLogin();
    Logger.pass('User clicked login button');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Failed to click login button: ${errorMessage}`);
    throw error;
  }
});

Then('Login should be successful', async function () {
  try {
    await homePage.verifyHomePageLoaded();
    Logger.pass('Login successful - Home page verified');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Login was not successful: ${errorMessage}`);
    throw error;
  }
});

Then('Error message should be displayed', async function () {
  try {
    const isVisible = await loginPage.isErrorMessageVisible();
    if (isVisible) {
      const errorText = await loginPage.getErrorMessage();
      Logger.pass(`Error message displayed: ${errorText}`);
    } else {
      throw new Error('Error message is not visible');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.fail(`Error message verification failed: ${errorMessage}`);
    throw error;
  }
});

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
