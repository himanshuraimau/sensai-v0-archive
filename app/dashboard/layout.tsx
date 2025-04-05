"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get sidebar state from cookie on client side
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const sidebarState = localStorage.getItem("sidebar:state")
    if (sidebarState !== null) {
      setSidebarOpen(sidebarState === "true")
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
            <SidebarTrigger />
            <div className="text-lg font-semibold">SensiAI Dashboard</div>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}

