# Stealth Director MacroPad — Setup Guide

This guide covers everything needed to get the MacroPad and its companion Twitch service fully operational.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Twitch Service Setup](#2-twitch-service-setup)
3. [OBS Hotkey Configuration](#3-obs-hotkey-configuration)
4. [Discord Keybind Configuration](#4-discord-keybind-configuration)
5. [Twitch Bot Commands](#5-twitch-bot-commands)
6. [Running the Service on Boot](#6-running-the-service-on-boot)
7. [Full Key Layout Reference](#7-full-key-layout-reference)

---

## 1. Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org). Verify: `node --version`
- **MacroPad flashed** with `code.py` (see [README](README.md) for firmware deployment)
- **OBS Studio** running with your scenes configured
- A **Twitch account** (the service posts to chat as you — no separate bot account needed)

---

## 2. Twitch Service Setup

The `twitch/` service is a Node.js process that runs in the background on your stream PC. It listens for F-key hotkeys from the MacroPad and routes them to the Twitch API.

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

### Step 2 — Configure your `.env` file

```
cd twitch
copy .env.example .env
```

Open `twitch/.env` in a text editor and fill in your Client ID and Secret:

```
CLIENT_ID=paste_your_client_id_here
CLIENT_SECRET=paste_your_client_secret_here
ACCESS_TOKEN=
REFRESH_TOKEN=
BROADCASTER_ID=
SENDER_ID=
```

Leave the bottom four fields empty for now — the auth step fills them in.

### Step 3 — Install dependencies

```
cd twitch
npm install
```

### Step 4 — Run the OAuth flow

```
npm run auth
```

This starts a temporary local server and prints a Twitch authorization URL. Open that URL in your browser, log in as your Twitch account, and click **Authorize**. The terminal will print four values:

```
ACCESS_TOKEN=...
REFRESH_TOKEN=...
BROADCASTER_ID=...
SENDER_ID=...
```

Copy all four lines into `twitch/.env`.

### Step 5 — Start the service

```
npm start
```

You should see:

```
[MacroPad] Twitch service started — listening for hotkeys...
```

The service is now running. Press any Layer 1 key on the MacroPad — you'll see the action logged in the terminal and the command posted to your Twitch chat.

> **Token expiry:** Access tokens expire after ~4 hours of inactivity. The service auto-refreshes them when it detects a 401 response and saves the new token back to `.env`. If the service has been offline for a long time, re-run `npm run auth`.

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

## 6. Running the Service on Boot

You want the Twitch service running automatically when Windows starts so it's ready before you go live.

### Option A — pm2 (recommended)

[pm2](https://pm2.keymetrics.io) is a process manager that handles auto-start, crash recovery, and logging.

```
npm install -g pm2
cd twitch
pm2 start service.js --name macropad-twitch
pm2 save
pm2 startup
```

Run the command that `pm2 startup` outputs (it registers a Windows startup task). The service will now start automatically on login and restart if it crashes.

Useful pm2 commands:
```
pm2 logs macropad-twitch     # view live logs
pm2 status                   # check if running
pm2 restart macropad-twitch  # restart after config changes
pm2 stop macropad-twitch     # stop
```

### Option B — Windows Task Scheduler

1. Open **Task Scheduler** → **Create Task**
2. **General** tab: check *Run only when user is logged on*
3. **Triggers** tab: New → *At log on*
4. **Actions** tab: New →
   - Program: `node`
   - Arguments: `C:\path\to\stream-deck\twitch\service.js`
   - Start in: `C:\path\to\stream-deck\twitch`
5. **Settings** tab: check *If the task is already running, do not start a new instance*
6. Click **OK**

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
