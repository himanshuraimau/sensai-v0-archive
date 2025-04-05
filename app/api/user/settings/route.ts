import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getUserSettings, updateUserSettings } from "@/lib/models/user"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const settings = getUserSettings(user.user_id)

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const {
      theme_mode,
      color_theme,
      font_size,
      animation_level,
      notifications_enabled,
      email_notifications_enabled,
      learning_analytics_enabled,
      two_factor_enabled,
    } = await req.json()

    const settings = updateUserSettings(user.user_id, {
      theme_mode,
      color_theme,
      font_size,
      animation_level,
      notifications_enabled,
      email_notifications_enabled,
      learning_analytics_enabled,
      two_factor_enabled,
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
})

