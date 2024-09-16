const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

let userlandWindow;
let keyPair;
let panelView;

/**
 * Creates the main userland window of the application.
 * @function
 * @name createUserlandWindow
 */
function createUserlandWindow() {
  userlandWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'userland-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  userlandWindow.loadFile('userland.html');
  userlandWindow.webContents.openDevTools(); // For debugging
}

app.whenReady().then(() => {
  keyPair = nacl.sign.keyPair();
  createUserlandWindow();
});

ipcMain.handle('get-public-key', () => {
  return util.encodeBase64(keyPair.publicKey);
});

ipcMain.handle('sign-message', (event, message) => {
  const signature = nacl.sign.detached(util.decodeUTF8(message), keyPair.secretKey);
  return util.encodeBase64(signature);
});

ipcMain.on('open-panel', (event, data) => {
  const { url, signature, publicKey } = data;
  
  // Verify the signature
  const isValid = verifySignature(url, signature, publicKey);
  
  if (isValid) {
    createPanelWindow(url, signature, publicKey);
  } else {
    event.reply('panel-open-error', 'Invalid signature or URL mismatch');
  }
});

/**
 * Verifies the signature of a message using the provided public key.
 * @param {string} message - The original message (URL in this case).
 * @param {string} signature - The base64-encoded signature.
 * @param {string} publicKey - The base64-encoded public key.
 * @returns {boolean} - True if the signature is valid, false otherwise.
 */
function verifySignature(message, signature, publicKey) {
  try {
    const messageUint8 = util.decodeUTF8(message);
    const signatureUint8 = util.decodeBase64(signature);
    const publicKeyUint8 = util.decodeBase64(publicKey);
    
    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Creates a new panel window with a BrowserView to display a URL.
 * @function
 * @name createPanelWindow
 * @param {string} url - The URL to load in the BrowserView.
 * @param {string} signature - The signature for the URL.
 * @param {string} publicKey - The public key associated with the panel.
 */
function createPanelWindow(url, signature, publicKey) {
  const panelWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'panel-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // Enable webview tag
      // Keep webSecurity true for the main window
      webSecurity: true,
    },
  });

  panelWindow.loadFile('panel.html');

  panelWindow.webContents.on('did-finish-load', () => {
    console.log('Sending initialize event to panel with:', { url, signature, publicKey });
    panelWindow.webContents.send('initialize', { url, signature, publicKey });
  });

  panelWindow.webContents.openDevTools(); // For debugging
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('load-url', (event, url) => {
  if (panelView) {
    console.log('Attempting to load URL in BrowserView:', url);
    panelView.webContents.loadURL(url)
      .then(() => {
        console.log('URL loaded successfully');
      })
      .catch((error) => {
        console.error('Error loading URL:', error);
      });
  } else {
    console.error('panelView is not initialized');
  }
});

// ... rest of your main.js code ...