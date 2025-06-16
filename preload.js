const { contextBridge, ipcRenderer } = require('electron');
window.__PRELOAD_WORKS = true;
console.log('preload works');
contextBridge.exposeInMainWorld('electronAPI', {
  console: (msg) => ipcRenderer.send('console', msg),
  sendRequest: (config) => ipcRenderer.invoke('send-request', config)
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});
