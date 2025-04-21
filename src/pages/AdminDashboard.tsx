import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  LogOut, 
  Plus, 
  BarChartIcon, 
  List, 
  Users,
  Archive,
  Settings,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Download,
  ChevronRight,
  ChevronDown,
  Menu
} from "lucide-react";
import { 
  getQuizzes, 
  deleteQuiz, 
  toggleQuizStatus, 
  getQuestions, 
  getParticipants, 
  getLeaderboard,
  getParticipantAnswers 
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { exportToCSV } from "@/lib/csvExport";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

type Participant = {
  id: string;
  name: string;
  score: number;
  completion_time: number | null;
};

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizStats, setQuizStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [leaderboardMap, setLeaderboardMap] = useState<Record<string, Participant[]>>({});
  const [participantAnswers, setParticipantAnswers] = useState<any>({});
  const [participantsStats, setParticipantsStats] = useState<any[]>([]);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [participantDetails, setParticipantDetails] = useState<any>(null);
  const [loadingParticipantDetails, setLoadingParticipantDetails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const adminSession = localStorage.getItem('adminSession');
  
  useEffect(() => {
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }
    fetchQuizzes();
  }, [navigate]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data.data || []);
      fetchQuizStats(data.data || []);
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

  const fetchQuizStats = async (quizList: Quiz[]) => {
    const stats = await Promise.all(
      quizList.map(async (quiz) => {
        const [questionsRes, participantsRes, leaderboardRes] = await Promise.all([
          getQuestions(quiz.id),
          getParticipants(quiz.id),
          getLeaderboard(quiz.id),
        ]);
        return {
          quizId: quiz.id,
          numQuestions: questionsRes.data.length,
          numParticipants: participantsRes.data.length,
          leaderboard: leaderboardRes.data,
          participants: participantsRes.data,
          avgTime: participantsRes.data.length
            ? (
                participantsRes.data
                  .filter((p: any) => p.completion_time != null)
                  .reduce((acc: number, p: any) => acc + (p.completion_time || 0), 0) /
                participantsRes.data.length
              ).toFixed(2)
            : 0,
        };
      })
    );
    setQuizStats(stats);
    setParticipantsStats(stats.map(s => ({
      quizTitle: quizzes.find(q => q.id === s.quizId)?.title,
      jumlahPeserta: s.numParticipants,
      rata2Waktu: s.avgTime,
      quizId: s.quizId,
    })));
    const lbMap: Record<string, Participant[]> = {};
    stats.forEach(s => {
      lbMap[s.quizId] = s.leaderboard;
    });
    setLeaderboardMap(lbMap);
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
    navigate('/');
  };

  const handleDownloadLeaderboardCSV = (quizId: string) => {
    const leaderboard = leaderboardMap[quizId] || [];
    const quiz = quizzes.find(q => q.id === quizId);
    const stat = quizStats.find(s => s.quizId === quizId);

    const data = leaderboard.map((item, idx) => ({
      Peringkat: idx + 1,
      Nama: item.name,
      Skor: item.score,
      Waktu: item.completion_time ?? '-',
    }));
    exportToCSV(data, `${quiz?.title || 'Leaderboard'}.csv`);
  };

  const handleViewParticipantDetails = async (participantId: string, quizId: string) => {
    try {
      setLoadingParticipantDetails(true);
      setSelectedParticipant(participantId);
      
      const response = await getParticipantAnswers(participantId, quizId);
      setParticipantDetails(response.data);
    } catch (error) {
      console.error("Error fetching participant details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan data peserta. Silakan coba lagi.",
      });
    } finally {
      setLoadingParticipantDetails(false);
    }
  };

  const handleDownloadParticipantsCSV = () => {
    const allData: any[] = [];
    quizStats.forEach(stat => {
      (stat.leaderboard || []).forEach((p: any, idx: number) => {
        allData.push({
          Kuis: quizzes.find(q => q.id === stat.quizId)?.title ?? '',
          Nama: p.name,
          Skor: p.score,
          Waktu: p.completion_time ?? '-',
        });
      });
    });
    exportToCSV(allData, "Peserta-Kuisin.csv");
  };

  const goHome = () => navigate("/");

  return (
    <div className="min-h-screen bg-neo-lightgray flex">
      {/* Sidebar Toggle Button */}
      <button
        ref={toggleButtonRef}
        className="fixed top-4 left-4 p-2 bg-white border-2 border-black z-20 md:static md:top-auto md:left-auto"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed md:relative inset-y-0 left-0 w-64 bg-white border-r-4 border-black flex flex-col transform transition-transform duration-300 ease-in-out z-10 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 border-b-4 border-black">
          <button type="button" onClick={goHome} className="text-2xl font-bold hover:text-neo-blue transition-colors">
            Kuisin
          </button>
          <p className="text-sm">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setActiveTab("quizzes");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${activeTab === "quizzes" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"}`}
              >
                <List size={20} />
                <span>Kuis</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("stats");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${activeTab === "stats" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"}`}
              >
                <BarChartIcon size={20} />
                <span>Statistik</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("participants");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${activeTab === "participants" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"}`}
              >
                <Users size={20} />
                <span>Peserta</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("archived");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${activeTab === "archived" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"}`}
              >
                <Archive size={20} />
                <span>Arsip</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 flex items-center gap-3 border-4 border-black ${activeTab === "settings" ? "bg-neo-blue text-white" : "bg-white hover:bg-gray-100"}`}
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <header className="bg-white p-4 border-b-4 border-black flex justify-between items-center ml-12 md:ml-0">
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

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === "quizzes" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={40} className="animate-spin text-neo-blue" />
                </div>
              ) : quizzes.length === 0 ? (
                <div className="neo-card p-4 md:p-6 text-center">
                  <p className="text-lg mb-4">Belum ada kuis yang dibuat</p>
                  <Link to="/admin/quiz/create" className="neo-button inline-flex items-center gap-2">
                    <Plus size={18} />
                    <span>Buat Kuis Baru</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {quizzes.map((quiz) => {
                    const stat = quizStats.find((s) => s.quizId === quiz.id);
                    return (
                      <div
                        key={quiz.id}
                        className="neo-card p-4 md:p-6 flex flex-col gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{quiz.title}</h3>
                            <span className={`px-2 py-1 text-xs border-2 border-black ${quiz.is_active ? "bg-green-400" : "bg-gray-400"}`}>
                              {quiz.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                          <p className="mb-4">Kode: <span className="font-bold">{quiz.code}</span></p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>Nilai Default: <span className="font-bold">{quiz.default_points}</span></div>
                            <div>Soal: <span className="font-bold">{stat?.numQuestions ?? 0}</span></div>
                            <div>Peserta: <span className="font-bold">{stat?.numParticipants ?? 0}</span></div>
                            <div>Waktu per Soal: <span className="font-bold">{quiz.duration_per_question}s</span></div>
                            <div>Dibuat: <span className="font-bold">{new Date(quiz.created_at).toLocaleDateString("id-ID")}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/admin/quiz/${quiz.id}`}
                            className="neo-button-secondary py-2 px-4 text-sm"
                          >
                            Edit Kuis
                          </Link>
                          <button
                            onClick={() => setActiveTab("leaderboard-" + quiz.id)}
                            className="neo-button-secondary py-2 px-4 text-sm"
                          >
                            Lihat Hasil
                          </button>
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
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab.startsWith("leaderboard-") && (() => {
            const quizId = activeTab.replace("leaderboard-", "");
            const quiz = quizzes.find(q => q.id === quizId);
            const leaderboard = leaderboardMap[quizId] || [];
            const stat = quizStats.find(s => s.quizId === quizId);

            return (
              <div className="neo-card p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">Hasil Kuis: {quiz?.title}</h3>
                  <Button className="flex items-center gap-2" onClick={() => handleDownloadLeaderboardCSV(quizId)}>
                    <Download size={16} />
                    Unduh CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peringkat</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((participant, idx) => (
                      <TableRow key={participant.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.score}</TableCell>
                        <TableCell>{participant.completion_time ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="secondary" className="mt-6" onClick={() => setActiveTab("quizzes")}>Kembali</Button>
                
                {selectedParticipant && participantDetails && (
                  <div className="mt-8 border-t-4 border-black pt-6">
                    <h4 className="text-lg font-bold mb-4">
                      Detail Jawaban: {participantDetails.participant.name}
                    </h4>
                    
                    {loadingParticipantDetails ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={30} className="animate-spin text-neo-blue" />
                      </div>
                    ) : (
                      <div className="bg-white border-4 border-black p-4">
                        <Accordion type="single" collapsible className="w-full">
                          {participantDetails.answers.map((answer: any, index: number) => (
                            <AccordionItem key={answer.id} value={answer.id}>
                              <AccordionTrigger className="py-4 px-4 hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                  <span className="font-bold">Pertanyaan {index + 1}</span>
                                  <span className={answer.is_correct ? "text-green-600" : "text-red-600"}>
                                    {answer.is_correct ? "Benar" : "Salah"}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <p><span className="font-bold">Pertanyaan:</span> {answer.questions.question_text}</p>
                                  <p><span className="font-bold">Jawaban:</span> {
                                    JSON.parse(answer.questions.options)[answer.selected_option]?.text || "Tidak ada jawaban"
                                  }</p>
                                  <p><span className="font-bold">Jawaban Benar:</span> {
                                    JSON.parse(answer.questions.options)[answer.questions.correct_option]?.text || "Tidak ada jawaban"
                                  }</p>
                                  <p><span className="font-bold">Poin:</span> {answer.points_earned}</p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => {
                            setSelectedParticipant(null);
                            setParticipantDetails(null);
                          }}
                        >
                          Tutup Detail
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "stats" && (
            <div className="neo-card p-6">
              <h3 className="text-xl font-bold mb-4">Statistik Kuis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 border-4 border-black bg-white">
                  <div className="font-bold text-lg">{quizzes.length}</div>
                  <div>Total Kuis</div>
                </div>
                <div className="p-4 border-4 border-black bg-white">
                  <div className="font-bold text-lg">{quizzes.filter(q => q.is_active).length}</div>
                  <div>Kuis Aktif</div>
                </div>
                <div className="p-4 border-4 border-black bg-white">
                  <div className="font-bold text-lg">
                    {quizStats.reduce((acc, s) => acc + (s.numParticipants || 0), 0)}
                  </div>
                  <div>Total Peserta</div>
                </div>
                <div className="p-4 border-4 border-black bg-white">
                  <div className="font-bold text-lg">
                    {quizStats.length
                      ? (
                        quizStats.reduce((acc, s) => acc + Number(s.avgTime || 0), 0) /
                        quizStats.length
                      ).toFixed(2)
                      : 0}
                  </div>
                  <div>Rata-rata Waktu/Kuis</div>
                </div>
              </div>
              <div className="mt-10">
                <h4 className="font-bold mb-6">Grafik Peserta per Kuis</h4>
                <div className="bg-white border-4 border-black p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={participantsStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="quizTitle" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{
                          fontSize: 12,
                          fill: '#000000'
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="neo-card bg-white border-2 border-black p-3 shadow-lg">
                                <p className="font-medium text-sm md:text-base mb-1">Kuis: {data.quizTitle}</p>
                                <p className="text-sm md:text-base">Jumlah Peserta: {data.jumlahPeserta}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="jumlahPeserta" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="neo-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Daftar Peserta</h3>
                <Button onClick={handleDownloadParticipantsCSV} className="flex items-center gap-2">
                  <Download size={16} />
                  Unduh Semua Data CSV
                </Button>
              </div>

              <div className="space-y-6">
                {quizzes.map((quiz) => {
                  const stat = quizStats.find((s) => s.quizId === quiz.id);
                  const participants = stat?.leaderboard || [];
                  
                  return (
                    <div key={quiz.id} className="neo-card p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold">{quiz.title}</h4>
                        <span className="text-sm text-gray-600">
                          Total Peserta: {participants.length}
                        </span>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto border-4 border-black">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama</TableHead>
                              <TableHead>Skor</TableHead>
                              <TableHead>Waktu</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {participants.map((participant) => (
                              <TableRow key={participant.id}>
                                <TableCell>{participant.name}</TableCell>
                                <TableCell>{participant.score}</TableCell>
                                <TableCell>{participant.completion_time ?? '-'}</TableCell>
                              </TableRow>
                            ))}
                            {participants.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-4">
                                  Belum ada peserta
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedParticipant && participantDetails && (
                <div className="mt-8 border-t-4 border-black pt-6">
                  <h4 className="text-lg font-bold mb-4">
                    Detail Jawaban: {participantDetails.participant.name}
                  </h4>
                  
                  {loadingParticipantDetails ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={30} className="animate-spin text-neo-blue" />
                    </div>
                  ) : (
                    <div className="bg-white border-4 border-black p-4">
                      <Accordion type="single" collapsible className="w-full">
                        {participantDetails.answers.map((answer: any, index: number) => (
                          <AccordionItem key={answer.id} value={answer.id}>
                            <AccordionTrigger className="py-4 px-4 hover:bg-gray-50">
                              <div className="flex items-center gap-4">
                                <span className="font-bold">Pertanyaan {index + 1}</span>
                                <span className={answer.is_correct ? "text-green-600" : "text-red-600"}>
                                  {answer.is_correct ? "Benar" : "Salah"}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-gray-50">
                              <div className="space-y-3">
                                <p><span className="font-bold">Pertanyaan:</span> {answer.questions.question_text}</p>
                                <p><span className="font-bold">Jawaban:</span> {
                                  JSON.parse(answer.questions.options)[answer.selected_option]?.text || "Tidak ada jawaban"
                                }</p>
                                <p><span className="font-bold">Jawaban Benar:</span> {
                                  JSON.parse(answer.questions.options)[answer.questions.correct_option]?.text || "Tidak ada jawaban"
                                }</p>
                                <p><span className="font-bold">Poin:</span> {answer.points_earned}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => {
                          setSelectedParticipant(null);
                          setParticipantDetails(null);
                        }}
                      >
                        Tutup Detail
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
