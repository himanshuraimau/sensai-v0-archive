"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  BookOpen,
  MessageSquare,
  FileText,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col space-y-6 w-full p-16">
      <header className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h1>
        <p className="text-muted-foreground">Continue your learning journey where you left off</p>
      </header>

      {/* Notifications */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-full bg-primary/20 p-2">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">New course recommendation available</p>
            <p className="text-sm text-muted-foreground">Based on your interests, we've found a new course for you.</p>
          </div>
          <Button size="sm" variant="outline">
            View
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Brain className="h-5 w-5 text-primary" />} title="Learning Streak" value="7 days" />
            <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} title="Courses" value="3 active" />
            <StatCard icon={<MessageSquare className="h-5 w-5 text-primary" />} title="AI Chats" value="12 total" />
            <StatCard icon={<FileText className="h-5 w-5 text-primary" />} title="Quizzes" value="8 completed" />
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <Link href="/dashboard/organizer" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <CardDescription>Your learning activities for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScheduleItem
                icon={<Clock className="h-5 w-5 text-primary" />}
                title="Machine Learning Quiz"
                time="10:00 AM - 10:30 AM"
                status="Upcoming"
              />
              <ScheduleItem
                icon={<BookOpen className="h-5 w-5 text-primary" />}
                title="JavaScript Advanced Concepts"
                time="1:00 PM - 2:30 PM"
                status="Upcoming"
              />
              <ScheduleItem
                icon={<Calendar className="h-5 w-5 text-primary" />}
                title="Study Group: Data Structures"
                time="4:00 PM - 5:00 PM"
                status="Upcoming"
              />
            </CardContent>
          </Card>

          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CourseCard
                title="Introduction to Machine Learning"
                progress={65}
                href="/dashboard/courses/machine-learning"
              />
              <CourseCard title="Advanced JavaScript Concepts" progress={32} href="/dashboard/courses/javascript" />
              <CourseCard title="Data Visualization Techniques" progress={18} href="/dashboard/courses/data-viz" />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning activity from the past week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem
                icon={<FileText className="h-5 w-5" />}
                title="Completed Quiz: JavaScript Fundamentals"
                time="2 hours ago"
              />
              <ActivityItem
                icon={<MessageSquare className="h-5 w-5" />}
                title="Chat Session: Understanding Neural Networks"
                time="Yesterday"
              />
              <ActivityItem
                icon={<BookOpen className="h-5 w-5" />}
                title="Started Course: Data Visualization Techniques"
                time="3 days ago"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Learning Insights */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<TrendingUp className="h-5 w-5 text-primary" />} title="Weekly Progress" value="+15%" />
            <StatCard icon={<Clock className="h-5 w-5 text-primary" />} title="Study Time" value="12.5 hrs" />
            <StatCard icon={<Target className="h-5 w-5 text-primary" />} title="Goals Completed" value="3/5" />
            <StatCard icon={<Award className="h-5 w-5 text-primary" />} title="Achievements" value="7 earned" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Track your progress across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SubjectProgress subject="Programming" progress={72} courses={4} quizzes={12} />
              <SubjectProgress subject="Data Science" progress={45} courses={2} quizzes={6} />
              <SubjectProgress subject="Web Development" progress={28} courses={1} quizzes={3} />
            </CardContent>
          </Card>

          {/* Learning Streak Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Streak</CardTitle>
              <CardDescription>Your daily learning activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  // Randomly determine if the day had activity
                  const hasActivity = Math.random() > 0.3
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${hasActivity ? "bg-primary/80" : "bg-muted"} hover:opacity-80 transition-opacity`}
                      title={`Day ${i + 1}: ${hasActivity ? "Active" : "Inactive"}`}
                    />
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-sm bg-muted"></div>
                  <div className="h-3 w-3 rounded-sm bg-primary/30"></div>
                  <div className="h-3 w-3 rounded-sm bg-primary/60"></div>
                  <div className="h-3 w-3 rounded-sm bg-primary/80"></div>
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Based on your interests and learning history</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <RecommendedCard
                title="Deep Learning Fundamentals"
                description="Learn the core concepts of neural networks and deep learning applications."
                href="/dashboard/courses/deep-learning"
                match="98% match"
              />
              <RecommendedCard
                title="React Advanced Patterns"
                description="Master advanced React patterns and performance optimization techniques."
                href="/dashboard/courses/react-advanced"
                match="92% match"
              />
              <RecommendedCard
                title="Data Analysis with Python"
                description="Explore data analysis techniques using Python and popular libraries."
                href="/dashboard/courses/python-data-analysis"
                match="87% match"
              />
            </CardContent>
          </Card>

          {/* Popular Among Peers */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Among Peers</CardTitle>
              <CardDescription>Courses trending in your field</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <RecommendedCard
                title="Cloud Computing Essentials"
                description="Learn the fundamentals of cloud infrastructure and deployment."
                href="/dashboard/courses/cloud-computing"
                match="Trending"
              />
              <RecommendedCard
                title="Cybersecurity Fundamentals"
                description="Understand the basics of securing systems and networks."
                href="/dashboard/courses/cybersecurity"
                match="Popular"
              />
              <RecommendedCard
                title="UI/UX Design Principles"
                description="Master the principles of creating effective user interfaces."
                href="/dashboard/courses/ui-ux-design"
                match="New"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      </CardContent>
    </Card>
  )
}

function CourseCard({ title, progress, href }: { title: string; progress: number; href: string }) {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-video bg-muted" />
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button asChild className="mt-4 w-full">
          <Link href={href}>Continue</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ icon, title, time }: { icon: React.ReactNode; title: string; time: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

function ScheduleItem({
  icon,
  title,
  time,
  status,
}: {
  icon: React.ReactNode
  title: string
  time: string
  status: "Completed" | "In Progress" | "Upcoming"
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <div
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          status === "Completed"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : status === "In Progress"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        }`}
      >
        {status}
      </div>
    </div>
  )
}

function SubjectProgress({
  subject,
  progress,
  courses,
  quizzes,
}: {
  subject: string
  progress: number
  courses: number
  quizzes: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{subject}</h3>
        <span className="text-sm text-muted-foreground">{progress}% complete</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{courses} courses</span>
        <span>{quizzes} quizzes</span>
      </div>
    </div>
  )
}

function RecommendedCard({
  title,
  description,
  href,
  match,
}: {
  title: string
  description: string
  href: string
  match: string
}) {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-video bg-muted relative">
        <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {match}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={href}>Explore</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

