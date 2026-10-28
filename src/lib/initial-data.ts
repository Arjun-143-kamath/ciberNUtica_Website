import { BlogPost, Challenge, Coordinator, EventItem, Solve, User } from './types';

export const INITIAL_COORDINATORS: Coordinator[] = [
  {
    name: 'Rishi Bhargava',
    role: 'Lead Coordinator & Threat Operations',
    callsign: '0xRISHI',
    tagline: 'Offensive Security Researcher // Red Team Specialist',
    bio: 'Specializing in vulnerability research, binary exploitation, and adversary simulation. Spearheads ciberNUtica operational training and advanced offensive cybersecurity workshops.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    domains: ['Binary Exploitation', 'Red Teaming', 'Web App Pentesting', 'Malware Analysis'],
    socials: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'Arjun R Kamath',
    role: 'Lead Coordinator & Systems Infrastructure',
    callsign: '0xKAMATH',
    tagline: 'Cryptographic Protocols // Cloud & Defense Architecture',
    bio: 'Architect behind ciberNUtica cyber range infrastructure. Focuses on post-quantum cryptography, defensive kernel hardening, and managing club competition environments.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    domains: ['Applied Cryptography', 'DevSecOps', 'Cloud Hardening', 'Network Telemetry'],
    socials: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@cibernutica.org',
    role: 'ADMIN',
    teamName: 'Command Staff',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-1',
    username: '0xGhost',
    email: 'ghost@cibernutica.org',
    role: 'USER',
    teamName: 'PhantomSec',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user-2',
    username: 'CipherPunk',
    email: 'cipher@cibernutica.org',
    role: 'USER',
    teamName: 'BitShift',
    createdAt: '2026-02-02T12:00:00Z'
  },
  {
    id: 'user-3',
    username: 'NullByte',
    email: 'nullbyte@cibernutica.org',
    role: 'USER',
    teamName: 'NullPointers',
    createdAt: '2026-02-03T15:00:00Z'
  },
  {
    id: 'user-4',
    username: 'VectorRoot',
    email: 'vector@cibernutica.org',
    role: 'USER',
    teamName: 'KernelPanic',
    createdAt: '2026-02-04T09:30:00Z'
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-cibernutica-ctf-2026',
    title: 'ciberNUtica Winter CTF: Cyber Siege 2026',
    slug: 'cibernutica-winter-ctf-2026',
    description: 'Our flagship 24-hour jeopardy-style cybersecurity competition. Pitting hackers against simulated real-world critical infrastructure, enterprise web targets, memory corruption flaws, and cryptographic puzzles.',
    type: 'CTF',
    location: 'Cyber Operations Lab & Online Arena',
    date: 'OCTOBER 28, 2026',
    startTime: '00:00 UTC',
    endTime: '23:59 UTC',
    isPublished: true,
    isLiveCTF: true,
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'evt-red-team-bootcamp',
    title: 'Red Team Tactics: Privilege Escalation & Lateral Movement',
    slug: 'red-team-tactics-bootcamp',
    description: 'Hands-on practical session taking students from an initial unprivileged foothold to full domain controller takeover using modern Kerberos abuse and Active Directory attacks.',
    type: 'WORKSHOP',
    location: 'Auditorium 3 & Virtual Cyber Range',
    date: 'NOVEMBER 14, 2026',
    startTime: '14:00 UTC',
    endTime: '18:00 UTC',
    isPublished: true,
    isLiveCTF: false,
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'evt-kernel-exploitation',
    title: 'Linux Kernel Exploitation & Ret2User Deep Dive',
    slug: 'linux-kernel-exploitation-session',
    description: 'Technical symposium and live exploit development session led by club coordinators demonstrating SMEP/SMAP bypasses and slab allocation corruption.',
    type: 'SESSION',
    location: 'Lab 402, Systems Wing',
    date: 'SEPTEMBER 18, 2026',
    startTime: '16:00 UTC',
    endTime: '19:30 UTC',
    isPublished: true,
    isLiveCTF: false,
    bannerUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'chal-web-1',
    eventId: 'evt-cibernutica-ctf-2026',
    title: 'Admin Gate: JWT Alg Confusion',
    category: 'Web Exploitation',
    description: `We intercepted a classified executive portal. The backend verifies JSON Web Tokens using public key RS256, but rumor has it the server verification library blindly trusts whatever algorithm is supplied in the header.
    
**Target:** \`https://gateway.internal.cibernutica.org\`
**Goal:** Forge an administrative session token with role \`SUPER_ADMIN\` and extract the root system flag.`,
    type: 'DYNAMIC',
    initialPoints: 500,
    minPoints: 100,
    decaySolves: 15,
    currentPoints: 420,
    state: 'visible',
    maxAttempts: 0,
    flags: [
      {
        id: 'f-1',
        challengeId: 'chal-web-1',
        type: 'STATIC',
        content: 'ciberNUtica{jwt_h54m_c0nfu510n_pwn3d}',
        caseSensitive: true
      }
    ],
    hints: [
      {
        id: 'h-1',
        challengeId: 'chal-web-1',
        content: 'Look at the server public certificate. What happens if you re-sign the payload using HS256 with the public key bytes as your HMAC secret?',
        cost: 25
      }
    ],
    tags: ['JWT', 'Crypto', 'Web']
  },
  {
    id: 'chal-rev-1',
    eventId: 'evt-cibernutica-ctf-2026',
    title: 'Binary Vault: Anti-Debug Strip',
    category: 'Reverse Engineering',
    description: `An encrypted ELF 64-bit binary was recovered from an APT threat group. It detects \`ptrace\` and inspects \`/proc/self/status\`. Bypass the debugger evasion routines and recover the decryption passphrase.
    
Download attachment: \`vault.bin\``,
    type: 'DYNAMIC',
    initialPoints: 500,
    minPoints: 150,
    decaySolves: 12,
    currentPoints: 465,
    state: 'visible',
    maxAttempts: 0,
    flags: [
      {
        id: 'f-2',
        challengeId: 'chal-rev-1',
        type: 'STATIC',
        content: 'ciberNUtica{p7r4c3_byp455_r3v_k1ng}',
        caseSensitive: true
      }
    ],
    hints: [
      {
        id: 'h-2',
        challengeId: 'chal-rev-1',
        content: 'Patch the conditional jump instruction at offset 0x140f from JZ to JNZ or NOP out the ptrace check.',
        cost: 30
      }
    ],
    tags: ['ELF', 'x86_64', 'Ghidra']
  },
  {
    id: 'chal-crypto-1',
    eventId: 'evt-cibernutica-ctf-2026',
    title: 'RSA: Copperfield Small Exponent',
    category: 'Cryptography',
    description: `We acquired ciphertexts generated with a public exponent e=3 and partial high-order bits of the message padding.
    
Compute the root using Franklin-Reiter or Coppersmith theorem.`,
    type: 'STANDARD',
    initialPoints: 300,
    minPoints: 300,
    decaySolves: 0,
    currentPoints: 300,
    state: 'visible',
    maxAttempts: 0,
    flags: [
      {
        id: 'f-3',
        challengeId: 'chal-crypto-1',
        type: 'STATIC',
        content: 'ciberNUtica{c0pp3r5m17h_5m4ll_e_br34k}',
        caseSensitive: true
      }
    ],
    hints: [],
    tags: ['RSA', 'Lattices', 'Math']
  },
  {
    id: 'chal-pwn-1',
    eventId: 'evt-cibernutica-ctf-2026',
    title: 'ROP Matrix: Ret2Libc Stack Smashing',
    category: 'Binary Exploitation',
    description: `Target is running Ubuntu 24.04 with NX enabled, but ASLR leak is provided via a formatted string read. Smashing the return address with a crafted ROP chain calling \`system('/bin/sh')\`.
    
**Port:** \`nc ctf.cibernutica.org 9021\``,
    type: 'DYNAMIC',
    initialPoints: 500,
    minPoints: 100,
    decaySolves: 10,
    currentPoints: 500,
    state: 'visible',
    maxAttempts: 0,
    flags: [
      {
        id: 'f-4',
        challengeId: 'chal-pwn-1',
        type: 'STATIC',
        content: 'ciberNUtica{r0p_ch41n_5y573m_p0pp3d}',
        caseSensitive: true
      }
    ],
    hints: [],
    tags: ['ROP', 'Pwn', 'x86_64']
  },
  {
    id: 'chal-forensics-1',
    eventId: 'evt-cibernutica-ctf-2026',
    title: 'PCAP Exfiltration: DNS Tunneling',
    category: 'Forensics',
    description: `Suspicious outgoing DNS queries were captured during an exfiltration event. Analyze the query subdomains, reconstruct the base32/hex chunks, and assemble the secret archive.`,
    type: 'STANDARD',
    initialPoints: 200,
    minPoints: 200,
    decaySolves: 0,
    currentPoints: 200,
    state: 'visible',
    maxAttempts: 0,
    flags: [
      {
        id: 'f-5',
        challengeId: 'chal-forensics-1',
        type: 'STATIC',
        content: 'ciberNUtica{dn5_7unn3l_3xf1l_c4ugh7}',
        caseSensitive: true
      }
    ],
    hints: [
      {
        id: 'h-3',
        challengeId: 'chal-forensics-1',
        content: 'Tshark filter: tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields -e dns.qry.name',
        cost: 20
      }
    ],
    tags: ['Wireshark', 'PCAP', 'Network']
  }
];

export const INITIAL_SOLVES: Solve[] = [
  {
    id: 'slv-1',
    userId: 'user-1',
    username: '0xGhost',
    challengeId: 'chal-web-1',
    challengeTitle: 'Admin Gate: JWT Alg Confusion',
    pointsAwarded: 420,
    solvedAt: '2026-10-28T01:15:22Z'
  },
  {
    id: 'slv-2',
    userId: 'user-1',
    username: '0xGhost',
    challengeId: 'chal-crypto-1',
    challengeTitle: 'RSA: Copperfield Small Exponent',
    pointsAwarded: 300,
    solvedAt: '2026-10-28T02:05:40Z'
  },
  {
    id: 'slv-3',
    userId: 'user-2',
    username: 'CipherPunk',
    challengeId: 'chal-web-1',
    challengeTitle: 'Admin Gate: JWT Alg Confusion',
    pointsAwarded: 420,
    solvedAt: '2026-10-28T02:45:11Z'
  },
  {
    id: 'slv-4',
    userId: 'user-3',
    username: 'NullByte',
    challengeId: 'chal-forensics-1',
    challengeTitle: 'PCAP Exfiltration: DNS Tunneling',
    pointsAwarded: 200,
    solvedAt: '2026-10-28T03:10:05Z'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Zero-Day Weaponization: Auditing eBPF Verifier Flaws',
    slug: 'auditing-ebpf-verifier-flaws',
    summary: 'A deep-dive technical post-mortem into how subtle state-tracking logic bugs in the Linux kernel eBPF verifier allow arbitrary kernel memory read/write primitives.',
    content: `## The Modern eBPF Attack Surface

Extended Berkeley Packet Filter (eBPF) has revolutionized Linux kernel observability, networking, and runtime security. However, executing user-supplied bytecode inside kernel ring 0 demands an airtight static verifier.

### How the Verifier Operates
The eBPF verifier performs abstract interpretation over all reachable branch instructions to prove safety:
1. It simulates instruction execution tracking the register types: \`SCALAR_VALUE\`, \`PTR_TO_STACK\`, \`PTR_TO_MAP_VALUE\`.
2. It calculates algebraic bounds: \`smin_value\`, \`smax_value\`, \`umin_value\`, \`umax_value\`.

\`\`\`c
// Flawed 32-to-64 sign extension in kernel verifier logic
static void scalar_min_max_add(struct bpf_reg_state *dst_reg,
                              struct bpf_reg_state *src_reg) {
    s64 smin = dst_reg->smin_value + src_reg->smin_value;
    s64 smax = dst_reg->smax_value + src_reg->smax_value;
    // Missing integer overflow validation before bound commitment
}
\`\`\`

When this abstract range computation diverges from actual CPU register state during JIT compilation, an attacker can coerce an out-of-bounds array access into arbitrary kernel memory corruption.

### Remediation & Defense
- Restrict unprivileged eBPF access: \`sysctl -w kernel.unprivileged_bpf_disabled=1\`
- Implement runtime integrity monitors targeting BPF program loads.`,
    category: 'Vulnerabilities',
    authorName: 'Rishi Bhargava',
    authorRole: 'Threat Operations Lead',
    readTime: '6 min read',
    publishedAt: 'OCTOBER 24, 2026',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'blog-2',
    title: 'Post-Quantum Lattice Cryptography & Kyber Implementations',
    slug: 'post-quantum-lattice-crypto-kyber',
    summary: 'Analyzing ML-KEM (CRYSTALS-Kyber) lattice-based key encapsulation mechanisms and their resistance against Shor algorithm quantum factorization.',
    content: `## The Quantum Threat to Asymmetric Key Exchange

Shor's algorithm running on a sufficiently fault-tolerant quantum computer will solve the Discrete Logarithm Problem (DLP) and Integer Factorization (RSA) in polynomial time:

$$\\mathcal{O}((\\log N)^3)$$

This guarantees the complete compromise of traditional Diffie-Hellman and RSA protocols.

### Enter Learning With Errors (LWE)

Lattice-based cryptography builds security upon the computational hardness of finding the shortest vector in high-dimensional Euclidean lattices (Shortest Vector Problem, SVP).

\`\`\`python
# Conceptual Ring-LWE Matrix Formulation
import numpy as np

# Dimension n, Modulus q
n, q = 256, 3329
A = np.random.randint(0, q, size=(n, n))
s = np.random.choice([-1, 0, 1], size=n) # Secret vector
e = np.random.choice([-1, 0, 1], size=n) # Error noise vector

# Public Key computation with injected noise
b = (np.dot(A, s) + e) % q
\`\`\`

Without the noise term $e$, this is Gaussian elimination solvable in polynomial time. With small Gaussian or binomial noise, discovering secret vector $s$ is computationally intractable even for quantum architectures.

### ciberNUtica Research Recommendations
All club servers have initiated migration towards hybrid X25519 + Kyber768 TLS cipher suites.`,
    category: 'Cybernews',
    authorName: 'Arjun R Kamath',
    authorRole: 'Systems Lead',
    readTime: '8 min read',
    publishedAt: 'OCTOBER 20, 2026',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'blog-3',
    title: 'CTF Masterclass: Exploiting Format String Vulnerabilities',
    slug: 'ctf-format-string-exploits',
    summary: 'A step-by-step offensive methodology for abusing printf() specifiers to achieve arbitrary memory read, stack canary leakage, and GOT overwrite.',
    content: `## Why Format Strings Still Haunt C/C++ Codebases

When untrusted input is passed directly as the format parameter to \`printf(user_input)\` instead of \`printf("%s", user_input)\`, the CPU reads parameters off the stack corresponding to format specifiers (%x, %p, %s, %n).

### Key Specifiers in Offensive Exploitation
- \`%p\`: Leaks pointer addresses (ASLR bypass, libc base deduction).
- \`%s\`: Arbitrary memory read (dereferences address located on stack).
- \`%n\`: **Arbitrary memory write** (writes number of bytes printed so far into memory address pointer!).

\`\`\`bash
# Direct Parameter Access Syntax
printf "AAAA%%7\\$p" # Leaks the 7th argument on stack
\`\`\`

Join our live CTF arena on the Events page to practice this technique on active challenges!`,
    category: 'Club Writeups',
    authorName: 'ciberNUtica Red Team',
    authorRole: 'Core Research',
    readTime: '5 min read',
    publishedAt: 'OCTOBER 15, 2026',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
  }
];
