const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('userlandAPI', {
  getPublicKey: () => ipcRenderer.invoke('get-public-key'),
  signMessage: (message) => ipcRenderer.invoke('sign-message', message),
  openPanel: (data) => ipcRenderer.send('open-panel', data),
});