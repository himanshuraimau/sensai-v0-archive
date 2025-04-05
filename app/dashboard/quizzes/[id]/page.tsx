"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getQuiz, startQuizAttempt, submitQuizAnswer, completeQuizAttempt } from "@/lib/api/quiz"

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  
  // Fetch the quiz
  const { 
    data: quiz,
    isLoading: isLoadingQuiz,
    error: quizError
  } = useQuery({
    queryKey: ['quiz', params.id],
    queryFn: () => getQuiz(params.id)
  })
  
  // Start quiz attempt
  const { mutate: startAttempt, isPending: isStartingAttempt } = useMutation({
    mutationFn: () => startQuizAttempt(params.id),
    onSuccess: (data) => {
      setAttemptId(data.id)
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start quiz",
        description: error.message,
        variant: "destructive"
      })
    }
  })
  
  // Submit answer mutation
  const { mutate: submitAnswer } = useMutation({
    mutationFn: ({
      questionId,
      optionId
    }: {
      questionId: number,
      optionId: number
    }) => {
      if (!attemptId) throw new Error("No active quiz attempt")
      return submitQuizAnswer(attemptId, questionId, optionId)
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit answer",
        description: error.message,
        variant: "destructive"
      })
    }
  })
  
  // Complete quiz mutation
  const { mutate: finishQuiz } = useMutation({
    mutationFn: () => {
      if (!attemptId) throw new Error("No active quiz attempt")
      return completeQuizAttempt(attemptId)
    },
    onSuccess: (data) => {
      setIsSubmitting(false)
      router.push(`/dashboard/quizzes/attempts/${data.id}/results`)
    },
    onError: (error: Error) => {
      setIsSubmitting(false)
      toast({
        title: "Failed to complete quiz",
        description: error.message,
        variant: "destructive"
      })
    }
  })
  
  // Start the attempt when the quiz loads
  useEffect(() => {
    if (quiz && !attemptId && !isStartingAttempt) {
      startAttempt()
    }
  }, [quiz, attemptId, isStartingAttempt, startAttempt])
  
  // Handle loading and error states
  if (isLoadingQuiz || isStartingAttempt) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center p-6 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading quiz...</p>
      </div>
    )
  }
  
  if (quizError) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load quiz. Please try again later.
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
  
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This quiz has no questions.
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
  
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  const handleAnswer = (optionId: string) => {
    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionId,
    }))
    
    // Submit to backend
    submitAnswer({
      questionId: question.id,
      optionId: parseInt(optionId)
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz!.questions!.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    finishQuiz()
  }

  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const hasAnsweredCurrent = answers[question.id] !== undefined

  return (
    <div className="container mx-auto flex max-w-3xl flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{question.questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[question.id]} 
            onValueChange={handleAnswer} 
            className="space-y-4"
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.id.toString()} 
                  id={`option-${option.id}`} 
                />
                <Label 
                  htmlFor={`option-${option.id}`} 
                  className="flex-1 cursor-pointer"
                >
                  {option.optionText}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {isLastQuestion ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!hasAnsweredCurrent || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={!hasAnsweredCurrent}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="flex flex-wrap gap-2">
        {quiz.questions.map((_, index) => (
          <Button
            key={index}
            variant={
              index === currentQuestion 
                ? "default" 
                : answers[quiz.questions![index].id] 
                  ? "secondary" 
                  : "outline"
            }
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}

