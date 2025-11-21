"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';

export default function TestPodcastPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-podcast');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ success: false, error: 'Test failed', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Systeem Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Deze pagina test of het podcast systeem correct is geïmplementeerd.</p>
            
            <Button onClick={runTest} disabled={loading}>
              {loading ? 'Testen...' : 'Test Uitvoeren'}
            </Button>
            
            {testResult && (
              <div className="mt-4 p-4 border rounded">
                <h3 className="font-semibold mb-2">Test Resultaat:</h3>
                <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}