import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function CorsTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCors = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/cors-test`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const testBasicConnection = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/test`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          CORS Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testCors} 
            disabled={testing}
            variant="outline"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test CORS'}
          </Button>
          <Button 
            onClick={testBasicConnection} 
            disabled={testing}
            variant="outline"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Basic Connection'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Success:</strong> {result.message}</div>
                <div><strong>Origin:</strong> {result.origin || 'No origin header'}</div>
                {result.allowedOrigins && (
                  <div>
                    <strong>Allowed Origins:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {result.allowedOrigins.map((origin: string, index: number) => (
                        <li key={index}>{origin}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Current API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</p>
          <p><strong>Frontend Origin:</strong> {window.location.origin}</p>
        </div>
      </CardContent>
    </Card>
  );
}
