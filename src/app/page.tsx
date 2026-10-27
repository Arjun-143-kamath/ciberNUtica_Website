'use client';

import React from 'react';
import Link from 'next/link';
import { CyberGlobe } from '@/components/cyber/CyberGlobe';
import { useCTF } from '@/lib/store';
import { 
  ShieldAlert, 
  Terminal, 
  Flag, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Binary, 
  Radio, 
  Lock, 
  Flame,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { events, blogs, scoreboard, challenges } = useCTF();

  // Highlighted live or next CTF event
  const liveCTFEvent = events.find(e => e.isLiveCTF) || events[0];
  const recentBlogs = blogs.slice(0, 3);
  const totalSolves = scoreboard.reduce((sum, s) => sum + s.solvesCount, 0);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION — two-column: text left, globe right */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* LEFT: Text content */}
          <div className="space-y-7">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#FCEE09]/30 bg-[#FCEE09]/10 text-[#FCEE09] text-[11px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-[#FCEE09] animate-pulse" />
              SYS.STATUS: ARMED // THREAT LEVEL RED
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-mono font-black text-white tracking-tighter leading-[1.05] uppercase">
              NO BREACHES,<br />
              <span className="text-[#FCEE09]">ONLY BOLD MOVES.</span>
            </h1>

            {/* Subtext */}
            <p className="font-mono text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
              Offensive security research, adversary simulation, and live CTFd-grade cyber warfare. We train the next generation of ethical hackers and defenders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/events" className="cyber-btn-yellow px-5 py-2.5 text-xs flex items-center gap-2">
                <Flag className="w-3.5 h-3.5" />
                <span>ENTER CTF ARENA</span>
              </Link>
              <Link href="/about" className="cyber-btn-outline px-5 py-2.5 text-xs flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>CLUB DOSSIER</span>
              </Link>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-neutral-900">
              <div className="font-mono text-xs">
                <span className="text-[#FCEE09] font-black text-base">{challenges.length}</span>
                <span className="text-neutral-500 ml-1.5 uppercase tracking-wider">Challenges</span>
              </div>
              <div className="font-mono text-xs">
                <span className="text-[#FCEE09] font-black text-base">{totalSolves}</span>
                <span className="text-neutral-500 ml-1.5 uppercase tracking-wider">Flags Captured</span>
              </div>
              <div className="font-mono text-xs">
                <span className="text-emerald-400 font-black text-base">99.9%</span>
                <span className="text-neutral-500 ml-1.5 uppercase tracking-wider">Integrity</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Globe */}
          <div className="border border-[#FCEE09]/20 bg-neutral-950/60">
            {/* Minimal header bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#FCEE09]/15">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                // LIVE GLOBAL THREAT RADAR
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                SCANNING
              </span>
            </div>
            <CyberGlobe />
            {/* Footer bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[#FCEE09]/15 font-mono text-[9px] text-neutral-600">
              <span>LAT 12.9716° N / LON 77.5946° E</span>
              <span>DRAG TO ORBIT</span>
              <span>PULSE: 128 GHz</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. TACTICAL CAPABILITY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="w-7 h-7 bg-[#FCEE09]/10 border border-[#FCEE09]/30 flex items-center justify-center text-[#FCEE09]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-[#FCEE09] uppercase tracking-wider">
              NETWORK SECURITY
            </h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Safeguard your network infrastructure against unauthorized access, active intrusion, and lateral pivot attacks.
            </p>
          </div>

          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="w-7 h-7 bg-[#FCEE09]/10 border border-[#FCEE09]/30 flex items-center justify-center text-[#FCEE09]">
              <Binary className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-[#FCEE09] uppercase tracking-wider">
              SECURITY AUDITS
            </h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Comprehensive security reviews, binary decompilation, and fuzzing to guarantee system compliance and resilience.
            </p>
          </div>

          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="w-7 h-7 bg-[#FCEE09]/10 border border-[#FCEE09]/30 flex items-center justify-center text-[#FCEE09]">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-mono text-sm font-bold text-[#FCEE09] uppercase tracking-wider">
              FORENSICS ANALYSIS
            </h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              In-depth investigations into digital breaches, memory dumps, and PCAP analysis to reconstruct APT operations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE PAGE BRIEFING HUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="border-b border-[#FCEE09]/20 pb-4 flex items-end justify-between">
          <div>
            <div className="text-[#FCEE09] font-mono text-xs font-bold tracking-widest uppercase mb-1">
              // CLUSTER OVERVIEW
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
              OPERATIONS, DISPATCHES & LEADERSHIP
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
            HUB_DISPATCH // 01-03
          </span>
        </div>

        {/* HUB 1: EVENTS & CTF ARENA BRIEF */}
        <div className="cyber-card p-6 sm:p-8 border border-[#FCEE09]/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FCEE09] font-bold uppercase">
                <Flame className="w-4 h-4 text-[#FCEE09]" />
                <span>ACTIVE OPERATION & CTF TEASER</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase">
                {liveCTFEvent.title}
              </h3>
              <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                {liveCTFEvent.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300 pt-2">
                <span className="px-2 py-1 bg-neutral-900 border border-neutral-700">
                  DATE: {liveCTFEvent.date}
                </span>
                <span className="px-2 py-1 bg-neutral-900 border border-neutral-700">
                  MODE: CTFd DYNAMIC DECAY
                </span>
                <span className="px-2 py-1 bg-yellow-950 text-[#FCEE09] border border-[#FCEE09]/40">
                  STATUS: LIVE ARENA READY
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
              <Link
                href="/events"
                className="cyber-btn-yellow px-5 py-3 text-xs text-center flex items-center justify-center gap-2"
              >
                <span>LAUNCH ARENA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="text-[10px] font-mono text-neutral-500 text-center">
                Real-time scoreboard & flag validation
              </div>
            </div>
          </div>
        </div>

        {/* HUB 2: BLOG / INTEL DISPATCHES BRIEF */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-white uppercase">
              <BookOpen className="w-4 h-4 text-[#FCEE09]" />
              <span>LATEST INTEL & CVE DISPATCHES</span>
            </div>
            <Link
              href="/blog"
              className="text-xs font-mono text-[#FCEE09] hover:underline flex items-center gap-1 font-bold"
            >
              <span>VIEW ALL DISPATCHES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/blog#${post.slug}`}
                className="cyber-card p-5 border border-[#FCEE09]/20 hover:border-[#FCEE09] transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#FCEE09] px-2 py-0.5 bg-[#FCEE09]/10 border border-[#FCEE09]/30">
                      {post.category}
                    </span>
                    <span className="text-neutral-500">{post.readTime}</span>
                  </div>
                  <h4 className="font-mono text-sm font-bold text-white group-hover:text-[#FCEE09] transition leading-snug">
                    {post.title}
                  </h4>
                  <p className="font-mono text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-900 mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>BY {post.authorName}</span>
                  <span className="text-[#FCEE09] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* HUB 3: ABOUT CLUB & LEADERSHIP BRIEF */}
        <div className="cyber-card p-6 sm:p-8 border border-[#FCEE09]/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FCEE09] font-bold uppercase">
                <Users className="w-4 h-4 text-[#FCEE09]" />
                <span>COMMAND PERSONNEL & DOSSIER</span>
              </div>
              <h3 className="text-2xl font-mono font-bold text-white uppercase">
                THE SQUADRON BEHIND ciberNUtica
              </h3>
              <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                Founded to cultivate elite technical talent in red teaming, defensive engineering, and cryptographic systems. Led by student coordinators with real-world vulnerability research and CTF championship backgrounds.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-neutral-950 border border-neutral-800">
                  <div className="text-xs font-mono font-bold text-white">Rishi Bhargava</div>
                  <div className="text-[10px] font-mono text-[#FCEE09]">Threat Operations & Red Teaming Lead</div>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800">
                  <div className="text-xs font-mono font-bold text-white">Arjun R Kamath</div>
                  <div className="text-[10px] font-mono text-[#FCEE09]">Systems & Cryptography Lead</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-[#FCEE09]/20 bg-neutral-950/60 text-center space-y-4">
              <Award className="w-10 h-10 text-[#FCEE09]" />
              <div className="font-mono text-xs text-neutral-300">
                EXPLORE FULL BIOGRAPHIES, DOMAINS & CLUB PILLARS
              </div>
              <Link
                href="/about"
                className="cyber-btn-outline w-full py-2.5 text-xs text-center"
              >
                OPEN DOSSIER
              </Link>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}
