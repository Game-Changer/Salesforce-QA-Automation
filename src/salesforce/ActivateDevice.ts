import { chromium, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../utils/config';
import { Logger } from '../utils/Logger';
import { BrowserError } from '../exceptions/FrameworkError';

/**
 * One-time device activation script.
 *
 * Salesforce challenges unknown browsers with an email verification code and
 * binds the activation to the full browser profile (not just cookies). This
 * script logs in inside a persistent Chrome profile stored at
 * .auth/chrome-profile, lets you enter the emailed code manually, then
 * verifies the activation sticks by logging out and back in. Test runs launch
 * copies of this profile, so Salesforce recognizes them as the same activated
 * device and skips the challenge.
 *
 * Run with: npm run activate
 */
const AUTH_DIR = path.resolve(__dirname, '../../.auth');
const PROFILE_DIR = path.join(AUTH_DIR, 'chrome-profile');
const VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes to enter the emailed code

// A successful login lands on Lightning home OR Classic home (/home/home.jsp) —
// both mean the user is authenticated and no verification challenge blocked us
const isAuthenticatedUrl = (url: URL): boolean =>
  url.href.includes('lightning.force.com') || url.href.includes('/home/home.jsp');

async function submitLogin(page: Page): Promise<void> {
  try {
    await page.goto(Config.SF_LOGIN_URL, { waitUntil: 'networkidle' });
    await page.fill("//input[@id='username']", Config.SF_USERNAME);
    await page.fill("//input[@id='password']", Config.SF_PASSWORD);
    await page.click("//input[@id='Login']");
  } catch (error: unknown) {
    Logger.error('Failed to submit the login form');
    throw new BrowserError('Failed to submit the login form', error);
  }
}

async function logout(page: Page): Promise<void> {
  try {
    const logoutUrl = new URL('/secur/logout.jsp', Config.SF_LOGIN_URL).toString();
    await page.goto(logoutUrl, { waitUntil: 'networkidle' });
  } catch (error: unknown) {
    Logger.error('Failed to log out');
    throw new BrowserError('Failed to log out', error);
  }
}

async function activate(): Promise<void> {
  Logger.info('========== Salesforce Device Activation ==========');
  Logger.info('A browser window will open and log in automatically.');
  Logger.info('If Salesforce asks for a verification code, check your email and enter it in the browser.');

  // Start from a clean profile so stale state can't interfere
  if (fs.existsSync(PROFILE_DIR)) {
    fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(PROFILE_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, { headless: false });
  const page = context.pages()[0] ?? (await context.newPage());

  try {
    Logger.info(`Navigating to: ${Config.SF_LOGIN_URL}`);
    await submitLogin(page);

    Logger.info('Waiting for the home page (enter the emailed code in the browser if prompted)...');
    await page.waitForURL(isAuthenticatedUrl, {
      timeout: VERIFICATION_TIMEOUT
    });
    Logger.pass('Home page reached. Now verifying the activation persists...');

    // Self-check: log out and back in — a recognized device must not be challenged again
    await logout(page);
    await submitLogin(page);
    try {
      await page.waitForURL(isAuthenticatedUrl, { timeout: 30000 });
      Logger.pass('Re-login completed without a verification challenge — activation persisted!');
    } catch {
      Logger.error(`Re-login was challenged again. Current URL: ${page.url()}`);
      Logger.error('This org challenges every login from this network.');
      Logger.error('Ask your Salesforce admin to add Login IP Ranges on the QA user\'s profile.');
      process.exitCode = 1;
      return;
    }

    // Leave the profile logged out so tests exercise the real login form
    await logout(page);
    Logger.pass(`Activated browser profile saved to: ${PROFILE_DIR}`);
    Logger.pass('All future test runs will skip the verification challenge.');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Activation failed: ${errorMessage}`);
    process.exitCode = 1;
  } finally {
    await context.close();
  }
}

activate();
