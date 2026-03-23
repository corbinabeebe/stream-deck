🛠️ Project: The "Stealth Director" MacroPad (RP2040)
Objective: Create a silent, two-layer controller that manages OBS/Twitch stream production and handles productivity workflows — with a 30-second fail-safe exit sequence.

📋 Phase 1: Keymap & Layer Architecture
We will use Layer 0 for stream control and Layer 1 for productivity.

---

Layer 0: "Stream Control" (Blue LED)
Optimized for OBS Scene Control & Stealth Streaming.

[LIVE]:   Ctrl+Alt+1     — Standard Gameplay + Cam scene.
[GHOST]:  Ctrl+Alt+2     — Gameplay Only (No Cam/Mic).
[BRB]:    Ctrl+Alt+3     — Be Right Back Screen.
[CHAT]:   Ctrl+Alt+4     — Full Facecam / Just Chatting.

[CAM-X]:  Ctrl+Alt+C     — Toggle Camera visibility.
[MIC-X]:  Ctrl+Alt+M     — Toggle Microphone.
[STAT]:   Ctrl+Alt+S     — Toggle OBS Status Overlay.
[AD]:     F17            — Run Twitch Ad-break (Affiliates).

[CLIP]:   F13            — Send Eklipse.gg clip marker.
[HYPE]:   F14            — Secondary "Epic Moment" flag for Eklipse.
[CMND]:   F15            — Drop a Twitch chat command (socials, schedule, etc.).
[EXIT]:   (Macro)        — 30-Second Stop Stream sequence (details in Phase 2).

[LAYER]:  Rotary Press   — Toggle to Layer 1.

---

Layer 1: "Productivity" (Green LED)
Optimized for media, comms, and system control — no game, no stream required.

[PLAY]:   Media Play/Pause  — Spotify / system media toggle.
[SKIP]:   Media Next        — Skip to next track.
[PREV]:   Media Previous    — Go back one track.
[MUTE-M]: Ctrl+Alt+F4      — Mute/unmute Spotify (or system audio).

[D-MUTE]: (Macro)          — Toggle Discord mic mute.
[D-DEAF]: (Macro)          — Toggle Discord deafen.
[D-LINK]: F16              — Drop Discord invite link in Twitch chat.
[LURK]:   (Macro)          — Post "Thanks for lurking!" in Twitch chat.

[SNAP]:   Ctrl+Shift+4     — Screenshot to clipboard.
[LOCK]:   Ctrl+Shift+Q     — Lock screen / sleep display.
[TIMER]:  (Macro)          — Start a visible on-stream BRB countdown overlay.
[RELOAD]: (Macro)          — Reload OBS browser sources (alerts, overlays).

[LAYER]:  Rotary Press     — Toggle to Layer 0.

---

Rotary Encoder (Both Layers):
  Rotate: System volume up/down.
  Press:  Layer toggle (as above).
  Hold:   Global mute (silences headset immediately — silent, fast).

---

📋 Phase 2: The "30-Second Exit" Logic
This is the core engineering feat of the build. Instead of a "hard kill," [EXIT] triggers a timed sequence.

The Workflow:

  1. Initial Press:    MacroPad sends Ctrl+Alt+E (Switch to "Ending Soon" scene).
  2. Visual Feedback:  OLED displays a 30-second countdown.
  3. The Buffer:       Say your goodbyes, let the end screen run.
  4. Cancellation:     Press [EXIT] again during countdown → timer aborts, stay live.
  5. Execution:        After 30s → MacroPad sends Ctrl+Alt+Shift+F12 (Stop Stream).

---

📋 Phase 3: OBS Hotkey Configuration
Map these exactly in OBS Settings > Hotkeys:

  Scene Switch (Live):    Ctrl + Alt + 1
  Scene Switch (Ghost):   Ctrl + Alt + 2
  Scene Switch (BRB):     Ctrl + Alt + 3
  Scene Switch (Chat):    Ctrl + Alt + 4
  Scene Switch (Ending):  Ctrl + Alt + E
  Stop Streaming:         Ctrl + Alt + Shift + F12
  Toggle Camera:          Ctrl + Alt + C
  Toggle Mic:             Ctrl + Alt + M
  Toggle Status Overlay:  Ctrl + Alt + S
  Eklipse Marker:         F13
  Hype Marker:            F14

---

📋 Phase 4: Hardware Stealthing
Since you cannot be loud on the mic, eliminate mechanical noise:

  Silent Linear Switches: Kailh Midnight Silent V2 or Cherry MX Silent Reds.
  O-Rings:                Add rubber O-rings under keycaps to kill bottom-out noise.
  Rotary Knob:            Rebind press to layer toggle — usually the quietest input.

---

📋 Phase 5: OLED HUD
The display is active at all times, not just during the exit sequence:

  - Current layer name (STREAM CTRL / PRODUCTIVITY)
  - Stream uptime clock (starts on first [LIVE] press)
  - Clip counter (increments on every [CLIP] or [HYPE] press)
  - 30-second countdown during [EXIT] sequence

---

📋 Phase 6: Implementation (The Script)
Saved to the CIRCUITPY drive. Key behaviors:

  - time.monotonic() for the 30s timer so other buttons remain responsive during countdown.
  - Clip counter persists in memory for the session (resets on power cycle).
  - Layer state drives LED color: Blue = Stream Control, Green = Productivity.
