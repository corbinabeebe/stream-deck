const { UiohookKey } = require('uiohook-napi');

// ── Layer 1 — bare F-key hotkeys (F13–F24) ────────────────────────────────────
// MacroPad sends these with no modifiers. All routed through the Twitch service.
const bareHotkeys = {
  [UiohookKey.F13]: { type: 'chat',   message: '!eklipse',   label: 'EKLIPSE'  },
  [UiohookKey.F14]: { type: 'marker',                        label: 'MARKER'   },
  [UiohookKey.F15]: { type: 'chat',   message: '!hype',      label: 'HYPE'     },
  [UiohookKey.F16]: { type: 'chat',   message: '!dadjoke',   label: 'JOKE'     },
  [UiohookKey.F17]: { type: 'chat',   message: '!dogfact',   label: 'DOGFACT'  },
  [UiohookKey.F18]: { type: 'chat',   message: '!discord',   label: 'DISCORD'  },
  [UiohookKey.F19]: { type: 'chat',   message: '!socials',   label: 'SOCIALS'  },
  [UiohookKey.F20]: { type: 'chat',   message: '!schedule',  label: 'SCHED'    },
  [UiohookKey.F21]: { type: 'chat',   message: '!uptime',    label: 'UPTIME'   },
  // F22–F24 reserved for future commands
};

// ── Layer 2 — Ctrl+Shift hotkeys ──────────────────────────────────────────────
// Productivity keys that need a Twitch action (distinct from bare F-keys above).
const ctrlShiftHotkeys = {
  [UiohookKey.F1]: { type: 'chat',   message: '!lurk',  label: 'LURK' },
  [UiohookKey.F2]: { type: 'ad',     duration: 30,      label: 'AD'   },
};

// Returns the action for a given uiohook keydown event, or null if not mapped.
function getAction(event) {
  const noMods   = !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
  const ctrlShift = event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey;

  if (noMods)    return bareHotkeys[event.keycode]      ?? null;
  if (ctrlShift) return ctrlShiftHotkeys[event.keycode] ?? null;
  return null;
}

module.exports = { getAction };
