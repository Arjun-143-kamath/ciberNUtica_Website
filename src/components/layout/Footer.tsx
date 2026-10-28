import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'HOME' },
  { href: '/events', label: 'EVENTS & CTF' },
  { href: '/blog', label: 'BLOG' },
  { href: '/about', label: 'DOSSIER' },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#FCEE09]/20 bg-black font-mono text-xs text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#FCEE09]">
              <span className="h-2 w-2 bg-[#FCEE09]" />
              <span>ciberNUtica</span>
            </div>
            <p className="text-[11px] text-neutral-500">Cybersecurity club at NIIT University.</p>
          </div>

          <nav aria-label="Footer navigation" className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#FCEE09]">// DIRECTORY</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footerLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[11px] transition hover:text-[#FCEE09]">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#FCEE09]">// COORDINATORS</h2>
            <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
              <div className="border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-white">Rishi Bhargava</div>
              </div>
              <div className="border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-white">Arjun R Kamath</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-neutral-900 pt-4 text-[10px] text-neutral-600">
          © 2026 ciberNUtica
        </div>
      </div>
    </footer>
  );
}
