const {app, BrowserWindow, ipcMain, systemPreferences, protocol } = require('electron');

const { createWindow } = require('./windows');
const { initUpdater } = require('./updater');

let dev = false;

let win;
let splash;
let result;
// Create window on electron intialization
app.on('ready', async () => {
    console.log('ready -----');
    result = await createWindow(dev);
    // console.log('result ----------------' , result);
    splash = result.splash;
    win = result.win;
});


app.on('before-quit', function () {
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    // macOS specific close process
    console.log('ONBEFOREUNLOAD -----');
    // protocol.registerSchemesAsPrivileged([
    //     { scheme: 'file', privileges: { standard: true, supportFetchAPI: true, secure: true } }
    // ]);
    if (win === null) {
        win = await createMainWindow(dev)
    }
});

exports.setBadge = (count) => app.badgeCount = (count >= 0) ? count : 0;
exports.getPlatformName = () => process.platform;
exports.getVersionName = () => app.getVersion();
// AUTO UPDATER
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });

let currentStatus = null;
console.error(__dirname);
ipcMain.on('online-status-changed', (event, status) => {
    console.log('on -----');
    // console.log(status);
    if (status === 'online' && currentStatus !== 'online') {
    currentStatus = 'online';
    splash.loadURL(`file://${__dirname}/assets/splash_private.html?connection=1`);
    console.info(`file://${__dirname}/dist/index.html`)
    win.loadURL(`file://${__dirname}/dist/index.html`);
    // win.loadURL(`https://piman.private-discuss.com`);
    win.once('ready-to-show', async () => {
        splash.destroy();
    win.show();
    currentStatus = null;
    const isAllowedMicrophone = await systemPreferences.askForMediaAccess('microphone');
    const isAllowedCamera = await systemPreferences.askForMediaAccess('camera');
    console.log("MICROHPHONE ALLOWED ------" + isAllowedMicrophone);
    console.log("Camera ALLOWED ------" + isAllowedCamera);
    initUpdater(win);
});
} else if (status === 'offline' && currentStatus !== 'offline') {
    currentStatus = 'offline';
    splash.loadURL(`file://${__dirname}/assets/splash_private.html?connection=0`);
}
});

ipcMain.on('download-btn', (e, args) => {
    console.log('---- on download-btn');
    download(BrowserWindow.getFocusedWindow(), args.url)
.then(dl => {
    // console.log(dl.getSavePath());
})
.catch(console.error);
});

ipcMain.on("download", (event, info) => {
    console.log("ipcMain download triggerd");
});
