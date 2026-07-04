import * as dotenv from 'dotenv';
import * as path from 'path';
import { ConfigurationError } from '../exceptions/FrameworkError';

// Load .env from the repo root so it works regardless of where the process is spawned from
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export class Config {
  // Static configuration holder — not meant to be instantiated
  private constructor() {}

  static readonly SF_USERNAME = process.env.SF_USERNAME!;
  static readonly SF_PASSWORD = process.env.SF_PASSWORD!;
  static readonly SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN!;
  static readonly SF_LOGIN_URL = process.env.SF_LOGIN_URL!;
  static readonly SF_CUSTOM_DOMAIN = process.env.SF_CUSTOM_DOMAIN!;
  static readonly TIMEOUT = parseInt(process.env.TIMEOUT || '30000');
  static readonly HEADED = process.env.HEADED === 'true';
  static readonly DEBUG = process.env.DEBUG === 'true';
  static readonly BROWSER = (process.env.BROWSER || 'chromium') as 'chromium' | 'firefox' | 'webkit';

  /** Fails fast with a clear message when required .env values are missing */
  static validate(): void {
    const required: Record<string, string | undefined> = {
      SF_USERNAME: this.SF_USERNAME,
      SF_PASSWORD: this.SF_PASSWORD,
      SF_LOGIN_URL: this.SF_LOGIN_URL,
    };
    const missing = Object.keys(required).filter(key => !required[key]);
    if (missing.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables: ${missing.join(', ')}. Check your .env file (see .env.example).`
      );
    }
  }
}
