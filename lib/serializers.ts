import type { Batch, Faculty, Lecture, ApiUser } from "@/lib/types"
import type { Batch as DbBatch, FacultyProfile, Lecture as DbLecture, User, Enrollment, TestResultRecord, Purchase } from "@prisma/client"
import { parseJsonArray } from "@/lib/json"

type BatchWithRelations = DbBatch & {
  faculty: { faculty: FacultyProfile & { user: User } }[]
  lectures?: DbLecture[]
}

export function toFaculty(profile: FacultyProfile & { user: User }): Faculty {
  return {
    id: profile.id,
    name: profile.user.name,
    subject: profile.subject,
    experience: profile.experience,
    avatar: profile.user.avatar ?? "/placeholder.svg?height=200&width=200",
    bio: profile.bio ?? "",
  }
}

export function toBatch(batch: BatchWithRelations): Batch {
  return {
    id: batch.id,
    title: batch.title,
    slug: batch.slug,
    examSlug: batch.examSlug,
    description: batch.description,
    price: batch.price,
    discountedPrice: batch.discountedPrice,
    thumbnail: batch.thumbnail,
    faculty: batch.faculty.map((bf) => toFaculty(bf.faculty)),
    rating: batch.rating,
    reviewCount: batch.reviewCount,
    enrolledCount: batch.enrolledCount,
    mode: batch.mode.toLowerCase() as Batch["mode"],
    startDate: batch.startDate.toISOString().split("T")[0],
    status: batch.status.toLowerCase() as Batch["status"],
    tags: parseJsonArray(batch.tags),
    features: parseJsonArray(batch.features),
  }
}

export function toLecture(lecture: DbLecture, completed = false): Lecture {
  return {
    id: lecture.id,
    title: lecture.title,
    duration: lecture.duration,
    thumbnail: lecture.thumbnail,
    isFree: lecture.isFree,
    isCompleted: completed,
    subject: lecture.subject,
  }
}

export function toApiUser(
  user: User,
  enrollments: (Enrollment & { batch: DbBatch })[] = [],
  testResults: TestResultRecord[] = [],
  purchases: Purchase[] = []
): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    examTarget: user.examTarget ?? undefined,
    avatar: user.avatar ?? undefined,
    role: user.role.toLowerCase() as ApiUser["role"],
    status: user.status.toLowerCase() as ApiUser["status"],
    enrolledBatches: enrollments.map((e) => e.batchId),
    purchasedNotes: purchases.filter((p) => p.itemType === "note").map((p) => p.itemId),
    purchasedLectures: purchases.filter((p) => p.itemType === "lecture").map((p) => p.itemId),
    testResults: testResults.map((r) => ({
      resultId: r.id,           // TestResultRecord.id — use this to link to /results/[resultId]
      testId: r.testId,         // TestSeries.id — for reference only
      testName: r.testName,
      score: r.score,
      totalMarks: r.totalMarks,
      rank: r.rank,
      percentile: r.percentile,
      date: r.completedAt.toISOString().split("T")[0],
    })),
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    createdAt: user.createdAt.toISOString().split("T")[0],
  }
}
