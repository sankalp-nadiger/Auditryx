import { Download, Users, Target, AlertTriangle, Shield } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from 'recharts';
import Badge from './Badge.jsx';

const mockSuppliers = [
  // ...existing mock data...
];

const mockMetrics = [
  // ...existing mock data...
];

const mockTimeSeriesData = [
  // ...existing mock data...
];

const mockRiskDistribution = [
  // ...existing mock data...
];

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

const DashboardPage = () => {
  const totalSuppliers = mockSuppliers.length;
  const avgScore = Math.round(mockSuppliers.reduce((sum, s) => sum + s.complianceScore, 0) / totalSuppliers);
  const failedMetrics = mockMetrics.filter(m => m.status === 'fail').length;
  const riskSuppliers = mockSuppliers.filter(s => s.riskLevel === 'high').length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Metrics</p>
              <p className="text-2xl font-bold text-gray-900">{failedMetrics}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{riskSuppliers}</p>
            </div>
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockRiskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {mockRiskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {mockMetrics.slice(0, 5).map((metric) => {
            const supplier = mockSuppliers.find(s => s.id === metric.supplierId);
            return (
              <div key={metric.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{supplier?.name}</p>
                  <p className="text-sm text-gray-600">{metric.metricName}: {metric.value}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={metric.status === 'pass' ? 'success' : 'danger'}>
                    {metric.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{metric.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;