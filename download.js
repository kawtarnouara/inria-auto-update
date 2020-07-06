const { session, BrowserWindow, app } = require('electron');
const ProgressBar = require('electron-progressbar');

exports.downloadManager = function () {
    session.defaultSession.on('will-download', function(event, downloadItem, webContents){
        "use strict";
        // console.log(app.getPath('downloads'), downloadItem.getURL(), downloadItem.getFilename(), downloadItem.getMimeType());
        // .replace : to trim all "/" characters from downloads path
        const separator = process.platform === 'darwin' ? '/' :'\\';
        let downloadPath = (process.platform === 'darwin' ? '/' : '') + app.getPath('downloads').replace(/^\/+|\/+$/g, '') + separator + downloadItem.getFilename();
        const fs = require('fs');

        const downloadFolder = (process.platform === 'darwin' ? '/' : '')  + app.getPath('downloads').replace(/^\/+|\/+$/g, '') + separator;
        let downloadFileName = downloadItem.getFilename();
        let downloadFilePath;
        try {
            let suffix = "";
            let splitArray = downloadFileName.split(".");
            if (splitArray.length === 2) {
                const filename = splitArray[0];
                const extension = splitArray[1];
                let increment = 1;
                do {
                    downloadFilePath = downloadFolder + filename + suffix + '.' + extension;
                    suffix = suffix + "_" + increment;
                    increment++;
                } while (fs.existsSync(downloadFilePath));
            } else {
                downloadFilePath = downloadFolder + downloadFileName;
            }
        } catch(err) {
            downloadFilePath = downloadFolder + downloadFileName;
        }
        console.log('download path : ' + downloadPath + ' - file exists : ' + fs.existsSync(downloadFilePath));
        downloadItem.setSavePath(downloadFilePath);

        // var util = require('util');
        // console.log("dowloader is called with event", util.inspect(downloadItem));
        var totalByte = downloadItem.getTotalBytes();
        var totalMByte = parseFloat((totalByte / 1000000).toFixed(2));
        // console.log('File Size', totalMByte+' MB');
        var progressBar = null;
        downloadItem.on('updated', function (event, state) {
            "use strict";
            // console.log("download item event triggred with state : "+ state, event.sender.getContentDisposition());
            let receviedBytes = downloadItem.getReceivedBytes();
            let receviedMBytes = parseFloat((receviedBytes / 1000000).toFixed(2));
            console.log("received bytes : "+ receviedBytes);
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
                    if (progressBar.value !== 100) {
                        progressBar.value = (receviedBytes / totalByte) * 100;
                    }
                    console.log('progressBar detail updated');
                    progressBar.detail = `Téléchargé ${receviedMBytes} MB sur ${totalMByte} MB ...`;
                }
            }
        });

        downloadItem.once('done', function(event, state) {
            console.log("INSIDE DONE with state : " + state);
            if (state === 'completed') {
                if (progressBar) {
                    let path = downloadItem.getSavePath();
                    progressBar.close();
                    let dialogFile = new BrowserWindow({
                        title: "Téléchargement - Private Discuss",
                        width: 500,
                        height: 170,
                        backgroundColor: '#eeeeee',
                        nodeIntegration: 'iframe',
                        resizable: false,
                        webPreferences: {
                            nodeIntegration: true
                        }
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
    });
};
