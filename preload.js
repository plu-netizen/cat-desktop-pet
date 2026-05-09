const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  moveBy: (dx, dy) => ipcRenderer.send('move-window-by', { dx, dy }),
  moveTo: (x, y) => ipcRenderer.send('move-window-to', { x, y }),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  getWindowSize: () => ipcRenderer.invoke('get-window-size')
});
