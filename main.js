const { app, BrowserWindow, Tray, Menu, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let alwaysOnTop = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 900,
    minHeight: 680,
    title: '0DTE Options Pricer',
    backgroundColor: '#0f0f0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // show once ready-to-show fires
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a simple text-based tray for cross-platform compatibility
  // On macOS this renders as a menu bar item
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    // If icon missing, skip tray (non-fatal)
    return;
  }

  const updateMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '0DTE Options Pricer',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Show Window',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: alwaysOnTop ? '✓ Always on Top' : 'Always on Top',
        click: () => {
          alwaysOnTop = !alwaysOnTop;
          if (mainWindow) mainWindow.setAlwaysOnTop(alwaysOnTop);
          updateMenu();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);
    tray.setContextMenu(contextMenu);
  };

  tray.setToolTip('0DTE Options Pricer');
  updateMenu();

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// IPC handlers called from renderer via preload bridge
ipcMain.handle('toggle-always-on-top', () => {
  alwaysOnTop = !alwaysOnTop;
  if (mainWindow) mainWindow.setAlwaysOnTop(alwaysOnTop);
  return alwaysOnTop;
});

ipcMain.handle('get-always-on-top', () => alwaysOnTop);

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
