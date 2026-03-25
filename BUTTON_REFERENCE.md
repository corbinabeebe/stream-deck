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
| Tap | Cycle layers (0 → 1 → 2 → 0) |
| Hold (1 second) | Global mute toggle |

---

## Layer 0 — Stream Control (Blue LEDs)

> Tap the knob until LEDs turn **blue**. Keys 11 and 12 are always **purple** and **red** regardless of layer.

```
┌──────────┐ ┌────────┐ ┌────────┐
│ 1 STARTNG│ │ 2 STEAM│ │ 3 LIVE │
└──────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 4 GHOST│ │  5 BRB │ │ 6 CHAT │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│7 TWITR │ │8 END SCN│ │9 REFSH │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 10 MIC │ │11 START│ │12 STOP │ ← 11=PURPLE, 12=RED
└────────┘ └────────┘ └────────┘
```

| Button | Label | Hotkey | What It Does |
|--------|-------|--------|--------------|
| **1** | STARTING | Ctrl+Alt+1 | Switch OBS to Stream Starting scene |
| **2** | STEAM | Ctrl+Alt+2 | Switch OBS to Steam scene |
| **3** | LIVE | Ctrl+Alt+3 | Switch OBS to Live (w/ Cam) scene — starts uptime clock |
| **4** | GHOST | Ctrl+Alt+4 | Switch OBS to Ghost scene (no cam/mic) |
| **5** | BRB | Ctrl+Alt+5 | Switch OBS to BRB scene |
| **6** | CHAT | Ctrl+Alt+6 | Switch OBS to Just Chatting scene |
| **7** | TWITTER | Ctrl+Alt+7 | Switch OBS to Twitter scene |
| **8** | END SCN | Ctrl+Alt+8 | Switch OBS to End Stream scene (ending overlay) |
| **9** | REFRESH | Ctrl+Alt+R | Refresh all OBS browser sources |
| **10** | MIC | Ctrl+Alt+M | Toggle mic mute/unmute |
| **11** | START | Ctrl+Alt+Shift+F11 | Start streaming |
| **12** | STOP | — | Start 30-second stop-stream countdown (press again to cancel) |

---

## Layer 1 — Twitch Commands (Green LEDs)

> Tap the knob until LEDs turn **green**. These keys fire F13–F21; the Node.js service intercepts them and calls the Twitch API or posts to chat.

```
┌─────────┐ ┌────────┐ ┌────────┐
│ 1 EKLPSE│ │2 MARKER│ │ 3 HYPE │
└─────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 4 JOKE │ │5 DOGFCT│ │6 DISCRD│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│7 SOCIAL│ │ 8 SCHED│ │9 UPTIME│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│10 (open)│ │11 (open)│ │12 (open)│
└────────┘ └────────┘ └────────┘
```

| Button | Label | Hotkey | Twitch Action |
|--------|-------|--------|---------------|
| **1** | EKLIPSE | F13 | Posts `!eklipse` to chat (signals Eklipse.gg to mark highlight) |
| **2** | MARKER | F14 | Creates a native Twitch VOD bookmark via Helix API |
| **3** | HYPE | F15 | Posts `!hype` to chat |
| **4** | JOKE | F16 | Posts `!dadjoke` to chat |
| **5** | DOGFACT | F17 | Posts `!dogfact` to chat |
| **6** | DISCORD | F18 | Posts `!discord` to chat |
| **7** | SOCIALS | F19 | Posts `!socials` to chat |
| **8** | SCHED | F20 | Posts `!schedule` to chat |
| **9** | UPTIME | F21 | Posts `!uptime` to chat |
| **10–12** | (open) | F22–F24 | Reserved for future commands |

> Chat commands rely on your Twitch bot (sery_bot, Nightbot, etc.) responding to them in channel. See the Setup Guide for bot configuration details.

---

## Layer 2 — Productivity (Yellow LEDs)

> Tap the knob until LEDs turn **yellow**. LURK and AD route through the Node.js service.

```
┌────────┐ ┌────────┐ ┌────────┐
│ 1 PLAY │ │ 2 SKIP │ │ 3 PREV │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│4 MUTE-M│ │5 D-MUTE│ │6 D-DEAF│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│7 RELOAD│ │ 8 LURK │ │ 9 SNAP │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│10 LOCK │ │  11 AD │ │12 TIMER│
└────────┘ └────────┘ └────────┘
```

| Button | Label | Hotkey | What It Does |
|--------|-------|--------|--------------|
| **1** | PLAY | consumer | Media play/pause (Spotify, etc.) |
| **2** | SKIP | consumer | Next track |
| **3** | PREV | consumer | Previous track |
| **4** | MUTE-M | consumer | Toggle system audio mute |
| **5** | D-MUTE | Ctrl+Alt+F1 | Toggle Discord mic mute |
| **6** | D-DEAF | Ctrl+Alt+F2 | Toggle Discord deafen |
| **7** | RELOAD | Ctrl+Alt+R | Refresh all OBS browser sources |
| **8** | LURK | Ctrl+Shift+F1 | Posts `!lurk` to chat (via Node.js service) |
| **9** | SNAP | Win+Shift+S | Windows Snipping Tool screenshot |
| **10** | LOCK | Win+L | Lock screen |
| **11** | AD | Ctrl+Shift+F2 | Start 30-second Twitch ad break (via Helix API) |
| **12** | TIMER | Ctrl+Alt+T | Switch OBS to BRB timer scene |

---

## The 30-Second Stop-Stream Sequence

Press **STOP (Button 12, Layer 0)** to safely end your stream:

1. OBS immediately switches to the End Stream scene
2. OLED counts down: `EXIT: 30s … EXIT: 1s`
3. **Changed your mind?** Press **STOP** again to cancel — stream stays live
4. At 0s, OBS stops the stream automatically

---

## OLED Display

```
STREAM CTRL      ← current layer name
00:00:00         ← stream uptime (starts when you press LIVE; shows OFFLINE until then)
CLIPS: 0         ← clip counter (informational)
READY            ← last action taken, or EXIT countdown
```
