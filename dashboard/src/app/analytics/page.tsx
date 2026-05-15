'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function AnalyticsPage() {
  const [funnel, setFunnel] = useState<any>(null);
  const [sources, setSources] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [funnelData, sourceData] = await Promise.all([
          fetchWithAuth('/analytics/funnel'),
          fetchWithAuth('/analytics/sources')
        ]);
        setFunnel(funnelData);
        setSources(sourceData);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/analytics" />
      <MobileNav activePath="/analytics" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Recruitment Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Deep insights into your hiring funnel and source effectiveness.</p>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <MetricCard title="Time to Hire" value="18 Days" change="-4 days" positive />
            <MetricCard title="Interview to Offer" value="24%" change="+2%" positive />
            <MetricCard title="Candidate Quality Index" value="8.2/10" change="+0.5" positive />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Hiring Funnel</h3>
              <div className="space-y-6">
                <FunnelStep label="Sourced" value={funnel?.total_candidates || 0} percentage={100} color="bg-blue-600" />
                <FunnelStep label="Screened" value={Math.round((funnel?.total_candidates || 0) * 0.36)} percentage={36} color="bg-blue-500" />
                <FunnelStep label="Interviewed" value={Math.round((funnel?.total_candidates || 0) * 0.06)} percentage={6} color="bg-blue-400" />
                <FunnelStep label="Offered" value={Math.round((funnel?.total_candidates || 0) * 0.01)} percentage={1} color="bg-blue-300" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Source Effectiveness</h3>
              <div className="space-y-6">
                {sources ? Object.entries(sources).map(([label, value]: any) => (
                  <SourceBar key={label} label={label} value={Math.round(value * 100)} color="bg-blue-700" />
                )) : (
                  <div className="text-center text-slate-400">Loading sources...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, change, positive }: { title: string, value: string, change: string, positive: boolean }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <div className="flex items-end gap-3 mt-2">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className={`text-sm font-bold mb-1 ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{change}</p>
      </div>
    </div>
  );
}

function FunnelStep({ label, value, percentage, color }: { label: string, value: number, percentage: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-slate-800">{label}</span>
        <span className="text-slate-400">{value} ({percentage}%)</span>
      </div>
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function SourceBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-sm font-semibold text-slate-600">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
      <span className="w-10 text-xs font-bold text-slate-400">{value}%</span>
    </div>
  );
}
