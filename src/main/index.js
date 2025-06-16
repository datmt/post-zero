import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { Storage } from '../shared/storage.js';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize storage with app userData path
let storage;

/**
 * Initialize the main window
 */
async function createWindow() {
  // Initialize storage
  storage = new Storage(app.getPath('userData'));
  console.log('main process', process.cwd());
  // In ES modules, __dirname is not available directly, we need to construct it
  const preloadPath = path.join(__dirname, 'preload.js');
  //log preload
  console.log('preload path', preloadPath);
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,

    }
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    win.loadFile(path.join(__dirname, '../../build/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // HTTP request handler
  ipcMain.handle('send-request', async (event, config) => {
    console.log('Sending request:', config);
    try {
      // Set validateStatus here in main process instead of renderer
      const axiosConfig = {
        ...config,
        validateStatus: () => true // Accept any status code
      };
      const res = await axios(axiosConfig);
      return {
        success: true,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        data: res.data
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
        status: e.response?.status || 0,
        statusText: e.response?.statusText || 'Error',
        headers: e.response?.headers || {},
        data: e.response?.data || null
      };
    }
  });
  
  // Collection handlers
  ipcMain.handle('get-collections', async () => {
    try {
      return { success: true, data: storage.getCollections() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('create-collection', async (event, collection) => {
    try {
      const newCollection = storage.createCollection(collection);
      return { success: true, data: newCollection };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('update-collection', async (event, id, updates) => {
    try {
      const updated = storage.updateCollection(id, updates);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('delete-collection', async (event, id) => {
    try {
      const result = storage.deleteCollection(id);
      return { success: result, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // Request handlers
  ipcMain.handle('get-requests', async (event, collectionId) => {
    try {
      const requests = storage.getRequests(collectionId);
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('add-request', async (event, collectionId, request) => {
    try {
      const newRequest = storage.addRequest(collectionId, request);
      return { success: true, data: newRequest };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('update-request', async (event, collectionId, requestId, updates) => {
    try {
      const updated = storage.updateRequest(collectionId, requestId, updates);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('delete-request', async (event, collectionId, requestId) => {
    try {
      const result = storage.deleteRequest(collectionId, requestId);
      return { success: result, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
