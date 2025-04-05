import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getDb } from "@/lib/db"

// Get all calendar events for a user
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const isAllDay = searchParams.get("allDay")

    const db = getDb()

    let sql = "SELECT * FROM calendar_events WHERE user_id = ?"
    const params: any[] = [user.user_id]

    if (categoryId) {
      sql += " AND category_id = ?"
      params.push(Number.parseInt(categoryId))
    }

    if (startDate) {
      sql += " AND datetime(start_time) >= datetime(?)"
      params.push(startDate)
    }

    if (endDate) {
      sql += " AND datetime(start_time) <= datetime(?)"
      params.push(endDate)
    }

    if (isAllDay !== null) {
      sql += " AND is_all_day = ?"
      params.push(isAllDay === "true" ? 1 : 0)
    }

    sql += " ORDER BY start_time ASC"

    const events = db.prepare(sql).all(...params)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
})

// Create a new calendar event
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const {
      title,
      description,
      categoryId,
      startTime,
      endTime,
      isAllDay,
      location,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
    } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!startTime) {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }

    const db = getDb()

    const result = db
      .prepare(`
      INSERT INTO calendar_events (
        user_id, title, description, category_id, start_time, end_time,
        is_all_day, location, is_recurring, recurrence_pattern, recurrence_end_date,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
      .run(
        user.user_id,
        title,
        description || null,
        categoryId || null,
        startTime,
        endTime || null,
        isAllDay ? 1 : 0,
        location || null,
        isRecurring ? 1 : 0,
        recurrencePattern || null,
        recurrenceEndDate || null,
      )

    const eventId = result.lastInsertRowid as number

    const event = db.prepare("SELECT * FROM calendar_events WHERE event_id = ?").get(eventId)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
})

