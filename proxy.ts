export { auth as proxy } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/analytics/:path*", "/educator/:path*"],
}
