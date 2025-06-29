import { useState } from 'react';
import { Upload, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Header from './ui/Header.jsx';

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
  const [extractedColumns, setExtractedColumns] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const processFile = async (file) => {
    setIsProcessingFile(true);
    setFileError(null);
    
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Only support CSV and Excel files
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        setFileError('Only CSV and Excel files (.csv, .xlsx, .xls) are supported');
        setIsProcessingFile(false);
        return;
      }
      
      if (fileExtension === 'csv') {
        // Process CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setFileError('Error parsing CSV file: ' + results.errors[0].message);
              setIsProcessingFile(false);
              return;
            }
            
            const columns = Object.keys(results.data[0] || {}).map(col => col.trim());
            setExtractedColumns(columns);
            setFileData(results.data);
            setImportStep('mapping');
            setIsProcessingFile(false);
          },
          error: (error) => {
            setFileError('Error reading CSV file: ' + error.message);
            setIsProcessingFile(false);
          }
        });
      } else {
        // Process Excel file
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
              setFileError('Excel file must contain at least a header row and one data row');
              setIsProcessingFile(false);
              return;
            }
            
            const headers = jsonData[0].map(col => String(col || '').trim()).filter(col => col);
            const dataRows = jsonData.slice(1).map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            }).filter(row => Object.values(row).some(val => val !== ''));
            
            setExtractedColumns(headers);
            setFileData(dataRows);
            setImportStep('mapping');
            setIsProcessingFile(false);
          } catch (error) {
            setFileError('Error reading Excel file: ' + error.message);
            setIsProcessingFile(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      setFileError('Error processing file: ' + error.message);
      setIsProcessingFile(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      processFile(file);
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      processFile(file);
    }
  };

  const requiredFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'country', label: 'Country', required: true },
    { key: 'city', label: 'City', required: false },
    { key: 'contract_terms', label: 'Contract Terms', required: true },
    { key: 'risk_level', label: 'Risk Level', required: true },
    { key: 'compliance_score', label: 'Compliance Score', required: false },
    { key: 'last_audit', label: 'Last Audit', required: false }
  ];
  
  const handleMapping = () => {
    // Validate that all required fields are mapped
    const requiredFieldKeys = requiredFields.filter(field => field.required).map(field => field.key);
    const missingMappings = requiredFieldKeys.filter(field => !columnMapping[field]);
    
    if (missingMappings.length > 0) {
      const missingLabels = missingMappings.map(key => 
        requiredFields.find(field => field.key === key)?.label || key
      );
      alert(`Please map all required fields: ${missingLabels.join(', ')}`);
      return;
    }
    
    // Generate preview data using actual file data and column mapping
    const mappedPreviewData = fileData.slice(0, 10).map(row => {
      const mappedRow = {};
      requiredFields.forEach(field => {
        const mappedColumn = columnMapping[field.key];
        if (mappedColumn) {
          mappedRow[field.label] = row[mappedColumn] || '';
        }
      });
      return mappedRow;
    });
    
    setPreviewData(mappedPreviewData);
    setImportStep('preview');
  };
  
  // Helper: map preview row to backend payload (snake_case)
  const mapRowToPayload = (row, originalRow) => {
    const payload = {};
    requiredFields.forEach(field => {
      const mappedColumn = columnMapping[field.key];
      if (mappedColumn && originalRow[mappedColumn]) {
        payload[field.key] = originalRow[mappedColumn];
      }
    });
    return payload;
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
    
    for (const originalRow of fileData) {
      const payload = mapRowToPayload(null, originalRow);
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
    setExtractedColumns([]);
    setFileData([]);
    setFileError(null);
    setIsProcessingFile(false);
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
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Bulk Import</h1>
      </div>
      
      {/* Progress Steps */}
      <Card className="p-6">
       <div className="flex items-center justify-between mb-2">
 {['upload', 'mapping', 'preview', 'complete'].map((step, index, arr) => (
   <div key={step} className="flex-1 flex flex-col items-center relative">
     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 mx-auto z-10 relative ${
       importStep === step ? 'bg-blue-600 text-white' : 
       currentStepIndex > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
     }`}>
       {currentStepIndex > index ? (
         <CheckCircle className="w-5 h-5" />
       ) : (
         index + 1
       )}
     </div>
     {/* Line to next step */}
     {index < arr.length - 1 && (
       <div className="absolute top-5 left-1/2 w-full h-0.5 z-0" style={{right: '-50%', left: '50%'}}>
         <div className={`h-0.5 w-full ${currentStepIndex > index ? 'bg-green-600' : 'bg-gray-200'}`}></div>
       </div>
     )}
   </div>
 ))}
</div>
        <div className="flex text-sm text-gray-600 px-2">
          {['Upload File', 'Map Columns', 'Preview', 'Complete'].map((label, idx) => (
            <div key={label} className="flex-1 text-center">{label}</div>
          ))}
        </div>
      </Card>
      
      {/* Upload Step */}
      {importStep === 'upload' && (
        <Card className="p-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Supplier Data</h2>
            <p className="text-gray-600 mb-10">Upload a CSV or Excel file containing supplier information. Only CSV and Excel files are supported.</p>
            
            {fileError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
            
            <div
              className={`border-2 border-dashed rounded-xl p-16 transition-colors mb-10 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isProcessingFile ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                  <p className="text-xl font-medium text-gray-900 mb-3">Processing file...</p>
                  <p className="text-gray-500">Please wait while we extract column information</p>
                </div>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <p className="text-xl font-medium text-gray-900 mb-3">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-gray-500 mb-8">Supports CSV, XLSX, XLS files up to 10MB</p>
                  
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
                </>
              )}
            </div>
            
            <div className="text-left max-w-3xl mx-auto bg-gray-50 rounded-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Required Columns:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <ul className="space-y-3 text-gray-600">
                    {requiredFields.filter((_, index) => index < Math.ceil(requiredFields.length / 2)).map((field) => (
                      <li key={field.key} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-3 ${field.required ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                        {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3 text-gray-600">
                    {requiredFields.filter((_, index) => index >= Math.ceil(requiredFields.length / 2)).map((field) => (
                      <li key={field.key} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-3 ${field.required ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                        {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">* Required fields must be mapped to continue</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Column Mapping Step */}
      {importStep === 'mapping' && uploadedFile && (
        <Card className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Map Columns</h2>
            <p className="text-gray-600 mb-2">
              Map the columns from your file ({uploadedFile.name}) to the required fields
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Found {extractedColumns.length} columns and {fileData.length} rows in your file
            </p>
            
            <div className="space-y-6 bg-gray-50 rounded-lg p-6 mb-8">
              {requiredFields.map((field) => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.required && (
                      <p className="text-xs text-gray-500 mt-1">Required field</p>
                    )}
                  </div>
                  <div>
                    <select
                      value={columnMapping[field.key] || ''}
                      onChange={(e) => setColumnMapping({...columnMapping, [field.key]: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select column...</option>
                      {extractedColumns.map((col) => (
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
              Review the data below before importing. {fileData.length} suppliers will be imported. 
              {previewData.length < fileData.length && ` (Showing first ${previewData.length} for preview)`}
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
                          {value || <span className="text-gray-400 italic">empty</span>}
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
                    Import {fileData.length} Suppliers
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
              Successfully imported {fileData.length} suppliers. You can now view and manage them in the suppliers section.
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