import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'RIDER';
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        const user = apiService.getCurrentUser();

        if (!token || !user) {
          navigate('/');
          return;
        }

        // Verify token with backend
        const response = await apiService.verifyToken();
        
        if (response.success) {
          // Check role if required
          if (requiredRole && response.data.user.role !== requiredRole) {
            navigate('/');
            return;
          }
          
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage and redirect
          apiService.logout();
          navigate('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiService.logout();
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
