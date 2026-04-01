# Stealth Director MacroPad — Setup Guide

This guide covers everything needed to get the MacroPad and its companion Twitch service fully operational.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MacroPad Manager App Setup](#2-macropad-manager-app-setup)
3. [OBS Hotkey Configuration](#3-obs-hotkey-configuration)
4. [Discord Keybind Configuration](#4-discord-keybind-configuration)
5. [Twitch Bot Commands](#5-twitch-bot-commands)
6. [Running on Boot](#6-running-on-boot)
7. [Full Key Layout Reference](#7-full-key-layout-reference)
8. [.env Reference](#8-env-reference)

---

## 1. Prerequisites

- **MacroPad flashed** with `code.py` (see [README](README.md) for firmware deployment)
- **OBS Studio** running with your scenes configured
- A **Twitch account** (the service posts to chat as you — no separate bot account needed)

---

## 2. MacroPad Manager App Setup

The **MacroPad Manager** is a Windows desktop app that runs the companion service. It listens for hotkeys from the MacroPad and routes them to OBS WebSocket and the Twitch API.

### Step 1 — Create a Twitch Developer App

1. Go to [dev.twitch.tv/console](https://dev.twitch.tv/console) and log in
2. Click **Register Your Application**
3. Fill in:
   - **Name:** anything (e.g. `MyMacroPad`)
   - **OAuth Redirect URL:** `http://localhost:3000`
   - **Category:** Other
4. Click **Create**, then **Manage** on your new app
5. Copy your **Client ID**
6. Click **New Secret** and copy your **Client Secret** — save it somewhere safe, it won't be shown again

### Step 2 — Run the OAuth flow

This generates your access tokens. Requires [Node.js 18+](https://nodejs.org).

```
cd service
copy .env.example .env
```

Open `service\.env` and fill in `CLIENT_ID` and `CLIENT_SECRET`, then run:

```
npm install
npm run auth
```

This opens a browser OAuth flow. Log in as your Twitch account and click **Authorize**. The terminal will print four values — copy them into `service\.env`:

```
ACCESS_TOKEN=...
REFRESH_TOKEN=...
BROADCASTER_ID=...
SENDER_ID=...
```

### Step 3 — Install the app

1. Run `MacroPad Manager Setup X.X.X.exe` from `app\dist\`
2. Copy your completed `.env` to the install directory:

```
copy service\.env "%LOCALAPPDATA%\Programs\macropad-manager\.env"
```

### Step 4 — Configure OBS WebSocket

In OBS: **Tools → WebSocket Server Settings** → enable the server (default port `4455`).

If you set a password, add it to your `.env`:
```
OBS_WS_PASSWORD=your_password_here
```

Set `OBS_MIC_SOURCE` to match your mic's name in the OBS Audio Mixer (hover the fader to see the exact name):
```
OBS_MIC_SOURCE=Mic/Aux
```

See the full [.env reference](#8-env-reference) for all variables.

### Step 5 — Launch

Open **MacroPad Manager** from the Start Menu. The service starts automatically and logs appear in the window. Press any MacroPad button — you should see the action logged.

> **Token expiry:** Access tokens expire after extended inactivity. The service auto-refreshes on 401 responses and saves the new token back to `.env`. If tokens stop working after a long offline period, re-run `npm run auth` from the `service/` directory and re-copy `.env`.

---

## 3. OBS Hotkey Configuration

The MacroPad sends keyboard shortcuts for scene switching and stream control. OBS must be configured to match.

**Steps:**
1. Open OBS → **Settings → Hotkeys**
2. Find each action, click its field, press the matching key combination
3. Click **OK**

> **Scene hotkeys** appear under each scene's name — scroll down in the Hotkeys list to find them. Your OBS scene names must match the labels below.

### Layer 0 — Scene Switches (Keys 1–8)

| OBS Scene Name | Hotkey |
|----------------|--------|
| Stream Starting | `Ctrl + Alt + 1` |
| Steam | `Ctrl + Alt + 2` |
| Live (w/ Cam) | `Ctrl + Alt + 3` |
| Ghost | `Ctrl + Alt + 4` |
| BRB | `Ctrl + Alt + 5` |
| Just Chatting | `Ctrl + Alt + 6` |
| Twitter | `Ctrl + Alt + 7` |
| End Stream | `Ctrl + Alt + 8` |

### Layer 0 — Stream Control (Keys 9–12)

| OBS Action | Hotkey |
|------------|--------|
| Refresh all Browser Sources | `Ctrl + Alt + R` |
| Toggle Microphone Mute | `Ctrl + Alt + M` |
| Start Streaming | `Ctrl + Alt + Shift + F11` |
| Stop Streaming | `Ctrl + Alt + Shift + F12` |

> **Stop Streaming** is triggered automatically at the end of the 30-second countdown when you press the red STOP key. You do not need to press it manually.

### Layer 2 — OBS (Key 12)

| OBS Action | Hotkey |
|------------|--------|
| BRB Timer scene / countdown | `Ctrl + Alt + T` |

---

## 4. Discord Keybind Configuration

Discord mic and deafen controls only respond to hotkeys defined inside Discord.

**Steps:**
1. Open Discord → **User Settings** (gear icon) → **Keybinds**
2. Click **Add a Keybind** for each action below
3. Set the action, then press the key combination (or press the MacroPad button directly while the field is active)

| Discord Action | Hotkey |
|----------------|--------|
| Toggle Mute | `Ctrl + Alt + F1` |
| Toggle Deafen | `Ctrl + Alt + F2` |

> Discord keybinds work globally even when Discord is not the focused window, but Discord must be running.

---

## 5. Twitch Bot Commands

Layer 1 (Twitch Commands) posts chat commands like `!hype`, `!dadjoke`, `!discord`, etc. These rely on a Twitch bot in your channel that responds to them. The MacroPad just posts the message — the bot does the rest.

### If you use sery_bot

Most of these commands (`!uptime`, `!hype`, `!discord`, `!socials`, `!schedule`, etc.) are built into [sery_bot](https://sery_bot.com). Make sure sery_bot is modded in your channel and the relevant commands are enabled in its dashboard.

### If a command isn't supported by your bot

Use [Nightbot](https://nightbot.tv), [StreamElements](https://streamelements.com), or any other bot to create a custom command. Example setup in Nightbot:

1. Go to [nightbot.tv](https://nightbot.tv) → **Commands → Custom**
2. Click **Add Command**
3. Set the **Command** field to `!dadjoke` (or whichever label)
4. Set the **Message** field to whatever response you want (static text, or a `$(urlfetch)` call to an API)
5. Click **Submit**

Repeat for any Layer 1 button whose command your primary bot doesn't handle. The MacroPad doesn't care which bot responds — it just posts to chat.

### Commands with no bot required

| Button | Action | Bot needed? |
|--------|--------|-------------|
| EKLIPSE | Posts `!eklipse` | Yes — Eklipse.gg monitors your chat for this |
| MARKER | Creates Twitch VOD marker | **No** — handled directly by the Node.js service via Helix API |
| LURK (Layer 2) | Posts `!lurk` | Optional — or set up a custom `!lurk` response |
| AD (Layer 2) | Starts Twitch ad break | **No** — handled directly by the Node.js service via Helix API |

---

## 6. Running on Boot

The MacroPad Manager app auto-starts the service when opened. To have it launch automatically on Windows login:

1. Press `Win + R` → type `shell:startup` → press Enter
2. Create a shortcut to `MacroPad Manager.exe` in that folder

The app will open on login and the service will start immediately.

---

## 7. Full Key Layout Reference

Quick reference for all three layers. For full details see [BUTTON_REFERENCE.md](BUTTON_REFERENCE.md).

### Layer 0 — Stream Control (Blue LEDs)

| Key | Label | Hotkey | Action |
|-----|-------|--------|--------|
| 1 | STARTING | Ctrl+Alt+1 | OBS scene: Stream Starting |
| 2 | STEAM | Ctrl+Alt+2 | OBS scene: Steam |
| 3 | LIVE | Ctrl+Alt+3 | OBS scene: Live (w/ Cam) — starts uptime clock |
| 4 | GHOST | Ctrl+Alt+4 | OBS scene: Ghost |
| 5 | BRB | Ctrl+Alt+5 | OBS scene: BRB |
| 6 | CHAT | Ctrl+Alt+6 | OBS scene: Just Chatting |
| 7 | TWITTER | Ctrl+Alt+7 | OBS scene: Twitter |
| 8 | END SCN | Ctrl+Alt+8 | OBS scene: End Stream |
| 9 | REFRESH | Ctrl+Alt+R | Refresh all OBS browser sources |
| 10 | MIC | Ctrl+Alt+M | Toggle mic mute/unmute |
| 11 | START | Ctrl+Alt+Shift+F11 | Start streaming *(purple LED)* |
| 12 | STOP | — | 30-second stop-stream countdown *(red LED)* |

### Layer 1 — Twitch Commands (Green LEDs)

Handled by the Node.js service. No OBS or Discord setup needed — see [Section 5](#5-twitch-bot-commands) for bot setup.

| Key | Label | Hotkey | Action |
|-----|-------|--------|--------|
| 1 | EKLIPSE | F13 | Posts `!eklipse` to chat |
| 2 | MARKER | F14 | Creates Twitch VOD bookmark (Helix API) |
| 3 | HYPE | F15 | Posts `!hype` to chat |
| 4 | JOKE | F16 | Posts `!dadjoke` to chat |
| 5 | DOGFACT | F17 | Posts `!dogfact` to chat |
| 6 | DISCORD | F18 | Posts `!discord` to chat |
| 7 | SOCIALS | F19 | Posts `!socials` to chat |
| 8 | SCHED | F20 | Posts `!schedule` to chat |
| 9 | UPTIME | F21 | Posts `!uptime` to chat |
| 10–12 | (open) | F22–F24 | Reserved |

### Layer 2 — Productivity (Yellow LEDs)

| Key | Label | Hotkey | Action | Setup needed |
|-----|-------|--------|--------|--------------|
| 1 | PLAY | consumer | Media play/pause | None |
| 2 | SKIP | consumer | Next track | None |
| 3 | PREV | consumer | Previous track | None |
| 4 | MUTE-M | consumer | System audio mute | None |
| 5 | D-MUTE | Ctrl+Alt+F1 | Discord mic toggle | Discord keybind (Section 4) |
| 6 | D-DEAF | Ctrl+Alt+F2 | Discord deafen | Discord keybind (Section 4) |
| 7 | RELOAD | Ctrl+Alt+R | Refresh OBS browser sources | OBS hotkey (Section 3) |
| 8 | LURK | Ctrl+Shift+F1 | Posts `!lurk` to chat | Node.js service (auto) |
| 9 | SNAP | Win+Shift+S | Windows Snipping Tool | None |
| 10 | LOCK | Win+L | Lock screen | None |
| 11 | AD | Ctrl+Shift+F2 | Start 30s Twitch ad break | Node.js service (auto) |
| 12 | TIMER | Ctrl+Alt+T | OBS BRB timer scene | OBS hotkey (Section 3) |

---

## 8. .env Reference

The `.env` file lives next to `MacroPad Manager.exe` in `%LOCALAPPDATA%\Programs\macropad-manager\`. A template is at `service\.env.example`.

### Twitch credentials

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Your Twitch Developer App's Client ID — from [dev.twitch.tv/console](https://dev.twitch.tv/console) |
| `CLIENT_SECRET` | Yes | Your Twitch Developer App's Client Secret — generated in the same console |
| `ACCESS_TOKEN` | Yes | OAuth user access token — generated by `npm run auth` |
| `REFRESH_TOKEN` | Yes | OAuth refresh token — generated by `npm run auth`, used to auto-renew `ACCESS_TOKEN` |
| `BROADCASTER_ID` | Yes | Your Twitch numeric user ID — printed by `npm run auth` after successful login |
| `SENDER_ID` | Yes | The user ID that sends chat messages — same value as `BROADCASTER_ID` unless using a bot account |

### OBS WebSocket

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBS_WS_PORT` | No | `4455` | Port for OBS WebSocket server — change only if you customised it in OBS |
| `OBS_WS_PASSWORD` | No | *(empty)* | Password for OBS WebSocket — leave blank if you haven't set one in OBS |
| `OBS_MIC_SOURCE` | No | `Mic/Aux` | Exact name of your microphone input source in OBS. Check by hovering the fader in **Audio Mixer** |

### Example `.env`

```
# Twitch
CLIENT_ID=abc123yourid
CLIENT_SECRET=xyz789yoursecret
ACCESS_TOKEN=
REFRESH_TOKEN=
BROADCASTER_ID=
SENDER_ID=

# OBS WebSocket
OBS_WS_PORT=4455
OBS_WS_PASSWORD=
OBS_MIC_SOURCE=Mic/Aux
```

Fill in `CLIENT_ID` and `CLIENT_SECRET` manually, then run `npm run auth` from the `service/` directory to populate the remaining four Twitch fields.
