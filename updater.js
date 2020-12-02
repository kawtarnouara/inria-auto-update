const { app, ipcMain } = require('electron');
const {autoUpdater} = require("electron-updater");
const ProgressBar = require('electron-progressbar');
const { BrowserWindow } = require('electron')
const { dialog } = require('electron')
var dialogUpdate;
var dialogCheckUpdate;
var showNoUpdatesDialog = exports.showNoUpdatesDialog = false;
let backendData;
let autoUpdateVersion;
exports.initUpdater = (mainWindow) => {
    getUpdateInfo();
    autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "Yra7hy4NWZPvgsNFWWo_" };
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdatesAndNotify();
    let progressBar;
    autoUpdater.on('checking-for-update', () => {
        // sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
        autoUpdateVersion = info.version;
        // mainWindow.webContents.send('update_available');
        if (backendData && backendData.version.toString() === info.version.toString()){
            const data = backendData;
            const version = data.version;
            const description = data.description;
            let force_update = data.force_update;
            const oldVersion = app.getVersion();
            const min_functionning_version = data.min_functionning_version;
            const isFunctionning = versionCompare(oldVersion, min_functionning_version);
            force_update = isFunctionning === -1 ? 1 : force_update;
            dialogCheckUpdate = checkupdateDialog('', {
                version: version,
                old_version: oldVersion,
                details: description ? description : '',
                force_update: force_update,
            });
        }
    });
    autoUpdater.on('update-not-available', (info) => {
        autoUpdater.on('update-not-available', () => {
            if (showNoUpdatesDialog){
                dialog.showMessageBox({
                    title: 'Piman Discuss',
                    message: 'Piman Discuss est à jour.',
                    detail: 'Version ' + app.getVersion()
                });
            }
        });
    });
    autoUpdater.on('error', (err) => {
        // sendStatusToWindow('Error in auto-updater. ' + err);
        // mainWindow.webContents.send('update_error');
        if (progressBar){
            progressBar.close();
        }
        updateDialog('Mise à jour - Inria', {
            title: 'Mise à jour échouée',
            details: "Impossible de terminer la mises à jour de votre application !",
            withButtons: 0,
            success : 0
        });
    });
    autoUpdater.on('download-progress', (progressObj) => {
        if (progressBar != null) {
            progressBar.value = progressObj.percent;
            let MbytesPerSecond = parseFloat((progressObj.bytesPerSecond / 1000000).toFixed(2));
            let log_message = "Vitesse de téléchargement: " + MbytesPerSecond + "MB/s  \n";
            let transferredMBytes = parseFloat((progressObj.transferred / 1000000).toFixed(2));
            let totalMBytes = parseFloat((progressObj.total / 1000000).toFixed(2));
            progressBar.detail = log_message + `Téléchargé ${transferredMBytes} MB sur ${totalMBytes} MB ...`;
        }
        // sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', (info) => {
        // sendStatusToWindow('Update downloaded');
        // setTimeout(function() {
        //     autoUpdater.quitAndInstall();
        // }, 5000)
        // mainWindow.webContents.send('update_downloaded');
        if (progressBar){
            progressBar.close();
        }
         dialogUpdate = updateDialog('Mise à jour - Inria', {
            title: 'Mise à jour terminée',
            details: "Votre application a été mise à jour. Vous devez redémarrer l'application maintenant",
            withButtons: 1,
            success : 1
        });

    });

    ipcMain.on('restart_app', () => {
        dialogUpdate.destroy();
        dialogUpdate = null;
        setImmediate(() => {
            app.removeAllListeners('window-all-closed');
            autoUpdater.quitAndInstall();
        });
    });

    ipcMain.on('cancel_update', () => {
        dialogCheckUpdate.destroy();
        dialogCheckUpdate = null;
    });


    ipcMain.on('update_app', () => {
        autoUpdater.downloadUpdate();
        dialogCheckUpdate.destroy();
        dialogCheckUpdate = null;
        if (!progressBar) {
            progressBar = new ProgressBar({
                indeterminate: false,
                title: 'Mise à jour - Piman Discuss',
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

function checkupdateDialog  (dialogTitle, options)   {
    let dialogFile = new BrowserWindow({
        title: dialogTitle,
        width: 600,
        height: 450,
        frame: false,
        backgroundColor: 'white',
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

    let query = encodeQueryData(options);
    dialogFile.loadURL(`file://${__dirname}/assets/checkUpdateDialog.html?${query}`);
    return dialogFile;
}

function getUpdateInfo ()  {
    const { net } = require('electron')
    var body = JSON.stringify({ platform: 'desktop', os: 'macos', organization_id: 204 });
    const request = net.request({
        method: 'POST',
        url: 'https://api-v2.private-discuss.com/v1.0/release/get',
        protocol: 'https:',
    });
    request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode} ${response.toString()}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

        response.on('data', (chunk) => {
            console.log(`BODY: ${JSON.parse(chunk.toString()).result.data}`)
            backendData = JSON.parse(chunk.toString()).result.data;
        });
        response.on('error', (error) => {
            console.log('error :' + JSON.stringify(error))
        });
    });
    request.on('error', (error) => {
        console.log('error :' + JSON.stringify(error))
    });
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

}

function encodeQueryData(data) {
    const ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}

function versionCompare(v1, v2, options = {zeroExtend: false, lexicographical: false}) {
    const lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend;
    let v1parts = v1.split('.');
    let v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) { v1parts.push('0'); }
        while (v2parts.length < v1parts.length) { v2parts.push('0'); }
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (let i = 0; i < v1parts.length; ++i) {
        if (v2parts.length === i) {
            return 1;
        }

        if (v1parts[i] === v2parts[i]) {
            continue;
        } else if (v1parts[i] > v2parts[i]) {
            return 1;
        } else {
            return -1;
        }
    }

    if (v1parts.length !== v2parts.length) {
        return -1;
    }

    return 0;
}
