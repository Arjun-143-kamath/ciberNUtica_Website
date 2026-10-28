'use client';

import { useCTF } from '@/lib/store';
import { 
  ExternalLink, 
  Globe,
  Shield,
  Building2
} from 'lucide-react';

export default function AboutPage() {
  const { coordinators } = useCTF();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Top Banner / Dossier Header */}
      <div className="border border-[#FCEE09]/30 bg-neutral-950 p-6 sm:p-8 relative">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FCEE09] uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#FCEE09] animate-pulse"></span>
            FILE: DOSSIER_CIBERNUTICA // CLEARANCE APPROVED
          </div>
          <h1 className="text-3xl sm:text-5xl font-mono font-black text-white uppercase tracking-tight">
            CLUB DOSSIER & LEADERSHIP
          </h1>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-3xl leading-relaxed">
            ciberNUtica is an elite collegiate cybersecurity syndicate dedicated to offensive security research, hardware reverse engineering, high-stakes CTF warfare, and mission-critical system hardening.
          </p>
        </div>
      </div>

      <section aria-label="About ciberNUtica and NIIT University" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="cyber-card p-6 sm:p-8 border border-[#FCEE09]/25 space-y-4">
          <div className="flex items-center gap-3 text-[#FCEE09]">
            <Shield className="w-5 h-5" />
            <span className="font-mono text-[10px] font-bold tracking-widest">01 // CYBERSECURITY CLUB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-black text-white uppercase">About ciberNUtica</h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-400 leading-relaxed">
            ciberNUtica is NIIT University’s cybersecurity club, bringing students together to learn and practice security. The club explores areas including offensive security, reverse engineering, cryptography, digital forensics, and systems security through hands-on work, research, and CTF competitions.
          </p>
        </article>

        <article className="cyber-card p-6 sm:p-8 border border-[#FCEE09]/25 space-y-4">
          <div className="flex items-center gap-3 text-[#FCEE09]">
            <Building2 className="w-5 h-5" />
            <span className="font-mono text-[10px] font-bold tracking-widest">02 // OUR UNIVERSITY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-black text-white uppercase">About NIIT University</h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Established in 2009, NIIT University is a not-for-profit university in Neemrana, Rajasthan. It brings together teaching, research, and interdisciplinary learning, with a focus on emerging areas of technology and management.
          </p>
        </article>
      </section>

      {/* LEADERSHIP SHOWCASE: Rishi Bhargava & Arjun R Kamath */}
      <section className="space-y-8">
        <div className="border-b border-[#FCEE09]/20 pb-4">
          <h2 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
            COORDINATORS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coordinators.map((coord) => (
            <div
              key={coord.name}
              className="cyber-card p-5 sm:p-6 border border-neutral-800 flex flex-col gap-4"
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-mono font-black text-white uppercase tracking-wide">{coord.name}</h3>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-neutral-800">
                {coord.socials.github && (
                  <a href={coord.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#FCEE09] transition flex items-center gap-1 text-[11px]" title="GitHub">
                    <Globe className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {coord.socials.linkedin && (
                  <a href={coord.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#FCEE09] transition flex items-center gap-1 text-[11px]" title="LinkedIn">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
