import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface CalendarEvent {
  event_id: number
  user_id: number
  title: string
  description?: string
  category_id?: number
  start_time: string
  end_time?: string
  is_all_day: boolean
  location?: string
  is_recurring: boolean
  recurrence_pattern?: string
  recurrence_end_date?: string
  created_at: string
  updated_at: string
}

// Fetch all events
export function useEvents(
  options: {
    categoryId?: number
    startDate?: string
    endDate?: string
    isAllDay?: boolean
  } = {},
) {
  return useQuery({
    queryKey: ["events", options],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (options.categoryId) params.append("categoryId", options.categoryId.toString())
      if (options.startDate) params.append("startDate", options.startDate)
      if (options.endDate) params.append("endDate", options.endDate)
      if (options.isAllDay !== undefined) params.append("allDay", options.isAllDay.toString())

      const response = await fetch(`/api/events?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      return data.events as CalendarEvent[]
    },
  })
}

// Create a new event
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: {
      title: string
      description?: string
      categoryId?: number
      startTime: string
      endTime?: string
      isAllDay?: boolean
      location?: string
      isRecurring?: boolean
      recurrencePattern?: string
      recurrenceEndDate?: string
    }) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error("Failed to create event")
      }

      const data = await response.json()
      return data.event as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

