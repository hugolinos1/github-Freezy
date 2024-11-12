import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';
import { onAuthStateChange } from '../firebase';
import { Snowflake } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#f0f7f9' }}>
        <Snowflake className="animate-spin h-10 w-10" style={{ color: '#8EBEC9' }} />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;