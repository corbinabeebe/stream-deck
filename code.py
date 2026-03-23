# ─────────────────────────────────────────────────────────────────────────────
# code.py — Stealth Director MacroPad
# Hardware : Adafruit MacroPad RP2040
# Runtime  : CircuitPython 8.x+
#
# Layer 0 (Blue)  — Stream Control  : OBS scenes, Twitch tools, clip markers
# Layer 1 (Green) — Productivity    : Media, Discord, system shortcuts
#
# Rotary encoder
#   Rotate       → System volume up / down
#   Tap          → Toggle layer
#   Hold (1 s)   → Global mute
#
# Key 11 on Stream layer = [EXIT] — 30-second stop-stream sequence
#   Press once   → Switch to "Ending Soon" scene + start countdown
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
LAYER_PROD   = 1

BLUE  = (0, 0, 60)
GREEN = (0, 60, 0)
RED   = (60, 0, 0)

LAYER_COLORS = [BLUE, GREEN]
LAYER_NAMES  = ["STREAM CTRL", "PRODUCTIVITY"]

CTRL  = Keycode.CONTROL
ALT   = Keycode.ALT
SHIFT = Keycode.SHIFT

HOLD_THRESHOLD = 1.0   # seconds before encoder hold fires
EXIT_DURATION  = 30    # seconds in exit countdown

# ── Shared state (dict avoids scattered globals) ──────────────────────────────
S = {
    "layer":          LAYER_STREAM,
    "clip_count":     0,
    "stream_start":   None,   # monotonic timestamp of first LIVE press
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
#   "type"     → keyboard_layout.write(payload)  — types a string
#   "clip"     → like "keys" but also increments clip counter
#   "exit"     → 30-second stop-stream sequence (no payload)
#   "none"     → no-op (placeholder)

KEYMAP = [
    # ── Layer 0: Stream Control ───────────────────────────────────────────────
    # Row 1              Row 2              Row 3
    # [LIVE] [GHOST][BRB]  [CHAT][CAM-X][MIC-X]  [STAT][AD][CLIP]
    # Row 4
    # [HYPE][CMND][EXIT]
    [
        ("LIVE",   "keys",     (CTRL, ALT, Keycode.ONE)),
        ("GHOST",  "keys",     (CTRL, ALT, Keycode.TWO)),
        ("BRB",    "keys",     (CTRL, ALT, Keycode.THREE)),
        ("CHAT",   "keys",     (CTRL, ALT, Keycode.FOUR)),
        ("CAM-X",  "keys",     (CTRL, ALT, Keycode.C)),
        ("MIC-X",  "keys",     (CTRL, ALT, Keycode.M)),
        ("STAT",   "keys",     (CTRL, ALT, Keycode.S)),
        ("AD",     "keys",     (Keycode.F17,)),
        ("CLIP",   "clip",     Keycode.F13),
        ("HYPE",   "clip",     Keycode.F14),
        ("CMND",   "keys",     (Keycode.F15,)),
        ("EXIT",   "exit",     None),
    ],
    # ── Layer 1: Productivity ─────────────────────────────────────────────────
    # Row 1               Row 2               Row 3
    # [PLAY][SKIP][PREV]  [MUTE-M][D-MUTE][D-DEAF]  [D-LINK][LURK][SNAP]
    # Row 4
    # [LOCK][TIMER][RELOAD]
    [
        ("PLAY",   "consumer", ConsumerControlCode.PLAY_PAUSE),
        ("SKIP",   "consumer", ConsumerControlCode.SCAN_NEXT_TRACK),
        ("PREV",   "consumer", ConsumerControlCode.SCAN_PREVIOUS_TRACK),
        ("MUTE-M", "consumer", ConsumerControlCode.MUTE),
        ("D-MUTE", "keys",     (CTRL, ALT, Keycode.F1)),   # set in Discord settings
        ("D-DEAF", "keys",     (CTRL, ALT, Keycode.F2)),   # set in Discord settings
        ("D-LINK", "keys",     (Keycode.F16,)),
        ("LURK",   "type",     "Thanks for lurking! o7"),
        ("SNAP",   "keys",     (CTRL, SHIFT, Keycode.FOUR)),
        ("LOCK",   "keys",     (CTRL, SHIFT, Keycode.Q)),
        ("TIMER",  "keys",     (CTRL, ALT, Keycode.T)),    # OBS BRB timer scene
        ("RELOAD", "keys",     (CTRL, ALT, Keycode.R)),    # OBS browser source reload
    ],
]

# ── OLED layout (128 × 64) ────────────────────────────────────────────────────
_group     = displayio.Group()
lbl_layer  = label.Label(terminalio.FONT, text="STREAM CTRL", color=0xFFFFFF, x=2, y=8)
lbl_uptime = label.Label(terminalio.FONT, text="OFFLINE",     color=0xAAAAAA, x=2, y=24)
lbl_clips  = label.Label(terminalio.FONT, text="CLIPS: 0",    color=0xAAAAAA, x=2, y=40)
lbl_status = label.Label(terminalio.FONT, text="READY",       color=0xFFFFFF, x=2, y=56)

for _lbl in (lbl_layer, lbl_uptime, lbl_clips, lbl_status):
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
    lbl_clips.text  = f"CLIPS: {S['clip_count']}"
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
    # EXIT key always red on stream layer so it's unmistakable
    if S["layer"] == LAYER_STREAM:
        macropad.pixels[11] = RED
    macropad.pixels.show()

# ── Action helpers ────────────────────────────────────────────────────────────
def _send_keys(payload):
    macropad.keyboard.press(*payload)
    macropad.keyboard.release_all()


def _begin_exit():
    S["exit_active"] = True
    S["exit_start"]  = time.monotonic()
    # Switch OBS to "Ending Soon" scene
    macropad.keyboard.press(CTRL, ALT, Keycode.E)
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

    # Start uptime clock on first LIVE press (key 0, stream layer)
    if S["layer"] == LAYER_STREAM and idx == 0 and S["stream_start"] is None:
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

    # ── Encoder button — tap: layer toggle / hold: mute ───────────────────────
    macropad.encoder_switch_debounced.update()

    if macropad.encoder_switch_debounced.fell:
        S["enc_held_start"] = time.monotonic()
        S["enc_triggered"]  = False

    # While held, check for long-press threshold
    if S["enc_held_start"] and not macropad.encoder_switch_debounced.value:
        if (
            not S["enc_triggered"]
            and (time.monotonic() - S["enc_held_start"]) >= HOLD_THRESHOLD
        ):
            macropad.consumer_control.send(ConsumerControlCode.MUTE)
            S["enc_triggered"] = True
            refresh_display("MUTED")

    # On release, fire tap action if hold never triggered
    if macropad.encoder_switch_debounced.rose:
        if not S["enc_triggered"]:
            S["layer"] = 1 - S["layer"]
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
