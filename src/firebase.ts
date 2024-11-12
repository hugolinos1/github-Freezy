import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile, updatePassword, User, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getDatabase, ref, set, get, remove, update, onValue, push } from 'firebase/database';
import { Product } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyAzFqV4LQUPxdToQ2qD_NH3gRP8lJLX4Gs",
  authDomain: "freezermanager-8be22.firebaseapp.com",
  projectId: "freezermanager-8be22",
  storageBucket: "freezermanager-8be22.firebasestorage.app",
  messagingSenderId: "142741862055",
  appId: "1:142741862055:web:4a476bf95d269099a94d82",
  measurementId: "G-P83E4M9DKG",
  databaseURL: "https://freezermanager-8be22-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userCredential.user.sendEmailVerification();
    return userCredential.user;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = async (displayName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  try {
    await updateProfile(user, { displayName });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const productsRef = ref(db, `users/${user.uid}/products`);
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const products: Product[] = [];
      snapshot.forEach((childSnapshot) => {
        products.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
      return products;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const productsRef = ref(db, `users/${user.uid}/products`);
    const newProductRef = push(productsRef);
    await set(newProductRef, product);
    return { id: newProductRef.key!, ...product };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (product: Product) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const productRef = ref(db, `users/${user.uid}/products/${product.id}`);
    await update(productRef, product);
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const productRef = ref(db, `users/${user.uid}/products/${productId}`);
    await remove(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const fetchSettings = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const settingsRef = ref(db, `users/${user.uid}/settings`);
    const snapshot = await get(settingsRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return { drawer_count: 5 };
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const updateSettings = async (settings: { drawer_count: number }) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const settingsRef = ref(db, `users/${user.uid}/settings`);
    await set(settingsRef, settings);
    return settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};