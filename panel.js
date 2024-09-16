window.addEventListener('DOMContentLoaded', () => {
  const webview = document.getElementById('webview');

  // Load the URL using the API
  window.electronAPI.receive('load-url', (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Default to http if no protocol is specified
      url = 'http://' + url;
    }

    webview.src = url;
  });
});

// Expose APIs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
});