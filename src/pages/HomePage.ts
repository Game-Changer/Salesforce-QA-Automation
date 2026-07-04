import { BasePage } from './BasePage';
import { BrowserManager } from '../utils/BrowserManager';
import { InputUtils } from '../utils/InputUtils';
import { WaitUtils } from '../utils/WaitUtils';
import { Logger } from '../utils/Logger';
import { Config } from '../utils/config';
import { HomePageLocator } from '../locators/HomePageLocator';

export class HomePage extends BasePage {
  protected get pageName(): string {
    return 'Salesforce home page';
  }

  async waitForPageLoad(): Promise<void> {
    try {
      // 1. A successful login lands on Lightning home or Classic home —
      //    both prove authentication succeeded
      await WaitUtils.waitForUrlContainsAny(['lightning.force.com', '/home/home.jsp']);

      // 2. If Salesforce dropped us on Classic, hop to Lightning for the final check
      if (this.getCurrentUrl().includes('/home/home.jsp')) {
        Logger.info('Landed on Classic home — navigating to Lightning');
        const lightningHome =
          Config.SF_LOGIN_URL.replace('.my.salesforce.com', '.lightning.force.com') + '/lightning/page/home';
        await BrowserManager.navigateTo(lightningHome);
      }

      // 3. The App Launcher waffle icon only renders once the user is authenticated
      await InputUtils.waitForElement(HomePageLocator.appLauncherIcon, 30000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Home page did not load: ${errorMessage}`);
      throw error;
    }
  }

  async verifyHomePageLoaded(): Promise<void> {
    try {
      Logger.info('Verifying home page is loaded');
      await this.waitForPageLoad();
      const title = await this.getPageTitle();
      Logger.pass(`Home page loaded successfully. URL: ${this.getCurrentUrl()} | Title: ${title}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Home page verification failed: ${errorMessage}`);
      throw error;
    }
  }

  async isAppLauncherVisible(): Promise<boolean> {
    try {
      return await InputUtils.safeIsVisible(HomePageLocator.appLauncherIcon, 'App Launcher icon');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to check App Launcher visibility: ${errorMessage}`);
      throw error;
    }
  }
}

// Singleton instance shared by step definitions and services
export const homePage = new HomePage();
