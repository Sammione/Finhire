import React from 'react';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
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
