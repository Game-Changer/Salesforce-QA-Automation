import { BrowserManager } from '../utils/BrowserManager';
import { Logger } from '../utils/Logger';

/**
 * Abstract base for all Page Objects.
 *
 * Provides the behavior every page shares (navigation, title/URL access)
 * and defines the contract each concrete page must fulfil: what "this page
 * has loaded" means for it (polymorphic waitForPageLoad).
 */
export abstract class BasePage {
  /** Human-readable page name used in log output */
  protected abstract get pageName(): string;

  /** Each page defines its own readiness check */
  abstract waitForPageLoad(): Promise<void>;

  protected async open(url: string): Promise<void> {
    try {
      Logger.info(`Navigating to ${this.pageName}`);
      await BrowserManager.navigateTo(url);
      Logger.pass(`Successfully navigated to ${this.pageName}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to navigate to ${this.pageName}: ${errorMessage}`);
      throw error;
    }
  }

  async getPageTitle(): Promise<string> {
    try {
      Logger.info(`Retrieving ${this.pageName} title`);
      const title = await BrowserManager.getPageTitle();
      Logger.pass(`${this.pageName} title retrieved: ${title}`);
      return title;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to retrieve ${this.pageName} title: ${errorMessage}`);
      throw error;
    }
  }

  getCurrentUrl(): string {
    try {
      return BrowserManager.getCurrentUrl();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to read current URL on ${this.pageName}: ${errorMessage}`);
      throw error;
    }
  }
}
