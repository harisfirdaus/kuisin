
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const JoinQuiz = () => {
  const [name, setName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    
    // In a real application, this would connect to Supabase via Edge Functions
    // For now, we'll simulate a join flow
    setTimeout(() => {
      // Redirect to the quiz page (this would be handled with proper routing in the full implementation)
      window.location.href = `/quiz/${quizCode}?name=${encodeURIComponent(name)}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neo-lightgray flex flex-col">
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin.</div>
        <Link to="/" className="font-medium flex items-center gap-2 hover:text-neo-blue transition-colors">
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </Link>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="neo-card w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">Gabung Kuis</h1>
          
          <form onSubmit={handleJoinQuiz} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block font-bold">Nama Anda</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neo-input w-full"
                placeholder="Masukkan nama Anda"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quizCode" className="block font-bold">Kode Kuis</label>
              <Input
                id="quizCode"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                className="neo-input w-full"
                placeholder="Masukkan kode kuis"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="neo-button w-full"
              disabled={isJoining}
            >
              {isJoining ? "Menghubungkan..." : "Gabung Kuis"}
            </Button>
          </form>
        </div>
      </div>
      
      <footer className="neo-navbar text-center py-4">
        <p>&copy; {new Date().getFullYear()} Kuisin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default JoinQuiz;
