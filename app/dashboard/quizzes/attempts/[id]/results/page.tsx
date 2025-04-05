"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Home, AlertTriangle, Loader2, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getQuizAttempt } from "@/lib/api/quiz"

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  // Fetch the quiz attempt with results
  const { 
    data: attempt,
    isLoading,
    error
  } = useQuery({
    queryKey: ['quizAttempt', params.id],
    queryFn: () => getQuizAttempt(params.id)
  })
  
  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center p-6 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading quiz results...</p>
      </div>
    )
  }
  
  if (error || !attempt) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load quiz results. Please try again later.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => router.push('/dashboard/quizzes')}
          className="mt-4"
        >
          Back to Quizzes
        </Button>
      </div>
    )
  }
  
  // Calculate score percentage
  const scorePercentage = Math.round(((attempt.score || 0) / attempt.maxScore) * 100)
  
  // Determine feedback based on score
  let feedback = {
    title: "Great job!",
    message: "You've mastered this topic!",
    color: "text-green-500"
  }
  
  if (scorePercentage < 60) {
    feedback = {
      title: "Keep practicing",
      message: "You're on your way to understanding this topic.",
      color: "text-red-500"
    }
  } else if (scorePercentage < 80) {
    feedback = {
      title: "Good effort",
      message: "You're making progress on this topic.",
      color: "text-yellow-500"
    }
  }
  
  return (
    <div className="container mx-auto flex max-w-3xl flex-col p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
        <p className="text-muted-foreground mt-2">See how well you did!</p>
      </header>
      
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <span className={`text-5xl font-bold ${feedback.color}`}>
              {scorePercentage}%
            </span>
            <p className="mt-2 text-lg">
              {attempt.score || 0} out of {attempt.maxScore} correct
            </p>
          </div>
          
          <Progress 
            value={scorePercentage} 
            className="h-3 mb-4" 
          />
          
          <div className="text-center mt-6">
            <h3 className="text-xl font-semibold">{feedback.title}</h3>
            <p className="text-muted-foreground">{feedback.message}</p>
          </div>
        </CardContent>
      </Card>
      
      {attempt.answers && attempt.answers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          <div className="space-y-4">
            {attempt.answers.map((answer) => (
              <QuestionReviewCard 
                key={answer.questionId} 
                answer={answer} 
                attempt={attempt}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/quizzes')}
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        
        <Button onClick={() => router.push('/dashboard/quizzes')}>
          Take Another Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function QuestionReviewCard({ answer, attempt }: { answer: any, attempt: any }) {
  // Find the question and options from the attempt data
  const question = attempt?.quiz?.questions?.find((q: any) => q.id === answer.questionId)
  if (!question) return null
  
  const selectedOption = question.options.find((o: any) => o.id === answer.selectedOptionId)
  const correctOption = question.options.find((o: any) => o.isCorrect)
  
  return (
    <Card className={answer.isCorrect ? "border-green-200" : "border-red-200"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {question.questionText}
          </CardTitle>
          {answer.isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {question.options.map((option: any) => (
            <div 
              key={option.id}
              className={`
                p-3 rounded-md text-sm
                ${option.id === selectedOption?.id ? 
                  (option.isCorrect ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20') : 
                  option.isCorrect ? 'bg-green-50 dark:bg-green-900/10' : ''}
              `}
            >
              {option.optionText}
              {option.id === selectedOption?.id && !option.isCorrect && (
                <div className="text-red-500 mt-1 text-xs">
                  Your answer
                </div>
              )}
              {option.isCorrect && (
                <div className="text-green-500 mt-1 text-xs">
                  Correct answer
                </div>
              )}
            </div>
          ))}
        </div>
        
        {question.explanation && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-semibold">Explanation:</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
