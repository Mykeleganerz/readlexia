import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import {
  exercisesService,
  type Exercise,
} from '../../services/exercises.service';
import { BookOpen, Loader, TrendingUp } from 'lucide-react';

export function Exercises() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await exercisesService.getUserExercises();
        setExercises(data);
      } catch (err) {
        console.error('Failed to load exercises', err);
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getPerformanceLabel = (percentage: number): string => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Review';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <Loader
            className="mx-auto animate-spin text-blue-600 mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Exercises
          </h1>
          <p className="text-gray-600">
            Track your progress and review past exercise results
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {!exercises || exercises.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-6">You have no exercises yet.</p>
            <p className="text-gray-500 text-sm mb-6">
              Start by uploading a document and generating exercises to track
              your progress.
            </p>
            <button
              onClick={() => navigate('/documents')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Upload a Document
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">
                    Total Exercises
                  </h3>
                  <BookOpen className="text-blue-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {exercises.length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Completed</h3>
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {exercises.filter((e) => e.completed).length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Average Score</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {Math.round(
                    exercises.reduce(
                      (sum, e) =>
                        sum +
                        (e.correctAnswers / Math.max(1, e.totalQuestions)) *
                          100,
                      0,
                    ) / exercises.length,
                  )}
                  %
                </p>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {exercises
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((ex) => {
                  const scorePercentage = Math.round(
                    (ex.correctAnswers / Math.max(1, ex.totalQuestions)) * 100,
                  );
                  return (
                    <div
                      key={ex.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              Exercise #{ex.id}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                ex.completed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {ex.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Document ID: {ex.documentId} •{' '}
                            {new Date(ex.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Exercise Types: {ex.exerciseTypes.join(', ')}
                          </p>
                        </div>

                        {/* Score Display */}
                        <div className="text-right ml-4">
                          <div
                            className={`text-3xl font-bold ${getScoreColor(scorePercentage)} px-4 py-2 rounded-lg`}
                          >
                            {scorePercentage}%
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {getPerformanceLabel(scorePercentage)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>
                            {ex.correctAnswers} correct out of{' '}
                            {ex.totalQuestions} questions
                          </span>
                          <span>
                            {ex.attemptedQuestions}/{ex.totalQuestions}{' '}
                            attempted
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(ex.correctAnswers / Math.max(1, ex.totalQuestions)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/exercise-results/${ex.id}`)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                        >
                          View Detailed Results
                        </button>
                        {!ex.completed && (
                          <button
                            onClick={() => navigate(`/exercise/${ex.id}`)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                          >
                            Continue Exercise
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/exercise/${ex.id}`)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
