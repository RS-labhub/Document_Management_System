import { Permit } from "permitio"

// Initialize Permit SDK with proper configuration
const permit = new Permit({
  // Use environment variables
  pdp: process.env.PERMIT_PDP_URL,
  token: process.env.PERMIT_SDK_TOKEN,
  // Add debug mode to see more information
  debug: true,
})

// Resource types
export const RESOURCES = {
  DOCUMENT: "document",
  ADMIN_PANEL: "admin_panel",
}

// Actions
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  ACCESS: "access",
}

// Check if a user can perform an action on a resource
export async function checkPermission(
  userId: string,
  action: string,
  resourceType: string,
  resourceAttributes: Record<string, any> = {},
): Promise<boolean> {
  try {
    // Ensure the SDK is properly initialized
    if (!permit) {
      console.error("Permit SDK not initialized")
      return false
    }

    // Format the resource properly for the check
    const resource = {
      type: resourceType,
      // Include all attributes
      attributes: resourceAttributes,
    }

    // Log the check attempt for debugging
    console.log(`Checking permission: user=${userId}, action=${action}, resource=${JSON.stringify(resource)}`)

    // Use a try-catch to handle potential errors
    const permitted = await permit.check(userId, action, resource)

    // Log the result
    console.log(`Permission check result: ${permitted}`)

    return permitted
  } catch (error) {
    console.error(`Permission check failed: ${error instanceof Error ? error.message : String(error)}`)

    // For development purposes, we'll allow access if there's an error
    // In production, you might want to deny access instead
    return true
  }
}

// For client-side permission checks (simplified)
export function hasPermission(
  userRole: string,
  action: string,
  resourceType: string,
  resourceAttributes: Record<string, any> = {},
): boolean {
  // This is a simplified client-side permission check
  // In a real application, you would use the Permit.io SDK

  // Admin can do everything
  if (userRole === "admin") return true

  // Document permissions
  if (resourceType === RESOURCES.DOCUMENT) {
    // Document owner can do everything with their own document
    if (resourceAttributes.userId && resourceAttributes.ownerId === resourceAttributes.userId) return true

    // Editor permissions
    if (userRole === "editor") {
      return action === ACTIONS.CREATE || action === ACTIONS.READ || action === ACTIONS.UPDATE
    }

    // Viewer permissions
    if (userRole === "viewer") {
      return action === ACTIONS.READ
    }
  }

  // Admin panel access
  if (resourceType === RESOURCES.ADMIN_PANEL) {
    return userRole === "admin"
  }

  return false
}
