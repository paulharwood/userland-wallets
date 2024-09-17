const { ipcMain } = require('electron');
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const { Wallet } = require('@nano/wallet');

let keyPair;
let nanoWallet;

function initializeIPC() {
    ipcMain.handle('get-public-key', () => {
        return keyPair ? keyPair.publicKey : null;
    });

    ipcMain.handle('sign-message', (event, message) => {
        if (typeof message !== 'string') {
            throw new Error('Message must be a string');
        }
        const signature = nacl.sign.detached(util.decodeUTF8(message), keyPair.secretKey);
        return util.encodeBase64(signature);
    });

    ipcMain.handle('generate-wallet', async () => {
        try {
            // Generate a new Nano wallet
            nanoWallet = new Wallet();
            await nanoWallet.generate(); // Generate the wallet
            return {
                address: nanoWallet.address,
                seed: nanoWallet.seed,
            };
        } catch (error) {
            console.error('Error generating wallet:', error);
            throw new Error('Failed to generate wallet.');
        }
    });

    ipcMain.handle('get-wallet-balance', async (event, walletAddress) => {
        try {
            // Assuming you have a method to get the balance from the Nano network
            const balance = await nanoWallet.getBalance(walletAddress);
            return balance;
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            throw new Error('Failed to fetch wallet balance.');
        }
    });

    ipcMain.on('open-panel', (event, { url, signature, publicKey }) => {
        // Handle panel opening logic here
    });
}

function setKeyPair(pair) {
    keyPair = pair;
}

module.exports = {
    initializeIPC,
    setKeyPair,
};
