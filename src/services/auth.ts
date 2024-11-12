import { sendAuthEmail } from './email';
import type { User } from '../types';

const isDevelopment = !import.meta.env.VITE_MAILSEND_API_KEY || 
                     import.meta.env.MODE === 'development';

export async function signInWithEmail(email: string) {
  try {
    console.log('Tentative de connexion pour:', email);
    await sendAuthEmail(email, 'login');
    console.log('Email de connexion envoyé avec succès');
    return { 
      message: 'Vérifiez votre email pour le lien de connexion',
      email 
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    if (error instanceof Error) {
      throw new Error(`Impossible d'envoyer l'email de connexion: ${error.message}`);
    }
    throw new Error('Impossible d\'envoyer l\'email de connexion');
  }
}

export async function signOut() {
  try {
    localStorage.removeItem('currentUser');
    console.log('Déconnexion réussie');
    window.location.href = '/login';
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw new Error('Erreur lors de la déconnexion');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      console.log('Aucun utilisateur connecté');
      return null;
    }
    const user = JSON.parse(stored);
    console.log('Utilisateur récupéré:', user.email);
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

export function handleAuthStateChange(callback: (user: User | null) => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'currentUser') {
      const user = e.newValue ? JSON.parse(e.newValue) : null;
      console.log('Changement d\'état d\'authentification:', user?.email || 'déconnecté');
      callback(user);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}