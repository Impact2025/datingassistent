'use client';

/**
 * Admin Affiliate Portal
 *
 * Manage partner referral links, view conversion stats, create new partners.
 */

import { useState, useEffect } from 'react';
import { Users, Link, TrendingUp, Euro, Plus, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PartnerStats {
  id: number;
  name: string;
  referral_code: string;
  commission_pct: number;
  status: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue_generated: number;
  total_commission_earned: number;
  commission_paid: number;
  commission_pending: number;
  conversion_rate_pct: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

export default function AffiliatePage() {
  const [partners, setPartners] = useState<PartnerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  // New partner form state
  const [form, setForm] = useState({ name: '', email: '', company: '', commissionPct: 30 });
  const [creating, setCreating] = useState(false);
  const [newPartner, setNewPartner] = useState<{ referralCode: string; trackingUrl: string } | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/admin/affiliate');
      const data = await res.json();
      if (data.partners) setPartners(data.partners);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrationStatus('Bezig...');
    try {
      const res = await fetch('/api/admin/run-migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migration: 'all' }),
      });
      const data = await res.json();
      setMigrationStatus(data.success ? '✅ Migraties uitgevoerd' : '❌ Fout: ' + JSON.stringify(data.results));
      if (data.success) fetchPartners();
    } catch {
      setMigrationStatus('❌ Verbindingsfout');
    }
  };

  const createPartner = async () => {
    if (!form.name || !form.email) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setNewPartner({ referralCode: data.referralCode, trackingUrl: data.trackingUrl });
        fetchPartners();
        setForm({ name: '', email: '', company: '', commissionPct: 30 });
      }
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fmt = (cents: number) => `€${(cents / 1).toFixed(2)}`;

  const totals = partners.reduce(
    (acc, p) => ({
      clicks: acc.clicks + p.total_clicks,
      conversions: acc.conversions + p.total_conversions,
      revenue: acc.revenue + p.total_revenue_generated,
      pending: acc.pending + p.commission_pending,
    }),
    { clicks: 0, conversions: 0, revenue: 0, pending: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Partners</h1>
          <p className="text-gray-500 text-sm mt-1">Beheer referral partners en bekijk conversies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runMigration}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Database setup
          </button>
          <button
            onClick={() => { setShowCreateForm(true); setNewPartner(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nieuwe partner
          </button>
        </div>
      </div>

      {migrationStatus && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono">
          {migrationStatus}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Actieve partners', value: partners.filter(p => p.status === 'active').length, icon: Users },
          { label: 'Totaal clicks',    value: totals.clicks,      icon: Link },
          { label: 'Conversies',       value: totals.conversions, icon: TrendingUp },
          { label: 'Commissie open',   value: fmt(totals.pending), icon: Euro },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coral-50 rounded-lg">
                  <Icon className="w-4 h-4 text-coral-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nieuwe partner aanmaken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newPartner ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-700">✅ Partner aangemaakt!</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-gray-500">Referral code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold">{newPartner.referralCode}</code>
                    <button onClick={() => copyToClipboard(newPartner.referralCode, 'code')} className="text-gray-400 hover:text-gray-600">
                      {copiedCode === 'code' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Tracking URL</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-700 break-all">{newPartner.trackingUrl}</code>
                    <button onClick={() => copyToClipboard(newPartner.trackingUrl, 'url')} className="text-gray-400 hover:text-gray-600 shrink-0">
                      {copiedCode === 'url' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="text-sm text-gray-500 hover:text-gray-700">
                  Sluiten
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coral-500"
                    placeholder="Mirjam van den Berg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coral-500"
                    placeholder="mirjam@voorbeeld.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coral-500"
                    placeholder="Optioneel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commissie %</label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={form.commissionPct}
                    onChange={e => setForm(f => ({ ...f, commissionPct: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button
                    onClick={createPartner}
                    disabled={creating || !form.name || !form.email}
                    className="px-4 py-2 bg-coral-500 text-white rounded-lg text-sm font-medium hover:bg-coral-600 disabled:opacity-50"
                  >
                    {creating ? 'Aanmaken...' : 'Partner aanmaken'}
                  </button>
                  <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Partners table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partners ({partners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Laden...</div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Nog geen partners.</p>
              <p className="text-sm">Voer eerst "Database setup" uit als je net begint.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Partner', 'Code', 'Clicks', 'Conv.', 'Conv.%', 'Omzet', 'Commissie open', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {partners.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{p.name}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{p.referral_code}</code>
                          <button
                            onClick={() => copyToClipboard(
                              `${BASE_URL}/api/affiliate/track?ref=${p.referral_code}&to=/quiz/dating-patroon`,
                              p.referral_code
                            )}
                            className="text-gray-400 hover:text-gray-600"
                            title="Kopieer tracking URL"
                          >
                            {copiedCode === p.referral_code
                              ? <CheckCircle className="w-3 h-3 text-green-500" />
                              : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{p.total_clicks}</td>
                      <td className="py-3 pr-4 text-gray-700">{p.total_conversions}</td>
                      <td className="py-3 pr-4 text-gray-700">{p.conversion_rate_pct}%</td>
                      <td className="py-3 pr-4 text-gray-700">{fmt(p.total_revenue_generated)}</td>
                      <td className="py-3 pr-4 font-medium text-orange-600">{fmt(p.commission_pending)}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
