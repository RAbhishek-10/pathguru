import Link from "next/link"
import { GraduationCap, Phone, Mail, Youtube, Instagram, Twitter, Send } from "lucide-react"

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Account Deletion", href: "/account-deletion" },
    ],
  },
  {
    title: "Popular Exams",
    links: [
      { label: "NEET", href: "/exam/neet" },
      { label: "IIT JEE", href: "/exam/jee" },
      { label: "GATE", href: "/exam/gate" },
      { label: "UPSC", href: "/exam/upsc" },
      { label: "CTET", href: "/exam/ctet" },
      { label: "School Boards", href: "/exam/school" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Live Classes", href: "/live" },
      { label: "Test Series", href: "/test-series" },
      { label: "Study Notes", href: "/notes" },
      { label: "Books Store", href: "/books-store" },
      { label: "Scholarship Test", href: "/scholarship" },
      { label: "FAQ", href: "/faq" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                True<span className="text-primary">Educator</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {"India's most trusted exam preparation platform. Live classes, test series, AI doubt resolution, and expert faculty for NEET, JEE, GATE & more."}
            </p>
            <div className="mb-4 flex flex-col gap-2">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </a>
              <a href="mailto:support@trueeducator.in" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" /> support@trueeducator.in
              </a>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Send, href: "#", label: "Telegram" },
              ].map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row lg:px-6">
          <p className="text-xs text-muted-foreground">
            {"© 2025 TrueEducator. All rights reserved."}
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
