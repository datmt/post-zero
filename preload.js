const { contextBridge, ipcRenderer } = require('electron');
window.__PRELOAD_WORKS = true;
console.log('preload works');
contextBridge.exposeInMainWorld('electronAPI', {
  console: (msg) => ipcRenderer.send('console', msg),
  sendRequest: (config) => ipcRenderer.invoke('send-request', config),
  
  // Collection management
  getCollections: () => ipcRenderer.invoke('get-collections'),
  createCollection: (collection) => ipcRenderer.invoke('create-collection', collection),
  updateCollection: (id, updates) => ipcRenderer.invoke('update-collection', id, updates),
  deleteCollection: (id) => ipcRenderer.invoke('delete-collection', id),
  
  // Request management
  getRequests: (collectionId) => ipcRenderer.invoke('get-requests', collectionId),
  addRequest: (collectionId, request) => ipcRenderer.invoke('add-request', collectionId, request),
  updateRequest: (collectionId, requestId, updates) => ipcRenderer.invoke('update-request', collectionId, requestId, updates),
  deleteRequest: (collectionId, requestId) => ipcRenderer.invoke('delete-request', collectionId, requestId)
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});
