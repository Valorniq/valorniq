import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, 
  FileUp, Settings, Eye, Play, History, X, Download 
} from 'lucide-react';

interface ImportWizardProps {
  moduleType: string;
  onClose: () => void;
  onImportComplete?: (jobId: string) => void;
}

type WizardStep = 'upload' | 'fieldmap' | 'preview' | 'execute' | 'complete';

interface FileData {
  file: File | null;
  content: string;
  importType: 'csv' | 'json';
  records: any[];
}

export default function ImportWizard({ moduleType, onClose, onImportComplete }: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [fileData, setFileData] = useState<FileData>({ file: null, content: '', importType: 'csv', records: [] });
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importJob, setImportJob] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine import type from file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const importType = ext === 'json' ? 'json' : 'csv';

    const content = await file.text();
    
    setFileData({
      file,
      content,
      importType: importType as 'csv' | 'json',
      records: parseFile(content, importType as 'csv' | 'json')
    });
    
    setError('');
  };

  const parseFile = (content: string, type: 'csv' | 'json'): any[] => {
    try {
      if (type === 'json') {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [data];
      } else {
        // Simple CSV parsing
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, idx) => {
            obj[header] = values[idx] || '';
            return obj;
          }, {} as Record<string, string>);
        });
      }
    } catch (e) {
      setError(`Failed to parse file: ${e}`);
      return [];
    }
  };

  const handleFieldMapComplete = () => {
    if (Object.keys(fieldMapping).length === 0) {
      setError('Please map at least one field');
      return;
    }
    setStep('preview');
  };

  const handlePreviewImport = async () => {
    if (!fileData.file) return;
    
    setIsLoading(true);
    try {
      // Call backend preview endpoint
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('import_type', fileData.importType);
      formData.append('source_type', moduleType.toLowerCase());

      const response = await fetch(`http://localhost:8000/api/v1/import/preview?user_id=user123&source_type=${moduleType.toLowerCase()}&import_type=${fileData.importType}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Preview failed');
      
      const data = await response.json();
      setPreviewData(data);
      setStep('execute');
    } catch (e) {
      setError(`Preview failed: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!fileData.file) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('import_type', fileData.importType);
      formData.append('source_type', moduleType.toLowerCase());

      const response = await fetch(`http://localhost:8000/api/v1/import/execute?user_id=user123&source_type=${moduleType.toLowerCase()}&import_type=${fileData.importType}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Import failed');
      
      const job = await response.json();
      setImportJob(job);
      setStep('complete');
      onImportComplete?.(job.id);
    } catch (e) {
      setError(`Import failed: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Import {moduleType}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Step {['upload', 'fieldmap', 'preview', 'execute', 'complete'].indexOf(step) + 1} of 5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((['upload', 'fieldmap', 'preview', 'execute', 'complete'].indexOf(step) + 1) / 5) * 100}%` }}
            className="bg-slate-900 transition-all"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <UploadStep fileData={fileData} onFileSelect={handleFileSelect} error={error} />
            )}
            {step === 'fieldmap' && fileData.file && (
              <FieldMapStep 
                records={fileData.records}
                moduleType={moduleType}
                fieldMapping={fieldMapping}
                onMappingChange={setFieldMapping}
              />
            )}
            {step === 'preview' && previewData && (
              <PreviewStep data={previewData} error={error} />
            )}
            {step === 'execute' && previewData && (
              <ExecuteStep isLoading={isLoading} previewData={previewData} />
            )}
            {step === 'complete' && importJob && (
              <CompleteStep job={importJob} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => setStep(['upload', 'fieldmap', 'preview', 'execute', 'complete'][Math.max(0, ['upload', 'fieldmap', 'preview', 'execute', 'complete'].indexOf(step) - 1)] as WizardStep)}
            disabled={step === 'upload' || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (step === 'upload') {
                if (fileData.file) setStep('fieldmap');
              } else if (step === 'fieldmap') {
                handleFieldMapComplete();
              } else if (step === 'preview') {
                handlePreviewImport();
              } else if (step === 'execute') {
                handleExecuteImport();
              } else if (step === 'complete') {
                onClose();
              }
            }}
            disabled={!fileData.file || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Upload className="w-4 h-4" />
              </motion.div>
            )}
            {step === 'complete' ? 'Close' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== WIZARD STEPS ====================

function UploadStep({ fileData, onFileSelect, error }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Select a file to import</h3>
        <p className="text-sm text-slate-500">Supported formats: CSV, JSON, Excel</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
      >
        <FileUp className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-lg font-semibold text-slate-900">Drop your file here</p>
        <p className="text-sm text-slate-500">or click to browse</p>
        {fileData.file && (
          <p className="text-sm text-green-600 mt-3 font-semibold">✓ {fileData.file.name}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        onChange={onFileSelect}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </motion.div>
  );
}

function FieldMapStep({ records, moduleType, fieldMapping, onMappingChange }: any) {
  const firstRecord = records[0] || {};
  const sourceFields = Object.keys(firstRecord);

  const targetFields = {
    leads: ['name', 'email', 'source', 'status', 'estimated_value'],
    customers: ['name', 'email', 'phone', 'status', 'address'],
    products: ['name', 'sku', 'price', 'stock', 'category'],
    'sales-orders': ['customer_id', 'items', 'total_value', 'status'],
  }[moduleType.toLowerCase()] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Map fields</h3>
        <p className="text-sm text-slate-500">Match your file columns to Valorniq fields</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sourceFields.map(sourceField => (
          <div key={sourceField} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">
                Source: {sourceField}
              </label>
              <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
                {firstRecord[sourceField]?.toString().slice(0, 30)}...
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">
                Target Field
              </label>
              <select
                value={fieldMapping[sourceField] || ''}
                onChange={(e) => onMappingChange({ ...fieldMapping, [sourceField]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
              >
                <option value="">Skip this field</option>
                {targetFields.map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PreviewStep({ data, error }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Review import preview</h3>
        <p className="text-sm text-slate-500">Check for errors before importing</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest">Total Records</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{data.total_records}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-widest">Valid</p>
          <p className="text-2xl font-black text-green-900 mt-1">{data.valid_records}</p>
        </div>
        {data.error_records > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-600 font-semibold uppercase tracking-widest">Errors</p>
            <p className="text-2xl font-black text-red-900 mt-1">{data.error_records}</p>
          </div>
        )}
        {data.duplicate_count > 0 && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-600 font-semibold uppercase tracking-widest">Duplicates</p>
            <p className="text-2xl font-black text-yellow-900 mt-1">{data.duplicate_count}</p>
          </div>
        )}
      </div>

      {data.warnings && data.warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="font-semibold text-yellow-900 mb-2">⚠ Warnings</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            {data.warnings.map((w: string, i: number) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      )}

      {data.errors && data.errors.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 max-h-48 overflow-y-auto">
          <p className="font-semibold text-red-900 mb-2">🔴 Errors</p>
          <ul className="text-xs text-red-800 space-y-1 font-mono">
            {data.errors.slice(0, 5).map((err: any, i: number) => (
              <li key={i}>Row {err.row}: {err.errors[0]}</li>
            ))}
          </ul>
        </div>
      )}

      {data.sample_data && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Sample Data</p>
          <div className="bg-slate-50 rounded-lg p-3 overflow-x-auto">
            <pre className="text-xs text-slate-600 font-mono">{JSON.stringify(data.sample_data[0], null, 2)}</pre>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ExecuteStep({ isLoading, previewData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Import records</h3>
        <p className="text-sm text-slate-500">This will add {previewData.valid_records} records to your database</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 mb-3"
          />
          <p className="text-slate-600 font-semibold">Importing records...</p>
          <p className="text-xs text-slate-500 mt-1">Please don't close this window</p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <p className="text-green-900 font-semibold">Ready to import</p>
          <p className="text-sm text-green-700 mt-1">Click "Next" to start the import</p>
        </div>
      )}
    </motion.div>
  );
}

function CompleteStep({ job }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </motion.div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Import successful!</h3>
        <p className="text-sm text-slate-500 mt-1">Your data has been imported</p>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Imported</p>
          <p className="text-xl font-black text-slate-900">{job.successful_records}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Skipped</p>
          <p className="text-xl font-black text-slate-900">{job.skipped_records}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Failed</p>
          <p className="text-xl font-black text-slate-900">{job.failed_records}</p>
        </div>
      </div>

      {job.error_details && job.error_details.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-left">
          <p className="text-sm font-semibold text-red-900 mb-2">Errors encountered:</p>
          <ul className="text-xs text-red-700 space-y-1">
            {job.error_details.slice(0, 3).map((e: string, i: number) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
