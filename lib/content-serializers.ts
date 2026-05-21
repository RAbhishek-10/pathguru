import type {
  ExamCategory,
  TestSeries,
  Note,
  LiveClass,
  Book,
  BlogPost,
  Topper,
  Testimonial,
  Doubt,
  Notification,
  Question,
  TestResult,
  Faculty,
} from "@/lib/types"
import type {
  ExamCategory as DbExamCategory,
  TestSeries as DbTestSeries,
  Note as DbNote,
  LiveClass as DbLiveClass,
  Book as DbBook,
  BlogPost as DbBlogPost,
  Topper as DbTopper,
  Testimonial as DbTestimonial,
  Doubt as DbDoubt,
  Notification as DbNotification,
  Question as DbQuestion,
  FacultyProfile,
  User,
} from "@prisma/client"
export function toExamCategory(cat: DbExamCategory, batchCount: number): ExamCategory {
  return {
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon,
    description: cat.description,
    batchCount,
    color: cat.color,
  }
}

export function toNote(note: DbNote): Note {
  return {
    id: note.id,
    title: note.title,
    examSlug: note.examSlug,
    subject: note.subject,
    type: note.type as Note["type"],
    pages: note.pages,
    price: note.price,
    isFree: note.isFree,
    thumbnail: note.thumbnail,
  }
}

export function toTestSeries(test: DbTestSeries): TestSeries {
  return {
    id: test.id,
    title: test.title,
    examSlug: test.examSlug,
    totalQuestions: test.totalQuestions,
    duration: test.duration,
    totalMarks: test.totalMarks,
    mode: test.mode as TestSeries["mode"],
    scheduledDate: test.scheduledDate?.toISOString().split("T")[0],
    price: test.price,
    isFree: test.isFree,
    attemptsCount: test.attemptsCount,
    averageScore: test.averageScore,
  }
}

export function toQuestion(q: DbQuestion): Question {
  let options: Question["options"]
  try {
    const parsed = JSON.parse(q.options)
    options = Array.isArray(parsed) ? parsed : undefined
  } catch {
    options = undefined
  }
  return {
    id: q.id,
    type: q.type as Question["type"],
    stem: q.stem,
    options,
    section: q.section,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    imageUrl: q.imageUrl ?? undefined,
  }
}

export function toLiveClass(lc: DbLiveClass): LiveClass {
  return {
    id: lc.id,
    title: lc.title,
    subject: lc.subject,
    faculty: lc.facultyName,
    batchName: lc.batchName,
    startTime: lc.startTime.toISOString(),
    endTime: lc.endTime.toISOString(),
    status: lc.status as LiveClass["status"],
    recordingUrl: lc.recordingUrl ?? undefined,
  }
}

export function toBook(book: DbBook): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    discountedPrice: book.discountedPrice ?? undefined,
    thumbnail: book.thumbnail,
    description: book.description,
    pages: book.pages,
    inStock: book.inStock,
    rating: book.rating,
  }
}

export function toBlogPost(post: DbBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    author: post.author,
    date: post.date.toISOString().split("T")[0],
    readTime: post.readTime,
  }
}

export function toTopper(t: DbTopper): Topper {
  return { name: t.name, rank: t.rank, exam: t.exam, year: t.year, avatar: t.avatar, quote: t.quote }
}

export function toTestimonial(t: DbTestimonial): Testimonial {
  return { name: t.name, rating: t.rating, quote: t.quote, exam: t.exam, avatar: t.avatar }
}

export function toDoubt(d: DbDoubt): Doubt {
  return {
    id: d.id,
    subject: d.subject,
    topic: d.topic,
    question: d.question,
    status: d.status as Doubt["status"],
    aiResponse: d.aiResponse ?? undefined,
    aiConfidence: d.aiConfidence ?? undefined,
    facultyResponse: d.facultyResponse ?? undefined,
    createdAt: d.createdAt.toISOString(),
  }
}

export function toNotification(n: DbNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as Notification["type"],
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }
}

export function toFacultyFromProfile(profile: FacultyProfile & { user: User }): Faculty {
  return {
    id: profile.id,
    name: profile.user.name,
    subject: profile.subject,
    experience: profile.experience,
    avatar: profile.user.avatar ?? "/placeholder.svg?height=200&width=200",
    bio: profile.bio ?? "",
  }
}

export function buildTestResultFromRecord(
  testId: string,
  testName: string,
  score: number,
  totalMarks: number,
  rank: number,
  percentile: number
): TestResult {
  const correct = Math.round((score / totalMarks) * 200)
  const incorrect = Math.round(correct * 0.15)
  const unattempted = Math.max(0, 200 - correct - incorrect)
  return {
    testId,
    testName,
    totalMarks,
    obtainedMarks: score,
    correct,
    incorrect,
    unattempted,
    accuracy: Math.round((score / totalMarks) * 1000) / 10,
    rank,
    totalStudents: 12500,
    percentile,
    timeTaken: 175,
    sections: [
      { name: "Physics", totalMarks: 180, obtainedMarks: Math.round(score * 0.24), correct: 35, incorrect: 7, unattempted: 3 },
      { name: "Chemistry", totalMarks: 180, obtainedMarks: Math.round(score * 0.27), correct: 40, incorrect: 3, unattempted: 2 },
      { name: "Biology", totalMarks: 360, obtainedMarks: Math.round(score * 0.49), correct: 70, incorrect: 13, unattempted: 7 },
    ],
  }
}
