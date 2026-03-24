# Stealth Director MacroPad

A CircuitPython firmware for the **Adafruit MacroPad RP2040** — a 12-key macro pad built for streamers using OBS and Twitch. Two layers of hotkeys control scene switching, camera/mic toggles, clip markers, chat commands, Discord audio, and a safe 30-second stream-end sequence.

---

## Hardware

- [Adafruit MacroPad RP2040](https://www.adafruit.com/product/5128)

---

## Installation

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

## Documentation

- [Button Reference](BUTTON_REFERENCE.md) — every button, layer, and encoder input explained
- [Setup Guide](SETUP_GUIDE.md) — required configuration for OBS, Eklipse, Twitch, and Discord
