# Stealth Director MacroPad — Setup Guide

This guide covers everything needed to get the MacroPad and its companion Twitch service fully operational.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Twitch Service Setup](#2-twitch-service-setup)
3. [OBS Hotkey Configuration](#3-obs-hotkey-configuration)
4. [Discord Keybind Configuration](#4-discord-keybind-configuration)
5. [Running the Service on Boot](#5-running-the-service-on-boot)

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

## 5. Running the Service on Boot

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
