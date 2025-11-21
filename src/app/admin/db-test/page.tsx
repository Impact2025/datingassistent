'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DatabaseTestPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/db/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Failed to connect to API',
        details: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSchema = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/db/init', { method: 'POST' });
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Failed to initialize schema',
        details: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Test de verbinding met je PostgreSQL database en initialiseer het schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            <Button
              onClick={initializeSchema}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Initialize Database Schema'
              )}
            </Button>
          </div>

          {testResult && (
            <Alert
              variant={testResult.success ? 'default' : 'destructive'}
              className="mt-4"
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="font-semibold mb-2">{testResult.message}</div>
                {testResult.details && (
                  <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Database Info:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Host:</strong> ep-frosty-sea-ag5u6igd-pooler.c-2.eu-central-1.aws.neon.tech</p>
              <p><strong>Database:</strong> neondb</p>
              <p><strong>User:</strong> neondb_owner</p>
              <p><strong>SSL:</strong> Required</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
              <li>Click "Test Connection" to verify the database is reachable</li>
              <li>Click "Initialize Database Schema" to create all tables</li>
              <li>Check the result to ensure everything is set up correctly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
