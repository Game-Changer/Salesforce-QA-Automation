document.addEventListener('DOMContentLoaded', () => {
  const tagSelect = document.getElementById('tagSelect');
  const headedCheck = document.getElementById('headedCheck');
  const debugCheck = document.getElementById('debugCheck');
  const runBtn = document.getElementById('runBtn');
  const stopBtn = document.getElementById('stopBtn');
  const output = document.getElementById('output');
  const statusBadge = document.getElementById('statusBadge');

  // Load available tags
  fetch('/api/tags')
    .then(res => res.json())
    .then(tags => {
      tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.value;
        option.textContent = tag.label;
        tagSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Failed to load tags:', err);
      showError('Failed to load test tags');
    });

  // Enable/disable run button based on tag selection
  tagSelect.addEventListener('change', () => {
    runBtn.disabled = !tagSelect.value;
  });

  // Stop tests
  stopBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/stop-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        addOutputLine('Tests stopped by user', 'warning');
        updateStatus('ready', 'Stopped');
        showRunButton();
      } else {
        const error = await response.json();
        addOutputLine(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      addOutputLine(`Error stopping tests: ${error.message}`, 'error');
    }
  });

  // Run tests
  runBtn.addEventListener('click', async () => {
    const tag = tagSelect.value;
    if (!tag) return;

    const headed = headedCheck.checked;
    const debug = debugCheck.checked;

    showStopButton();
    const btnText = runBtn.querySelector('.btn-text');
    const spinner = runBtn.querySelector('.btn-spinner');
    btnText.textContent = 'Running...';
    spinner.classList.remove('hidden');

    updateStatus('running', 'Running tests...');
    clearOutput();

    try {
      const response = await fetch('/api/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, headed, debug })
      });

      const data = await response.json();

      if (data.output) {
        displayOutput(data.output);
      }

      if (response.ok && data.success) {
        updateStatus('success', '✅ Tests Passed');
        addOutputLine('Tests completed successfully!', 'success');
      } else if (response.ok && data.success === null) {
        updateStatus('running', '⏳ Running (check terminal for live output)');
        addOutputLine(data.message, 'warning');
      } else {
        updateStatus('error', '❌ Tests Failed');
        addOutputLine(`Error: ${data.message}`, 'error');
        if (data.error) {
          addOutputLine(data.error, 'error');
        }
      }
    } catch (error) {
      updateStatus('error', '❌ Connection Error');
      addOutputLine(`Error: ${error.message}`, 'error');
    } finally {
      showRunButton();
      btnText.textContent = '▶ Run Tests';
      spinner.classList.add('hidden');
    }
  });

  function clearOutput() {
    output.innerHTML = '';
  }

  function displayOutput(text) {
    output.innerHTML = '';
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        addOutputLine(line);
      }
    });
    scrollToBottom();
  }

  function addOutputLine(text, type = '') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
  }

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function updateStatus(status, message) {
    statusBadge.textContent = message;
    statusBadge.className = `status-badge ${status}`;
  }

  function showError(message) {
    updateStatus('error', `❌ ${message}`);
    output.innerHTML = `<div class="output-line error">${message}</div>`;
  }

  function showRunButton() {
    runBtn.disabled = !tagSelect.value;
    runBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
  }

  function showStopButton() {
    runBtn.disabled = true;
    runBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
  }
});
