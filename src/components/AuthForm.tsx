import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { signIn, signUp } from '../firebase';
import { useNavigate } from 'react-router-dom';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        setSuccess(result.message);
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err) {
      const firebaseError = err as { code?: string, message?: string };
      let errorMessage = 'Une erreur est survenue';
      
      if (firebaseError.message) {
        errorMessage = firebaseError.message;
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4" style={{ backgroundColor: '#f0f7f9' }}>
      <div className="text-center mb-8">
        <img src="https://i.ibb.co/cNvz8LR/Freezy2.png" alt="Freezy Logo" className="w-64 h-64 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#8EBEC9' }}>Freezy</h1>
        <p className="text-xl" style={{ color: '#a5cdd5' }}>Your Freezer Manager</p>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Mail size={24} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#8EBEC9' }}>
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ focusRingColor: '#8EBEC9' }}
              required
              disabled={isLoading}
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2"
              style={{ focusRingColor: '#8EBEC9' }}
              required
              disabled={isLoading}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
            style={{ backgroundColor: '#8EBEC9' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                {isSignUp ? 'Création du compte...' : 'Connexion...'}
              </>
            ) : (
              isSignUp ? 'Créer un compte' : 'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
              setEmail('');
              setPassword('');
            }}
            className="text-blue-600 hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? En créer un'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
