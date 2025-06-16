const { contextBridge, ipcRenderer } = require('electron');
window.__PRELOAD_WORKS = true;
console.log('preload works');
contextBridge.exposeInMainWorld('electronAPI', {
  // HTTP request
  console: (msg) => ipcRenderer.send('console', msg),
  sendRequest: (config) => ipcRenderer.invoke('send-request', config),
  
  // Collections API
  getCollections: () => ipcRenderer.invoke('get-collections'),
  createCollection: (collection) => ipcRenderer.invoke('create-collection', collection),
  updateCollection: (id, updates) => ipcRenderer.invoke('update-collection', id, updates),
  deleteCollection: (id) => ipcRenderer.invoke('delete-collection', id),
  
  // Requests API
  getRequests: (collectionId) => ipcRenderer.invoke('get-requests', collectionId),
  addRequest: (collectionId, request) => ipcRenderer.invoke('add-request', collectionId, request),
  updateRequest: (collectionId, requestId, updates) => 
    ipcRenderer.invoke('update-request', collectionId, requestId, updates),
  deleteRequest: (collectionId, requestId) => 
    ipcRenderer.invoke('delete-request', collectionId, requestId),
    
  // Settings API
  getSettings: () => ipcRenderer.invoke('getSettings'),
  saveSettings: (settings) => ipcRenderer.invoke('saveSettings', settings),
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  
  // App control
  reloadApp: () => ipcRenderer.invoke('reload-app')
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});
