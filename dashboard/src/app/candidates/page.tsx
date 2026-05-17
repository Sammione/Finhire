'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function CandidatesPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/candidates/search?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/candidates" />
      <MobileNav activePath="/candidates" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Candidate Discovery</h1>
            <p className="text-slate-500 mt-1">Smart AI semantic search across public professional data.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1 space-y-6">
              <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Search & Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keywords</label>
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Skills, roles, company..." 
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input type="text" placeholder="e.g. New York, Remote" className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">
                    Run Analysis
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  {loading ? 'Searching...' : `Showing ${results.length} matches`}
                </span>
                <div className="flex gap-2">
                  <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
                    <option>Sort by: Match Score</option>
                    <option>Sort by: Experience</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400">Processing AI semantic search...</div>
              ) : results.length > 0 ? (
                results.map((c: any) => (
                  <CandidateCard 
                    key={c.id}
                    name={c.full_name} 
                    role={c.headline} 
                    location={c.location} 
                    score={c.match_score}
                    summary={c.summary}
                    skills={c.skills}
                  />
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  No candidates found matching your criteria. Try expanding your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CandidateCard({ name, role, location, score, summary, skills }: { name: string, role: string, location: string, score: string, summary: string, skills: string[] }) {
  const [isShortlisting, setIsShortlisting] = useState(false);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShortlisting(true);
    try {
      const rawProfileText = `${name} - ${role}. Location: ${location}. Summary: ${summary}. Skills: ${skills?.join(', ')}`;
      await fetchWithAuth(`/candidates/ingest?raw_text=${encodeURIComponent(rawProfileText)}`, {
        method: 'POST'
      });
      alert(`Successfully added ${name} to your Talent Pool / Shortlist!`);
    } catch (error) {
      console.error('Failed to shortlist', error);
      alert(`Failed to shortlist ${name}.`);
    } finally {
      setIsShortlisting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{name}</h3>
            <p className="text-sm font-semibold text-blue-600">{role}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>📍</span> {location}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-white text-xs font-bold shadow-lg shadow-blue-100">
            {score} Match
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Confidence: High</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {summary}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {skills?.map(skill => (
            <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md border border-slate-100 uppercase">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-blue-600 text-xs font-bold hover:underline">View Intelligence Report →</button>
          <button 
            onClick={handleShortlist}
            disabled={isShortlisting}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              isShortlisting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isShortlisting ? 'Saving...' : '+ Shortlist'}
          </button>
        </div>
      </div>
    </div>
  );
}

