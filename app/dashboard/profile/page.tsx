"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Check, X, Upload, User, Mail, Calendar, MapPin, Briefcase, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    bio: "Software developer passionate about AI and machine learning. Currently learning data science and visualization techniques.",
    location: "San Francisco, CA",
    occupation: "Software Developer",
    joinDate: "January 2023",
    interests: ["Programming", "Machine Learning", "Data Science", "Web Development"],
  })

  const handleProfileUpdate = () => {
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
                  <Button size="sm" onClick={handleProfileUpdate}>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileImage} alt={profile.name} />
                      <AvatarFallback className="text-2xl">
                        {profile.name
                          .split(" ")
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
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      {isEditing ? (
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <span>@{profile.username}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      {isEditing ? (
                        <Input
                          id="occupation"
                          value={profile.occupation}
                          onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.occupation}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Member Since</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <div className="rounded-md border px-3 py-2">
                        <p>{profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      <BookOpen className="mr-1 h-3 w-3" />
                      {interest}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-7">
                      + Add Interest
                    </Button>
                  )}
                </div>
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

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <PreferenceToggle
                    title="Show Beginner Content"
                    description="Display introductory materials and tutorials"
                    defaultChecked={true}
                  />
                  <PreferenceToggle
                    title="Show Intermediate Content"
                    description="Display more advanced learning materials"
                    defaultChecked={true}
                  />
                  <PreferenceToggle
                    title="Show Advanced Content"
                    description="Display expert-level content and resources"
                    defaultChecked={false}
                  />
                  <PreferenceToggle
                    title="Recommended Content"
                    description="Show personalized content recommendations"
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Learning Format</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <PreferenceToggle
                    title="Video Tutorials"
                    description="Include video content in your feed"
                    defaultChecked={true}
                  />
                  <PreferenceToggle
                    title="Written Articles"
                    description="Include text-based learning materials"
                    defaultChecked={true}
                  />
                  <PreferenceToggle
                    title="Interactive Exercises"
                    description="Include hands-on coding exercises"
                    defaultChecked={true}
                  />
                  <PreferenceToggle
                    title="Quizzes"
                    description="Include knowledge-testing quizzes"
                    defaultChecked={true}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  toast({
                    title: "Preferences saved",
                    description: "Your learning preferences have been updated.",
                  })
                }}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PreferenceToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
      <div className="space-y-0.5">
        <div className="text-base">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="ml-auto">
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => setChecked(!checked)} />
          <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
        </label>
      </div>
    </div>
  )
}

