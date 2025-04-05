import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { updateUser } from "@/lib/models/user"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const { full_name, bio, location, occupation, profile_image_url } = await req.json()

    const updatedUser = updateUser(user.user_id, {
      full_name,
      bio,
      location,
      occupation,
      profile_image_url,
    })

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
})

