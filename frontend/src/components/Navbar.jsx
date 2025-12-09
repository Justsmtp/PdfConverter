import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, FileText, LogOut, User, BarChart3 } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-dark shadow-lg shadow-neon-green/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <FileText className="w-8 h-8 text-neon-green animate-pulse" />
              <div className="absolute inset-0 blur-lg bg-neon-green/50 animate-pulse" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              PDF Converter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={isActive('/')}>
              Home
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')}>
                  Dashboard
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" active={isActive('/admin')}>
                    <span className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>Admin</span>
                    </span>
                  </NavLink>
                )}
                <div className="flex items-center space-x-4">
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-neon-green text-sm font-semibold">
                      {user.plan === 'premium' ? '⭐ Premium' : '🆓 Free'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-white hover:text-neon-green transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-neon-green transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="neon-button"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-neon-green transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-dark"
        >
          <div className="px-4 pt-2 pb-4 space-y-3">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>
              Home
            </MobileNavLink>
            {user ? (
              <>
                <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>
                  Dashboard
                </MobileNavLink>
                {user.role === 'admin' && (
                  <MobileNavLink to="/admin" onClick={() => setIsOpen(false)}>
                    Admin
                  </MobileNavLink>
                )}
                <div className="px-4 py-2 glass rounded-lg">
                  <span className="text-neon-green text-sm font-semibold">
                    {user.plan === 'premium' ? '⭐ Premium' : '🆓 Free'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:text-neon-green transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setIsOpen(false)}>
                  Get Started
                </MobileNavLink>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`relative text-white hover:text-neon-green transition-colors ${
      active ? 'text-neon-green' : ''
    }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeNav"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-green"
      />
    )}
  </Link>
);

const MobileNavLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-white hover:text-neon-green hover:bg-white/5 rounded-lg transition-colors"
  >
    {children}
  </Link>
);

export default Navbar;