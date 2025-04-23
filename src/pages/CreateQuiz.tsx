import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Clock,
  Save,
  Loader2
} from "lucide-react";
import { createQuiz, getQuiz, updateQuiz, createQuestion, updateQuestion, deleteQuestion } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Question = {
  id?: string;
  quiz_id?: string;
  question_text: string;
  media_url: string;
  options: {
    text: string;
    id: string;
  }[];
  correct_option: number;
  points: number;
  time_limit?: number;
};

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState("30");
  const [defaultPoints, setDefaultPoints] = useState("10");
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: "",
      media_url: "",
      options: [
        { id: "o1", text: "" },
        { id: "o2", text: "" },
        { id: "o3", text: "" },
        { id: "o4", text: "" },
      ],
      correct_option: 0,
      points: 10
    }
  ]);

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }
    
    if (quizId) {
      fetchQuiz();
    }
  }, [navigate, quizId]);
  
  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await getQuiz(quizId!);
      const quiz = response.data;
      
      setTitle(quiz.title);
      setDescription(quiz.description || "");
      setTimePerQuestion(String(quiz.duration_per_question));
      setDefaultPoints(String(quiz.default_points));
      
      if (quiz.questions && quiz.questions.length > 0) {
        setQuestions(quiz.questions.map((q: any) => ({
          id: q.id,
          quiz_id: q.quiz_id,
          question_text: q.question_text,
          media_url: q.media_url || "",
          options: JSON.parse(q.options),
          correct_option: q.correct_option,
          points: q.points,
          time_limit: q.time_limit
        })));
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan data kuis. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        media_url: "",
        options: [
          { id: `o1`, text: "" },
          { id: `o2`, text: "" },
          { id: `o3`, text: "" },
          { id: `o4`, text: "" },
        ],
        correct_option: 0,
        points: parseInt(defaultPoints)
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestionField = (index: number, field: keyof Question, value: any) => {
    setQuestions(questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(questions.map((q, i) => {
      if (i === qIndex) {
        const updatedOptions = [...q.options];
        updatedOptions[oIndex] = { ...updatedOptions[oIndex], text };
        return { ...q, options: updatedOptions };
      }
      return q;
    }));
  };
  
  const setCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions(questions.map((q, i) => 
      i === qIndex ? { ...q, correct_option: oIndex } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validasi dasar
      if (!title) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Judul kuis harus diisi",
        });
        return;
      }
      
      // Validasi pertanyaan
      for (const [index, question] of questions.entries()) {
        if (!question.question_text.trim()) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Pertanyaan ${index + 1} harus diisi`,
          });
          return;
        }
        
        const allOptionsHaveText = question.options.every(o => o.text.trim() !== "");
        if (!allOptionsHaveText) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Semua opsi jawaban di pertanyaan ${index + 1} harus diisi`,
          });
          return;
        }

        // Validasi opsi jawaban yang benar
        if (question.correct_option < 0 || question.correct_option >= question.options.length) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Pilih jawaban yang benar untuk pertanyaan ${index + 1}`,
          });
          return;
        }
      }
      
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      if (!adminUser.id) {
        throw new Error("User ID tidak ditemukan. Silakan login kembali.");
      }
      
      let savedQuizId = quizId;
      
      // Persiapkan data kuis
      const quizData = {
        title: title.trim(),
        description: description.trim(),
        duration_per_question: parseInt(timePerQuestion),
        default_points: parseInt(defaultPoints),
      };

      // Buat atau update kuis
      if (!quizId) {
        const response = await createQuiz(quizData, adminUser.id);
        if (!response.data || !response.data[0]) {
          throw new Error('Gagal membuat kuis: Tidak ada data yang dikembalikan');
        }
        savedQuizId = response.data[0].id;
      } else {
        await updateQuiz(quizId, quizData);
      }
      
      // Proses setiap pertanyaan
      for (const [index, question] of questions.entries()) {
        const questionData = {
          question_text: question.question_text.trim(),
          media_url: question.media_url.trim(),
          options: JSON.stringify(question.options.map(opt => ({
            text: opt.text.trim(),
            id: opt.id
          }))),
          correct_option: question.correct_option,
          points: question.points,
          time_limit: parseInt(timePerQuestion)
        };
        
        try {
          if (question.id) {
            await updateQuestion(question.id, questionData);
          } else {
            const response = await createQuestion(savedQuizId!, questionData);
            
            if (!response.data || !response.data[0]) {
              throw new Error(`Gagal membuat pertanyaan ${index + 1}: Tidak ada data yang dikembalikan`);
            }
            
            // Update state dengan ID baru
            question.id = response.data[0].id;
            question.quiz_id = savedQuizId;
          }
        } catch (error) {
          console.error(`Error pada pertanyaan ${index + 1}:`, error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Gagal menyimpan pertanyaan ${index + 1}: ${error.message}`,
          });
          throw error; // Re-throw untuk menangani di level atas
        }
      }
      
      toast({
        title: "Sukses",
        description: "Kuis berhasil disimpan",
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error dalam handleSubmit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan kuis",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neo-lightgray flex flex-col">
        <nav className="neo-navbar flex justify-between items-center">
          <div className="text-2xl font-bold">Kuisin.</div>
          <Link to="/admin/dashboard" className="font-medium flex items-center gap-2 hover:text-neo-blue transition-colors">
            <ArrowLeft size={20} />
            Kembali ke Dashboard
          </Link>
        </nav>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <Loader2 size={50} className="animate-spin mb-4 mx-auto text-neo-blue" />
            <p className="text-xl">Memuat data kuis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-lightgray flex flex-col">
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin.</div>
        <Link to="/admin/dashboard" className="font-medium flex items-center gap-2 hover:text-neo-blue transition-colors">
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </Link>
      </nav>
      
      <div className="container mx-auto py-8 px-4">
        <div className="neo-card mb-8">
          <h1 className="text-3xl font-bold mb-6">{quizId ? 'Edit Kuis' : 'Buat Kuis Baru'}</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="space-y-4 p-6 border-4 border-black">
                <h2 className="text-xl font-bold mb-4">Informasi Kuis</h2>
                
                <div className="space-y-2">
                  <label htmlFor="title" className="block font-bold">Judul Kuis</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="neo-input w-full"
                    placeholder="Masukkan judul kuis"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block font-bold">Deskripsi (Opsional)</label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="neo-input w-full h-24"
                    placeholder="Deskripsi singkat tentang kuis ini"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="timePerQuestion" className="block font-bold">Waktu per Pertanyaan (detik)</label>
                    <div className="flex items-center">
                      <Clock className="mr-2" size={20} />
                      <Input
                        id="timePerQuestion"
                        type="number"
                        value={timePerQuestion}
                        onChange={(e) => setTimePerQuestion(e.target.value)}
                        className="neo-input w-full"
                        min="5"
                        max="120"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="defaultPoints" className="block font-bold">Nilai Default</label>
                    <Input
                      id="defaultPoints"
                      type="number"
                      value={defaultPoints}
                      onChange={(e) => setDefaultPoints(e.target.value)}
                      className="neo-input w-full"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>
                
                {quizId && (
                  <div className="mt-4 p-3 bg-gray-100 border-4 border-black">
                    <p className="font-bold">Kode Kuis: <span className="text-neo-blue">{quizId}</span></p>
                    <p className="text-sm mt-1">Peserta akan menggunakan kode ini untuk bergabung ke kuis.</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Pertanyaan</h2>
                </div>
                
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-6 border-4 border-black bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Pertanyaan {qIndex + 1}</h3>
                      <Button 
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 bg-neo-red text-white border-2 border-black"
                        disabled={questions.length === 1}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor={`q-${qIndex}`} className="block font-bold">Teks Pertanyaan</label>
                        <Textarea
                          id={`q-${qIndex}`}
                          value={question.question_text}
                          onChange={(e) => updateQuestionField(qIndex, "question_text", e.target.value)}
                          className="neo-input w-full"
                          placeholder="Masukkan pertanyaan"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor={`img-${qIndex}`} className="block font-bold">URL Gambar (Opsional)</label>
                        <Input
                          id={`img-${qIndex}`}
                          value={question.media_url}
                          onChange={(e) => updateQuestionField(qIndex, "media_url", e.target.value)}
                          className="neo-input w-full"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option, oIndex) => (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`opt-${qIndex}-${oIndex}`} className="font-bold">Opsi {oIndex + 1}</label>
                              <button
                                type="button"
                                onClick={() => setCorrectOption(qIndex, oIndex)}
                                className={`ml-auto p-1 border-2 border-black ${
                                  question.correct_option === oIndex 
                                    ? "bg-green-500 text-white" 
                                    : "bg-white hover:bg-gray-100"
                                }`}
                              >
                                {question.correct_option === oIndex ? <Check size={16} /> : <X size={16} />}
                              </button>
                            </div>
                            <Input
                              id={`opt-${qIndex}-${oIndex}`}
                              value={option.text}
                              onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                              className="neo-input w-full"
                              placeholder="Teks pilihan jawaban"
                              required
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="max-w-xs">
                        <label htmlFor={`points-${qIndex}`} className="block font-bold">Nilai Poin</label>
                        <Input
                          id={`points-${qIndex}`}
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestionField(qIndex, "points", parseInt(e.target.value))}
                          className="neo-input w-full"
                          min="1"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button"
                  onClick={addQuestion}
                  className="neo-button-secondary flex items-center gap-2 w-full justify-center py-3"
                >
                  <Plus size={18} />
                  Tambah Pertanyaan
                </Button>
              </div>
              
              <div className="flex justify-end gap-4">
                <Link 
                  to="/admin/dashboard"
                  className="neo-button-secondary flex items-center gap-2"
                >
                  Batal
                </Link>
                <Button
                  type="submit"
                  className="neo-button flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Simpan Kuis</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
