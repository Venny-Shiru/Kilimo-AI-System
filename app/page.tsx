import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">Kilimo(Agri)protect AI</h1>
        <p className="text-muted-foreground mb-8">Land Degradation Monitoring & Restoration Platform</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
