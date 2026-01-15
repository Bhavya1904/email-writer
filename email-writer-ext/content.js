console.log("AI Email Writer Extension loaded");

// Configuration - can be overridden via Chrome storage
const CONFIG = {
    backendUrl: 'http://localhost:8080/api/email/generate',
    tones: [
        { value: 'professional', label: 'Professional' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'concise', label: 'Concise' },
        { value: 'enthusiastic', label: 'Enthusiastic' }
    ]
};

// Load saved settings from Chrome storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['backendUrl']);
        if (result.backendUrl) {
            CONFIG.backendUrl = result.backendUrl;
        }
    } catch (error) {
        console.log("Using default settings");
    }
}

// Initialize settings
loadSettings();

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC', '.aDh', '[role="toolbar"]', '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

// Create SVG icon for AI button
function createAIIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ai-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.innerHTML = `
        <path fill="currentColor" d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
    `;
    return svg;
}

// Create loading spinner
function createSpinner() {
    const spinner = document.createElement('span');
    spinner.className = 'ai-spinner';
    return spinner;
}

// Create tone dropdown
function createToneDropdown() {
    const dropdown = document.createElement('select');
    dropdown.className = 'ai-tone-dropdown';
    dropdown.setAttribute('data-tooltip', 'Select reply tone');

    CONFIG.tones.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.value;
        option.textContent = tone.label;
        dropdown.appendChild(option);
    });

    return dropdown;
}

// Create the AI Reply button with Gmail styling
function createAIButton() {
    const button = document.createElement('button');
    button.className = 'ai-reply-button';
    button.setAttribute('type', 'button');
    button.setAttribute('data-tooltip', 'Generate AI reply');

    const icon = createAIIcon();
    const text = document.createElement('span');
    text.textContent = 'AI Reply';
    text.className = 'ai-button-text';

    button.appendChild(icon);
    button.appendChild(text);

    return button;
}

// Create container with button and dropdown
function createAIContainer() {
    const container = document.createElement('div');
    container.className = 'ai-reply-container';

    const dropdown = createToneDropdown();
    const button = createAIButton();

    container.appendChild(dropdown);
    container.appendChild(button);

    return { container, button, dropdown };
}

function injectButton() {
    const existingContainer = document.querySelector('.ai-reply-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Compose toolbar not found");
        return;
    }
    console.log("Compose toolbar found, injecting AI Reply");

    const { container, button, dropdown } = createAIContainer();

    button.addEventListener('click', async () => {
        try {
            // Update button to generating state
            button.classList.add('generating');
            button.disabled = true;
            const buttonText = button.querySelector('.ai-button-text');
            const originalText = buttonText.textContent;
            buttonText.textContent = 'Generating...';

            // Replace icon with spinner
            const icon = button.querySelector('.ai-icon');
            const spinner = createSpinner();
            button.replaceChild(spinner, icon);

            const emailContent = getEmailContent();
            const selectedTone = dropdown.value;

            const response = await fetch(CONFIG.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const generatedReply = await response.text();

            const composeBox = document.querySelector(
                '[role="textbox"][g_editable="true"]'
            );
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }

        } catch (error) {
            console.error("Error generating AI reply:", error);
            alert('Failed to generate reply. Please check if the backend is running.');
        } finally {
            // Restore button state
            button.classList.remove('generating');
            button.disabled = false;
            const buttonText = button.querySelector('.ai-button-text');
            buttonText.textContent = 'AI Reply';

            // Restore icon
            const spinner = button.querySelector('.ai-spinner');
            if (spinner) {
                button.replaceChild(createAIIcon(), spinner);
            }
        }
    });

    toolbar.insertBefore(container, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposedElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.('.aDh, .btC, [role="dialog"]')
                || node.querySelector?.('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposedElements) {
            console.log("Compose window detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});