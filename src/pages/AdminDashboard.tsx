
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  LogOut, 
  Plus, 
  BarChart, 
  List, 
  Users,
  Archive,
  Settings
} from "lucide-react";

// Mock data for quizzes
const mockQuizzes = [
  { 
    id: "quiz1", 
    title: "Pengetahuan Umum Indonesia", 
    code: "IDINESIA", 
    status: "active", 
    questionCount: 10,
    participantCount: 145,
    createdAt: "2023-10-15T10:30:00Z"
  },
  { 
    id: "quiz2", 
    title: "Teknologi Informasi Dasar", 
    code: "TEKINFO", 
    status: "active", 
    questionCount: 15,
    participantCount: 78,
    createdAt: "2023-11-05T14:20:00Z"
  },
  { 
    id: "quiz3", 
    title: "Sejarah Dunia", 
    code: "SEJARAH", 
    status: "inactive", 
    questionCount: 12,
    participantCount: 0,
    createdAt: "2023-09-22T09:15:00Z"
  },
];

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [activeTab, setActiveTab] = useState("quizzes");
  
  // In a real app, we would fetch data from Supabase here
  useEffect(() => {
    // Simulating data fetch
    console.log("Fetching data from Supabase...");
  }, []);

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
          <Link 
            to="/"
            className="w-full p-3 flex items-center justify-center gap-2 border-4 border-black bg-white hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
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
                          quiz.status === "active" ? "bg-green-400" : "bg-gray-400"
                        }`}>
                          {quiz.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      
                      <p className="mb-4">Kode: <span className="font-bold">{quiz.code}</span></p>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>Pertanyaan: <span className="font-bold">{quiz.questionCount}</span></div>
                        <div>Peserta: <span className="font-bold">{quiz.participantCount}</span></div>
                        <div>Dibuat: <span className="font-bold">{new Date(quiz.createdAt).toLocaleDateString("id-ID")}</span></div>
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
                    </div>
                  </div>
                ))}
              </div>
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
