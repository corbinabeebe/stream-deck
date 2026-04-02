# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CircuitPython firmware project for an **Adafruit MacroPad RP2040** — a 12-key macro pad with an OLED display and rotary encoder. It runs as a "Stealth Director MacroPad" for streamers using OBS and Twitch.

The repo has two components:
- **`code.py`** — CircuitPython firmware that runs on the MacroPad (USB HID device, sends keystrokes only)
- **`service/`** — Node.js service running on the stream PC that intercepts hotkeys and routes them to OBS WebSocket and the Twitch Helix API

## Repo Structure

```
stream-deck/
├── code.py              ← CircuitPython firmware (copy to CIRCUITPY root)
└── service/
    ├── service.js       ← Entry point: hotkey listener + action router
    ├── twitch.js        ← Twitch Helix API wrapper (chat, marker, commercial)
    ├── obs.js           ← OBS WebSocket wrapper (scenes, stream, mic, refresh)
    ├── config.js        ← Hotkey → action mappings (edit to add/change commands)
    ├── auth.js          ← One-time OAuth flow (run via: npm run auth)
    ├── package.json
    ├── .env             ← Secrets — never committed (copy from .env.example)
    └── .env.example     ← Template with required keys
```

## MacroPad Deployment (no build step)

CircuitPython — no compilation. Deployment:

1. Flash CircuitPython UF2 to the MacroPad (hold BOOTSEL, plug in, drag UF2 to `RPI-RP2` drive)
2. Install libraries via `circup`:
   ```
   circup install adafruit_macropad adafruit_hid adafruit_display_text adafruit_debouncer adafruit_ticks neopixel
   ```
3. Copy `code.py` to the root of the `CIRCUITPY` drive — device reboots and runs immediately

There is no test framework. Testing requires running on physical hardware.

## Service Deployment

Runs persistently on the stream PC (Windows). Must be started before going live.

**First-time setup:**
```
cd service
copy .env.example .env   # fill in CLIENT_ID, CLIENT_SECRET, and OBS vars
npm install
npm run auth             # opens browser OAuth flow, prints tokens to paste into .env
```

**Daily start:**
```
cd service
npm start
```

**Auto-start on boot:** use pm2 or Windows Task Scheduler — see `SETUP_GUIDE.md` section 5.

**Token refresh:** handled automatically on 401 responses. If the service has been offline for an extended period, re-run `npm run auth`.

**Required OAuth scopes:** `user:write:chat`, `channel:manage:broadcast`, `clips:edit`

## MacroPad Architecture

All firmware logic lives in a single file: `code.py`.

**Three layers** cycle via rotary encoder tap (0 → 1 → 2 → 0):
- **Layer 0 (Blue)** — Stream Control: OBS scene switching, browser refresh, mic mute, start/stop stream
- **Layer 1 (Green)** — Twitch Commands: fires F-key hotkeys that the service intercepts and routes to Twitch API
- **Layer 2 (Yellow)** — Productivity: media controls, Discord audio, screenshot, system shortcuts

**Centralized state dict `S`** holds layer, clip counter, stream uptime start time, and exit countdown state.

**Key action types** dispatched in `handle_key()`:
- `"keys"` — send keyboard shortcut
- `"consumer"` — send consumer control code (volume, mute)
- `"type"` — type a string via keyboard layout
- `"exit"` — trigger 30-second non-blocking stop-stream countdown
- `"none"` — no-op

**30-second exit sequence**: pressing STOP (key 12, red) switches OBS to the End Stream scene and starts a non-blocking countdown using `time.monotonic()`. The OLED counts down; pressing STOP again cancels. At 0s, the service stops the stream via OBS WebSocket.

**OLED HUD** always shows: layer name, stream uptime (starts on first LIVE press), clip count, and status/countdown.

**Main loop** runs at ~100 Hz (10ms sleep), polling keys, rotary encoder delta, encoder button tap-vs-hold, and exit countdown.

**Special LED colors:**
- Layer 0: all keys blue, except key 11 (START) purple and key 12 (STOP) red
- Layer 1: all keys green
- Layer 2: all keys yellow

## Service Architecture

The Node.js service (`service/service.js`) runs persistently on Windows and bridges the MacroPad to OBS and Twitch:

1. **Global hotkey listener** — uses `uiohook-napi` to watch for keypresses system-wide (no window focus required)
2. **OBS control** — `obs.js` connects to the OBS WebSocket server and calls the OBS WebSocket API for scene switching, stream start/stop, mic mute, and browser source refresh
3. **Twitch API calls** — `twitch.js` POSTs to Twitch Helix API endpoints on hotkey
4. **Auth** — user access token stored in `.env`, refreshed automatically via refresh token

OBS does **not** need to be the active/focused window — all OBS commands go through WebSocket.

### OBS WebSocket Setup

In OBS: **Tools → WebSocket Server Settings** → enable the server (default port 4455).
Set `OBS_WS_PASSWORD` in `.env` if you configure a password.

The service connects lazily on first use and reconnects automatically if OBS restarts.

**`OBS_MIC_SOURCE`** must match your mic audio input source name exactly (hover over the fader in the OBS Audio Mixer to see it).

### OBS WebSocket Calls Used

| Action | OBS WebSocket Request |
|--------|-----------------------|
| Switch scene | `SetCurrentProgramScene` |
| Start stream | `StartStream` |
| Stop stream | `StopStream` |
| Toggle mic mute | `ToggleInputMute` |
| Refresh browser sources | `GetInputList` + `PressInputPropertiesButton` (per source) |

### Twitch API Endpoints Used

| Action | Endpoint |
|--------|----------|
| Send chat message | `POST /helix/chat/messages` |
| Create clip | `POST /helix/clips` |
| Twitch ad break | `POST /helix/channels/commercial` |

Chat commands (`!eklipse`, `!hype`, etc.) are sent as chat messages — Twitch bots (sery_bot, etc.) respond to them in channel.

## Key Layout

Keys are numbered left-to-right, top-to-bottom (1–12 as labeled on the pad).

### Layer 0 — Stream Control (Blue)

All keys send `Ctrl+Alt+Shift+Fx` hotkeys intercepted by the service, which calls OBS WebSocket directly. OBS does **not** need to be the active window.

| Key | Label | Hotkey | OBS Action |
|-----|-------|--------|------------|
| 1 | STARTING | Ctrl+Alt+Shift+F1 | Scene: Stream Starting |
| 2 | STEAM | Ctrl+Alt+Shift+F2 | Scene: Steam |
| 3 | LIVE | Ctrl+Alt+Shift+F3 | Scene: Live (w/ Cam) |
| 4 | GHOST | Ctrl+Alt+Shift+F4 | Scene: Ghost |
| 5 | BRB | Ctrl+Alt+Shift+F5 | Scene: BRB |
| 6 | CHAT | Ctrl+Alt+Shift+F6 | Scene: Just Chatting |
| 7 | TWITTER | Ctrl+Alt+Shift+F7 | Scene: Twitter |
| 8 | END SCN | Ctrl+Alt+Shift+F8 | Scene: End Stream (ending overlay) |
| 9 | REFRESH | Ctrl+Alt+Shift+R | Refresh all browser sources |
| 10 | BKTRACK | Ctrl+Alt+Shift+M | Save Aitum Backtrack clip (via OBS WebSocket `TriggerHotkeyByKeySequence` F18) |
| 11 | START | **Purple** Ctrl+Alt+Shift+F11 | Start streaming |
| 12 | STOP | **Red** — exit action | Stop-stream sequence — 30s countdown, press again to cancel |

### Layer 1 — Twitch Commands (Green)

MacroPad sends bare F13–F21 (no modifiers); service intercepts and calls Twitch API.
F22–F24 are reserved for future commands.

Notes:
- `!eklipse` signals Eklipse.gg (which monitors chat) to mark the moment for post-stream highlight generation
- MARKER creates a native Twitch VOD bookmark via Helix API, independent of Eklipse

| Key | Label | Hotkey | Twitch Action |
|-----|-------|--------|---------------|
| 1 | EKLIPSE | F13 | Post `!eklipse` to chat (Eklipse.gg highlight marker) |
| 2 | CLIP | F14 | Create Twitch clip (Helix API) |
| 3 | (open) | F18 | Reserved |
| 4 | HYPE | F15 | Post `!hype` to chat |
| 5 | JOKE | F16 | Post `!dadjoke` to chat |
| 6 | DOGFACT | F17 | Post `!dogfact` to chat |
| 7 | SOCIALS | F19 | Post `!socials` to chat |
| 8 | SCHED | F20 | Post `!schedule` to chat |
| 9 | UPTIME | F21 | Post `!uptime` to chat |
| 10–12 | (open) | F22–F24 | Reserved for future sery_bot / Twitch commands |

### Layer 2 — Productivity (Yellow)

LURK and AD route through the service via Ctrl+Shift hotkeys.
RELOAD uses Ctrl+Alt+Shift+R (same as Layer 0 REFRESH — both trigger OBS browser source refresh).

| Key | Label | Hotkey | Action |
|-----|-------|--------|--------|
| 1 | PLAY | consumer | Media play/pause |
| 2 | SKIP | consumer | Next track |
| 3 | PREV | consumer | Previous track |
| 4 | MUTE-M | consumer | System audio mute |
| 5 | D-MUTE | Ctrl+Alt+F1 | Discord mic toggle |
| 6 | D-DEAF | Ctrl+Alt+F2 | Discord deafen |
| 7 | RELOAD | Ctrl+Alt+Shift+R | OBS refresh all browser sources (via service) |
| 8 | LURK | Ctrl+Shift+F1 | Post `!lurk` to chat (via service) |
| 9 | SNAP | Win+Shift+S | Windows Snipping Tool |
| 10 | LOCK | Win+L | Lock screen |
| 11 | AD | Ctrl+Shift+F2 | Start 30s Twitch ad break (Helix API via service) |
| 12 | TIMER | Ctrl+Alt+T | OBS BRB timer scene |
