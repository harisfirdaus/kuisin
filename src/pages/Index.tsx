
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-neo-lightgray">
      {/* Navbar */}
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin.</div>
        <div className="space-x-4">
          <Link to="/join" className="font-medium hover:text-neo-blue transition-colors">Ikuti Kuis</Link>
          <Link to="/waitlist" className="neo-button inline-block">Buat Kuis</Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <h1 className="neo-header text-5xl md:text-6xl font-bold mb-6">
              🚀 Kuisin: Kuis Interaktif Seru, Real-Time, dan Mudah Digunakan!
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
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
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
      
      {/* Footer */}
      <footer className="neo-navbar mt-16 text-center py-6">
        <p>&copy; {new Date().getFullYear()} Kuisin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
