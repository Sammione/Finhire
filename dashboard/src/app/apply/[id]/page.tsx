'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';

export default function PublicApplyPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    resume_text: '',
    notes: ''
  });

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await fetchWithAuth(`/jobs/${id}`);
        setJob(data);
      } catch (error) {
        console.error("Failed to load job", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth(`/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
    } catch (error) {
      alert("Failed to submit application. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Job Not Found</h1>
        <p className="text-slate-500 max-w-md">The job vacancy you are looking for may have been closed or the link is incorrect.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 max-w-md mb-8">Thank you for applying for the <strong>{job.title}</strong> position at {job.company}. Our AI-powered recruitment team will review your profile shortly.</p>
        <button 
          onClick={() => window.close()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header / Banner */}
      <div className="bg-blue-600 h-64 w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-blue-400 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-2xl border border-white/30">F</div>
            <span className="text-white font-bold text-xl tracking-tight opacity-90">FinHireIQ</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-blue-100 font-medium">
             <span className="flex items-center gap-1">🏢 {job.company}</span>
             <span className="flex items-center gap-1">📍 {job.location}</span>
             <span className="flex items-center gap-1">💼 {job.job_type}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Application</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Resume / Bio (Plain Text)</label>
                <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest font-bold">Paste your resume content or a brief professional bio</p>
                <textarea 
                  required
                  rows={8}
                  placeholder="Paste your experience, skills, and education here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 resize-none"
                  value={formData.resume_text}
                  onChange={(e) => setFormData({...formData, resume_text: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
              <p className="text-center text-[10px] text-slate-400">
                By clicking Submit, you agree to our terms and processing of your professional data by FinHireIQ's AI engine.
              </p>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Job Details</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-blue-500">💰</span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Salary Range</p>
                  <p className="text-sm text-slate-700 font-semibold">{job.salary_range || 'Competitive'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500">🏢</span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Company</p>
                  <p className="text-sm text-slate-700 font-semibold">{job.company}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500">📍</span>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-sm text-slate-700 font-semibold">{job.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200 border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4">About the Role</h3>
             <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
               {job.description}
             </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl shadow-blue-200 text-white">
            <h3 className="font-bold mb-2">Powered by AI</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              FinHireIQ uses advanced intelligence to match the best talent with top financial roles. Your application will be scored for relevance and stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
