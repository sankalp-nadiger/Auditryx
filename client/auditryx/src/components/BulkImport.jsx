import { useState } from 'react';
import { Upload, CheckCircle, ArrowRight } from 'lucide-react';

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
  
  const mockCsvColumns = ['Supplier Name', 'Country', 'Email', 'Phone', 'Contract Start', 'Contract End'];
  const requiredFields = ['name', 'country', 'contactEmail', 'contractStart', 'contractEnd'];
  
  const handleMapping = () => {
    // Validate that all required fields are mapped
    const missingMappings = requiredFields.filter(field => !columnMapping[field]);
    if (missingMappings.length > 0) {
      alert(`Please map all required fields: ${missingMappings.join(', ')}`);
      return;
    }
    
    // Mock preview data
    setPreviewData([
      { 'Supplier Name': 'Tech Solutions Ltd', 'Country': 'Canada', 'Email': 'contact@techsolutions.ca', 'Phone': '+1-416-555-0123', 'Contract Start': '2024-01-01', 'Contract End': '2026-01-01' },
      { 'Supplier Name': 'Euro Manufacturing', 'Country': 'France', 'Email': 'info@euromanuf.fr', 'Phone': '+33-1-23-45-67-89', 'Contract Start': '2024-02-15', 'Contract End': '2025-02-15' },
      { 'Supplier Name': 'Asia Pacific Corp', 'Country': 'Japan', 'Email': 'sales@asiapacific.jp', 'Phone': '+81-3-1234-5678', 'Contract Start': '2024-03-01', 'Contract End': '2027-03-01' }
    ]);
    setImportStep('preview');
  };
  
  const handleImport = () => {
    setIsImporting(true);
    // Mock import process
    setTimeout(() => {
      setIsImporting(false);
      setImportStep('complete');
    }, 2000);
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
        <Button variant="outline" onClick={resetImport}>
          <Upload className="w-4 h-4 mr-2" />
          Start New Import
        </Button>
      </div>
      
      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {['upload', 'mapping', 'preview', 'complete'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                importStep === step ? 'bg-blue-600 text-white' : 
                currentStepIndex > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStepIndex > index ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  currentStepIndex > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Upload File</span>
          <span>Map Columns</span>
          <span>Preview</span>
          <span>Complete</span>
        </div>
      </Card>
      
      {/* Upload Step */}
      {importStep === 'upload' && (
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Supplier Data</h2>
            <p className="text-gray-600 mb-8">Upload a CSV or Excel file containing supplier information</p>
            
            <div
              className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here, or click to browse
              </p>
              <p className="text-gray-500 mb-6">Supports CSV, XLSX files up to 10MB</p>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button as="span" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
            
            <div className="mt-8 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Required Columns:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Supplier Name</li>
                    <li>• Country</li>
                    <li>• Contact Email</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Contract Start Date</li>
                    <li>• Contract End Date</li>
                    <li>• Phone (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Column Mapping Step */}
      {importStep === 'mapping' && uploadedFile && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Map Columns</h2>
          <p className="text-gray-600 mb-6">
            Map the columns from your file ({uploadedFile.name}) to the required fields
          </p>
          
          <div className="space-y-4">
            {requiredFields.map((field) => (
              <div key={field} className="grid grid-cols-2 gap-4 items-center">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          
          <div className="flex space-x-3 mt-8">
            <Button onClick={handleMapping}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Preview
            </Button>
            <Button variant="outline" onClick={resetImport}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
      
      {/* Preview Step */}
      {importStep === 'preview' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Import Data</h2>
          <p className="text-gray-600 mb-6">
            Review the data below before importing. {previewData.length} suppliers will be imported.
          </p>
          
          <div className="overflow-x-auto mb-6 border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
          
          <div className="flex space-x-3">
            <Button onClick={handleImport} disabled={isImporting}>
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
            <Button variant="outline" onClick={() => setImportStep('mapping')} disabled={isImporting}>
              Back to Mapping
            </Button>
          </div>
        </Card>
      )}
      
      {/* Complete Step */}
      {importStep === 'complete' && (
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Import Complete!</h2>
          <p className="text-gray-600 mb-8">
            Successfully imported {previewData.length} suppliers. You can now view and manage them in the suppliers section.
          </p>
          
          <div className="flex justify-center space-x-3">
            <Button onClick={() => setCurrentPage('suppliers')}>
              View Suppliers
            </Button>
            <Button variant="outline" onClick={resetImport}>
              Import More Data
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BulkImportPage;