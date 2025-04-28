"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getDocument, updateDocument, deleteDocument } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Trash, Save, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permit"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Document {
  id: string
  title: string
  content: string
  ownerId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    async function loadDocument() {
      setLoading(true)
      try {
        const doc = await getDocument(params.id, user.id)
        if (doc) {
          setDocument(doc)
          setTitle(doc.title)
          setContent(doc.content)
          setIsPublic(doc.isPublic)
        } else {
          toast({
            variant: "destructive",
            title: "Document not found",
            description: "The document you're looking for doesn't exist or you don't have permission to view it",
          })
          router.push("/documents")
        }
      } catch (error) {
        console.error("Failed to load document:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load document. Please try again later.",
        })
        router.push("/documents")
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [user, params.id, router, toast])

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  const isOwner = document.ownerId === user.id
  const canUpdate = hasPermission(user.role, ACTIONS.UPDATE, RESOURCES.DOCUMENT, {
    id: document.id,
    ownerId: document.ownerId,
    userId: user.id,
  })
  const canDelete = hasPermission(user.role, ACTIONS.DELETE, RESOURCES.DOCUMENT, {
    id: document.id,
    ownerId: document.ownerId,
    userId: user.id,
  })

  const handleSave = async () => {
    if (!canUpdate) return

    setSaving(true)
    try {
      const updatedDoc = await updateDocument(document.id, { title, content, isPublic }, user.id)
      setDocument(updatedDoc)
      setIsEditing(false)
      toast({
        title: "Document updated",
        description: "Your document has been updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update document",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return

    setDeleting(true)
    try {
      await deleteDocument(document.id, user.id)
      toast({
        title: "Document deleted",
        description: "Your document has been deleted successfully",
      })
      // The redirect happens in the server action
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
      })
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/documents")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold h-auto text-xl mb-2"
              />
            ) : (
              <CardTitle className="text-2xl">{document.title}</CardTitle>
            )}
            <CardDescription>
              {isOwner ? "You created this document" : "Shared with you"} on{" "}
              {new Date(document.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {canUpdate && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-500">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the document.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Make document public</Label>
              </div>
            </>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <p>{document.content}</p>
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setTitle(document.title)
                setContent(document.content)
                setIsPublic(document.isPublic)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
