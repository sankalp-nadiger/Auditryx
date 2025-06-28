import { useState } from 'react';
import { useApp } from '../App.jsx'; 
import {Plus, BarChart3, AlertTriangle, CheckCircle, MapPin, TrendingUp, TrendingDown, Edit, FileText, Target, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [activeTab, setActiveTab] = useState('metrics');
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metricName: '',
    value: '',
    status: 'pass',
    notes: ''
  });
  
  if (!selectedSupplier) {
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
  
  const supplierMetrics = mockMetrics.filter(m => m.supplierId === selectedSupplier.id);
  const metricsData = supplierMetrics.map((metric, index) => ({
    month: `Month ${index + 1}`,
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage('suppliers')}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Supplier
          </Button>
        </div>
      </div>
      
      {/* Supplier Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
            <p className="text-sm text-gray-900">{selectedSupplier.contactEmail}</p>
            <p className="text-sm text-gray-900">{selectedSupplier.phone}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-900">{selectedSupplier.country}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contract Period</h3>
            <p className="text-sm text-gray-900">
              {selectedSupplier.contractStart} - {selectedSupplier.contractEnd}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Compliance Score</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${selectedSupplier.complianceScore >= 90 ? 'text-green-600' : selectedSupplier.complianceScore >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                {selectedSupplier.complianceScore}%
              </span>
              {selectedSupplier.complianceScore >= 90 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
        
        {/* Certifications */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSupplier.certifications.map((cert, index) => (
              <Badge key={index} variant="info">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
        
        <div className="p-6">
          {/* Metrics History Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Metrics Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {supplierMetrics.map((metric) => (
                        <tr key={metric.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.metricName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {metric.value}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={metric.status === 'pass' ? 'success' : 'danger'}>
                              {metric.status === 'pass' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                              )}
                              {metric.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {metric.date}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {metric.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Add New Record Tab */}
          {activeTab === 'add-metric' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Compliance Record</h3>
              
              <form onSubmit={handleAddMetric} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metric Name
                    </label>
                    <select
                      value={newMetric.metricName}
                      onChange={(e) => setNewMetric({...newMetric, metricName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a metric</option>
                      <option value="Safety Audit">Safety Audit</option>
                      <option value="Quality Score">Quality Score</option>
                      <option value="Environmental Compliance">Environmental Compliance</option>
                      <option value="Financial Health">Financial Health</option>
                      <option value="Delivery Performance">Delivery Performance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="85"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="pass"
                        checked={newMetric.status === 'pass'}
                        onChange={(e) => setNewMetric({...newMetric, status: e.target.value})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Pass</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="fail"
                        checked={newMetric.status === 'fail'}
                        onChange={(e) => setNewMetric({...newMetric, status: e.target.value})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Fail</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about this metric..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setNewMetric({ metricName: '', value: '', status: 'pass', notes: '' })}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              
              {/* Risk Assessment */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Risk Assessment</h4>
                    <p className="text-blue-800 text-sm">
                      Based on recent performance data, {selectedSupplier.name} shows {selectedSupplier.riskLevel} risk level. 
                      The compliance score of {selectedSupplier.complianceScore}% indicates {selectedSupplier.complianceScore >= 85 ? 'strong' : 'moderate'} performance.
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Recommendations */}
              <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Recommendations</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Schedule quarterly safety reviews to maintain high standards</li>
                      <li>• Consider extending contract terms given strong performance</li>
                      <li>• Implement automated monitoring for key compliance metrics</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              {/* Action Items */}
              <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-2">Action Items</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Follow up on environmental compliance documentation</li>
                      <li>• Schedule next audit within 60 days</li>
                      <li>• Review contract renewal terms before expiration</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Full Report
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SupplierDetailPage;