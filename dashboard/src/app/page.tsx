'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [funnelData, candidatesData] = await Promise.all([
          fetchWithAuth('/analytics/funnel'),
          fetchWithAuth('/candidates/search?q=') // empty query to get recent
        ]);
        setStats(funnelData);
        setCandidates(candidatesData.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/" />
      <MobileNav activePath="/" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Recruitment Overview</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">Intelligence-driven insights for your loan officer search.</p>
            </div>
            <Link href="/candidates" className="w-full sm:w-auto text-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              + New Search
            </Link>
          </div>


            <StatCard 
              label="Total Candidates" 
              value={loading ? "..." : stats?.total_candidates || "0"} 
              change="0%" 
              icon="👥" 
            />
            <StatCard 
              label="Avg. Stability Score" 
              value={loading ? "..." : stats?.avg_stability_score?.toFixed(2) || "0.00"} 
              change="0%" 
              icon="🛡️" 
            />
            <StatCard 
              label="Fintech Relevance" 
              value={loading ? "..." : `${Math.round((stats?.avg_fintech_relevance || 0) * 100)}%`} 
              change="0%" 
              icon="⚡" 
            />
            <StatCard 
              label="Active Interviews" 
              value="0" 
              change="0" 
              icon="📅" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800">Recent Discoveries</h2>
                <Link href="/candidates" className="text-blue-600 text-sm font-semibold">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Candidate</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Match Score</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading recent candidates...</td></tr>
                    ) : candidates.length > 0 ? (
                      candidates.map((c: any) => (
                        <CandidateRow 
                          key={c.id}
                          name={c.full_name} 
                          role={c.headline} 
                          score={c.match_score || "0%"} 
                          status="Processed" 
                        />
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No candidates found yet. Start a search to see them here!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Recruiter Insight
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  {candidates.length > 0 ? `Detected ${candidates.length} new potential matches in your latest search. Evaluate them to begin outreach.` : "Start a search to generate AI-driven recruitment insights."}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-blue-300">
                    <span>Talent Density Index</span>
                    <span>{candidates.length > 0 ? "Analyzing..." : "0/10"}</span>
                  </div>
                  <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: candidates.length > 0 ? "50%" : "0%" }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Integrity Indicators</h3>
                <div className="space-y-4">
                  <Indicator label="Employment Consistency" value="N/A" color="bg-slate-300" />
                  <Indicator label="Certification Validated" value="N/A" color="bg-slate-300" />
                  <Indicator label="Identity Verified" value="N/A" color="bg-slate-300" />
                  <Indicator label="Job Hopping Risk" value="N/A" color="bg-slate-300" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, change, icon }: { label: string, value: string, change: string, icon: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {change}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function CandidateRow({ name, role, score, status }: { name: string, role: string, score: string, status: string }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{name.split(' ').map(n => n[0]).join('')}</div>
          <span className="font-semibold text-slate-800">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{role}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: score }}></div>
          </div>
          <span className="text-sm font-bold text-blue-600">{score}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
          status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' : 
          status === 'Screening' ? 'bg-amber-100 text-amber-700' : 
          'bg-slate-100 text-slate-600'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function Indicator({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-xs font-bold text-slate-800">{value}</span>
      </div>
    </div>
  );
}
