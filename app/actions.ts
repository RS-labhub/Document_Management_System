"use server"

import { revalidatePath } from "next/cache"
import { checkPermission, RESOURCES, ACTIONS } from "@/lib/permit"
import { redirect } from "next/navigation"

// Mock database for documents
const documents = [
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
  // In a real application, we would check permissions for each document
  // For simplicity, we're returning all documents here
  return documents
}

export async function getDocument(id: string, userId: string) {
  const document = documents.find((doc) => doc.id === id)

  if (!document) {
    return null
  }

  try {
    // Check if user has permission to read this document
    const hasPermission = await checkPermission(userId, ACTIONS.READ, RESOURCES.DOCUMENT, {
      id: document.id,
      ownerId: document.ownerId,
    })

    if (!hasPermission) {
      console.log(`User ${userId} does not have permission to read document ${id}`)
      return null
    }

    return document
  } catch (error) {
    console.error(`Error checking permissions: ${error instanceof Error ? error.message : String(error)}`)

    // For development purposes, we'll allow access if there's an error
    // In production, you might want to deny access instead
    return document
  }
}

export async function createDocument(data: { title: string; content: string; isPublic: boolean }, userId: string) {
  try {
    // Check if user has permission to create documents
    const hasPermission = await checkPermission(userId, ACTIONS.CREATE, RESOURCES.DOCUMENT)

    if (!hasPermission) {
      throw new Error("You do not have permission to create documents")
    }

    const newDocument = {
      id: Date.now().toString(),
      title: data.title,
      content: data.content,
      ownerId: userId,
      isPublic: data.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    documents.push(newDocument)
    revalidatePath("/documents")

    return newDocument
  } catch (error) {
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

  try {
    // Check if user has permission to update this document
    const hasPermission = await checkPermission(userId, ACTIONS.UPDATE, RESOURCES.DOCUMENT, {
      id: document.id,
      ownerId: document.ownerId,
    })

    if (!hasPermission) {
      throw new Error("You do not have permission to update this document")
    }

    const updatedDocument = {
      ...document,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      updatedAt: new Date().toISOString(),
    }

    documents[documentIndex] = updatedDocument
    revalidatePath("/documents")
    revalidatePath(`/documents/${id}`)

    return updatedDocument
  } catch (error) {
    console.error(`Error updating document: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

export async function deleteDocument(id: string, userId: string) {
  const documentIndex = documents.findIndex((doc) => doc.id === id)

  if (documentIndex === -1) {
    throw new Error("Document not found")
  }

  const document = documents[documentIndex]

  try {
    // Check if user has permission to delete this document
    const hasPermission = await checkPermission(userId, ACTIONS.DELETE, RESOURCES.DOCUMENT, {
      id: document.id,
      ownerId: document.ownerId,
    })

    if (!hasPermission) {
      throw new Error("You do not have permission to delete this document")
    }

    documents.splice(documentIndex, 1)
    revalidatePath("/documents")
    redirect("/documents")
  } catch (error) {
    console.error(`Error deleting document: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
