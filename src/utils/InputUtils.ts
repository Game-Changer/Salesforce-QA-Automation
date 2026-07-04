import { BrowserManager } from './BrowserManager';
import { Logger } from './Logger';
import { ElementActionError, FrameworkError, WaitTimeoutError } from '../exceptions/FrameworkError';

export class InputUtils {
    // Static utility class — not meant to be instantiated
    private constructor() {}

    static async click(locator: string): Promise<void> {
        try {
            Logger.info(`Clicking element: ${locator}`);
            const page = BrowserManager.getPage();
            await page.waitForSelector(locator, { timeout: 10000});
            await page.click(locator);
            Logger.info(`Element clicked successfully`);
        } catch (error: unknown) {
            Logger.error(`Click failed on element: ${locator}`);
            throw new ElementActionError(`Failed to click element: ${locator}`, error);
        }
    }

    static async enterText(locator: string, text: string): Promise<void> {
        try {
            Logger.info(`Entering text in element: ${locator}`);
            const page = BrowserManager.getPage();
            await page.waitForSelector(locator, { timeout: 10000});
            await page.fill(locator, text);
            Logger.info(`Text entered successfully`);
        } catch (error: unknown) {
            Logger.error(`Text entry failed on element: ${locator}`);
            throw new ElementActionError(`Failed to enter text in element: ${locator}`, error);
        }
    }

    static async clearField(locator: string): Promise<void> {
        try {
            const page = BrowserManager.getPage();
            await page.fill(locator, '');
        } catch (error: unknown) {
            Logger.error(`Clear failed on element: ${locator}`);
            throw new ElementActionError(`Failed to clear element: ${locator}`, error);
        }
    }

    static async getText(locator: string): Promise<string> {
        try {
            Logger.info(`Getting text from element: ${locator}`);
            const page = BrowserManager.getPage();
            const text = await page.textContent(locator) || '';
            Logger.info(`Text retrieved: ${text}`);
            return text;
        } catch (error: unknown) {
            Logger.error(`Text retrieval failed on element: ${locator}`);
            throw new ElementActionError(`Failed to get text from element: ${locator}`, error);
        }
    }

    static async isVisible(locator: string): Promise<boolean> {
        try {
            Logger.info(`Checking visibility of element: ${locator}`);
            const page = BrowserManager.getPage();
            try {
                await page.waitForSelector(locator, { timeout: 5000});
                Logger.info(`Element is visible`);
                return true;
            }
            catch {
                Logger.warn(`Element is not visible`);
                return false;
            }
        } catch (error: unknown) {
            Logger.error(`Visibility check failed on element: ${locator}`);
            throw new ElementActionError(`Failed to check visibility of element: ${locator}`, error);
        }
    }

    static async waitForElement(locator: string, timeout: number = 10000): Promise<void> {
        try {
            const page = BrowserManager.getPage();
            await page.waitForSelector(locator, { timeout });
        } catch (error: unknown) {
            Logger.error(`Element not found within ${timeout}ms: ${locator}`);
            throw new WaitTimeoutError(`Element not found within ${timeout}ms: ${locator}`, error);
        }
    }

    // Safe wrapper methods with try-catch and custom logging
    static async safeClick(locator: string, actionName: string): Promise<void> {
        try {
            Logger.info(actionName);
            await this.click(locator);
            Logger.pass(`${actionName} - Success`);
        } catch (error: unknown) {
            Logger.error(`${actionName} - Failed: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

    static async safeEnterText(locator: string, text: string, fieldName: string): Promise<void> {
        try {
            Logger.info(`Entering ${fieldName}`);
            await this.enterText(locator, text);
            Logger.pass(`${fieldName} entered successfully`);
        } catch (error: unknown) {
            Logger.error(`Failed to enter ${fieldName}: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

    static async safeClearField(locator: string, fieldName: string): Promise<void> {
        try {
            Logger.info(`Clearing ${fieldName}`);
            await this.clearField(locator);
            Logger.pass(`${fieldName} cleared successfully`);
        } catch (error: unknown) {
            Logger.error(`Failed to clear ${fieldName}: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

    static async safeGetText(locator: string, fieldName: string): Promise<string> {
        try {
            Logger.info(`Retrieving text from ${fieldName}`);
            const text = await this.getText(locator);
            Logger.pass(`${fieldName} text retrieved: ${text}`);
            return text;
        } catch (error: unknown) {
            Logger.error(`Failed to retrieve text from ${fieldName}: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

    static async safeIsVisible(locator: string, elementName: string): Promise<boolean> {
        try {
            Logger.info(`Checking visibility of ${elementName}`);
            const isVisible = await this.isVisible(locator);
            Logger.info(`${elementName} visibility: ${isVisible}`);
            return isVisible;
        } catch (error: unknown) {
            Logger.error(`Failed to check visibility of ${elementName}: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

    static async safeWaitForElement(locator: string, elementName: string, timeout: number = 10000): Promise<void> {
        try {
            Logger.info(`Waiting for ${elementName} (timeout: ${timeout}ms)`);
            await this.waitForElement(locator, timeout);
            Logger.pass(`${elementName} found successfully`);
        } catch (error: unknown) {
            Logger.error(`${elementName} not found within ${timeout}ms: ${FrameworkError.messageFrom(error)}`);
            throw error;
        }
    }

}
