import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-neon-green/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-neon-green" />
              <span className="text-xl font-bold text-white">PDF Converter</span>
            </div>
            <p className="text-gray-400 text-sm">
              Convert your files instantly with our powerful, secure, and easy-to-use platform.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://github.com" icon={<Github />} />
              <SocialLink href="https://twitter.com" icon={<Twitter />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin />} />
              <SocialLink href="mailto:support@pdfconverter.com" icon={<Mail />} />
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <FooterLink to="/">Features</FooterLink>
              <FooterLink to="/">Pricing</FooterLink>
              <FooterLink to="/">API</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink to="/">About Us</FooterLink>
              <FooterLink to="/">Blog</FooterLink>
              <FooterLink to="/">Careers</FooterLink>
              <FooterLink to="/">Contact</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <FooterLink to="/">Privacy Policy</FooterLink>
              <FooterLink to="/">Terms of Service</FooterLink>
              <FooterLink to="/">Cookie Policy</FooterLink>
              <FooterLink to="/">GDPR</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neon-green/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} PDF Converter. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Made with</span>
              <span className="text-neon-green text-xl animate-pulse">♥</span>
              <span className="text-gray-400 text-sm">by the PDF Converter Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-gray-400 hover:text-neon-green transition-colors text-sm"
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-lg glass hover:bg-neon-green/10 hover:border-neon-green/50 border border-white/10 text-gray-400 hover:text-neon-green transition-all"
  >
    {icon}
  </a>
);

export default Footer;