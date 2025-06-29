import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../App.jsx';
import {Plus, BarChart3, AlertTriangle, CheckCircle, MapPin, TrendingUp, TrendingDown, Edit, FileText, Target, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const SupplierDetailPage = () => {
  const { selectedSupplier, setCurrentPage } = useApp();
  const { id: paramId } = useParams();
  const [supplier, setSupplier] = useState(selectedSupplier || null);
  const [activeTab, setActiveTab] = useState('metrics');
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metricName: '',
    value: '',
    status: 'pass',
    notes: ''
  });
  const [metrics, setMetrics] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  // Fetch supplier if not in context
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

  // Fetch metrics when supplier is available
  useEffect(() => {
    if (!supplier) return;
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers/${supplier.id}/metrics`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setMetricsError(err.message);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, [supplier]);

  if (supplierLoading) {
    return <div className="p-6 text-center text-gray-500">Loading supplier...</div>;
  }
  if (supplierError) {
    return <div className="p-6 text-center text-red-500">{supplierError}</div>;
  }
  if (!supplier) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No supplier selected</h3>
          <Button onClick={() => setCurrentPage('suppliers')}>
            Back to Suppliers
          </Button>
        </Card>
      </div>
    );
  }
  
  const supplierMetrics = metrics;
  const metricsData = supplierMetrics.map((metric, index) => ({
    month: metric.month || `Month ${index + 1}`,
    value: metric.value
  }));
  
  const handleAddMetric = (e) => {
    e.preventDefault();
    // Mock API call
    console.log('Adding metric:', newMetric);
    setShowAddMetric(false);
    setNewMetric({ metricName: '', value: '', status: 'pass', notes: '' });
  };
  
  const tabs = [
    { id: 'metrics', label: 'Metrics History', icon: BarChart3 },
    { id: 'add-metric', label: 'Add New Record', icon: Plus },
    { id: 'insights', label: 'AI Insights', icon: Target }
  ];
  
 return (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
    <Header />
    
    {/* Main Container with proper spacing */}
    <div className="px-6 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage('suppliers')}
              className="flex items-center px-4 py-2"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <p className="text-gray-600 mt-1">Supplier Details & Analytics</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" className="w-full sm:w-auto px-6 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="w-full sm:w-auto px-6 py-2">
              <Edit className="w-4 h-4 mr-2" />
              Edit Supplier
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Compliance Score</p>
              <p className="text-3xl font-bold text-blue-900">
                {supplier.compliance_score ?? supplier.complianceScore ?? 0}%
              </p>
            </div>
            {supplier.compliance_score >= 90 ? (
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
              <p className="text-xl font-bold text-green-900 capitalize">
                {supplier.risk_level || supplier.riskLevel || 'Medium'}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Last Audit</p>
              <p className="text-sm font-semibold text-purple-900">
                {supplier.last_audit ? new Date(supplier.last_audit).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Status</p>
              <p className="text-lg font-bold text-orange-900 capitalize">
                {supplier.status || 'Active'}
              </p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-gray-900 font-medium mt-1">{supplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-gray-900 mt-1">{supplier.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Email</label>
                  <p className="text-gray-900 mt-1">{supplier.contactEmail || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contract Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Terms</label>
                  <div className="mt-2 bg-white rounded-lg p-4 border">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {typeof supplier.contract_terms === 'object' 
                        ? JSON.stringify(supplier.contract_terms, null, 2) 
                        : supplier.contract_terms || 'No contract terms available'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabbed Content */}
      <Card className="overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-8 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg -mb-px'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-8">
          {/* Metrics History Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              {/* Performance Chart */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Performance Trend</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">6M</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">1Y</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">All</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#2563eb', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Recent Metrics Table */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Compliance Records</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Records
                  </Button>
                </div>
                
                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {supplierMetrics.map((metric) => (
                          <tr key={metric.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{metric.metricName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-semibold">{metric.value}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={metric.status === 'pass' ? 'success' : 'danger'} className="inline-flex items-center">
                                {metric.status === 'pass' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                )}
                                {metric.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {metric.date}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {metric.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add New Record Tab */}
          {activeTab === 'add-metric' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Add New Compliance Record</h3>
                <p className="text-gray-600">Track new metrics and compliance data for {supplier.name}</p>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <form onSubmit={handleAddMetric} className="space-y-8">
                  
                  {/* Metric Selection & Value */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Metric Type
                      </label>
                      <select
                        value={newMetric.metricName}
                        onChange={(e) => setNewMetric({...newMetric, metricName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      >
                        <option value="">Select a metric type</option>
                        <option value="Safety Audit">🛡️ Safety Audit</option>
                        <option value="Quality Score">⭐ Quality Score</option>
                        <option value="Environmental Compliance">🌱 Environmental Compliance</option>
                        <option value="Financial Health">💰 Financial Health</option>
                        <option value="Delivery Performance">🚚 Delivery Performance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Score (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newMetric.value}
                        onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Enter score (0-100)"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Compliance Status
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="pass"
                          checked={newMetric.status === 'pass'}
                          onChange={(e) => setNewMetric({...newMetric, status: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                          newMetric.status === 'pass' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-300 bg-white text-gray-600'
                        }`}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Pass</span>
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="fail"
                          checked={newMetric.status === 'fail'}
                          onChange={(e) => setNewMetric({...newMetric, status: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                          newMetric.status === 'fail' 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 bg-white text-gray-600'
                        }`}>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Fail</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Additional Notes
                    </label>
                    <textarea
                      value={newMetric.notes}
                      onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Add any additional notes, observations, or recommendations..."
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <Button type="submit" className="px-8 py-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Compliance Record
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setNewMetric({ metricName: '', value: '', status: 'pass', notes: '' })}
                      className="px-8 py-3"
                    >
                      Reset Form
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
          
          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">Advanced analytics and recommendations for {supplier.name}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Risk Assessment */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <Target className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Risk Assessment</h4>
                      <p className="text-blue-800 text-sm leading-relaxed mb-4">
                        Based on recent performance data, {supplier.name} shows <strong>{supplier.riskLevel}</strong> risk level. 
                        The compliance score of <strong>{supplier.complianceScore}%</strong> indicates {supplier.complianceScore >= 85 ? 'strong' : 'moderate'} performance.
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${supplier.complianceScore >= 85 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-xs font-medium text-blue-700">
                          {supplier.complianceScore >= 85 ? 'Low Risk' : 'Medium Risk'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Recommendations */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-200 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Smart Recommendations</h4>
                      <ul className="text-green-800 text-sm space-y-2 leading-relaxed">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Schedule quarterly safety reviews to maintain high standards
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Consider extending contract terms given strong performance
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Implement automated monitoring for key compliance metrics
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Action Items */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-orange-900 mb-3">Priority Action Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">HIGH</span>
                          <span className="text-xs text-gray-500">Due: 30 days</span>
                        </div>
                        <p className="text-sm text-gray-800">Follow up on environmental compliance documentation</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">MEDIUM</span>
                          <span className="text-xs text-gray-500">Due: 60 days</span>
                        </div>
                        <p className="text-sm text-gray-800">Schedule next comprehensive audit</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">LOW</span>
                          <span className="text-xs text-gray-500">Due: 90 days</span>
                        </div>
                        <p className="text-sm text-gray-800">Review contract renewal terms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Generate Report Button */}
              <div className="text-center pt-4">
                <Button size="lg" className="px-8 py-3">
                  <FileText className="w-5 h-5 mr-2" />
                  Generate Comprehensive AI Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  </div>
);
};

export default SupplierDetailPage;