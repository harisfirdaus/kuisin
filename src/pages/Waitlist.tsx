import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Menu, LayoutDashboard, LogOut, LogIn } from "lucide-react";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    setIsAdminLoggedIn(!!adminSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSession');
    setIsAdminLoggedIn(false);
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real application, this would connect to Supabase via Edge Functions
    // For now, we'll simulate a submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neo-lightgray">
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin</div>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/join" className="font-medium hover:text-neo-blue transition-colors">
            Ikuti Kuis
          </Link>
          <Link to="/waitlist" className="neo-button inline-block">
            Buat Kuis
          </Link>
          {isAdminLoggedIn ? (
            <>
              <Link to="/admin/dashboard" className="neo-button flex items-center gap-2">
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="neo-button flex items-center gap-2 ml-2">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="neo-button flex items-center gap-2 ml-2">
              <LogIn size={20} />
              <span>Login Admin</span>
            </Link>
          )}
        </div>
        <button 
          className="md:hidden p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">Kuisin</div>
              <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <Link 
                to="/join" 
                className="block p-2 border-2 border-black hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ikuti Kuis
              </Link>
              <Link 
                to="/waitlist" 
                className="block p-2 border-2 border-black hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Buat Kuis
              </Link>
              {isAdminLoggedIn ? (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="block p-2 border-2 border-black hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full p-2 border-2 border-black hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="block p-2 border-2 border-black hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="neo-card w-full max-w-2xl">
          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Daftar Waitlist</h1>
              <p className="mb-6">Dapatkan akses awal untuk membuat dan mengelola kuis interaktif.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-bold">Nama Lengkap</label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="neo-input w-full"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block font-bold">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neo-input w-full"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="organization" className="block font-bold">Organisasi</label>
                  <Input
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="neo-input w-full"
                    placeholder="Nama organisasi atau institusi Anda"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="purpose" className="block font-bold">Tujuan Penggunaan</label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="neo-input w-full h-32"
                    placeholder="Ceritakan untuk apa Anda akan menggunakan Kuisin"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="neo-button w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengirim..." : "Daftar Sekarang"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-neo-blue rounded-full flex items-center justify-center mb-6 border-4 border-black">
                <Check size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Pendaftaran Berhasil!</h1>
              <p className="mb-8">
                Terima kasih telah mendaftar dalam daftar tunggu Kuisin. Kami akan menghubungi Anda 
                melalui email saat akses tersedia.
              </p>
              <Link to="/" className="neo-button inline-block">
                Kembali ke Beranda
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <footer className="neo-navbar text-center py-4">
        <p>&copy; {new Date().getFullYear()} Kuisin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Waitlist;
