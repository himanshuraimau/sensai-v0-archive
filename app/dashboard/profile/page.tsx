"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Check, X, Upload, User, Mail, Calendar, MapPin, Briefcase, BookOpen, Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, updateUserProfile, getUserInterests, addUserInterest, deleteUserInterest, 
  getUserLearningGoals, addUserLearningGoal, deleteUserLearningGoal } from "@/lib/services/profile-service"
import { UserProfile } from "@/lib/models/user"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    occupation: "",
  })

  const [joinDate, setJoinDate] = useState("")
  const [interests, setInterests] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [newGoal, setNewGoal] = useState({ type: "skill", description: "" })
  const [showInterestDialog, setShowInterestDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)

  // Fetch user profile data
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userProfile = await getUserProfile()
        setProfile({
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          fullName: userProfile.fullName,
          bio: userProfile.bio || "",
          location: userProfile.location || "",
          occupation: userProfile.occupation || "",
          profileImageUrl: userProfile.profileImageUrl,
        })
        
        if (userProfile.profileImageUrl) {
          setProfileImage(userProfile.profileImageUrl)
        }
        
        // Format join date
        setJoinDate(new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long'
        }))
        
        // Load interests
        const userInterests = await getUserInterests()
        setInterests(userInterests)
        
        // Load learning goals
        const userGoals = await getUserLearningGoals()
        setGoals(userGoals)
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
  }, [toast])

  const handleProfileUpdate = async () => {
    setIsSaving(true)
    
    try {
      await updateUserProfile({
        fullName: profile.fullName,
        bio: profile.bio || null,
        location: profile.location || null,
        occupation: profile.occupation || null,
        profileImageUrl: profile.profileImageUrl,
      })
      
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
          setProfile({ ...profile, profileImageUrl: e.target.result as string })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  const handleAddInterest = async () => {
    if (!newInterest.trim()) return
    
    try {
      const interest = await addUserInterest(newInterest)
      setInterests([...interests, interest])
      setNewInterest("")
      setShowInterestDialog(false)
      
      toast({
        title: "Interest added",
        description: "Your new interest has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding interest:", error)
      toast({
        title: "Error",
        description: "Failed to add interest. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleRemoveInterest = async (interestId: number) => {
    try {
      await deleteUserInterest(interestId)
      setInterests(interests.filter(interest => interest.id !== interestId))
      
      toast({
        title: "Interest removed",
        description: "The interest has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing interest:", error)
      toast({
        title: "Error",
        description: "Failed to remove interest. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleAddGoal = async () => {
    if (!newGoal.type || !newGoal.description.trim()) return
    
    try {
      const goal = await addUserLearningGoal(newGoal.type, newGoal.description)
      setGoals([...goals, goal])
      setNewGoal({ type: "skill", description: "" })
      setShowGoalDialog(false)
      
      toast({
        title: "Learning goal added",
        description: "Your new learning goal has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add learning goal. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleRemoveGoal = async (goalId: number) => {
    try {
      await deleteUserLearningGoal(goalId)
      setGoals(goals.filter(goal => goal.id !== goalId))
      
      toast({
        title: "Goal removed",
        description: "The learning goal has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing goal:", error)
      toast({
        title: "Error",
        description: "Failed to remove learning goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </header>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="interests">Interests & Goals</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and public profile</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleProfileUpdate} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileImage} alt={profile.fullName} />
                      <AvatarFallback className="text-2xl">
                        {profile.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full shadow-md"
                        onClick={triggerFileInput}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Upload profile picture</span>
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Click the upload button to change your profile picture
                    </p>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profile.fullName || ""}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.fullName}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <span>@{profile.username}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location || ""}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.location || "Not specified"}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      {isEditing ? (
                        <Input
                          id="occupation"
                          value={profile.occupation || ""}
                          onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.occupation || "Not specified"}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Member Since</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <div className="rounded-md border px-3 py-2">
                        <p>{profile.bio || "No bio provided."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interests & Learning Goals</CardTitle>
              <CardDescription>Manage your learning interests and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Interests</h3>
                  <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Interest
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Interest</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-interest">Interest Subject</Label>
                          <Input
                            id="new-interest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="e.g., Machine Learning, Web Development"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInterestDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddInterest}>Add Interest</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest.id} variant="secondary" className="flex items-center gap-2 py-1.5">
                        <BookOpen className="h-3 w-3" />
                        {interest.subject}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveInterest(interest.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {interest.subject}</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No interests added yet. Add your first interest to get tailored recommendations.
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Learning Goals</h3>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Learning Goal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal-type">Goal Type</Label>
                          <Select
                            value={newGoal.type}
                            onValueChange={(value) => setNewGoal({ ...newGoal, type: value })}
                          >
                            <SelectTrigger id="goal-type">
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skill">New Skill</SelectItem>
                              <SelectItem value="certification">Certification</SelectItem>
                              <SelectItem value="project">Complete Project</SelectItem>
                              <SelectItem value="course">Complete Course</SelectItem>
                              <SelectItem value="career">Career Advancement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goal-description">Description</Label>
                          <Textarea
                            id="goal-description"
                            value={newGoal.description}
                            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                            placeholder="Describe your learning goal"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddGoal}>Add Goal</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <div key={goal.id} className="flex items-start justify-between rounded-md border p-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {goal.goalType.charAt(0).toUpperCase() + goal.goalType.slice(1)}
                            </Badge>
                            {goal.isActive && <Badge variant="secondary">Active</Badge>}
                          </div>
                          <p className="mt-1">{goal.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete goal</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No learning goals added yet. Add your first goal to track your progress.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Address</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-email">Current Email</Label>
                    <Input id="current-email" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email</Label>
                    <Input id="new-email" type="email" placeholder="Enter new email" />
                  </div>
                </div>
                <Button>Update Email</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Change Password</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline">Download My Data</Button>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

