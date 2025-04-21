
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { getQuiz, getQuestions, submitAnswer, updateParticipant, getLeaderboard, getAnswers } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Question = {
  id: string;
  question_text: string;
  media_url: string | null;
  options: Array<{ id: string; text: string }>;
  correct_option: number;
  points: number;
  time_limit: number;
};

type Answer = {
  questionId: string;
  optionId: number | null;
  isCorrect: boolean;
  points: number;
};

type Participant = {
  id: string;
  name: string;
  score: number;
  completion_time: number | null;
};

const QuizPlay = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const playerName = searchParams.get("name") || "Tamu";
  const participantData = JSON.parse(localStorage.getItem('participant') || '{}');
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [playerRank, setPlayerRank] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  // Use ref for timer
  const timerRef = useRef<number | undefined>(undefined);
  
  // Current question shorthand
  const currentQuestion = questions[currentQuestionIndex];
  
  // Load quiz and questions on mount
  useEffect(() => {
    // Check if participant data exists
    if (!participantData.id || !participantData.quizId) {
      navigate('/join');
      return;
    }
    
    loadQuizData();
  }, [quizId, navigate]);
  
  // Set up timer when question changes
  useEffect(() => {
    if (!isLoading && !quizCompleted && !isAnswerSubmitted && currentQuestion) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, isLoading, quizCompleted, isAnswerSubmitted, currentQuestion]);
  
  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      
      // Get quiz details
      const quizResponse = await getQuiz(quizId!);
      setQuiz(quizResponse.data);
      
      // Get questions
      const questionsResponse = await getQuestions(quizId!);
      const formattedQuestions = questionsResponse.data.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options)
      }));
      setQuestions(formattedQuestions);
      
      // Record start time
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data kuis. Silakan coba lagi."
      });
      navigate('/join');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    // Set initial time
    setTimeLeft(currentQuestion.time_limit);
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, submit answer automatically
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
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
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionIndex);
    }
  };
  
  const handleAnswerSubmit = async (optionIndex: number | null) => {
    // Clear timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    setIsAnswerSubmitted(true);
    setSelectedOption(optionIndex);
    
    try {
      // Submit answer to backend
      const answerData = {
        selected_option: optionIndex !== null ? optionIndex : -1
      };
      
      const response = await submitAnswer(
        participantData.id,
        currentQuestion.id,
        answerData
      );
      
      // Update score
      setScore(response.newScore);
      
      // Save answer for review
      setAnswers([
        ...answers,
        {
          questionId: currentQuestion.id,
          optionId: optionIndex,
          isCorrect: response.isCorrect,
          points: response.pointsEarned
        }
      ]);
      
      // Wait before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          setSelectedOption(null);
          setIsAnswerSubmitted(false);
        } else {
          // Quiz completed
          finishQuiz();
        }
      }, 2000);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengirim jawaban. Silakan coba lagi."
      });
    }
  };
  
  const finishQuiz = async () => {
    setQuizCompleted(true);
    
    try {
      // Calculate completion time in seconds
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Update participant with completion time
      await updateParticipant(participantData.id, {
        completion_time: completionTime
      });
      
      // Get leaderboard
      const leaderboardResponse = await getLeaderboard(quizId!);
      setLeaderboard(leaderboardResponse.data);
      
      // Find player's rank
      const rank = leaderboardResponse.data.findIndex(p => p.id === participantData.id) + 1;
      setPlayerRank(rank);
      
      // Get detailed answers if needed
      const answersResponse = await getAnswers(participantData.id);
      
      // Clear participant data from local storage
      localStorage.removeItem('participant');
    } catch (error) {
      console.error("Error finishing quiz:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neo-lightgray flex flex-col">
        <nav className="neo-navbar flex justify-between items-center">
          <div className="text-2xl font-bold">Kuisin.</div>
        </nav>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <Loader2 size={50} className="animate-spin mb-4 mx-auto text-neo-blue" />
            <p className="text-xl">Memuat kuis...</p>
          </div>
        </div>
      </div>
    );
  }

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
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-white">
                <Clock size={20} />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>
            
            {/* Question */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">{currentQuestion.question_text}</h3>
              
              {currentQuestion.media_url && (
                <div className="mb-6">
                  <img 
                    src={currentQuestion.media_url} 
                    alt={`Gambar untuk ${currentQuestion.question_text}`}
                    className="max-h-64 mx-auto border-4 border-black"
                  />
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                let optionClass = "p-4 border-4 border-black cursor-pointer transition-all";
                
                if (isAnswerSubmitted) {
                  if (currentQuestion.correct_option === index) {
                    optionClass += " bg-green-200 border-green-500";
                  } else if (selectedOption === index && currentQuestion.correct_option !== index) {
                    optionClass += " bg-red-200 border-red-500";
                  } else {
                    optionClass += " opacity-70";
                  }
                } else {
                  optionClass += selectedOption === index
                    ? " bg-neo-blue text-white"
                    : " bg-white hover:bg-gray-100";
                }
                
                return (
                  <button
                    key={option.id}
                    className={optionClass}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswerSubmitted}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{index + 1}</span>
                      <span>{option.text}</span>
                      
                      {isAnswerSubmitted && currentQuestion.correct_option === index && (
                        <CheckCircle size={24} className="ml-auto text-green-600" />
                      )}
                      
                      {isAnswerSubmitted && selectedOption === index && currentQuestion.correct_option !== index && (
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
                selectedOption !== null && currentQuestion.correct_option === selectedOption
                  ? "bg-green-100 border-green-500"
                  : "bg-red-100 border-red-500"
              }`}>
                {selectedOption !== null && currentQuestion.correct_option === selectedOption ? (
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
                      <p>Jawaban yang benar: {currentQuestion.options[currentQuestion.correct_option].text}</p>
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
                      const question = questions.find(q => q.id === answer.questionId)!;
                      const selectedOption = answer.optionId !== null && answer.optionId >= 0
                        ? question.options[answer.optionId]
                        : null;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 border-l-8 ${
                            answer.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                          }`}
                        >
                          <p className="font-bold">{index + 1}. {question.question_text}</p>
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
                    {leaderboard.slice(0, 10).map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`p-3 border-4 border-black flex justify-between items-center ${
                          player.id === participantData.id ? "bg-neo-blue text-white" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">#{index + 1}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="font-bold">{player.score}</span>
                      </div>
                    ))}
                    
                    {playerRank > 10 && (
                      <div className="p-3 border-4 border-black bg-neo-blue text-white flex justify-between items-center animate-pulse-scale">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">#{playerRank}</span>
                          <span>{playerName} (Kamu)</span>
                        </div>
                        <span className="font-bold">{score}</span>
                      </div>
                    )}
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
