"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permit"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const canAccessAdminPanel = hasPermission(user.role, ACTIONS.ACCESS, RESOURCES.ADMIN_PANEL)

    if (!canAccessAdminPanel) {
      router.push("/documents")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">This page is only accessible to administrators.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>In a real application, this would allow you to manage users, assign roles, and set permissions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>In a real application, this would allow you to configure system-wide settings and preferences.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>View system audit logs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>In a real application, this would show a log of all important actions taken in the system.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>Configure fine-grained permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>In a real application, this would allow you to configure fine-grained permissions using Permit.io.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
