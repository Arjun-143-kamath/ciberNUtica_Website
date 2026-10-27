'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCTF } from '@/lib/store';
import { Shield, Terminal, User as UserIcon, LogOut, Menu, X, Lock } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, loginAs, logout, users } = useCTF();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'EVENTS & CTF', href: '/events' },
    { label: 'DISPATCHES', href: '/blog' },
    { label: 'DOSSIER', href: '/about' },
  ];

  return (
    <>
      {/* Top Cyber Yellow Header Banner (matches reference image) */}
      <header className="sticky top-0 z-50 bg-[#FCEE09] text-black border-b border-black select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 font-mono font-black text-lg md:text-xl tracking-tighter hover:opacity-85 transition"
            >
              <span className="w-3.5 h-3.5 bg-black inline-block"></span>
              <span>ciberNUtica</span>
              <span className="hidden sm:inline text-[11px] font-bold px-1.5 py-0.5 border border-black uppercase ml-1">
                SEC.OPS
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-mono font-bold tracking-wider">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 transition ${
                      isActive 
                        ? 'border-b-2 border-black font-black' 
                        : 'hover:opacity-70'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Admin Portal Link if Admin */}
              {currentUser?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-2 py-0.5 border border-black ${
                    pathname.startsWith('/admin') ? 'bg-black text-[#FCEE09]' : 'hover:bg-black/10'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  ADMIN PORTAL
                </Link>
              )}
            </nav>

            {/* Right Action: Identity / Switcher */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 bg-black text-[#FCEE09] px-3.5 py-1.5 text-xs font-mono font-bold hover:bg-neutral-800 transition tracking-wider border border-black cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#FCEE09]" />
                {currentUser ? (
                  <span>
                    [{currentUser.role}]: {currentUser.username}
                  </span>
                ) : (
                  <span>AUTHENTICATE</span>
                )}
              </button>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-black text-[#FCEE09] p-1.5 text-xs font-mono"
              >
                <Terminal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-black p-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FCEE09] border-t border-black px-4 pt-2 pb-4 space-y-2 font-mono text-sm font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 border-b border-black/20"
              >
                {link.label}
              </Link>
            ))}
            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-black font-black"
              >
                [!] ADMIN PORTAL
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Identity & RBAC Switcher Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-[#FCEE09] p-6 text-white font-mono shadow-[0_0_40px_rgba(252,238,9,0.2)]">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#FCEE09] mb-4">
              <Shield className="w-5 h-5" />
              <h3 className="text-base font-bold tracking-wider">CLEARANCE TERMINAL</h3>
            </div>

            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Switch authentication clearance level to evaluate the platform as a full system Admin or competitive CTF player:
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  loginAs('ADMIN');
                  setAuthModalOpen(false);
                }}
                className={`w-full text-left p-3 border transition ${
                  currentUser?.role === 'ADMIN'
                    ? 'border-[#FCEE09] bg-[#FCEE09]/10 text-[#FCEE09]'
                    : 'border-neutral-800 hover:border-[#FCEE09]/50 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>[ROLE: ADMIN] COMMAND OVERSEER</span>
                  <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 border border-red-800">
                    CLEARANCE L4
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Full CRUD: Add/edit events, publish blogs, configure CTF dynamic scoring & live scoreboard freeze.
                </div>
              </button>

              <div className="pt-2">
                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                  // COMPETITOR OPERATIVES:
                </div>
                <div className="space-y-2">
                  {users.filter(u => u.role !== 'ADMIN').map((comp) => {
                    const isSelected = currentUser?.id === comp.id;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => {
                          loginAs('USER', comp.username);
                          setAuthModalOpen(false);
                        }}
                        className={`w-full text-left p-2.5 border transition cursor-pointer ${
                          isSelected
                            ? 'border-[#FCEE09] bg-[#FCEE09]/15 text-[#FCEE09]'
                            : 'border-neutral-850 bg-neutral-900/60 hover:border-[#FCEE09]/40 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#FCEE09]' : 'bg-neutral-600'}`}></span>
                            {comp.username}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            [{comp.teamName || 'Solo'}]
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-[11px] text-neutral-500">
                Current: <span className="text-white">{currentUser?.username ?? 'GUEST'}</span>
              </div>
              {currentUser && (
                <button
                  onClick={() => {
                    logout();
                    setAuthModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  DISCONNECT
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
