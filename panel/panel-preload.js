const { contextBridge, ipcRenderer } = require('electron');

let panelData = null;

ipcRenderer.on('initialize', (event, data) => {
    console.log('Received initialize event with data:', data);
    panelData = data;

    if (data.url) {
        console.log('Sending create-web-contents-view event with URL:', data.url);
        ipcRenderer.send('create-web-contents-view', data.url); // Send the URL to the main process
    } else {
        console.error('No URL provided in initialize event');
    }

    if (data.signature) {
        console.log('Signature:', data.signature);
        ipcRenderer.send('load-signature', data.signature);
    } else {
        console.error('No signature provided in initialize event');
    }
});

contextBridge.exposeInMainWorld('panelAPI', {
    getPublicKey: () => panelData ? panelData.publicKey : null,
    getUrl: () => panelData ? panelData.url : null,
    getSignature: () => panelData ? panelData.signature : null,
    onReady: (callback) => {
        if (panelData) {
            callback();
        } else {
            ipcRenderer.once('initialize', () => callback());
        }
    },
});
