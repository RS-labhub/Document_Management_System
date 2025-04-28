import { Permit } from "permitio"

// Initialize Permit SDK
let permit: Permit | null = null

// Initialize the SDK lazily to avoid issues during server-side rendering
function getPermitInstance() {
  if (!permit) {
    try {
      permit = new Permit({
        // Use environment variables
        pdp: process.env.PERMIT_PDP_URL,
        token: process.env.PERMIT_SDK_TOKEN,
        // Add debug mode to see more information
        // debug: true, // Debug mode is not supported directly; use custom logging if needed
      })
      console.log("Permit SDK initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Permit SDK:", error)
    }
  }
  return permit
}

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
    const permitInstance = getPermitInstance()

    if (!permitInstance) {
      console.error("Permit SDK not initialized")
      return true
    }

    const resource = {
      type: resourceType,
      attributes: resourceAttributes,
    }

    console.log(`Checking permission: user=${userId}, action=${action}, resource=${JSON.stringify(resource)}`)

    const permitted = await permitInstance.check(userId, action, resource)

    // Log the result
    console.log(`Permission check result: ${permitted}`)

    return permitted
  } catch (error) {
    console.error(`Permission check failed: ${error instanceof Error ? error.message : String(error)}`)
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
