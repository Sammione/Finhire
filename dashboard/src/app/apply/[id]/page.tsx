'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';

export default function PublicApplyPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    raw_text: '',
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
    
    // Combine fields into the resume_text required by the backend
    const combinedResume = `
SUMMARY:
${formData.summary}

SKILLS:
${formData.skills}

EXPERIENCE:
${formData.experience}

EDUCATION:
${formData.education}

RAW CONTENT:
${formData.raw_text}
    `;

    try {
      await fetchWithAuth(`/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          resume_text: combinedResume,
          notes: formData.notes
        })
      });
      setSubmitted(true);
    } catch (error) {
      alert("Failed to submit application. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);

    try {
      const data = new FormData();
      data.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/jobs/parse-resume`, {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) throw new Error("Parsing failed");
      
      const result = await response.json();
      const parsedData = result.data;
      
      let expText = '';
      if (parsedData.experience && Array.isArray(parsedData.experience)) {
        expText = parsedData.experience.map((ex: any) => 
          `${ex.title} at ${ex.company}\n${ex.description}`
        ).join('\n\n');
      }

      setFormData({
        ...formData,
        first_name: parsedData.first_name || '',
        last_name: parsedData.last_name || '',
        email: formData.email, // Assume email might not be parsed perfectly, keep existing if any
        phone: formData.phone,
        summary: parsedData.summary || '',
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : '',
        experience: expText,
        education: 'Please specify your education background here', // Our simple AI parse prompt might not grab education yet
        raw_text: result.raw_text || ''
      });
      
    } catch (error) {
      alert("Failed to parse the CV automatically. Please fill the details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-500 font-bold text-xl">F</div>
        </div>
        <p className="mt-6 text-slate-400 text-sm uppercase tracking-widest animate-pulse">Initializing Portal</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          🔍
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Position Unavailable</h1>
        <p className="text-slate-400 max-w-md leading-relaxed">This role has been closed or the link has expired. Please check our main careers page for active openings.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 bg-slate-900/50 backdrop-blur-xl p-12 rounded-[2rem] border border-slate-800 shadow-2xl max-w-lg w-full">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Application Received</h1>
          <p className="text-slate-400 mb-10 leading-relaxed text-sm">
            Thank you for applying for the <span className="text-white font-medium">{job.title}</span> position at {job.company}. Our intelligence engine is reviewing your profile.
          </p>
          <button 
            onClick={() => window.close()}
            className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans selection:bg-blue-500/30 relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">F</div>
            <span className="text-white font-bold text-xl tracking-tight">FinHireIQ</span>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md">
            Secure Portal
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Left Column: Job Details */}
          <div className="xl:col-span-4 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Actively Hiring
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                {job.title}
              </h1>
              <p className="text-xl text-slate-400 font-medium mb-8">at {job.company}</p>
              
              <div className="flex flex-col gap-3 mb-10">
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 backdrop-blur-sm">
                  <span className="text-slate-500 text-lg">📍</span> {job.location}
                </div>
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 backdrop-blur-sm">
                  <span className="text-slate-500 text-lg">💼</span> {job.job_type}
                </div>
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 backdrop-blur-sm">
                  <span className="text-slate-500 text-lg">💰</span> {job.salary_range || 'Competitive'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                About the Role
              </h3>
              <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line relative z-10 line-clamp-6">
                {job.description}
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="xl:col-span-8">
            <div className="bg-[#0f1524]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
              {/* Subtle top highlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

              <div className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Submit Profile</h2>
                  <p className="text-sm text-slate-400">Complete your profile below or let our AI extract your details.</p>
                </div>
              </div>

              {/* Smart Resume Upload Zone */}
              <div className="mb-10">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 transition-all duration-500 overflow-hidden ${isScanning ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/30'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  
                  {isScanning ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto relative">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <div>
                        <p className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-1">FinHire AI Engine</p>
                        <p className="text-slate-400 text-xs">Extracting experience and skills...</p>
                      </div>
                    </div>
                  ) : fileName ? (
                    <div className="flex items-center justify-between bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-left">
                          <p className="text-base font-bold text-white">{fileName}</p>
                          <p className="text-xs font-medium text-emerald-400">Content successfully extracted and parsed</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFileName(null);}} 
                        className="text-slate-400 hover:text-white text-sm font-medium bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        Replace CV
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shadow-xl">
                        <svg className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <p className="text-white font-bold text-lg mb-2">Upload Resume for AI Auto-Fill</p>
                      <p className="text-sm text-slate-400">PDF, DOCX, or TXT. Our intelligence engine will extract your details.</p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-2">Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                      <input 
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                      <input 
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email"
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-blue-400 font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-2">Professional Profile</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma separated)</label>
                    <input 
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Working Experience</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education Background</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit"
                    disabled={submitting || isScanning}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 ${submitting || isScanning ? 'opacity-70 cursor-not-allowed scale-100' : ''}`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Encrypting & Submitting...
                      </>
                    ) : (
                      <>
                        Submit Complete Profile
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-center text-xs text-slate-500 font-medium tracking-wide">
                  Secured by FinHireIQ • ISO 27001 Certified • End-to-End Encrypted
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
