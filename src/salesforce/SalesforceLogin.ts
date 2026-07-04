import { loginPage } from '../pages/LoginPage';
import { Config } from '../utils/config';
import { Logger } from '../utils/Logger';
import { ConfigurationError } from '../exceptions/FrameworkError';

export class SalesforceLogin {
  // Static service class — not meant to be instantiated
  private constructor() {}

  static async loginWithValidCredentials(): Promise<void> {
    try {
      Logger.info('Attempting login with valid credentials');
      const domain = this.extractDomainFromUrl(Config.SF_LOGIN_URL);
      await loginPage.login(Config.SF_USERNAME, Config.SF_PASSWORD, domain);
      Logger.pass('Successfully logged in with valid credentials');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.fail(`Failed to login with valid credentials: ${errorMessage}`);
      throw error;
    }
  }

  static async loginWithInvalidPassword(): Promise<void> {
    try {
      Logger.info('Attempting login with invalid password');
      const domain = this.extractDomainFromUrl(Config.SF_LOGIN_URL);
      await loginPage.login(Config.SF_USERNAME, 'InvalidPassword123', domain);
      Logger.pass('Login attempt with invalid password completed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.info(`Expected error on invalid password login: ${errorMessage}`);
    }
  }

  static async loginWithInvalidUsername(): Promise<void> {
    try {
      Logger.info('Attempting login with invalid username');
      const domain = this.extractDomainFromUrl(Config.SF_LOGIN_URL);
      await loginPage.login('invalid@test.com', Config.SF_PASSWORD, domain);
      Logger.pass('Login attempt with invalid username completed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.info(`Expected error on invalid username login: ${errorMessage}`);
    }
  }

  private static extractDomainFromUrl(url: string): string {
    try {
      Logger.debug(`Extracting domain from URL: ${url}`);
      // The custom domain field appends ".my.salesforce.com", so capture everything before it
      // e.g. https://orgname.develop.my.salesforce.com -> orgname.develop
      const domainMatch = url.match(/https:\/\/(.+)\.my\.salesforce\.com/);
      if (domainMatch && domainMatch[1]) {
        const domain = domainMatch[1];
        Logger.debug(`Extracted domain: ${domain}`);
        return domain;
      }
      throw new ConfigurationError(`Could not extract domain from URL: ${url} — SF_LOGIN_URL must be a my.salesforce.com URL`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to extract domain: ${errorMessage}`);
      throw error;
    }
  }
}
