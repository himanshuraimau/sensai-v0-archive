import prisma from "./prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"

export interface User {
  user_id(user_id: any, arg1: { full_name: any; bio: any; location: any; occupation: any; profile_image_url: any }): unknown
  id: number
  username: string
  email: string
  fullName: string
  bio?: string | null
  location?: string | null
  occupation?: string | null
  profileImageUrl?: string | null
  createdAt: Date
  lastLogin?: Date | null
  isActive: boolean
  isVerified: boolean
}

// Register a new user
export async function registerUser(userData: {
  username: string
  email: string
  password: string
  full_name: string
}): Promise<User> {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        { username: userData.username }
      ]
    }
  })

  if (existingUser) {
    throw new Error("User with this email or username already exists")
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(userData.password, salt)

  // Insert the new user with a transaction
  try {
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          passwordHash: hashedPassword,
          fullName: userData.full_name,
          isActive: true,
          isVerified: false
        }
      })

      // Create default user settings
      await tx.userSettings.create({
        data: {
          userId: newUser.id,
          themeMode: 'light',
          colorTheme: 'yellow'
        }
      })

      // Create default note folders
      await tx.noteFolder.createMany({
        data: [
          {
            userId: newUser.id,
            name: 'All Notes',
            iconName: 'FileText',
            isDefault: true
          },
          {
            userId: newUser.id,
            name: 'Favorites',
            iconName: 'Star',
            isDefault: true
          },
          {
            userId: newUser.id,
            name: 'Trash',
            iconName: 'Trash2',
            isDefault: true
          }
        ]
      })

      // Initialize learning streak
      await tx.learningStreak.create({
        data: {
          userId: newUser.id,
          currentStreak: 0,
          longestStreak: 0
        }
      })

      return newUser
    })

    return user
  } catch (error) {
    console.error("Error registering user:", error)
    throw new Error("Failed to register user")
  }
}

// Login a user
export async function loginUser(email: string, password: string) {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Check if the user is active
  if (!user.isActive) {
    throw new Error("Account is inactive")
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash)

  if (!isMatch) {
    throw new Error("Invalid credentials")
  }

  // Update last login time
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  // Create JWT token
  const token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  // Log the login attempt
  const clientIp = "127.0.0.1" // In a real app, get this from the request
  const userAgent = "Unknown" // In a real app, get this from the request

  await prisma.loginAttempt.create({
    data: {
      userId: user.id,
      ipAddress: clientIp,
      userAgent: userAgent,
      success: true
    }
  })

  // Create a refresh token
  const refreshToken = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: "30d" })

  // Store the refresh token in the database
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  await prisma.authToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshToken,
      tokenType: 'refresh',
      expiresAt: expiresAt
    }
  })

  // Return user data and tokens
  const { passwordHash, ...userWithoutPassword } = user
  return {
    user: userWithoutPassword,
    token,
    refreshToken,
  }
}

// Get the current user from the request
export async function getCurrentUser(req: NextRequest): Promise<User | null> {
  const cookieStore = cookies()
  const token = (await cookieStore).get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { user_id: number }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id }
    })

    if (!user) {
      return null
    }

    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    return null
  }
}

// Middleware to protect routes
export function withAuth(handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(req, user)
  }
}

// Logout a user
export async function logoutUser(refreshToken: string | undefined) {
  if (refreshToken) {
    // Invalidate the refresh token in the database
    await prisma.authToken.updateMany({
      where: { 
        tokenHash: refreshToken,
        tokenType: 'refresh'
      },
      data: { isRevoked: true }
    })
  }
  
  const cookieStore = cookies()
  ;(await cookieStore).delete("auth_token")
  ;(await cookieStore).delete("refresh_token")
}

// Refresh the access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload & { user_id: number }

    // Check if the token exists in the database and is not revoked
    const tokenRecord = await prisma.authToken.findFirst({
      where: {
        userId: decoded.user_id,
        tokenHash: refreshToken,
        tokenType: 'refresh',
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!tokenRecord) {
      throw new Error("Invalid refresh token")
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Create a new access token
    const newAccessToken = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )

    const { passwordHash, ...userWithoutPassword } = user
    return {
      token: newAccessToken,
      user: userWithoutPassword,
    }
  } catch (error) {
    throw new Error("Failed to refresh token")
  }
}

