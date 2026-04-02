const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dotenv = require('dotenv');

let win;
let serviceRunning = false;
let service = null;

// .env location: user data dir when packaged (survives reinstalls), service/ dir in dev
const envPath = app.isPackaged
  ? path.join(app.getPath('userData'), '.env')
  : path.join(__dirname, '..', 'service', '.env');

// Tell twitch.js where to write token refreshes back to
process.env.MACROPAD_ENV_PATH = envPath;

// When packaged, service JS files live in resources/service/ (extraResources).
// They need to resolve npm deps from app.asar/node_modules — set NODE_PATH so
// Node's module resolution finds them there.
if (app.isPackaged) {
  process.env.NODE_PATH = path.join(process.resourcesPath, 'app.asar', 'node_modules');
  require('module').Module._initPaths();
}

// Load env vars before requiring any service modules
dotenv.config({ path: envPath });

// ── Patch console → renderer log pane ────────────────────────────────────────
// logger.js (required by service.js) adds a second layer (file logging) on top
// of this. The chain becomes: logger.js → this patch → real stdout + renderer.
const _realLog   = console.log.bind(console);
const _realError = console.error.bind(console);

function sendLog(args) {
  const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  win?.webContents.send('log', text + '\n');
}

console.log   = (...args) => { _realLog(...args);   sendLog(args); };
console.error = (...args) => { _realError(...args); sendLog(args); };
// ─────────────────────────────────────────────────────────────────────────────

function getService() {
  if (service) return service;
  const dir = app.isPackaged
    ? path.join(process.resourcesPath, 'service')
    : path.join(__dirname, '..', 'service');
  service = require(path.join(dir, 'service'));
  return service;
}

function createWindow() {
  win = new BrowserWindow({
    width: 640,
    height: 520,
    resizable: false,
    title: 'MacroPad Manager',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'renderer.html'));
}

function startService() {
  if (serviceRunning) return;
  const ok = getService().start();
  serviceRunning = ok;
  win?.webContents.send('status', ok ? 'running' : 'stopped');
}

function stopService() {
  if (!serviceRunning) return;
  getService().stop();
  serviceRunning = false;
  win?.webContents.send('status', 'stopped');
}

function reloadService() {
  stopService();
  // Clear require cache for all service modules so they're re-read from disk
  const serviceDir = app.isPackaged
    ? path.join(process.resourcesPath, 'service')
    : path.join(__dirname, '..', 'service');
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(serviceDir)) delete require.cache[key];
  }
  service = null;
  console.log('[MacroPad] Service modules reloaded from disk.');
  startService();
}

ipcMain.on('start', startService);
ipcMain.on('stop', stopService);
ipcMain.on('update', reloadService);
ipcMain.handle('getStatus', () => (serviceRunning ? 'running' : 'stopped'));

app.whenReady().then(() => {
  createWindow();
  win.webContents.once('did-finish-load', startService);
});

app.on('window-all-closed', () => {
  stopService();
  app.quit();
});
