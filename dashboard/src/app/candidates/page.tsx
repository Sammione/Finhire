import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function CandidatesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/candidates" />
      <main className="pl-64">
        <Header />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Candidate Discovery</h1>
            <p className="text-slate-500 mt-1">Smart AI semantic search across public professional data.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input type="text" placeholder="e.g. New York, Remote" className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience (Years)</label>
                    <div className="flex gap-2 mt-1">
                      <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                      <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase">Underwriting</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase">Risk Analysis</span>
                      <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-md border border-slate-100 uppercase">+ Add Skill</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Showing <span className="text-slate-800 font-bold">128</span> top matches</span>
                <div className="flex gap-2">
                  <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
                    <option>Sort by: Match Score</option>
                    <option>Sort by: Experience</option>
                  </select>
                </div>
              </div>

              {/* Candidate Cards */}
              <CandidateCard 
                name="Sarah Jenkins" 
                role="Senior Loan Officer" 
                location="Seattle, WA" 
                score={0.98}
                summary="Highly experienced loan officer with 8+ years in the fintech sector. Specialized in mortgage underwriting and high-risk assessment."
                skills={["Mortgage", "Underwriting", "Fintech", "CRM"]}
              />
              <CandidateCard 
                name="Robert Wilson" 
                role="Financial Analyst" 
                location="San Francisco, CA" 
                score={0.92}
                summary="Expert in financial modeling and credit risk. Former VP at Chase Bank with a focus on commercial lending."
                skills={["Credit Risk", "Lending", "SQL", "Bloomberg"]}
              />
              <CandidateCard 
                name="Linda Chen" 
                role="Mortgage Consultant" 
                location="Remote" 
                score={0.87}
                summary="Passionate consultant with a proven track record in increasing loan approval rates by 25%."
                skills={["Sales", "Consulting", "Mortgage", "Financing"]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CandidateCard({ name, role, location, score, summary, skills }: { name: string, role: string, location: string, score: number, summary: string, skills: string[] }) {
  const percentage = Math.round(score * 100);
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
            {percentage}% Match
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Confidence: High</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {summary}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {skills.map(skill => (
            <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md border border-slate-100 uppercase">
              {skill}
            </span>
          ))}
        </div>
        <button className="text-blue-600 text-xs font-bold hover:underline">View Intelligence Report →</button>
      </div>
    </div>
  );
}
