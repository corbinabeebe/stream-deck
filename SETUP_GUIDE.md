# Stealth Director MacroPad — Setup Guide

The MacroPad sends keyboard shortcuts to your computer. Each external app (OBS, Eklipse, Discord, etc.) must be configured to respond to those shortcuts. This guide walks through each one.

See the [Button Reference](BUTTON_REFERENCE.md) for a full list of what each button sends.

---

## Table of Contents

1. [OBS Hotkey Configuration](#1-obs-hotkey-configuration)
2. [Eklipse.gg Configuration](#2-eklipsegg-configuration)
3. [Twitch / Chat Bot Configuration](#3-twitch--chat-bot-configuration)
4. [Discord Keybind Configuration](#4-discord-keybind-configuration)

---

## 1. OBS Hotkey Configuration

> The MacroPad sends keyboard shortcuts to switch scenes, toggle sources, and stop the stream. OBS must be told which shortcut maps to which action — it does not detect them automatically.

**Steps:**
1. Open OBS
2. Go to **Settings → Hotkeys**
3. Find each action in the list, click its hotkey field, and press the corresponding key combination
4. Click **OK** to save

> **Scene hotkeys:** "Switch to Scene" hotkeys appear under each scene's name in the Hotkeys list — scroll down to find them. Make sure your scene names in OBS match the ones you've mapped here.

| OBS Action | Hotkey |
|---|---|
| Switch to Scene: Live (gameplay + cam) | `Ctrl + Alt + 1` |
| Switch to Scene: Ghost (no cam/mic) | `Ctrl + Alt + 2` |
| Switch to Scene: BRB | `Ctrl + Alt + 3` |
| Switch to Scene: Chat/Facecam | `Ctrl + Alt + 4` |
| Switch to Scene: Ending Soon | `Ctrl + Alt + E` |
| Stop Streaming | `Ctrl + Alt + Shift + F12` |
| Toggle Camera source visibility | `Ctrl + Alt + C` |
| Toggle Microphone mute | `Ctrl + Alt + M` |
| Toggle Status Overlay visibility | `Ctrl + Alt + S` |
| Switch to Scene: BRB Timer | `Ctrl + Alt + T` |
| Refresh all Browser Sources | `Ctrl + Alt + R` |

---

## 2. Eklipse.gg Configuration

> The **CLIP** and **HYPE** buttons send `F13` and `F14`. Eklipse must be configured to recognize these as clip markers.

**Steps:**
1. Open the **Eklipse desktop app** — it must be running during your stream for clip detection to work
2. Go to **Settings → Hotkeys** (or Keyboard Shortcuts)
3. Click the field for each action and press the MacroPad button to register it

| Eklipse Action | Hotkey |
|---|---|
| Mark clip / highlight | `F13` |
| Mark epic moment | `F14` |

> **Note:** F13 and F14 are not printed on standard keyboards but are valid key codes. Simply press the CLIP or HYPE button on the MacroPad while the hotkey field is active — it will register correctly.

> **Don't use Eklipse?** Remap the CLIP and HYPE buttons in `code.py` to whatever hotkey your clip tool supports (Medal, Outplayed, etc.).

---

## 3. Twitch / Chat Bot Configuration

> The **CMND**, **D-LINK**, and **AD** buttons send `F15`, `F16`, and `F17`. Your chat bot or Twitch dashboard needs to be configured to execute a command when it receives these keys.

| Key | Button | Action |
|-----|--------|--------|
| `F15` | CMND | Run a chat command (e.g., socials drop, `!schedule`) |
| `F16` | D-LINK | Post your Discord invite link in chat |
| `F17` | AD | Trigger a Twitch ad break |

### Chat Bot Setup (Nightbot, StreamElements, etc.)

Most bots support triggering commands via hotkeys through a companion app or integration. Configure each F-key above to fire the corresponding bot command.

### Twitch Ad Break (F17)

If your chat bot doesn't support ad triggers, use the Twitch integration in OBS, Streamlabs, or **Streamer.bot** to bind `F17` to run a commercial.

> **Windows note:** F15–F17 are not on standard keyboards. If your bot software doesn't recognize them directly, use **AutoHotkey** to remap them, or configure them inside your streaming software's own hotkey settings.

---

## 4. Discord Keybind Configuration

> Discord mute and deafen only respond to hotkeys defined inside Discord itself.

**Steps:**
1. Open Discord
2. Go to **User Settings** (gear icon) → **Keybinds**
3. Click **Add a Keybind** for each action below
4. Set the action type, then press the key combination (or press the MacroPad button directly)

| Discord Action | Hotkey |
|---|---|
| Toggle Mute | `Ctrl + Alt + F1` |
| Toggle Deafen | `Ctrl + Alt + F2` |

> **Tip:** Discord keybinds work globally even when Discord is not in focus, but Discord must be running (not just in the system tray minimized without the process active).
