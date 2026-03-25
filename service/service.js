require('dotenv').config();
const { uIOhook }                                              = require('uiohook-napi');
const { postChatMessage, createStreamMarker, startCommercial } = require('./twitch');
const { setScene, startStream, stopStream, toggleMic, refreshBrowserSources } = require('./obs');
const { getAction }                                            = require('./config');

// Validate required env vars before starting
const required = ['CLIENT_ID', 'CLIENT_SECRET', 'ACCESS_TOKEN', 'BROADCASTER_ID', 'SENDER_ID'];
const missing  = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Run `npm run auth` to complete setup.');
  process.exit(1);
}

console.log('[MacroPad] Service started — listening for hotkeys...\n');

uIOhook.on('keydown', async (event) => {
  const action = getAction(event);
  if (!action) return;

  const ts = new Date().toLocaleTimeString();
  process.stdout.write(`[${ts}] ${action.label} ... `);

  try {
    switch (action.type) {
      // ── OBS actions ──────────────────────────────────────────────────────────
      case 'obs_scene':
        await setScene(action.scene);
        console.log(`→ scene: ${action.scene}`);
        break;

      case 'obs_start':
        await startStream();
        console.log('→ stream started');
        break;

      case 'obs_stop':
        await stopStream();
        console.log('→ stream stopped');
        break;

      case 'obs_mic':
        await toggleMic();
        console.log('→ mic toggled');
        break;

      case 'obs_refresh':
        await refreshBrowserSources();
        console.log('→ browser sources refreshed');
        break;

      // ── Twitch actions ───────────────────────────────────────────────────────
      case 'chat':
        await postChatMessage(action.message);
        console.log(`→ ${action.message}`);
        break;

      case 'marker':
        await createStreamMarker();
        console.log('→ VOD marker created');
        break;

      case 'ad':
        await startCommercial(action.duration);
        console.log(`→ ${action.duration}s ad break started`);
        break;

      default:
        console.log('→ unknown action type');
    }
  } catch (err) {
    console.error(`FAILED — ${err.message}`);
  }
});

uIOhook.start();

process.on('SIGINT', () => {
  uIOhook.stop();
  console.log('\n[MacroPad] Service stopped.');
  process.exit(0);
});
