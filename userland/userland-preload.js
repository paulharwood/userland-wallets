const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a set of APIs to the renderer process.
 * @namespace
 * @name userlandAPI
 */
contextBridge.exposeInMainWorld('userlandAPI', {
  /**
   * Retrieves or generates a public key.
   * @function
   * @name getPublicKey
   * @returns {Promise<string>} A promise that resolves with the public key.
   */
  getPublicKey: async () => {
    try {
      return await ipcRenderer.invoke('get-public-key');
    } catch (error) {
      console.error('Error retrieving public key:', error.message);
      ipcRenderer.send('display-error', 'Failed to retrieve public key. Please try again later.');
      throw new Error('Failed to retrieve public key. Please try again later.');
    }
  },

  /**
   * Signs a message with the private key.
   * @function
   * @name signMessage
   * @param {string} message - The message to sign.
   * @returns {Promise<string>} A promise that resolves with the signature.
   */
  signMessage: async (message) => {
    try {
      return await ipcRenderer.invoke('sign-message', message);
    } catch (error) {
      console.error('Error signing message:', error.message);
      ipcRenderer.send('display-error', 'Failed to sign message. Please try again later.');
      throw new Error('Failed to sign message. Please try again later.');
    }
  },

  /**
   * Opens a new panel window with the specified URL, signature, and public key.
   * @function
   * @name openPanel
   * @param {string} url - The URL to load in the panel.
   * @param {string} signature - The signature for the URL.
   * @param {string} publicKey - The public key associated with the panel.
   */
  openPanel: (url, signature, publicKey) => {
    ipcRenderer.send('open-panel', { url, signature, publicKey });
  },

  /**
   * Handles the panel open error event.
   * @function
   * @name onPanelOpenError
   * @param {function} callback - The callback function to handle the error.
   */
   onPanelOpenError: (callback) => ipcRenderer.on('panel-open-error', (event, ...args) => callback(...args)) // Add this line
});

