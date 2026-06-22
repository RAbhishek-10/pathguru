import Link from "next/link"
import { Phone, Mail, Youtube, Instagram, Twitter, Send } from "lucide-react"
import BrandLogo from "@/components/brand/BrandLogo"
import { BRAND_EMAIL } from "@/lib/brand"

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
    <footer className="border-t border-border/60 bg-[#072A63] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo size="footer" href="/" onDark className="mb-5" />
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/70">
              India&apos;s most trusted exam preparation platform. Live classes, test series, AI doubt resolution, and expert faculty for NEET, JEE, GATE & more.
            </p>
            <div className="mb-5 flex flex-col gap-2.5">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                <Phone className="h-4 w-4 text-[#1E88FF]" /> +91 98765 43210
              </a>
              <a href={`mailto:${BRAND_EMAIL}`} className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                <Mail className="h-4 w-4 text-[#1E88FF]" /> {BRAND_EMAIL}
              </a>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Send, href: "#", label: "Telegram" },
              ].map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all hover:bg-[#1E88FF] hover:text-white">
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold text-white">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-[#1E88FF]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row lg:px-6">
          <p className="text-xs text-white/50">
            © 2026 PathGuru. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/terms" className="text-xs text-white/50 transition-colors hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-white/50 transition-colors hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
