import React, { useState } from 'react';
import { Product, FoodType } from '../types';

interface EditProductProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
  drawerCount: number;
}

const EditProduct: React.FC<EditProductProps> = ({ product, onSave, onCancel, drawerCount }) => {
  const [name, setName] = useState(product.name);
  const [type, setType] = useState<FoodType>(product.type);
  const [quantity, setQuantity] = useState(product.quantity);
  const [weight, setWeight] = useState<number | undefined>(product.weight);
  const [drawer, setDrawer] = useState(product.drawer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...product,
      name,
      type,
      quantity,
      weight,
      drawer
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-4 pt-4 pb-4 mb-4">
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="name">
          Nom du produit
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="type">
          Type d'aliment
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="quantity">
          Quantité
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="weight">
          Poids (g)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="weight"
          type="number"
          value={weight || ''}
          onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : undefined)}
          min="0"
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="drawer">
          Tiroir
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Enregistrer
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default EditProduct;