"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Loader2, FileText } from "lucide-react"

export default function Navbar() {
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="relative w-8 h-8">
              <Image src="/favicon.png" alt="Document Icon" width={40} height={40} className="object-contain" />
            </div>
            Radhika's DocManger
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/documents" className="text-sm font-medium hover:underline">
                Documents
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium hover:underline">
                  Admin Panel
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">
                Logged in as <span className="font-medium">{user.name}</span> ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
