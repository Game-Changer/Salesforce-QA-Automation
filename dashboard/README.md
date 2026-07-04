# QA Test Dashboard

A simple web-based test runner dashboard for non-technical users to run Salesforce QA automation tests without needing CLI knowledge.

## Features

✅ **Simple Tag Selection** — Choose from @Smoke, @Regression, @Login, @CriticalPath, @AccountCreation  
✅ **Optional Modes** — Toggle Headed mode (see browser) and Debug mode (verbose logging)  
✅ **Real-Time Output** — See test execution logs in the dashboard  
✅ **No CLI Required** — Point-and-click interface for non-technical users  
✅ **Local Execution** — Tests run on your machine via Node.js backend  

---

## Quick Start

### 1. Install Dependencies

Make sure you're in the Salesforce-QA-Automation repo root:

```bash
npm install express
```

> **Note:** If you haven't installed the main QA automation dependencies yet, do that first:
> ```bash
> npm install
> ```

### 2. Start the Dashboard

From the Salesforce-QA-Automation repo root:

```bash
node dashboard/server.js
```

You'll see:

```
╔════════════════════════════════════════╗
║     Salesforce QA Test Dashboard       ║
╚════════════════════════════════════════╝

🚀 Dashboard running at: http://localhost:3000

📱 Open this link in your browser to start running tests
```

### 3. Open in Browser

Click the link or open **http://localhost:3000** in your browser.

---

## How to Use

1. **Select Test Suite** — Choose a tag from the dropdown
2. **Optional Settings** — Toggle "Headed Mode" or "Debug Mode" if needed
3. **Click Run Tests** — The dashboard sends the request to the backend
4. **View Output** — Real-time logs appear below; check the terminal for final results
5. **Repeat** — Select another tag and run again

### What Each Option Does

- **Headed Mode** — Opens a visible browser window during test execution (useful for debugging)
- **Debug Mode** — Prints verbose logs to help troubleshoot test failures

---

## File Structure

```
dashboard/
├── server.js                # Express backend (handles test execution)
├── public/
│   ├── index.html          # Dashboard UI
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
└── README.md               # This file
```

---

## Technical Details

### Backend (server.js)

- **Express server** on port 3000
- **API endpoints:**
  - `GET /api/tags` — Get available test tags
  - `POST /api/run-tests` — Execute tests with selected tag + options
- **Spawns** the `test-runner.js` script from the parent directory
- **Captures** stdout/stderr and streams back to the frontend

### Frontend (public/)

- **Vanilla JavaScript** — No frameworks, just HTML/CSS/JS
- **Responsive Design** — Works on desktop and tablet
- **Live Updates** — Fetches results and updates status/output in real-time

---

## Troubleshooting

### Dashboard won't start

**Error:** `Cannot find module 'express'`

→ Run `npm install express` first

### No tests show in output

**Check:**
1. The test runner is working: `npm test` from the repo root
2. Your `.env` file has valid Salesforce credentials
3. Check the terminal for error messages

### Tests fail in dashboard but work in CLI

The dashboard uses the same `test-runner.js` as the CLI. If you see different results:
1. Check that your `.env` environment variables are loaded
2. Verify the browser isn't blocked by a firewall
3. Check the terminal logs for details

### Port 3000 already in use

Run the server on a different port:

```bash
PORT=3001 node dashboard/server.js
```

Then open **http://localhost:3001**

---

## Add to package.json (Optional)

For easier startup, you can add a npm script to the main `package.json`:

```json
{
  "scripts": {
    "dashboard": "node dashboard/server.js"
  }
}
```

Then run:

```bash
npm run dashboard
```

---

## Next Steps

- **Users:** Share this with your team — they just need Node.js installed + `.env` configured
- **Developers:** Customize the CSS in `public/style.css`. Tags are **auto-discovered** from `features/**/*.feature` — add a new `@Tag` to any feature file and it appears in the dropdown automatically
- **Enterprise:** For GitHub Pages hosting of a static version (read-only), see the main repo README

---

**Last Updated:** July 4, 2026  
**Status:** MVP (Minimum Viable Product)
