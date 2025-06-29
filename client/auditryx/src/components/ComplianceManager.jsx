import { useState, useEffect } from 'react';
import { Plus, Download, CheckCircle, AlertTriangle, Calendar, FileText, Trash2, Edit3, Award, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

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
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
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

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ComplianceManager = ({ supplier }) => {
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    metric: '',
    date_recorded: new Date().toISOString().split('T')[0],
    result: '',
    status: 'pass'
  });

  // AI Compliance & Insights state  
  const [complianceAnalysis, setComplianceAnalysis] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceError, setComplianceError] = useState(null);

  // Metrics state
  const [metrics, setMetrics] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [metricsRange, setMetricsRange] = useState('ALL');
  const [recordsForTable, setRecordsForTable] = useState([]);

  const metricOptions = [
    'Safety Audit',
    'Quality Score', 
    'Environmental Compliance',
    'Financial Health',
    'Delivery Performance',
    'Labor Standards',
    'Data Security',
    'Product Quality',
    'Sustainability Score'
  ];

  // Fetch compliance records
  const fetchRecords = async () => {
    if (!supplier) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/compliance/supplier/${supplier.id}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
const fetchMetricsData = async () => {
  if (!supplier) return;
  setMetricsLoading(true);
  setMetricsError(null);
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers/${supplier.id}/metrics?range=${metricsRange}`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    const data = await res.json();
    
    console.log('Fetched metrics:', data);
    setMetrics(data.chart || []); // Chart data for LineChart
    setRecordsForTable(data.table || []); // Table data for recent records
  } catch (err) {
    setMetricsError(err.message);
  } finally {
    setMetricsLoading(false);
  }
};
  useEffect(() => {
    fetchRecords();
  }, [supplier]);

  useEffect(() => {
  fetchMetricsData();
}, [supplier, metricsRange]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    const payload = {
      supplier_id: supplier.id,
      metric: formData.metric,
      date_recorded: formData.date_recorded,
      result: parseFloat(formData.result) || null,
      status: formData.status
    };

    const url = editingRecord 
      ? `${import.meta.env.VITE_BACKEND_URL}/compliance/${editingRecord.id}`
      : `${import.meta.env.VITE_BACKEND_URL}/compliance`;
    
    const method = editingRecord ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to save record');
    
    // Reset form and refresh both records and metrics
    setFormData({ metric: '', date_recorded: new Date().toISOString().split('T')[0], result: '', status: 'pass' });
    setShowAddForm(false);
    setEditingRecord(null);
    
    // Refresh both records and metrics data
    await Promise.all([
      fetchRecords(),
      fetchMetricsData()
    ]);
    
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Handle delete
  const handleDelete = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/compliance/${recordId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete record');
      fetchRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      metric: record.metric,
      date_recorded: record.date_recorded,
      result: record.result?.toString() || '',
      status: record.status
    });
    setShowAddForm(true);
  };

  // Download audit report
  const downloadAuditReport = () => {
  const reportData = {
    supplier: supplier.name,
    country: supplier.country,
    generatedDate: new Date().toISOString().split('T')[0],
    records: records,
    summary: {
      totalRecords: records.length,
      passRate: records.length > 0 ? (records.filter(r => r.status === 'pass').length / records.length * 100).toFixed(1) : 0,
      averageScore: records.length > 0 ? (records.reduce((sum, r) => sum + (r.result || 0), 0) / records.length).toFixed(1) : 0
    }
  };

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Compliance Report: ${reportData.supplier}`, 10, 15);
  doc.setFontSize(12);
  doc.text(`Country: ${reportData.country}`, 10, 25);
  doc.text(`Generated: ${reportData.generatedDate}`, 10, 32);
  doc.text(`Total Records: ${reportData.summary.totalRecords}`, 10, 40);
  doc.text(`Pass Rate: ${reportData.summary.passRate}%`, 10, 47);
  doc.text(`Average Score: ${reportData.summary.averageScore}%`, 10, 54);

  doc.setFontSize(14);
  doc.text('Records:', 10, 65);
  doc.setFontSize(10);

  let y = 72;
  records.forEach((r, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(
      `${i + 1}. ${r.metric} | Score: ${r.result ?? 'N/A'} | Status: ${r.status} | Date: ${new Date(r.date_recorded).toLocaleDateString()}`,
      10, y
    );
    y += 7;
  });

  doc.save(`${supplier.name}_compliance_report_${reportData.generatedDate}.pdf`);
};

  // Fetch compliance analysis
  const fetchComplianceAnalysis = async () => {
    if (!supplier) return;
    setComplianceLoading(true);
    setComplianceError(null);
    setComplianceAnalysis(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers/check-compliance/${supplier.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier_id: supplier.id }),
      });
      if (!res.ok) throw new Error('Failed to fetch compliance analysis');
      const data = await res.json();
      const formattedAnalysis = formatAnalysisForDisplay(data.analysis);
        setComplianceAnalysis(formattedAnalysis);
        
    } catch (err) {
        setComplianceError(err.message);
    } finally {
        setComplianceLoading(false);
    }
};

const formatAnalysisForDisplay = (analysis) => {
    // If analysis is already structured (from backend formatting), return as-is
    if (typeof analysis === 'object' && analysis.summary) {
        return analysis;
    }
    
    // Otherwise, do basic text formatting
    return {
        raw_text: analysis,
        formatted_html: analysis
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
    };
};
  const tabs = [
    { id: 'records', label: 'Compliance Records', icon: FileText },
    { id: 'add', label: 'Add Record', icon: Plus },
    { id: 'metrics', label: 'Performance Metrics', icon: TrendingUp },
    { id: 'analysis', label: 'AI Analysis', icon: Award }
  ];

  // Add Record Form Component
  const AddRecordForm = () => (
    <div className="max-w-2xl mx-auto mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {editingRecord ? 'Edit Compliance Record' : 'Add New Compliance Record'}
        </h3>
        <p className="text-gray-600">
          {editingRecord ? 'Update the compliance record details' : 'Record a new compliance metric for this supplier'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric Type *
            </label>
            <select
              value={formData.metric}
              onChange={(e) => setFormData({...formData, metric: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a metric</option>
              {metricOptions.map(metric => (
                <option key={metric} value={metric}>{metric}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Recorded *
            </label>
           <input
  type="date"
  value={formData.date_recorded || ''}
  onChange={e => setFormData(f => ({ ...f, date_recorded: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  required
/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Score (%)
  </label>
 <input
  type="text"
  value={formData.result}
  onChange={e => {
    const v = e.target.value;
    // Allow only numbers and decimal with proper validation
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setFormData(f => ({ ...f, result: v }));
    }
  }}
  onBlur={e => {
    let v = e.target.value;
    if (v === '') return;
    
    // Handle trailing decimal point
    if (v.endsWith('.')) v = v.slice(0, -1);
    
    // Parse and clamp value
    let num = parseFloat(v);
    if (isNaN(num)) {
      setFormData(f => ({ ...f, result: '' }));
    } else {
      num = Math.max(0, Math.min(100, num));
      setFormData(f => ({ ...f, result: num.toString() }));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="Enter score (0-100)"
/>
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="pass"
                  checked={formData.status === 'pass'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mr-2"
                />
                <span className="text-green-700">Pass</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="fail"
                  checked={formData.status === 'fail'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mr-2"
                />
                <span className="text-red-700">Fail</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setShowAddForm(false);
              setEditingRecord(null);
              setFormData({ metric: '', date_recorded: new Date().toISOString().split('T')[0], result: '', status: 'pass' });
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center space-y-3 sm:space-y-0">
        <div className="text-left w-full">
          <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
          <p className="text-gray-600 mt-1">Manage compliance records and generate audit reports</p>
        </div>
        <Button onClick={downloadAuditReport} variant="outline" className="w-full sm:w-auto min-w-[220px]">
          <Download className="w-4 h-4 mr-2" />
          Download Audit Report
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
          {/* Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-6">

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Compliance Records ({records.length})
                </h3>
                <Button onClick={() => { setActiveTab('add'); setShowAddForm(true); }} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>

              {/* No add form in this tab; handled in Add tab */}

              {loading && (
                <div className="text-center py-8 text-gray-500">Loading records...</div>
              )}

              {!loading && records.length === 0 && !showAddForm && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first compliance record</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                </div>
              )}

              {!loading && records.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="text-sm font-medium text-gray-900">{record.metric}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="text-sm text-gray-900">
                              {record.result ? `${record.result}%` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <Badge variant={record.status === 'pass' ? 'success' : 'danger'}>
                              {record.status === 'pass' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                              )}
                              {record.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(record.date_recorded).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Add Record Tab */}
          {activeTab === 'add' && <AddRecordForm />}

          {/* Performance Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-8">
              {metricsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{metricsError}</span>
                  </div>
                </div>
              )}

              {metricsLoading && (
                <div className="text-center py-8 text-gray-500">Loading metrics...</div>
              )}

              {!metricsLoading && metrics.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics available</h3>
                  <p className="text-gray-600 mb-4">Add some compliance records to see performance trends</p>
                </div>
              )}

              {!metricsLoading && metrics.length > 0 && (
                <>
                  {/* Performance Chart */}
                  <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Performance Trend</h3>
                    <div className="flex space-x-2">
                      <button
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${metricsRange === '6M' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setMetricsRange('6M')}
                        disabled={metricsLoading}
                      >
                        6M
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${metricsRange === '1Y' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setMetricsRange('1Y')}
                        disabled={metricsLoading}
                      >
                        1Y
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${metricsRange === 'ALL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setMetricsRange('ALL')}
                        disabled={metricsLoading}
                      >
                        All
                      </button>
                    </div>
                  </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={metrics}>
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
                            {recordsForTable.map((metric) => (
                              <tr key={metric.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                  <div className="text-sm font-medium text-gray-900">{metric.metricName || metric.metric}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                  <div className="text-sm text-gray-900 font-semibold">
                                    {metric.value || metric.result ? `${metric.value || metric.result}%` : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                  <Badge variant={metric.status === 'pass' ? 'success' : 'danger'} className="inline-flex items-center">
                                    {metric.status === 'pass' ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                    )}
                                    {metric.status.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                                  {metric.date || new Date(metric.date_recorded).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate text-left">
                                  {metric.notes || 'No notes'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Compliance Analysis</h3>
                  <p className="text-gray-600 mt-1">Get AI-powered insights on compliance performance</p>
                </div>
                <Button onClick={fetchComplianceAnalysis} disabled={complianceLoading}>
                  <Award className="w-4 h-4 mr-2" />
                  {complianceLoading ? 'Analyzing...' : 'Run Analysis'}
                </Button>
              </div>

              {complianceError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{complianceError}</span>
                  </div>
                </div>
              )}

              {complianceAnalysis && (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-blue-600 mr-2" />
                    <h4 className="text-lg font-semibold text-blue-900">Analysis Results</h4>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    {complianceAnalysis.formatted_html ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: complianceAnalysis.formatted_html }} />
                    ) : (
                      <pre className="whitespace-pre-wrap text-gray-800 text-sm font-mono">{typeof complianceAnalysis === 'string' ? complianceAnalysis : JSON.stringify(complianceAnalysis, null, 2)}</pre>
                    )}
                  </div>
                </Card>
              )}

              {!complianceAnalysis && !complianceLoading && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis available</h3>
                  <p className="text-gray-600 mb-4">Click "Run Analysis" to get AI-powered compliance insights</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ComplianceManager;