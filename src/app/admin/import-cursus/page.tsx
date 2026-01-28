'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button-system';
import { CheckCircle, AlertCircle, Loader2, Upload, RefreshCw } from 'lucide-react';

export default function ImportCursusPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'importing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkCursus = async () => {
    setStatus('checking');
    setError(null);

    try {
      const res = await fetch('/api/admin/import-cursus');
      const data = await res.json();

      setResult(data);
      setStatus('idle');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const importCursus = async () => {
    setStatus('importing');
    setError(null);

    try {
      const res = await fetch('/api/admin/import-cursus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import' })
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setResult(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Cursus Import Tool
        </h1>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Dating Fundament PRO Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Importeer de &quot;Dating Fundament PRO&quot; cursus van de JSON bestanden
              in <code className="bg-gray-100 px-2 py-1 rounded">cursussen/cursussen/dating-fundament-pro/</code>
              naar de database.
            </p>

            <div className="flex gap-4">
              <SecondaryButton onClick={checkCursus} disabled={status === 'checking' || status === 'importing'}>
                {status === 'checking' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Check Status
              </SecondaryButton>

              <PrimaryButton onClick={importCursus} disabled={status === 'checking' || status === 'importing'}>
                {status === 'importing' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Start Import
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Import Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {status === 'success' && result && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Import Succesvol!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Cursus &quot;{result.cursus?.titel}&quot; is geïmporteerd met {result.imported?.lessen} lessen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Details */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Import Details</CardTitle>
            </CardHeader>
            <CardContent>
              {result.cursus && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Cursus Info</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>ID:</strong> {result.cursus.id}</p>
                    <p><strong>Slug:</strong> {result.cursus.slug}</p>
                    <p><strong>Titel:</strong> {result.cursus.titel}</p>
                  </div>
                </div>
              )}

              {result.imported?.details && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Geïmporteerde Lessen</h4>
                  <div className="space-y-2">
                    {result.imported.details.map((les: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">{les.les}</span>
                          <span className="text-gray-500 ml-2">- {les.titel}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {les.sectieCount} secties
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON voor debugging */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Raw Response (debug)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex gap-4">
          <a
            href="/cursussen/dating-fundament-pro"
            className="text-coral-600 hover:text-coral-700 font-medium"
          >
            → Bekijk cursus pagina
          </a>
          <a
            href="/admin/courses"
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            → Alle cursussen beheren
          </a>
        </div>
      </div>
    </div>
  );
}
