"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getDocuments } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, FileText, Lock, Unlock } from "lucide-react"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permit"

interface Document {
  id: string
  title: string
  content: string
  ownerId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If auth is still loading, wait
    if (isLoading) return

    // If user is not logged in, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    async function loadDocuments() {
      try {
        const docs = await getDocuments(user.id)
        setDocuments(docs)
      } catch (error) {
        console.error("Failed to load documents:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [user, router, isLoading])

  // Show loading while checking auth or loading documents
  if (isLoading || (loading && user)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user is not logged in, don't render anything (redirect handled in useEffect)
  if (!user) {
    return null
  }

  const canCreateDocument = hasPermission(user.role, ACTIONS.CREATE, RESOURCES.DOCUMENT, { userId: user.id })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        {canCreateDocument && (
          <Button asChild>
            <Link href="/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No documents found</h2>
          <p className="mt-2 text-muted-foreground">
            {canCreateDocument ? "Create your first document to get started" : "You don't have any documents yet"}
          </p>
          {canCreateDocument && (
            <Button asChild className="mt-4">
              <Link href="/documents/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const isOwner = doc.ownerId === user.id
            const canRead = hasPermission(user.role, ACTIONS.READ, RESOURCES.DOCUMENT, {
              id: doc.id,
              ownerId: doc.ownerId,
              userId: user.id,
            })

            if (!canRead) return null

            return (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="truncate">{doc.title}</CardTitle>
                    {doc.isPublic ? (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{isOwner ? "You created this document" : "Shared with you"}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="line-clamp-3">{doc.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/documents/${doc.id}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
