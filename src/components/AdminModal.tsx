import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import {
  X,
  Shield,
  Key,
  Database,
  BarChart3,
  Layers,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('gramrozgar2026');
  const [authError, setAuthError] = useState('');

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'locations' | 'schemes' | 'templates'>('analytics');
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchAdminData();
      } else {
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setAuthError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      setAdminData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">GramRozgar Administration Console</h3>
              <span className="text-[11px] text-stone-400">
                Panchayat Datasets, Business Templates & Analytics Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            // Login Form
            <div className="max-w-sm mx-auto py-8 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800 mb-3">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900">Admin Authentication</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Access restricted to panchayat dataset administrators
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-emerald-700"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-stone-100 text-[11px] text-stone-600 font-mono">
                  Demo Credentials: admin / gramrozgar2026
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Login to Admin Console'}
                </button>
              </form>
            </div>
          ) : (
            // Authenticated Dashboard
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Live Analytics</span>
                </button>

                <button
                  onClick={() => setActiveTab('locations')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'locations'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Panchayat Datasets</span>
                </button>

                <button
                  onClick={() => setActiveTab('schemes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'schemes'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Government Schemes</span>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'templates'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Business Templates</span>
                </button>
              </div>

              {/* Tab 1: Live Analytics */}
              {activeTab === 'analytics' && adminData && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block">
                        Total Analyses
                      </span>
                      <span className="text-2xl font-extrabold text-stone-900 font-mono mt-1 block">
                        {adminData.analytics.totalAnalyses}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block">
                        Kannada Queries
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-800 font-mono mt-1 block">
                        {adminData.analytics.kannadaQueries}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block">
                        English Queries
                      </span>
                      <span className="text-2xl font-extrabold text-stone-900 font-mono mt-1 block">
                        {adminData.analytics.englishQueries}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block">
                        Gemini Status
                      </span>
                      <span className="text-xs font-bold text-emerald-800 mt-2 block">
                        {adminData.geminiStatus}
                      </span>
                    </div>
                  </div>

                  {/* Popular Categories */}
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                      Most Inquired Rural Business Categories
                    </h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(adminData.analytics.popularCategories || {}).map(
                        ([cat, count]: [string, any]) => (
                          <div key={cat} className="flex items-center justify-between">
                            <span className="capitalize">{cat.replace('_', ' ')}</span>
                            <span className="font-mono font-bold text-emerald-800">
                              {count} queries
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Locations List */}
              {activeTab === 'locations' && adminData && (
                <div className="space-y-3">
                  <span className="text-xs text-stone-500 block">
                    Curated Prototype Gram Panchayat Catchment Models:
                  </span>
                  <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden text-xs">
                    {adminData.locations.map((loc: any) => (
                      <div key={loc.id} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900">{loc.panchayat}</span>
                          <span className="text-stone-500 ml-2">
                            ({loc.taluk}, {loc.district})
                          </span>
                        </div>
                        <div className="font-mono text-stone-600">
                          {loc.households.toLocaleString()} HH · Pop: {loc.population.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Schemes List */}
              {activeTab === 'schemes' && adminData && (
                <div className="space-y-3">
                  <span className="text-xs text-stone-500 block">
                    Active Verified Government Scheme Database:
                  </span>
                  <div className="space-y-2 text-xs">
                    {adminData.schemes.map((s: any) => (
                      <div key={s.id} className="p-3 rounded-xl border border-stone-200 bg-white">
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span>{s.schemeName}</span>
                          <span className="text-emerald-800 font-mono">
                            {s.subsidyPercentage}% Subsidy
                          </span>
                        </div>
                        <p className="text-stone-500 mt-1 text-[11px]">{s.purposeEn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Business Templates */}
              {activeTab === 'templates' && adminData && (
                <div className="space-y-3">
                  <span className="text-xs text-stone-500 block">
                    Deterministic Business Financial Base Templates:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {adminData.businessTemplates.map((t: any) => (
                      <div key={t.id} className="p-3 rounded-xl border border-stone-200 bg-white">
                        <span className="font-bold text-stone-900 block">{t.titleEn}</span>
                        <div className="mt-1 flex items-center justify-between text-stone-500 font-mono">
                          <span>Default Cost: ₹{t.defaultProjectCost.toLocaleString()}</span>
                          <span>Rev: ₹{t.defaultMonthlyRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
