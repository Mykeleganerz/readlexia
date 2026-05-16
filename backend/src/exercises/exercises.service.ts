import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, ExerciseType } from './exercise.entity';
import { ExerciseQuestion } from './exercise-question.entity';
import { Document } from '../documents/document.entity';
import { GenerateExerciseDto } from './dto/generate-exercise.dto';
import { SubmitExerciseAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class ExercisesService {
    constructor(
        @InjectRepository(Exercise)
        private exercisesRepository: Repository<Exercise>,
        @InjectRepository(ExerciseQuestion)
        private questionsRepository: Repository<ExerciseQuestion>,
        @InjectRepository(Document)
        private documentsRepository: Repository<Document>,
    ) { }

    /**
     * Extract unique words from document content
     */
    private extractWords(content: string, minLength: number = 3): string[] {
        if (!content) return [];

        const words = content
            .toLowerCase()
            .match(/\b[a-z]+\b/g)
            ?.filter((word) => word.length >= minLength) ?? [];

        // Remove duplicates and sort by frequency
        const wordFreq = {};
        words.forEach((word) => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        return Object.keys(wordFreq).sort(
            (a, b) => wordFreq[b] - wordFreq[a],
        );
    }

    /**
     * Get phonemes from a word
     * Simple, reliable phoneme extraction using consonant clusters
     */
    private getPhonemes(word: string): string[] {
        word = word.toLowerCase();
        const phonemes: string[] = [];
        const clusters = [
            'th', 'sh', 'ch', 'ph', 'wh',
            'str', 'scr', 'spr', 'spl', 'shr',
            'st', 'sp', 'sk', 'sm', 'sn', 'sw',
            'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr'
        ];
        let i = 0;

        while (i < word.length) {
            let found = false;

            // Check for consonant clusters (sorted by length, longest first)
            for (const cluster of clusters.sort((a, b) => b.length - a.length)) {
                if (word.substr(i, cluster.length) === cluster) {
                    phonemes.push(cluster);
                    i += cluster.length;
                    found = true;
                    break;
                }
            }

            // If no cluster found, push single character
            if (!found) {
                phonemes.push(word[i]);
                i++;
            }
        }

        return phonemes.length > 0 ? phonemes : word.split('');
    }

    /**
     * Check if character at position i starts a consonant cluster
     */
    private isConsonantCluster(word: string, i: number): boolean {
        if (i + 1 >= word.length) return false;
        const consonantClusters = [
            'st', 'sp', 'sk', 'sm', 'sn', 'sw',
            'ch', 'sh', 'th', 'wh', 'ph',
            'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr',
            'scr', 'str', 'shr', 'spl', 'spr',
        ];
        for (const cluster of consonantClusters) {
            if (word.substr(i, cluster.length) === cluster) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate phoneme segmentation exercise
     * Makes it VERY clear what the user should select
     */
    private generatePhonemeSegmentation(
        word: string,
    ): Partial<ExerciseQuestion> {
        const phonemes = this.getPhonemes(word);
        const phonemesStr = phonemes.join(' / ');

        // Generate plausible wrong answers
        const wrongAnswers: string[] = [];

        // Wrong answer 1: Missing first phoneme
        if (phonemes.length > 1) {
            wrongAnswers.push(phonemes.slice(1).join(' / '));
        }

        // Wrong answer 2: Missing last phoneme
        if (phonemes.length > 1) {
            wrongAnswers.push(phonemes.slice(0, -1).join(' / '));
        }

        // Wrong answer 3: Mixed up order (if more than 2 phonemes)
        if (phonemes.length > 2) {
            const shuffled = [...phonemes].sort(() => Math.random() - 0.5);
            wrongAnswers.push(shuffled.join(' / '));
        } else if (wrongAnswers.length < 3) {
            // Fallback: just the word itself (entire word as one unit)
            wrongAnswers.push(word.toUpperCase());
        }

        // Create options with correct answer and unique wrong answers
        const options = [phonemesStr, ...wrongAnswers]
            .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        return {
            type: ExerciseType.PHONEME_SEGMENTATION,
            question: `Listen carefully: Break the word "${word.toUpperCase()}" into its individual sounds (phonemes). Which row shows the correct sounds?`,
            options: options,
            correctAnswer: phonemesStr,
            explanation: `Perfect! The word "${word.toUpperCase()}" has ${phonemes.length} sound${phonemes.length > 1 ? 's' : ''}: ${phonemes.map((p, i) => `Sound ${i + 1} is "${p}"`).join(', ')}. When you say it normally: "${phonemes.join('-')}".`,
            sourceWord: word,
        };
    }

    /**
     * Generate letter-sound tracing exercise
     */
    private generateLetterSoundTracing(
        word: string,
    ): Partial<ExerciseQuestion> {
        const firstLetter = word[0].toUpperCase();
        const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const shuffled = allLetters
            .filter((l) => l !== word[0])
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [firstLetter, ...shuffled.map((l) => l.toUpperCase())]
            .sort(() => Math.random() - 0.5);

        return {
            type: ExerciseType.LETTER_SOUND_TRACING,
            question: `What is the first letter of "${word}"? Trace it: ______`,
            options: options,
            correctAnswer: firstLetter,
            explanation: `The first letter of "${word}" is "${firstLetter}".`,
            sourceWord: word,
        };
    }

    /**
     * Generate sound blending exercise
     */
    private generateSoundBlending(word: string): Partial<ExerciseQuestion> {
        const phonemes = this.getPhonemes(word);
        const phonemesStr = phonemes.join(' / ');

        // Generate plausible wrong answers
        const wrongAnswers: string[] = [];

        // Wrong answer 1: Reversed word
        const reversed = word.split('').reverse().join('');
        if (reversed !== word) {
            wrongAnswers.push(reversed);
        }

        // Wrong answer 2: First letter moved to end
        if (word.length > 1) {
            wrongAnswers.push(word.slice(1) + word[0]);
        }

        // Wrong answer 3: Remove first letter
        if (word.length > 1 && wrongAnswers.length < 3) {
            wrongAnswers.push(word.slice(1));
        }

        const options = [word, ...wrongAnswers]
            .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map((opt) => opt.toUpperCase());

        return {
            type: ExerciseType.SOUND_BLENDING,
            question: `Listen to these sounds: ${phonemesStr}. Blend them together. What word do they make?`,
            options: options,
            correctAnswer: word.toUpperCase(),
            explanation: `When you blend ${phonemesStr} together, you get "${word.toUpperCase()}".`,
            sourceWord: word,
        };
    }

    /**
     * Generate letter discrimination exercise
     */
    private generateLetterDiscrimination(
        word: string,
    ): Partial<ExerciseQuestion> {
        const positionToReplace = Math.floor(Math.random() * word.length);
        const correctLetter = word[positionToReplace];
        let wordWithMissing = word.substring(0, positionToReplace) + '?' + word.substring(positionToReplace + 1);

        // Generate similar looking letters
        const similarLetters = this.getSimilarLetters(correctLetter);
        const options = [correctLetter, ...similarLetters]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        return {
            type: ExerciseType.LETTER_DISCRIMINATION,
            question: `What letter goes in place of "?" in: ${wordWithMissing.toUpperCase()}`,
            options: options,
            correctAnswer: correctLetter.toUpperCase(),
            explanation: `The correct letter is "${correctLetter.toUpperCase()}". The complete word is "${word.toUpperCase()}".`,
            sourceWord: word,
        };
    }

    /**
     * Get similar-looking letters (common for dyslexia)
     */
    private getSimilarLetters(letter: string): string[] {
        const similarMap = {
            b: ['d', 'p', 'q'],
            d: ['b', 'p', 'q'],
            p: ['b', 'd', 'q'],
            q: ['b', 'd', 'p'],
            m: ['n', 'w'],
            n: ['m', 'w'],
            u: ['v', 'w'],
            v: ['u', 'w'],
            w: ['m', 'n', 'u', 'v'],
            a: ['e', 'o'],
            e: ['a', 'c', 'o'],
            l: ['i', '1'],
            i: ['l', '1', 'j'],
            s: ['5', 'z'],
            z: ['s', '2'],
        };

        const similarLetters = similarMap[letter.toLowerCase()] || ['a', 'e', 'i'];
        // Return uppercase versions to match options format
        return similarLetters.map(l => l.toUpperCase());
    }

    /**
     * Generate syllable types exercise
     * IMPORTANT: Always ensure correct answer is in the visible options
     */
    private generateSyllableTypes(word: string): Partial<ExerciseQuestion> {
        const syllableType = this.determineSyllableType(word);

        const allOptions = [
            'Open',
            'Vowel Team',
            'Controlled R',
            'Closed',
            'Silent E',
        ];

        // Remove the correct answer from the list
        const otherOptions = allOptions.filter((opt) => opt !== syllableType);

        // Shuffle and take 3 other options
        const shuffledOthers = otherOptions
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // Create final options: always include correct answer + 3 random others
        const options = [syllableType, ...shuffledOthers]
            .sort(() => Math.random() - 0.5); // Randomize position of correct answer

        return {
            type: ExerciseType.SYLLABLE_TYPES,
            question: `What syllable pattern does "${word.toUpperCase()}" follow?`,
            options: options,
            correctAnswer: syllableType,
            explanation: `The word "${word.toUpperCase()}" follows the **${syllableType}** syllable pattern. ${this.getSyllableExplanation(syllableType)}`,
            sourceWord: word,
        };
    }

    /**
     * Get detailed explanation for each syllable type
     */
    private getSyllableExplanation(type: string): string {
        const explanations = {
            Open: 'Open syllables end with a vowel sound (like "go", "me", "no").',
            Closed: 'Closed syllables end with a consonant sound (like "cat", "dog", "sit").',
            'Silent E': 'Silent E syllables end with a silent "e" (like "make", "home", "bone").',
            'Vowel Team': 'Vowel Team syllables have two vowels together (like "sea", "boat", "rain").',
            'Controlled R': 'Controlled R syllables have a vowel followed by the letter "r" (like "car", "bird", "her").',
            Schwa: 'Schwa syllables have a weak vowel sound (like "about", "sofa", "pencil").',
        };
        return explanations[type] || 'Syllable pattern.';
    }
    private determineSyllableType(word: string): string {
        const vowels = 'aeiou';
        word = word.toLowerCase();

        // Simple heuristics
        if (word.endsWith('e') && word.length > 2) {
            return 'Silent E';
        }
        if (word.match(/[aeiou]{2}/)) {
            return 'Vowel Team';
        }
        if (word.match(/[aeiou]r[^aeiou]?$/)) {
            return 'Controlled R';
        }
        if (word.match(/[^aeiou][aeiou][^aeiou]$/)) {
            return 'Closed';
        }
        if (word.match(/[^aeiou][aeiou]$/)) {
            return 'Open';
        }

        return 'Closed';
    }

    /**
     * Generate rapid automatized naming exercise
     */
    private generateRapidNaming(word: string): Partial<ExerciseQuestion> {
        return {
            type: ExerciseType.RAPID_NAMING,
            question: `Say this word as fast as you can: ${word.toUpperCase()}`,
            options: [word.toUpperCase()],
            correctAnswer: word.toUpperCase(),
            explanation: `Good job! You correctly identified "${word}". Processing speed is improving!`,
            sourceWord: word,
        };
    }

    /**
     * Create exercise questions of random types
     */
    private createExerciseQuestions(
        words: string[],
        numberOfExercises: number,
    ): Partial<ExerciseQuestion>[] {
        const questions: Partial<ExerciseQuestion>[] = [];
        const exerciseTypes = [
            ExerciseType.PHONEME_SEGMENTATION,
            ExerciseType.LETTER_SOUND_TRACING,
            ExerciseType.SOUND_BLENDING,
            ExerciseType.LETTER_DISCRIMINATION,
            ExerciseType.SYLLABLE_TYPES,
            ExerciseType.RAPID_NAMING,
        ];

        for (let i = 0; i < numberOfExercises; i++) {
            const word = words[i % words.length];
            const exerciseType = exerciseTypes[i % exerciseTypes.length];

            let question: Partial<ExerciseQuestion>;

            switch (exerciseType) {
                case ExerciseType.PHONEME_SEGMENTATION:
                    question = this.generatePhonemeSegmentation(word);
                    break;
                case ExerciseType.LETTER_SOUND_TRACING:
                    question = this.generateLetterSoundTracing(word);
                    break;
                case ExerciseType.SOUND_BLENDING:
                    question = this.generateSoundBlending(word);
                    break;
                case ExerciseType.LETTER_DISCRIMINATION:
                    question = this.generateLetterDiscrimination(word);
                    break;
                case ExerciseType.SYLLABLE_TYPES:
                    question = this.generateSyllableTypes(word);
                    break;
                case ExerciseType.RAPID_NAMING:
                    question = this.generateRapidNaming(word);
                    break;
                default:
                    question = this.generatePhonemeSegmentation(word);
            }

            questions.push(question);
        }

        return questions;
    }

    /**
     * Generate exercise from document
     */
    async generateExercise(
        userId: number,
        generateExerciseDto: GenerateExerciseDto,
    ): Promise<Exercise> {
        const { documentId, numberOfExercises } = generateExerciseDto;

        // Validate input
        if (numberOfExercises < 1 || numberOfExercises > 50) {
            throw new BadRequestException('Number of exercises must be between 1 and 50');
        }

        // Get document
        const document = await this.documentsRepository.findOne({
            where: { id: documentId, userId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Extract words
        const words = this.extractWords(document.content);

        if (words.length === 0) {
            throw new BadRequestException('Document contains no valid words for exercises');
        }

        // Generate questions
        const questionsData = this.createExerciseQuestions(
            words,
            numberOfExercises,
        );

        // Create exercise
        const exercise = this.exercisesRepository.create({
            documentId,
            userId,
            exerciseTypes: [
                ExerciseType.PHONEME_SEGMENTATION,
                ExerciseType.LETTER_SOUND_TRACING,
                ExerciseType.SOUND_BLENDING,
                ExerciseType.LETTER_DISCRIMINATION,
                ExerciseType.SYLLABLE_TYPES,
                ExerciseType.RAPID_NAMING,
            ],
            totalQuestions: numberOfExercises,
            correctAnswers: 0,
            attemptedQuestions: 0,
            completed: false,
        });

        // Save exercise first
        const savedExercise = await this.exercisesRepository.save(exercise);

        // Create and save questions
        const questionsWithExerciseId = questionsData.map((q) => ({
            ...q,
            exerciseId: savedExercise.id,
        }));

        await this.questionsRepository.save(questionsWithExerciseId);

        // Reload exercise with questions
        return this.exercisesRepository.findOne({
            where: { id: savedExercise.id },
            relations: ['questions'],
        });
    }

    /**
     * Get exercise by ID
     */
    async getExercise(exerciseId: number, userId: number): Promise<Exercise> {
        const exercise = await this.exercisesRepository.findOne({
            where: { id: exerciseId, userId },
            relations: ['questions'],
        });

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        return exercise;
    }

    /**
     * Submit answer for a question
     */
    async submitAnswer(
        exerciseId: number,
        userId: number,
        submitAnswerDto: SubmitExerciseAnswerDto,
    ): Promise<ExerciseQuestion> {
        const { questionId, userAnswer } = submitAnswerDto;

        // Get exercise to verify ownership
        const exercise = await this.exercisesRepository.findOne({
            where: { id: exerciseId, userId },
        });

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        // Get question
        const question = await this.questionsRepository.findOne({
            where: { id: questionId, exerciseId },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        // Check answer (case-insensitive and trimmed)
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

        // Update question
        question.userAnswer = userAnswer;
        question.isCorrect = isCorrect;

        await this.questionsRepository.save(question);

        // Update exercise stats
        exercise.attemptedQuestions += 1;
        if (isCorrect) {
            exercise.correctAnswers += 1;
        }

        if (exercise.attemptedQuestions === exercise.totalQuestions) {
            exercise.completed = true;
        }

        await this.exercisesRepository.save(exercise);

        return question;
    }

    /**
     * Get all exercises for a user
     */
    async getUserExercises(userId: number, limit: number = 10): Promise<Exercise[]> {
        return this.exercisesRepository.find({
            where: { userId },
            relations: ['document', 'questions'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    /**
     * Get exercise statistics
     */
    async getExerciseStats(exerciseId: number, userId: number): Promise<any> {
        const exercise = await this.getExercise(exerciseId, userId);

        return {
            totalQuestions: exercise.totalQuestions,
            attemptedQuestions: exercise.attemptedQuestions,
            correctAnswers: exercise.correctAnswers,
            scorePercentage: exercise.getScorePercentage(),
            completed: exercise.completed,
            createdAt: exercise.createdAt,
        };
    }
}
