import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const ConnectionTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiService.testConnection();
      setTestResult({
        success: true,
        data: response,
        message: 'Backend is connected! 🎉'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Backend connection failed ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiService.healthCheck();
      setTestResult({
        success: true,
        data: response,
        message: 'Backend health check passed! 🏥'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Backend health check failed ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Backend Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            variant="outline"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Test Connection
          </Button>
          <Button 
            onClick={testHealth} 
            disabled={loading}
            variant="outline"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Health Check
          </Button>
        </div>

        {testResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.message}
              </Badge>
            </div>
            
            {testResult.data && (
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm">
                {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
            
            {testResult.error && (
              <div className="bg-destructive/10 p-3 rounded-md">
                <p className="text-sm text-destructive">
                  Error: {testResult.error}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Expected URLs:</strong></p>
          <p>• Backend: <code>http://localhost:5000</code></p>
          <p>• Test endpoint: <code>http://localhost:5000/api/test</code></p>
          <p>• Health check: <code>http://localhost:5000/api/health</code></p>
        </div>
      </CardContent>
    </Card>
  );
};
