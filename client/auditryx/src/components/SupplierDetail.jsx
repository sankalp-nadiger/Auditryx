import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Edit, FileText, ArrowLeft } from 'lucide-react';
import Header from './ui/Header.jsx';
import ComplianceManager from './ComplianceManager.jsx';

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
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
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

const SupplierDetailPage = () => {
  const { selectedSupplier, setCurrentPage } = useApp();
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(selectedSupplier || null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (supplier || !paramId) return;
    setSupplierLoading(true);
    setSupplierError(null);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers/${paramId}`)
      .then(res => {
        if (!res.ok) throw new Error('Supplier not found');
        return res.json();
      })
      .then(data => setSupplier(data))
      .catch(err => setSupplierError(err.message))
      .finally(() => setSupplierLoading(false));
  }, [paramId, supplier]);

  // When entering edit mode, copy supplier data
  useEffect(() => {
    if (editMode && supplier) {
      setEditedSupplier({ ...supplier });
    }
    if (!editMode) {
      setEditError(null);
    }
  }, [editMode, supplier]);

  const handleBackClick = () => {
    navigate('/suppliers');
    if (setCurrentPage) {
      setCurrentPage('suppliers');
    }
  };

  // Handle field change in edit mode
  const handleFieldChange = (field, value) => {
    setEditedSupplier(prev => ({ ...prev, [field]: value }));
  };

  // Save edited supplier
  const handleSaveEdit = async () => {
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers/${supplier.id || supplier._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSupplier),
      });
      if (!res.ok) throw new Error('Failed to update supplier');
      const updated = await res.json();
      setSupplier(updated);
      setEditMode(false);
    } catch (err) {
      setEditError(err.message || 'Error updating supplier');
    } finally {
      setEditSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedSupplier(null);
    setEditError(null);
  };

  // Export supplier data as JSON
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(supplier, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `supplier_${supplier.id || supplier._id || 'data'}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
  };

  // Extract contract terms properly
  const getContractTerms = () => {
    const terms = supplier?.contract_terms || supplier?.contractTerms;
    if (!terms) return 'No contract terms available';
    
    if (typeof terms === 'string') {
      try {
        const parsed = JSON.parse(terms);
        // If it's an object with a text property, extract that
        if (parsed && typeof parsed === 'object' && parsed.text) {
          return parsed.text;
        }
        // If it's an object, format it nicely
        if (parsed && typeof parsed === 'object') {
          return Object.entries(parsed)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        }
        return String(parsed);
      } catch {
        return terms;
      }
    }
    
    if (typeof terms === 'object') {
      // If it's an object with a text property, extract that
      if (terms.text) {
        return terms.text;
      }
      // Format object as key-value pairs
      return Object.entries(terms)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    
    return String(terms);
  };

  if (supplierLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50">
        <Header />
        <div className="p-6 text-center text-gray-500 mt-20">Loading supplier...</div>
      </div>
    );
  }

  if (supplierError) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50">
        <Header />
        <div className="p-6 text-center text-red-500 mt-20">{supplierError}</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50">
        <Header />
        <div className="p-6 mt-20">
          <Card className="p-12 text-center max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No supplier selected</h3>
            <Button onClick={handleBackClick}>
              Back to Suppliers
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const complianceScore = supplier.compliance_score ?? supplier.complianceScore ?? 0;
  const riskLevel = supplier.risk_level || supplier.riskLevel || 'Medium';
  const lastAudit = supplier.last_audit || supplier.lastAudit;
  const status = supplier.status || 'Active';

  // Use editedSupplier in edit mode, otherwise supplier
  const displaySupplier = editMode && editedSupplier ? editedSupplier : supplier;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
      <Header />
      
      {/* Back Button - Outside main container */}
      <div className="px-6 sm:px-8 lg:px-12 py-4 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Suppliers</span>
        </Button>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              {editMode ? (
                <input
                  className="text-3xl font-bold text-gray-900 bg-gray-100 rounded px-2 py-1 w-full mb-1"
                  value={displaySupplier.name || ''}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  disabled={editSaving}
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{displaySupplier.name}</h1>
              )}
              <p className="text-gray-600 mt-1">Supplier Details & Analytics</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-2" onClick={handleExport}>
                <FileText className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              {editMode ? (
                <>
                  <Button className="w-full sm:w-auto px-6 py-2" onClick={handleSaveEdit} disabled={editSaving}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="secondary" className="w-full sm:w-auto px-6 py-2" onClick={handleCancelEdit} disabled={editSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button className="w-full sm:w-auto px-6 py-2" onClick={() => setEditMode(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Supplier
                </Button>
              )}
              {editError && (
                <span className="text-red-500 text-sm ml-2">{editError}</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Compliance Score</p>
                <p className="text-3xl font-bold text-blue-900">{complianceScore}%</p>
              </div>
              {complianceScore >= 90 ? (
                <TrendingUp className="w-8 h-8 text-blue-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Risk Level</p>
                <p className="text-xl font-bold text-green-900 capitalize">{riskLevel}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Last Audit</p>
                <p className="text-sm font-semibold text-purple-900">
                  {lastAudit ? new Date(lastAudit).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Status</p>
                <p className="text-lg font-bold text-orange-900 capitalize">{status}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Supplier Information Card */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Supplier Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Details</h3>
                <div className="space-y-4">
                  {/* Company Name (already editable in header) */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                    <label className="text-sm font-medium text-gray-600">Company Name</label>
                    {editMode ? (
                      <input
                        className="text-gray-900 font-medium col-span-2 bg-white border rounded px-2 py-1"
                        value={displaySupplier.name || ''}
                        onChange={e => handleFieldChange('name', e.target.value)}
                        disabled={editSaving}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium col-span-2">{displaySupplier.name || 'N/A'}</p>
                    )}
                  </div>
                  {/* Country */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    {editMode ? (
                      <input
                        className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                        value={displaySupplier.country || ''}
                        onChange={e => handleFieldChange('country', e.target.value)}
                        disabled={editSaving}
                      />
                    ) : (
                      <p className="text-gray-900 col-span-2">{displaySupplier.country || 'N/A'}</p>
                    )}
                  </div>
                  {/* City/Town */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                    <label className="text-sm font-medium text-gray-600">City/Town</label>
                    {editMode ? (
                      <input
                        className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                        value={displaySupplier.city || ''}
                        onChange={e => handleFieldChange('city', e.target.value)}
                        disabled={editSaving}
                      />
                    ) : (
                      <p className="text-gray-900 col-span-2">{displaySupplier.city || 'N/A'}</p>
                    )}
                  </div>
                  {/* Contact Email */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                    <label className="text-sm font-medium text-gray-600">Contact Email</label>
                    {editMode ? (
                      <input
                        className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                        value={displaySupplier.contactEmail || displaySupplier.contact_email || ''}
                        onChange={e => handleFieldChange('contactEmail', e.target.value)}
                        disabled={editSaving}
                      />
                    ) : (
                      <p className="text-gray-900 col-span-2 break-all">{displaySupplier.contactEmail || displaySupplier.contact_email || 'N/A'}</p>
                    )}
                  </div>
                  {/* Phone */}
                  {(displaySupplier.phone || editMode) && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      {editMode ? (
                        <input
                          className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                          value={displaySupplier.phone || ''}
                          onChange={e => handleFieldChange('phone', e.target.value)}
                          disabled={editSaving}
                        />
                      ) : (
                        <p className="text-gray-900 col-span-2">{displaySupplier.phone || 'N/A'}</p>
                      )}
                    </div>
                  )}
                  {/* Website */}
                  {(displaySupplier.website || editMode) && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      {editMode ? (
                        <input
                          className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                          value={displaySupplier.website || ''}
                          onChange={e => handleFieldChange('website', e.target.value)}
                          disabled={editSaving}
                        />
                      ) : (
                        <p className="text-gray-900 col-span-2 break-all">{displaySupplier.website || 'N/A'}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contract Details</h3>
                <div className="space-y-4">
                  {/* Contract Terms */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-3">Contract Terms</label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                      {editMode ? (
                        <textarea
                          className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed w-full bg-white border rounded px-2 py-1"
                          value={displaySupplier.contract_terms || displaySupplier.contractTerms || ''}
                          onChange={e => handleFieldChange('contract_terms', e.target.value)}
                          rows={4}
                          disabled={editSaving}
                        />
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {getContractTerms()}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Start Date */}
                  {(displaySupplier.contract_start_date || editMode) && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                      <label className="text-sm font-medium text-gray-600">Start Date</label>
                      {editMode ? (
                        <input
                          type="date"
                          className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                          value={displaySupplier.contract_start_date ? new Date(displaySupplier.contract_start_date).toISOString().slice(0,10) : ''}
                          onChange={e => handleFieldChange('contract_start_date', e.target.value)}
                          disabled={editSaving}
                        />
                      ) : (
                        <p className="text-gray-900 col-span-2">
                          {displaySupplier.contract_start_date ? new Date(displaySupplier.contract_start_date).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  )}
                  {/* End Date */}
                  {(displaySupplier.contract_end_date || editMode) && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
                      <label className="text-sm font-medium text-gray-600">End Date</label>
                      {editMode ? (
                        <input
                          type="date"
                          className="text-gray-900 col-span-2 bg-white border rounded px-2 py-1"
                          value={displaySupplier.contract_end_date ? new Date(displaySupplier.contract_end_date).toISOString().slice(0,10) : ''}
                          onChange={e => handleFieldChange('contract_end_date', e.target.value)}
                          disabled={editSaving}
                        />
                      ) : (
                        <p className="text-gray-900 col-span-2">
                          {displaySupplier.contract_end_date ? new Date(displaySupplier.contract_end_date).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Compliance Manager Section */}
        <ComplianceManager supplier={supplier} />
      </div>
    </div>
  );
};

export default SupplierDetailPage;