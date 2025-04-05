import { OpenAI } from "openai"
import prisma from "../prisma"
import { getUserInterests, getUserLearningGoals } from "./user"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Quiz interfaces
export interface Quiz {
  id: number
  userId: number
  title: string
  description?: string
  difficultyLevel: string
  timeEstimate?: string
  subjectArea: string
  isGenerated: boolean
  createdAt: string
  updatedAt: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: number
  quizId: number
  questionText: string
  explanation?: string
  orderIndex: number
  options: QuizOption[]
}

export interface QuizOption {
  id: number
  questionId: number
  optionText: string
  isCorrect: boolean
  orderIndex: number
}

export interface QuizAttempt {
  id: number
  userId: number
  quizId: number
  score?: number
  maxScore: number
  completedAt?: string
  startedAt: string
  answers?: QuizAnswer[]
}

export interface QuizAnswer {
  id: number
  attemptId: number
  questionId: number
  selectedOptionId?: number
  isCorrect?: boolean
}

// Get all quizzes for a user
export async function getUserQuizzes(userId: number): Promise<Quiz[]> {
  const quizzes = await prisma.quiz.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  
  return quizzes.map(quiz => ({
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description || undefined,
    difficultyLevel: quiz.difficultyLevel,
    timeEstimate: quiz.timeEstimate || undefined,
    subjectArea: quiz.subjectArea,
    isGenerated: quiz.isGenerated,
    createdAt: quiz.createdAt.toISOString(),
    updatedAt: quiz.updatedAt.toISOString()
  }))
}

// Get a specific quiz with questions and options
export async function getQuiz(quizId: number): Promise<Quiz | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  })
  
  if (!quiz) return null
  
  return {
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description || undefined,
    difficultyLevel: quiz.difficultyLevel,
    timeEstimate: quiz.timeEstimate || undefined,
    subjectArea: quiz.subjectArea,
    isGenerated: quiz.isGenerated,
    createdAt: quiz.createdAt.toISOString(),
    updatedAt: quiz.updatedAt.toISOString(),
    questions: quiz.questions.map(q => ({
      id: q.id,
      quizId: q.quizId,
      questionText: q.questionText,
      explanation: q.explanation || undefined,
      orderIndex: q.orderIndex,
      options: q.options.map(o => ({
        id: o.id,
        questionId: o.questionId,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex
      }))
    }))
  }
}

// Generate a quiz using OpenAI based on user interests
export async function generateQuiz(userId: number, difficulty = "beginner", questionCount = 10): Promise<Quiz> {
  // Fetch user interests
  const interests = await getUserInterests(userId)
  const goals = await getUserLearningGoals(userId)
  
  if (interests.length === 0) {
    throw new Error("User has no interests. Please complete onboarding first.")
  }
  
  // Select a random interest from the user's top interests
  const sortedInterests = [...interests].sort((a, b) => b.interest_level - a.interest_level)
  const topInterests = sortedInterests.slice(0, Math.min(3, sortedInterests.length))
  const selectedInterest = topInterests[Math.floor(Math.random() * topInterests.length)]
  
  // Limit the question count to avoid transaction timeouts
  const finalQuestionCount = Math.min(questionCount, 10);
  
  // Prepare a more concise prompt for OpenAI
  const prompt = `
Create a short ${difficulty} level quiz about ${selectedInterest.subject} with exactly ${finalQuestionCount} multiple-choice questions.

Return JSON with this structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "questionText": "Question text",
      "explanation": "Brief explanation",
      "options": [
        {"optionText": "Option 1", "isCorrect": false},
        {"optionText": "Option 2", "isCorrect": true},
        {"optionText": "Option 3", "isCorrect": false},
        {"optionText": "Option 4", "isCorrect": false}
      ]
    }
  ]
}

Requirements:
- Each question has exactly 4 short options
- Only one correct option per question
- Keep explanations brief
- Ensure content is accurate
`

  try {
    // Generate quiz using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Create concise educational quizzes with accurate information."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
    
    const quizContent = completion.choices[0]?.message?.content || "{}"
    const quizData = JSON.parse(quizContent)
    
    // Estimate time (30 seconds per question as a simple rule)
    const estimatedQuestionCount = quizData.questions?.length || finalQuestionCount
    const timeEstimate = `${Math.max(Math.round(estimatedQuestionCount * 0.5), 1)} min`
    
    // Break the transaction into smaller chunks to avoid timeouts
    // First, create the quiz
    const newQuiz = await prisma.quiz.create({
      data: {
        userId,
        title: quizData.title || `${selectedInterest.subject} Quiz`,
        description: quizData.description || `Test your knowledge of ${selectedInterest.subject}`,
        difficultyLevel: difficulty,
        timeEstimate,
        subjectArea: selectedInterest.subject,
        isGenerated: true
      }
    })
    
    // Then create questions and options in batches
    if (quizData.questions && Array.isArray(quizData.questions)) {
      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i]
        
        // Create question
        const newQuestion = await prisma.quizQuestion.create({
          data: {
            quizId: newQuiz.id,
            questionText: q.questionText,
            explanation: q.explanation,
            orderIndex: i
          }
        })
        
        // Create options for this question
        if (q.options && Array.isArray(q.options)) {
          // Process options with individual queries instead of in transaction
          for (let j = 0; j < q.options.length; j++) {
            const o = q.options[j]
            await prisma.quizOption.create({
              data: {
                questionId: newQuestion.id,
                optionText: o.optionText,
                isCorrect: !!o.isCorrect,
                orderIndex: j
              }
            })
          }
        }
      }
    }
    
    // Return the created quiz with all details
    return await getQuiz(newQuiz.id) as Quiz
    
  } catch (error) {
    console.error("Error generating quiz:", error)
    throw new Error("Failed to generate quiz. Please try again later.")
  }
}

// Start a quiz attempt
export async function startQuizAttempt(userId: number, quizId: number): Promise<QuizAttempt> {
  const quiz = await getQuiz(quizId)
  
  if (!quiz) {
    throw new Error("Quiz not found")
  }
  
  // Count the number of questions for the max score (1 point per question)
  const maxScore = quiz.questions?.length || 0
  
  // Create the attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      maxScore
    }
  })
  
  return {
    id: attempt.id,
    userId: attempt.userId,
    quizId: attempt.quizId,
    score: attempt.score || undefined,
    maxScore: attempt.maxScore,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString()
  }
}

// Submit a quiz answer
export async function submitQuizAnswer(
  attemptId: number,
  questionId: number,
  selectedOptionId: number
): Promise<QuizAnswer> {
  // Get the question and selected option
  const option = await prisma.quizOption.findUnique({
    where: { id: selectedOptionId },
    include: { question: true }
  })
  
  if (!option || option.questionId !== questionId) {
    throw new Error("Invalid option or question")
  }
  
  // Check if answer already exists for this question in this attempt
  const existingAnswer = await prisma.quizAnswer.findFirst({
    where: {
      attemptId,
      questionId
    }
  })
  
  if (existingAnswer) {
    // Update existing answer
    const updatedAnswer = await prisma.quizAnswer.update({
      where: { id: existingAnswer.id },
      data: {
        selectedOptionId,
        isCorrect: option.isCorrect
      }
    })
    
    return {
      id: updatedAnswer.id,
      attemptId: updatedAnswer.attemptId,
      questionId: updatedAnswer.questionId,
      selectedOptionId: updatedAnswer.selectedOptionId || undefined,
      isCorrect: updatedAnswer.isCorrect || undefined
    }
  }
  
  // Create new answer
  const answer = await prisma.quizAnswer.create({
    data: {
      attemptId,
      questionId,
      selectedOptionId,
      isCorrect: option.isCorrect
    }
  })
  
  return {
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,
    selectedOptionId: answer.selectedOptionId || undefined,
    isCorrect: answer.isCorrect || undefined
  }
}

// Complete a quiz attempt and calculate score
export async function completeQuizAttempt(attemptId: number): Promise<QuizAttempt> {
  // Get the attempt with answers
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          questions: true
        }
      }
    }
  })
  
  if (!attempt) {
    throw new Error("Attempt not found")
  }
  
  if (attempt.completedAt) {
    throw new Error("Quiz already completed")
  }
  
  // Calculate score (count correct answers)
  const correctAnswers = attempt.answers.filter(a => a.isCorrect).length
  const score = correctAnswers
  
  // Update the attempt
  const updatedAttempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      completedAt: new Date()
    },
    include: {
      answers: {
        include: {
          question: true,
          selectedOption: true
        }
      }
    }
  })
  
  return {
    id: updatedAttempt.id,
    userId: updatedAttempt.userId,
    quizId: updatedAttempt.quizId,
    score: updatedAttempt.score || undefined,
    maxScore: updatedAttempt.maxScore,
    startedAt: updatedAttempt.startedAt.toISOString(),
    completedAt: updatedAttempt.completedAt?.toISOString(),
    answers: updatedAttempt.answers.map(a => ({
      id: a.id,
      attemptId: a.attemptId,
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId || undefined,
      isCorrect: a.isCorrect || undefined
    }))
  }
}

// Get quiz attempt history for a user
export async function getUserQuizAttempts(userId: number): Promise<QuizAttempt[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      quiz: true
    }
  })
  
  return attempts.map(attempt => ({
    id: attempt.id,
    userId: attempt.userId,
    quizId: attempt.quizId,
    score: attempt.score || undefined,
    maxScore: attempt.maxScore,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString()
  }))
}

// Get a specific quiz attempt with answers
export async function getQuizAttempt(attemptId: number): Promise<QuizAttempt | null> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true
            }
          },
          selectedOption: true
        }
      },
      quiz: true
    }
  })
  
  if (!attempt) return null
  
  return {
    id: attempt.id,
    userId: attempt.userId,
    quizId: attempt.quizId,
    score: attempt.score || undefined,
    maxScore: attempt.maxScore,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString(),
    answers: attempt.answers.map(a => ({
      id: a.id,
      attemptId: a.attemptId,
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId || undefined,
      isCorrect: a.isCorrect || undefined
    }))
  }
}

// Generate personalized quizzes based on all user interests
export async function generatePersonalizedQuizzes(userId: number): Promise<Quiz[]> {
  const interests = await getUserInterests(userId)
  
  if (interests.length === 0) {
    throw new Error("User has no interests. Please complete onboarding first.")
  }
  
  // Generate a quiz for the top 3 interests
  const sortedInterests = [...interests].sort((a, b) => b.interest_level - a.interest_level)
  const topInterests = sortedInterests.slice(0, Math.min(3, sortedInterests.length))
  
  const difficulties = ["beginner", "intermediate", "advanced"]
  
  const quizzes: Quiz[] = []
  
  for (let i = 0; i < topInterests.length; i++) {
    // Vary difficulty based on interest level
    const difficultyIndex = Math.min(
      Math.floor(topInterests[i].interest_level / 4), 
      difficulties.length - 1
    )
    
    try {
      const quiz = await generateQuiz(userId, difficulties[difficultyIndex])
      quizzes.push(quiz)
    } catch (error) {
      console.error(`Error generating quiz for ${topInterests[i].subject}:`, error)
      // Continue with other interests if one fails
      continue
    }
  }
  
  return quizzes
}
