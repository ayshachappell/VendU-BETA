import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface VendorHeaderProps {
  vendorName: string;
  isActive: boolean;
  avatarUrl: string;
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({ vendorName, isActive, avatarUrl }) => {
  return (
    <div className="relative w-full bg-white">
      {/* Purple Striped Scalloped Header */}
      <div className="relative h-28 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]">
        <div className="absolute top-3 left-4 flex items-center text-white bg-black/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm cursor-pointer">
          <ArrowLeft size={14} className="mr-1" /> Back
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <span className="text-white font-bold tracking-wider text-sm uppercase">Welcome to My Vendu</span>
        </div>
        {/* Scalloped Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-t-2xl"></div>
      </div>

      {/* Profile Info & Conditional Active Dot */}
      <div className="px-4 pt-2 pb-4 flex items-center justify-between">
        <div className="relative flex items-center space-x-3">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt={vendorName} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            {/* Green dot appears ONLY when user is active */}
            {isActive && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1">
              {vendorName}
              <span className="text-blue-500 text-sm">✔</span>
            </h1>
            <p className="text-xs text-gray-500">Food • 0.4 mi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Add VendorHeader component with conditional active dot
