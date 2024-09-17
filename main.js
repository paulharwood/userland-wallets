const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initializeIPC } = require('./services/wallets');

let userlandWindow;

app.dock.hide();

/**
 * Creates the main userland window of the application.
 * @function
 * @name createUserland
 */
function createUserland() {
    userland = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'userland', 'userland-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    userland.loadFile(path.join(__dirname, 'userland', 'userland.html'));
    userland.webContents.openDevTools(); // For debugging
}

/**
 * Event handler that runs when the application is ready.
 * It initializes the IPC handlers and creates the main userland window.
 * @listens app#whenReady
 */
app.whenReady().then(() => {
    initializeIPC(); // Initialize IPC handlers
    createUserland();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});