'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Shield, Cpu, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#FCEE09]/20 bg-black text-neutral-400 font-mono text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-2.5 h-2.5 bg-[#FCEE09] inline-block"></span>
              <span className="text-[#FCEE09] tracking-wider">ciberNUtica</span>
            </div>
            <p className="text-neutral-500 leading-relaxed text-[11px]">
              Offensive security research, ethical hacking, and advanced CTF competitive warfare club. Hardening future cyber engineers.
            </p>
            <div className="text-[10px] text-neutral-600 space-y-1">
              <div>SYS.VER: 2026.4.1 // AIRGAP ACTIVE</div>
              <div>LOC: CYBER_OPS_HQ</div>
            </div>
          </div>

          {/* Col 2: Navigation Hubs */}
          <div className="space-y-3">
            <div className="text-[#FCEE09] font-bold text-[11px] tracking-wider uppercase">
              // DIRECTORY
            </div>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li>
                <Link href="/" className="hover:text-[#FCEE09] transition flex items-center gap-1.5">
                  <span>&gt;</span> HOME TERMINAL
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#FCEE09] transition flex items-center gap-1.5">
                  <span>&gt;</span> OPERATIONS & CTF ARENA
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#FCEE09] transition flex items-center gap-1.5">
                  <span>&gt;</span> THREAT DISPATCHES
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FCEE09] transition flex items-center gap-1.5">
                  <span>&gt;</span> CLUB DOSSIER & LEADERSHIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Leadership Brief */}
          <div className="space-y-3">
            <div className="text-[#FCEE09] font-bold text-[11px] tracking-wider uppercase">
              // COORDINATORS
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="border-l border-[#FCEE09]/40 pl-2">
                <div className="text-white font-bold">Rishi Bhargava</div>
                <div className="text-neutral-500 text-[10px]">Threat Operations // 0xRISHI</div>
              </div>
              <div className="border-l border-[#FCEE09]/40 pl-2">
                <div className="text-white font-bold">Arjun R Kamath</div>
                <div className="text-neutral-500 text-[10px]">Systems & Crypto // 0xKAMATH</div>
              </div>
            </div>
          </div>

          {/* Col 4: Telemetry Status */}
          <div className="space-y-3">
            <div className="text-[#FCEE09] font-bold text-[11px] tracking-wider uppercase">
              // TELEMETRY
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between text-neutral-400">
                <span>WARFARE ENGINE:</span>
                <span className="text-[#FCEE09] font-bold">CTFd SPEC v4</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>SCORING MODE:</span>
                <span className="text-emerald-400">DYNAMIC DECAY</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>DEFENSE STATUS:</span>
                <span className="text-emerald-400">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-600 text-[11px]">
          <div>
            © 2026 ciberNUtica Cybersecurity Division. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>DEFCON PROTOCOLS</span>
            <span>•</span>
            <span>ZERO BREACH POLICY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
