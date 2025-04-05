import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Task {
  task_id: number
  user_id: number
  title: string
  description?: string
  category_id?: number
  due_date?: string
  is_completed: boolean
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
}

// Fetch all tasks
export function useTasks(
  options: {
    categoryId?: number
    isCompleted?: boolean
    priority?: string
    dueDate?: string
  } = {},
) {
  return useQuery({
    queryKey: ["tasks", options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.categoryId) params.append("categoryId", options.categoryId.toString())
      if (options.isCompleted !== undefined) params.append("completed", options.isCompleted.toString())
      if (options.priority) params.append("priority", options.priority)
      if (options.dueDate) params.append("dueDate", options.dueDate)

      const response = await fetch(`/api/tasks?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      return data.tasks as Task[]
    },
  })
}

// Fetch a single task
export function useTask(taskId: number | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null

      const response = await fetch(`/api/tasks/${taskId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch task")
      }

      const data = await response.json()
      return data.task as Task
    },
    enabled: !!taskId,
  })
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskData: {
      title: string
      description?: string
      categoryId?: number
      dueDate?: string
      priority?: "low" | "medium" | "high"
    }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const data = await response.json()
      return data.task as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: number
      taskData: {
        title?: string
        description?: string
        categoryId?: number
        dueDate?: string
        priority?: "low" | "medium" | "high"
        isCompleted?: boolean
      }
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const data = await response.json()
      return data.task as Task
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] })
    },
  })
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

