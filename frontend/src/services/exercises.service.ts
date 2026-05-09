import apiClient from './api.service';
import { errorLogger } from '../utils/errorLogger';

export interface ExerciseQuestion {
    id: number;
    type: string;
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
    isCorrect?: boolean;
    explanation: string;
    sourceWord: string;
}

export interface Exercise {
    id: number;
    documentId: number;
    userId: number;
    exerciseTypes: string[];
    totalQuestions: number;
    correctAnswers: number;
    attemptedQuestions: number;
    completed: boolean;
    questions: ExerciseQuestion[];
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseStats {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    completed: boolean;
    createdAt: string;
}

export const exercisesService = {
    /**
     * Generate exercise from document
     */
    async generateExercise(
        documentId: number,
        numberOfExercises: number,
    ): Promise<Exercise> {
        try {
            errorLogger.info('Generating exercise', { documentId, numberOfExercises });
            const response = await apiClient.post('/exercises/generate', {
                documentId,
                numberOfExercises,
            });
            errorLogger.info('Exercise generated', { exerciseId: response.data.id, questions: response.data.totalQuestions });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate exercise';
            errorLogger.error(`Failed to generate exercise: ${message}`, { documentId, numberOfExercises });
            throw error;
        }
    },

    /**
     * Get exercise by ID
     */
    async getExercise(exerciseId: number): Promise<Exercise> {
        try {
            errorLogger.info('Fetching exercise', { exerciseId });
            const response = await apiClient.get(`/exercises/${exerciseId}`);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch exercise';
            errorLogger.error(`Failed to fetch exercise ${exerciseId}: ${message}`);
            throw error;
        }
    },

    /**
     * Submit answer for a question
     */
    async submitAnswer(
        exerciseId: number,
        questionId: number,
        userAnswer: string,
    ): Promise<ExerciseQuestion> {
        try {
            errorLogger.info('Submitting exercise answer', { exerciseId, questionId });
            const response = await apiClient.post(`/exercises/${exerciseId}/submit`, {
                questionId,
                userAnswer,
            });
            errorLogger.info('Exercise answer submitted', { isCorrect: response.data.isCorrect });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to submit answer';
            errorLogger.error(`Failed to submit answer: ${message}`, { exerciseId, questionId });
            throw error;
        }
    },

    /**
     * Get exercise statistics
     */
    async getExerciseStats(exerciseId: number): Promise<ExerciseStats> {
        try {
            errorLogger.info('Fetching exercise stats', { exerciseId });
            const response = await apiClient.get(`/exercises/${exerciseId}/stats`);
            errorLogger.info('Exercise stats fetched', { score: response.data.scorePercentage });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch exercise stats';
            errorLogger.error(`Failed to fetch exercise stats for ${exerciseId}: ${message}`);
            throw error;
        }
    },

    /**
     * Get all user exercises
     */
    async getUserExercises(): Promise<Exercise[]> {
        try {
            errorLogger.info('Fetching user exercises');
            const response = await apiClient.get('/exercises');
            errorLogger.info('User exercises fetched', { count: response.data.length });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch exercises';
            errorLogger.error(`Failed to fetch user exercises: ${message}`);
            throw error;
        }
    },
};
