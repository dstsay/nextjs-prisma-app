'use client';

interface AnswerOptionProps {
  option: {
    id: string;
    optionText: string;
    optionValue: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function AnswerOption({
  option,
  isSelected,
  onSelect,
}: AnswerOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        px-6 py-3 rounded-full border-2 transition-all duration-300 transform
        ${
          isSelected
            ? 'border-[#A1823C] bg-[#A1823C] text-white scale-105'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:scale-105'
        }
      `}
    >
      {option.optionText}
    </button>
  );
}