import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle, Loader, RotateCcw, Download } from 'lucide-react';

interface ImportHistoryProps {
  moduleType?: string;
}

interface ImportJob {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  source_type: string;
  filename: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  created_at: string;
  completed_at?: string;
}

export default function ImportHistory({ moduleType }: ImportHistoryProps) {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  useEffect(() => {
    fetchImportHistory();
    const interval = setInterval(fetchImportHistory, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [moduleType]);

  const fetchImportHistory = async () => {
    try {
      const params = new URLSearchParams({
        user_id: 'user123',
        limit: '20'
      });
      if (moduleType) params.append('source_type', moduleType.toLowerCase());

      const response = await fetch(`http://localhost:8000/api/v1/import/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (jobId: string) => {
    if (!window.confirm('Rollback this import? This will mark it as rolled back.')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/import/rollback/${jobId}?user_id=user123`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Rollback failed');
      fetchImportHistory();
      alert('✓ Import rolled back');
    } catch (error) {
      alert('Rollback failed: ' + error);
    }
  };

  const handleDownloadReport = (job: ImportJob) => {
    const report = `
Import Report
=============
Job ID: ${job.id}
File: ${job.filename}
Status: ${job.status}
Type: ${job.source_type}

Results:
- Total Records: ${job.total_records}
- Successful: ${job.successful_records}
- Failed: ${job.failed_records}
- Created: ${new Date(job.created_at).toLocaleString()}
- Completed: ${job.completed_at ? new Date(job.completed_at).toLocaleString() : 'In Progress'}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-report-${job.id}.txt`;
    a.click();
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'completed') return job.status === 'completed';
    if (filter === 'failed') return job.status === 'failed' || job.status === 'rolled_back';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader className="w-6 h-6 text-slate-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-400" />
        <h3 className="font-bold text-slate-900">Import History</h3>
      </div>

      <div className="flex gap-2">
        {(['all', 'completed', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'completed' ? '✓ Completed' : '✗ Failed'}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No import history yet</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {job.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {job.status === 'in_progress' && (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Loader className="w-4 h-4 text-blue-600" />
                      </motion.div>
                    )}
                    {job.status === 'rolled_back' && <RotateCcw className="w-4 h-4 text-orange-600" />}

                    <span className="font-semibold text-sm text-slate-900">{job.filename}</span>
                    <span className="text-xs text-slate-500">({job.source_type})</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div>
                      <span className="text-slate-500">Total</span>
                      <p className="font-bold text-slate-900">{job.total_records}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Success</span>
                      <p className="font-bold text-green-600">{job.successful_records}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Failed</span>
                      <p className="font-bold text-red-600">{job.failed_records}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(job.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  {job.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleDownloadReport(job)}
                        title="Download report"
                        className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                      {job.successful_records > 0 && (
                        <button
                          onClick={() => handleRollback(job.id)}
                          title="Rollback import"
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
