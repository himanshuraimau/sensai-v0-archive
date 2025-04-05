import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getDb } from "@/lib/db"

// Get a specific task
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const taskId = Number.parseInt(req.url.split("/").pop() as string)

    const db = getDb()

    const task = db
      .prepare(`
      SELECT * FROM tasks 
      WHERE task_id = ? AND user_id = ?
    `)
      .get(taskId, user.user_id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
})

// Update a task
export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const taskId = Number.parseInt(req.url.split("/").pop() as string)
    const { title, description, categoryId, dueDate, priority, isCompleted } = await req.json()

    const db = getDb()

    // Check if the task exists and belongs to the user
    const task = db
      .prepare(`
      SELECT * FROM tasks 
      WHERE task_id = ? AND user_id = ?
    `)
      .get(taskId, user.user_id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update the task
    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, category_id = ?, due_date = ?, 
          priority = ?, is_completed = ?, updated_at = datetime('now')
      WHERE task_id = ?
    `).run(
      title || task.title,
      description !== undefined ? description : task.description,
      categoryId !== undefined ? categoryId : task.category_id,
      dueDate !== undefined ? dueDate : task.due_date,
      priority || task.priority,
      isCompleted !== undefined ? (isCompleted ? 1 : 0) : task.is_completed,
      taskId,
    )

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE task_id = ?").get(taskId)

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
})

// Delete a task
export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const taskId = Number.parseInt(req.url.split("/").pop() as string)

    const db = getDb()

    // Check if the task exists and belongs to the user
    const task = db
      .prepare(`
      SELECT * FROM tasks 
      WHERE task_id = ? AND user_id = ?
    `)
      .get(taskId, user.user_id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Delete the task
    db.prepare("DELETE FROM tasks WHERE task_id = ?").run(taskId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
})

