import Link from "next/link"
import { Leaf, Mail, MapPin, Phone, BookOpen, FileText, HelpCircle, Shield } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Kilimo(Agri)protect AI</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering sustainable land management through AI-driven insights and restoration planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/map" className="text-muted-foreground hover:text-primary transition-colors">
                  Map Viewer
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/analytics"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/restoration"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Restoration Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/data"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Data Management
                </Link>
              </li>
              <li>
                <a
                  href="https://www.fao.org/land-water/land/sustainable-land-management/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Best Practices Guide
                </a>
              </li>
              <li>
                <a
                  href="https://www.unccd.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Support Center
                </a>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@kilimoprotect.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kilimo(Agri)protect AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
