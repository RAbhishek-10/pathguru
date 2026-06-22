import type { Batch, Faculty, ExamCategory, TestSeries, Note, BlogPost, LiveClass, Book, Topper, Testimonial, Doubt, Notification, Question, TestResult, Lecture, ApiUser } from "./types"

export const examCategories: ExamCategory[] = [
  { slug: "neet", name: "NEET", icon: "Stethoscope", description: "Medical entrance preparation", batchCount: 12, color: "bg-emerald-500" },
  { slug: "jee", name: "IIT JEE", icon: "Atom", description: "Engineering entrance preparation", batchCount: 15, color: "bg-blue-500" },
  { slug: "gate", name: "GATE", icon: "Cpu", description: "Post-graduate engineering", batchCount: 8, color: "bg-orange-500" },
  { slug: "upsc", name: "UPSC", icon: "Landmark", description: "Civil services examination", batchCount: 6, color: "bg-amber-500" },
  { slug: "ctet", name: "CTET", icon: "GraduationCap", description: "Teaching eligibility test", batchCount: 4, color: "bg-teal-500" },
  { slug: "rrb", name: "RRB", icon: "Train", description: "Railway recruitment board", batchCount: 5, color: "bg-red-500" },
  { slug: "school", name: "School Boards", icon: "School", description: "CBSE & State Board preparation", batchCount: 10, color: "bg-indigo-500" },
  { slug: "ai-trainings", name: "AI Trainings", icon: "Brain", description: "AI & Machine Learning courses", batchCount: 3, color: "bg-cyan-500" },
]

export const faculty: Faculty[] = [
  { id: "f1", name: "Dr. Rajesh Kumar", subject: "Physics", experience: 15, avatar: "/placeholder.svg?height=200&width=200", bio: "IIT Delhi alumnus, 15+ years in JEE coaching" },
  { id: "f2", name: "Dr. Priya Sharma", subject: "Chemistry", experience: 12, avatar: "/placeholder.svg?height=200&width=200", bio: "PhD in Organic Chemistry, NEET specialist" },
  { id: "f3", name: "Prof. Amit Singh", subject: "Mathematics", experience: 18, avatar: "/placeholder.svg?height=200&width=200", bio: "Gold medalist, authored 5 textbooks" },
  { id: "f4", name: "Dr. Neha Gupta", subject: "Biology", experience: 10, avatar: "/placeholder.svg?height=200&width=200", bio: "AIIMS topper, passionate educator" },
  { id: "f5", name: "Prof. Vikram Patel", subject: "Computer Science", experience: 14, avatar: "/placeholder.svg?height=200&width=200", bio: "Ex-Google, AI/ML expert" },
  { id: "f6", name: "Dr. Sunita Verma", subject: "English", experience: 11, avatar: "/placeholder.svg?height=200&width=200", bio: "Cambridge certified, communication specialist" },
]

export const batches: Batch[] = [
  {
    id: "b1", title: "NEET 2026 Arjuna Batch", slug: "neet-arjuna-2026", examSlug: "neet",
    description: "Complete NEET preparation with daily live classes, test series, and doubt resolution. Covers Physics, Chemistry, and Biology with experienced faculty.",
    price: 24999, discountedPrice: 14999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[0], faculty[1], faculty[3]], rating: 4.7, reviewCount: 2340, enrolledCount: 15200,
    mode: "online", startDate: "2025-07-01", status: "active", tags: ["Bestseller", "NEET 2026"],
    features: ["400+ live classes", "Full test series", "AI doubt resolution", "Study material PDF", "Previous year papers"]
  },
  {
    id: "b2", title: "JEE Mains Lakshya Batch", slug: "jee-lakshya-2026", examSlug: "jee",
    description: "Comprehensive JEE Mains preparation covering Physics, Chemistry, and Mathematics with advanced problem-solving techniques.",
    price: 29999, discountedPrice: 17999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[0], faculty[1], faculty[2]], rating: 4.8, reviewCount: 1890, enrolledCount: 12500,
    mode: "online", startDate: "2025-06-15", status: "active", tags: ["Top Rated", "JEE 2026"],
    features: ["500+ live classes", "Advanced test series", "24/7 AI doubts", "DPP booklets", "Rank predictor"]
  },
  {
    id: "b3", title: "GATE CSE Prayas Batch", slug: "gate-cse-prayas", examSlug: "gate",
    description: "Complete GATE Computer Science preparation with theory, problem solving, and mock tests.",
    price: 19999, discountedPrice: 11999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[4]], rating: 4.6, reviewCount: 890, enrolledCount: 5600,
    mode: "online", startDate: "2025-08-01", status: "active", tags: ["GATE 2026"],
    features: ["300+ live classes", "Subject-wise tests", "Previous year solutions", "Interview prep"]
  },
  {
    id: "b4", title: "NEET Dropper Batch 2026", slug: "neet-dropper-2026", examSlug: "neet",
    description: "Specialized batch for NEET droppers with intensive revision and practice.",
    price: 19999, discountedPrice: 12999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[1], faculty[3]], rating: 4.5, reviewCount: 1200, enrolledCount: 8900,
    mode: "hybrid", startDate: "2025-05-01", status: "active", tags: ["Dropper Special"],
    features: ["Daily 6-hour classes", "Weekly tests", "Personal mentor", "Offline centres"]
  },
  {
    id: "b5", title: "JEE Advanced Tatva Batch", slug: "jee-advanced-tatva", examSlug: "jee",
    description: "Advanced level JEE preparation for top IIT aspirants.",
    price: 34999, discountedPrice: 22999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[0], faculty[2]], rating: 4.9, reviewCount: 670, enrolledCount: 3200,
    mode: "online", startDate: "2025-07-15", status: "active", tags: ["Premium", "JEE Advanced"],
    features: ["Expert faculty", "Advanced problems", "Mock tests", "Peer discussion groups"]
  },
  {
    id: "b6", title: "UPSC Foundation Batch", slug: "upsc-foundation", examSlug: "upsc",
    description: "Build your UPSC foundation with comprehensive coverage of all subjects.",
    price: 39999, discountedPrice: 24999, thumbnail: "/placeholder.svg?height=400&width=600",
    faculty: [faculty[5]], rating: 4.4, reviewCount: 450, enrolledCount: 2100,
    mode: "online", startDate: "2025-09-01", status: "upcoming", tags: ["New Batch"],
    features: ["GS + CSAT coverage", "Current affairs daily", "Answer writing practice", "Mentorship"]
  },
]

export const testSeries: TestSeries[] = [
  { id: "t1", title: "NEET Full Mock Test Series 2026", examSlug: "neet", totalQuestions: 200, duration: 200, totalMarks: 720, mode: "scheduled", scheduledDate: "2025-08-15", price: 2999, isFree: false, attemptsCount: 12500, averageScore: 420 },
  { id: "t2", title: "JEE Mains Chapter-wise Tests", examSlug: "jee", totalQuestions: 75, duration: 180, totalMarks: 300, mode: "practice", price: 1999, isFree: false, attemptsCount: 8900, averageScore: 165 },
  { id: "t3", title: "NEET Biology Practice Set", examSlug: "neet", totalQuestions: 50, duration: 60, totalMarks: 200, mode: "practice", price: 0, isFree: true, attemptsCount: 25000, averageScore: 130 },
  { id: "t4", title: "JEE Advanced Mock 1", examSlug: "jee", totalQuestions: 54, duration: 180, totalMarks: 180, mode: "scheduled", scheduledDate: "2025-09-01", price: 3499, isFree: false, attemptsCount: 4200, averageScore: 78 },
  { id: "t5", title: "GATE CS Mock Test", examSlug: "gate", totalQuestions: 65, duration: 180, totalMarks: 100, mode: "practice", price: 1499, isFree: false, attemptsCount: 3100, averageScore: 52 },
]

export const notes: Note[] = [
  { id: "n1", title: "NEET Physics Complete Notes", examSlug: "neet", subject: "Physics", type: "notes", pages: 320, price: 499, isFree: false, thumbnail: "/placeholder.svg?height=300&width=200" },
  { id: "n2", title: "Organic Chemistry Formula Sheet", examSlug: "neet", subject: "Chemistry", type: "formula", pages: 45, price: 0, isFree: true, thumbnail: "/placeholder.svg?height=300&width=200" },
  { id: "n3", title: "JEE Mathematics DPP", examSlug: "jee", subject: "Mathematics", type: "dpp", pages: 180, price: 399, isFree: false, thumbnail: "/placeholder.svg?height=300&width=200" },
  { id: "n4", title: "Biology NCERT Summary", examSlug: "neet", subject: "Biology", type: "notes", pages: 250, price: 0, isFree: true, thumbnail: "/placeholder.svg?height=300&width=200" },
  { id: "n5", title: "NEET Previous Year Papers", examSlug: "neet", subject: "All Subjects", type: "pyq", pages: 500, price: 699, isFree: false, thumbnail: "/placeholder.svg?height=300&width=200" },
  { id: "n6", title: "GATE CS Data Structures Notes", examSlug: "gate", subject: "Computer Science", type: "notes", pages: 200, price: 349, isFree: false, thumbnail: "/placeholder.svg?height=300&width=200" },
]

export const blogPosts: BlogPost[] = [
  { slug: "neet-2026-preparation-strategy", title: "NEET 2026: Complete Preparation Strategy", excerpt: "A detailed roadmap for NEET aspirants covering monthly targets, study hours, and subject-wise tips.", thumbnail: "/placeholder.svg?height=200&width=400", author: "Dr. Priya Sharma", date: "2025-06-01", readTime: "8 min" },
  { slug: "jee-mains-vs-advanced", title: "JEE Mains vs Advanced: Key Differences", excerpt: "Understanding the exam patterns, difficulty levels, and preparation strategies for both JEE exams.", thumbnail: "/placeholder.svg?height=200&width=400", author: "Prof. Amit Singh", date: "2025-05-28", readTime: "6 min" },
  { slug: "time-management-competitive-exams", title: "Time Management Tips for Competitive Exams", excerpt: "Proven strategies to manage your time effectively during preparation and on exam day.", thumbnail: "/placeholder.svg?height=200&width=400", author: "PathGuru Team", date: "2025-05-20", readTime: "5 min" },
]

export const liveClasses: LiveClass[] = [
  { id: "lc1", title: "Thermodynamics - Laws & Applications", subject: "Physics", faculty: "Dr. Rajesh Kumar", batchName: "NEET Arjuna", startTime: "2025-07-01T09:00:00", endTime: "2025-07-01T11:00:00", status: "live" },
  { id: "lc2", title: "Organic Chemistry - Reaction Mechanisms", subject: "Chemistry", faculty: "Dr. Priya Sharma", batchName: "NEET Arjuna", startTime: "2025-07-01T11:30:00", endTime: "2025-07-01T13:30:00", status: "upcoming" },
  { id: "lc3", title: "Calculus - Integration Techniques", subject: "Mathematics", faculty: "Prof. Amit Singh", batchName: "JEE Lakshya", startTime: "2025-07-01T14:00:00", endTime: "2025-07-01T16:00:00", status: "upcoming" },
  { id: "lc4", title: "Cell Biology - Structure & Function", subject: "Biology", faculty: "Dr. Neha Gupta", batchName: "NEET Arjuna", startTime: "2025-06-30T09:00:00", endTime: "2025-06-30T11:00:00", status: "ended", recordingUrl: "#" },
]

export const books: Book[] = [
  { id: "bk1", title: "NEET Physics Masterclass", author: "Dr. Rajesh Kumar", price: 799, discountedPrice: 599, thumbnail: "/placeholder.svg?height=400&width=300", description: "Comprehensive physics guide", pages: 650, inStock: true, rating: 4.6 },
  { id: "bk2", title: "Organic Chemistry Simplified", author: "Dr. Priya Sharma", price: 699, discountedPrice: 499, thumbnail: "/placeholder.svg?height=400&width=300", description: "Master organic chemistry", pages: 480, inStock: true, rating: 4.8 },
  { id: "bk3", title: "Mathematics Problem Book", author: "Prof. Amit Singh", price: 899, thumbnail: "/placeholder.svg?height=400&width=300", description: "5000+ practice problems", pages: 720, inStock: false, rating: 4.7 },
]

export const toppers: Topper[] = [
  { name: "Aarav Patel", rank: 1, exam: "NEET 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "PathGuru's structured approach helped me achieve AIR 1" },
  { name: "Sneha Reddy", rank: 3, exam: "JEE Advanced 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "The test series were exactly like the real exam" },
  { name: "Rohan Mehta", rank: 5, exam: "NEET 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "AI doubt resolution saved me hours of waiting" },
  { name: "Priya Joshi", rank: 12, exam: "JEE Mains 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "Best faculty and study material for JEE prep" },
  { name: "Arjun Nair", rank: 8, exam: "GATE CS 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "Cracked GATE with just 6 months of preparation here" },
]

export const testimonials: Testimonial[] = [
  { name: "Vikash Singh", rating: 5, quote: "The best online coaching platform I've used. Faculty are incredible and the AI doubt feature is a game-changer.", exam: "NEET", avatar: "/placeholder.svg?height=100&width=100" },
  { name: "Ananya Kumari", rating: 5, quote: "Affordable pricing with premium quality content. The test series helped me improve my score by 150 marks.", exam: "JEE Mains", avatar: "/placeholder.svg?height=100&width=100" },
  { name: "Mohit Verma", rating: 4, quote: "Great study material and regular live classes. The offline centres are well-maintained too.", exam: "NEET", avatar: "/placeholder.svg?height=100&width=100" },
  { name: "Kavya Sharma", rating: 5, quote: "From scoring 400 in mocks to 680 in actual NEET - all thanks to PathGuru!", exam: "NEET", avatar: "/placeholder.svg?height=100&width=100" },
]

export const lectures: Lecture[] = [
  { id: "l1", title: "Introduction to Mechanics", duration: "45:00", thumbnail: "/placeholder.svg?height=120&width=200", isFree: true, isCompleted: true, subject: "Physics" },
  { id: "l2", title: "Newton's Laws of Motion", duration: "1:12:00", thumbnail: "/placeholder.svg?height=120&width=200", isFree: false, isCompleted: true, subject: "Physics" },
  { id: "l3", title: "Work, Energy & Power", duration: "58:00", thumbnail: "/placeholder.svg?height=120&width=200", isFree: false, isCompleted: false, subject: "Physics" },
  { id: "l4", title: "Chemical Bonding", duration: "1:05:00", thumbnail: "/placeholder.svg?height=120&width=200", isFree: true, isCompleted: false, subject: "Chemistry" },
  { id: "l5", title: "Periodic Table Trends", duration: "52:00", thumbnail: "/placeholder.svg?height=120&width=200", isFree: false, isCompleted: false, subject: "Chemistry" },
]

export const sampleQuestions: Question[] = [
  { id: "q1", type: "mcq", stem: "A body of mass 5 kg is acted upon by two perpendicular forces 8 N and 6 N. The magnitude of acceleration is:", options: [{ id: "a", text: "2 m/s\u00B2" }, { id: "b", text: "4 m/s\u00B2" }, { id: "c", text: "6 m/s\u00B2" }, { id: "d", text: "10 m/s\u00B2" }], section: "Physics", marks: 4, negativeMarks: 1 },
  { id: "q2", type: "mcq", stem: "Which of the following is the strongest acid?", options: [{ id: "a", text: "HF" }, { id: "b", text: "HCl" }, { id: "c", text: "HBr" }, { id: "d", text: "HI" }], section: "Chemistry", marks: 4, negativeMarks: 1 },
  { id: "q3", type: "mcq", stem: "The powerhouse of the cell is:", options: [{ id: "a", text: "Nucleus" }, { id: "b", text: "Mitochondria" }, { id: "c", text: "Ribosome" }, { id: "d", text: "Golgi body" }], section: "Biology", marks: 4, negativeMarks: 1 },
  { id: "q4", type: "numerical", stem: "If f(x) = x\u00B3 - 3x + 2, find f'(1).", section: "Mathematics", marks: 4, negativeMarks: 0 },
  { id: "q5", type: "mcq", stem: "The SI unit of electric current is:", options: [{ id: "a", text: "Volt" }, { id: "b", text: "Ampere" }, { id: "c", text: "Ohm" }, { id: "d", text: "Watt" }], section: "Physics", marks: 4, negativeMarks: 1 },
]

export const sampleTestResult: TestResult = {
  testId: "t1", testName: "NEET Full Mock Test 1", totalMarks: 720, obtainedMarks: 542,
  correct: 145, incorrect: 23, unattempted: 32, accuracy: 86.3, rank: 234,
  totalStudents: 12500, percentile: 98.1, timeTaken: 175,
  sections: [
    { name: "Physics", totalMarks: 180, obtainedMarks: 132, correct: 35, incorrect: 7, unattempted: 3 },
    { name: "Chemistry", totalMarks: 180, obtainedMarks: 148, correct: 40, incorrect: 3, unattempted: 2 },
    { name: "Biology", totalMarks: 360, obtainedMarks: 262, correct: 70, incorrect: 13, unattempted: 7 },
  ]
}

export const sampleDoubts: Doubt[] = [
  { id: "d1", subject: "Physics", topic: "Thermodynamics", question: "Why does entropy always increase in an isolated system?", status: "ai-answered", aiResponse: "According to the second law of thermodynamics, the total entropy of an isolated system can never decrease over time. This is because natural processes tend to move towards a state of maximum disorder...", aiConfidence: 0.92, createdAt: "2025-06-28T10:30:00" },
  { id: "d2", subject: "Chemistry", topic: "Organic Chemistry", question: "Explain the mechanism of SN2 reaction with an example.", status: "resolved", aiResponse: "SN2 is a bimolecular nucleophilic substitution...", aiConfidence: 0.78, facultyResponse: "Great question! The SN2 mechanism involves a single concerted step where the nucleophile attacks the electrophilic carbon...", createdAt: "2025-06-27T14:00:00" },
  { id: "d3", subject: "Biology", topic: "Genetics", question: "What is the difference between codominance and incomplete dominance?", status: "pending-human", createdAt: "2025-06-29T09:15:00" },
]

export const sampleNotifications: Notification[] = [
  { id: "nt1", title: "Live Class Starting", message: "Thermodynamics class starts in 30 minutes", type: "info", read: false, createdAt: "2025-07-01T08:30:00" },
  { id: "nt2", title: "Test Result Published", message: "Your NEET Mock Test 1 results are out", type: "success", read: false, createdAt: "2025-06-30T18:00:00" },
  { id: "nt3", title: "New Notes Available", message: "Physics Chapter 5 notes have been uploaded", type: "info", read: true, createdAt: "2025-06-29T12:00:00" },
]

export const mockUser: ApiUser = {
  id: "u1",
  name: "Rahul Sharma",
  email: "rahul@example.com",
  phone: "9876543210",
  avatar: "/placeholder.svg?height=100&width=100",
  role: "student",
  status: "active",
  enrolledBatches: ["b1", "b2"],
  purchasedNotes: ["n1", "n3"],
  purchasedLectures: [],
  testResults: [
    { testId: "t1", testName: "NEET Mock 1", score: 542, totalMarks: 720, rank: 234, percentile: 98.1, date: "2025-06-25" },
    { testId: "t2", testName: "JEE Mock 1", score: 198, totalMarks: 300, rank: 156, percentile: 95.2, date: "2025-06-20" },
  ],
  walletBalance: 1500,
  referralCode: "RAHUL2025",
  createdAt: "2025-01-15",
}
