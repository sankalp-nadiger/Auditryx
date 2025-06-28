import React from 'react';
import { useApp } from '../App.jsx';
import { Home, Users, Upload, Settings, Shield } from 'lucide-react';

const Sidebar = () => {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useApp();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Auditryx</h1>
          </div>
        </div>
        
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
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