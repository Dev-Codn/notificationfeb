import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

export const ErrorTest = () => {
  const [loading, setLoading] = useState(false);

  const createTestCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/test-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Test customer created! Now try adding a customer with phone +92 99999 99999');
      } else {
        toast.error('Failed to create test customer');
      }
    } catch (error) {
      toast.error('Error creating test customer');
    } finally {
      setLoading(false);
    }
  };

  const testDuplicateError = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/test-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Unexpected: Both customers created');
      } else {
        toast.error(data.message || 'Test failed');
        console.log('Duplicate test response:', data);
      }
    } catch (error) {
      toast.error('Error testing duplicate');
      console.log('Duplicate test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🧪 Error Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Test duplicate phone number validation
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={createTestCustomer} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Creating...' : 'Create Phone Test Customer'}
          </Button>
          
          <Button 
            onClick={testDuplicateError} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Testing...' : 'Test Duplicate Error'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Debug Test:</strong></p>
          <p>1. Click "Test Duplicate Error" to see if backend error handling works</p>
          <p>2. Check browser console for detailed error logs</p>
          <p>3. Should see: <strong>"Client with this phone number already exists"</strong></p>
          
          <p><strong>Form Test:</strong></p>
          <p>4. Click "Create Phone Test Customer"</p>
          <p>5. Try adding customer with phone: <code>+92 99999 99999</code></p>
          <p>6. Check console for API response details</p>
        </div>
      </CardContent>
    </Card>
  );
};
