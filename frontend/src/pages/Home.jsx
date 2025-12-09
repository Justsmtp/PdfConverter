import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  Star,
  FileText,
  Image as ImageIcon,
  FileType,
  Sparkles
} from 'lucide-react';
import FileUploader from '../components/FileUploader';
import ConvertOptions from '../components/ConvertOptions';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [converting, setConverting] = useState(false);
  const navigate = useNavigate();

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

      // Reset
      setSelectedFile(null);
      setTargetFormat('');
    } catch (error) {
      const message = error.response?.data?.message || 'Conversion failed';
      toast.error(message);
      
      if (message.includes('Daily conversion limit')) {
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }
    } finally {
      setConverting(false);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 grid-background opacity-30" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-dark mb-6 border border-neon-green/30"
            >
              <Sparkles className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green font-semibold">Powered by AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Convert Any File</span>
              <br />
              <span className="text-white">Instantly</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Transform your PDFs, images, and documents with lightning speed. 
              Secure, reliable, and absolutely free to start.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="neon-button">
                Get Started Free
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <button className="px-8 py-3 rounded-lg glass hover:bg-white/10 text-white font-bold transition-all border border-white/20">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Converter Widget */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-dark rounded-3xl p-8 border border-neon-green/20 shadow-2xl">
              <FileUploader
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onRemove={handleRemoveFile}
              />

              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8"
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
                      className="mt-8 text-center"
                    >
                      <button
                        onClick={handleConvert}
                        disabled={converting}
                        className="neon-button disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[200px]"
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-400 text-lg">
              Fast, secure, and incredibly easy to use
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Convert your files in seconds with our optimized processing engine"
              delay={0}
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="100% Secure"
              description="Your files are encrypted and automatically deleted after 24 hours"
              delay={0.1}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Always Available"
              description="24/7 access to our conversion tools from anywhere in the world"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Supported Formats
            </h2>
            <p className="text-gray-400 text-lg">
              Convert between all popular file formats
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['PDF', 'JPG', 'PNG', 'DOC', 'DOCX', 'TXT', 'WEBP'].map((format, index) => (
              <motion.div
                key={format}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-dark rounded-xl p-6 text-center hover:border-neon-green/50 border border-white/10 transition-all hover:scale-105"
              >
                <FileType className="w-12 h-12 text-neon-green mx-auto mb-3" />
                <p className="text-white font-bold text-lg">{format}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-12 border-2 border-neon-green/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-transparent" />
            <div className="relative z-10">
              <Star className="w-16 h-16 text-neon-green mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Join thousands of users converting files every day. No credit card required.
              </p>
              <Link to="/register" className="neon-button inline-flex items-center">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="glass-dark rounded-2xl p-8 border border-white/10 hover:border-neon-green/30 transition-all group"
  >
    <div className="w-16 h-16 rounded-xl bg-neon-green/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <div className="text-neon-green">{icon}</div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default Home;