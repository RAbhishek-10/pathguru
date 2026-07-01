export interface ApiUser {
  id: string
  name: string
  email: string
  phone: string
  examTarget?: string
  avatar?: string
  role: "student" | "admin" | "faculty"
  status: "active" | "suspended"
  enrolledBatches: string[]
  purchasedNotes: string[]
  purchasedLectures: string[]
  testResults: TestResultSummary[]
  walletBalance: number
  referralCode: string
  createdAt: string
}

export interface TestResultSummary {
  resultId: string  // TestResultRecord.id — use to link to /results/[resultId]
  testId: string    // TestSeries.id — for reference
  testName: string
  score: number
  totalMarks: number
  rank: number
  percentile: number
  date: string
}

export interface CartItem {
  id: string
  type: "batch" | "test" | "lecture" | "note" | "book"
  title: string
  price: number
  discountedPrice?: number
  thumbnail?: string
  examSlug?: string
}

export interface Batch {
  id: string
  title: string
  slug: string
  examSlug: string
  description: string
  price: number
  discountedPrice: number
  thumbnail: string
  faculty: Faculty[]
  rating: number
  reviewCount: number
  enrolledCount: number
  mode: "online" | "offline" | "hybrid"
  startDate: string
  status: "active" | "upcoming" | "archived"
  tags: string[]
  features: string[]
}

export interface Faculty {
  id: string
  name: string
  subject: string
  experience: number
  avatar: string
  bio: string
}

export interface ExamCategory {
  slug: string
  name: string
  icon: string
  description: string
  batchCount: number
  color: string
}

export interface Lecture {
  id: string
  title: string
  duration: string
  thumbnail: string
  isFree: boolean
  isCompleted: boolean
  subject: string
  videoUrl?: string
}

export interface Note {
  id: string
  title: string
  examSlug: string
  subject: string
  type: "notes" | "dpp" | "formula" | "pyq"
  pages: number
  price: number
  isFree: boolean
  thumbnail: string
}

export interface TestSeries {
  id: string
  title: string
  examSlug: string
  totalQuestions: number
  duration: number
  totalMarks: number
  mode: "practice" | "scheduled"
  scheduledDate?: string
  price: number
  isFree: boolean
  attemptsCount: number
  averageScore: number
}

export interface Question {
  id: string
  type: "mcq" | "mmcq" | "numerical"
  stem: string
  options?: { id: string; text: string }[]
  correctAnswer?: string
  explanation?: string
  section: string
  marks: number
  negativeMarks: number
  imageUrl?: string
}

export interface TestResult {
  testId: string
  testName: string
  totalMarks: number
  obtainedMarks: number
  correct: number
  incorrect: number
  unattempted: number
  accuracy: number
  rank: number
  totalStudents: number
  percentile: number
  timeTaken: number
  sections: SectionResult[]
}

export interface SectionResult {
  name: string
  totalMarks: number
  obtainedMarks: number
  correct: number
  incorrect: number
  unattempted: number
}

export interface Doubt {
  id: string
  subject: string
  topic: string
  question: string
  status: "ai-answered" | "pending-human" | "resolved"
  aiResponse?: string
  aiConfidence?: number
  facultyResponse?: string
  createdAt: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  thumbnail: string
  author: string
  date: string
  readTime: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning"
  read: boolean
  createdAt: string
}

export interface LiveClass {
  id: string
  title: string
  subject: string
  faculty: string
  batchName: string
  startTime: string
  endTime: string
  status: "live" | "upcoming" | "ended"
  recordingUrl?: string
}

export interface Book {
  id: string
  title: string
  author: string
  price: number
  discountedPrice?: number
  thumbnail: string
  description: string
  pages: number
  inStock: boolean
  rating: number
}

export interface Topper {
  name: string
  rank: number
  exam: string
  year: number
  avatar: string
  quote: string
}

export interface Testimonial {
  name: string
  rating: number
  quote: string
  exam: string
  avatar: string
}
