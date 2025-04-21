
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

// Mock quiz data for demonstration
const mockQuiz = {
  id: "quiz1",
  title: "Pengetahuan Umum Indonesia",
  description: "Tes pengetahuan umum tentang Indonesia",
  timePerQuestion: 30,
  questions: [
    {
      id: "q1",
      text: "Pulau terbesar di Indonesia adalah...",
      image: "",
      options: [
        { id: "q1_o1", text: "Jawa", isCorrect: false },
        { id: "q1_o2", text: "Kalimantan", isCorrect: true },
        { id: "q1_o3", text: "Sumatera", isCorrect: false },
        { id: "q1_o4", text: "Sulawesi", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "q2",
      text: "Ibukota Indonesia adalah...",
      image: "",
      options: [
        { id: "q2_o1", text: "Jakarta", isCorrect: true },
        { id: "q2_o2", text: "Bandung", isCorrect: false },
        { id: "q2_o3", text: "Surabaya", isCorrect: false },
        { id: "q2_o4", text: "Yogyakarta", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "q3",
      text: "Monumen Nasional (Monas) terletak di kota...",
      image: "https://images.unsplash.com/photo-1543662086-9643de8a8e8f",
      options: [
        { id: "q3_o1", text: "Bandung", isCorrect: false },
        { id: "q3_o2", text: "Yogyakarta", isCorrect: false },
        { id: "q3_o3", text: "Jakarta", isCorrect: true },
        { id: "q3_o4", text: "Surabaya", isCorrect: false }
      ],
      points: 15
    },
    {
      id: "q4",
      text: "Kapan Indonesia merdeka?",
      image: "",
      options: [
        { id: "q4_o1", text: "17 Agustus 1945", isCorrect: true },
        { id: "q4_o2", text: "17 Agustus 1944", isCorrect: false },
        { id: "q4_o3", text: "16 Agustus 1945", isCorrect: false },
        { id: "q4_o4", text: "18 Agustus 1945", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "q5",
      text: "Provinsi mana yang terletak di ujung barat Indonesia?",
      image: "",
      options: [
        { id: "q5_o1", text: "Aceh", isCorrect: true },
        { id: "q5_o2", text: "Sumatera Utara", isCorrect: false },
        { id: "q5_o3", text: "Kalimantan Barat", isCorrect: false },
        { id: "q5_o4", text: "Papua", isCorrect: false }
      ],
      points: 15
    }
  ]
};

// Mock leaderboard data
const mockLeaderboard = [
  { id: "p1", name: "Andi", score: 58 },
  { id: "p2", name: "Budi", score: 45 },
  { id: "p3", name: "Cindy", score: 60 },
  { id: "p4", name: "Doni", score: 35 },
  { id: "p5", name: "Eva", score: 50 }
];

const QuizPlay = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const playerName = searchParams.get("name") || "Tamu";
  
  const [quiz, setQuiz] = useState(mockQuiz);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [playerRank, setPlayerRank] = useState<number>(0);
  const [answers, setAnswers] = useState<{ questionId: string; optionId: string | null; isCorrect: boolean; points: number }[]>([]);
  
  // Use NodeJS.Timeout type for the timer reference
  const timerRef = useRef<number | undefined>(undefined);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Set up timer for first question on component mount
  useEffect(() => {
    if (!quizCompleted) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Update timer when question changes
  useEffect(() => {
    if (!quizCompleted && !isAnswerSubmitted) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex]);
  
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial time
    setTimeLeft(quiz.timePerQuestion);
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, submit answer automatically
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (!isAnswerSubmitted) {
            handleAnswerSubmit(null);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const handleOptionSelect = (optionId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionId);
    }
  };
  
  const handleAnswerSubmit = (optionId: string | null) => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsAnswerSubmitted(true);
    setSelectedOption(optionId);
    
    // Determine if answer is correct
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    const isCorrect = !!selectedOption?.isCorrect;
    
    // Award points if correct
    const pointsEarned = isCorrect ? parseInt(currentQuestion.points.toString()) : 0;
    setScore(prevScore => prevScore + pointsEarned);
    
    // Save answer for review
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        optionId,
        isCorrect,
        points: pointsEarned
      }
    ]);
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      } else {
        // Quiz completed
        finishQuiz();
      }
    }, 2000);
  };
  
  const finishQuiz = () => {
    setQuizCompleted(true);
    
    // In a real app, we would send the results to Supabase via Edge Functions
    // For now, let's just calculate where the player would rank on the leaderboard
    const updatedLeaderboard = [...leaderboard, { id: "current", name: playerName, score }];
    updatedLeaderboard.sort((a, b) => b.score - a.score);
    
    const rank = updatedLeaderboard.findIndex(p => p.id === "current") + 1;
    setPlayerRank(rank);
    
    // Remove current player from the displayed leaderboard to avoid duplication
    setLeaderboard(updatedLeaderboard.filter(p => p.id !== "current"));
  };

  return (
    <div className="min-h-screen bg-neo-lightgray flex flex-col">
      <nav className="neo-navbar flex justify-between items-center">
        <div className="text-2xl font-bold">Kuisin.</div>
        {!quizCompleted && (
          <div className="flex items-center gap-4">
            <div className="font-medium">Pemain: <span className="font-bold">{playerName}</span></div>
            <div className="font-medium">Skor: <span className="font-bold">{score}</span></div>
          </div>
        )}
      </nav>
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {!quizCompleted ? (
          <div className="neo-card max-w-3xl mx-auto">
            {/* Question header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-white">
                <Clock size={20} />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>
            
            {/* Question */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">{currentQuestion.text}</h3>
              
              {currentQuestion.image && (
                <div className="mb-6">
                  <img 
                    src={currentQuestion.image} 
                    alt={`Gambar untuk ${currentQuestion.text}`}
                    className="max-h-64 mx-auto border-4 border-black"
                  />
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option) => {
                let optionClass = "p-4 border-4 border-black cursor-pointer transition-all";
                
                if (isAnswerSubmitted) {
                  if (option.isCorrect) {
                    optionClass += " bg-green-200 border-green-500";
                  } else if (option.id === selectedOption && !option.isCorrect) {
                    optionClass += " bg-red-200 border-red-500";
                  } else {
                    optionClass += " opacity-70";
                  }
                } else {
                  optionClass += option.id === selectedOption
                    ? " bg-neo-blue text-white"
                    : " bg-white hover:bg-gray-100";
                }
                
                return (
                  <button
                    key={option.id}
                    className={optionClass}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isAnswerSubmitted}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{option.id.split("_").pop()}</span>
                      <span>{option.text}</span>
                      
                      {isAnswerSubmitted && option.isCorrect && (
                        <CheckCircle size={24} className="ml-auto text-green-600" />
                      )}
                      
                      {isAnswerSubmitted && option.id === selectedOption && !option.isCorrect && (
                        <XCircle size={24} className="ml-auto text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Submit button */}
            {!isAnswerSubmitted && (
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => handleAnswerSubmit(selectedOption)}
                  className="neo-button"
                  disabled={selectedOption === null}
                >
                  Jawab
                </Button>
              </div>
            )}
            
            {/* Feedback message */}
            {isAnswerSubmitted && (
              <div className={`mt-6 p-4 flex items-center gap-3 border-4 ${
                selectedOption && currentQuestion.options.find(o => o.id === selectedOption)?.isCorrect
                  ? "bg-green-100 border-green-500"
                  : "bg-red-100 border-red-500"
              }`}>
                {selectedOption && currentQuestion.options.find(o => o.id === selectedOption)?.isCorrect ? (
                  <>
                    <CheckCircle size={24} className="text-green-600" />
                    <div>
                      <p className="font-bold">Benar!</p>
                      <p>Kamu mendapatkan {currentQuestion.points} poin.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={24} className="text-red-600" />
                    <div>
                      <p className="font-bold">Salah!</p>
                      <p>Jawaban yang benar: {currentQuestion.options.find(o => o.isCorrect)?.text}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="neo-card mb-8">
              <h1 className="text-3xl font-bold mb-2">Kuis Selesai!</h1>
              <p className="text-xl mb-6">Terima kasih telah berpartisipasi, {playerName}!</p>
              
              <div className="text-center p-6 mb-6 border-4 border-black bg-white">
                <h2 className="text-2xl font-bold mb-2">Skor Akhir</h2>
                <p className="text-5xl font-bold text-neo-blue">{score}</p>
                <p className="mt-2">Peringkat: #{playerRank} dari {leaderboard.length + 1} peserta</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 border-b-4 border-black pb-2">Jawaban Kamu</h2>
                  <div className="space-y-4">
                    {answers.map((answer, index) => {
                      const question = quiz.questions.find(q => q.id === answer.questionId)!;
                      const selectedOption = answer.optionId 
                        ? question.options.find(o => o.id === answer.optionId)
                        : null;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 border-l-8 ${
                            answer.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                          }`}
                        >
                          <p className="font-bold">{index + 1}. {question.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {answer.isCorrect ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <XCircle size={16} className="text-red-600" />
                            )}
                            <p>
                              {selectedOption 
                                ? `Jawaban: ${selectedOption.text}`
                                : "Tidak menjawab"}
                              {answer.isCorrect && ` (+${answer.points} poin)`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-4 border-b-4 border-black pb-2">Papan Peringkat</h2>
                  <div className="space-y-2">
                    {leaderboard.map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`p-3 border-4 border-black flex justify-between items-center ${
                          playerRank === index + 1 ? "bg-neo-blue text-white" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">#{index + 1}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="font-bold">{player.score}</span>
                      </div>
                    ))}
                    
                    {/* Current player with highlighting */}
                    <div 
                      className="p-3 border-4 border-black bg-neo-blue text-white flex justify-between items-center animate-pulse-scale"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold">#{playerRank}</span>
                        <span>{playerName} (Kamu)</span>
                      </div>
                      <span className="font-bold">{score}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/" className="neo-button inline-block">
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlay;
