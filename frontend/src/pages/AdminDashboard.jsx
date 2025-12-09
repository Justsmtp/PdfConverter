import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics/conversions?period=30')
      ]);

      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Activity className="w-10 h-10 text-neon-green mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor and manage your PDF Converter platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats?.users?.total || 0}
            subtitle={`${stats?.users?.newToday || 0} new today`}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Conversions"
            value={stats?.conversions?.total || 0}
            subtitle={`${stats?.conversions?.today || 0} today`}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Success Rate"
            value={`${stats?.conversions?.successRate || 0}%`}
            subtitle={`${stats?.conversions?.completed || 0} completed`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Monthly Revenue"
            value={`$${stats?.revenue?.monthly?.toFixed(2) || 0}`}
            subtitle={`${stats?.users?.premium || 0} premium users`}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={<Clock className="w-5 h-5" />}
            title="Avg Processing Time"
            value={formatTime(stats?.performance?.avgProcessingTime || 0)}
          />
          <MetricCard
            icon={<Database className="w-5 h-5" />}
            title="Total Storage Used"
            value={formatBytes(stats?.storage?.total || 0)}
          />
          <MetricCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="This Week"
            value={`${stats?.conversions?.thisWeek || 0} conversions`}
          />
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 text-neon-green mr-2" />
              User Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Free Users</span>
                <span className="text-white font-semibold">{stats?.users?.free || 0}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{
                    width: `${((stats?.users?.free || 0) / (stats?.users?.total || 1)) * 100}%`
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">Premium Users</span>
                <span className="text-neon-green font-semibold">{stats?.users?.premium || 0}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{
                    width: `${((stats?.users?.premium || 0) / (stats?.users?.total || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 text-neon-green mr-2" />
              Conversion Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-400">Completed</span>
                </div>
                <span className="text-white font-semibold">{stats?.conversions?.completed || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-400">Failed</span>
                </div>
                <span className="text-white font-semibold">{stats?.conversions?.failed || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-400">Success Rate</span>
                </div>
                <span className="text-neon-green font-semibold">{stats?.conversions?.successRate || 0}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Popular Conversions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark rounded-2xl p-6 border border-white/10 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-neon-green mr-2" />
            Popular Conversions (Last 30 Days)
          </h3>
          <div className="space-y-3">
            {analytics?.conversionsByFormat?.slice(0, 5).map((format, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg glass hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center">
                    <span className="text-neon-green font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">
                      {format._id.from.toUpperCase()} → {format._id.to.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-neon-green font-semibold">{format.count} conversions</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Most Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 text-neon-green mr-2" />
            Most Active Users (Last 30 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Name</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Email</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Plan</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.mostActiveUsers?.map((user, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.plan === 'premium' 
                          ? 'bg-neon-green/20 text-neon-green' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-neon-green font-semibold">
                      {user.conversions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-dark rounded-xl p-6 border border-white/10 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} opacity-20 flex items-center justify-center mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  </motion.div>
);

const MetricCard = ({ icon, title, value }) => (
  <div className="glass-dark rounded-xl p-4 border border-white/10">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
        <div className="text-neon-green">{icon}</div>
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;