import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';
import { Logger } from './Logger';
import { BrowserError } from '../exceptions/FrameworkError';

export class BrowserManager {
  // Static lifecycle manager — not meant to be instantiated
  private constructor() {}

  private static browser: Browser | null = null;
  private static context: BrowserContext;
  private static page: Page;

  // Created by "npm run activate" — a browser profile Salesforce already
  // recognizes as an activated device, so tests skip the email verification.
  // Salesforce rotates the activation token on every login, so scenarios must
  // run sequentially in this one profile (parallel: 1 in cucumber.js) — copies
  // would be left holding a stale, already-consumed token.
  private static readonly PROFILE_DIR = path.resolve(__dirname, '../../.auth/chrome-profile');

  static async launchBrowser(): Promise<Page> {
    try {
      Logger.info('Launching browser...');
      const browserType = Config.BROWSER === 'firefox' ? firefox :
                         Config.BROWSER === 'webkit' ? webkit : chromium;

      if (fs.existsSync(this.PROFILE_DIR)) {
        Logger.info('Launching from activated browser profile');
        // Clear stale locks in case a previous run crashed
        for (const lockFile of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
          fs.rmSync(path.join(this.PROFILE_DIR, lockFile), { force: true });
        }
        this.context = await browserType.launchPersistentContext(this.PROFILE_DIR, {
          headless: !Config.HEADED,
        });
        this.browser = null;
        // Drop any session left by a previous scenario so tests always start
        // logged out; device activation cookies are untouched
        await this.context.clearCookies({ name: 'sid' });
        await this.context.clearCookies({ name: 'sid_Client' });
      } else {
        Logger.warn('No activated profile found — run "npm run activate" once if Salesforce asks for email verification');
        this.browser = await browserType.launch({
          headless: !Config.HEADED,
        });
        this.context = await this.browser.newContext();
      }
      Logger.info(`Browser launched in ${Config.HEADED ? 'headed' : 'headless'} mode`);

      this.page = this.context.pages()[0] ?? (await this.context.newPage());
      this.page.setDefaultTimeout(Config.TIMEOUT);
      Logger.info(`Page created with timeout: ${Config.TIMEOUT}ms`);

      return this.page;
    } catch (error: unknown) {
      Logger.error('Browser launch failed');
      throw new BrowserError('Failed to launch browser', error);
    }
  }

  static async navigateTo(url: string): Promise<void> {
    try {
      Logger.info(`Navigating to: ${url}`);
      await this.getPage().goto(url, { waitUntil: 'networkidle' });
      Logger.info(`Navigation complete. Current URL: ${this.page.url()}`);
    } catch (error: unknown) {
      Logger.error(`Navigation failed for URL: ${url}`);
      throw new BrowserError(`Failed to navigate to: ${url}`, error);
    }
  }

  static getPage(): Page {
    if (!this.page) {
      throw new BrowserError('Browser has not been launched — call launchBrowser() first');
    }
    return this.page;
  }

  static async getPageTitle(): Promise<string> {
    try {
      return await this.getPage().title();
    } catch (error: unknown) {
      Logger.error('Failed to read page title');
      throw new BrowserError('Failed to read page title', error);
    }
  }

  static getCurrentUrl(): string {
    try {
      return this.getPage().url();
    } catch (error: unknown) {
      Logger.error('Failed to read current URL');
      throw new BrowserError('Failed to read current URL', error);
    }
  }

  static async closeBrowser(): Promise<void> {
    try {
      Logger.info('Closing browser...');
      await this.context.close();
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      Logger.info('Browser closed');
    } catch (error: unknown) {
      Logger.error('Browser close failed');
      throw new BrowserError('Failed to close browser', error);
    }
  }
}
