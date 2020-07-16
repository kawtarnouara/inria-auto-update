const { notarize } = require('electron-notarize');

async function notarizing() {


    const appName = 'Inria';

    try {
        await notarize({
            appBundleId: 'com.piman-discuss.piman',
            appPath: '/Users/kawtar/apps/discuss-electron-new/release-builds/Inria-darwin-x64/Inria.app',
            appleId: "kawtar.nouara@gmail.com",
            appleIdPassword: ""
        });
    } catch(err){
        console.error('error ' , err)
    }

};
notarizing()
