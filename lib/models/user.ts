import { getDb } from "../db"
import type { User } from "../auth"

export interface UserSettings {
  setting_id: number
  user_id: number
  theme_mode: string
  color_theme: string
  font_size: string
  animation_level: string
  notifications_enabled: boolean
  email_notifications_enabled: boolean
  learning_analytics_enabled: boolean
  two_factor_enabled: boolean
}

export interface UserInterest {
  interest_id: number
  user_id: number
  subject: string
  interest_level: number
  created_at: string
}

export interface UserLearningGoal {
  goal_id: number
  user_id: number
  goal_type: string
  description: string
  is_active: boolean
  created_at: string
}

// Get a user by ID
export function getUserById(userId: number): User | null {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId) as User | null
}

// Get a user by email
export function getUserByEmail(email: string): User | null {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | null
}

// Get a user by username
export function getUserByUsername(username: string): User | null {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | null
}

// Update a user
export function updateUser(userId: number, userData: Partial<User>): User | null {
  const db = getDb()

  // Build the SET part of the SQL query dynamically
  const updateFields = Object.keys(userData)
    .filter((key) => key !== "user_id" && key !== "created_at") // Exclude fields that shouldn't be updated
    .map((key) => `${key} = ?`)

  if (updateFields.length === 0) {
    return getUserById(userId)
  }

  const updateValues = Object.keys(userData)
    .filter((key) => key !== "user_id" && key !== "created_at")
    .map((key) => userData[key as keyof typeof userData])

  const sql = `UPDATE users SET ${updateFields.join(", ")}, updated_at = datetime('now') WHERE user_id = ?`

  db.prepare(sql).run(...updateValues, userId)

  return getUserById(userId)
}

// Get user settings
export function getUserSettings(userId: number): UserSettings | null {
  const db = getDb()
  return db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as UserSettings | null
}

// Update user settings
export function updateUserSettings(userId: number, settings: Partial<UserSettings>): UserSettings | null {
  const db = getDb()

  // Check if settings exist
  const existingSettings = getUserSettings(userId)

  if (!existingSettings) {
    // Create settings if they don't exist
    const defaultSettings = {
      user_id: userId,
      theme_mode: "light",
      color_theme: "yellow",
      font_size: "medium",
      animation_level: "standard",
      notifications_enabled: true,
      email_notifications_enabled: true,
      learning_analytics_enabled: true,
      two_factor_enabled: false,
      ...settings,
    }

    const fields = Object.keys(defaultSettings).join(", ")
    const placeholders = Object.keys(defaultSettings)
      .map(() => "?")
      .join(", ")
    const values = Object.values(defaultSettings)

    db.prepare(`INSERT INTO user_settings (${fields}) VALUES (${placeholders})`).run(...values)

    return getUserSettings(userId)
  }

  // Update existing settings
  const updateFields = Object.keys(settings)
    .filter((key) => key !== "setting_id" && key !== "user_id")
    .map((key) => `${key} = ?`)

  if (updateFields.length === 0) {
    return existingSettings
  }

  const updateValues = Object.keys(settings)
    .filter((key) => key !== "setting_id" && key !== "user_id")
    .map((key) => settings[key as keyof typeof settings])

  const sql = `UPDATE user_settings SET ${updateFields.join(", ")} WHERE user_id = ?`

  db.prepare(sql).run(...updateValues, userId)

  return getUserSettings(userId)
}

// Get user interests
export function getUserInterests(userId: number): UserInterest[] {
  const db = getDb()
  return db.prepare("SELECT * FROM user_interests WHERE user_id = ?").all(userId) as UserInterest[]
}

// Add a user interest
export function addUserInterest(userId: number, subject: string, interestLevel = 5): UserInterest {
  const db = getDb()

  // Check if the interest already exists
  const existingInterest = db
    .prepare("SELECT * FROM user_interests WHERE user_id = ? AND subject = ?")
    .get(userId, subject) as UserInterest | undefined

  if (existingInterest) {
    // Update the interest level
    db.prepare("UPDATE user_interests SET interest_level = ? WHERE interest_id = ?").run(
      interestLevel,
      existingInterest.interest_id,
    )

    return {
      ...existingInterest,
      interest_level: interestLevel,
    }
  }

  // Add new interest
  const result = db
    .prepare(`
    INSERT INTO user_interests (user_id, subject, interest_level, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `)
    .run(userId, subject, interestLevel)

  const interestId = result.lastInsertRowid as number

  return {
    interest_id: interestId,
    user_id: userId,
    subject,
    interest_level: interestLevel,
    created_at: new Date().toISOString(),
  }
}

// Remove a user interest
export function removeUserInterest(interestId: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM user_interests WHERE interest_id = ?").run(interestId)
  return result.changes > 0
}

// Get user learning goals
export function getUserLearningGoals(userId: number): UserLearningGoal[] {
  const db = getDb()
  return db.prepare("SELECT * FROM user_learning_goals WHERE user_id = ?").all(userId) as UserLearningGoal[]
}

// Add a user learning goal
export function addUserLearningGoal(userId: number, goalType: string, description: string): UserLearningGoal {
  const db = getDb()

  const result = db
    .prepare(`
    INSERT INTO user_learning_goals (user_id, goal_type, description, is_active, created_at)
    VALUES (?, ?, ?, 1, datetime('now'))
  `)
    .run(userId, goalType, description)

  const goalId = result.lastInsertRowid as number

  return {
    goal_id: goalId,
    user_id: userId,
    goal_type: goalType,
    description,
    is_active: true,
    created_at: new Date().toISOString(),
  }
}

// Update a user learning goal
export function updateUserLearningGoal(goalId: number, updates: Partial<UserLearningGoal>): UserLearningGoal | null {
  const db = getDb()

  // Build the SET part of the SQL query dynamically
  const updateFields = Object.keys(updates)
    .filter((key) => key !== "goal_id" && key !== "user_id" && key !== "created_at")
    .map((key) => `${key} = ?`)

  if (updateFields.length === 0) {
    return db.prepare("SELECT * FROM user_learning_goals WHERE goal_id = ?").get(goalId) as UserLearningGoal | null
  }

  const updateValues = Object.keys(updates)
    .filter((key) => key !== "goal_id" && key !== "user_id" && key !== "created_at")
    .map((key) => updates[key as keyof typeof updates])

  const sql = `UPDATE user_learning_goals SET ${updateFields.join(", ")} WHERE goal_id = ?`

  db.prepare(sql).run(...updateValues, goalId)

  return db.prepare("SELECT * FROM user_learning_goals WHERE goal_id = ?").get(goalId) as UserLearningGoal | null
}

// Delete a user learning goal
export function deleteUserLearningGoal(goalId: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM user_learning_goals WHERE goal_id = ?").run(goalId)
  return result.changes > 0
}

