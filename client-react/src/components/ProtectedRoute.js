import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid, isTokenExpiringSoon } from '../util/auth';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token
    if (!isTokenValid()) {
      console.log('Redirect to login page.');
      navigate('/');
      return;
    }

    if (isTokenExpiringSoon()) {
      console.warn('Yout session will expire soon!');
    }

    // Periodic token validate
    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        console.log('Session expired. Redirecting to login page.');
        navigate('/');
        clearInterval(tokenCheckInterval);
      } else if (isTokenExpiringSoon()) {
        console.warn('Your session will expire soon!');
      }
    }, 60000); // Checking every minute

    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

  // Rendering children if token is valid
  return isTokenValid() ? children : null;
}