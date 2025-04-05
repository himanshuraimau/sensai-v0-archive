import { getDb } from "../db"
import type { User } from "../auth"
import { prisma } from "@/lib/prisma"

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
export async function getUserById(userId: number): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
    }
  });
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}

// Get a user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { username },
  });
}

// Update a user
export async function updateUser(userId: number, userData: Partial<User>): Promise<User | null> {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: userData.fullName,
      bio: userData.bio,
      location: userData.location,
      occupation: userData.occupation,
      profileImageUrl: userData.profileImageUrl,
    },
    include: {
      settings: true,
    }
  });
}

// Get user settings
export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!userSettings) {
    return null;
  }

  // Map the Prisma result to the UserSettings interface
  const mappedSettings: UserSettings = {
    setting_id: userSettings.id,
    user_id: userSettings.userId,
    theme_mode: userSettings.themeMode || "light",
    color_theme: userSettings.colorTheme || "yellow",
    font_size: userSettings.fontSize || "medium",
    animation_level: userSettings.animationLevel || "standard",
    notifications_enabled: userSettings.notificationsEnabled ?? true,
    email_notifications_enabled: userSettings.emailNotificationsEnabled ?? true,
    learning_analytics_enabled: userSettings.learningAnalyticsEnabled ?? true,
    two_factor_enabled: userSettings.twoFactorEnabled ?? false,
  };

  return mappedSettings;
}

// Update user settings
export async function updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | null> {
  // Check if settings exist
  const existingSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!existingSettings) {
    // Create settings if they don't exist
    const userSettings = await prisma.userSettings.create({
      data: {
        userId: userId,
        themeMode: settings.theme_mode ?? "light",
        colorTheme: settings.color_theme ?? "yellow",
        fontSize: settings.font_size ?? "medium",
        animationLevel: settings.animation_level ?? "standard",
        notificationsEnabled: settings.notifications_enabled ?? true,
        emailNotificationsEnabled: settings.email_notifications_enabled ?? true,
        learningAnalyticsEnabled: settings.learning_analytics_enabled ?? true,
        twoFactorEnabled: settings.two_factor_enabled ?? false,
      }
    });

    return {
      setting_id: userSettings.id,
      user_id: userSettings.userId,
      theme_mode: userSettings.themeMode || "light",
      color_theme: userSettings.colorTheme || "yellow",
      font_size: userSettings.fontSize || "medium",
      animation_level: userSettings.animationLevel || "standard",
      notifications_enabled: userSettings.notificationsEnabled ?? true,
      email_notifications_enabled: userSettings.emailNotificationsEnabled ?? true,
      learning_analytics_enabled: userSettings.learningAnalyticsEnabled ?? true,
      two_factor_enabled: userSettings.twoFactorEnabled ?? false,
    };
  }

  // Update existing settings
  const updatedSettings = await prisma.userSettings.update({
    where: { userId },
    data: {
      themeMode: settings.theme_mode,
      colorTheme: settings.color_theme,
      fontSize: settings.font_size,
      animationLevel: settings.animation_level,
      notificationsEnabled: settings.notifications_enabled,
      emailNotificationsEnabled: settings.email_notifications_enabled,
      learningAnalyticsEnabled: settings.learning_analytics_enabled,
      twoFactorEnabled: settings.two_factor_enabled,
    }
  });

  return {
    setting_id: updatedSettings.id,
    user_id: updatedSettings.userId,
    theme_mode: updatedSettings.themeMode || "light",
    color_theme: updatedSettings.colorTheme || "yellow",
    font_size: updatedSettings.fontSize || "medium",
    animation_level: updatedSettings.animationLevel || "standard",
    notifications_enabled: updatedSettings.notificationsEnabled ?? true,
    email_notifications_enabled: updatedSettings.emailNotificationsEnabled ?? true,
    learning_analytics_enabled: updatedSettings.learningAnalyticsEnabled ?? true,
    two_factor_enabled: updatedSettings.twoFactorEnabled ?? false,
  };
}

// Get user interests
export async function getUserInterests(userId: number): Promise<UserInterest[]> {
  const interests = await prisma.userInterest.findMany({
    where: { userId },
  });
  
  return interests.map(interest => ({
    interest_id: interest.id,
    user_id: interest.userId,
    subject: interest.subject,
    interest_level: interest.interestLevel,
    created_at: interest.createdAt.toISOString(),
  }));
}

// Add a user interest
export async function addUserInterest(userId: number, subject: string, interestLevel = 5): Promise<UserInterest> {
  // Check if the interest already exists
  const existingInterest = await prisma.userInterest.findFirst({
    where: {
      userId,
      subject
    }
  });

  if (existingInterest) {
    // Update the interest level
    const updatedInterest = await prisma.userInterest.update({
      where: { id: existingInterest.id },
      data: { interestLevel }
    });

    return {
      interest_id: updatedInterest.id,
      user_id: updatedInterest.userId,
      subject: updatedInterest.subject,
      interest_level: updatedInterest.interestLevel,
      created_at: updatedInterest.createdAt.toISOString(),
    };
  }

  // Add new interest
  const newInterest = await prisma.userInterest.create({
    data: {
      userId,
      subject,
      interestLevel
    }
  });

  return {
    interest_id: newInterest.id,
    user_id: newInterest.userId,
    subject: newInterest.subject,
    interest_level: newInterest.interestLevel,
    created_at: newInterest.createdAt.toISOString(),
  };
}

// Remove a user interest
export async function removeUserInterest(interestId: number): Promise<boolean> {
  const result = await prisma.userInterest.delete({
    where: { id: interestId }
  }).catch(() => null);
  
  return result !== null;
}

// Get user learning goals
export async function getUserLearningGoals(userId: number): Promise<UserLearningGoal[]> {
  const goals = await prisma.userLearningGoal.findMany({
    where: { userId }
  });
  
  return goals.map(goal => ({
    goal_id: goal.id,
    user_id: goal.userId,
    goal_type: goal.goalType,
    description: goal.description || "",
    is_active: goal.isActive,
    created_at: goal.createdAt.toISOString(),
  }));
}

// Add a user learning goal
export async function addUserLearningGoal(userId: number, goalType: string, description: string): Promise<UserLearningGoal> {
  const goal = await prisma.userLearningGoal.create({
    data: {
      userId,
      goalType,
      description,
      isActive: true
    }
  });

  return {
    goal_id: goal.id,
    user_id: goal.userId,
    goal_type: goal.goalType,
    description: goal.description || "",
    is_active: goal.isActive,
    created_at: goal.createdAt.toISOString(),
  };
}

// Update a user learning goal
export async function updateUserLearningGoal(goalId: number, updates: Partial<UserLearningGoal>): Promise<UserLearningGoal | null> {
  const goal = await prisma.userLearningGoal.update({
    where: { id: goalId },
    data: {
      goalType: updates.goal_type,
      description: updates.description,
      isActive: updates.is_active
    }
  }).catch(() => null);

  if (!goal) return null;

  return {
    goal_id: goal.id,
    user_id: goal.userId,
    goal_type: goal.goalType,
    description: goal.description || "",
    is_active: goal.isActive,
    created_at: goal.createdAt.toISOString(),
  };
}

// Delete a user learning goal
export async function deleteUserLearningGoal(goalId: number): Promise<boolean> {
  const result = await prisma.userLearningGoal.delete({
    where: { id: goalId }
  }).catch(() => null);
  
  return result !== null;
}

type OnboardingData = {
  interests: Array<{
    subject: string;
    interestLevel?: number;
  }>;
  learningGoals: Array<{
    goalType: string;
    description?: string;
  }>;
}

export async function saveUserOnboarding(userId: number, data: OnboardingData) {
  const { interests, learningGoals } = data;

  // Start a transaction to ensure all data is saved consistently
  return await prisma.$transaction(async (tx) => {
    // Add user interests
    const savedInterests = await Promise.all(
      interests.map(async (interest) => {
        return await tx.userInterest.create({
          data: {
            userId: userId,
            subject: interest.subject,
            interestLevel: interest.interestLevel || 5, // Default interest level
          }
        });
      })
    );

    // Add user learning goals
    const savedGoals = await Promise.all(
      learningGoals.map(async (goal) => {
        return await tx.userLearningGoal.create({
          data: {
            userId: userId,
            goalType: goal.goalType,
            description: goal.description || null,
            isActive: true,
          }
        });
      })
    );

    // Mark the user as having completed onboarding (could add a field for this in the future)
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { isVerified: true } // Using isVerified for now to indicate onboarding is complete
    });

    return {
      interests: savedInterests,
      learningGoals: savedGoals,
      user: updatedUser
    };
  });
}

// User profile interface
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  profileImageUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  interests?: UserInterest[];
  learningGoals?: UserLearningGoal[];
  settings?: UserSettings;
}

// Get complete user profile
export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: true,
      learningGoals: true,
      settings: true,
    }
  });

  if (!user) return null;

  return {
    ...user,
    interests: user.interests.map(i => ({
      interest_id: i.id,
      user_id: i.userId,
      subject: i.subject,
      interest_level: i.interestLevel,
      created_at: i.createdAt.toISOString(),
    })),
    learningGoals: user.learningGoals.map(g => ({
      goal_id: g.id,
      user_id: g.userId,
      goal_type: g.goalType,
      description: g.description || "",
      is_active: g.isActive,
      created_at: g.createdAt.toISOString(),
    })),
    settings: user.settings ? {
      setting_id: user.settings.id,
      user_id: user.settings.userId,
      theme_mode: user.settings.themeMode || "light",
      color_theme: user.settings.colorTheme || "yellow",
      font_size: user.settings.fontSize || "medium",
      animation_level: user.settings.animationLevel || "standard",
      notifications_enabled: user.settings.notificationsEnabled ?? true,
      email_notifications_enabled: user.settings.emailNotificationsEnabled ?? true,
      learning_analytics_enabled: user.settings.learningAnalyticsEnabled ?? true,
      two_factor_enabled: user.settings.twoFactorEnabled ?? false,
    } : undefined
  };
}

// Update user profile
export async function updateUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: profileData.fullName,
      bio: profileData.bio,
      location: profileData.location,
      occupation: profileData.occupation,
      profileImageUrl: profileData.profileImageUrl,
    },
    include: {
      interests: true,
      learningGoals: true,
      settings: true,
    }
  });

  if (!updatedUser) return null;

  return {
    ...updatedUser,
    interests: updatedUser.interests.map(i => ({
      interest_id: i.id,
      user_id: i.userId,
      subject: i.subject,
      interest_level: i.interestLevel,
      created_at: i.createdAt.toISOString(),
    })),
    learningGoals: updatedUser.learningGoals.map(g => ({
      goal_id: g.id,
      user_id: g.userId,
      goal_type: g.goalType,
      description: g.description || "",
      is_active: g.isActive,
      created_at: g.createdAt.toISOString(),
    })),
    settings: updatedUser.settings ? {
      setting_id: updatedUser.settings.id,
      user_id: updatedUser.settings.userId,
      theme_mode: updatedUser.settings.themeMode || "light",
      color_theme: updatedUser.settings.colorTheme || "yellow",
      font_size: updatedUser.settings.fontSize || "medium",
      animation_level: updatedUser.settings.animationLevel || "standard",
      notifications_enabled: updatedUser.settings.notificationsEnabled ?? true,
      email_notifications_enabled: updatedUser.settings.emailNotificationsEnabled ?? true,
      learning_analytics_enabled: updatedUser.settings.learningAnalyticsEnabled ?? true,
      two_factor_enabled: updatedUser.settings.twoFactorEnabled ?? false,
    } : undefined
  };
}

