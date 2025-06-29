import React from 'react';
import { useApp } from '../../App.jsx';
import { Home, Users, Upload, Settings, X, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ open, onClose, currentPage, setCurrentPage }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'suppliers', label: 'Suppliers', icon: Users, path: '/suppliers' },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload, path: '/bulk-import' },
    { id: 'weather', label: 'Weather Monitor', icon: Thermometer, path: '/weather' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-50
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/audit favicon.png" alt="Auditryx Favicon" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-900">Auditryx</h1>
          </div>
          <button onClick={onClose} aria-label="Close sidebar" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;