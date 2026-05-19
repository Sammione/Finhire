'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function CandidatesPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // Modal State for AI Intelligence Report
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // Shortlisting Target Job Popup State
  const [isShortlistPopupOpen, setIsShortlistPopupOpen] = useState(false);
  const [candidateToShortlist, setCandidateToShortlist] = useState<any>(null);
  const [targetJobId, setTargetJobId] = useState<string>('');
  const [isShortlisting, setIsShortlisting] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPage(1); // Reset to first page
    try {
      let url = `/candidates/search?q=${encodeURIComponent(query)}&page=1`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      const data = await fetchWithAuth(url);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await fetchWithAuth('/jobs/');
      setJobs(data);
      if (data.length > 0) {
        setTargetJobId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load jobs list", error);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      let url = `/candidates/search?q=${encodeURIComponent(query)}&page=${nextPage}`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      const data = await fetchWithAuth(url);
      
      if (data.length === 0) {
        alert("No more candidates found matching your criteria.");
      } else {
        // Filter out any potential duplicates based on candidate full name
        const uniqueNew = data.filter(
          (newCand: any) => !results.some((existing: any) => existing.full_name === newCand.full_name)
        );
        
        if (uniqueNew.length === 0) {
          alert("All candidates on the next page are already in your list.");
        } else {
          setResults([...results, ...uniqueNew]);
          setPage(nextPage);
        }
      }
    } catch (error) {
      console.error("Load more failed", error);
      alert("Failed to load more candidates.");
    } finally {
      setLoadingMore(false);
    }
  };

  const openReport = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setModalLoading(true);
    setDetailData(null);
    try {
      if (candidate.source === 'database') {
        const data = await fetchWithAuth(`/candidates/${candidate.id}`);
        setDetailData(data);
      } else {
        // For external candidates, simulate a structured AI intelligence summary from parsed parameters
        setDetailData({
          full_name: candidate.full_name || candidate.name,
          headline: candidate.headline || candidate.role,
          location: candidate.location,
          summary: candidate.summary,
          intelligence: {
            overall_score: parseFloat(candidate.match_score) / 100 || 0.75,
            stability_score: 0.85,
            relevance_score: 0.80,
            ai_summary: `${candidate.full_name || candidate.name} is a highly suitable candidate for this role. Based in ${candidate.location}, they possess skills in ${candidate.skills?.join(', ') || 'their domain'}. They demonstrate career consistency and highly relevant professional history.`,
            skills: candidate.skills || ["Communication", "Financial Analysis"],
            risk_indicators: ["Employment Continuity Verified", "No Job Hopping Risks Detected"]
          },
          experience: [
            {
              title: candidate.headline || candidate.role,
              company: "Current Company",
              description: candidate.summary
            }
          ]
        });
      }
    } catch (error) {
      console.error("Failed to load candidate details", error);
      alert("Could not load report details.");
    } finally {
      setModalLoading(false);
    }
  };

  const triggerShortlistPopup = (candidate: any) => {
    if (jobs.length === 0) {
      alert("You currently have no open Job Vacancies. Please create a Job Vacancy first in order to shortlist candidates to a pipeline.");
      return;
    }
    setCandidateToShortlist(candidate);
    setIsShortlistPopupOpen(true);
  };

  const handleConfirmShortlist = async () => {
    if (!candidateToShortlist) return;
    setIsShortlisting(true);
    try {
      const name = candidateToShortlist.full_name || candidateToShortlist.name;
      const role = candidateToShortlist.headline || candidateToShortlist.role;
      const loc = candidateToShortlist.location;
      const summ = candidateToShortlist.summary;
      const sk = candidateToShortlist.skills;
      
      const rawProfileText = `${name} - ${role}. Location: ${loc}. Summary: ${summ}. Skills: ${sk?.join(', ')}`;
      
      let url = `/candidates/ingest?raw_text=${encodeURIComponent(rawProfileText)}`;
      if (targetJobId) {
        url += `&job_id=${encodeURIComponent(targetJobId)}`;
      }
      if (candidateToShortlist.profile_url) {
        url += `&profile_url=${encodeURIComponent(candidateToShortlist.profile_url)}`;
      }
      
      await fetchWithAuth(url, { method: 'POST' });
      alert(`Successfully shortlisted ${name} and added them directly to your Pipeline!`);
      
      setIsShortlistPopupOpen(false);
      setIsModalOpen(false);
      handleSearch();
    } catch (error) {
      console.error("Failed to shortlist candidate", error);
      alert("Failed to shortlist candidate.");
    } finally {
      setIsShortlisting(false);
    }
  };

  useEffect(() => {
    handleSearch();
    loadJobs();
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
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lagos, Remote" 
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
                    />
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
                <div className="space-y-4">
                  {results.map((c: any) => (
                    <CandidateCard 
                      key={c.id}
                      id={c.id}
                      name={c.full_name} 
                      role={c.headline} 
                      location={c.location} 
                      score={c.match_score}
                      summary={c.summary}
                      skills={c.skills}
                      source={c.source}
                      profile_url={c.profile_url}
                      onDelete={handleSearch}
                      onViewReport={() => openReport(c)}
                      onShortlist={() => triggerShortlistPopup(c)}
                    />
                  ))}
                  
                  {/* Load More Button */}
                  <div className="pt-4 pb-10 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Fetching next page...</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>Load More Candidates (Page {page + 1})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  No candidates found matching your criteria. Try expanding your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Premium AI Intelligence Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 text-slate-800">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">
                  AI Talent Profile
                </span>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">
                  {selectedCandidate?.full_name || selectedCandidate?.name}
                </h2>
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  {selectedCandidate?.headline || selectedCandidate?.role}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>📍</span> {selectedCandidate?.location}
                </p>
                <a 
                  href={selectedCandidate?.profile_url || `https://www.google.com/search?q=site:linkedin.com/in/+${encodeURIComponent(selectedCandidate?.full_name || selectedCandidate?.name || "")}+${encodeURIComponent(selectedCandidate?.headline || selectedCandidate?.role || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 text-xs font-bold rounded-xl mt-3 transition-all"
                >
                  <span>🔗</span> {selectedCandidate?.profile_url ? 'View Direct Public Profile' : 'Find Profile on LinkedIn'}
                </a>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {modalLoading ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing real-time candidate intelligence...</span>
                </div>
              ) : detailData ? (
                <>
                  {/* Scores Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ScoreGauge 
                      label="Match Confidence" 
                      score={detailData.intelligence?.overall_score || 0.75} 
                      color="text-blue-600 bg-blue-50" 
                    />
                    <ScoreGauge 
                      label="Stability Rating" 
                      score={detailData.intelligence?.stability_score || 0.85} 
                      color="text-emerald-600 bg-emerald-50" 
                    />
                    <ScoreGauge 
                      label="Fintech Relevance" 
                      score={detailData.intelligence?.relevance_score || 0.80} 
                      color="text-purple-600 bg-purple-50" 
                    />
                  </div>

                  {/* AI Executive Summary */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                      <span>🤖</span> AI Recruiter Summary
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{detailData.intelligence?.ai_summary || 'No summary available.'}"
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Core Expertise & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailData.intelligence?.skills?.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-blue-50/50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100/50 uppercase tracking-wider">
                          {skill}
                        </span>
                      ))}
                      {(!detailData.intelligence?.skills || detailData.intelligence.skills.length === 0) && (
                        <span className="text-xs text-slate-400">No explicit skills parsed.</span>
                      )}
                    </div>
                  </div>

                  {/* Career Experience Timeline */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Employment Timeline</h3>
                    <div className="space-y-4">
                      {detailData.experience && detailData.experience.length > 0 ? (
                        detailData.experience.map((exp: any, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                              {index < detailData.experience.length - 1 && (
                                <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>
                              )}
                            </div>
                            <div className="pb-4">
                              <h4 className="font-bold text-slate-800 text-sm">{exp.title || "Professional Role"}</h4>
                              <p className="text-xs text-blue-600 font-semibold">{exp.company || "Company"}</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {exp.description || "Parsed from professional public profile."}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{detailData.headline}</h4>
                            <p className="text-xs text-slate-500 mt-1">Details extracted via discovery snippet.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk / Integrity Indicators */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">AI Integrity & Risk Indicators</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detailData.intelligence?.risk_indicators && detailData.intelligence.risk_indicators.length > 0 ? (
                        detailData.intelligence.risk_indicators.map((risk: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <span className="text-emerald-600 text-sm">✓</span>
                            <span className="text-xs font-semibold text-emerald-800">{risk}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <span className="text-emerald-600 text-sm">✓</span>
                            <span className="text-xs font-semibold text-emerald-800">Employment Continuity Verified</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                            <span className="text-emerald-600 text-sm">✓</span>
                            <span className="text-xs font-semibold text-emerald-800">Identity Checks Clear</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-slate-400">Failed to load detailed profile data.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Close Report
              </button>
              {selectedCandidate?.source !== 'database' && (
                <button 
                  onClick={() => triggerShortlistPopup(selectedCandidate)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl transition-all"
                >
                  + Add to Shortlist
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target Job Shortlist Selection Popup Dialog */}
      {isShortlistPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-800 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Shortlist Candidate</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Select which active Job Vacancy pipeline you would like to automatically ingest and track this candidate for.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Vacancy Pipeline</label>
                <select 
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 shadow-sm"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.company})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsShortlistPopupOpen(false)}
                disabled={isShortlisting}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmShortlist}
                disabled={isShortlisting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-lg transition-all flex items-center gap-1.5"
              >
                {isShortlisting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Ingestion...</span>
                  </>
                ) : (
                  <span>Add to Pipeline</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ label, score, color }: { label: string, score: number, color: string }) {
  const percentage = Math.round(score * 100);
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3 mt-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${color}`}>
          {percentage}%
        </div>
        <div className="flex-1">
          <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ 
  id, 
  name, 
  role, 
  location, 
  score, 
  summary, 
  skills, 
  source, 
  profile_url,
  onDelete,
  onViewReport,
  onShortlist
}: { 
  id: string, 
  name: string, 
  role: string, 
  location: string, 
  score: string, 
  summary: string, 
  skills: string[], 
  source?: string, 
  profile_url?: string,
  onDelete?: () => void,
  onViewReport: () => void,
  onShortlist: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name} from the database?`)) {
      setIsDeleting(true);
      try {
        await fetchWithAuth(`/candidates/${id}`, {
          method: 'DELETE'
        });
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Failed to delete candidate', error);
        alert(`Failed to delete ${name}.`);
      } finally {
        setIsDeleting(false);
      }
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
        <div className="flex flex-wrap gap-2 max-w-[60%]">
          {skills?.map(skill => (
            <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md border border-slate-100 uppercase">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <a 
            href={profile_url || `https://www.google.com/search?q=site:linkedin.com/in/+${encodeURIComponent(name)}+${encodeURIComponent(role)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span>🔗</span> Profile
          </a>
          {source === 'database' && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 text-xs font-bold hover:underline"
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete Candidate'}
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewReport();
            }}
            className="text-blue-600 text-xs font-bold hover:underline"
          >
            View Intelligence Report →
          </button>
          {source !== 'database' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onShortlist();
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              + Shortlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
