import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activePath="/settings" />
      <main className="pl-64">
        <Header />
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Platform Settings</h1>
            <p className="text-slate-500 mt-1">Configure your recruitment intelligence parameters and organization profile.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 px-6">
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Company Name</label>
                    <input type="text" defaultValue="FinHire IQ Global" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Industry</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none">
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
                  <RangeInput label="Stability weighting" value={80} description="Impact of job consistency on the final match score." />
                  <RangeInput label="Fintech Relevance" value={95} description="Weight given to previous experience in banking or financial technology." />
                  <RangeInput label="Skill Match Precision" value={60} description="How strictly should specific keywords match the candidate profile." />
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
                  <ToggleItem label="Ethical Bias Mitigation" description="Automatically anonymize demographic indicators during initial scoring." active />
                  <ToggleItem label="Public Data Auto-Refresh" description="Update candidate intelligence every 30 days automatically." active />
                </div>
              </section>

              <div className="pt-6 flex justify-end gap-3">
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Save Changes</button>
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

function RangeInput({ label, value, description }: { label: string, value: number, description: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{value}%</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
      <input type="range" defaultValue={value} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
}

function ToggleItem({ label, description, active = false }: { label: string, description: string, active?: boolean }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
