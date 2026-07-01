import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBlogPost } from "@/lib/content-serializers"
import { jsonError } from "@/lib/api-utils"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await db.blogPost.findUnique({
    where: { slug },
  })

  if (!post) return jsonError("Blog post not found", 404)
  return NextResponse.json(toBlogPost(post))
}
