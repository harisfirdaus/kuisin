
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  LogOut, 
  Plus, 
  BarChart, 
  List, 
  Users,
  Archive,
  Settings,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import { getQuizzes, deleteQuiz, toggleQuizStatus } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Quiz = {
  id: string;
  title: string;
  code: string;
  is_active: boolean;
  default_points: number;
  duration_per_question: number;
  created_at: string;
  description: string;
};

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }
    
    fetchQuizzes();
  }, [navigate]);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data.data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan data kuis. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kuis ini?")) {
      try {
        setIsDeleting(quizId);
        await deleteQuiz(quizId);
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        toast({
          title: "Kuis Dihapus",
          description: "Kuis berhasil dihapus.",
        });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menghapus kuis. Silakan coba lagi.",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const handleToggleQuizStatus = async (quizId: string) => {
    try {
      setIsToggling(quizId);
      const response = await toggleQuizStatus(quizId);
      
      // Update the quiz status in the local state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, is_active: response.data[0].is_active } 
          : quiz
      ));
      
      toast({
        title: "Status Kuis Diubah",
        description: `Kuis sekarang ${response.data[0].is_active ? 'aktif' : 'tidak aktif'}.`,
      });
    } catch (error) {
      console.error("Error toggling quiz status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengubah status kuis. Silakan coba lagi.",
      });
    } finally {
      setIsToggling(null);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSession');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neo-lightgray flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r-4 border-black flex flex-col">
        <div className="p-4 border-b-4 border-black">
          <h1 className="text-2xl font-bold">Kuisin.</h1>
          <p className="text-sm">Admin Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab("quizzes")}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${
                  activeTab === "quizzes" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                <List size={20} />
                <span>Kuis</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("stats")}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${
                  activeTab === "stats" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                <BarChart size={20} />
                <span>Statistik</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("participants")}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${
                  activeTab === "participants" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                <Users size={20} />
                <span>Peserta</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("archived")}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${
                  activeTab === "archived" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                <Archive size={20} />
                <span>Arsip</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${
                  activeTab === "settings" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                <Settings size={20} />
                <span>Pengaturan</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t-4 border-black">
          <button 
            onClick={handleLogout}
            className="w-full p-3 flex items-center justify-center gap-2 border-4 border-black bg-white hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {activeTab === "quizzes" && "Daftar Kuis"}
            {activeTab === "stats" && "Statistik"}
            {activeTab === "participants" && "Peserta"}
            {activeTab === "archived" && "Kuis Terarsip"}
            {activeTab === "settings" && "Pengaturan"}
          </h2>
          
          {activeTab === "quizzes" && (
            <Link to="/admin/quiz/create" className="neo-button flex items-center gap-2">
              <Plus size={20} />
              <span>Buat Kuis Baru</span>
            </Link>
          )}
        </header>
        
        <main className="flex-1 p-6">
          {activeTab === "quizzes" && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={40} className="animate-spin text-neo-blue" />
                </div>
              ) : quizzes.length === 0 ? (
                <div className="neo-card p-6 text-center">
                  <p className="text-lg mb-4">Belum ada kuis yang dibuat</p>
                  <Link to="/admin/quiz/create" className="neo-button inline-flex items-center gap-2">
                    <Plus size={18} />
                    <span>Buat Kuis Baru</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className="neo-card p-6 flex flex-col md:flex-row gap-4 justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{quiz.title}</h3>
                          <span className={`px-2 py-1 text-xs border-2 border-black ${
                            quiz.is_active ? "bg-green-400" : "bg-gray-400"
                          }`}>
                            {quiz.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                        
                        <p className="mb-4">Kode: <span className="font-bold">{quiz.code}</span></p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div>Nilai Default: <span className="font-bold">{quiz.default_points}</span></div>
                          <div>Waktu per Soal: <span className="font-bold">{quiz.duration_per_question}s</span></div>
                          <div>Dibuat: <span className="font-bold">{new Date(quiz.created_at).toLocaleDateString("id-ID")}</span></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap md:flex-col gap-2 md:justify-center">
                        <Link 
                          to={`/admin/quiz/${quiz.id}`}
                          className="neo-button-secondary py-2 px-4 text-sm"
                        >
                          Edit Kuis
                        </Link>
                        <Link 
                          to={`/admin/quiz/${quiz.id}/stats`}
                          className="neo-button-secondary py-2 px-4 text-sm"
                        >
                          Lihat Hasil
                        </Link>
                        <button
                          onClick={() => handleToggleQuizStatus(quiz.id)}
                          className="neo-button-secondary py-2 px-4 text-sm inline-flex items-center justify-center"
                          disabled={isToggling === quiz.id}
                        >
                          {isToggling === quiz.id ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                          ) : quiz.is_active ? (
                            <ToggleRight size={16} className="mr-2" />
                          ) : (
                            <ToggleLeft size={16} className="mr-2" />
                          )}
                          {quiz.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="neo-button-secondary py-2 px-4 text-sm bg-neo-red text-white inline-flex items-center justify-center"
                          disabled={isDeleting === quiz.id}
                        >
                          {isDeleting === quiz.id ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                          ) : (
                            <Trash2 size={16} className="mr-2" />
                          )}
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === "stats" && (
            <div className="neo-card p-6">
              <h3 className="text-xl font-bold mb-4">Statistik Kuis</h3>
              <p>Dashboard statistik akan ditampilkan di sini dengan data partisipasi dan hasil kuis.</p>
            </div>
          )}
          
          {activeTab === "participants" && (
            <div className="neo-card p-6">
              <h3 className="text-xl font-bold mb-4">Daftar Peserta</h3>
              <p>Daftar peserta dan riwayat partisipasi akan ditampilkan di sini.</p>
            </div>
          )}
          
          {activeTab === "archived" && (
            <div className="neo-card p-6">
              <h3 className="text-xl font-bold mb-4">Kuis Terarsip</h3>
              <p>Kuis yang telah diarsipkan akan muncul di sini.</p>
            </div>
          )}
          
          {activeTab === "settings" && (
            <div className="neo-card p-6">
              <h3 className="text-xl font-bold mb-4">Pengaturan Akun</h3>
              <p>Pengaturan akun dan preferensi akan ditampilkan di sini.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
