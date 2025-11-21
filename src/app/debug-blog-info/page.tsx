'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BlogDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug-blogs');
        const data = await response.json();
        setDebugInfo(data);
      } catch (error) {
        console.error('Error fetching debug info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Blog Debug Information</h1>
      
      {debugInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}