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
| `/events` | **Events & CTF Arena** | Published CTFs are selected as events; the arena shows only the selected event's visible challenges. Challenge visibility requires both a published parent event and a visible challenge. Flag submissions require an authenticated competitor, a published/live event, and an in-window schedule. The scoreboard is scoped to the selected CTF event. The Operations tab lists published workshops, sessions, and CTF announcements. |
| `/blog` | **Cyber Dispatches** | Public read-only page for threat intelligence, CVE writeups, and research papers. Direct URL hash auto-reader (`/blog#slug`), category filters (`All`, `Club Writeups`, `Cybernews`, `Vulnerabilities`), search, and a safe Markdown reader with GitHub-style formatting, fenced code, tables, and KaTeX math. Blog creation and deletion are available only in Admin Portal → Blog Posts. Raw HTML is disabled in article content. |
| `/about` | **Club Dossier** | Introductory sections about ciberNUtica and NIIT University, followed by coordinator profiles for **Rishi Bhargava** (`0xRISHI`) and **Arjun R Kamath** (`0xKAMATH`) with callsigns, bios, focus domains, and social profiles. |
| `/admin` | **Admin Portal** | Request-rendered and protected by RBAC (Role-Based Access Control). Non-admins are redirected to sign in. The portal has three tabs: Events (create/manage CTF, session, workshop, and talk events plus CTF challenges), Anti-Cheat Logs, and Blog Posts. CTF challenge creation, editing, and visibility are scoped to the selected CTF event. Scoreboard controls remain in the portal header. |

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

### Database and Docker

* **PostgreSQL** is the app's persistent data store. **Prisma ORM** provides the schema, migrations, and typed server-side database client. The source of truth is `prisma/schema.prisma`; migration history is in `prisma/migrations/`.
* **Docker Compose** runs PostgreSQL locally in the `postgres:17-alpine` container defined by `docker-compose.yml`. The database listens only on `127.0.0.1:5432` and persists across container restarts in the `cibernutica-postgres` Docker volume. Docker runs the local database service; the Next.js app and Prisma run on the host.
* The app connects through `DATABASE_URL`. `POSTGRES_PASSWORD`, `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `FLAG_PEPPER` are configured in the ignored `.env` file. Use `.env.example` as the template; never commit real secrets.
* Prisma models persist users, events, challenges, flags, hints, solves, submissions, blog posts, hint unlocks, and scoreboard freeze settings. Account passwords are scrypt-hashed. Static flags are HMAC-hashed and regex patterns are AES-GCM encrypted using `FLAG_PEPPER`; public CTF API responses never include flag contents. Flag validation and solve writes happen on the server in a database transaction.
* Initial content and the configured admin account are loaded with `npm run db:seed`. Seeding refreshes the admin password from the environment and resets the initial fixture records; use it for setup/development, not as a routine production command.
* Blog publishing, event creation/live toggles, challenge CRUD, submissions, solves, hint unlocks, and scoreboard freeze changes are database-backed and enforce role checks on server routes. The public scoreboard hides other competitors' solves while frozen.
* Events have two workflows: `CTF` competition events and general informational events (`WORKSHOP`, `SESSION`, or `SPEAKER`). Admins create both kinds from Admin Portal → Event Management, which asks for the event kind and shows matching fields. The CTF workspace selects a CTF and attaches challenges; informational events do not need challenges. Event creation controls are not shown on the public Events page. Server-side challenge creation verifies that its parent is a `CTF`, and only CTF events may open submissions. `Event.isPublished` controls public discovery; each `Challenge.state` controls challenge visibility. `Event.isLiveCTF` and the event's start/end timestamps jointly gate flag submissions. Public challenge and solve data is scoped to published events and visible challenges, and the scoreboard is calculated for the selected event. Admin event reads include unpublished events; public reads do not. The existing Event/Challenge relationship supports this without a schema migration.
* Setup details and commands are documented in `docs/DATABASE_SETUP.md`. For production, point `DATABASE_URL` at managed PostgreSQL and apply checked-in migrations with `npm run db:deploy`; Docker Compose is for local development.
* **Workspace status (October 28, 2026)**: Local PostgreSQL container was started, all three checked-in migrations were applied, and the seed script completed. Local `.env`/`.env.local` values are private and must not be copied into source control or printed.

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
│   │   ├── login/page.tsx         # User sign-in and competitor registration
│   │   ├── events/page.tsx       # Events & CTF Arena + Live Scoreboard
│   │   ├── blog/page.tsx         # Cyber Dispatches & Admin Publisher
│   │   ├── about/page.tsx        # Dossier & Rishi Bhargava / Arjun R Kamath
│   │   ├── admin/layout.tsx      # Server-side admin route guard
│   │   ├── admin/page.tsx        # Admin Portal & Anti-Cheat Audit Log
│   │   ├── api/                  # Authentication, content, and CTF endpoints
│   │   ├── globals.css           # Brutalist cyber styling, scanlines, crosshairs
│   │   └── layout.tsx            # Global RootLayout with CTFProvider & Nav
│   ├── components/
│   │   ├── cyber/CyberGlobe.tsx  # Interactive 3D particle canvas globe
│   │   └── layout/
│   │       ├── Navbar.tsx        # Yellow brutalist header and account controls
│   │       └── Footer.tsx        # Compact footer with navigation and home-style coordinator cards
│   └── lib/
│       ├── types.ts              # Full TypeScript models (User, Challenge, Solve, etc.)
│       ├── ctf-engine.ts         # CTFd dynamic scoring math & flag verification
│       ├── initial-data.ts       # Pre-seeded challenges, blogs, events, coordinators
│       ├── store.tsx             # Client state synchronized through server APIs
│       ├── prisma.ts             # Prisma client singleton
│       └── utils.ts              # cn helper
├── AGENTS.md                     # Agent system directives & rules
├── PROJECT_MEMORY.md             # This document
├── prisma/
│   ├── schema.prisma              # PostgreSQL data models
│   ├── migrations/                # Applied Prisma migration history
│   └── seed.ts                    # Initial admin, events, dispatches, challenges
├── docker-compose.yml             # Local PostgreSQL container and volume
├── .env.example                   # Database and authentication template
├── docs/DATABASE_SETUP.md         # Setup and deployment instructions
├── package.json
└── next.config.ts
```

---

## 7. How to Run & Verify

```bash
cd "/home/arjun/Documents/Work Stuff/Code Folder/ciberNUtica website"
cp .env.example .env  # Set unique secrets; keep .env private
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

`npm run db:migrate` applies local development migrations. For schema changes, use `npm run db:migrate -- --name <migration-name>`. Production deployments use `npm run db:deploy`. Run `npm run db:seed` for initial setup and development fixtures, not as a routine production command.
