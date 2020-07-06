## Installation :

### Building versions

#### Piman :

- Edit `package.json` :

    - "name": "Private Discuss"
    - "version": "x.x.x"
    - "main": "./main.js"

#### Private :

- Edit `package.json` :

    - "name": "Private Discuss"
    - "version": "x.x.x"
    - "main": "./main_private.js"

### Generate Windows Version :

`electron-packager . --platform=win32 --icon=/<projectPATH>//icons/piman_k9o_icon.ico --out=release-builds --electron-version=4.0.1 --overwrite`

### Generate Mac version:

`electron-packager . --platform=darwin --icon=/<projectPATH>/icons/piman_k9o_icon.icns --out=release-builds --electron-version=4.0.1 --overwrite`

### Generate Linux version:

`electron-packager . --platform=linux --icon=/<projectPATH>/icons/piman.png --out=release-builds --electron-version=4.0.1 --overwrite`
