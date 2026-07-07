import { BasePage } from './BasePage';
import { InputUtils } from '../utils/InputUtils';
import { WaitUtils } from '../utils/WaitUtils';
import { Logger } from '../utils/Logger';
import { Config } from '../utils/config';
import { LoginPageLocator } from '../locators/LoginPageLocator';

export class LoginPage extends BasePage {
  protected get pageName(): string {
    return 'Salesforce login page';
  }

  async waitForPageLoad(): Promise<void> {
    try {
      await InputUtils.safeWaitForElement(LoginPageLocator.useCustomDomainLink, 'Use Custom Domain link');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Login page did not load: ${errorMessage}`);
      throw error;
    }
  }

  async navigateToLoginPage(): Promise<void> {
    try {
      await this.open('https://test.salesforce.com');
      await this.waitForPageLoad();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to navigate to login page: ${errorMessage}`);
      throw error;
    }
  }

  // --- Page-transition validations: prove the script is on the right page
  // --- before it continues (one verify per screen in the login flow)

  async verifyOnLoginPage(): Promise<void> {
    try {
      await this.waitForPageLoad();
      Logger.pass('Verified: user is on the Salesforce login page');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.fail(`Not on the Salesforce login page: ${errorMessage}`);
      throw error;
    }
  }

  async verifyOnCustomDomainPage(): Promise<void> {
    try {
      await InputUtils.safeWaitForElement(LoginPageLocator.customDomainInputField, 'Custom Domain input field');
      await InputUtils.safeWaitForElement(LoginPageLocator.continueButton, 'Continue button');
      Logger.pass('Verified: user is on the Custom Domain page');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.fail(`Not on the Custom Domain page: ${errorMessage}`);
      throw error;
    }
  }

  async verifyOnOrgLoginPage(): Promise<void> {
    try {
      const orgHost = new URL(Config.SF_LOGIN_URL).host;
      await WaitUtils.waitForUrlContains(orgHost);
      await InputUtils.safeWaitForElement(LoginPageLocator.usernameInputField, 'Username field');
      await InputUtils.safeWaitForElement(LoginPageLocator.passwordInputField, 'Password field');
      Logger.pass(`Verified: user is on the org login page (${orgHost})`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.fail(`Not on the org login page: ${errorMessage}`);
      throw error;
    }
  }

  async clickUseCustomDomain(): Promise<void> {
    try {
      await InputUtils.safeClick(LoginPageLocator.useCustomDomainLink, 'Clicking Use Custom Domain link');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to click Use Custom Domain link: ${errorMessage}`);
      throw error;
    }
  }

  async enterCustomDomain(domain: string): Promise<void> {
    try {
      await InputUtils.safeEnterText(LoginPageLocator.customDomainInputField, domain, `custom domain: ${domain}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to enter custom domain: ${errorMessage}`);
      throw error;
    }
  }

  async clickContinue(): Promise<void> {
    try {
      await InputUtils.safeClick(LoginPageLocator.continueButton, 'Clicking Continue button');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to click Continue button: ${errorMessage}`);
      throw error;
    }
  }

  async enterUsername(username: string): Promise<void> {
    try {
      await InputUtils.safeEnterText(LoginPageLocator.usernameInputField, username, 'username');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to enter username: ${errorMessage}`);
      throw error;
    }
  }

  async enterPassword(password: string): Promise<void> {
    try {
      await InputUtils.safeEnterText(LoginPageLocator.passwordInputField, password, 'password');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to enter password: ${errorMessage}`);
      throw error;
    }
  }

  async clickLogin(): Promise<void> {
    try {
      await InputUtils.safeClick(LoginPageLocator.loginButton, 'Clicking Login button');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to click Login button: ${errorMessage}`);
      throw error;
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      return await InputUtils.safeGetText(LoginPageLocator.errorMessage, 'error message');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to retrieve error message: ${errorMessage}`);
      throw error;
    }
  }

  async isErrorMessageVisible(): Promise<boolean> {
    try {
      return await InputUtils.safeIsVisible(LoginPageLocator.errorMessage, 'error message');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to check error message visibility: ${errorMessage}`);
      throw error;
    }
  }

  async login(username: string, password: string, domain: string): Promise<void> {
    try {
      Logger.info('Starting login flow');
      await this.navigateToLoginPage();
      await this.clickUseCustomDomain();
      await this.enterCustomDomain(domain);
      await this.clickContinue();
      await WaitUtils.waitForElementEnabled(LoginPageLocator.usernameInputField);
      await this.enterUsername(username);
      await this.enterPassword(password);
      await this.clickLogin();
      Logger.pass('Login flow completed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.fail(`Login flow failed: ${errorMessage}`);
      throw error;
    }
  }
}

// Singleton instance shared by step definitions and services
export const loginPage = new LoginPage();
