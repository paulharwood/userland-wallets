// webview-preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('walletAPI', {
  getWallet: () => ipcRenderer.invoke('get-wallet'),
});

ipcRenderer.on('send-wallet', (event, wallet) => {
  // Expose the wallet to the web page
  window.wallet = wallet;
  console.log('Wallet connected:', window.wallet);
});
