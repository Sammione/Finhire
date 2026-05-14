import React from 'react';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
      </div>
      <div className="hidden sm:flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-full max-w-md">
        <span className="text-slate-400 text-sm italic">🔍 Search candidates, skills, or locations...</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">Alex Thompson</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Senior Recruiter</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center border-2 border-white shadow-md">
          <span className="text-white font-bold">AT</span>
        </div>
      </div>
    </header>
  );
}
