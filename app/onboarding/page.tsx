"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Brain, ChevronRight } from "lucide-react"

const subjects = [
  { id: "math", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "language", label: "Languages" },
  { id: "programming", label: "Programming" },
  { id: "art", label: "Art & Design" },
  { id: "business", label: "Business" },
  { id: "music", label: "Music" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
    } else {
      setIsLoading(true)
      // Simulate saving preferences
      setTimeout(() => {
        setIsLoading(false)
        router.push("/dashboard")
      }, 1500)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 1 ? "What would you like to learn?" : "Set your learning goals"}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Select the subjects you're interested in" : "Tell us what you want to achieve"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.id}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                    />
                    <Label htmlFor={subject.id}>{subject.label}</Label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-1" />
                  <Label htmlFor="goal-1">Learn new skills</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-2" />
                  <Label htmlFor="goal-2">Prepare for exams</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-3" />
                  <Label htmlFor="goal-3">Professional development</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goal-4" />
                  <Label htmlFor="goal-4">Personal interest</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            disabled={(step === 1 && selectedSubjects.length === 0) || isLoading}
            className={step === 1 ? "ml-auto" : ""}
          >
            {isLoading ? "Saving..." : step === 1 ? "Next" : "Get Started"}
            {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

