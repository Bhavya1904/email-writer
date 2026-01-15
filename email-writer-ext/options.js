const DEFAULT_BACKEND_URL = 'http://localhost:8080/api/email/generate';

const backendUrlInput = document.getElementById('backendUrl');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');

// Load saved settings
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['backendUrl']);
        backendUrlInput.value = result.backendUrl || DEFAULT_BACKEND_URL;
    } catch (error) {
        backendUrlInput.value = DEFAULT_BACKEND_URL;
    }
}

// Show status message
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + (isError ? 'error' : 'success');

    setTimeout(() => {
        statusDiv.className = 'status';
    }, 3000);
}

// Save settings
saveBtn.addEventListener('click', async () => {
    const backendUrl = backendUrlInput.value.trim();

    if (!backendUrl) {
        showStatus('Please enter a valid URL', true);
        return;
    }

    try {
        new URL(backendUrl); // Validate URL format
    } catch {
        showStatus('Please enter a valid URL format', true);
        return;
    }

    try {
        await chrome.storage.sync.set({ backendUrl });
        showStatus('Settings saved successfully!');
    } catch (error) {
        showStatus('Failed to save settings', true);
    }
});

// Reset to default
resetBtn.addEventListener('click', async () => {
    backendUrlInput.value = DEFAULT_BACKEND_URL;
    try {
        await chrome.storage.sync.set({ backendUrl: DEFAULT_BACKEND_URL });
        showStatus('Reset to default settings');
    } catch (error) {
        showStatus('Failed to reset settings', true);
    }
});

// Initialize
loadSettings();
