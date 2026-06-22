import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBatch } from "@/lib/serializers"
import {
  toExamCategory,
  toBlogPost,
  toLiveClass,
  toTopper,
  toTestimonial,
  toFacultyFromProfile,
} from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import {
  examCategories as mockExamCategories,
  batches as mockBatches,
  faculty as mockFaculty,
  toppers as mockToppers,
  testimonials as mockTestimonials,
  blogPosts as mockBlogPosts,
  liveClasses as mockLiveClasses,
} from "@/lib/mock-data"

export async function GET() {
  const data = await withDbFallback(async () => {
    const [categories, batches, faculty, toppers, testimonials, blogPosts, liveClasses] = await Promise.all([
      db.examCategory.findMany({ orderBy: { sortOrder: "asc" } }),
      db.batch.findMany({
        where: { status: "ACTIVE" },
        include: { faculty: { include: { faculty: { include: { user: true } } } } },
        orderBy: { enrolledCount: "desc" },
        take: 6,
      }),
      db.facultyProfile.findMany({ include: { user: true }, take: 6 }),
      db.topper.findMany({ orderBy: { rank: "asc" }, take: 5 }),
      db.testimonial.findMany({ take: 4 }),
      db.blogPost.findMany({ orderBy: { date: "desc" }, take: 3 }),
      db.liveClass.findMany({ orderBy: { startTime: "asc" }, take: 4 }),
    ])

    const batchCounts = await db.batch.groupBy({ by: ["examSlug"], _count: { id: true } })
    const countMap = Object.fromEntries(batchCounts.map((b) => [b.examSlug, b._count.id]))

    return {
      examCategories: categories.map((c) => toExamCategory(c, countMap[c.slug] ?? 0)),
      batches: batches.map(toBatch),
      faculty: faculty.map(toFacultyFromProfile),
      toppers: toppers.map(toTopper),
      testimonials: testimonials.map(toTestimonial),
      blogPosts: blogPosts.map(toBlogPost),
      liveClasses: liveClasses.map(toLiveClass),
    }
  }, () => ({
    examCategories: mockExamCategories,
    batches: mockBatches,
    faculty: mockFaculty,
    toppers: mockToppers,
    testimonials: mockTestimonials,
    blogPosts: mockBlogPosts,
    liveClasses: mockLiveClasses,
  }))

  return NextResponse.json(data)
}
