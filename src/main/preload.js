const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  parseCurl: (curl) => ipcRenderer.invoke('parse-curl', curl)
});
