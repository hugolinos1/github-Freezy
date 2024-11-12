import { createClient } from '@supabase/supabase-js';
import type { Product, User, AuthResponse } from './types';
import { getStoredProducts, setStoredProducts, getStoredSettings, setStoredSettings } from './utils/storage';

// Always use local storage in development or when Supabase is not configured
const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'http://localhost:54321';

export const supabase = isSupabaseConfigured 
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null;

// Simulate email sending in development
const simulateEmailSending = async (email: string, type: 'login' | 'signup') => {
  const pendingLogins = JSON.parse(localStorage.getItem('pendingLogins') || '[]');
  const loginToken = Math.random().toString(36).substring(2);
  
  pendingLogins.push({
    email,
    token: loginToken,
    type,
    timestamp: Date.now()
  });
  
  localStorage.setItem('pendingLogins', JSON.stringify(pendingLogins));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  setTimeout(() => {
    verifyLoginToken(loginToken);
    window.location.reload();
  }, 2000);
};

export const verifyLoginToken = (token: string): User => {
  const pendingLogins = JSON.parse(localStorage.getItem('pendingLogins') || '[]');
  const loginRequest = pendingLogins.find((login: any) => login.token === token);
  
  if (!loginRequest) {
    throw new Error('Lien de connexion invalide ou expiré');
  }
  
  localStorage.setItem('pendingLogins', 
    JSON.stringify(pendingLogins.filter((login: any) => login.token !== token))
  );
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find((u: any) => u.email === loginRequest.email);
  
  if (!user) {
    user = {
      id: Date.now().toString(),
      email: loginRequest.email,
      created_at: new Date().toISOString()
    };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  return user;
};

export async function signInWithEmail(email: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    await simulateEmailSending(email, 'login');
    return { 
      message: 'Vérifiez votre email pour le lien de connexion',
      email 
    };
  }

  try {
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
    
    return { 
      message: 'Vérifiez votre email pour le lien de connexion',
      email 
    };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    localStorage.removeItem('currentUser');
    return;
  }

  try {
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  try {
    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erreur de récupération utilisateur:', error);
    return null;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    if (!isSupabaseConfigured) {
      return getStoredProducts();
    }

    const { data, error } = await supabase!.from('products').select('*');
    if (error) throw error;
    
    const products = data || [];
    setStoredProducts(products);
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return getStoredProducts();
  }
}

export async function fetchSettings() {
  try {
    if (!isSupabaseConfigured) {
      return getStoredSettings();
    }

    const { data, error } = await supabase!.from('settings').select('*').single();
    if (error) {
      if (error.code === 'PGRST116') {
        const defaultSettings = { drawer_count: 5 };
        setStoredSettings(defaultSettings);
        return defaultSettings;
      }
      throw error;
    }
    
    setStoredSettings(data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return getStoredSettings();
  }
}

export async function updateSettings(settings: { drawer_count: number }) {
  try {
    setStoredSettings(settings);

    if (!isSupabaseConfigured) {
      return settings;
    }

    const { data, error } = await supabase!
      .from('settings')
      .upsert({ id: 1, ...settings })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return settings;
  }
}

export async function addProduct(product: Omit<Product, 'id'>) {
  try {
    const newProduct = {
      ...product,
      id: Date.now().toString()
    };

    if (!isSupabaseConfigured) {
      const currentProducts = getStoredProducts();
      setStoredProducts([...currentProducts, newProduct]);
      return newProduct;
    }

    const { data, error } = await supabase!
      .from('products')
      .insert([newProduct])
      .select()
      .single();
      
    if (error) throw error;
    
    const currentProducts = getStoredProducts();
    const updatedProduct = data || newProduct;
    setStoredProducts([...currentProducts, updatedProduct]);
    return updatedProduct;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit:', error);
    throw error;
  }
}

export async function updateProduct(product: Product) {
  try {
    const currentProducts = getStoredProducts();
    const updatedProducts = currentProducts.map(p => 
      p.id === product.id ? product : p
    );
    setStoredProducts(updatedProducts);

    if (!isSupabaseConfigured) {
      return product;
    }

    const { data, error } = await supabase!
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return product;
  }
}

export async function deleteProduct(id: string) {
  try {
    const currentProducts = getStoredProducts();
    setStoredProducts(currentProducts.filter(p => p.id !== id));

    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase!.from('products').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
  }
}