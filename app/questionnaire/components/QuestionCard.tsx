'use client';

import AnswerOption from './AnswerOption';

interface AnswerOptionType {
  id: string;
  optionText: string;
  optionValue: string;
  order: number;
}

interface QuestionCardProps {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    answerOptions: AnswerOptionType[];
  };
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-3xl md:text-4xl font-medium text-[#004643] text-center mb-12 leading-tight">
        {question.questionText}
      </h2>

      <div className="flex flex-wrap gap-4 justify-center">
        {question.answerOptions
          .sort((a, b) => a.order - b.order)
          .map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              isSelected={selectedAnswer === option.id}
              onSelect={() => onAnswerSelect(option.id)}
            />
          ))}
      </div>
    </div>
  );
}