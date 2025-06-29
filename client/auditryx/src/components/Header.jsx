
import { useState } from 'react';
import { useApp } from '../App.jsx';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar.jsx';


const Header = () => {
  const { user, currentPage, setCurrentPage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 select-none">
              <img src="/audit favicon.png" alt="Auditryx Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-blue-700 tracking-tight">Auditryx</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            {user && user.full_name ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</span>
              </div>
            ) : user && user.email ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.email[0].toUpperCase()}</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">?</span>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;