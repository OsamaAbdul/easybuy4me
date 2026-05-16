import { Globe, Mail, X, QrCode } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-brand-black overflow-hidden pt-20">
      {/* Cloud Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/footer-bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/easybuy4me-logo.jpg" alt="EasyBuy4Me Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">EASYBUY<span className="text-brand-primary">4ME</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Empowering consumers with the freedom to shop, pay, and grow. Join the future of global retail.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary/20 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary/20 transition-colors">
                <X className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-brand-primary/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Merchant Solutions</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Credit Lines</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* QR/Mobile */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 bg-white p-2 rounded-2xl">
              <QrCode className="w-full h-full text-brand-black" />
            </div>
            <div>
              <p className="text-sm font-medium">Download the App</p>
              <p className="text-xs text-white/40">Scan to get started on iOS or Android</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <p>© {new Date().getFullYear()} EASYBUY4ME. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
