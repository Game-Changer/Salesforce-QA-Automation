import { BrowserManager } from './BrowserManager';
import { Logger } from './Logger';
import { WaitTimeoutError } from '../exceptions/FrameworkError';

export class WaitUtils {
  // Static utility class — not meant to be instantiated
  private constructor() {}

  static async waitForText(locator: string, expectedText: string, timeout: number = 10000): Promise<void> {
    Logger.info(`Waiting for text "${expectedText}" in element: ${locator}`);
    const page = BrowserManager.getPage();
    try {
      await page.waitForFunction(
        ([sel, text]) => document.querySelector(sel)?.textContent?.includes(text),
        [locator, expectedText],
        { timeout }
      );
      Logger.info(`Text "${expectedText}" found successfully`);
    } catch (error: unknown) {
      Logger.error(`Text "${expectedText}" not found within ${timeout}ms`);
      throw new WaitTimeoutError(`Text "${expectedText}" not found in ${locator} within ${timeout}ms`, error);
    }
  }

  static async waitForElementToDisappear(locator: string, timeout: number = 10000): Promise<void> {
    Logger.info(`Waiting for element to disappear: ${locator}`);
    const page = BrowserManager.getPage();
    try {
      await page.waitForSelector(locator, { state: 'hidden', timeout });
      Logger.info(`Element disappeared successfully`);
    } catch (error: unknown) {
      Logger.error(`Element did not disappear within ${timeout}ms`);
      throw new WaitTimeoutError(`Element ${locator} did not disappear within ${timeout}ms`, error);
    }
  }

  static async waitForUrlChange(previousUrl: string, timeout: number = 10000): Promise<void> {
    Logger.info(`Waiting for URL change from: ${previousUrl}`);
    const page = BrowserManager.getPage();
    try {
      await page.waitForFunction(
        ([prevUrl]) => window.location.href !== prevUrl,
        [previousUrl],
        { timeout }
      );
      Logger.info(`URL changed to: ${page.url()}`);
    } catch (error: unknown) {
      Logger.error(`URL did not change within ${timeout}ms`);
      throw new WaitTimeoutError(`URL did not change from ${previousUrl} within ${timeout}ms`, error);
    }
  }

  static async waitForUrlContains(fragment: string, timeout: number = 30000): Promise<void> {
    await this.waitForUrlContainsAny([fragment], timeout);
  }

  static async waitForUrlContainsAny(fragments: string[], timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for URL to contain one of: ${fragments.map(f => `"${f}"`).join(', ')}`);
    const page = BrowserManager.getPage();
    try {
      await page.waitForURL(url => fragments.some(fragment => url.href.includes(fragment)), { timeout });
      Logger.info(`URL matched: ${page.url()}`);
    } catch (error: unknown) {
      Logger.error(`URL did not match any of [${fragments.join(', ')}] within ${timeout}ms. Current URL: ${page.url()}`);
      throw new WaitTimeoutError(`URL did not match any of [${fragments.join(', ')}] within ${timeout}ms`, error);
    }
  }

  static async waitForCondition(condition: () => Promise<boolean>, timeout: number = 10000): Promise<void> {
    try {
      Logger.info(`Waiting for condition to be true (timeout: ${timeout}ms)`);
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        if (await condition()) {
          Logger.info(`Condition met successfully`);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      throw new WaitTimeoutError(`Condition not met within ${timeout}ms`);
    } catch (error: unknown) {
      Logger.error(`Condition not met within ${timeout}ms`);
      if (error instanceof WaitTimeoutError) {
        throw error;
      }
      throw new WaitTimeoutError(`Condition evaluation failed within ${timeout}ms`, error);
    }
  }

  static async waitForElementEnabled(locator: string, timeout: number = 10000): Promise<void> {
    Logger.info(`Waiting for element to be enabled: ${locator}`);
    const page = BrowserManager.getPage();
    try {
      // Appending ":not([disabled])" breaks XPath locators, so wait for visibility
      // first and then poll the enabled state
      const element = page.locator(locator);
      await element.waitFor({ state: 'visible', timeout });
      const startTime = Date.now();
      while (!(await element.isEnabled())) {
        if (Date.now() - startTime > timeout) {
          throw new WaitTimeoutError(`Element ${locator} did not become enabled within ${timeout}ms`);
        }
        await page.waitForTimeout(100);
      }
      Logger.info(`Element is now enabled`);
    } catch (error: unknown) {
      Logger.error(`Element did not become enabled within ${timeout}ms`);
      if (error instanceof WaitTimeoutError) {
        throw error;
      }
      throw new WaitTimeoutError(`Element ${locator} did not become enabled within ${timeout}ms`, error);
    }
  }
}
