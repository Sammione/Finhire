import React from 'react';
import Link from 'next/link';

export default function MobileNav({ activePath }: { activePath: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
      <MobileNavItem href="/" icon="📊" label="Home" active={activePath === '/'} />
      <MobileNavItem href="/candidates" icon="🔍" label="Search" active={activePath === '/candidates'} />
      <MobileNavItem href="/pipelines" icon="📁" label="Talent" active={activePath === '/pipelines'} />
      <MobileNavItem href="/analytics" icon="📈" label="Stats" active={activePath === '/analytics'} />
      <MobileNavItem href="/settings" icon="⚙️" label="More" active={activePath === '/settings'} />
    </nav>
  );
}

function MobileNavItem({ href, icon, label, active = false }: { href: string, icon: string, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
