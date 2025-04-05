"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bell, Lock, Moon, Sun, Smartphone, Mail, Globe, Shield } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = () => {
    setIsLoading(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </header>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose how and when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <NotificationSetting
                    title="New Content"
                    description="When new learning materials are available"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Quiz Reminders"
                    description="Reminders to complete scheduled quizzes"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Learning Streak"
                    description="Reminders to maintain your learning streak"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Chat Responses"
                    description="When the AI assistant responds to your messages"
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <NotificationSetting
                    title="Weekly Summary"
                    description="Weekly report of your learning progress"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="New Features"
                    description="Updates about new platform features"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Course Completion"
                    description="When you complete a course or learning path"
                    defaultChecked={true}
                  />
                  <NotificationSetting
                    title="Special Offers"
                    description="Promotional content and special offers"
                    defaultChecked={false}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Notification Frequency</h3>
                </div>
                <RadioGroup defaultValue="balanced">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All notifications (may be frequent)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">Balanced (recommended)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">Minimal (important only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None (only in-app)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                    <div>
                      <h3 className="text-lg font-medium">Theme Mode</h3>
                      <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} aria-label="Toggle dark mode" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme-color">Color Theme</Label>
                  <Select defaultValue="yellow">
                    <SelectTrigger id="theme-color">
                      <SelectValue placeholder="Select a color theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Warm Yellow/Orange</SelectItem>
                      <SelectItem value="blue">Cool Blue</SelectItem>
                      <SelectItem value="green">Nature Green</SelectItem>
                      <SelectItem value="purple">Creative Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select a font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="x-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation">Animation Level</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="animation">
                      <SelectValue placeholder="Select animation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reduced">Reduced</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Appearance Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Account Security</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <PrivacySetting
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                    defaultChecked={false}
                  />
                  <PrivacySetting
                    title="Login Notifications"
                    description="Get notified when someone logs into your account"
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Data Sharing</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <PrivacySetting
                    title="Learning Analytics"
                    description="Share your learning data to improve recommendations"
                    defaultChecked={true}
                  />
                  <PrivacySetting
                    title="Usage Statistics"
                    description="Share anonymous usage data to improve the platform"
                    defaultChecked={true}
                  />
                  <PrivacySetting
                    title="Third-Party Sharing"
                    description="Allow sharing data with trusted partners"
                    defaultChecked={false}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Privacy Controls</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <PrivacySetting
                    title="Profile Visibility"
                    description="Make your profile visible to other users"
                    defaultChecked={true}
                  />
                  <PrivacySetting
                    title="Learning History"
                    description="Show your learning history in your public profile"
                    defaultChecked={false}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>Customize your experience for better accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reading & Visual</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AccessibilitySetting
                    title="Screen Reader Support"
                    description="Optimize content for screen readers"
                    defaultChecked={false}
                  />
                  <AccessibilitySetting
                    title="High Contrast Mode"
                    description="Increase contrast for better visibility"
                    defaultChecked={false}
                  />
                  <AccessibilitySetting
                    title="Reduce Animations"
                    description="Minimize motion and animations"
                    defaultChecked={false}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <AccessibilitySetting
                    title="Simplified Content"
                    description="Show content in a more straightforward format"
                    defaultChecked={false}
                  />
                  <AccessibilitySetting
                    title="Text-to-Speech"
                    description="Enable automatic reading of content"
                    defaultChecked={false}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Accessibility Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationSetting({
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
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={`Toggle ${title} notifications`} />
    </div>
  )
}

function PrivacySetting({
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
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={`Toggle ${title}`} />
    </div>
  )
}

function AccessibilitySetting({
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
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={`Toggle ${title}`} />
    </div>
  )
}

