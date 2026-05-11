import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/" />
      <main className="pl-64">
        <Header />
        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Recruitment Overview</h1>
              <p className="text-slate-500 mt-1">Intelligence-driven insights for your loan officer search.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              + New Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Candidates" value="2,845" change="+12%" icon="👥" />
            <StatCard label="Avg. Stability Score" value="0.84" change="+5%" icon="🛡️" />
            <StatCard label="Fintech Relevance" value="92%" change="+3%" icon="⚡" />
            <StatCard label="Active Interviews" value="18" change="-2" icon="📅" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800">Recent Discoveries</h2>
                <button className="text-blue-600 text-sm font-semibold">View All</button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Candidate</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Match Score</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <CandidateRow name="Sarah Jenkins" role="Sr. Loan Officer" score="98%" status="Shortlisted" />
                  <CandidateRow name="Michael Chen" role="Risk Analyst" score="94%" status="Screening" />
                  <CandidateRow name="Elena Rodriguez" role="Mortgage Advisor" score="89%" status="Applied" />
                  <CandidateRow name="David Park" role="Fintech Developer" score="96%" status="Shortlisted" />
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Recruiter Insight
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  "Market analysis shows a 15% increase in high-stability loan professionals in the Seattle area. Sarah Jenkins represents a top 1% match for your 'Mortgage Lead' opening."
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-blue-300">
                    <span>Talent Density Index</span>
                    <span>8.4/10</span>
                  </div>
                  <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div className="w-[84%] h-full bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Integrity Indicators</h3>
                <div className="space-y-4">
                  <Indicator label="Employment Consistency" value="High" color="bg-emerald-500" />
                  <Indicator label="Certification Validated" value="Yes" color="bg-emerald-500" />
                  <Indicator label="Identity Verified" value="Yes" color="bg-emerald-500" />
                  <Indicator label="Job Hopping Risk" value="Low" color="bg-emerald-500" />
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
