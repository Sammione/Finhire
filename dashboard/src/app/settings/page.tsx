'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { fetchWithAuth } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "FinHire IQ Global",
    industry: "Financial Services",
    stability_weight: 80,
    fintech_weight: 95,
    skill_match_weight: 60,
    ethical_bias_mitigation: true,
    auto_refresh: true
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchWithAuth('/settings');
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchWithAuth('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Failed to save settings", error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/settings" />
      <MobileNav activePath="/settings" />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Header />
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Platform Settings</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Configure your recruitment intelligence parameters and organization profile.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 px-6 overflow-x-auto whitespace-nowrap">
              <TabItem label="General" active />
              <TabItem label="AI & Search" />
              <TabItem label="Integrations" />
              <TabItem label="Team & Roles" />
              <TabItem label="Billing" />
            </div>

            <div className="p-8 space-y-10">
              {/* Profile Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Organization Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Company Name</label>
                    <input 
                      type="text" 
                      value={settings.company_name} 
                      onChange={(e) => updateSetting('company_name', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Industry</label>
                    <select 
                      value={settings.industry}
                      onChange={(e) => updateSetting('industry', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    >
                      <option>Financial Services</option>
                      <option>Banking</option>
                      <option>Loan Processing</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* AI Parameters */}
              <section className="pt-10 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">AI Scoring Weights</h3>
                <div className="space-y-6">
                  <RangeInput 
                    label="Stability weighting" 
                    value={settings.stability_weight} 
                    onChange={(v) => updateSetting('stability_weight', v)}
                    description="Impact of job consistency on the final match score." 
                  />
                  <RangeInput 
                    label="Fintech Relevance" 
                    value={settings.fintech_weight} 
                    onChange={(v) => updateSetting('fintech_weight', v)}
                    description="Weight given to previous experience in banking or financial technology." 
                  />
                  <RangeInput 
                    label="Skill Match Precision" 
                    value={settings.skill_match_weight} 
                    onChange={(v) => updateSetting('skill_match_weight', v)}
                    description="How strictly should specific keywords match the candidate profile." 
                  />
                </div>
              </section>

              {/* Security */}
              <section className="pt-10 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Privacy & Compliance</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage data retention and ethical scoring policies.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <ToggleItem 
                    label="Ethical Bias Mitigation" 
                    description="Automatically anonymize demographic indicators during initial scoring." 
                    active={settings.ethical_bias_mitigation} 
                    onToggle={() => updateSetting('ethical_bias_mitigation', !settings.ethical_bias_mitigation)}
                  />
                  <ToggleItem 
                    label="Public Data Auto-Refresh" 
                    description="Update candidate intelligence every 30 days automatically." 
                    active={settings.auto_refresh} 
                    onToggle={() => updateSetting('auto_refresh', !settings.auto_refresh)}
                  />
                </div>
              </section>

              <div className="pt-6 flex justify-end gap-3">
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TabItem({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      {label}
    </button>
  );
}

function RangeInput({ label, value, description, onChange }: { label: string, value: number, description: string, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{value}%</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
      <input 
        type="range" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
      />
    </div>
  );
}

function ToggleItem({ label, description, active = false, onToggle }: { label: string, description: string, active?: boolean, onToggle: () => void }) {
  return (
    <div onClick={onToggle} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
