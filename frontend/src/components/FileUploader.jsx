import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUploader = ({ onFileSelect, selectedFile, onRemove }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Max size is 10MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type');
      } else {
        toast.error('Error uploading file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      toast.success('File uploaded successfully!');
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
    maxFiles: 1,
    multiple: false
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            {...getRootProps()}
            className={`relative cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'scale-105 neon-border'
                : 'border-2 border-dashed border-white/20 hover:border-neon-green/50'
            } ${
              isDragReject ? 'border-red-500' : ''
            } rounded-2xl p-12 text-center glass-dark`}
          >
            <input {...getInputProps()} />
            
            {/* Animated background effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r from-neon-green/0 via-neon-green/10 to-neon-green/0 ${
                isDragActive ? 'animate-pulse' : ''
              }`} />
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{
                  y: isDragActive ? -10 : 0,
                  scale: isDragActive ? 1.1 : 1
                }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <Upload className={`w-16 h-16 ${
                    isDragActive ? 'text-neon-green' : 'text-white'
                  } transition-colors`} />
                  {isDragActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      className="absolute inset-0 blur-xl bg-neon-green/50"
                    />
                  )}
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
              </h3>
              <p className="text-gray-400 mb-4">
                or click to browse from your device
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                <span className="px-3 py-1 rounded-full bg-white/5">PDF</span>
                <span className="px-3 py-1 rounded-full bg-white/5">JPG</span>
                <span className="px-3 py-1 rounded-full bg-white/5">PNG</span>
                <span className="px-3 py-1 rounded-full bg-white/5">DOC</span>
                <span className="px-3 py-1 rounded-full bg-white/5">DOCX</span>
                <span className="px-3 py-1 rounded-full bg-white/5">TXT</span>
                <span className="px-3 py-1 rounded-full bg-white/5">WEBP</span>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Maximum file size: 10MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-dark rounded-2xl p-6 border-2 border-neon-green/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
                  <File className="w-6 h-6 text-neon-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-neon-green animate-pulse" />
                <button
                  onClick={onRemove}
                  className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;