import React, { useState } from 'react';
import { FoodType, Product } from '../types';

interface ManualInputProps {
  onProductAdd: (product: Product) => void;
  drawerCount: number;
}

const ManualInput: React.FC<ManualInputProps> = ({ onProductAdd, drawerCount }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<FoodType>('Autres');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>();
  const [drawer, setDrawer] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      type,
      entryDate: new Date(),
      quantity,
      weight,
      drawer
    };
    onProductAdd(newProduct);
    setName('');
    setType('Autres');
    setQuantity(1);
    setWeight(undefined);
    setDrawer(1);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Saisie manuelle</h2>
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
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          required
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
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="drawer">
          Tiroir
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="drawer"
          value={drawer}
          onChange={(e) => setDrawer(parseInt(e.target.value))}
        >
          {Array.from({ length: drawerCount }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              Tiroir {d}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
};

export default ManualInput;