# Salesforce QA Automation

BDD-based Salesforce test automation using Cucumber + Playwright + TypeScript.

---

## 📂 Structure

```
Salesforce-QA-Automation/
├── features/                    # Cucumber feature files (BDD scenarios)
├── src/
│   ├── step_definitions/        # Cucumber step implementations
│   ├── pages/                   # Page Object Model
│   ├── locators/                # Element selectors
│   ├── utils/                   # Playwright helpers + logging
│   └── salesforce/              # Salesforce-specific utilities
├── dashboard/                   # Web-based test runner (for non-technical users)
│   ├── server.js                # Express backend
│   ├── public/                  # Frontend (HTML/CSS/JS)
│   └── README.md                # Dashboard documentation
├── .vscode/                     # VS Code debug configurations
├── .github/workflows/           # CI/CD pipeline
├── cucumber.js                  # Cucumber config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm packages installed
- `.env` file with credentials (see `.env.example`)

### Setup

```bash
cd Salesforce-QA-Automation

# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env with your credentials

# 3. Build TypeScript
npm run build

# 4. Run all tests
npm test
```

---

## ▶️ Running Tests

### All Tests
```bash
npm test                    # Headless
npm run test:headed         # Browser visible
npm run test:debug          # With debug logging
```

### By Tag
```bash
npm run test:smoke          # @Smoke tests
npm run test:regression     # @Regression tests
npm run test:login          # @Login tests
npm run test:critical       # @CriticalPath tests
npm run test:account        # @AccountCreation tests

# Custom tag
node test-runner.js @YourTag
node test-runner.js @YourTag --headed
node test-runner.js @YourTag --debug
```

### Web Dashboard (Easy for Non-Technical Users)
```bash
node dashboard/server.js
# Open http://localhost:3000 in browser
```

**Features:**
- Select test tag from dropdown
- Toggle "Headed Mode" or "Debug Mode"
- Click "Run Tests" button
- View output in real-time

> See [dashboard/README.md](dashboard/README.md) for full dashboard documentation.

### VS Code Debug
1. **Open Debug Panel:** `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows)
2. **Select configuration** (e.g., "Run @Smoke Tests")
3. **Press F5** to start
4. **Set breakpoints** by clicking line numbers
5. **Inspect variables** in the Variables panel

---

## 📝 Writing Tests

### Feature File
```gherkin
@Login @Smoke
Scenario: Successful login
  When User enters valid username from environment
  And User enters valid password from environment
  And User clicks login button
  Then Login should be successful
```

### Step Definition
```typescript
When('User enters valid username from environment', async function () {
  const username = Config.SF_USERNAME;  // From .env
  await LoginPage.enterUsername(username);
});
```

### Page Object
```typescript
static async enterUsername(username: string): Promise<void> {
  try {
    await InputUtils.safeEnterText(LoginPageLocator.usernameInputField, username, 'username');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Failed to enter username: ${errorMessage}`);
    throw error;
  }
}
```

---

## 🏷️ Test Tags

| Tag | Purpose | Run with |
|-----|---------|----------|
| `@Smoke` | Critical happy path | `npm run test:smoke` |
| `@Regression` | Full regression suite | `npm run test:regression` |
| `@Login` | Login-specific tests | `npm run test:login` |
| `@CriticalPath` | Critical business processes | `npm run test:critical` |
| `@AccountCreation` | Account creation flows | `npm run test:account` |

---

## 🔐 Credentials & Environment

### .env (NOT committed)
Real, working credentials:
```
SF_USERNAME=qa.automation@test.com.poc
SF_PASSWORD=ActualPassword123!
SF_SECURITY_TOKEN=RealToken123xyz
SF_LOGIN_URL=https://your-org.develop.my.salesforce.com
```

### .env.example (COMMITTED)
Template with placeholders:
```
SF_USERNAME=your_qa_user@test.com.poc
SF_PASSWORD=your_password_here
SF_SECURITY_TOKEN=your_token_here
SF_LOGIN_URL=https://your-org.develop.my.salesforce.com
```

**SECURITY:** Never commit real credentials!

---

## 🛠️ Key Utilities

| Utility | Purpose | Usage |
|---------|---------|-------|
| `BrowserManager` | Browser lifecycle | Launch, navigate, close |
| `InputUtils` | Element interaction | Click, enter text, get text |
| `InputUtils.safe*` | Wrapped with error handling | safeClick, safeEnterText, etc. |
| `WaitUtils` | Smart waits | Wait for text, element, condition |
| `Logger` | Centralized logging | info, pass, fail, error |
| `LoginPage` | Page Object for login | All login interactions |
| `SalesforceLogin` | Reusable login flows | loginWithValidCredentials, etc. |

---

## 📋 Test Reports

Generated after each run:
- `reports/cucumber-report.html` — Open in browser for detailed results
- `reports/cucumber-report.json` — JSON for CI/CD integration

---

## 🐛 Debugging

### Set Breakpoint
Click line number in VS Code — green dot appears

### Run with Debug Mode
```bash
npm run test:debug
# or
node test-runner.js @Login --debug
```

### Step Through Code
- **F10:** Step over (next line)
- **F11:** Step into (dive into function)
- **Shift+F11:** Step out (exit function)
- **F5:** Resume (continue until next breakpoint)

### Inspect Variables
Left sidebar → Variables panel shows all local/closure variables

---

## 🚀 CI/CD

### GitHub Actions Workflow
Runs on: push to main, pull requests

```yaml
# .github/workflows/test.yml
- Install dependencies
- Compile TypeScript
- Run tests with environment credentials
- Upload test reports
```

### View Results
Repo → Actions tab → see latest workflow run

---

## 📚 Resources

- [Cucumber Documentation](https://cucumber.io/)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

---

## 🔗 Related

- **Agent coding standards:** [AgentInstructions.md](AgentInstructions.md) — mandatory conventions for AI-generated code (OOP, exceptions, tags, security)
- **Overall project:** [../../README.md](../../README.md)
- **Development repo:** [../Salesforce-Dev/README.md](../Salesforce-Dev/README.md)
- **Dependencies & Security:** [../../DEPENDENCIES_SECURITY.md](../../DEPENDENCIES_SECURITY.md)

---

**Status:** Production-ready  
**Last Updated:** July 3, 2026
