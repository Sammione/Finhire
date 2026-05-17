'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: 'FinHireIQ Client',
    location: '',
    description: '',
    job_type: 'Full-time',
    salary_range: ''
  });

  const loadJobs = async () => {
    try {
      const data = await fetchWithAuth('/jobs/');
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/jobs/', {
        method: 'POST',
        body: JSON.stringify(newJob)
      });
      setShowModal(false);
      loadJobs();
    } catch (error) {
      alert("Failed to create job");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/jobs" />
      <MobileNav activePath="/jobs" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Job Vacancies</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your active roles and external application links.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto text-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              + Post New Vacancy
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                      <p className="text-slate-500 text-sm">{job.company} • {job.location}</p>
                    </div>
                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <span>💼</span> {job.job_type}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <span>💰</span> {job.salary_range || 'Not specified'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">External Apply URL</div>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/apply/${job.id}`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/apply/${job.id}`);
                          alert("URL copied to clipboard!");
                        }}
                        className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Copy this link and use it as the "External Apply URL" on Indeed or LinkedIn.
                    </p>
                  </div>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="col-span-full bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                   <div className="text-4xl mb-4 text-slate-300">💼</div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">No vacancies posted yet</h3>
                   <p className="text-slate-500 mb-6">Create your first job vacancy to start receiving AI-scored applications.</p>
                   <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                   >
                    Post Your First Job
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Post New Vacancy</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Job Title</label>
                <input 
                  required
                  placeholder="e.g. Senior Loan Collector"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input 
                    placeholder="e.g. Lagos, NG / Remote"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Job Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({...newJob, job_type: e.target.value})}
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Salary Range</label>
                <input 
                  placeholder="e.g. ₦300k - ₦500k / Month"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Job Description & Requirements</label>
                <textarea 
                  rows={4}
                  placeholder="Describe the role and key requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all mt-4"
              >
                Create Vacancy & Generate Apply Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
