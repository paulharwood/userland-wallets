/**
 * Event listener that runs when the DOM content is fully loaded.
 * It sets up the URL input and panel opening functionality.
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const openPanelButton = document.getElementById('openPanel');
    const errorDisplay = document.getElementById('errorDisplay'); // Ensure you have an element for displaying errors

    if (!urlInput || !openPanelButton) {
        console.error('Required DOM elements not found');
        return;
    }

    if (!window.userlandAPI) {
        console.error('Userland API not found. Make sure the preload script is correctly set up.');
        return;
    }

    // Listen for panel open errors
    window.userlandAPI.onPanelOpenError((errorMessage) => {
        console.error('Failed to open panel:', errorMessage);
    });   

    /**
     * Event listener for the "Open Panel" button click.
     * It processes the entered URL, signs it, and opens a new panel.
     * @listens click
     */
    openPanelButton.addEventListener('click', async () => {
        let url = urlInput.value.trim();
        if (url) {
            // Ensure the URL has a protocol
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            try {
                if (!window.userlandAPI.getPublicKey || !window.userlandAPI.signMessage || !window.userlandAPI.openPanel) {
                    throw new Error('Userland API methods are not available');
                }

                /**
                 * Retrieves the public key from the userland API.
                 * @type {string}
                 */
                const publicKey = await window.userlandAPI.getPublicKey();
                if (!publicKey) {
                    throw new Error('Failed to retrieve public key');
                }
                console.log('Retrieved public key:', publicKey);

                /**
                 * Signs the URL using the userland API.
                 * @type {string}
                 */
                const signature = await window.userlandAPI.signMessage(url);
                if (!signature) {
                    throw new Error('Failed to sign message');
                }
                console.log('Generated signature:', signature);

                console.log('Opening panel with:', { url, signature, publicKey });

                /**
                 * Opens a new panel with the specified URL, signature, and public key.
                 * @function
                 */
                window.userlandAPI.openPanel(url, signature, publicKey);
            } catch (error) {
                console.error('Error opening panel:', error);
                console.error(`Error: ${error.message}`);
            }
        } else {
            console.error('Please enter a URL');
        }
    });

    async function openPanel() {
        try {
            const url = document.getElementById('urlInput').value.trim();
            if (!url) {
                throw new Error('Please enter a URL');
            }

            const publicKey = await window.userlandAPI.getPublicKey();
            const signature = await window.userlandAPI.signMessage(url);
            
            window.userlandAPI.openPanel({ url, signature, publicKey });
        } catch (error) {
            console.error('Error opening panel:', error);
            console.error(`Error: ${error.message}`);
        }
    }

    // Listen for panel open errors
    window.userlandAPI.onPanelOpenError((errorMessage) => {
        console.error('Failed to open panel:', errorMessage);
        console.error(`Failed to open panel: ${errorMessage}`);
    });

    // Listen for error messages from the preload script
    window.electronAPI.onDisplayError((errorMessage) => {
        if (errorDisplay) {
            errorDisplay.textContent = errorMessage; // Display the error message
            errorDisplay.style.display = 'block'; // Make sure the error display is visible
        }
    });

    // Attach this function to your button click event
    openPanelButton.addEventListener('click', openPanel);
});
