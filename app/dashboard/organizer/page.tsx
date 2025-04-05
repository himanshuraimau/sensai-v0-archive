"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfToday,
  parse,
  add,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  isToday,
  isSameMonth,
  isEqual,
  endOfWeek,
  startOfWeek,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Plus, Tag, Trash2, X } from "lucide-react"

type Task = {
  id: string
  title: string
  completed: boolean
  category: string
  dueDate?: Date
  notes?: string
}

type Event = {
  id: string
  title: string
  date: Date
  category: string
  isTask?: boolean
  taskId?: string
  notes?: string
}

const categories = [
  { value: "study", label: "Study", color: "bg-amber-500" },
  { value: "quiz", label: "Quiz Prep", color: "bg-emerald-500" },
  { value: "project", label: "Project", color: "bg-violet-500" },
  { value: "meeting", label: "Meeting", color: "bg-blue-500" },
  { value: "personal", label: "Personal", color: "bg-rose-500" },
]

export default function OrganizerPage() {
  const { toast } = useToast()
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"))
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete JavaScript tutorial",
      completed: false,
      category: "study",
      dueDate: add(today, { days: 2 }),
      notes: "Focus on ES6 features and async/await",
    },
    {
      id: "2",
      title: "Prepare for machine learning quiz",
      completed: false,
      category: "quiz",
      dueDate: add(today, { days: 4 }),
      notes: "Review neural networks and decision trees",
    },
    {
      id: "3",
      title: "Work on data visualization project",
      completed: false,
      category: "project",
      dueDate: add(today, { days: 7 }),
      notes: "Create interactive dashboard with D3.js",
    },
    {
      id: "4",
      title: "Review yesterday's notes",
      completed: true,
      category: "study",
      dueDate: today,
    },
  ])

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Study Group Meeting",
      date: add(today, { days: 1, hours: 14 }),
      category: "meeting",
      notes: "Virtual meeting with study group to discuss project progress",
    },
    {
      id: "2",
      title: "Web Development Workshop",
      date: add(today, { days: 3, hours: 10 }),
      category: "study",
      notes: "Online workshop on advanced React patterns",
    },
  ])

  const [newTask, setNewTask] = useState({
    title: "",
    category: "study",
    dueDate: undefined as Date | undefined,
    notes: "",
  })

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: today,
    category: "meeting",
    notes: "",
  })

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")

  // Generate calendar days
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const days = eachDayOfInterval({
    start: startOfMonth(firstDayCurrentMonth),
    end: endOfMonth(firstDayCurrentMonth),
  })

  // Get events for selected day
  const selectedDayEvents = events.filter(
    (event) => format(event.date, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd"),
  )

  // Get tasks due on selected day
  const selectedDayTasks = tasks.filter(
    (task) => task.dueDate && format(task.dueDate, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd"),
  )

  // Update events when tasks change
  useEffect(() => {
    // Remove task-related events
    const filteredEvents = events.filter((event) => !event.isTask)

    // Add events for tasks with due dates
    const taskEvents = tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate as Date,
        category: task.category,
        isTask: true,
        taskId: task.id,
        notes: task.notes,
      }))

    setEvents([...filteredEvents, ...taskEvents])
  }, [tasks])

  const previousMonth = () => {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayPreviousMonth, "MMM-yyyy"))
  }

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task.",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      category: newTask.category,
      dueDate: newTask.dueDate,
      notes: newTask.notes,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      category: "study",
      dueDate: undefined,
      notes: "",
    })
    setIsAddingTask(false)

    toast({
      title: "Task added",
      description: "Your new task has been added successfully.",
    })
  }

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Event title required",
        description: "Please enter a title for your event.",
        variant: "destructive",
      })
      return
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      category: newEvent.category,
      notes: newEvent.notes,
    }

    setEvents([...events.filter((e) => !e.isTask), event])
    setNewEvent({
      title: "",
      date: today,
      category: "meeting",
      notes: "",
    })
    setIsAddingEvent(false)

    toast({
      title: "Event added",
      description: "Your new event has been added to the calendar.",
    })
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list.",
    })
  }

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
    toast({
      title: "Event deleted",
      description: "The event has been removed from your calendar.",
    })
  }

  const getCategoryColor = (categoryValue: string) => {
    return categories.find((cat) => cat.value === categoryValue)?.color || "bg-gray-500"
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => task.dueDate && format(task.dueDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => !event.isTask && format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
  }

  const renderCalendarDay = (day: Date) => {
    const dayTasks = getTasksForDate(day)
    const dayEvents = getEventsForDate(day)
    const formattedDay = format(day, "d")
    const isCurrentMonth = isSameMonth(day, firstDayCurrentMonth)
    const isSelected = isEqual(day, selectedDay)

    return (
      <div
        key={day.toString()}
        className={`relative h-14 border-b border-r p-1 ${
          !isCurrentMonth ? "bg-muted/50 text-muted-foreground" : ""
        } ${isToday(day) ? "bg-accent/20" : ""} ${isSelected ? "bg-accent text-accent-foreground" : ""}`}
        onClick={() => setSelectedDay(day)}
      >
        <time dateTime={format(day, "yyyy-MM-dd")} className="ml-1 text-sm">
          {formattedDay}
        </time>
        <div className="mt-1 flex flex-wrap gap-1 overflow-hidden">
          {dayTasks.length > 0 && (
            <div className={`h-1.5 w-1.5 rounded-full ${getCategoryColor(dayTasks[0].category)}`} />
          )}
          {dayEvents.length > 0 && (
            <div className={`h-1.5 w-1.5 rounded-full ${getCategoryColor(dayEvents[0].category)}`} />
          )}
          {dayTasks.length + dayEvents.length > 1 && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDay, { weekStartsOn: 0 })
    const endDate = endOfWeek(selectedDay, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setSelectedDay(add(startDate, { weeks: -1 }))}>
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1">Previous Week</span>
          </Button>
          <h3 className="text-center font-medium">
            {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => setSelectedDay(add(startDate, { weeks: 1 }))}>
            <span className="mr-1">Next Week</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-background p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}

          {weekDays.map((day) => {
            const dayTasks = getTasksForDate(day)
            const dayEvents = getEventsForDate(day)
            const isCurrentDay = isEqual(day, selectedDay)

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] bg-background p-2 ${
                  isToday(day) ? "bg-accent/20" : ""
                } ${isCurrentDay ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="mb-1 text-right text-sm font-medium">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded px-1 py-0.5 text-xs text-white ${getCategoryColor(event.category)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`truncate rounded px-1 py-0.5 text-xs ${
                        task.completed ? "bg-muted line-through" : `text-white ${getCategoryColor(task.category)}`
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length + dayEvents.length > 4 && (
                    <div className="text-center text-xs text-muted-foreground">
                      +{dayTasks.length + dayEvents.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

    // Get events for the selected day and organize by hour
    const dayEvents = events.filter((event) => format(event.date, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd"))

    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setSelectedDay(add(selectedDay, { days: -1 }))}>
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1">Previous Day</span>
          </Button>
          <h3 className="text-center font-medium">{format(selectedDay, "EEEE, MMMM d, yyyy")}</h3>
          <Button variant="outline" size="sm" onClick={() => setSelectedDay(add(selectedDay, { days: 1 }))}>
            <span className="mr-1">Next Day</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg border">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              const eventHour = event.date.getHours()
              return eventHour === hour
            })

            return (
              <div key={hour} className="flex border-b last:border-b-0">
                <div className="w-16 border-r p-2 text-right text-sm text-muted-foreground">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
                </div>
                <div className="flex-1 p-2">
                  {hourEvents.length > 0 ? (
                    <div className="space-y-1">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`flex items-center justify-between rounded px-2 py-1 text-sm text-white ${getCategoryColor(event.category)}`}
                        >
                          <span>{event.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white/80 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteEvent(event.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Task & Calendar Organizer</h1>
        <p className="text-muted-foreground">Manage your tasks and schedule your learning activities</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your learning tasks</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddingTask(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {isAddingTask ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger id="task-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <div className={`mr-2 h-2 w-2 rounded-full ${category.color}`} />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-notes">Notes (Optional)</Label>
                  <Textarea
                    id="task-notes"
                    placeholder="Add any additional notes"
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </div>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Upcoming Tasks</h3>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {tasks
                    .filter((task) => !task.completed)
                    .sort((a, b) => {
                      if (!a.dueDate) return 1
                      if (!b.dueDate) return -1
                      return a.dueDate.getTime() - b.dueDate.getTime()
                    })
                    .map((task) => (
                      <div key={task.id} className="flex items-start justify-between rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${getCategoryColor(task.category)}`} />
                                {categories.find((c) => c.value === task.category)?.label}
                              </Badge>
                              {task.dueDate && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(task.dueDate, "MMM d")}
                                </Badge>
                              )}
                            </div>
                            {task.notes && <p className="mt-1 text-sm text-muted-foreground">{task.notes}</p>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>

                {tasks.some((task) => task.completed) && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Completed Tasks</h3>
                    {tasks
                      .filter((task) => task.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between rounded-lg border border-dashed bg-muted/50 p-3"
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-medium line-through">{task.title}</div>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <div className={`h-2 w-2 rounded-full ${getCategoryColor(task.category)}`} />
                                  {categories.find((c) => c.value === task.category)?.label}
                                </Badge>
                                {task.dueDate && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 text-lg font-medium">No tasks yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add your first task to get started</p>
                <Button className="mt-4" onClick={() => setIsAddingTask(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Schedule and view your events</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs>
                  <TabsList className="grid w-fit grid-cols-3">
                    <TabsTrigger value="month" onClick={() => setCalendarView("month")}>
                      Month
                    </TabsTrigger>
                    <TabsTrigger value="week" onClick={() => setCalendarView("week")}>
                      Week
                    </TabsTrigger>
                    <TabsTrigger value="day" onClick={() => setCalendarView("day")}>
                      Day
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
                      <DialogDescription>Create a new event on your calendar</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          placeholder="Enter event title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date & Time</Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {format(newEvent.date, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newEvent.date}
                                onSelect={(date) => setNewEvent({ ...newEvent, date: date || today })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select
                            value={String(newEvent.date.getHours())}
                            onValueChange={(value) => {
                              const newDate = new Date(newEvent.date)
                              newDate.setHours(Number.parseInt(value))
                              setNewEvent({ ...newEvent, date: newDate })
                            }}
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>
                                  {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-category">Category</Label>
                        <Select
                          value={newEvent.category}
                          onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                        >
                          <SelectTrigger id="event-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center">
                                  <div className={`mr-2 h-2 w-2 rounded-full ${category.color}`} />
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-notes">Notes (Optional)</Label>
                        <Textarea
                          id="event-notes"
                          placeholder="Add any additional notes"
                          value={newEvent.notes}
                          onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEvent}>Add Event</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="month" className="space-y-4">
              <TabsContent value="month" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{format(firstDayCurrentMonth, "MMMM yyyy")}</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}

                  {days.map((day) => renderCalendarDay(day))}
                </div>
              </TabsContent>

              <TabsContent value="week">{renderWeekView()}</TabsContent>

              <TabsContent value="day">{renderDayView()}</TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="space-y-4 w-full">
              <h3 className="font-medium">{format(selectedDay, "MMMM d, yyyy")} - Events & Tasks</h3>

              {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No events or tasks scheduled for this day
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents
                    .filter((event) => !event.isTask)
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-white ${getCategoryColor(event.category)}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs text-white/80">
                              {format(event.date, "h:mm a")} -{" "}
                              {categories.find((c) => c.value === event.category)?.label}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEvent(event.id)}
                          className="text-white/80 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                  {selectedDayTasks.length > 0 && (
                    <div className="pt-2">
                      <h4 className="mb-2 text-sm font-medium">Tasks Due Today</h4>
                      {selectedDayTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-lg border p-2">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={task.completed} onCheckedChange={() => toggleTaskCompletion(task.id)} />
                            <div>
                              <div className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Tag className="h-3 w-3" />
                                {categories.find((c) => c.value === task.category)?.label}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

