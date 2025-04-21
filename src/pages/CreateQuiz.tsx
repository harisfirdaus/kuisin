
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Save
} from "lucide-react";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Quiz basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState("30");
  
  // Questions
  const [questions, setQuestions] = useState([
    {
      id: "q1",
      text: "",
      image: "",
      options: [
        { id: "o1", text: "", isCorrect: false },
        { id: "o2", text: "", isCorrect: false },
        { id: "o3", text: "", isCorrect: false },
        { id: "o4", text: "", isCorrect: false },
      ],
      points: "10"
    }
  ]);

  const addQuestion = () => {
    const newQuestionId = `q${questions.length + 1}`;
    setQuestions([
      ...questions,
      {
        id: newQuestionId,
        text: "",
        image: "",
        options: [
          { id: `${newQuestionId}_o1`, text: "", isCorrect: false },
          { id: `${newQuestionId}_o2`, text: "", isCorrect: false },
          { id: `${newQuestionId}_o3`, text: "", isCorrect: false },
          { id: `${newQuestionId}_o4`, text: "", isCorrect: false },
        ],
        points: "10"
      }
    ]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionId: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => {
            // If updating isCorrect and setting it to true, make sure other options are set to false
            if (field === "isCorrect" && value === true) {
              return o.id === optionId ? { ...o, isCorrect: true } : { ...o, isCorrect: false };
            }
            return o.id === optionId ? { ...o, [field]: value } : o;
          })
        };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!title) {
      alert("Judul kuis harus diisi");
      setIsSubmitting(false);
      return;
    }
    
    // Validate questions
    for (const question of questions) {
      if (!question.text) {
        alert("Semua pertanyaan harus diisi");
        setIsSubmitting(false);
        return;
      }
      
      const hasCorrectOption = question.options.some(o => o.isCorrect);
      const allOptionsHaveText = question.options.every(o => o.text.trim() !== "");
      
      if (!hasCorrectOption) {
        alert("Setiap pertanyaan harus memiliki jawaban yang benar");
        setIsSubmitting(false);
        return;
      }
      
      if (!allOptionsHaveText) {
        alert("Semua opsi jawaban harus diisi");
        setIsSubmitting(false);
        return;
      }
    }
    
    // In a real app, we would send this data to Supabase via Edge Functions
    // For demo, we'll just simulate a successful creation
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful submission and redirect
      navigate("/admin/dashboard", { state: { quizCreated: true } });
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Gagal membuat kuis. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-6">Buat Kuis Baru</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Quiz Info Section */}
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
                
                <div className="space-y-2 max-w-xs">
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
              </div>
              
              {/* Questions Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Pertanyaan</h2>
                  <Button 
                    type="button"
                    onClick={addQuestion}
                    className="neo-button-secondary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Tambah Pertanyaan
                  </Button>
                </div>
                
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="p-6 border-4 border-black bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Pertanyaan {qIndex + 1}</h3>
                      <Button 
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-2 bg-neo-red text-white border-2 border-black"
                        disabled={questions.length === 1}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor={`q-${question.id}`} className="block font-bold">Teks Pertanyaan</label>
                        <Textarea
                          id={`q-${question.id}`}
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                          className="neo-input w-full"
                          placeholder="Masukkan pertanyaan"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor={`img-${question.id}`} className="block font-bold">URL Gambar (Opsional)</label>
                        <Input
                          id={`img-${question.id}`}
                          value={question.image}
                          onChange={(e) => updateQuestion(question.id, "image", e.target.value)}
                          className="neo-input w-full"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option) => (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`opt-${option.id}`} className="font-bold">Opsi {option.id.split("_").pop()}</label>
                              <button
                                type="button"
                                onClick={() => updateOption(question.id, option.id, "isCorrect", true)}
                                className={`ml-auto p-1 border-2 border-black ${
                                  option.isCorrect 
                                    ? "bg-green-500 text-white" 
                                    : "bg-white hover:bg-gray-100"
                                }`}
                              >
                                {option.isCorrect ? <Check size={16} /> : <X size={16} />}
                              </button>
                            </div>
                            <Input
                              id={`opt-${option.id}`}
                              value={option.text}
                              onChange={(e) => updateOption(question.id, option.id, "text", e.target.value)}
                              className="neo-input w-full"
                              placeholder="Teks pilihan jawaban"
                              required
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="max-w-xs">
                        <label htmlFor={`points-${question.id}`} className="block font-bold">Nilai Poin</label>
                        <Input
                          id={`points-${question.id}`}
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, "points", e.target.value)}
                          className="neo-input w-full"
                          min="1"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  <Save size={18} />
                  {isSubmitting ? "Menyimpan..." : "Simpan Kuis"}
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
