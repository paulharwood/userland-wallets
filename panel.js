console.log('panel.js is running');

/**
 * Event listener that runs when the DOM content is fully loaded.
 * It sets up the public key display functionality.
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const publicKeyDisplay = document.getElementById('publicKeyDisplay');

    if (window.panelAPI) {
        /**
         * Callback function that runs when the panel API is ready.
         * It retrieves the public key, URL, and signature, and displays the public key.
         * @callback onReady
         */
        window.panelAPI.onReady(() => {
            /**
             * Retrieves the public key from the panel API.
             * @type {string}
             */
            const publicKey = window.panelAPI.getPublicKey();
            
            /**
             * Retrieves the URL from the panel API.
             * @type {string}
             */
            const url = window.panelAPI.getUrl();
            
            /**
             * Retrieves the signature from the panel API.
             * @type {string}
             */
            const signature = window.panelAPI.getSignature();

            console.log('Public Key:', publicKey);
            console.log('URL:', url);
            console.log('Signature:', signature);

            publicKeyDisplay.textContent = `Public Key: ${publicKey}`;
        });
    } else {
        console.error('panelAPI not available');
    }
});