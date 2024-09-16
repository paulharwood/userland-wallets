// panel-preload.js
const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.on('initialize', (event, data) => {
  const { url, wallet } = data;

  // Expose wallet to the webview content
  contextBridge.exposeInMainWorld('walletAPI', {
    getWallet: () => wallet,
  });

  // Load the URL
  ipcRenderer.send('load-url', url);
});

ipcRenderer.on('load-url', (event, url) => {
  // This can be used if you need to handle URL loading in the preload
});
