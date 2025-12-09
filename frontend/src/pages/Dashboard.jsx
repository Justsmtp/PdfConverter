import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock,
  Crown,
  Zap
} from 'lucide-react';
import ConversionHistory from '../components/ConversionHistory';
import FileUploader from '../components/FileUploader';
import ConvertOptions from '../components/ConvertOptions';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [converting, setConverting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userRes, statsRes, usageRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/convert/stats'),
        api.get('/user/usage')
      ]);

      setUser(userRes.data.user);
      setStats(statsRes.data.stats);
      setUsage(usageRes.data.usage);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setTargetFormat('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTargetFormat('');
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) {
      toast.error('Please select a file and target format');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('targetFormat', targetFormat);

    try {
      setConverting(true);
      const res = await api.post('/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Conversion completed!');
      
      // Download file
      const downloadUrl = res.data.conversion.downloadUrl;
      window.location.href = downloadUrl;

      // Reset and refresh
      setSelectedFile(null);
      setTargetFormat('');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      const res = await api.post('/payment/create-checkout-session');
      window.location.href = res.data.url;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to initiate upgrade');
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // eslint-disable-next-line no-unused-vars
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400">
            Manage your conversions and track your usage
          </p>
        </motion.div>

        {/* Plan Banner */}
        {user?.plan === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass-dark rounded-2xl p-6 border-2 border-neon-green/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/10 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Upgrade to Premium
                  </h3>
                  <p className="text-gray-400">
                    Unlimited conversions, priority support, and more
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpgradeToPremium}
                className="neon-button whitespace-nowrap"
              >
                Upgrade Now - $9.99/mo
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Conversions"
            value={stats?.totalConversions || 0}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Successful"
            value={stats?.successfulConversions || 0}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Avg. Processing"
            value={`${((stats?.avgProcessingTime || 0) / 1000).toFixed(2)}s`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Today's Usage"
            value={`${usage?.conversionsToday || 0}/${usage?.limit === 'Unlimited' ? '∞' : usage?.limit}`}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Quick Convert Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass-dark rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 text-neon-green mr-2" />
            Quick Convert
          </h2>
          
          <FileUploader
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemove={handleRemoveFile}
          />

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <ConvertOptions
                sourceFormat={getFileExtension(selectedFile.name)}
                onSelectFormat={setTargetFormat}
                selectedFormat={targetFormat}
              />

              {targetFormat && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="neon-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {converting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Zap className="inline mr-2 w-5 h-5" />
                        Convert Now
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Conversion History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6 border border-white/10"
        >
          <ConversionHistory />
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="glass-dark rounded-xl p-6 border border-white/10 hover:border-neon-green/30 transition-all relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} opacity-20 flex items-center justify-center`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

export default Dashboard;