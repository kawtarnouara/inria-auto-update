const { notarize } = require('electron-notarize');

async function notarizing() {


    const appName = 'Private Discuss';

    try {
        await notarize({
            appBundleId: 'com.piman-discuss.piman',
            appPath: '/Users/kawtar/apps/discuss-electron-new/release-builds/Private Discuss-darwin-x64/Private Discuss.app',
            appleId: "kawtar.nouara@gmail.com",
            appleIdPassword: ""
        });
    } catch(err){
        console.error('error ' , err)
    }

};
notarizing()
