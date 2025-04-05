import { UserProfile } from "../models/user";

// Get user profile from API
export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch("/api/user/profile", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return data.profile;
}

// Update user profile
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user profile");
  }

  const data = await response.json();
  return data.profile;
}

// Get user interests
export async function getUserInterests() {
  const response = await fetch("/api/user/interests", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user interests");
  }

  const data = await response.json();
  return data.interests;
}

// Add user interest
export async function addUserInterest(subject: string, interestLevel: number = 5) {
  const response = await fetch("/api/user/interests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, interestLevel }),
  });

  if (!response.ok) {
    throw new Error("Failed to add user interest");
  }

  const data = await response.json();
  return data.interest;
}

// Delete user interest
export async function deleteUserInterest(interestId: number) {
  const response = await fetch(`/api/user/interests?id=${interestId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user interest");
  }

  return true;
}

// Get user learning goals
export async function getUserLearningGoals() {
  const response = await fetch("/api/user/goals", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user learning goals");
  }

  const data = await response.json();
  return data.goals;
}

// Add user learning goal
export async function addUserLearningGoal(goalType: string, description?: string) {
  const response = await fetch("/api/user/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalType, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to add user learning goal");
  }

  const data = await response.json();
  return data.goal;
}

// Update user learning goal
export async function updateUserLearningGoal(goalId: number, goalData: {
  goalType?: string;
  description?: string;
  isActive?: boolean;
}) {
  const response = await fetch("/api/user/goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalId, ...goalData }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user learning goal");
  }

  return true;
}

// Delete user learning goal
export async function deleteUserLearningGoal(goalId: number) {
  const response = await fetch(`/api/user/goals?id=${goalId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user learning goal");
  }

  return true;
}

// Get user settings
export async function getUserSettings() {
  const response = await fetch("/api/user/settings", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user settings");
  }

  const data = await response.json();
  return data.settings;
}

// Update user settings
export async function updateUserSettings(settings: any) {
  const response = await fetch("/api/user/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update user settings");
  }

  const data = await response.json();
  return data.settings;
}
