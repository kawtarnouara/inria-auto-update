const {app, BrowserWindow, Menu, session, ipcMain, TouchBar, nativeImage, Tray, systemPreferences, protocol } = require('electron');
const {autoUpdater} = require("electron-updater");

app.on('ready', createWindow);

async function createWindow() {
    dialogFile = new BrowserWindow({
        title: "Mise à jour - Private Discuss",
        width: 500,
        height: 170,
        backgroundColor: '#eeeeee',
        nodeIntegration: 'iframe',
        resizable: false,
        closable: false,
        fullscreenable: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        },
        center: true
    });
    let title = "Test title";
    let details = "Lorem ipsem kaka Lorem ipsem kaka Lorem ipsem kaka";
    let query = encodeQueryData({
        title: title,
        details: details,
        withButtons: 1,
        success : 1
    });
    dialogFile.loadURL(`file://${__dirname}/assets/updateDialog.html?${query}`);
    console.log(`file://${__dirname}/assets/updateDialog.html?${query}`);

    ipcMain.on('restart_app', () => {
        console.log('aps');
        // autoUpdater.quitAndInstall();
    });
}

function encodeQueryData(data) {
    const ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}
