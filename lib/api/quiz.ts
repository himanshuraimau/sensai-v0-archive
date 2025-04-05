import { Quiz, QuizAttempt, QuizAnswer } from "@/lib/models/quiz";

// Get all quizzes
export async function getQuizzes(): Promise<Quiz[]> {
  const response = await fetch('/api/quizzes');
  if (!response.ok) {
    throw new Error('Failed to fetch quizzes');
  }
  const data = await response.json();
  return data.quizzes;
}

// Get a specific quiz
export async function getQuiz(quizId: string): Promise<Quiz> {
  const response = await fetch(`/api/quizzes/${quizId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz');
  }
  const data = await response.json();
  return data.quiz;
}

// Generate a new quiz
export async function generateQuiz(difficulty: string = 'beginner', questionCount: number | undefined): Promise<Quiz> {
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ difficulty }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate quiz');
  }
  
  const data = await response.json();
  return data.quiz;
}

// Generate quizzes based on user interests
export async function generateQuizzesFromInterests(): Promise<Quiz[]> {
  const response = await fetch('/api/quizzes/generate-from-onboarding', {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate quizzes from interests');
  }
  
  const data = await response.json();
  return data.quizzes;
}

// Start a quiz attempt
export async function startQuizAttempt(quizId: string): Promise<QuizAttempt> {
  const response = await fetch('/api/quizzes/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quizId: Number(quizId) }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to start quiz attempt');
  }
  
  const data = await response.json();
  return data.attempt;
}

// Submit a quiz answer
export async function submitQuizAnswer(
  attemptId: number,
  questionId: number,
  selectedOptionId: number
): Promise<QuizAnswer> {
  const response = await fetch(`/api/quizzes/attempts/${attemptId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionId,
      selectedOptionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit quiz answer');
  }
  
  const data = await response.json();
  return data.answer;
}

// Complete a quiz attempt
export async function completeQuizAttempt(attemptId: number): Promise<QuizAttempt> {
  const response = await fetch(`/api/quizzes/attempts/${attemptId}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to complete quiz attempt');
  }
  
  const data = await response.json();
  return data.attempt;
}

// Get quiz attempt details
export async function getQuizAttempt(attemptId: string): Promise<QuizAttempt> {
  const response = await fetch(`/api/quizzes/attempts/${attemptId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz attempt');
  }
  const data = await response.json();
  return data.attempt;
}

// Get all quiz attempts for a user
export async function getQuizAttempts(): Promise<QuizAttempt[]> {
  const response = await fetch('/api/quizzes/attempts');
  if (!response.ok) {
    throw new Error('Failed to fetch quiz attempts');
  }
  const data = await response.json();
  return data.attempts;
}
