"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Please use the new authentication pages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We&apos;ve updated our authentication system. Please use the login or sign up pages.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/auth/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href="/auth/sign-up">Sign Up</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
