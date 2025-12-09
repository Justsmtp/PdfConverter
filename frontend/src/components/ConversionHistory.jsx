import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Download, Clock, FileText, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ConversionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/convert/history?page=${page}&limit=10`);
      setHistory(res.data.conversions);
      setPagination(res.data.pagination);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to load conversion history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (conversionId) => {
    try {
      const response = await fetch(`/api/convert/download/${conversionId}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download started!');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No conversions yet</h3>
        <p className="text-gray-400">Your conversion history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Conversion History</h2>
      
      {history.map((conversion, index) => (
        <motion.div
          key={conversion._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-dark rounded-xl p-6 border border-white/10 hover:border-neon-green/30 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h4 className="text-white font-semibold truncate max-w-xs">
                    {conversion.originalFileName}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {conversion.originalFileType}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-neon-green/20 text-neon-green">
                      {conversion.targetFileType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Original Size</p>
                  <p className="text-white font-medium">
                    {formatFileSize(conversion.originalFileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Converted Size</p>
                  <p className="text-white font-medium">
                    {formatFileSize(conversion.convertedFileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Processing Time</p>
                  <p className="text-white font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {(conversion.processingTime / 1000).toFixed(2)}s
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="flex items-center">
                    {conversion.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-neon-green mr-1" />
                        <span className="text-neon-green font-medium">Completed</span>
                      </>
                    ) : conversion.status === 'failed' ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-400 mr-1" />
                        <span className="text-red-400 font-medium">Failed</span>
                      </>
                    ) : (
                      <span className="text-yellow-400 font-medium">Processing</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(conversion.createdAt)}
              </div>
            </div>

            {conversion.status === 'completed' && (
              <button
                onClick={() => handleDownload(conversion._id)}
                className="ml-4 px-4 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg transition-colors flex items-center space-x-2 border border-neon-green/30"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        </motion.div>
      ))}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 glass rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-white">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 glass rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversionHistory;