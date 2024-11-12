import React, { useState } from 'react';
import { Settings as SettingsIcon, Plus, Minus, Download } from 'lucide-react';
import { Product } from '../types';

interface SettingsProps {
  drawerCount: number;
  onDrawerCountChange: (count: number) => void;
  products: Product[];
}

const Settings: React.FC<SettingsProps> = ({ drawerCount, onDrawerCountChange, products }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleIncrement = () => {
    onDrawerCountChange(drawerCount + 1);
  };

  const handleDecrement = () => {
    if (drawerCount > 1) {
      onDrawerCountChange(drawerCount - 1);
    }
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Type', 'Date d\'entrée', 'Quantité', 'Poids', 'Tiroir'];
    const csvContent = [
      headers.join(';'),
      ...products.map(product => 
        [
          product.name,
          product.type,
          product.entry_date,
          product.quantity,
          product.weight || '',
          product.drawer
        ].join(';')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `freezer_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
        aria-label="Paramètres"
      >
        <SettingsIcon size={24} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Paramètres</h3>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-700">Nombre de tiroirs:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDecrement}
                  className="bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-colors"
                  disabled={drawerCount <= 1}
                  aria-label="Réduire le nombre de tiroirs"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center">{drawerCount}</span>
                <button
                  onClick={handleIncrement}
                  className="bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-colors"
                  aria-label="Augmenter le nombre de tiroirs"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <button
              onClick={exportCSV}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              disabled={products.length === 0}
            >
              <Download size={16} className="mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;