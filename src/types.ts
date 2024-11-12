export type FoodType = 'Poisson' | 'Viande' | 'Légumes' | 'Fruits' | 'Desserts' | 'Autres';

export interface Product {
  id: string;
  name: string;
  type: FoodType;
  entry_date: string;
  quantity: number;
  weight?: number;
  drawer: number;
}

export interface AuthResponse {
  message: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}