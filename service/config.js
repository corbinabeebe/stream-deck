const { UiohookKey } = require('uiohook-napi');

// ── Layer 0 — Ctrl+Alt+Shift hotkeys → OBS WebSocket (via obs.js) ─────────────
// MacroPad sends these; the service intercepts and calls OBS WebSocket directly,
// so OBS does NOT need to be the active window.
//
// Scene names must match your OBS scene names exactly.
const ctrlAltShiftHotkeys = {
  [UiohookKey.F1]:  { type: 'obs_scene',   scene: 'Stream Starting', label: 'STARTING' },
  [UiohookKey.F2]:  { type: 'obs_scene',   scene: 'Steam',           label: 'STEAM'    },
  [UiohookKey.F3]:  { type: 'obs_scene',   scene: 'Live (w/ Cam)',   label: 'LIVE'     },
  [UiohookKey.F4]:  { type: 'obs_scene',   scene: 'Ghost',           label: 'GHOST'    },
  [UiohookKey.F5]:  { type: 'obs_scene',   scene: 'BRB',             label: 'BRB'      },
  [UiohookKey.F6]:  { type: 'obs_scene',   scene: 'Just Chatting',   label: 'CHAT'     },
  [UiohookKey.F7]:  { type: 'obs_scene',   scene: 'Twitter',         label: 'TWITTER'  },
  [UiohookKey.F8]:  { type: 'obs_scene',   scene: 'End Stream',      label: 'END SCN'  },
  [UiohookKey.R]:   { type: 'obs_refresh',                            label: 'REFRESH'  },
  [UiohookKey.M]:   { type: 'obs_mic',                                label: 'MIC'      },
  [UiohookKey.F11]: { type: 'obs_start',                              label: 'START'    },
  [UiohookKey.F12]: { type: 'obs_stop',                               label: 'STOP'     },
};

// ── Layer 1 — bare F-key hotkeys (F13–F24) → Twitch API ───────────────────────
// MacroPad sends these with no modifiers.
const bareHotkeys = {
  [UiohookKey.F13]: { type: 'chat',   message: '!eklipse',   label: 'EKLIPSE'  },
  [UiohookKey.F14]: { type: 'clip',                          label: 'CLIP'     },
  [UiohookKey.F15]: { type: 'chat',   message: '!hype',      label: 'HYPE'     },
  [UiohookKey.F16]: { type: 'chat',   message: '!dadjoke',   label: 'JOKE'     },
  [UiohookKey.F17]: { type: 'chat',   message: '!dogfact',   label: 'DOGFACT'  },
  [UiohookKey.F18]: { type: 'chat',   message: '!discord',   label: 'DISCORD'  },
  [UiohookKey.F19]: { type: 'chat',   message: '!socials',   label: 'SOCIALS'  },
  [UiohookKey.F20]: { type: 'chat',   message: '!schedule',  label: 'SCHED'    },
  [UiohookKey.F21]: { type: 'chat',   message: '!uptime',    label: 'UPTIME'   },
  // F22–F24 reserved for future commands
};

// ── Layer 2 — Ctrl+Shift hotkeys → Twitch API ─────────────────────────────────
const ctrlShiftHotkeys = {
  [UiohookKey.F1]: { type: 'chat',   message: '!lurk',  label: 'LURK' },
  [UiohookKey.F2]: { type: 'ad',     duration: 30,      label: 'AD'   },
};

// Returns the action for a given uiohook keydown event, or null if not mapped.
function getAction(event) {
  const noMods       = !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
  const ctrlShift    =  event.ctrlKey &&  event.shiftKey && !event.altKey && !event.metaKey;
  const ctrlAltShift =  event.ctrlKey &&  event.shiftKey &&  event.altKey && !event.metaKey;

  if (ctrlAltShift) return ctrlAltShiftHotkeys[event.keycode] ?? null;
  if (noMods)       return bareHotkeys[event.keycode]         ?? null;
  if (ctrlShift)    return ctrlShiftHotkeys[event.keycode]    ?? null;
  return null;
}

module.exports = { getAction };
