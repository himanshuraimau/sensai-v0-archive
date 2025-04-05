import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getDb } from "@/lib/db"

// Get all tasks for a user
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const isCompleted = searchParams.get("completed")
    const priority = searchParams.get("priority")
    const dueDate = searchParams.get("dueDate")

    const db = getDb()

    let sql = "SELECT * FROM tasks WHERE user_id = ?"
    const params: any[] = [user.user_id]

    if (categoryId) {
      sql += " AND category_id = ?"
      params.push(Number.parseInt(categoryId))
    }

    if (isCompleted !== null) {
      sql += " AND is_completed = ?"
      params.push(isCompleted === "true" ? 1 : 0)
    }

    if (priority) {
      sql += " AND priority = ?"
      params.push(priority)
    }

    if (dueDate) {
      sql += " AND date(due_date) = date(?)"
      params.push(dueDate)
    }

    sql += " ORDER BY due_date ASC, priority DESC"

    const tasks = db.prepare(sql).all(...params)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
})

// Create a new task
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { title, description, categoryId, dueDate, priority } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const db = getDb()

    const result = db
      .prepare(`
      INSERT INTO tasks (
        user_id, title, description, category_id, due_date, priority, 
        is_completed, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `)
      .run(user.user_id, title, description || null, categoryId || null, dueDate || null, priority || "medium")

    const taskId = result.lastInsertRowid as number

    const task = db.prepare("SELECT * FROM tasks WHERE task_id = ?").get(taskId)

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
})

