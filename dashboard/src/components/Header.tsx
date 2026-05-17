'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function Header() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState({ full_name: 'Loading...', role: '...' });
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchWithAuth('/auth/me');
        setUser(data);
      } catch (error) {
        // Fallback for MVP if endpoint fails or not logged in
        setUser({ full_name: 'Sarah Jenkins', role: 'Recruitment Director' });
      }
    };
    loadUser();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/candidates?q=${encodeURIComponent(query)}`);
    }
  };

  const getInitials = (name: string) => {
    if (name === 'Loading...') return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
      </div>
      <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-4 bg-slate-100 px-4 py-1.5 rounded-full w-full max-w-md">
        <span className="text-slate-400 text-sm">🔍</span>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search candidates, skills, or locations..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400 placeholder:italic"
        />
      </form>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{user.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center border-2 border-white shadow-md">
          <span className="text-white font-bold">{getInitials(user.full_name)}</span>
        </div>
      </div>
    </header>
  );
}
