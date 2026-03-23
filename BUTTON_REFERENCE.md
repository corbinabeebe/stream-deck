# MacroPad Button Reference

## Controller Layout

```
┌─────────────────────────────────────┐
│  ┌──────────────────┐  ┌─────────┐  │
│  │   OLED DISPLAY   │  │  (ENC)  │  │
│  │  STREAM CTRL     │  │  ─────  │  │
│  │  00:00:00        │  │ Tap=Lyr │  │
│  │  CLIPS: 0        │  │ Hld=Mut │  │
│  │  READY           │  │ Rot=Vol │  │
│  └──────────────────┘  └─────────┘  │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐      │
│  │   1   │ │   2   │ │   3   │      │
│  └───────┘ └───────┘ └───────┘      │
│  ┌───────┐ ┌───────┐ ┌───────┐      │
│  │   4   │ │   5   │ │   6   │      │
│  └───────┘ └───────┘ └───────┘      │
│  ┌───────┐ ┌───────┐ ┌───────┐      │
│  │   7   │ │   8   │ │   9   │      │
│  └───────┘ └───────┘ └───────┘      │
│  ┌───────┐ ┌───────┐ ┌───────┐      │
│  │  10   │ │  11   │ │  12   │      │
│  └───────┘ └───────┘ └───────┘      │
└─────────────────────────────────────┘
```

---

## Rotary Encoder (Knob)

| Input | Action |
|-------|--------|
| Rotate clockwise | Volume up |
| Rotate counter-clockwise | Volume down |
| Tap | Toggle between layers |
| Hold (1 second) | Global mute |

---

## Layer 0 — Stream Control (Blue LEDs)

> Switch to this layer by tapping the knob until LEDs turn **blue**.

```
┌────────┐ ┌────────┐ ┌────────┐
│ 1 LIVE │ │ 2 GHOST│ │  3 BRB │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 4 CHAT │ │ 5 CAM-X│ │ 6 MIC-X│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 7 STAT │ │  8 AD  │ │ 9 CLIP │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 10 HYPE│ │11 CMND │ │12 EXIT │ ← always RED
└────────┘ └────────┘ └────────┘
```

| Button | Label | What It Does |
|--------|-------|--------------|
| **1** | LIVE | Switch OBS to gameplay + cam scene — also starts the stream uptime clock |
| **2** | GHOST | Switch OBS to no-camera/no-mic scene |
| **3** | BRB | Switch OBS to Be Right Back screen |
| **4** | CHAT | Switch OBS to facecam-only scene |
| **5** | CAM-X | Toggle camera source on/off in OBS |
| **6** | MIC-X | Toggle microphone on/off in OBS |
| **7** | STAT | Toggle status overlay on/off in OBS |
| **8** | AD | Trigger a Twitch ad break |
| **9** | CLIP | Mark an Eklipse clip — also increments the CLIPS counter on screen |
| **10** | HYPE | Mark an Eklipse "epic moment" — also increments the CLIPS counter |
| **11** | CMND | Drop a chat command (socials / schedule) |
| **12** | EXIT | Start the 30-second stop-stream sequence (see below) |

---

## Layer 1 — Productivity (Green LEDs)

> Switch to this layer by tapping the knob until LEDs turn **green**.

```
┌────────┐ ┌────────┐ ┌────────┐
│ 1 PLAY │ │ 2 SKIP │ │ 3 PREV │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│4 MUTE-M│ │5 D-MUTE│ │6 D-DEAF│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│7 D-LINK│ │ 8 LURK │ │ 9 SNAP │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│10 LOCK │ │11 TIMER│ │12 RELOD│
└────────┘ └────────┘ └────────┘
```

| Button | Label | What It Does |
|--------|-------|--------------|
| **1** | PLAY | Media play / pause (Spotify, etc.) |
| **2** | SKIP | Next track |
| **3** | PREV | Previous track |
| **4** | MUTE-M | Mute system audio |
| **5** | D-MUTE | Toggle Discord mic mute |
| **6** | D-DEAF | Toggle Discord deafen |
| **7** | D-LINK | Drop Discord invite link in Twitch chat |
| **8** | LURK | Types "Thanks for lurking! o7" |
| **9** | SNAP | Take a screenshot (Ctrl+Shift+4) |
| **10** | LOCK | Lock screen |
| **11** | TIMER | Switch OBS to BRB timer scene |
| **12** | RELOAD | Reload OBS browser sources |

---

## The 30-Second Exit Sequence

Press **[EXIT] (Button 12, Stream layer)** to safely end your stream:

1. OBS immediately switches to the "Ending Soon" scene
2. OLED counts down: `EXIT: 30s … EXIT: 1s`
3. **Changed your mind?** Press **[EXIT]** again to cancel — stream stays live
4. At 0s, OBS stops the stream automatically

---

## OLED Display

```
STREAM CTRL      ← current layer name
00:00:00         ← stream uptime (starts when you press LIVE; shows OFFLINE until then)
CLIPS: 0         ← increments every time you press CLIP or HYPE
READY            ← last action taken, or EXIT countdown
```
