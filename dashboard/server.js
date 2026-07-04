const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

let currentTestRunner = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const FEATURES_DIR = path.join(__dirname, '..', 'features');

// Tags are auto-discovered from the feature files, so adding a new @Tag to any
// .feature file makes it appear in the dashboard automatically — no code change needed
function discoverTags() {
  const tags = new Set();

  function scanDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.feature')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Gherkin tags live on dedicated lines starting with "@" — scanning only
        // those lines avoids false positives like email addresses in step text
        for (const line of content.split('\n')) {
          if (/^\s*@/.test(line)) {
            for (const match of line.match(/@[A-Za-z0-9_-]+/g) || []) {
              tags.add(match);
            }
          }
        }
      }
    }
  }

  scanDir(FEATURES_DIR);

  return [...tags].sort().map(value => ({
    value,
    // "@CriticalPath" -> "Critical Path Tests"
    label: value.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2') + ' Tests'
  }));
}

// Get available tags
app.get('/api/tags', (req, res) => {
  try {
    res.json(discoverTags());
  } catch (error) {
    res.status(500).json({ error: `Failed to scan feature files: ${error.message}` });
  }
});

// Stop running tests
app.post('/api/stop-tests', (req, res) => {
  if (!currentTestRunner) {
    return res.status(400).json({ error: 'No tests running' });
  }

  currentTestRunner.kill();
  currentTestRunner = null;
  res.json({ success: true, message: 'Tests stopped' });
});

// Run tests
app.post('/api/run-tests', (req, res) => {
  const { tag, headed, debug } = req.body;

  if (!tag) {
    return res.status(400).json({ error: 'Tag is required' });
  }

  // Prevent running multiple tests simultaneously
  if (currentTestRunner) {
    return res.status(400).json({ error: 'Tests are already running' });
  }

  // Build command
  let args = [tag];
  if (headed) args.push('--headed');
  if (debug) args.push('--debug');

  // Run test-runner.js
  const testRunner = spawn('node', ['test-runner.js', ...args], {
    cwd: path.join(__dirname, '..')
  });

  currentTestRunner = testRunner;

  let output = '';
  let error = '';
  let responseSent = false;

  testRunner.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log(text);
  });

  testRunner.stderr.on('data', (data) => {
    const text = data.toString();
    error += text;
    console.error(text);
  });

  testRunner.on('close', (code) => {
    currentTestRunner = null;

    if (responseSent) return; // Already sent response

    responseSent = true;

    if (code === 0) {
      res.status(200).json({
        success: true,
        output,
        message: 'Tests completed successfully'
      });
    } else if (code === null || code === 15 || code === 9) {
      // Tests were stopped by user (signal 15=SIGTERM, 9=SIGKILL, null=killed)
      res.status(200).json({
        success: null,
        output,
        message: 'Tests were stopped by user'
      });
    } else {
      res.status(400).json({
        success: false,
        output,
        error,
        message: `Tests failed with exit code ${code}`
      });
    }
  });

  // Send immediate response to show tests are running
  setTimeout(() => {
    if (!responseSent && !res.headersSent) {
      responseSent = true;
      res.json({
        success: null,
        output,
        message: 'Tests running... (check the terminal for output)'
      });
    }
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║     Salesforce QA Test Dashboard       ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  console.log(`🚀 Dashboard running at: http://localhost:${PORT}`);
  console.log(`\n📱 Open this link in your browser to start running tests\n`);
});
