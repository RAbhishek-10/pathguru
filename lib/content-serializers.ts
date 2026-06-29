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
  SectionResult,
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
    correctAnswer: q.correctAnswer,
    explanation: q.explanation ?? undefined,
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

type AttemptDetailWithQuestion = {
  isCorrect: boolean
  givenAnswer: string | null
  marksAwarded: number
  question: {
    section: string
    marks: number
    negativeMarks: number
  }
}

export function buildTestResultFromRecord(
  testId: string,
  testName: string,
  score: number,
  totalMarks: number,
  rank: number,
  percentile: number,
  attemptDetails?: AttemptDetailWithQuestion[],
  timeTaken?: number
): TestResult {
  // --- Build real section data from attempt details ---
  let sections: SectionResult[] = []

  if (attemptDetails && attemptDetails.length > 0) {
    // Group by section using actual question data
    const sectionMap = new Map<string, SectionResult>()

    for (const ad of attemptDetails) {
      const sec = ad.question.section
      if (!sectionMap.has(sec)) {
        sectionMap.set(sec, {
          name: sec,
          totalMarks: 0,
          obtainedMarks: 0,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
        })
      }
      const s = sectionMap.get(sec)!
      // Contribute to total marks (full marks per question)
      s.totalMarks += ad.question.marks
      if (!ad.givenAnswer) {
        s.unattempted++
      } else if (ad.isCorrect) {
        s.correct++
        s.obtainedMarks += ad.marksAwarded
      } else {
        s.incorrect++
        // marksAwarded is negative for incorrect answers
        s.obtainedMarks += ad.marksAwarded
      }
    }
    sections = Array.from(sectionMap.values())
  } else {
    // Fallback: generic single section when no detail data available
    sections = [
      {
        name: "General",
        totalMarks,
        obtainedMarks: score,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
      },
    ]
  }

  const correct = attemptDetails
    ? attemptDetails.filter((ad) => ad.isCorrect).length
    : Math.round((score / totalMarks) * 100)
  const incorrect = attemptDetails
    ? attemptDetails.filter((ad) => !ad.isCorrect && !!ad.givenAnswer).length
    : Math.round(correct * 0.15)
  const unattempted = attemptDetails
    ? attemptDetails.filter((ad) => !ad.givenAnswer).length
    : Math.max(0, 100 - correct - incorrect)

  const accuracy =
    correct + incorrect > 0
      ? Math.round((correct / (correct + incorrect)) * 1000) / 10
      : 0

  return {
    testId,
    testName,
    totalMarks,
    obtainedMarks: score,
    correct,
    incorrect,
    unattempted,
    accuracy,
    rank,
    totalStudents: 12500,
    percentile,
    timeTaken: timeTaken ?? 0,
    sections,
  }
}
