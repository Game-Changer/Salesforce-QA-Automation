/**
 * Custom exception hierarchy for the automation framework.
 *
 * Every layer throws its own typed error so failures identify themselves:
 *  - BrowserError        → browser lifecycle / navigation problems
 *  - ElementActionError  → click / type / read failures on page elements
 *  - WaitTimeoutError    → an expected condition never became true
 *  - ConfigurationError  → missing or malformed environment configuration
 */
export class FrameworkError extends Error {
  constructor(message: string, cause?: unknown) {
    const causeMessage = cause !== undefined ? ` | Caused by: ${FrameworkError.messageFrom(cause)}` : '';
    super(`${message}${causeMessage}`);
    this.name = new.target.name;
  }

  /** Safely extract a readable message from any thrown value */
  static messageFrom(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

export class BrowserError extends FrameworkError {}

export class ElementActionError extends FrameworkError {}

export class WaitTimeoutError extends FrameworkError {}

export class ConfigurationError extends FrameworkError {}
