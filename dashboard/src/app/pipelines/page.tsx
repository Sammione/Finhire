'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function PipelinesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const data = await fetchWithAuth('/candidates/search?q=');
        setCandidates(data);
      } catch (error) {
        console.error("Failed to load pipeline candidates", error);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/pipelines" />
      <MobileNav activePath="/pipelines" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Recruitment Pipelines</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your active candidate hiring stages.</p>
            </div>
            <a href="/pipelines/create" className="w-full sm:w-auto text-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              + Create Pipeline
            </a>
          </div>


          <div className="flex gap-6 overflow-x-auto pb-4">
            <PipelineColumn title="Sourced" count={candidates.length}>
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
              ) : candidates.map((c: any) => (
                <PipelineCard key={c.id} name={c.full_name} score={c.match_score} time="Just now" />
              ))}
            </PipelineColumn>

            <PipelineColumn title="Screening" count={5}>
              <PipelineCard name="John Doe" score="94%" time="1d ago" />
              <PipelineCard name="Jane Roe" score="89%" time="2d ago" />
            </PipelineColumn>

            <PipelineColumn title="Interview" count={3} active>
              <PipelineCard name="Sarah Jenkins" score="98%" time="3h ago" active />
              <PipelineCard name="Michael Chen" score="96%" time="1d ago" />
            </PipelineColumn>

            <PipelineColumn title="Offer" count={1}>
              <PipelineCard name="David Park" score="97%" time="4d ago" />
            </PipelineColumn>
          </div>
        </div>
      </main>
    </div>
  );
}

function PipelineColumn({ title, count, children, active = false }: { title: string, count: number, children?: React.ReactNode, active?: boolean }) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 text-lg">•••</button>
      </div>
      <div className={`space-y-4 min-h-[500px] p-2 rounded-2xl transition-colors ${active ? 'bg-blue-50/50 border-2 border-dashed border-blue-200' : 'bg-slate-100/50'}`}>
        {children}
        <button className="w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all">
          + Drop Candidate
        </button>
      </div>
    </div>
  );
}

function PipelineCard({ name, score, time, active = false }: { name: string, score: string, time: string, active?: boolean }) {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:grabbing hover:shadow-md transition-all ${active ? 'ring-2 ring-blue-500 border-transparent' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{name.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{time}</p>
          </div>
        </div>
        <span className="text-blue-600 text-xs font-bold">{score}</span>
      </div>
      <div className="flex gap-1">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: score }}></div>
        </div>
      </div>
    </div>
  );
}
