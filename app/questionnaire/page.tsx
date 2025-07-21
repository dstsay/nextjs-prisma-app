'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from './components/QuestionCard';
import QuestionTransition from './components/QuestionTransition';

interface AnswerOption {
  id: string;
  optionText: string;
  optionValue: string;
  order: number;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  order: number;
  answerOptions: AnswerOption[];
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResponseId, setQuizResponseId] = useState<string | null>(null);

  // Flatten all questions from all quizzes
  const allQuestions = (Array.isArray(quizzes) ? quizzes : []).flatMap(quiz => 
    quiz.questions.map(q => ({ ...q, quizId: quiz.id }))
  ).sort((a, b) => a.order - b.order);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  
  // Debug logging with more readable information
  if (currentQuestion) {
    const selectedOption = currentQuestion.answerOptions?.find(opt => opt.id === selectedAnswer);
    console.log(`Question ${currentQuestionIndex + 1}: ${currentQuestion.questionText}`);
    console.log('Selected:', selectedOption?.optionText || 'None');
  }

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    // Load previous answer for current question if exists
    if (currentQuestion && answers[currentQuestion.id]) {
      setSelectedAnswer(answers[currentQuestion.id]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestionIndex]); // Only run when question index changes

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setQuizzes(data);
      } else {
        console.error('Expected array of quizzes, got:', data);
        setQuizzes([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    const selectedOption = currentQuestion?.answerOptions.find(opt => opt.id === answerId);
    console.log('Answer selected:', selectedOption?.optionText || 'Unknown');
    setSelectedAnswer(answerId);
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    // Save the answer
    if (selectedAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer
      }));

      // Save to database
      await saveAnswer(currentQuestion.id, selectedAnswer);
    }

    // Handle navigation
    if (isLastQuestion) {
      router.push('/questionnaire/thank-you');
    } else {
      // Start transition
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 500); // Half of the transition duration
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 500);
    } else {
      router.push('/');
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      router.push('/questionnaire/thank-you');
    } else {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const saveAnswer = async (questionId: string, answerId: string) => {
    try {
      const response = await fetch('/api/quiz/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answerOptionId: answerId,
          quizResponseId,
        }),
      });

      const data = await response.json();
      
      // Store the quiz response ID for subsequent answers
      if (data.quizResponseId && !quizResponseId) {
        setQuizResponseId(data.quizResponseId);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No questions available at the moment.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Back
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Welcome</span>
              <div className="w-10 h-10 bg-[#A1823C] rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#A1823C] h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%`
              }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </p>
        </div>

        {/* Question Card with Transition */}
        <QuestionTransition isTransitioning={isTransitioning}>
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
        </QuestionTransition>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleSkip}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`px-8 py-3 rounded-full transition-colors ${
              selectedAnswer
                ? 'bg-[#A1823C] text-white hover:bg-[#8B6F33]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}