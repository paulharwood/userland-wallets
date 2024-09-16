// // renderer.js (Userland)
// const { ipcRenderer } = require('electron');
// const nacl = require('tweetnacl');
// const util = require('tweetnacl-util');

// renderer.js (Userland)
document.getElementById('goButton').addEventListener('click', () => {
  const url = document.getElementById('locationBar').value;

  // Sign the URL using the exposed API
  const signatureBase64 = window.userlandAPI.signMessage(url);
  const publicKeyBase64 = window.userlandAPI.getPublicKey();

  // Send the signed request to the main process via the exposed API
  window.userlandAPI.openPanel({
    url: url,
    signature: signatureBase64,
    publicKey: publicKeyBase64,
  });
});