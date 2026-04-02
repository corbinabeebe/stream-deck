# ─────────────────────────────────────────────────────────────────────────────
# code.py — Stealth Director MacroPad
# Hardware : Adafruit MacroPad RP2040
# Runtime  : CircuitPython 8.x+
#
# Layer 0 (Blue)   — Stream Control  : OBS scenes, mic mute, start/stop stream
# Layer 1 (Green)  — Twitch Commands : F13-F22 hotkeys → Node.js twitch service
# Layer 2 (Yellow) — Productivity    : Media, Discord, system shortcuts
#
# Rotary encoder
#   Rotate       → System volume up / down
#   Tap          → Cycle layer (0 → 1 → 2 → 0)
#   Hold (1 s)   → Global mute
#
# Key 12 on Stream layer = [STOP] — 30-second stop-stream sequence
#   Press once   → Switch to "End Stream" scene + start countdown
#   Press again  → Cancel countdown, stay live
# ─────────────────────────────────────────────────────────────────────────────

import time
import displayio
import terminalio
from adafruit_macropad import MacroPad
from adafruit_hid.keycode import Keycode
from adafruit_hid.consumer_control_code import ConsumerControlCode
from adafruit_display_text import label

# ── Hardware init ─────────────────────────────────────────────────────────────
macropad = MacroPad()
macropad.pixels.auto_write = False

# ── Constants ─────────────────────────────────────────────────────────────────
LAYER_STREAM = 0
LAYER_TWITCH = 1
LAYER_PROD   = 2

BLUE   = (0,  0,  60)
GREEN  = (0,  60, 0)
YELLOW = (60, 60, 0)
PURPLE = (40, 0,  60)
RED    = (60, 0,  0)

LAYER_COLORS = [BLUE, GREEN, YELLOW]
LAYER_NAMES  = ["STREAM CTRL", "TWITCH", "PRODUCTIVITY"]

CTRL  = Keycode.CONTROL
ALT   = Keycode.ALT
SHIFT = Keycode.SHIFT

HOLD_THRESHOLD = 1.0   # seconds before encoder hold fires
EXIT_DURATION  = 30    # seconds in exit countdown

# ── Shared state ──────────────────────────────────────────────────────────────
S = {
    "layer":          LAYER_STREAM,
    "scene":          "--",    # label of last OBS scene switched to
    "stream_start":   None,    # monotonic timestamp of first LIVE press
    "exit_active":    False,
    "exit_start":     None,
    "last_enc_pos":   macropad.encoder,
    "enc_held_start": None,
    "enc_triggered":  False,
}

# ── Key map ───────────────────────────────────────────────────────────────────
# Each entry: ("LABEL", action, payload)
#
# Actions:
#   "keys"     → keyboard.press(*payload) — payload is a tuple of Keycodes
#   "consumer" → consumer_control.send(payload)
#   "type"     → keyboard_layout.write(payload) — types a string
#   "clip"     → like "keys" but also increments clip counter (single Keycode)
#   "exit"     → 30-second stop-stream sequence (no payload)
#   "none"     → no-op (reserved slot)

KEYMAP = [
    # ── Layer 0: Stream Control ───────────────────────────────────────────────
    # All keys send Ctrl+Alt+Shift+Fx hotkeys intercepted by the Node.js service,
    # which calls OBS WebSocket directly — OBS does NOT need to be the active window.
    # Row 1                      Row 2                Row 3
    # [STARTING][STEAM][LIVE]    [GHOST][BRB][CHAT]   [TWITTER][END SCN][REFRESH]
    # Row 4
    # [MIC][START][STOP]
    [
        ("STARTING", "keys", (CTRL, ALT, SHIFT, Keycode.F1)),
        ("STEAM",    "keys", (CTRL, ALT, SHIFT, Keycode.F2)),
        ("LIVE",     "keys", (CTRL, ALT, SHIFT, Keycode.F3)),
        ("GHOST",    "keys", (CTRL, ALT, SHIFT, Keycode.F4)),
        ("BRB",      "keys", (CTRL, ALT, SHIFT, Keycode.F5)),
        ("CHAT",     "keys", (CTRL, ALT, SHIFT, Keycode.F6)),
        ("TWITTER",  "keys", (CTRL, ALT, SHIFT, Keycode.F7)),
        ("END SCN",  "keys", (CTRL, ALT, SHIFT, Keycode.F8)),
        ("REFRESH",  "keys", (CTRL, ALT, SHIFT, Keycode.R)),
        ("MIC",      "keys", (CTRL, ALT, SHIFT, Keycode.M)),
        ("START",    "keys", (CTRL, ALT, SHIFT, Keycode.F11)),
        ("STOP",     "exit", None),
    ],
    # ── Layer 1: Twitch Commands ──────────────────────────────────────────────
    # F13-F22 hotkeys intercepted by OBS or the Node.js twitch service on the PC.
    # Row 1                         Row 2                    Row 3
    # [EKLIPSE][MARKER][BKTRACK]    [HYPE][JOKE][DOGFACT]   [SOCIALS][SCHED][UPTIME]
    # Row 4
    # [----][----][----]
    [
        ("EKLIPSE", "keys", (Keycode.F13,)),
        ("MARKER",  "keys", (Keycode.F14,)),
        ("BKTRACK", "keys", (Keycode.F18,)),
        ("HYPE",    "keys", (Keycode.F15,)),
        ("JOKE",    "keys", (Keycode.F16,)),
        ("DOGFACT", "keys", (Keycode.F17,)),
        ("SOCIALS", "keys", (Keycode.F19,)),
        ("SCHED",   "keys", (Keycode.F20,)),
        ("UPTIME",  "keys", (Keycode.F21,)),
        ("----",    "none", None),
        ("----",    "none", None),
        ("----",    "none", None),
    ],
    # ── Layer 2: Productivity ─────────────────────────────────────────────────
    # Row 1                  Row 2                      Row 3
    # [PLAY][SKIP][PREV]     [MUTE-M][D-MUTE][D-DEAF]   [D-LINK][LURK][SNAP]
    # Row 4
    # [LOCK][AD][TIMER]
    [
        ("PLAY",   "consumer", ConsumerControlCode.PLAY_PAUSE),
        ("SKIP",   "consumer", ConsumerControlCode.SCAN_NEXT_TRACK),
        ("PREV",   "consumer", ConsumerControlCode.SCAN_PREVIOUS_TRACK),
        ("MUTE-M", "consumer", ConsumerControlCode.MUTE),
        ("D-MUTE", "keys",     (CTRL, ALT, Keycode.F1)),
        ("D-DEAF", "keys",     (CTRL, ALT, Keycode.F2)),
        ("RELOAD", "keys",     (CTRL, ALT, SHIFT, Keycode.R)),
        ("LURK",   "keys",     (CTRL, SHIFT, Keycode.F1)),
        ("SNAP",   "keys",     (Keycode.GUI, SHIFT, Keycode.S)),
        ("LOCK",   "keys",     (Keycode.GUI, Keycode.L)),
        ("AD",     "keys",     (CTRL, SHIFT, Keycode.F2)),
        ("TIMER",  "keys",     (CTRL, ALT, Keycode.T)),
    ],
]

# ── OLED layout (128 × 64) ────────────────────────────────────────────────────
_group     = displayio.Group()
lbl_layer  = label.Label(terminalio.FONT, text="STREAM CTRL", color=0xFFFFFF, x=2, y=8)
lbl_uptime = label.Label(terminalio.FONT, text="OFFLINE",     color=0xAAAAAA, x=2, y=24)
lbl_scene  = label.Label(terminalio.FONT, text="SCN: --",     color=0xAAAAAA, x=2, y=40)
lbl_status = label.Label(terminalio.FONT, text="READY",       color=0xFFFFFF, x=2, y=56)

for _lbl in (lbl_layer, lbl_uptime, lbl_scene, lbl_status):
    _group.append(_lbl)

macropad.display.show(_group)

# ── Display helpers ───────────────────────────────────────────────────────────
def _fmt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def refresh_display(status="READY"):
    lbl_layer.text  = LAYER_NAMES[S["layer"]]
    lbl_scene.text  = f"SCN: {S['scene']}"
    lbl_status.text = status
    lbl_uptime.text = (
        _fmt_time(time.monotonic() - S["stream_start"])
        if S["stream_start"]
        else "OFFLINE"
    )


def refresh_pixels():
    base = LAYER_COLORS[S["layer"]]
    for i in range(12):
        macropad.pixels[i] = base
    if S["layer"] == LAYER_STREAM:
        macropad.pixels[10] = PURPLE  # START key — distinct from scene keys
        macropad.pixels[11] = RED     # STOP key — unmistakable
    macropad.pixels.show()

# ── Action helpers ────────────────────────────────────────────────────────────
def _send_keys(payload):
    macropad.keyboard.press(*payload)
    macropad.keyboard.release_all()


def _begin_exit():
    S["exit_active"] = True
    S["exit_start"]  = time.monotonic()
    # Switch OBS to "End Stream" scene via the service (same hotkey as END SCN key)
    macropad.keyboard.press(CTRL, ALT, SHIFT, Keycode.F8)
    macropad.keyboard.release_all()


def _complete_exit():
    S["exit_active"]  = False
    S["exit_start"]   = None
    S["stream_start"] = None
    # Fire stop-stream hotkey
    macropad.keyboard.press(CTRL, ALT, SHIFT, Keycode.F12)
    macropad.keyboard.release_all()
    refresh_display("STREAM ENDED")
    refresh_pixels()


def _cancel_exit():
    S["exit_active"] = False
    S["exit_start"]  = None
    refresh_display("EXIT CANCELLED")

# ── Key dispatch ──────────────────────────────────────────────────────────────
def handle_key(idx):
    name, action, payload = KEYMAP[S["layer"]][idx]

    if action == "keys":
        _send_keys(payload)
        refresh_display(name)

    elif action == "consumer":
        macropad.consumer_control.send(payload)
        refresh_display(name)

    elif action == "type":
        macropad.keyboard_layout.write(payload)
        refresh_display(name)

    elif action == "clip":
        S["clip_count"] += 1
        macropad.keyboard.press(payload)
        macropad.keyboard.release_all()
        refresh_display(f"CLIP #{S['clip_count']}")

    elif action == "exit":
        if S["exit_active"]:
            _cancel_exit()
        else:
            _begin_exit()
            refresh_display(f"EXIT: {EXIT_DURATION:2d}s")

    # Track current scene (Layer 0, keys 0–7 are scene switches)
    if S["layer"] == LAYER_STREAM and idx <= 7:
        S["scene"] = name

    # Start uptime clock on first LIVE press (Layer 0, key index 2)
    if S["layer"] == LAYER_STREAM and idx == 2 and S["stream_start"] is None:
        S["stream_start"] = time.monotonic()

# ── Startup ───────────────────────────────────────────────────────────────────
refresh_pixels()
refresh_display()

# ── Main loop ─────────────────────────────────────────────────────────────────
while True:

    # ── Key press events ──────────────────────────────────────────────────────
    event = macropad.keys.events.get()
    if event and event.pressed:
        handle_key(event.key_number)

    # ── Rotary encoder — volume ───────────────────────────────────────────────
    pos   = macropad.encoder
    delta = pos - S["last_enc_pos"]
    if delta != 0:
        code = (
            ConsumerControlCode.VOLUME_INCREMENT
            if delta > 0
            else ConsumerControlCode.VOLUME_DECREMENT
        )
        for _ in range(abs(delta)):
            macropad.consumer_control.send(code)
    S["last_enc_pos"] = pos

    # ── Encoder button — tap: cycle layer / hold: mute ────────────────────────
    macropad.encoder_switch_debounced.update()

    if macropad.encoder_switch_debounced.fell:
        S["enc_held_start"] = time.monotonic()
        S["enc_triggered"]  = False

    if S["enc_held_start"] and not macropad.encoder_switch_debounced.value:
        if (
            not S["enc_triggered"]
            and (time.monotonic() - S["enc_held_start"]) >= HOLD_THRESHOLD
        ):
            macropad.consumer_control.send(ConsumerControlCode.MUTE)
            S["enc_triggered"] = True
            refresh_display("MUTED")

    if macropad.encoder_switch_debounced.rose:
        if not S["enc_triggered"]:
            S["layer"] = (S["layer"] + 1) % 3   # cycles 0 → 1 → 2 → 0
            refresh_pixels()
            refresh_display()
        S["enc_held_start"] = None
        S["enc_triggered"]  = False

    # ── Exit countdown tick ───────────────────────────────────────────────────
    if S["exit_active"]:
        remaining = EXIT_DURATION - (time.monotonic() - S["exit_start"])
        if remaining <= 0:
            _complete_exit()
        else:
            refresh_display(f"EXIT: {int(remaining):2d}s")

    time.sleep(0.01)
