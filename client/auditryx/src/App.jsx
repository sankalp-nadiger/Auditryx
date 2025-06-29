import { useState, createContext, useContext, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css'
import Dashboard from './components/Dashboard.jsx';
import Supplier from './components/Supplier.jsx';
import SupplierDetail from './components/SupplierDetail.jsx';
import BulkImport from './components/BulkImport.jsx';
import Login from './components/Login.jsx';
import AuditryxLanding from './components/LandingPage.jsx';

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for token in localStorage
    return Boolean(localStorage.getItem('token'));
  });
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState(null);

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
    setSidebarOpen,
    data,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


function PrivateRoute({ children }) {
  const { isAuthenticated } = useApp();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<AuditryxLanding />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><Supplier /></PrivateRoute>} />
        <Route path="/suppliers/:id" element={<PrivateRoute><SupplierDetail /></PrivateRoute>} />
        <Route path="/bulk-import" element={<PrivateRoute><BulkImport /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AppProvider>
  );
}

export { AppContext, useApp, AppProvider };
export default App
