import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Login the user
    const { user, token, refreshToken } = await loginUser(email, password)

    // Set cookies
    const cookieStore = await cookies()

    // Set the auth token cookie (httpOnly for security)
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    })

    // Set the refresh token cookie (httpOnly for security)
    cookieStore.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "strict",
    })
    
    // Return success response with user data
    return NextResponse.json({ 
      success: true, 
      user 
    }, { status: 200 })
    
  } catch (error: any) {
    console.error("Login error:", error)

    if (error.message === "Invalid credentials") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (error.message === "Account is inactive") {
      return NextResponse.json({ error: "Your account is inactive" }, { status: 403 })
    }

    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

