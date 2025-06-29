
import { useState } from 'react';
import { Upload, CheckCircle, ArrowRight } from 'lucide-react';
import Header from './Header.jsx';

// Add Tailwind CSS
const style = document.createElement('link');
style.href = 'https://cdn.tailwindcss.com';
style.rel = 'stylesheet';
if (!document.head.querySelector('link[href="https://cdn.tailwindcss.com"]')) {
  document.head.appendChild(style);
}

// Mock useApp hook since we don't have the actual App context
const useApp = () => ({
  setCurrentPage: (page) => console.log(`Navigate to ${page}`)
});

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ variant = 'primary', size = 'md', children, className = '', as, ...props }) => {
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
  
  const Component = as || 'button';
  
  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

const BulkImportPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importStep, setImportStep] = useState('upload');
  const [columnMapping, setColumnMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setImportStep('mapping');
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setImportStep('mapping');
    }
  };
  
  // Columns expected from the CSV/Excel file
  const mockCsvColumns = [
    'Supplier Name',
    'Country',
    'Email',
    'Phone',
    'Contract Start',
    'Contract End',
    'Contract Terms',
    'Last Audit',
    'Risk Level',
    'Compliance Score'
  ];

  // Required fields for backend supplier creation
  // Use backend snake_case field names
  const requiredFields = [
    'name',
    'country',
    'contact_email',
    'contract_start',
    'contract_end',
    'contract_terms',
    'last_audit',
    'risk_level',
    'compliance_score'
  ];
  
  const handleMapping = () => {
    // Validate that all required fields are mapped
    const missingMappings = requiredFields.filter(field => !columnMapping[field]);
    if (missingMappings.length > 0) {
      alert(`Please map all required fields: ${missingMappings.join(', ')}`);
      return;
    }
    // For demo: mock preview data with all required fields
    setPreviewData([
      {
        'Supplier Name': 'Tech Solutions Ltd',
        'Country': 'Canada',
        'Email': 'contact@techsolutions.ca',
        'Phone': '+1-416-555-0123',
        'Contract Start': '2024-01-01',
        'Contract End': '2026-01-01',
        'Contract Terms': 'Net 30',
        'Last Audit': '2025-06-01',
        'Risk Level': 'Low',
        'Compliance Score': 95
      },
      {
        'Supplier Name': 'Euro Manufacturing',
        'Country': 'France',
        'Email': 'info@euromanuf.fr',
        'Phone': '+33-1-23-45-67-89',
        'Contract Start': '2024-02-15',
        'Contract End': '2025-02-15',
        'Contract Terms': 'Net 60',
        'Last Audit': '2025-05-15',
        'Risk Level': 'Medium',
        'Compliance Score': 88
      },
      {
        'Supplier Name': 'Asia Pacific Corp',
        'Country': 'Japan',
        'Email': 'sales@asiapacific.jp',
        'Phone': '+81-3-1234-5678',
        'Contract Start': '2024-03-01',
        'Contract End': '2027-03-01',
        'Contract Terms': 'Net 45',
        'Last Audit': '2025-04-20',
        'Risk Level': 'High',
        'Compliance Score': 72
      }
    ]);
    setImportStep('preview');
  };
  
  // Helper: map preview row to backend payload (snake_case)
  const mapRowToPayload = (row) => {
    return {
      name: row[columnMapping['name']],
      country: row[columnMapping['country']],
      contact_email: row[columnMapping['contact_email']],
      contract_start: row[columnMapping['contract_start']],
      contract_end: row[columnMapping['contract_end']],
      contract_terms: row[columnMapping['contract_terms']],
      last_audit: row[columnMapping['last_audit']],
      risk_level: row[columnMapping['risk_level']],
      compliance_score: row[columnMapping['compliance_score']],
      phone: row[columnMapping['phone']] || ''
    };
  };

  // Helper: get user id from localStorage or context (update as needed)
  const getUserId = () => {
    // Replace with real user context if available
    return localStorage.getItem('user_id') || 'demo-user';
  };

  const handleImport = async () => {
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;
    for (const row of previewData) {
      const payload = mapRowToPayload(row);
      try {
        const res = await fetch('http://localhost:8000/suppliers/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': getUserId()
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }
    setIsImporting(false);
    setImportStep('complete');
  };
  
  const resetImport = () => {
    setUploadedFile(null);
    setImportStep('upload');
    setColumnMapping({});
    setPreviewData([]);
    setIsImporting(false);
  };

  const { setCurrentPage } = useApp();

  const getStepIndex = (step) => ['upload', 'mapping', 'preview', 'complete'].indexOf(step);
  const currentStepIndex = getStepIndex(importStep);
  
  return (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
    <Header />
    
    {/* Main Container with proper spacing */}
    <div className="px-6 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Import</h1>
          <Button variant="outline" onClick={resetImport}>
            <Upload className="w-4 h-4 mr-2" />
            Start New Import
          </Button>
        </div>
      </div>
      
      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          {['upload', 'mapping', 'preview', 'complete'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                importStep === step ? 'bg-blue-600 text-white' : 
                currentStepIndex > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStepIndex > index ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-24 h-1 mx-3 ${
                  currentStepIndex > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600 px-2">
          <span>Upload File</span>
          <span>Map Columns</span>
          <span>Preview</span>
          <span>Complete</span>
        </div>
      </Card>
      
      {/* Upload Step */}
      {importStep === 'upload' && (
        <Card className="p-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Supplier Data</h2>
            <p className="text-gray-600 mb-10">Upload a CSV or Excel file containing supplier information</p>
            
            <div
              className={`border-2 border-dashed rounded-xl p-16 transition-colors mb-10 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl font-medium text-gray-900 mb-3">
                Drop your file here, or click to browse
              </p>
              <p className="text-gray-500 mb-8">Supports CSV, XLSX files up to 10MB</p>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button as="span" className="cursor-pointer px-8 py-3">
                  Choose File
                </Button>
              </label>
            </div>
            
            <div className="text-left max-w-3xl mx-auto bg-gray-50 rounded-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Required Columns:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Supplier Name</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Country</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Contact Email</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Contract Start</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Contract End</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Contract Terms</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Last Audit</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Risk Level</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Compliance Score</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>Phone (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Column Mapping Step */}
      {importStep === 'mapping' && uploadedFile && (
        <Card className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Map Columns</h2>
            <p className="text-gray-600 mb-8">
              Map the columns from your file ({uploadedFile.name}) to the required fields
            </p>
            
            <div className="space-y-6 bg-gray-50 rounded-lg p-6 mb-8">
              {requiredFields.map((field) => (
                <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <div>
                    <select
                      value={columnMapping[field] || ''}
                      onChange={(e) => setColumnMapping({...columnMapping, [field]: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select column...</option>
                      {mockCsvColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={handleMapping} className="px-8 py-3">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue to Preview
              </Button>
              <Button variant="outline" onClick={resetImport} className="px-8 py-3">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Preview Step */}
      {importStep === 'preview' && (
        <Card className="p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Preview Import Data</h2>
            <p className="text-gray-600 mb-8">
              Review the data below before importing. {previewData.length} suppliers will be imported.
            </p>
            
            <div className="overflow-x-auto mb-8 border rounded-xl shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th key={key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={handleImport} disabled={isImporting} className="px-8 py-3">
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {previewData.length} Suppliers
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setImportStep('mapping')} disabled={isImporting} className="px-8 py-3">
                Back to Mapping
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Complete Step */}
      {importStep === 'complete' && (
        <Card className="p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Import Complete!</h2>
            <p className="text-gray-600 mb-10 text-lg">
              Successfully imported {previewData.length} suppliers. You can now view and manage them in the suppliers section.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={() => setCurrentPage('suppliers')} className="px-8 py-3">
                View Suppliers
              </Button>
              <Button variant="outline" onClick={resetImport} className="px-8 py-3">
                Import More Data
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  </div>
);
};

export default BulkImportPage;