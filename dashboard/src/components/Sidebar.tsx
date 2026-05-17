import React from 'react';
import Link from 'next/link';

export default function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="hidden lg:block lg:fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 z-50">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">F</div>
          <span className="font-bold text-xl tracking-tight text-slate-800">FinHireIQ</span>
        </Link>
      </div>
      
      <nav className="space-y-2">
        <NavItem href="/" icon="📊" label="Dashboard" active={activePath === '/'} />
        <NavItem href="/candidates" icon="🔍" label="Candidate Discovery" active={activePath === '/candidates'} />
        <NavItem href="/jobs" icon="💼" label="Job Vacancies" active={activePath === '/jobs'} />
        <NavItem href="/pipelines" icon="📁" label="Pipelines" active={activePath === '/pipelines'} />
        <NavItem href="/outreach" icon="✉️" label="Outreach" active={activePath === '/outreach'} />
        <NavItem href="/analytics" icon="📈" label="Analytics" active={activePath === '/analytics'} />
        <NavItem href="/settings" icon="⚙️" label="Settings" active={activePath === '/settings'} />
      </nav>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: string, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}
