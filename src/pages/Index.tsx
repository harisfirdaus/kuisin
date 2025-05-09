import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('adminSession');
    setIsAdminLoggedIn(!!adminSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSession');
    setIsAdminLoggedIn(false);
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
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">Kuisin</div>
              <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="flex flex-col space-y-4">
              <Link 
                to="/join" 
                className="neo-button w-full flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ikuti Kuis
              </Link>
              <Link 
                to="/waitlist" 
                className="neo-button w-full flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Buat Kuis
              </Link>
              {isAdminLoggedIn ? (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="neo-button w-full flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="neo-button w-full flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="neo-button w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn size={20} />
                  Login Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <h1 className="neo-header text-4xl md:text-6xl font-bold mb-6">
              Kuis Interaktif Seru, Real-Time, dan Mudah Digunakan!
            </h1>
            <p className="text-xl mb-8">
              Buat dan ikuti kuis dengan mudah dan menyenangkan. Pantau hasil secara langsung 
              melalui dashboard real-time dan jadikan sesi kuis lebih menarik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/join" className="neo-button flex items-center justify-center gap-2">
                Ikuti Kuis Sekarang
                <ArrowRight size={20} />
              </Link>
              <Link to="/waitlist" className="neo-button-secondary flex items-center justify-center gap-2">
                Buat Kuis
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          
          <div className="neo-card animate-pulse-scale">
            <img 
              src="https://media-hosting.imagekit.io/b29dd61dca03478a/pexels-leeloothefirst-5428830.jpg?Expires=1839806770&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=gjvUiScPXD2yEwvrqufoHwPrUHUM4W6Z7N1u9tCPXN700VVLFaQuVjo2CLz1wN3kjgxrtT3KFW0BCiM~L9QgNHWucm8BR974HjiNMod7LOrPbMkuDrodBwg4XQyM7~qg06oZMxJAY6gS3ws6mAFqwSu84oEOC~u99nHK3nKLiOdst7VdvRCXD-cbIwArXIhtFqwhAterI170FbMe~2RkRQbj85fbu7Hph0Fcwp7LLPdDslQaxwdIfjW-Go-woU25RyGGN5~aMfH51PShzhNbRdh93lBAEjOcqySd2anMB0auF6~blIznoPrhtqMPC-tBt2~YSleu~McVpTlNCU~YNA__" 
              alt="Kuisin Quiz Platform" 
              className="w-full h-auto border-4 border-black"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-neo-blue py-16 border-y-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Fitur Unggulan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neo-container animate-slide-in">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Masuk Kuis Instan</h3>
              <p>Cukup masukkan nama dan kode, langsung mulai menjawab.</p>
            </div>
            
            <div className="neo-container animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2">Dashboard Real-Time</h3>
              <p>Pantau partisipan dan skor secara langsung.</p>
            </div>
            
            <div className="neo-container animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-2">Leaderboard Dinamis</h3>
              <p>Lihat peringkat peserta secara otomatis.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center">Cara Kerja</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neo-card text-center">
            <div className="text-5xl font-bold text-neo-blue mb-4">1</div>
            <h3 className="text-2xl font-bold mb-2">Masuk Kuis</h3>
            <p>Input nama & kode kuis untuk bergabung.</p>
          </div>
          
          <div className="neo-card text-center">
            <div className="text-5xl font-bold text-neo-blue mb-4">2</div>
            <h3 className="text-2xl font-bold mb-2">Jawab Pertanyaan</h3>
            <p>Interaktif dengan timer dan animasi.</p>
          </div>
          
          <div className="neo-card text-center">
            <div className="text-5xl font-bold text-neo-blue mb-4">3</div>
            <h3 className="text-2xl font-bold mb-2">Lihat Hasil</h3>
            <p>Real-time di dashboard dan leaderboard.</p>
          </div>
        </div>
      </section>

      {/* CTA Akhir */}
      <section className="container mx-auto px-4 py-16">
        <div className="neo-card text-center max-w-2xl mx-auto p-12 bg-white border-4 border-neo-blue shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Siap Ikuti atau Buat Kuis Menarik? Bergabung Sekarang!</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link to="/join" className="neo-button flex items-center justify-center gap-2">
              Ikuti Kuis
              <ArrowRight size={20} />
            </Link>
            <Link to="/waitlist" className="neo-button-secondary flex items-center justify-center gap-2">
              Buat Kuis
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="neo-navbar mt-16 text-center py-6 flex flex-col items-center">
        <p>
          &copy; {new Date().getFullYear()} Kuisin. All rights reserved.
        </p>
        <p className="mt-2">
          Developed by{" "}
          <a
            href="https://www.threads.net/@harisfirda"
            className="underline hover:text-neo-blue"
            target="_blank"
            rel="noopener noreferrer"
          >
            Haris Firdaus
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
