"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';

export default function PodcastDebugPage() {
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [podcastTestResult, setPodcastTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db-connection');
      const data = await response.json();
      setDbTestResult(data);
    } catch (error) {
      console.error('Database test error:', error);
      setDbTestResult({ success: false, error: 'Test failed', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testPodcastApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/podcasts');
      const data = await response.json();
      setPodcastTestResult(data);
    } catch (error) {
      console.error('Podcast API test error:', error);
      setPodcastTestResult({ success: false, error: 'Test failed', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Systeem Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Database Connectie Test</h3>
              <Button onClick={testDatabaseConnection} disabled={loading}>
                {loading ? 'Testen...' : 'Test Database Connectie'}
              </Button>
              {dbTestResult && (
                <div className="mt-4 p-4 border rounded">
                  <h4 className="font-semibold mb-2">Resultaat:</h4>
                  <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(dbTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Podcast API Test</h3>
              <Button onClick={testPodcastApi} disabled={loading}>
                {loading ? 'Testen...' : 'Test Podcast API'}
              </Button>
              {podcastTestResult && (
                <div className="mt-4 p-4 border rounded">
                  <h4 className="font-semibold mb-2">Resultaat:</h4>
                  <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(podcastTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="text-lg font-semibold mb-2">Oplossingshandleiding</h3>
              <p className="mb-2">Als u fouten ziet, controleer dan het volgende:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Zorg dat u een <code className="bg-gray-100 px-1 rounded">.env.local</code> bestand heeft met een correcte <code className="bg-gray-100 px-1 rounded">POSTGRES_URL</code></li>
                <li>Controleer of de database server actief is</li>
                <li>Voer <code className="bg-gray-100 px-1 rounded">npm run init-db</code> uit om de database tabellen aan te maken</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}