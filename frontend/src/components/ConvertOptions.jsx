import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileImage, FileText, File as FileIcon, CheckCircle } from 'lucide-react';

const ConvertOptions = ({ sourceFormat, onSelectFormat, selectedFormat }) => {
  const formatOptions = {
    pdf: [
      { value: 'jpg', label: 'JPG', icon: <FileImage />, color: 'from-blue-500 to-cyan-500' },
      { value: 'png', label: 'PNG', icon: <FileImage />, color: 'from-purple-500 to-pink-500' },
      { value: 'txt', label: 'TXT', icon: <FileText />, color: 'from-green-500 to-emerald-500' },
      { value: 'doc', label: 'DOC', icon: <FileIcon />, color: 'from-orange-500 to-red-500' },
    ],
    jpg: [
      { value: 'pdf', label: 'PDF', icon: <FileIcon />, color: 'from-red-500 to-orange-500' },
      { value: 'png', label: 'PNG', icon: <FileImage />, color: 'from-purple-500 to-pink-500' },
      { value: 'webp', label: 'WEBP', icon: <FileImage />, color: 'from-teal-500 to-cyan-500' },
    ],
    jpeg: [
      { value: 'pdf', label: 'PDF', icon: <FileIcon />, color: 'from-red-500 to-orange-500' },
      { value: 'png', label: 'PNG', icon: <FileImage />, color: 'from-purple-500 to-pink-500' },
      { value: 'webp', label: 'WEBP', icon: <FileImage />, color: 'from-teal-500 to-cyan-500' },
    ],
    png: [
      { value: 'pdf', label: 'PDF', icon: <FileIcon />, color: 'from-red-500 to-orange-500' },
      { value: 'jpg', label: 'JPG', icon: <FileImage />, color: 'from-blue-500 to-cyan-500' },
      { value: 'webp', label: 'WEBP', icon: <FileImage />, color: 'from-teal-500 to-cyan-500' },
    ],
    webp: [
      { value: 'pdf', label: 'PDF', icon: <FileIcon />, color: 'from-red-500 to-orange-500' },
      { value: 'jpg', label: 'JPG', icon: <FileImage />, color: 'from-blue-500 to-cyan-500' },
      { value: 'png', label: 'PNG', icon: <FileImage />, color: 'from-purple-500 to-pink-500' },
    ],
    txt: [
      { value: 'pdf', label: 'PDF', icon: <FileIcon />, color: 'from-red-500 to-orange-500' },
    ],
  };

  const options = formatOptions[sourceFormat?.toLowerCase()] || [];

  if (options.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No conversion options available for this format</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-4">
        Convert to:
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectFormat(option.value)}
            className={`relative group overflow-hidden rounded-xl p-6 transition-all duration-300 ${
              selectedFormat === option.value
                ? 'neon-border scale-105'
                : 'glass hover:scale-105 border border-white/10'
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                selectedFormat === option.value
                  ? 'bg-neon-green/20 text-neon-green'
                  : 'bg-white/5 text-white group-hover:text-neon-green'
              }`}>
                {option.icon}
              </div>
              <span className={`font-bold text-lg ${
                selectedFormat === option.value ? 'text-neon-green' : 'text-white'
              }`}>
                {option.label}
              </span>
              
              {/* Selected indicator */}
              {selectedFormat === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                </motion.div>
              )}
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 rounded-xl border-2 border-neon-green/30 blur-sm" />
            </div>
          </motion.button>
        ))}
      </div>

      {selectedFormat && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 glass-dark rounded-lg border border-neon-green/30"
        >
          <p className="text-sm text-gray-300">
            <span className="text-neon-green font-semibold">Selected:</span> Converting from{' '}
            <span className="font-semibold text-white">{sourceFormat.toUpperCase()}</span> to{' '}
            <span className="font-semibold text-neon-green">{selectedFormat.toUpperCase()}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ConvertOptions;