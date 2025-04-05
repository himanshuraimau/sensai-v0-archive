"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

// Sample quiz data
const quizData = {
  id: "1",
  title: "JavaScript Fundamentals",
  questions: [
    {
      id: "q1",
      text: "Which of the following is NOT a JavaScript data type?",
      options: [
        { id: "a", text: "String" },
        { id: "b", text: "Boolean" },
        { id: "c", text: "Float" },
        { id: "d", text: "Symbol" },
      ],
      correctAnswer: "c",
    },
    {
      id: "q2",
      text: 'What does the "===" operator do in JavaScript?',
      options: [
        { id: "a", text: "Checks for equality, but not type" },
        { id: "b", text: "Checks for equality, including type" },
        { id: "c", text: "Assigns a value to a variable" },
        { id: "d", text: "Checks if a variable is defined" },
      ],
      correctAnswer: "b",
    },
    {
      id: "q3",
      text: "Which method is used to add an element to the end of an array?",
      options: [
        { id: "a", text: "push()" },
        { id: "b", text: "pop()" },
        { id: "c", text: "shift()" },
        { id: "d", text: "unshift()" },
      ],
      correctAnswer: "a",
    },
    {
      id: "q4",
      text: "What is the correct way to create a function in JavaScript?",
      options: [
        { id: "a", text: "function = myFunction() {}" },
        { id: "b", text: "function:myFunction() {}" },
        { id: "c", text: "function myFunction() {}" },
        { id: "d", text: "create myFunction() {}" },
      ],
      correctAnswer: "c",
    },
    {
      id: "q5",
      text: "Which of these is NOT a JavaScript framework or library?",
      options: [
        { id: "a", text: "React" },
        { id: "b", text: "Angular" },
        { id: "c", text: "Swift" },
        { id: "d", text: "Vue" },
      ],
      correctAnswer: "c",
    },
  ],
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const question = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
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

    // Calculate score
    let correctCount = 0
    quizData.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / quizData.questions.length) * 100)

    // Simulate submitting to server
    setTimeout(() => {
      setIsSubmitting(false)
      router.push(`/dashboard/quizzes/${params.id}/results?score=${score}`)
    }, 1500)
  }

  const isLastQuestion = currentQuestion === quizData.questions.length - 1
  const hasAnsweredCurrent = answers[question.id] !== undefined

  return (
    <div className="container mx-auto flex max-w-3xl flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{quizData.title}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[question.id]} onValueChange={handleAnswer} className="space-y-4">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={!hasAnsweredCurrent || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
              {!isSubmitting && <CheckCircle className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!hasAnsweredCurrent}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="flex flex-wrap gap-2">
        {quizData.questions.map((_, index) => (
          <Button
            key={index}
            variant={
              index === currentQuestion ? "default" : answers[quizData.questions[index].id] ? "secondary" : "outline"
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

