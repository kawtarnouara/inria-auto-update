const {app, BrowserWindow, Menu, session, ipcMain, TouchBar, nativeImage, Tray, systemPreferences, protocol } = require('electron');
const {download} = require('electron-dl');
const ProgressBar = require('electron-progressbar');
var util = require('util');
const fs = require('fs');
var path = require('path');

let dev = false;
let jwt_token = null;

require('electron-context-menu')({
    showInspectElement: dev,
    showSaveImageAs: true,
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'image'
    }]
});

let win;
let splash;

async function createWindow() {
    // Setup permission handler
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        return true;
    });
    // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    //     callback({
    //         responseHeaders: {
    //             ...details.responseHeaders,
    //             'Content-Security-Policy': ['default-src \'none\'']
    //         }
    //     })
    // });
    // Create the browser window.
    win = new BrowserWindow({
        // width: 600,
        // height: 600,
        title: "Private Discuss",
        // fullscreen: true,
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/icons/piman_k9o_icon.icns`,
        nodeIntegration: 'iframe',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
            // enableRemoteModule: false,
            // contextIsolation: true,
        },
        center: true,
        show: false,
    });

    // win.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    //     alert(options);
    // });
    if (dev) {
        win.webContents.openDevTools();
    }
    // win.loadURL(`file://${__dirname}/discuss/index.html#v${app.getVersion()}`);

    // create a new `splash`-Window
    splash = new BrowserWindow({
        width: 300,
        height: 300,
        backgroundColor: '#eeeeee',
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    splash.loadURL(`file://${__dirname}/assets/splash_private.html?connection=1`);

    // win.loadURL(`http://openproject.piman2-0.fr`);

    // if main window is ready to show, then destroy the splash window and show up the main window


    // win.webContents.executeJavaScript(`
    //   var path = require('electron-context-menu')({
    //     prepend: (params, browserWindow) => [{
    //     label: 'Rainbow',
    //     // Only show it when right-clicking images
    //     visible: params.mediaType === 'image'
    //     }]
    //   });
    //   module.paths.push(path.resolve('node_modules'));
    //   module.paths.push(path.resolve('../node_modules'));
    //   module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
    //   module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
    //   module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
    //   module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
    // `);

    //// uncomment below to open the DevTools.
    // win.webContents.openDevTools()

    // Event when the window is closed.
    win.on('closed', function () {
        win = null
    });
    win.on('page-title-updated', function (event) {
        event.preventDefault();
    });

    win.on('close', function (event) {
        app.quit();
    });

    const templateFull = [{
        label: "Application",
        submenu: [
            {label: "À propos de Private Discuss", selector: "orderFrontStandardAboutPanel:"},
            // { label: "Mon profil", selector: "CmdOrCtrl+,",  click: function() { shell.openExternal('https://discuss.piman2-0.fr/account/profil'); }},
            {type: "separator"},
            { label: "Mon profil", accelerator: "CmdOrCtrl+P", click: function (menuItem, browserWindow) {
                    let modifiers = [];
                    modifiers.push('meta'); // 'control', 'meta', etc.
                    modifiers.push('control');
                    browserWindow.webContents.sendInputEvent({type: 'keyDown', modifiers, keyCode: 'P'})
                    browserWindow.webContents.sendInputEvent({ type: 'char', modifiers, keyCode: 'P' })
                    browserWindow.webContents.sendInputEvent({ type: 'keyUp', modifiers, keyCode: 'P' })
                }},
            { label: "Paramètres", accelerator: "CmdOrCtrl+,", click: function (menuItem, browserWindow) {
                    let modifiers = [];
                    modifiers.push('meta'); // 'control', 'meta', etc.
                    modifiers.push('control');
                    browserWindow.webContents.sendInputEvent({type: 'keyDown', modifiers, keyCode: ','})
                    browserWindow.webContents.sendInputEvent({ type: 'char', modifiers, keyCode: ',' })
                    browserWindow.webContents.sendInputEvent({ type: 'keyUp', modifiers, keyCode: ',' })
                }},
            {type: "separator"},
            {
                label: "Quit", accelerator: "Command+Q", click: function () {
                    app.quit();
                }
            }
        ]
    }, {
        label: "Modifier",
        submenu: [
            {label: "Annuler", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
            {label: "Rétablir", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
            {type: "separator"},
            {label: "Couper", accelerator: "CmdOrCtrl+X", selector: "cut:"},
            {label: "Copier", accelerator: "CmdOrCtrl+C", selector: "copy:"},
            {label: "Coller", accelerator: "CmdOrCtrl+V", selector: "paste:"},
            {label: "Tout sélectionner", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
        ]
    } , {
        label: "Fenêtre",
        submenu: [
            {label: "Recharger", accelerator: "CmdOrCtrl+R", click: function () {
                    app.badgeCount = 0;
                    win.reload();
                    // win.loadURL(`file://${__dirname}/dist/index.html`);
                }},
            // {type: "separator"},
            // { label: "Créer une chaîne", accelerator: "CmdOrCtrl+Shift+K", click: function (menuItem, browserWindow) {
            //     let modifiers = [];
            //     modifiers.push('meta'); // 'control', 'meta', etc.
            //     modifiers.push('control');
            //     modifiers.push('shift');
            //     browserWindow.webContents.sendInputEvent({type: 'keyDown', modifiers, keyCode: 'K'});
            //     browserWindow.webContents.sendInputEvent({ type: 'char', modifiers, keyCode: 'K' });
            //     browserWindow.webContents.sendInputEvent({ type: 'keyUp', modifiers, keyCode: 'K' });
            // }},
            // { label: "Démarrer une conversation", accelerator: "CmdOrCtrl+K", click: function (menuItem, browserWindow) {
            //     let modifiers = [];
            //     modifiers.push('meta'); // 'control', 'meta', etc.
            //     modifiers.push('control');
            //     browserWindow.webContents.sendInputEvent({type: 'keyDown', modifiers, keyCode: 'K'});
            //     browserWindow.webContents.sendInputEvent({ type: 'char', modifiers, keyCode: 'K' });
            //     browserWindow.webContents.sendInputEvent({ type: 'keyUp', modifiers, keyCode: 'K' });
            // }},
        ]
    }
    ];

    const templateNotFull = [{
        label: "Application",
        submenu: [
            {label: "À propos de Private Discuss", selector: "orderFrontStandardAboutPanel:"},
            {type: "separator"},
            {
                label: "Quit", accelerator: "Command+Q", click: function () {
                    app.quit();
                }
            }
        ]
    }, {
        label: "Modifier",
        submenu: [
            {label: "Annuler", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
            {label: "Rétablir", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
            {type: "separator"},
            {label: "Couper", accelerator: "CmdOrCtrl+X", selector: "cut:"},
            {label: "Copier", accelerator: "CmdOrCtrl+C", selector: "copy:"},
            {label: "Coller", accelerator: "CmdOrCtrl+V", selector: "paste:"},
            {label: "Tout sélectionner", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
        ]
    } , {
        label: "Fenêtre",
        submenu: [
            {label: "Recharger", accelerator: "CmdOrCtrl+R", click: function () {
                    app.badgeCount = 0;
                    // win.reload();
                    win.loadURL(`file://${__dirname}/dist/index.html`);
                }},
        ]
    }
    ];

    // Check if user is connected to load full menu
    // let current_jwt_token = await win.webContents.executeJavaScript(`window.localStorage.getItem('jwt_token');`);
    // if (current_jwt_token !== null) {
    //     Menu.setApplicationMenu(Menu.buildFromTemplate(templateFull));
    // } else {
    Menu.setApplicationMenu(Menu.buildFromTemplate(templateNotFull));
    // }
    // setInterval(async () => {
    //     // console.log(await localStorage.getItem('jwt_token'));
    //     // Resulting in this getting executed
    //     jwt_token = await win.webContents.executeJavaScript(`window.localStorage.getItem('jwt_token');`);
    //     if (jwt_token !== current_jwt_token) {
    //         if (jwt_token !== null) {
    //             Menu.setApplicationMenu(Menu.buildFromTemplate(templateFull));
    //
    //         } else {
    //             Menu.setApplicationMenu(Menu.buildFromTemplate(templateNotFull));
    //         }
    //         current_jwt_token = jwt_token;
    //     }
    // }, 5000);

    // win.on('new-window', function(event, url){
    //     event.preventDefault();
    //     open(url);
    // });
    downloadManager();

}

// autoUpdater.on('checking-for-update', () => {
//     sendStatusToWindow('Checking for update...');
// });
// autoUpdater.on('update-available', (info) => {
//     sendStatusToWindow('Update available.');
// });
// autoUpdater.on('update-not-available', (info) => {
//     sendStatusToWindow('Update not available.');
// });
// autoUpdater.on('error', (err) => {
//     sendStatusToWindow('Error in auto-updater. ' + err);
// });
// autoUpdater.on('download-progress', (progressObj) => {
//     let log_message = "Download speed: " + progressObj.bytesPerSecond;
//     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//     sendStatusToWindow(log_message);
// });
// autoUpdater.on('update-downloaded', (info) => {
//     sendStatusToWindow('Update downloaded');
//     autoUpdater.quitAndInstall();
// });

// Create window on electron intialization
app.on('ready', createWindow);

app.on('before-quit', function () {
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // macOS specific close process
    console.log('ONBEFOREUNLOAD -----');
    protocol.registerSchemesAsPrivileged([
        { scheme: 'file', privileges: { standard: true, supportFetchAPI: true, secure: true } }
    ]);
    if (win === null) {
        createWindow()
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
ipcMain.on('online-status-changed', (event, status) => {
    // console.log(status);
    if (status === 'online' && currentStatus !== 'online') {
        currentStatus = 'online';
        splash.loadURL(`file://${__dirname}/assets/splash_private.html?connection=1`);
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
        });
    } else if (status === 'offline' && currentStatus !== 'offline') {
        currentStatus = 'offline';
        splash.loadURL(`file://${__dirname}/assets/splash_private.html?connection=0`);
    }
});

ipcMain.on('download-btn', (e, args) => {
    download(BrowserWindow.getFocusedWindow(), args.url)
        .then(dl => {
            // console.log(dl.getSavePath());
        })
        .catch(console.error);
});

function downloadManager() {
    session.defaultSession.on('will-download', function(event, downloadItem, webContents){
        "use strict";
        // console.log("dowloader is called with event", util.inspect(downloadItem));
        var totalByte = downloadItem.getTotalBytes();
        var totalMByte = parseFloat((totalByte / 1000000).toFixed(2));
        // console.log('File Size', totalMByte+' MB');
        var progressBar = null;
        downloadItem.on('updated', function (event, state) {
            // console.log("download item event triggred with state : "+ state);
            let receviedBytes = downloadItem.getReceivedBytes();
            let receviedMBytes = parseFloat((receviedBytes / 1000000).toFixed(2));
            if (state === 'interrupted') {
                // console.log('Download is interrupted');
                setTimeout(function () {
                    // progressBar.close();
                }, 5000);
            } else if (state === 'progressing') {
                if (totalByte> 0 && receviedBytes > 0) {
                    // Download progressing + started
                    // console.log("download is processing with size : "+receviedMBytes+" MB");
                    if (progressBar === null) {
                        progressBar = new ProgressBar({
                            indeterminate: false,
                            title: 'Téléchargement - Private Discuss',
                            text: 'En téléchargement ...',
                            detail: 'Préparation des données ...',
                            closeOnComplete: false
                        });
                    }
                    if (progressBar.value !== 100) {
                        progressBar.value = (receviedBytes / totalByte) * 100;
                    }
                    progressBar.detail = `Téléchargé ${receviedMBytes} MB sur ${totalMByte} MB ...`;
                }
            }
        });

        downloadItem.once('done', function(event, state) {
            // console.log("INSIDE DONE with state : " + state);
            if (state === 'completed') {
                if (progressBar) {
                    let path = downloadItem.getSavePath();
                    progressBar.close();
                    let dialogFile = new BrowserWindow({
                        title: "Téléchargement - Private Discuss", width: 500, height: 170, backgroundColor: '#eeeeee', nodeIntegration: 'iframe', resizable: false
                    });
                    dialogFile.loadURL(`file://${__dirname}/assets/dialogFile.html?file=${path}`);
                }
            } else {
                if (progressBar) {
                    progressBar.text = `Échec du téléchargement`;
                    setTimeout(function () {
                        progressBar.close();
                    }, 3000);
                }
            }
        });
        // session.defaultSession.clearStorageData([], function () {// console.log(' cleared all storages after download ');});
        session.defaultSession.clearCache(function(){
            // console.log('cleared all caches after download');
        });
    });
}

function base64_encode(file) {
    // read binary data
    let bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}
