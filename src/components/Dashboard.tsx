import React, { useState } from 'react';
import { FoodType, Product } from '../types';
import { Fish, Beef, Carrot, Apple, IceCream2, Package, Edit, Trash, Grid } from 'lucide-react';
import EditProduct from './EditProduct';
import { deleteProduct } from '../firebase';

interface DashboardProps {
  products: Product[];
  drawerCount: number;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, drawerCount, onUpdateProduct, onDeleteProduct }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'type' | 'drawer'>('type');
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = async (updatedProduct: Product) => {
    try {
      onUpdateProduct(updatedProduct);
      setEditingProduct(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du produit');
      console.error('Error updating product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      onDeleteProduct(id);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression du produit');
      console.error('Error deleting product:', err);
    }
  };

  const getFoodTypeIcon = (type: FoodType) => {
    switch (type) {
      case 'Poisson': return <Fish size={24} />;
      case 'Viande': return <Beef size={24} />;
      case 'Légumes': return <Carrot size={24} />;
      case 'Fruits': return <Apple size={24} />;
      case 'Desserts': return <IceCream2 size={24} />;
      default: return <Package size={24} />;
    }
  };

  const renderProduct = (product: Product) => (
    <li key={product.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="text-gray-600">{getFoodTypeIcon(product.type)}</div>
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-500">
            Quantité: {product.quantity}
            {product.weight && ` - ${product.weight}g`}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => handleEdit(product)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => handleDelete(product.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <Trash size={18} />
        </button>
      </div>
    </li>
  );

  const groupedByType = products.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {} as Record<FoodType, Product[]>);

  const groupedByDrawer = products.reduce((acc, product) => {
    if (!acc[product.drawer]) {
      acc[product.drawer] = [];
    }
    acc[product.drawer].push(product);
    return acc;
  }, {} as Record<number, Product[]>);

  const foodTypes: FoodType[] = ['Poisson', 'Viande', 'Légumes', 'Fruits', 'Desserts', 'Autres'];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setViewMode(viewMode === 'type' ? 'drawer' : 'type')}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Grid size={18} />
          <span>{viewMode === 'type' ? 'Vue par tiroir' : 'Vue par type'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viewMode === 'type' ? (
          foodTypes.map((type) => (
            <div key={type} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getFoodTypeIcon(type)}
                <h2 className="text-xl font-semibold">{type}</h2>
              </div>
              <ul className="space-y-3">
                {(groupedByType[type] || []).map(renderProduct)}
              </ul>
            </div>
          ))
        ) : (
          Array.from({ length: drawerCount }, (_, i) => i + 1).map((drawer) => (
            <div key={drawer} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Grid size={24} />
                <h2 className="text-xl font-semibold">Tiroir {drawer}</h2>
              </div>
              <ul className="space-y-3">
                {(groupedByDrawer[drawer] || []).map(renderProduct)}
              </ul>
            </div>
          ))
        )}
      </div>
      
      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setEditingProduct(null)}
          drawerCount={drawerCount}
        />
      )}
    </div>
  );
};

export default Dashboard;