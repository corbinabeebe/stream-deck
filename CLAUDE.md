# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CircuitPython firmware project for an **Adafruit MacroPad RP2040** — a 12-key macro pad with an OLED display and rotary encoder. It runs as a "Stealth Director MacroPad" for streamers using OBS and Twitch.

## Deployment (no build step)

This is CircuitPython — there is no compilation. Deployment is:

1. Flash CircuitPython UF2 to the MacroPad (hold BOOTSEL, plug in, drag UF2 to `RPI-RP2` drive)
2. Install libraries via `circup`:
   ```
   circup install adafruit_macropad adafruit_hid adafruit_display_text adafruit_debouncer adafruit_ticks neopixel
   ```
3. Copy `code.py` to the root of the `CIRCUITPY` drive — device reboots and runs immediately

There is no test framework. Testing requires running on physical hardware.

## Architecture

All logic lives in a single file: `code.py`.

**Two layers** toggle via rotary encoder tap:
- **Layer 0 (Blue)** — Stream Control: OBS scene switching, camera/mic toggles, Twitch clip markers, 30s stream-end sequence
- **Layer 1 (Green)** — Productivity: media controls, Discord audio, screenshot, lurk message

**Centralized state dict `S`** (lines ~50-59) holds layer, clip counter, stream uptime start time, and exit countdown state.

**Key action types** dispatched in `handle_key()`:
- `"keys"` — send keyboard shortcut
- `"consumer"` — send consumer control code (volume, mute)
- `"type"` — type a string via keyboard layout
- `"clip"` — send key AND increment `S["clip_count"]`
- `"exit"` — trigger 30-second non-blocking countdown sequence
- `"none"` — no-op

**30-second exit sequence** (most complex feature): pressing the EXIT key sends an OBS "Ending Soon" hotkey and starts a non-blocking countdown using `time.monotonic()`. The OLED counts down; pressing EXIT again cancels. At 0s, sends the OBS stop-stream hotkey.

**OLED HUD** always shows: layer name, stream uptime (starts on first LIVE press), clip count, and status/countdown.

**Main loop** runs at ~100 Hz (10ms sleep), polling keys, rotary encoder delta, encoder button tap-vs-hold, and exit countdown.

## Customization Points

All configuration is hard-coded in `code.py`:
- LED colors: `BLUE`, `GREEN`, `RED` constants (lines ~35-39)
- Timing: `HOLD_THRESHOLD` (encoder hold), `EXIT_DURATION` (lines ~46-47)
- Key actions: `KEYMAP[0]` and `KEYMAP[1]` arrays (lines ~72-111)

## OBS Hotkey Mapping

The MacroPad sends these hotkeys — OBS must be configured to match:

| Action | Hotkey |
|--------|--------|
| Scene: Live | Ctrl+Alt+1 |
| Scene: Ghost | Ctrl+Alt+2 |
| Scene: BRB | Ctrl+Alt+3 |
| Scene: Chat | Ctrl+Alt+4 |
| Toggle Camera | Ctrl+Alt+C |
| Toggle Mic | Ctrl+Alt+M |
| Toggle Status Overlay | Ctrl+Alt+S |
| Start Exit Sequence | Ctrl+Alt+E |
| Stop Stream | Ctrl+Alt+Shift+F12 |
| Twitch Ad Break | F17 |
| Eklipse Clip Marker | F13 |
| Eklipse Epic Moment | F14 |
| Twitch Chat Command | F15 |
| Discord Invite Link | F16 |
| Discord Mic Toggle | Ctrl+Alt+F1 |
| Discord Deafen | Ctrl+Alt+F2 |
