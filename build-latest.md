# MAC

## Generate .app :

./node_modules/.bin/electron-packager . --platform=darwin --icon=/Users/mac/Projects/discuss/electron/helpers/icons/piman_k9o_icon.icns  --out=release-builds --electron-version=7.1.1 --overwrite --osx-sign.identity="Mac Developer: Oussama BOUISFI (HSLSLC78PQ)"

## Generate DMG from .app :

./node_modules/.bin/electron-installer-dmg ../release-builds/discuss-darwin-x64/discuss.app Discuss --out="../release-builds" --icon="../helpers/icons/piman.png" --background="../helpers/icons/dmg_splash.png" --title="Installation Private Discuss" --overwrite
