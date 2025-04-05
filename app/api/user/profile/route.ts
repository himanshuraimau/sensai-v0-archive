import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth"
import { getUserProfile, updateUserProfile } from "@/lib/models/user"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const userProfile = await getUserProfile(user.id)

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: userProfile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const { fullName, bio, location, occupation, profileImageUrl } = await req.json()

    const updatedProfile = await updateUserProfile(user.id, {
      fullName,
      bio,
      location,
      occupation,
      profileImageUrl,
    })

    if (!updatedProfile) {
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
})

