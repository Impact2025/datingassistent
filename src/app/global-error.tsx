'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('CRITICAL APPLICATION ERROR:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service
      // Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: '40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#fee2e2',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg
                style={{ width: '40px', height: '40px', color: '#dc2626' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111',
              marginBottom: '12px',
            }}>
              Er is een kritieke fout opgetreden
            </h1>

            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              We zijn op de hoogte gebracht en werken aan een oplossing. 
              Probeer de pagina te vernieuwen of kom later terug.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
              }}>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#991b1b',
                  wordBreak: 'break-word',
                  margin: 0,
                }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{
                    fontSize: '11px',
                    color: '#b91c1c',
                    marginTop: '8px',
                    margin: 0,
                  }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Probeer opnieuw
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  width: '100%',
                  background: '#f3f4f6',
                  color: '#374151',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Terug naar home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
