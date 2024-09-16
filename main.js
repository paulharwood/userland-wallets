const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

let userlandWindow;
let panels = [];
let keyPair;

/**
 * Creates the userland window.
 */
function createUserlandWindow() {
  userlandWindow = new BrowserWindow({
    webSecurity: true,
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'userland-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: ["--disable-features=IsolateOrigins,site-per-process"],
    },
  });

  userlandWindow.loadFile('index.html');

  userlandWindow.webContents.openDevTools();

  userlandWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
       ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'self'"]
      }
    })
  })
}

/**
 * Event handler for when the application is ready.
 * Generates a new key pair and creates the userland window.
 */
app.whenReady().then(() => {
  keyPair = nacl.sign.keyPair();
  console.log('Public Key:', util.encodeBase64(keyPair.publicKey));

  createUserlandWindow();
});

/**
 * Event handler for when all windows are closed.
 * Quits the application if it's not running on macOS.
 */
app.on('window-all-closed', () => {
  if (process.platform!== 'darwin') app.quit();
});

/**
 * Event handler for the 'open-panel' message.
 * Verifies the signature and creates a new panel window if valid.
 *
 * @param {Object} event - The event object.
 * @param {Object} data - The message data containing URL, signature, and public key.
 */
ipcMain.on('open-panel', (event, data) => {
  const { url, signature, publicKey } = data;

  const messageUint8 = util.decodeUTF8(url);
  const signatureUint8 = util.decodeBase64(signature);
  const publicKeyUint8 = util.decodeBase64(publicKey);

  const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

  if (isValid) {
    createPanelWindow(url, publicKey);
  } else {
    console.error('Invalid signature. Panel not created.');
  }
});

/**
 * Handles the 'get-public-key' message.
 * Returns the public key as a base64-encoded string.
 *
 * @param {Object} event - The event object.
 * @returns {string} The public key as a base64-encoded string.
 */
ipcMain.handle('get-public-key', async (event) => {
  return util.encodeBase64(keyPair.publicKey);
});

/**
 * Handles the 'sign-message' message.
 * Signs the message with the secret key and returns the signature.
 *
 * @param {Object} event - The event object.
 * @param {string} message - The message to be signed.
 * @returns {string} The signature as a base64-encoded string.
 */
ipcMain.handle('sign-message', async (event, message) => {
  const messageUint8 = util.decodeUTF8(message);
  const signatureUint8 = nacl.sign.detached(messageUint8, keyPair.secretKey);
  return util.encodeBase64(signatureUint8);
});

/**
 * Creates a new panel window with the specified URL and public key.
 *
 * @param {string} url - The URL for the panel window.
 * @param {string} userPublicKeyBase64 - The public key as a base64-encoded string.
 */
function createPanelWindow(url, userPublicKeyBase64) {
  const panelWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'panel-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  panelWindow.loadFile('panel.html');

  panelWindow.webContents.on('did-finish-load', () => {
    const wallet = deriveWallet(userPublicKeyBase64, url);

    panelWindow.webContents.send('initialize', {
      url: url,
      wallet: wallet,
    });
  });

  panels.push(panelWindow);
}

/**
 * Derives a wallet for the panel based on the public key and URL.
 *
 * @param {string} publicKeyBase64 - The public key as a base64-encoded string.
 * @param {string} url - The URL for the panel window.
 * @returns {string} The derived wallet.
 */
function deriveWallet(publicKeyBase64, url) {
  const hashInput = publicKeyBase64 + url;
  const hashUint8 = nacl.hash(util.decodeUTF8(hashInput));
  const wallet = util.encodeBase64(hashUint8).substring(0, 32); // Get first 32 characters

  return wallet;
}