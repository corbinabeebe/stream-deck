const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  start:      ()   => ipcRenderer.send('start'),
  stop:       ()   => ipcRenderer.send('stop'),
  update:     ()   => ipcRenderer.send('update'),
  getStatus:  ()   => ipcRenderer.invoke('getStatus'),
  onStatus:   (cb) => ipcRenderer.on('status', (_, val) => cb(val)),
  onLog:      (cb) => ipcRenderer.on('log',    (_, val) => cb(val)),
});
