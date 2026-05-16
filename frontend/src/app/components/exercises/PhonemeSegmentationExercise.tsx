import { useState } from 'react';
import { Loader } from 'lucide-react';
import type { ExerciseQuestion } from '../../../services/exercises.service';

interface Props {
  question: ExerciseQuestion;
  onSubmit: (answer: string) => void;
  feedback: { isCorrect: boolean; message: string } | null;
  isSubmitting: boolean;
}

export function PhonemeSegmentationExercise({
  question,
  onSubmit,
  feedback,
  isSubmitting,
}: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleSubmit = () => {
    if (selectedAnswer) {
      onSubmit(selectedAnswer);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          🔤 Break Down the Sounds
        </h3>
        <p className="text-2xl font-bold text-gray-800 mb-4">
          {question.question}
        </p>
        <p className="text-gray-700 text-base">
          Every word is made of individual sounds. Pick the row that shows all
          the sounds in the correct order.
        </p>
      </div>

      {/* Crystal Clear Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-5 mb-6">
        <p className="text-sm font-bold text-blue-900 mb-4">
          📚 How to answer:
        </p>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex gap-2 items-start">
            <span className="text-lg">1️⃣</span>
            <p>Say the word SLOWLY, sound by sound</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-lg">2️⃣</span>
            <p>
              In the options below, sounds are separated by{' '}
              <strong>" / "</strong>
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-lg">3️⃣</span>
            <p>
              Example: "cat" = <strong>c / a / t</strong> (3 separate sounds)
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-lg">4️⃣</span>
            <p>
              Important: "the" = <strong>th / e</strong> (2 sounds, not 3!)
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-lg">5️⃣</span>
            <p className="font-bold text-blue-900">
              Pick the row that matches ↓
            </p>
          </div>
        </div>
      </div>

      {/* Answer Options - VERY Clear and Large */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAnswer(option)}
            disabled={feedback !== null}
            className={`w-full p-6 text-center rounded-lg border-3 transition-all transform hover:scale-105 ${
              selectedAnswer === option
                ? 'border-blue-600 bg-blue-100 shadow-lg scale-105'
                : 'border-gray-300 hover:border-blue-400 bg-white'
            } ${feedback !== null ? 'cursor-not-allowed opacity-75 hover:scale-100' : 'cursor-pointer'}`}
          >
            <div className="font-bold text-2xl text-gray-800 tracking-wide">
              {option}
            </div>
          </button>
        ))}
      </div>

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader size={20} className="animate-spin" />}
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </button>
      )}
    </div>
  );
}
