# ciberNUtica Agent Directives & Memory Protocol

## Context Protocol
Whenever the user asks a question, requests a change, or initiates a task on this codebase:
1. **Refresh Context**: Always reference `PROJECT_MEMORY.md` and `docs/IMPLEMENTATION_PLAN.md` for project architecture, user decisions, CTF dynamic scoring rules, data models, and component structure.
2. **Key Design Conventions**:
   - **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide icons.
   - **Visual Identity**: Obsidian black (`#060606`) with high-voltage cyber yellow (`#FCEE09`), brutalist monospace typography, 3D particle radar globe (`CyberGlobe.tsx`), and crosshair-accented boxes (`.cyber-card`).
   - **Home Page Rule**: Do NOT re-add the infinite marquee ticker or the `/ MISSION` and `/ VISION` cards to the Home page. Keep Home focused on the hero, 3D globe, telemetry counter, and the clean overview briefing hubs routing to Events, Blogs, and About.
   - **CTFd Dynamic Scoring**: Adhere to the mathematical decay algorithm in `src/lib/ctf-engine.ts` ($$\text{Points} = \max(\text{min}, \lceil ((\text{min} - \text{initial}) / \text{decay}^2) \cdot \text{solves}^2 + \text{initial} \rceil)$$).
   - **Coordinators**: Always represent **Rishi Bhargava** (Threat Operations Lead, `0xRISHI`) and **Arjun R Kamath** (Systems & Crypto Lead, `0xKAMATH`) as the club coordinators.
   - **Security**: Maintain anti-brute force rate limiting (5 attempts/min), timing-safe flag verification, and role-based access control (Admin vs Competitor).
