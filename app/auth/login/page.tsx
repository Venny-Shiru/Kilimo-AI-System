"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function isEmailNotConfirmedError(message?: string): boolean {
  return message?.includes('Email not confirmed') || message?.includes('email_not_confirmed') || false
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Call secure server-side demo route which uses the service role key to create session cookies
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        setError(text || 'Demo sign-in failed')
        return
      }

      // On success the server attached Supabase auth cookies; navigate to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // In some auth configurations the user object may be missing immediately
      // (e.g. when email confirmation is required). Check for a user and be defensive.
      const signedInUser = data?.user
      if (!signedInUser) {
        setError("Login succeeded but no user returned. If you require email confirmation, check your inbox.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      if (isEmailNotConfirmedError(error instanceof Error ? error.message : undefined)) {
        setError('Sign-in blocked by email confirmation policy. You can request a sign-in link or contact support.')
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Kilimo AI</h1>
            </div>
            <p className="text-sm text-muted-foreground">Land Restoration & Monitoring Platform</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3">
                {process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true' && (
                  <Button variant="secondary" className="w-full" onClick={handleDemoSignIn} disabled={isLoading}>
                    Use demo account
                  </Button>
                )}
              </div>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
