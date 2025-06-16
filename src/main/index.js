import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function createWindow() {
  console.log('main process', process.cwd());
  // In ES modules, __dirname is not available directly, we need to construct it
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

import axios from 'axios';

app.whenReady().then(() => {
  createWindow();

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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
