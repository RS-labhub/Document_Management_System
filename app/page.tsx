import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Document Management System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A secure document management system with fine-grained authorization powered by Permit.io
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Role-Based Access Control</h2>
          <p className="text-muted-foreground">
            Different roles (Admin, Editor, Viewer) have different permissions on documents.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Admins can create, view, edit, and delete any document</li>
            <li>Editors can create, view, and edit documents</li>
            <li>Viewers can only view documents</li>
          </ul>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Attribute-Based Access Control</h2>
          <p className="text-muted-foreground">Access is determined by document attributes and user context.</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Document owners have full control over their documents</li>
            <li>Public documents can be viewed by anyone</li>
            <li>Private documents are only accessible to specific users</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/documents">View Documents</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}
