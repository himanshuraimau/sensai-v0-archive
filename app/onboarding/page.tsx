"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Brain, ChevronRight, AlertCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const subjects = [
  { id: "mathematics", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "languages", label: "Languages" },
  { id: "programming", label: "Programming" },
  { id: "art_design", label: "Art & Design" },
  { id: "business", label: "Business" },
  { id: "music", label: "Music" },
  { id: "psychology", label: "Psychology" },
  { id: "philosophy", label: "Philosophy" },
  { id: "engineering", label: "Engineering" },
  { id: "medicine", label: "Medicine" },
]

const learningGoalTypes = [
  { id: "skill_development", label: "Skill Development" },
  { id: "academic_preparation", label: "Academic Preparation" },
  { id: "career_advancement", label: "Career Advancement" },
  { id: "personal_enrichment", label: "Personal Enrichment" },
  { id: "certification", label: "Professional Certification" },
  { id: "research", label: "Research" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [interests, setInterests] = useState<{[key: string]: number}>({})
  const [goals, setGoals] = useState<{[key: string]: string}>({})
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInterestToggle = (subjectId: string, value: number = 5) => {
    setInterests(prev => {
      const newInterests = { ...prev };
      if (newInterests[subjectId]) {
        delete newInterests[subjectId];
      } else {
        newInterests[subjectId] = value;
      }
      return newInterests;
    });
  }

  const handleInterestLevelChange = (subjectId: string, level: number[]) => {
    if (interests[subjectId] !== undefined) {
      setInterests(prev => ({
        ...prev,
        [subjectId]: level[0]
      }));
    }
  }

  const handleGoalToggle = (goalId: string, description: string = '') => {
    setGoals(prev => {
      const newGoals = { ...prev };
      if (newGoals[goalId]) {
        delete newGoals[goalId];
      } else {
        newGoals[goalId] = description;
      }
      return newGoals;
    });
  }

  const handleGoalDescriptionChange = (goalId: string, description: string) => {
    if (goals[goalId] !== undefined) {
      setGoals(prev => ({
        ...prev,
        [goalId]: description
      }));
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (Object.keys(interests).length === 0) {
        setError("Please select at least one subject you're interested in.");
        return;
      }
      setError(null);
      setStep(2);
    } else {
      submitOnboardingData();
    }
  }

  const submitOnboardingData = async () => {
    if (Object.keys(goals).length === 0) {
      setError("Please select at least one learning goal.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const interestsData = Object.entries(interests).map(([subject, interestLevel]) => ({
        subject,
        interestLevel
      }));

      const learningGoalsData = Object.entries(goals).map(([goalType, description]) => ({
        goalType,
        description
      }));

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interests: interestsData,
          learningGoals: learningGoalsData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save onboarding data');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 1 ? "What would you like to learn?" : "Set your learning goals"}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Select subjects you're interested in and rate your interest level" : "Tell us what you want to achieve with your learning"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {subjects.map((subject) => (
                  <div key={subject.id} className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={interests[subject.id] !== undefined}
                        onCheckedChange={() => handleInterestToggle(subject.id)}
                      />
                      <Label htmlFor={subject.id}>{subject.label}</Label>
                    </div>
                    {interests[subject.id] !== undefined && (
                      <div className="px-2">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Interest Level: {interests[subject.id]}
                        </Label>
                        <Slider
                          defaultValue={[interests[subject.id]]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => handleInterestLevelChange(subject.id, value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {learningGoalTypes.map((goal) => (
                <div key={goal.id} className="space-y-2 border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.id}
                      checked={goals[goal.id] !== undefined}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <Label htmlFor={goal.id}>{goal.label}</Label>
                  </div>
                  {goals[goal.id] !== undefined && (
                    <div className="pl-6 mt-2">
                      <Label className="text-sm block mb-1" htmlFor={`desc-${goal.id}`}>
                        Description (optional):
                      </Label>
                      <Input
                        id={`desc-${goal.id}`}
                        placeholder="Tell us more about this goal..."
                        value={goals[goal.id] || ''}
                        onChange={(e) => handleGoalDescriptionChange(goal.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            disabled={isLoading || (step === 1 && Object.keys(interests).length === 0) || (step === 2 && Object.keys(goals).length === 0)}
            className={step === 1 ? "ml-auto" : ""}
          >
            {isLoading ? "Saving..." : step === 1 ? "Next" : "Complete Setup"}
            {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

