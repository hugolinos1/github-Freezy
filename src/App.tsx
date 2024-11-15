import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MovementInput from './components/MovementInput';
import Settings from './components/Settings';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import { Product, User } from './types';
import { Snowflake } from 'lucide-react';
import { fetchProducts, fetchSettings, signOut, onAuthStateChange } from './firebase';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
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

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [drawerCount, setDrawerCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedSettings] = await Promise.all([
          fetchProducts(),
          fetchSettings()
        ]);

        setProducts(fetchedProducts);
        setDrawerCount(fetchedSettings.drawer_count);
        setIsOffline(false);
      } catch (err) {
        console.error("Erreur lors de l'initialisation de l'application:", err);
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const MainContent = () => (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f7f9' }}>
      <div className="px-4 py-6 shadow-lg" style={{ background: 'linear-gradient(to right, #92bfc8, #92bfc8)' }}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://i.ibb.co/PxQGCCZ/Freezy-logo.webp" alt="Freezy Logo" className="w-24 h-24" />
              <div>
                <h1 className="text-3xl font-bold text-white">Freezy</h1>
                <p className="text-sm" style={{ color: '#f0f7f9' }}>Your Freezer Manager</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isOffline && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                  Mode hors ligne
                </span>
              )}
              {user && (
                <>
                  <button 
                    onClick={handleSignOut}
                    className="text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                    style={{ backgroundColor: '#7ba7b1' }}
                  >
                    Déconnexion
                  </button>
                  <UserProfile user={user} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4">
          <Settings
            drawerCount={drawerCount}
            onDrawerCountChange={setDrawerCount}
            products={products}
          />
        </div>
        <MovementInput
          onProductAdd={(product) => setProducts([...products, product])}
          drawerCount={drawerCount}
        />
        <Dashboard
          products={products}
          drawerCount={drawerCount}
          onUpdateProduct={(updatedProduct) => {
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          }}
          onDeleteProduct={(id) => {
            setProducts(products.filter(p => p.id !== id));
          }}
        />
      </div>

      <footer className="text-white py-4 mt-8" style={{ backgroundColor: '#8EBEC9' }}>
        <div className="container mx-auto px-4 text-center">
          <p>Développé par Hugolinos et une IA sympa !</p>
        </div>
      </footer>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainContent />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
