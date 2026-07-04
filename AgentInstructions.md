# Agent Instructions — Salesforce QA Automation

**Audience:** Any AI agent (QA Automation Writer or otherwise) generating code in this repository as part of the multi-agent SDLC orchestrator.

**Prime directive:** Follow the conventions below exactly. All code you write stays **local** — never commit, push, or create branches. A human reviews and pushes.

---

## 1. Repository Layout — where code goes

```
features/                  → Gherkin feature files (BDD scenarios) ONLY
src/
├── step_definitions/      → Cucumber step implementations
├── pages/                 → Page Objects (BasePage + one class per page)
├── locators/              → One locator class per page, selectors ONLY
├── utils/                 → Framework plumbing (browser, waits, inputs, config, logging)
├── salesforce/            → Reusable Salesforce business flows (login, etc.)
└── exceptions/            → Custom exception hierarchy
dashboard/                 → Web test-runner for non-technical users
.auth/                     → Activated browser profile (gitignored — NEVER touch or commit)
```

Never put selectors in pages, page logic in steps, or Playwright calls in step definitions.

---

## 2. OOP Rules (mandatory)

### Adding a new page = exactly three artifacts

1. **Locator class** in `src/locators/<Name>PageLocator.ts` — `static readonly` selector strings only, plus a `private constructor() {}`.
2. **Page class** in `src/pages/<Name>Page.ts` that **`extends BasePage`** and implements:
   - `protected get pageName(): string` — human-readable name for logs
   - `async waitForPageLoad(): Promise<void>` — what "this page is ready" means (polymorphic; every page defines its own)
3. **Singleton export** at the bottom of the page file: `export const <name>Page = new <Name>Page();` — steps and services import the singleton, never `new` a page themselves.

### Encapsulation rules

- Pure-static classes (`Logger`, `Config`, `BrowserManager`, `InputUtils`, `WaitUtils`, `SalesforceLogin`, all locator classes) must have a `private constructor() {}`.
- Playwright (`Page`, `Browser`, selectors) is touched **only** inside `src/utils/`. Pages call utils; steps call pages/services; nothing skips a layer.
- Keep `BrowserManager`'s browser/context/page fields `private static`.

### Reuse before you write

Before adding any helper method, check `InputUtils`, `WaitUtils`, and `SalesforceLogin` for an existing one. New generic helpers go in utils (so every page benefits), not in a page class.

---

## 3. Custom Exception Handling (mandatory in EVERY method)

The hierarchy lives in `src/exceptions/FrameworkError.ts`:

| Exception | Throw when |
|---|---|
| `BrowserError` | Browser launch/close/navigation fails, or page accessed before launch |
| `ElementActionError` | Click / type / read on an element fails |
| `WaitTimeoutError` | A wait/condition/timeout expires |
| `ConfigurationError` | Required env var missing or malformed |

### The pattern — every method, no exceptions

```typescript
static async click(locator: string): Promise<void> {
    try {
        // ... action ...
    } catch (error: unknown) {                       // always `unknown`, never `any`
        Logger.error(`Click failed on element: ${locator}`);
        throw new ElementActionError(`Failed to click element: ${locator}`, error);  // chain the cause
    }
}
```

### Layering convention

- **Utils** → wrap raw Playwright errors into a **typed** framework error (with the original as `cause`).
- **Pages / services** → `try/catch`, `Logger.error` with page-level context, **rethrow as-is** (don't re-wrap an already-typed error).
- **Step definitions** → `try/catch`, `Logger.fail` with the business-level meaning, rethrow to fail the scenario.
- Extract messages with `FrameworkError.messageFrom(error)` — never repeat the `instanceof Error` dance inline.

---

## 4. Logging

- Use `Logger` exclusively — **never `console.log`** in framework or test code.
- `Logger.info` for actions, `Logger.pass`/`Logger.fail` for step outcomes, `Logger.error` inside catch blocks, `Logger.debug` for diagnostic detail, `Logger.warn` for recoverable oddities.
- Log once per layer with increasing context; don't spam identical messages.

---

## 5. Configuration & Security (non-negotiable)

- **Never hardcode credentials, usernames, passwords, tokens, or org URLs** — not in feature files, not in steps, not in code. Everything comes from `Config` (backed by `.env`).
- Adding a new env var? Update **three** places: `Config` (the field), `Config.validate()` (if required), and `.env.example` (placeholder value).
- Feature files use environment-based steps (e.g., `User enters valid username from environment`) — never literal credentials in Gherkin.
- Never read, print, or commit `.env` or anything under `.auth/`.

---

## 6. BDD / Cucumber Conventions

- Steps must be **generic and reusable** — prefer parameterized (`{string}`) or environment-based steps over scenario-specific ones.
- Tag every scenario. Current tag vocabulary: `@Smoke`, `@Regression`, `@Login`, `@CriticalPath`, `@AccountCreation`. Feature-area tags (like `@Login`) + suite tags (like `@Smoke`) combine freely.
- Assertion steps must verify **real outcomes** — e.g., login success means the Lightning home page URL is reached AND the App Launcher is visible (see `HomePage.waitForPageLoad`), never just "page has a title".

### Introducing a NEW tag — required follow-ups

1. **Dashboard: nothing to do.** `dashboard/server.js` auto-discovers tags by scanning `features/**/*.feature` tag lines. Verify the new tag appears at `http://localhost:3000` after adding it.
2. **package.json**: add convenience scripts following the existing pattern:
   `"test:<name>": "node test-runner.js @<Tag>"` and `"test:<name>:headed": "node test-runner.js @<Tag> --headed"`.
3. **.vscode/launch.json**: add a matching debug configuration (copy an existing tag entry).
4. **README.md**: add a row to the "Test Tags" table.

---

## 7. Test Execution Constraints (do NOT change these)

- **`parallel: 1` in `cucumber.js` must stay.** All scenarios share the single activated browser profile in `.auth/chrome-profile`; Salesforce rotates the device-activation token on every login, so parallel copies would be challenged with verification codes.
- **Never delete or modify `.auth/`.** If Salesforce ever challenges again, the human runs `npm run activate` (and ticks "Don't ask again" on the verification screen).
- Cucumber default step timeout is 60s (set in `login.steps.ts`) — rely on `WaitUtils`/`InputUtils` waits, **never** hard sleeps (`waitForTimeout` as a delay is forbidden in test code).
- Browser lifecycle belongs to the `Before`/`After` hooks via `BrowserManager` — never launch browsers inside steps or pages.

---

## 8. Definition of Done — verify before you finish

1. `npm run build` compiles with zero TypeScript errors.
2. Run the affected tag: `node test-runner.js @<Tag>` — all scenarios green.
3. No hardcoded secrets or org URLs anywhere in the diff.
4. Every new method has try/catch with the correct typed exception.
5. New pages follow the locator → page-extends-BasePage → singleton pattern.
6. New tags: npm scripts + launch.json + README table updated (dashboard picks them up automatically).
7. Nothing committed or pushed — leave changes local for human review.
