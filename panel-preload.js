const { contextBridge, ipcRenderer } = require('electron');

let panelData = null;

ipcRenderer.on('initialize', (event, data) => {
    console.log('Received initialize event with data:', data);
    panelData = data;
    console.log('Panel data:', panelData);

    if (data.url) {
        console.log('Sending load-url event with URL:', data.url);
        ipcRenderer.send('load-url', data.url);
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
