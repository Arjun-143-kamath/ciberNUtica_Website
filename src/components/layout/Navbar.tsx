'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCTF } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useCTF();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = [
    { label: 'HOME', href: '/' }, { label: 'EVENTS & CTF', href: '/events' },
    { label: 'DISPATCHES', href: '/blog' }, { label: 'DOSSIER', href: '/about' },
  ];
  const endSession = async () => {
    await logout(); router.push('/');
  };

  return <header className="sticky top-0 z-50 bg-[#FCEE09] text-black border-b border-black select-none">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-mono font-black text-lg md:text-xl tracking-tighter"><span className="w-3.5 h-3.5 bg-black inline-block"/><span>ciberNUtica</span><span className="hidden sm:inline text-[11px] font-bold px-1.5 py-0.5 border border-black uppercase ml-1">SEC.OPS</span></Link>
        <nav className="hidden md:flex items-center space-x-6 text-xs font-mono font-bold tracking-wider">{links.map(link => <Link key={link.href} href={link.href} className={`py-1 ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'border-b-2 border-black font-black' : 'hover:opacity-70'}`}>{link.label}</Link>)}</nav>
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? <button onClick={endSession} className="flex items-center gap-2 bg-black text-[#FCEE09] px-3.5 py-1.5 text-xs font-mono font-bold border border-black"><LogOut className="w-3.5 h-3.5"/> SIGN OUT</button> : <Link href="/login" className="flex items-center gap-2 bg-black text-[#FCEE09] px-3.5 py-1.5 text-xs font-mono font-bold border border-black"><LogIn className="w-3.5 h-3.5"/> SIGN IN / REGISTER</Link>}
        </div>
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? <button onClick={endSession} aria-label="Sign out" className="bg-black text-[#FCEE09] p-1.5"><LogOut className="w-4 h-4"/></button> : <Link href="/login" aria-label="Sign in or create account" className="bg-black text-[#FCEE09] p-1.5"><LogIn className="w-4 h-4"/></Link>}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-black p-1" aria-label="Toggle menu">{mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}</button>
        </div>
      </div>
    </div>
    {mobileMenuOpen && <div className="md:hidden bg-[#FCEE09] border-t border-black px-4 pt-2 pb-4 space-y-2 font-mono text-sm font-bold">
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-1.5 border-b border-black/20">{link.label}</Link>)}
    </div>}
  </header>;
}
