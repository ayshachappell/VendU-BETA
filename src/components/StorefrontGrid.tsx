import React, { useState } from 'react';

interface ProductItem {
  id: string;
  title: string;
  price: string;
  imageUrl?: string;
}

interface StorefrontGridProps {
  items: ProductItem[];
  isDemoMode: boolean; // True for tutorials/testers, false for new user stores
}

export const StorefrontGrid: React.FC<StorefrontGridProps> = ({ items, isDemoMode }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'window'>('grid');

  // If a real user has just set up their store with no items yet
  if (!isDemoMode && (!items || items.length === 0)) {
    return (
      <div className="px-4 py-6">
        <div className="h-48 rounded-2xl bg-purple-50 border-2 border-dashed border-purple-200 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-purple-600 font-medium">📱 Add photos of your work</p>
          <span className="text-[10px] text-gray-400 mt-1">Profile → Set up your storefront</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      {/* Optional Toggle between Grid View and Window View */}
      <div className="flex justify-end mb-2 gap-2 text-xs">
        <button 
          onClick={() => setViewMode('grid')}
          className={`px-3 py-1 rounded-lg font-medium ${viewMode === 'grid' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Grid View
        </button>
        <button 
          onClick={() => setViewMode('window')}
          className={`px-3 py-1 rounded-lg font-medium ${viewMode === 'window' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Window View
        </button>
      </div>

      {/* Render Items depending on chosen layout view, always showing price tags */}
      <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "flex flex-col gap-4"}>
        {items.map((item) => (
          <div key={item.id} className={`relative rounded-2xl overflow-hidden shadow-sm bg-gray-100 ${viewMode === 'grid' ? 'aspect-square' : 'h-64'}`}>
            <img 
              src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
            {/* Price badge always displayed on photos */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-white">
              <span className="text-xs font-medium truncate">{item.title}</span>
              <span className="text-xs font-bold bg-amber-100 text-gray-900 px-1.5 py-0.5 rounded-md">{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
