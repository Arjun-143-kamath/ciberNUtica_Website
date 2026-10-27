# ciberNUtica — Project Memory & Conversation Handoff

> **Notice for Incoming AI Agent**: This document contains the complete memory, design system specifications, user decisions, architecture blueprints, and implementation progress from the initial project planning and setup phase. Read this file and `AGENTS.md` before answering any user prompts in this project.

---

## 1. Project Overview & Club Identity

* **Club Name**: **ciberNUtica** (Cybersecurity Club)
* **Lead Coordinators**:
  1. **Rishi Bhargava** — *Lead Coordinator & Threat Operations Lead (Callsign: `0xRISHI`)*. Focus: Offensive Security, Binary Exploitation, Red Teaming.
  2. **Arjun R Kamath** — *Lead Coordinator & Systems Infrastructure Lead (Callsign: `0xKAMATH`)*. Focus: Applied Cryptography, Post-Quantum Systems, Cloud Hardening.
* **Tech Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, TypeScript.
* **Style Reference Image**: Located at [`docs/style-reference.png`](./docs/style-reference.png).

---

## 2. Design System & Aesthetics (Strictly Followed)

* **Palette**:
  * Canvas: Deep Obsidian Black (`#060606`)
  * Primary Accent: High-voltage Cyber Yellow (`#FCEE09`)
  * Border/Muted: Amber/Yellow glow (`rgba(252, 238, 9, 0.25)`)
* **Visual Components**:
  * Top Header Banner: `#FCEE09` yellow bar with black bold typography.
  * Hero Headline: `"NO BREACHES, ONLY BOLD MOVES"` (from user's design reference).
  * 3D Wireframe Cyber Globe / Radar: Real-time Canvas 2D particle sphere with rotating longitude/latitude rings (`src/components/cyber/CyberGlobe.tsx`).
  * 3 Tactical telemetry cards below globe: Network Security, Security Audits, Forensics Analysis.
  * Tactical crosshair accents (`+`) on box borders (`.cyber-crosshair`, `.cyber-card`).

### User Decisions & Customizations
* **REMOVED from Home Page per user request**:
  * ❌ *Infinite Marquee Ticker Strip* (`▪ TRUST ▪ INTEGRITY ...`) — Removed completely.
  * ❌ *`/ MISSION` and `/ VISION` cards* — Removed from Home page.
* **Home Page Structure**: Focused cleanly on the cyber hero with the 3D globe, club telemetry counter strip, and clean briefing sections routing to the other 3 core pages: Events & CTFs, Dispatches, and About Dossier.

---

## 3. Four Core Pages Implemented

| Route | Page | Description & Key Features |
| :--- | :--- | :--- |
| `/` | **Home** | Brutalist cyber hero, interactive 3D particle radar globe with pointer orbit/tilt controls, telemetry stats (450+ Flags, 12 CTFs, 200+ Members, 99.9% Integrity), and overview briefs for Events, Blogs, and Leadership. |
| `/events` | **Events & CTF Arena** | **1. CTF Challenges Tab**: Categories (`Web Exploitation`, `Reverse Engineering`, `Cryptography`, `Binary Exploitation`, `Forensics`). Modal with descriptions, auto-prefix helper, rate limit attempts counter, unlockable hints (cost penalty), and flag submission with confetti.<br>**2. Live Scoreboard Tab**: Top 3 Podium summary cards, ranked leaderboard with category solve badges, CTFd tie-breaker, last solve microsecond timestamps, and Admin freeze toggle.<br>**3. Operations Tab**: List of past workshops, guest sessions, and upcoming CTF teasers with admin event creator. |
| `/blog` | **Cyber Dispatches** | Threat intelligence, CVE writeups, research papers. Direct URL hash auto-reader (`/blog#slug`), filter by categories, search bar, reader modal with syntax highlighting, and admin dispatch publishing tool. |
| `/about` | **Club Dossier** | Comprehensive history and defcon rules. Dedicated highlight cards for **Rishi Bhargava** (`0xRISHI`, L4 Red Team) and **Arjun R Kamath** (`0xKAMATH`, L4 Systems & Crypto) with callsigns, PGP fingerprints, bios, domains, and verified profiles. Operational divisions breakdown (Attack, Decompile, Cipher, Triage) and recruitment application terminal. |
| `/admin` | **Admin Portal** | Protected by RBAC (Role-Based Access Control). Non-admins see `403 FORBIDDEN`. Admins can configure & edit CTF Static & Dynamic challenges, inspect the **Real-Time Flag Submission Anti-Cheat Audit Log** with one-click brute force simulation and clear audit log actions, toggle event live state, and freeze/unfreeze the public scoreboard. |

---

## 4. CTFd-Compatible CTF Engine

The user explicitly selected a **Native Next.js CTFd-spec engine** (no external Python/Docker/Redis required, single unified stack):

### Dynamic Scoring Formula (`src/lib/ctf-engine.ts`)
Matches official CTFd logarithmic decay:
$$\text{Points} = \max\left(\text{minimum}, \left\lceil \left( \frac{\text{minimum} - \text{initial}}{\text{decay}^2} \right) \cdot \text{solves}^2 + \text{initial} \right\rceil\right)$$
* `initial`: Starting point value (e.g., 500)
* `min`: Minimum point floor (e.g., 100)
* `decay`: Number of solves needed to reach minimum (e.g., 15)
* Points dynamically rebalance across all past and future solvers whenever a flag is captured.

### Flag Verification & Security
* **Static Flag**: Exact string or case-insensitive match against SHA-256 salted hash, evaluated using timing-safe comparison (`crypto.timingSafeEqual`).
* **Regex Flag**: Validates variable tokens matching regex patterns.
* **Anti-Brute Force**: 5 submissions allowed per 60-second window per challenge.
* **Double-Solve Guard**: Prevents duplicate point awards.
* **Submission Audit Trail**: Every attempt (user, challenge, flag input, timestamp, verdict) is logged in the `Submission` table for anti-cheat forensics.

---

## 5. Authentication & RBAC

* Built with a Clearance Terminal Switcher (top navbar button):
  * **Admin Clearance L4**: Full CRUD across challenges (add, edit, delete), events, blogs, scoreboard freeze, and anti-cheat brute-force simulations.
  * **Competitors (`0xGhost`, `CipherPunk`, `NullByte`, `VectorRoot`)**: Participant arena view, flag submissions, rate-limit monitors, hint unlocks (-penalty), and real-time rank climbing.

---

## 6. Directory Structure & Key Files

```text
ciberNUtica website/
├── docs/
│   ├── style-reference.png       # User's uploaded design reference image
│   └── IMPLEMENTATION_PLAN.md   # Architectural blueprint
├── public/                       # Static public assets
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home Page
│   │   ├── events/page.tsx       # Events & CTF Arena + Live Scoreboard
│   │   ├── blog/page.tsx         # Cyber Dispatches & Admin Publisher
│   │   ├── about/page.tsx        # Dossier & Rishi Bhargava / Arjun R Kamath
│   │   ├── admin/page.tsx        # Admin Portal & Anti-Cheat Audit Log
│   │   ├── globals.css           # Brutalist cyber styling, scanlines, crosshairs
│   │   └── layout.tsx            # Global RootLayout with CTFProvider & Nav
│   ├── components/
│   │   ├── cyber/CyberGlobe.tsx  # Interactive 3D particle canvas globe
│   │   └── layout/
│   │       ├── Navbar.tsx        # Yellow brutalist header & Clearance Switcher
│   │       └── Footer.tsx        # Telemetry footer & coordinators credits
│   └── lib/
│       ├── types.ts              # Full TypeScript models (User, Challenge, Solve, etc.)
│       ├── ctf-engine.ts         # CTFd dynamic scoring math & flag verification
│       ├── initial-data.ts       # Pre-seeded challenges, blogs, events, coordinators
│       ├── store.tsx             # React Context & LocalStorage state engine
│       └── utils.ts              # cn helper
├── AGENTS.md                     # Agent system directives & rules
├── PROJECT_MEMORY.md             # This document
├── package.json
└── next.config.ts
```

---

## 7. How to Run & Verify

```bash
cd "/home/arjun/Documents/Work Stuff/Code Folder/ciberNUtica website"
npm run build   # Verified: 0 errors, 0 warnings
npm run dev     # Starts local server at http://localhost:3000
```
