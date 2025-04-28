"use server"

import { revalidatePath } from "next/cache"

// Mock database for documents
let documents = [
  {
    id: "1",
    title: "Getting Started Guide",
    content: "This is a guide to help you get started with our document management system.",
    ownerId: "admin-id",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Security Policy",
    content: "This document outlines our security policies and procedures.",
    ownerId: "admin-id",
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "User Manual",
    content: "A comprehensive guide for users of our system.",
    ownerId: "user-id",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function getDocuments(userId: string) {
  // Filter documents based on access rules
  return documents.filter((doc) => {
    // If document is public, show it
    if (doc.isPublic) return true

    // If user is the owner, show it
    if (doc.ownerId === userId) return true

    // Otherwise, don't show private documents
    return false
  })
}

export async function getDocument(id: string, userId: string) {
  const document = documents.find((doc) => doc.id === id)

  if (!document) {
    return null
  }

  // Check if user has access to this document
  const hasAccess = document.isPublic || document.ownerId === userId

  if (!hasAccess) {
    console.log(`User ${userId} does not have access to document ${id}`)
    return null
  }

  return document
}

export async function createDocument(data: { title: string; content: string; isPublic: boolean }, userId: string) {
  console.log("=== CREATE DOCUMENT START ===")
  console.log("Creating document with data:", data)
  console.log("User ID:", userId)

  // Validate user ID
  if (!userId) {
    console.error("User ID is required")
    throw new Error("User ID is required")
  }

  // Validate title
  if (!data.title || data.title.trim() === "") {
    console.error("Title is required")
    throw new Error("Title is required")
  }

  try {
    // Create a new document with a unique ID
    const newDocument = {
      id: Date.now().toString(),
      title: data.title.trim(),
      content: data.content.trim(),
      ownerId: userId,
      isPublic: data.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("New document object:", newDocument)

    // Add to documents array
    documents.push(newDocument)

    console.log("Documents array after addition:", documents)
    console.log("Document count:", documents.length)

    // Revalidate the documents path to update the UI
    revalidatePath("/documents")

    console.log("=== CREATE DOCUMENT SUCCESS ===")
    return { success: true, document: newDocument }
  } catch (error) {
    console.error("=== CREATE DOCUMENT ERROR ===")
    console.error(`Error creating document: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

export async function updateDocument(
  id: string,
  data: { title: string; content: string; isPublic: boolean },
  userId: string,
) {
  const documentIndex = documents.findIndex((doc) => doc.id === id)

  if (documentIndex === -1) {
    throw new Error("Document not found")
  }

  const document = documents[documentIndex]

  // Check if user has permission to update this document
  const canUpdate = document.ownerId === userId || userId === "admin-id"

  if (!canUpdate) {
    throw new Error("You do not have permission to update this document")
  }

  try {
    const updatedDocument = {
      ...document,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      updatedAt: new Date().toISOString(),
    }

    // Update in documents array
    documents = [...documents.slice(0, documentIndex), updatedDocument, ...documents.slice(documentIndex + 1)]

    console.log("Document updated:", updatedDocument)
    console.log("All documents after update:", documents)

    revalidatePath("/documents")
    revalidatePath(`/documents/${id}`)

    return updatedDocument
  } catch (error) {
    console.error(`Error updating document: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

export async function deleteDocument(id: string, userId: string) {
  console.log(`Attempting to delete document ${id} by user ${userId}`)

  const documentIndex = documents.findIndex((doc) => doc.id === id)

  if (documentIndex === -1) {
    console.error(`Document ${id} not found`)
    throw new Error("Document not found")
  }

  const document = documents[documentIndex]
  console.log(`Found document:`, document)

  // Admin can delete any document, owners can delete their own documents
  const canDelete = userId === "admin-id" || document.ownerId === userId

  if (!canDelete) {
    console.error(`User ${userId} does not have permission to delete document ${id}`)
    throw new Error("You do not have permission to delete this document")
  }

  try {
    // Remove from documents array
    documents = [...documents.slice(0, documentIndex), ...documents.slice(documentIndex + 1)]

    console.log("Document deleted:", document)
    console.log("Documents after deletion:", documents)

    revalidatePath("/documents")

    return { success: true, message: "Document deleted successfully" }
  } catch (error) {
    console.error(`Error deleting document: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
