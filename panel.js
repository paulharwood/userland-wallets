console.log('panel.js is running');

document.addEventListener('DOMContentLoaded', () => {
	const publicKeyDisplay = document.getElementById('publicKeyDisplay');

	if (window.panelAPI) {
		window.panelAPI.onReady(() => {
			const publicKey = window.panelAPI.getPublicKey();
			const url = window.panelAPI.getUrl();
			const signature = window.panelAPI.getSignature();

			console.log('Public Key:', publicKey);
			console.log('URL:', url);
			console.log('Signature:', signature);

			publicKeyDisplay.textContent = `Public Key: ${publicKey}`;
		});
	} else {
		console.error('panelAPI not available');
	}
});