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

  // Dummy dashboard data
  const [data] = useState({
    downloads: 1200,
    users: 350,
    goals: 42,
    alerts: 7,
    sales: [
      { month: 'Jan', revenue: 4000, profit: 2400 },
      { month: 'Feb', revenue: 3000, profit: 1398 },
      { month: 'Mar', revenue: 2000, profit: 9800 },
      { month: 'Apr', revenue: 2780, profit: 3908 },
      { month: 'May', revenue: 1890, profit: 4800 },
      { month: 'Jun', revenue: 2390, profit: 3800 },
      { month: 'Jul', revenue: 3490, profit: 4300 },
    ],
    demographics: [
      { name: 'Male', value: 60, color: '#8884d8' },
      { name: 'Female', value: 40, color: '#82ca9d' },
    ],
    activities: [
      { type: 'download', description: 'User A downloaded a report', time: '2 hours ago' },
      { type: 'user', description: 'User B signed up', time: '3 hours ago' },
      { type: 'goal', description: 'Goal C achieved', time: '5 hours ago' },
      { type: 'alert', description: 'Alert D triggered', time: '1 day ago' },
    ],
  });

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
