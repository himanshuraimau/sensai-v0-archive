import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getUserSettings, updateUserSettings } from "@/lib/models/user"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const settings = await getUserSettings(user.id)

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
      themeMode,
      colorTheme,
      fontSize,
      animationLevel,
      notificationsEnabled,
      emailNotificationsEnabled,
      learningAnalyticsEnabled,
      twoFactorEnabled,
    } = await req.json()

    const settings = await updateUserSettings(user.id, {
      theme_mode: themeMode,
      color_theme: colorTheme,
      font_size: fontSize,
      animation_level: animationLevel,
      notifications_enabled: notificationsEnabled,
      email_notifications_enabled: emailNotificationsEnabled,
      learning_analytics_enabled: learningAnalyticsEnabled,
      two_factor_enabled: twoFactorEnabled,
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
})

