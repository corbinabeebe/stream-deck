# Stealth Director MacroPad — Setup Guide
Hardware: Adafruit MacroPad RP2040

---

## 1. Flash CircuitPython

Download the latest CircuitPython UF2 for the MacroPad RP2040:
https://circuitpython.org/board/adafruit_macropad_rp2040/

Hold BOOTSEL while plugging in → drag UF2 to the RPI-RP2 drive.

---

## 2. Install Libraries

Install `circup` on your machine, then run:

```
circup install adafruit_macropad adafruit_hid adafruit_display_text adafruit_debouncer adafruit_ticks neopixel
```

Or manually copy these into the `CIRCUITPY/lib/` folder from the
Adafruit CircuitPython Bundle (https://circuitpython.org/libraries):

- `adafruit_macropad/`
- `adafruit_hid/`
- `adafruit_display_text/`
- `adafruit_debouncer.mpy`
- `adafruit_ticks.mpy`
- `neopixel.mpy`

---

## 3. Deploy the Script

Copy `code.py` to the root of the `CIRCUITPY` drive.
The MacroPad reboots automatically and starts running.

---

## 4. OBS Hotkey Configuration

Go to OBS → Settings → Hotkeys and map exactly:

| Action                  | Hotkey              |
|-------------------------|---------------------|
| Scene: Live             | Ctrl + Alt + 1      |
| Scene: Ghost            | Ctrl + Alt + 2      |
| Scene: BRB              | Ctrl + Alt + 3      |
| Scene: Chat/Facecam     | Ctrl + Alt + 4      |
| Scene: Ending Soon      | Ctrl + Alt + E      |
| Stop Streaming          | Ctrl + Alt + Shift + F12 |
| Toggle Camera (source)  | Ctrl + Alt + C      |
| Toggle Microphone       | Ctrl + Alt + M      |
| Toggle Status Overlay   | Ctrl + Alt + S      |
| BRB Timer scene/source  | Ctrl + Alt + T      |
| Reload Browser Sources  | Ctrl + Alt + R      |

---

## 5. Twitch / Chat Bot Configuration

Map these F-keys in your chat bot (Nightbot, StreamElements, etc.):

| Key | Action                              |
|-----|-------------------------------------|
| F13 | Eklipse.gg clip marker              |
| F14 | Eklipse.gg "Epic" marker            |
| F15 | Drop command (socials, !schedule)   |
| F16 | Drop Discord invite link            |
| F17 | Run Twitch ad break                 |

Note: Windows may not register F13–F17 natively. Use AutoHotkey or
map them in your streaming software's hotkey settings.

---

## 6. Discord Keybind Configuration

Go to Discord → Settings → Keybinds and add:

| Action       | Hotkey          |
|--------------|-----------------|
| Toggle Mute  | Ctrl + Alt + F1 |
| Toggle Deaf  | Ctrl + Alt + F2 |

---

## 7. Layer Reference

### Layer 0 — Stream Control (Blue LED)

| Key | Label  | Action                        |
|-----|--------|-------------------------------|
| 0   | LIVE   | Ctrl+Alt+1 — Gameplay + Cam  |
| 1   | GHOST  | Ctrl+Alt+2 — No Cam/Mic      |
| 2   | BRB    | Ctrl+Alt+3 — BRB screen       |
| 3   | CHAT   | Ctrl+Alt+4 — Facecam only    |
| 4   | CAM-X  | Ctrl+Alt+C — Toggle camera   |
| 5   | MIC-X  | Ctrl+Alt+M — Toggle mic      |
| 6   | STAT   | Ctrl+Alt+S — Status overlay  |
| 7   | AD     | F17 — Twitch ad break        |
| 8   | CLIP   | F13 — Eklipse clip marker    |
| 9   | HYPE   | F14 — Epic moment marker     |
| 10  | CMND   | F15 — Twitch chat command    |
| 11  | EXIT   | 30-second stop stream (RED)  |

### Layer 1 — Productivity (Green LED)

| Key | Label  | Action                              |
|-----|--------|-------------------------------------|
| 0   | PLAY   | Media play/pause                    |
| 1   | SKIP   | Next track                          |
| 2   | PREV   | Previous track                      |
| 3   | MUTE-M | System audio mute                   |
| 4   | D-MUTE | Ctrl+Alt+F1 — Discord mute toggle  |
| 5   | D-DEAF | Ctrl+Alt+F2 — Discord deafen       |
| 6   | D-LINK | F16 — Drop Discord link in chat    |
| 7   | LURK   | Types "Thanks for lurking! o7"     |
| 8   | SNAP   | Ctrl+Shift+4 — Screenshot          |
| 9   | LOCK   | Ctrl+Shift+Q — Lock screen         |
| 10  | TIMER  | Ctrl+Alt+T — BRB timer             |
| 11  | RELOAD | Ctrl+Alt+R — Reload OBS sources    |

### Rotary Encoder (Both Layers)

| Input        | Action               |
|--------------|----------------------|
| Rotate CW    | Volume up            |
| Rotate CCW   | Volume down          |
| Tap          | Toggle layer         |
| Hold (1s)    | Global mute          |

---

## 8. OLED HUD

The display shows at all times:

```
STREAM CTRL
00:00:00        ← stream uptime (starts on first LIVE press)
CLIPS: 0        ← increments on every CLIP or HYPE press
READY           ← current action / EXIT countdown
```

---

## 9. The 30-Second Exit Sequence

1. Press **[EXIT]** → OBS switches to "Ending Soon" scene, countdown begins
2. OLED shows `EXIT: 30s` counting down
3. Press **[EXIT]** again at any point → countdown cancels, stream stays live
4. At 0s → `Ctrl+Alt+Shift+F12` fires, stream stops
