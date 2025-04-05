"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { getQuizzes, getQuizAttempts, generateQuiz } from "@/lib/api/quiz"
import { useToast } from "@/components/ui/use-toast"

export default function QuizzesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("available")
  const [retryCount, setRetryCount] = useState(0)
  
  // Fetch quizzes
  const { 
    data: quizzes = [],
    isLoading: isLoadingQuizzes,
    error: quizzesError
  } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes
  })
  
  // Fetch quiz attempts
  const {
    data: attempts = [],
    isLoading: isLoadingAttempts,
    error: attemptsError
  } = useQuery({
    queryKey: ['quizAttempts'],
    queryFn: getQuizAttempts
  })
  
  // Generate quiz mutation with improved error handling
  const { mutate: generateNewQuiz, isPending: isGenerating } = useMutation({
    mutationFn: async (params: { difficulty: string; questionCount?: number } = { difficulty: 'beginner' }) => {
      try {
        // Extract params with defaults
        const { difficulty, questionCount } = typeof params === 'string' 
          ? { difficulty: params, questionCount: undefined } 
          : params;

        return await generateQuiz(difficulty, questionCount);
      } catch (error: any) {
        // Check if it's a Prisma transaction error
        if (error.message?.includes('Transaction API error') || 
            error.message?.includes('Transaction not found')) {
          
          // If this is a standard quiz generation attempt, try with fewer questions
          if (!params.questionCount) {
            toast({
              title: "Database busy",
              description: "Trying to generate a smaller quiz with 5 questions...",
              variant: "default"
            });
            
            // Short delay before trying the smaller quiz
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await generateQuiz(typeof params === 'string' ? params : params.difficulty, 5);
          }
          
          // If we're already trying a small quiz and still getting errors, use backoff retry
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
            
            toast({
              title: "Database still busy",
              description: `Retrying in ${backoffTime/1000} seconds...`,
              variant: "default"
            });
            
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            return await generateQuiz(
              typeof params === 'string' ? params : params.difficulty, 
              typeof params === 'object' && params.questionCount ? params.questionCount : 5
            );
          }
        }
        throw error;
      }
    },
    onSuccess: (newQuiz) => {
      setRetryCount(0); // Reset retry count on success
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast({
        title: "Quiz Generated",
        description: `Successfully created "${newQuiz.title}" quiz with ${newQuiz.questions?.length || 'multiple'} questions.`,
      })
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      let title = "Failed to Generate Quiz";
      
      // Provide more helpful error messages based on error type
      if (error.message?.includes('Transaction API error') || 
          error.message?.includes('Transaction not found')) {
        title = "Database Transaction Error";
        errorMessage = "The database was busy processing multiple requests. Please try again.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "The request timed out. Please try again when the server is less busy.";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive"
      })
    }
  })

  // Completed quizzes
  const completedQuizzes = attempts
    .filter(attempt => attempt.completedAt)
    .map(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId)
      return {
        id: attempt.id.toString(),
        quizId: attempt.quizId.toString(),
        title: quiz?.title || "Unknown Quiz",
        score: attempt.score || 0,
        maxScore: attempt.maxScore,
        scorePercentage: Math.round(((attempt.score || 0) / attempt.maxScore) * 100),
        completedDate: new Date(attempt.completedAt!).toLocaleDateString(),
        category: quiz?.subjectArea || "General"
      }
    })

  // Handle loading and error states
  if (quizzesError || attemptsError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-64">
        <p className="text-red-500 mb-4">Error loading quizzes.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['quizzes'] })}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>
        <Button 
          onClick={() => generateNewQuiz({ difficulty: 'beginner' })} 
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate Quiz
            </>
          )}
        </Button>
      </header>

      <Tabs 
        defaultValue="available" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="available">Available Quizzes</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {isLoadingQuizzes ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">No quizzes available yet.</p>
              <Button onClick={() => generateNewQuiz({ difficulty: 'beginner' })} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Your First Quiz'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {isLoadingAttempts ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : completedQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                You haven't completed any quizzes yet.
              </p>
              <Button onClick={() => setActiveTab("available")}>
                Take a Quiz
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedQuizzes.map((quiz) => (
                <CompletedQuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QuizCard({ quiz }: { quiz: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Badge
            variant={
              quiz.difficultyLevel === "beginner" 
                ? "outline" 
                : quiz.difficultyLevel === "intermediate" 
                  ? "secondary" 
                  : "default"
            }
          >
            {quiz.difficultyLevel.charAt(0).toUpperCase() + quiz.difficultyLevel.slice(1)}
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.questions?.length || "Multiple"} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.timeEstimate || "~10 min"}</span>
          </div>
        </div>
        <Badge variant="outline" className="mt-4">
          {quiz.subjectArea}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/quizzes/${quiz.id}`}>Start Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function CompletedQuizCard({ quiz }: { quiz: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <Badge 
            variant={
              quiz.scorePercentage >= 90 
                ? "default" 
                : quiz.scorePercentage >= 70 
                  ? "secondary" 
                  : "outline"
            }
          >
            {quiz.scorePercentage}%
          </Badge>
        </div>
        <CardDescription>Score: {quiz.score}/{quiz.maxScore}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>Completed {quiz.completedDate}</span>
          </div>
        </div>
        <Badge variant="outline" className="mt-4">
          {quiz.category}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/dashboard/quizzes/attempts/${quiz.id}/results`}>View Results</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

