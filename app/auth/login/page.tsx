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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isEmailNotConfirmedError = (msg?: string) => typeof msg === 'string' && msg.toLowerCase().includes('confirm')

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      // Supabase will redirect to Google; nothing else to do here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSendSignInLink = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (!email) {
        setError('Enter your email to send a sign-in link')
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      setError('Sign-in link sent — check your inbox.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link')
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
        setError('Email not confirmed. Check your inbox for a confirmation link before signing in.')
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
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  Continue with Google
                </Button>
                {process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD && (
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
                      {String(error).toLowerCase().includes('confirm') && (
                        <Button variant="ghost" size="sm" onClick={handleSendSignInLink} disabled={isLoading}>
                          Send sign-in link to my email
                        </Button>
                      )}
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
