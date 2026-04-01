# Stealth Director MacroPad

A CircuitPython firmware for the **Adafruit MacroPad RP2040** — a 12-key macro pad built for streamers using OBS and Twitch. Two layers of hotkeys control scene switching, camera/mic toggles, clip markers, chat commands, Discord audio, and a safe 30-second stream-end sequence.

---

## Hardware

- [Adafruit MacroPad RP2040](https://www.adafruit.com/product/5128)

---

## MacroPad Firmware

### 1. Flash CircuitPython

Download the latest CircuitPython UF2 for the MacroPad RP2040:
https://circuitpython.org/board/adafruit_macropad_rp2040/

Hold **BOOTSEL** while plugging in → drag the `.uf2` file to the `RPI-RP2` drive → MacroPad reboots as `CIRCUITPY`.

### 2. Install Libraries

Install `circup` on your machine, then run:

```
circup install adafruit_macropad adafruit_hid adafruit_display_text adafruit_debouncer adafruit_ticks neopixel
```

Or manually copy these from the [Adafruit CircuitPython Bundle](https://circuitpython.org/libraries) into `CIRCUITPY/lib/`:

- `adafruit_macropad/`
- `adafruit_hid/`
- `adafruit_display_text/`
- `adafruit_debouncer.mpy`
- `adafruit_ticks.mpy`
- `neopixel.mpy`

### 3. Deploy

Copy `code.py` to the root of the `CIRCUITPY` drive. The MacroPad reboots and starts running immediately.

---

## MacroPad Manager (Windows App)

The **MacroPad Manager** is a Windows desktop app that runs the companion service — it bridges the MacroPad's hotkeys to OBS WebSocket and the Twitch API. It auto-starts the service on launch and shows a live log pane.

### Install

1. Build or download `MacroPad Manager Setup X.X.X.exe` from `app/dist/`
2. Run the installer — installs to `%LOCALAPPDATA%\Programs\macropad-manager\`
3. Create a `.env` file in the install directory (see [Setup Guide](SETUP_GUIDE.md#env-reference) for all variables):

```
%LOCALAPPDATA%\Programs\macropad-manager\.env
```

4. Launch **MacroPad Manager** from the Start Menu — the service starts automatically

### Building the app yourself

Requires [Node.js 18+](https://nodejs.org) and the VS Build Tools with C++ workload.

```
cd app
npm install
# Rebuild native addon against Electron (requires VS Build Tools):
$env:VCINSTALLDIR = "C:\Program Files (x86)\Microsoft Visual Studio\<version>\BuildTools\VC\"
npm run rebuild
npm run dist
```

The installer is output to `app\dist\MacroPad Manager Setup X.X.X.exe`.

> If you get a symlink error during `npm run dist`, enable **Developer Mode** in Windows Settings → System → For developers, then delete `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign` and retry.

---

## Documentation

- [Button Reference](BUTTON_REFERENCE.md) — every button, layer, and encoder input explained
- [Setup Guide](SETUP_GUIDE.md) — OBS, Twitch, Discord configuration and `.env` reference
