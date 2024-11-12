import React, { useState } from 'react';
import { FoodType, Product } from '../types';
import VoiceInput from './VoiceInput';
import { addProduct } from '../firebase';

interface MovementInputProps {
  drawerCount: number;
  onProductAdd?: (product: Product) => void;
}

const MovementInput: React.FC<MovementInputProps> = ({ drawerCount }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<FoodType>('Autres');
  const [quantity, setQuantity] = useState<number | undefined>();
  const [weight, setWeight] = useState<number | undefined>();
  const [drawer, setDrawer] = useState<number | undefined>();
  const [missingInfo, setMissingInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMissingInfo([]);

    if (name && quantity && drawer) {
      setIsLoading(true);
      try {
        const newProduct: Omit<Product, 'id'> = {
          name,
          type,
          entry_date: new Date().toISOString(),
          quantity,
          weight,
          drawer
        };
        
        await addProduct(newProduct);
        resetForm();
      } catch (err) {
        setError('Erreur lors de l\'ajout du produit');
        console.error('Error adding product:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const missing = [];
      if (!name) missing.push('nom du produit');
      if (!quantity) missing.push('quantité');
      if (!drawer) missing.push('numéro de tiroir');
      setMissingInfo(missing);
    }
  };

  const resetForm = () => {
    setName('');
    setType('Autres');
    setQuantity(undefined);
    setWeight(undefined);
    setDrawer(undefined);
    setMissingInfo([]);
    setError(null);
  };

  const handleVoiceInput = (productInfo: Partial<Omit<Product, 'id'>>) => {
    if (productInfo.name) setName(productInfo.name);
    if (productInfo.type) setType(productInfo.type);
    if (productInfo.quantity) setQuantity(productInfo.quantity);
    if (productInfo.weight) setWeight(productInfo.weight);
    if (productInfo.drawer) setDrawer(productInfo.drawer);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Mouvements</h2>
      <VoiceInput onVoiceInput={handleVoiceInput} />
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nom du produit
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Type d'aliment
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as FoodType)}
            disabled={isLoading}
          >
            <option value="Poisson">Poisson</option>
            <option value="Viande">Viande</option>
            <option value="Légumes">Légumes</option>
            <option value="Fruits">Fruits</option>
            <option value="Desserts">Desserts</option>
            <option value="Autres">Autres</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
            Quantité
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="quantity"
            type="number"
            value={quantity || ''}
            onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : undefined)}
            min="1"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
            Poids (g)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="weight"
            type="number"
            value={weight || ''}
            onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : undefined)}
            min="0"
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="drawer">
            Tiroir
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="drawer"
            value={drawer || ''}
            onChange={(e) => setDrawer(parseInt(e.target.value))}
            required
            disabled={isLoading}
          >
            <option value="">Sélectionnez un tiroir</option>
            {Array.from({ length: drawerCount }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                Tiroir {d}
              </option>
            ))}
          </select>
        </div>
        {missingInfo.length > 0 && (
          <div className="mb-4 text-red-500">
            <p>Veuillez remplir les champs suivants : {missingInfo.join(', ')}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-500">
            <p>{error}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovementInput;