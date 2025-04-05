"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trophy, TrendingUp } from "lucide-react"

export default function ProgressPage() {
  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Calendar className="h-5 w-5 text-primary" />}
              title="Learning Streak"
              value="7 days"
              trend="+2 from last week"
              trendUp={true}
            />
            <SummaryCard
              icon={<Clock className="h-5 w-5 text-primary" />}
              title="Study Time"
              value="12.5 hours"
              trend="+3.2 from last week"
              trendUp={true}
            />
            <SummaryCard
              icon={<Trophy className="h-5 w-5 text-primary" />}
              title="Quizzes Completed"
              value="8 total"
              trend="+2 from last week"
              trendUp={true}
            />
            <SummaryCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              title="Average Score"
              value="85%"
              trend="+5% from last week"
              trendUp={true}
            />
          </div>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your learning activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] rounded-md bg-muted/50" />
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Milestones you've reached recently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AchievementItem title="7-Day Streak" description="You've studied for 7 consecutive days" date="Today" />
              <AchievementItem
                title="Quiz Master"
                description="Completed 5 quizzes with a score of 80% or higher"
                date="Yesterday"
              />
              <AchievementItem
                title="Fast Learner"
                description="Completed your first course in record time"
                date="3 days ago"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Track your progress across different subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SubjectProgress subject="Programming" progress={72} courses={4} quizzes={12} timeSpent="8.5 hours" />
              <SubjectProgress subject="Data Science" progress={45} courses={2} quizzes={6} timeSpent="5.2 hours" />
              <SubjectProgress subject="Web Development" progress={28} courses={1} quizzes={3} timeSpent="3.8 hours" />
              <SubjectProgress subject="Machine Learning" progress={15} courses={1} quizzes={2} timeSpent="2.1 hours" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AchievementCard
              title="7-Day Streak"
              description="You've studied for 7 consecutive days"
              progress={100}
              isCompleted={true}
            />
            <AchievementCard
              title="Quiz Master"
              description="Complete 5 quizzes with a score of 80% or higher"
              progress={100}
              isCompleted={true}
            />
            <AchievementCard
              title="Fast Learner"
              description="Complete your first course in record time"
              progress={100}
              isCompleted={true}
            />
            <AchievementCard
              title="Knowledge Explorer"
              description="Study 3 different subjects"
              progress={100}
              isCompleted={true}
            />
            <AchievementCard
              title="Dedicated Learner"
              description="Study for a total of 20 hours"
              progress={62}
              isCompleted={false}
            />
            <AchievementCard
              title="Perfect Score"
              description="Get 100% on any quiz"
              progress={0}
              isCompleted={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard({
  icon,
  title,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode
  title: string
  value: string
  trend: string
  trendUp: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-xs ${trendUp ? "text-green-500" : "text-red-500"}`}>{trend}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      </CardContent>
    </Card>
  )
}

function AchievementItem({
  title,
  description,
  date,
}: {
  title: string
  description: string
  date: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="rounded-full bg-primary/10 p-2">
        <Trophy className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-sm text-muted-foreground">{date}</div>
    </div>
  )
}

function SubjectProgress({
  subject,
  progress,
  courses,
  quizzes,
  timeSpent,
}: {
  subject: string
  progress: number
  courses: number
  quizzes: number
  timeSpent: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{subject}</h3>
        <span className="text-sm text-muted-foreground">{progress}% complete</span>
      </div>
      <Progress value={progress} />
      <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
        <span>{courses} courses</span>
        <span>{quizzes} quizzes</span>
        <span>{timeSpent}</span>
      </div>
    </div>
  )
}

function AchievementCard({
  title,
  description,
  progress,
  isCompleted,
}: {
  title: string
  description: string
  progress: number
  isCompleted: boolean
}) {
  return (
    <Card className={isCompleted ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isCompleted && <Trophy className="h-5 w-5 text-primary" />}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        {isCompleted && (
          <Badge className="mt-4" variant="outline">
            Completed
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

