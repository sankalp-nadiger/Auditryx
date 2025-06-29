
import { useState, useEffect } from 'react';
import { useApp } from '../App.jsx';
import { Search, Plus, Filter, Users, Calendar, MapPin, Eye, Edit, Trash2, X } from 'lucide-react';
import Badge from './Badge.jsx';
import Header from './Header.jsx';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SuppliersPage = () => {
  const { setCurrentPage, setSelectedSupplier, searchQuery, setSearchQuery, user } = useApp();
  const [filters, setFilters] = useState({ country: '', riskLevel: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [hiddenRows, setHiddenRows] = useState([]);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    contactEmail: '',
    complianceScore: '',
    riskLevel: 'low',
    status: 'active',
    contract_terms: ''
  });
  
  // Get backend URL from environment variable
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${VITE_BACKEND_URL}/suppliers/`, {
        headers: {
          'x-user-id': user?.id ? String(user.id) : '1',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched suppliers:', data);
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);
  
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (supplier.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCountry = !filters.country || supplier.country === filters.country;
    const matchesRisk = !filters.riskLevel || (supplier.risk_level || supplier.riskLevel) === filters.riskLevel;
    const matchesStatus = !filters.status || supplier.status === filters.status;
    return matchesSearch && matchesCountry && matchesRisk && matchesStatus;
  });
  
  // Hide/unhide row
  const handleHideRow = (id) => {
    setHiddenRows((prev) => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  // Edit row
  const handleEditRow = (supplier) => {
    setEditingSupplierId(supplier.id);
    setEditFormData({
      name: supplier.name,
      country: supplier.country,
      complianceScore: supplier.compliance_score ?? supplier.complianceScore ?? '',
      riskLevel: supplier.risk_level ?? supplier.riskLevel ?? 'low',
      last_audit: supplier.last_audit ?? supplier.lastAudit ?? '',
      contract_terms: supplier.contract_terms?.text ?? '',
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSave = async (id) => {
    // Send PATCH/PUT to backend (not implemented here, just update local for demo)
    setSuppliers((prev) => prev.map(s => s.id === id ? {
      ...s,
      name: editFormData.name,
      country: editFormData.country,
      compliance_score: editFormData.complianceScore,
      risk_level: editFormData.riskLevel,
      last_audit: editFormData.last_audit,
      contract_terms: { text: editFormData.contract_terms },
    } : s));
    setEditingSupplierId(null);
  };

  const handleEditFormCancel = () => {
    setEditingSupplierId(null);
  };

  // Delete row
  const handleDeleteRow = async (id) => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id ? String(user.id) : '1',
        },
      });
      if (!response.ok) throw new Error('Failed to delete supplier');
      setSuppliers((prev) => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Row click navigation
  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
    setCurrentPage('supplier-detail');
    // Use react-router navigation to /suppliers/:id
    if (window && window.location && window.history) {
      window.history.pushState({}, '', `/suppliers/${supplier.id}`);
    }
  };
  
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError(null);
      // Prepare the data for API submission
      let contractTermsObj = {};
      try {
        contractTermsObj = formData.contract_terms.trim()
          ? JSON.parse(formData.contract_terms)
          : {};
      } catch (e) {
        // fallback: treat as plain text if not valid JSON
        contractTermsObj = { text: formData.contract_terms.trim() };
      }
      // Prepare last_audit as ISO string or null
      let lastAuditValue = formData.last_audit ? formData.last_audit : null;
      // Prepare compliance_score as integer (default 0)
      let complianceScoreValue = formData.complianceScore !== '' ? parseInt(formData.complianceScore) : 0;
      const supplierData = {
        name: formData.name.trim(),
        country: formData.country.trim(),
        contract_terms: contractTermsObj,
        risk_level: formData.riskLevel,
        compliance_score: complianceScoreValue,
        last_audit: lastAuditValue,
      };
      const response = await fetch(`${VITE_BACKEND_URL}/suppliers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id ? String(user.id) : '1',
        },
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      // Reset form and close modal
      setFormData({
        name: '',
        country: '',
        contactEmail: '',
        complianceScore: '',
        riskLevel: 'low',
        status: 'active',
        contract_terms: '',
        last_audit: '',
      });
      setShowAddForm(false);
      // Fetch suppliers again after a short delay to ensure DB commit
      setTimeout(() => {
        fetchSuppliers();
      }, 300);
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getRiskBadgeVariant = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'default';
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get unique countries for filter dropdown
  const uniqueCountries = [...new Set(suppliers.map(s => s.country).filter(Boolean))];
  
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading suppliers...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        </div>
        <Card className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading suppliers</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchSuppliers}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
    <Header />
    
    {/* Main Content Container with proper spacing */}
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>
      
      {/* Search and Filters Card */}
      <Card className="mb-6 shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Suppliers Table Card */}
      <Card className="shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => {
                // Normalize keys for backend/legacy/frontend compatibility
                const complianceScore = supplier.compliance_score ?? supplier.complianceScore ?? 0;
                const riskLevel = supplier.risk_level ?? supplier.riskLevel ?? 'unknown';
                const lastAudit = supplier.last_audit ?? supplier.lastAudit ?? null;
                const isHidden = hiddenRows.includes(supplier.id);
                const isEditing = editingSupplierId === supplier.id;
                
                if (isHidden) {
                  return (
                    <tr key={supplier.id} className="bg-gray-100 text-gray-400">
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <span className="text-sm">Row hidden</span>
                        <Button size="sm" variant="outline" className="ml-4" onClick={() => handleHideRow(supplier.id)}>
                          Unhide
                        </Button>
                      </td>
                    </tr>
                  );
                }
                
                if (isEditing) {
                  return (
                    <tr key={supplier.id} className="bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="text" 
                          name="name" 
                          value={editFormData.name} 
                          onChange={handleEditFormChange} 
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="text" 
                          name="country" 
                          value={editFormData.country} 
                          onChange={handleEditFormChange} 
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="date" 
                          name="last_audit" 
                          value={editFormData.last_audit} 
                          onChange={handleEditFormChange} 
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="number" 
                          name="complianceScore" 
                          value={editFormData.complianceScore} 
                          onChange={handleEditFormChange} 
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          name="riskLevel" 
                          value={editFormData.riskLevel} 
                          onChange={handleEditFormChange} 
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={() => handleEditFormSave(supplier.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleEditFormCancel}>Cancel</Button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={supplier.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => handleRowClick(supplier)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{supplier.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{supplier.contactEmail || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{supplier.country || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {lastAudit ? new Date(lastAudit).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xl font-bold ${getScoreColor(complianceScore)}`}>
                        {complianceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRiskBadgeVariant(riskLevel)}>
                        {riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleHideRow(supplier.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title={hiddenRows.includes(supplier.id) ? 'Unhide row' : 'Hide row'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditRow(supplier)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                          title="Edit supplier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRow(supplier.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-150"
                          title="Delete supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Empty State */}
      {filteredSuppliers.length === 0 && !loading && (
        <Card className="mt-6 shadow-sm border border-gray-200">
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">
              {suppliers.length === 0 
                ? "No suppliers available. Add some suppliers to get started."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        </Card>
      )}
    </div>
      
    {/* Add Supplier Modal */}
    {showAddForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h2 className="text-xl font-semibold text-gray-900">Add New Supplier</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Modal Body */}
          <form onSubmit={handleAddSupplier} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  placeholder="Enter country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Score (0-100)
                </label>
                <input
                  type="number"
                  name="complianceScore"
                  value={formData.complianceScore}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  placeholder="Enter compliance score"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                >
                  <option value="active">Active</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Audit Date</label>
                <input
                  type="date"
                  name="last_audit"
                  value={formData.last_audit || ''}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Terms</label>
                <textarea
                  name="contract_terms"
                  value={formData.contract_terms}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  placeholder="Enter contract terms (optional)"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="px-6"
              >
                {formLoading ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default SuppliersPage;