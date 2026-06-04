import { app, BrowserWindow } from 'electron';

let win;

function createWindow() {
  win = new BrowserWindow({ 
    width: 800, 
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Modern ESM way to resolve file paths
  win.loadURL(new URL('./index.html', import.meta.url).href);

  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

// Modern recommended way to wait for app readiness
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
