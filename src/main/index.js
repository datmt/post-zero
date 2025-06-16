import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true
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

  // IPC handler for curl parsing
  const { ipcMain } = require('electron');
  const curlconverter = require('curlconverter');
  ipcMain.handle('parse-curl', async (event, curl) => {
    try {
      const reqObj = curlconverter.toJsonString(curl);
      const parsed = JSON.parse(reqObj);
      // Normalize headers for renderer
      parsed.headers = Array.isArray(parsed.headers)
        ? parsed.headers.map(h => ({ key: h.name, value: h.value }))
        : [];
      return { success: true, request: parsed };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to parse curl' };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
