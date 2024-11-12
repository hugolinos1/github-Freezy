import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyAuthToken } from '../services/email';
import { Loader } from 'lucide-react';

const VerifyAuth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token manquant');
      return;
    }

    const verifyToken = async () => {
      try {
        const decoded = await verifyAuthToken(token);
        
        // Créer l'utilisateur en local
        const user = {
          id: Date.now().toString(),
          email: decoded.email,
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de vérification');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-red-500 text-xl font-bold mb-4">Erreur de vérification</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Vérification en cours...</p>
      </div>
    </div>
  );
};

export default VerifyAuth;