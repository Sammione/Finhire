'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function PipelinesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [pipeline, setPipeline] = useState<any>({
    Sourced: [],
    Screening: [],
    Interview: [],
    Offer: []
  });
  const [loading, setLoading] = useState(true);

  const loadPipeline = async (jobId?: string) => {
    setLoading(true);
    try {
      let url = '/pipelines';
      if (jobId) {
        url += `?job_id=${encodeURIComponent(jobId)}`;
      }
      const data = await fetchWithAuth(url);
      setPipeline(data);
    } catch (error) {
      console.error("Failed to load pipeline candidates", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobsAndPipeline = async () => {
    try {
      const jobsData = await fetchWithAuth('/jobs/');
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
        await loadPipeline(jobsData[0].id);
      } else {
        await loadPipeline();
      }
    } catch (error) {
      console.error("Failed to load initial data", error);
      await loadPipeline();
    }
  };

  useEffect(() => {
    loadJobsAndPipeline();
  }, []);

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    loadPipeline(jobId);
  };

  const moveCandidate = async (candidateId: string, newStage: string) => {
    // Optimistic UI update
    const newPipeline = { ...pipeline };
    let movedCandidate = null;
    
    // Find and remove
    for (const stage of Object.keys(newPipeline)) {
      const index = newPipeline[stage].findIndex((c: any) => c.id === candidateId);
      if (index !== -1) {
        movedCandidate = newPipeline[stage].splice(index, 1)[0];
        break;
      }
    }
    
    // Add to new
    if (movedCandidate) {
      movedCandidate.status = newStage;
      newPipeline[newStage].push(movedCandidate);
      setPipeline(newPipeline);
      
      // Update backend
      try {
        let url = `/pipelines/${candidateId}/stage?stage=${encodeURIComponent(newStage)}`;
        if (selectedJobId) {
          url += `&job_id=${encodeURIComponent(selectedJobId)}`;
        }
        await fetchWithAuth(url, { method: 'PUT' });
      } catch (error) {
        console.error("Failed to update stage", error);
        loadPipeline(selectedJobId); // rollback
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/pipelines" />
      <MobileNav activePath="/pipelines" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Recruitment Pipelines</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your active candidate hiring stages.</p>
            </div>
            
            <div className="flex flex-col gap-1 w-full sm:w-72">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Vacancy</label>
              <select 
                value={selectedJobId}
                onChange={handleJobChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 shadow-sm"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.company})
                  </option>
                ))}
                {jobs.length === 0 && (
                  <option value="">No Active Jobs Found</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {Object.keys(pipeline).map((stage) => (
              <PipelineColumn 
                key={stage} 
                title={stage} 
                count={pipeline[stage].length}
                onDropCandidate={(id) => moveCandidate(id, stage)}
              >
                {loading ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
                ) : pipeline[stage].length > 0 ? (
                  pipeline[stage].map((c: any) => (
                    <PipelineCard key={c.id} id={c.id} name={c.full_name} score={c.match_score} time={c.time} />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 italic">No candidates in this stage</div>
                )}
              </PipelineColumn>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PipelineColumn({ title, count, children, onDropCandidate }: { title: string, count: number, children?: React.ReactNode, onDropCandidate: (id: string) => void }) {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const candidateId = e.dataTransfer.getData("candidateId");
    if (candidateId) {
      onDropCandidate(candidateId);
    }
  };

  return (
    <div className="flex-shrink-0 w-80" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 text-lg">•••</button>
      </div>
      <div className="space-y-4 min-h-[500px] p-2 rounded-2xl bg-slate-100/50 transition-colors">
        {children}
        <button className="w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all">
          Drop Candidate Here
        </button>
      </div>
    </div>
  );
}

function PipelineCard({ id, name, score, time }: { id: string, name: string, score: string, time: string }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("candidateId", id);
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:grabbing hover:shadow-md transition-all"
    >
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
