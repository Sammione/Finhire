'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadCampaigns = async () => {
    try {
      const data = await fetchWithAuth('/outreach');
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleNewCampaign = async () => {
    const name = prompt("Enter new campaign name:");
    if (!name) return;
    
    setIsCreating(true);
    try {
      await fetchWithAuth('/outreach', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      loadCampaigns();
    } catch (error) {
      console.error("Failed to create campaign", error);
      alert("Error creating campaign");
    } finally {
      setIsCreating(false);
    }
  };

  const totalEmails = campaigns.reduce((sum, c) => sum + c.emails_sent, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/outreach" />
      <MobileNav activePath="/outreach" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Automated Outreach</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">AI-generated personalized sequences for candidates.</p>
            </div>
            <button 
              onClick={handleNewCampaign} 
              disabled={isCreating}
              className="w-full sm:w-auto text-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              {isCreating ? 'Creating...' : '+ New Campaign'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Active Campaigns</h3>
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-10 text-center text-slate-400">Loading campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl">
                      No active campaigns. Start a new one to begin outreach.
                    </div>
                  ) : (
                    campaigns.map(c => (
                      <CampaignRow 
                        key={c.id} 
                        name={c.name} 
                        candidates={c.emails_sent} 
                        responseRate={`${(c.reply_rate * 100).toFixed(1)}%`} 
                        status={c.status} 
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">AI Template Preview</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
                  "Hi [Candidate Name], I noticed your impressive background in [Skill] at [Company]. Given your [Score]% match for our Senior Loan Officer role, I'd love to discuss how your expertise in [Industry] aligns with our Q4 goals..."
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-4">Outreach Metrics</h3>
              <div className="space-y-6">
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <p className="text-3xl font-bold text-blue-600">{totalEmails}</p>
                  <p className="text-xs font-bold text-blue-400 uppercase mt-1">Emails Sent</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                    <p className="text-xl font-bold text-emerald-600">12%</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Open Rate</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-2xl">
                    <p className="text-xl font-bold text-amber-600">4%</p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase mt-1">Reply Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CampaignRow({ name, candidates, responseRate, status }: { name: string, candidates: number, responseRate: string, status: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div>
        <p className="font-bold text-slate-800">{name}</p>
        <p className="text-xs text-slate-400 font-medium">{candidates} candidates • {responseRate} response</p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
        {status}
      </span>
    </div>
  );
}
