'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, LoaderCircle, UserPlus } from 'lucide-react';
import { useCTF } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useCTF();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch(mode === 'register' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mode === 'register' ? { username, email, password } : { email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign-in failed.');
      await refreshSession(); router.replace(result.user.role === 'ADMIN' ? '/admin' : '/events');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return <div className="max-w-md mx-auto px-4 py-20 font-mono">
    <div className="border border-[#FCEE09]/40 bg-neutral-950 p-7 cyber-card">
      <div className="flex items-center gap-3 text-[#FCEE09] mb-6"><Shield className="w-5 h-5"/><h1 className="text-xl font-black">{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</h1></div>
      <p className="text-xs text-neutral-400 mb-6">Sign in to your ciberNUtica account, or create a competitor account. Administrator access uses the configured admin credentials.</p>
      <div className="grid grid-cols-2 mb-5 border border-neutral-800 text-xs font-bold"><button type="button" onClick={() => { setMode('login'); setError(''); }} className={`py-2 ${mode === 'login' ? 'bg-[#FCEE09] text-black' : 'text-neutral-400'}`}>SIGN IN</button><button type="button" onClick={() => { setMode('register'); setError(''); }} className={`py-2 ${mode === 'register' ? 'bg-[#FCEE09] text-black' : 'text-neutral-400'}`}>CREATE ACCOUNT</button></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && <label className="block text-xs text-neutral-400">USERNAME<input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full bg-black border border-neutral-800 p-3 text-white outline-none focus:border-[#FCEE09]"/></label>}
        <label className="block text-xs text-neutral-400">EMAIL ADDRESS<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full bg-black border border-neutral-800 p-3 text-white outline-none focus:border-[#FCEE09]"/></label>
        <label className="block text-xs text-neutral-400">PASSWORD<input required type="password" minLength={mode === 'register' ? 12 : undefined} maxLength={128} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full bg-black border border-neutral-800 p-3 text-white outline-none focus:border-[#FCEE09]"/>{mode === 'register' && <span className="block mt-1 text-[10px] text-neutral-500">Use at least 12 characters.</span>}</label>
        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
        <button disabled={busy} className="cyber-btn-yellow w-full py-3 text-xs inline-flex justify-center items-center gap-2 disabled:opacity-60">{busy && <LoaderCircle className="w-4 h-4 animate-spin"/>}{mode === 'login' ? 'SIGN IN' : <><UserPlus className="w-4 h-4"/> CREATE ACCOUNT</>}</button>
      </form>
      <Link href="/" className="block mt-5 text-xs text-neutral-500 hover:text-[#FCEE09]">← RETURN TO SITE</Link>
    </div>
  </div>;
}
