import { useState, createContext, useContext } from 'react'
import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// Import your pages/components
import Dashboard from './components/Dashboard.jsx';
import Supplier from './components/Supplier.jsx';
import SupplierDetail from './components/SupplierDetail.jsx';
import BulkImport from './components/BulkImport.jsx';
import Login from './components/Login.jsx';

const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value = {
    currentPage,
    setCurrentPage,
    selectedSupplier,
    setSelectedSupplier,
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    sidebarOpen,
    setSidebarOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

function App() {
  const [count, setCount] = useState(0)

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/suppliers/:id" element={<SupplierDetail />} />
        <Route path="/bulk-import" element={<BulkImport />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AppProvider>
  )
}

export { AppContext, useApp, AppProvider };
export default App
