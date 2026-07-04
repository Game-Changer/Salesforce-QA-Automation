export class Logger {
  // Static utility class — not meant to be instantiated
  private constructor() {}

  // Logging must never break a test run, so failures fall back to plain output
  private static log(level: string, message: string, stderr: boolean = false): void {
    try {
      const timestamp = new Date().toISOString();
      const line = `[${level}] ${timestamp} - ${message}`;
      stderr ? console.error(line) : console.log(line);
    } catch {
      console.log(`[${level}] ${message}`);
    }
  }

  static info(message: string): void {
    this.log('INFO', message);
  }

  static debug(message: string): void {
    this.log('DEBUG', message);
  }

  static warn(message: string): void {
    this.log('WARN', message, true);
  }

  static error(message: string): void {
    this.log('ERROR', message, true);
  }

  static pass(message: string): void {
    this.log('PASS', message);
  }

  static fail(message: string): void {
    this.log('FAIL', message, true);
  }
}
