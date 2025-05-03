import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { joinQuiz } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const JoinQuiz = () => {
  const [name, setName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    if (!name.trim() || !quizCode.trim()) {
      setError("Nama dan kode kuis harus diisi");
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await joinQuiz(quizCode.toUpperCase(), name.trim());
      
      if (!result.data?.[0]?.id || !result.data?.[0]?.quiz_id) {
        throw new Error("Data peserta tidak valid");
      }
      
      // Store participant info in local storage
      localStorage.setItem('participant', JSON.stringify({
        id: result.data[0].id,
        name: name.trim(),
        quizId: result.data[0].quiz_id
      }));
      
      // Redirect to quiz play page
      navigate(`/quiz/${result.data[0].quiz_id}?name=${encodeURIComponent(name.trim())}`);
    } catch (err: any) {
      console.error("Error joining quiz:", err);
      setError(err.message || "Gagal bergabung ke kuis. Silakan periksa kode kuis dan coba lagi.");
      
      // Show toast for network errors
      if (err.message.includes('Gagal terhubung ke server')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message
        });
      }
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-2">Ikuti Kuis</h1>
          <p className="mb-6">Masukkan nama dan kode kuis untuk mulai bermain</p>
          
          {error && (
            <div className="bg-neo-red/10 border-4 border-neo-red text-neo-red p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block font-bold">Nama</label>
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
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                className="neo-input w-full uppercase"
                placeholder="Masukkan kode kuis"
                maxLength={8}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="neo-button w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                "Mulai Kuis"
              )}
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
