const { ipcMain } = require('electron');
const {autoUpdater} = require("electron-updater");
const ProgressBar = require('electron-progressbar');
const { BrowserWindow } = require('electron')
var dialogUpdate;
exports.initUpdater = (mainWindow) => {

    autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "Yra7hy4NWZPvgsNFWWo_" };
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify();
    let progressBar;
    autoUpdater.on('checking-for-update', () => {
        // sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
        // mainWindow.webContents.send('update_available');
        console.info('updaare')
        if (!progressBar) {
            progressBar = new ProgressBar({
                indeterminate: false,
                title: 'Mise à jour - Private Discuss',
                text: 'En téléchargement ...',
                detail: 'Préparation de la nouvelle version ...',
                closeOnComplete: false,
                browserWindow: {
                    parent: null,
                    modal: true,
                    resizable: false,
                    closable: false,
                    minimizable: false,
                    maximizable: false,
                    width: 500,
                    height: 170,
                    webPreferences: {
                        nodeIntegration: true
                    }
                }
            });
        }
    });
    autoUpdater.on('update-not-available', (info) => {
        // sendStatusToWindow('Update not available.');
    });
    autoUpdater.on('error', (err) => {
        // sendStatusToWindow('Error in auto-updater. ' + err);
        // mainWindow.webContents.send('update_error');
        progressBar.close();
        updateDialog('Mise à jour - Private Discuss', {
            title: 'Mise à jour échouée',
            details: "Impossible de terminer la mises à jour de votre application !",
            withButtons: 0,
            success : 0
        });
    });
    autoUpdater.on('download-progress', (progressObj) => {
        if (progressBar != null) {
            progressBar.value = progressObj.percent;
            let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond + "\n";
            progressBar.detail = log_message + `Téléchargé ${progressObj.transferred} sur ${progressObj.total} ...`;
        }
        // sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', (info) => {
        // sendStatusToWindow('Update downloaded');
        // setTimeout(function() {
        //     autoUpdater.quitAndInstall();
        // }, 5000)
        // mainWindow.webContents.send('update_downloaded');
        progressBar.close();
         dialogUpdate = updateDialog('Mise à jour - Private Discuss', {
            title: 'Mise à jour terminée',
            details: "Votre application a été mise à jour. Vous devez redémarrer l'application maintenant",
            withButtons: 1,
            success : 1
        });

    });

    ipcMain.on('restart_app', () => {
        dialogUpdate.destroy();
        autoUpdater.quitAndInstall();
    });

};

function sendStatusToWindow(text) {
    console.log(text);
}

function updateDialog(dialogTitle, options) {
    let dialogFile = new BrowserWindow({
        title: dialogTitle,
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
    // let query = encodeQueryData({
    //     title: title,
    //     details: details,
    //     withButtons: 0,
    //     success : 0
    // });
    let query = encodeQueryData(options);
    dialogFile.loadURL(`file://${__dirname}/assets/updateDialog.html?${query}`);
    return dialogFile;
}

function encodeQueryData(data) {
    const ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}
