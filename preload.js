const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, limited API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  getAlwaysOnTop:   () => ipcRenderer.invoke('get-always-on-top'),
  minimizeWindow:   () => ipcRenderer.invoke('minimize-window'),

  // Platform info for conditional UI
  platform: process.platform,
});
