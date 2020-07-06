export function setContext(dev = false) {
    require('electron-context-menu')({
        showInspectElement: dev,
        showSaveImageAs: true,
        prepend: (params, browserWindow) => [{
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: params.mediaType === 'image'
        }]
    });
}

