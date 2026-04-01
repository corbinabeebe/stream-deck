require('./logger');
const { uIOhook }                                              = require('uiohook-napi');
const { postChatMessage, createClip, startCommercial }        = require('./twitch');
const { setScene, startStream, stopStream, toggleMic, refreshBrowserSources } = require('./obs');
const { getAction }                                            = require('./config');

const REQUIRED = ['CLIENT_ID', 'CLIENT_SECRET', 'ACCESS_TOKEN', 'BROADCASTER_ID', 'SENDER_ID'];

async function handleKeydown(event) {
  const action = getAction(event);
  if (!action) return;

  const ts     = new Date().toLocaleTimeString();
  const prefix = `[${ts}] ${action.label}`;

  try {
    switch (action.type) {
      // ── OBS actions ──────────────────────────────────────────────────────────
      case 'obs_scene':
        await setScene(action.scene);
        console.log(`${prefix} → scene: ${action.scene}`);
        break;

      case 'obs_start':
        await startStream();
        console.log(`${prefix} → stream started`);
        break;

      case 'obs_stop':
        await stopStream();
        console.log(`${prefix} → stream stopped`);
        break;

      case 'obs_mic':
        await toggleMic();
        console.log(`${prefix} → mic toggled`);
        break;

      case 'obs_refresh':
        await refreshBrowserSources();
        console.log(`${prefix} → browser sources refreshed`);
        break;

      // ── Twitch actions ───────────────────────────────────────────────────────
      case 'chat':
        await postChatMessage(action.message);
        console.log(`${prefix} → ${action.message}`);
        break;

      case 'clip':
        await createClip();
        console.log(`${prefix} → clip created`);
        break;

      case 'ad':
        await startCommercial(action.duration);
        console.log(`${prefix} → ${action.duration}s ad break started`);
        break;

      default:
        console.log(`${prefix} → unknown action type`);
    }
  } catch (err) {
    console.error(`${prefix} FAILED — ${err.message}`);
  }
}

function start() {
  const missing = REQUIRED.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`[MacroPad] Missing env vars: ${missing.join(', ')}`);
    console.error('[MacroPad] Check your .env file and restart.');
    return false;
  }

  console.log('[MacroPad] Service started — listening for hotkeys...\n');
  uIOhook.on('keydown', handleKeydown);
  uIOhook.start();
  return true;
}

function stop() {
  uIOhook.removeListener('keydown', handleKeydown);
  uIOhook.stop();
  console.log('[MacroPad] Service stopped.');
}

module.exports = { start, stop };

// Allow running directly via `npm start` in the service/ directory
if (require.main === module) {
  require('dotenv').config();
  const ok = start();
  if (!ok) process.exit(1);
  process.on('SIGINT', () => { stop(); process.exit(0); });
}
