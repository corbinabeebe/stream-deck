const OBSWebSocket = require('obs-websocket-js').default;

const obs       = new OBSWebSocket();
let   connected = false;
let   keepAliveTimer = null;

let reconnectTimer = null;

function onDisconnected() {
  connected = false;
  clearInterval(keepAliveTimer);
  keepAliveTimer = null;
  scheduleReconnect();
}

function scheduleReconnect(delay = 5_000) {
  if (reconnectTimer) return; // already scheduled
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await ensureConnected();
    } catch {
      // OBS not running yet — keep retrying every 5s until it comes back
      scheduleReconnect();
    }
  }, delay);
}

obs.on('ConnectionClosed', onDisconnected);
obs.on('ConnectionError',  onDisconnected);

// Lazy-connect: called automatically before every OBS action.
// OBS does not need to be running when the service starts.
async function ensureConnected() {
  if (connected) return;
  const port     = process.env.OBS_WS_PORT     || 4455;
  const password = process.env.OBS_WS_PASSWORD || '';
  try {
    await obs.connect(`ws://127.0.0.1:${port}`, password);
  } catch (err) {
    connected = false;
    throw err;
  }
  connected = true;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  console.log('[OBS] WebSocket connected');

  // Ping every 30s so silent TCP drops are detected and trigger reconnect.
  keepAliveTimer = setInterval(async () => {
    try {
      await obs.call('GetVersion');
    } catch {
      onDisconnected();
    }
  }, 30_000);
}

async function setScene(sceneName) {
  await ensureConnected();
  await obs.call('SetCurrentProgramScene', { sceneName });
}

async function startStream() {
  await ensureConnected();
  await obs.call('StartStream');
}

async function stopStream() {
  await ensureConnected();
  await obs.call('StopStream');
}

// Toggles the mic source mute state.
// Set OBS_MIC_SOURCE in .env to match your audio input source name in OBS.
async function toggleMic() {
  await ensureConnected();
  const inputName = process.env.OBS_MIC_SOURCE || 'Mic/Aux';
  await obs.call('ToggleInputMute', { inputName });
}

// Clicks "Refresh cache" on every browser source in the scene collection.
async function refreshBrowserSources() {
  await ensureConnected();
  const { inputs } = await obs.call('GetInputList', { inputKind: 'browser_source' });
  for (const { inputName } of inputs) {
    await obs.call('PressInputPropertiesButton', { inputName, propertyName: 'refreshnocache' });
  }
}

module.exports = { setScene, startStream, stopStream, toggleMic, refreshBrowserSources };
