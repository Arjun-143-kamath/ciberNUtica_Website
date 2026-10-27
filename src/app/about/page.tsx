'use client';

import React, { useState } from 'react';
import { useCTF } from '@/lib/store';
import { 
  Shield, 
  Terminal, 
  Award, 
  Cpu, 
  Binary, 
  Radio, 
  ExternalLink, 
  Globe,
  Send, 
  CheckCircle2, 
  Lock,
  UserCheck
} from 'lucide-react';

export default function AboutPage() {
  const { coordinators } = useCTF();

  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicant, setApplicant] = useState({
    callsign: '',
    email: '',
    specialization: 'Red Teaming / Offensive Security',
    experience: ''
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.callsign || !applicant.email) return;
    setApplicationSubmitted(true);
  };

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

      {/* LEADERSHIP SHOWCASE: Rishi Bhargava & Arjun R Kamath */}
      <section className="space-y-8">
        <div className="border-b border-[#FCEE09]/20 pb-4 flex items-end justify-between">
          <div>
            <div className="text-[#FCEE09] font-mono text-xs font-bold tracking-widest uppercase mb-1">
              // OPERATIONAL COMMAND
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
              CURRENT COORDINATORS
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
            RANK: SQUADRON DIRECTORS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {coordinators.map((coord) => (
            <div
              key={coord.name}
              className="cyber-card p-6 sm:p-8 border border-[#FCEE09]/30 flex flex-col justify-between space-y-6 relative group"
            >
              {/* Corner crosshairs */}
              <div className="cyber-crosshair"></div>

              <div className="space-y-6">
                
                {/* Header Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FCEE09] text-black font-black uppercase">
                      COORDINATOR
                    </span>
                    <h3 className="text-2xl font-mono font-black text-white mt-2 uppercase tracking-wide">
                      {coord.name}
                    </h3>
                    <div className="text-xs font-mono text-[#FCEE09] font-bold mt-0.5">
                      CALLSIGN: [{coord.callsign}]
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-neutral-900 border border-[#FCEE09]/30 flex items-center justify-center text-[#FCEE09]">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                {/* Tagline */}
                <div className="p-2.5 bg-black/60 border border-neutral-850 text-xs font-mono text-neutral-300">
                  {coord.tagline}
                </div>

                {/* Security Clearance & Fingerprint */}
                <div className="p-2 bg-neutral-950 border border-neutral-850 font-mono text-[10px] text-neutral-400 flex items-center justify-between">
                  <span className="text-[#FCEE09] font-bold">
                    {coord.callsign === '0xRISHI' ? 'CLEARANCE: L4 // OFFENSIVE LEAD' : 'CLEARANCE: L4 // INFRA & CRYPTO'}
                  </span>
                  <span className="text-neutral-500 hidden sm:inline">
                    PGP: {coord.callsign === '0xRISHI' ? 'FEE9 01BA 4B22 9F01' : '7A88 34CD EF01 8821'}
                  </span>
                </div>

                {/* Bio */}
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                  {coord.bio}
                </p>

                {/* Domains / Specializations */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase">
                    TECHNICAL FOCUS DOMAINS:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {coord.domains.map((domain) => (
                      <span
                        key={domain}
                        className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Social / Direct Connect */}
              <div className="pt-4 border-t border-neutral-850 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span className="text-[11px] text-neutral-600">ENCRYPTED IDENTITY VERIFIED</span>
                <div className="flex items-center gap-3">
                  {coord.socials.github && (
                    <a
                      href={coord.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-[#FCEE09] transition flex items-center gap-1 text-[11px]"
                      title="GitHub"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>GH</span>
                    </a>
                  )}
                  {coord.socials.linkedin && (
                    <a
                      href={coord.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-[#FCEE09] transition flex items-center gap-1 text-[11px]"
                      title="LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>IN</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* CLUB DIVISIONS & ARCHITECTURE */}
      <section className="space-y-8">
        <div className="border-b border-[#FCEE09]/20 pb-4">
          <div className="text-[#FCEE09] font-mono text-xs font-bold tracking-widest uppercase mb-1">
            // SPECIALIZED DOMAINS
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
            CLUB OPERATIONAL PILLARS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="text-[#FCEE09] font-black text-xs font-mono">01 // ATTACK</div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">OFFENSIVE RED TEAMING</h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Adversary emulation, Active Directory exploitation, stealth persistence, and cloud infrastructure penetration testing.
            </p>
          </div>

          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="text-[#FCEE09] font-black text-xs font-mono">02 // DECOMPILE</div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">REVERSE & BINARY PWN</h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Dissecting stripped binaries, Ghidra decompilation, kernel ROP chains, heap grooming, and zero-day triage.
            </p>
          </div>

          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="text-[#FCEE09] font-black text-xs font-mono">03 // CIPHER</div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">APPLIED CRYPTOGRAPHY</h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Cryptanalysis of block ciphers, small public exponent RSA attacks, lattice mathematics, and post-quantum ML-KEM.
            </p>
          </div>

          <div className="cyber-card p-6 border border-[#FCEE09]/20 space-y-3">
            <div className="text-[#FCEE09] font-black text-xs font-mono">04 // TRIAGE</div>
            <h3 className="font-mono text-sm font-bold text-white uppercase">FORENSICS & THREAT HUNT</h3>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Memory forensics with Volatility, PCAP packet exfiltration reconstruction, disk carving, and timeline analysis.
            </p>
          </div>

        </div>
      </section>

      {/* RECRUITMENT TERMINAL / CONTACT */}
      <section className="cyber-card p-6 sm:p-10 border border-[#FCEE09]/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FCEE09] font-bold uppercase">
              <Terminal className="w-4 h-4 text-[#FCEE09]" />
              <span>COMMUNICATION TERMINAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white uppercase">
              JOIN THE SQUADRON
            </h2>
            <p className="font-mono text-xs text-neutral-400 leading-relaxed">
              Whether you are an aspiring ethical hacker, a seasoned binary reverse engineer, or an infrastructure defender, ciberNUtica welcomes all students passionate about cyber warfare.
            </p>
            <div className="p-4 bg-black/60 border border-neutral-850 font-mono text-xs space-y-2 text-neutral-400">
              <div className="flex items-center gap-2 text-white">
                <Lock className="w-3.5 h-3.5 text-[#FCEE09]" />
                <span>MEETING SCHEDULE: Every Saturday 17:00 UTC</span>
              </div>
              <div>LAB: Advanced Security & Cyber Defense Wing</div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-neutral-950 p-6 border border-neutral-800">
            {applicationSubmitted ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-600 text-center space-y-3 font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-white font-bold text-sm uppercase">TRANSMISSION RECEIVED</h4>
                <p className="text-xs text-emerald-300">
                  Your operative inquiry has been logged. Coordinator Rishi Bhargava or Arjun R Kamath will transmit encrypted briefing credentials to your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">CALLSIGN / HANDLE</label>
                  <input
                    type="text"
                    required
                    value={applicant.callsign}
                    onChange={(e) => setApplicant({ ...applicant, callsign: e.target.value })}
                    placeholder="e.g. 0xValkyrie"
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">CONTACT EMAIL</label>
                  <input
                    type="email"
                    required
                    value={applicant.email}
                    onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                    placeholder="user@university.edu"
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">PRIMARY DOMAIN OF INTEREST</label>
                  <select
                    value={applicant.specialization}
                    onChange={(e) => setApplicant({ ...applicant, specialization: e.target.value })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="Red Teaming / Offensive Security">Red Teaming / Offensive Security</option>
                    <option value="Reverse Engineering & Pwn">Reverse Engineering & Pwn</option>
                    <option value="Cryptography & Zero-Knowledge">Cryptography & Zero-Knowledge</option>
                    <option value="Digital Forensics & Incident Response">Digital Forensics & Incident Response</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="cyber-btn-yellow w-full py-3 text-xs font-bold uppercase mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT APPLICATION</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
