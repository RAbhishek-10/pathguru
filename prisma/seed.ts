import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const DEFAULT_PASSWORD = "password123"

async function main() {
  console.log("Seeding database...")

  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.purchase.deleteMany()
  await db.notification.deleteMany()
  await db.doubt.deleteMany()
  await db.question.deleteMany()
  await db.lectureProgress.deleteMany()
  await db.enrollment.deleteMany()
  await db.batchFaculty.deleteMany()
  await db.lecture.deleteMany()
  await db.testResultRecord.deleteMany()
  await db.batch.deleteMany()
  await db.facultyProfile.deleteMany()
  await db.note.deleteMany()
  await db.testSeries.deleteMany()
  await db.liveClass.deleteMany()
  await db.book.deleteMany()
  await db.blogPost.deleteMany()
  await db.topper.deleteMany()
  await db.testimonial.deleteMany()
  await db.examCategory.deleteMany()
  await db.user.deleteMany()

  await db.examCategory.createMany({
    data: [
      { slug: "neet", name: "NEET", icon: "Stethoscope", description: "Medical entrance preparation", color: "bg-emerald-500", sortOrder: 0 },
      { slug: "jee", name: "IIT JEE", icon: "Atom", description: "Engineering entrance preparation", color: "bg-blue-500", sortOrder: 1 },
      { slug: "gate", name: "GATE", icon: "Cpu", description: "Post-graduate engineering", color: "bg-orange-500", sortOrder: 2 },
      { slug: "upsc", name: "UPSC", icon: "Landmark", description: "Civil services examination", color: "bg-amber-500", sortOrder: 3 },
      { slug: "ctet", name: "CTET", icon: "GraduationCap", description: "Teaching eligibility test", color: "bg-teal-500", sortOrder: 4 },
      { slug: "rrb", name: "RRB", icon: "Train", description: "Railway recruitment board", color: "bg-red-500", sortOrder: 5 },
      { slug: "school", name: "School Boards", icon: "School", description: "CBSE & State Board preparation", color: "bg-indigo-500", sortOrder: 6 },
      { slug: "ai-trainings", name: "AI Trainings", icon: "Brain", description: "AI & Machine Learning courses", color: "bg-cyan-500", sortOrder: 7 },
    ],
  })

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  const admin = await db.user.create({
    data: {
      name: "Admin User",
      email: "admin@trueeducator.in",
      phone: "9000000001",
      passwordHash,
      role: "ADMIN",
      referralCode: "ADMIN2025",
      walletBalance: 0,
    },
  })

  const facultyUsers = await Promise.all([
    db.user.create({
      data: {
        name: "Dr. Rajesh Kumar",
        email: "rajesh@trueeducator.in",
        phone: "9000000002",
        passwordHash,
        role: "FACULTY",
        referralCode: "RAJESH2025",
      },
    }),
    db.user.create({
      data: {
        name: "Dr. Priya Sharma",
        email: "priya@trueeducator.in",
        phone: "9000000003",
        passwordHash,
        role: "FACULTY",
        referralCode: "PRIYA2025",
      },
    }),
  ])

  const facultyProfiles = await Promise.all([
    db.facultyProfile.create({
      data: { userId: facultyUsers[0].id, subject: "Physics", experience: 15, bio: "IIT Delhi alumnus, 15+ years in JEE coaching" },
    }),
    db.facultyProfile.create({
      data: { userId: facultyUsers[1].id, subject: "Chemistry", experience: 12, bio: "PhD in Organic Chemistry, NEET specialist" },
    }),
  ])

  const student = await db.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "9876543210",
      passwordHash,
      role: "STUDENT",
      examTarget: "neet",
      referralCode: "RAHUL2025",
      walletBalance: 1500,
    },
  })

  const batches = [
    {
      title: "NEET 2026 Arjuna Batch",
      slug: "neet-arjuna-2026",
      examSlug: "neet",
      description: "Complete NEET preparation with daily live classes, test series, and doubt resolution.",
      price: 24999,
      discountedPrice: 14999,
      mode: "ONLINE" as const,
      startDate: new Date("2025-07-01"),
      status: "ACTIVE" as const,
      tags: ["Bestseller", "NEET 2026"],
      features: ["400+ live classes", "Full test series", "AI doubt resolution", "Study material PDF"],
      creatorId: facultyUsers[0].id,
      facultyId: facultyProfiles[0].id,
    },
    {
      title: "JEE Mains Lakshya Batch",
      slug: "jee-lakshya-2026",
      examSlug: "jee",
      description: "Comprehensive JEE Mains preparation covering Physics, Chemistry, and Mathematics.",
      price: 29999,
      discountedPrice: 17999,
      mode: "ONLINE" as const,
      startDate: new Date("2025-06-15"),
      status: "ACTIVE" as const,
      tags: ["Top Rated", "JEE 2026"],
      features: ["500+ live classes", "Advanced test series", "24/7 AI doubts", "DPP booklets"],
      creatorId: facultyUsers[0].id,
      facultyId: facultyProfiles[0].id,
    },
    {
      title: "NEET Dropper Batch 2026",
      slug: "neet-dropper-2026",
      examSlug: "neet",
      description: "Specialized batch for NEET droppers with intensive revision and practice.",
      price: 19999,
      discountedPrice: 12999,
      mode: "HYBRID" as const,
      startDate: new Date("2025-05-01"),
      status: "ACTIVE" as const,
      tags: ["Dropper Special"],
      features: ["Daily 6-hour classes", "Weekly tests", "Personal mentor"],
      creatorId: facultyUsers[1].id,
      facultyId: facultyProfiles[1].id,
    },
  ]

  for (const b of batches) {
    const batch = await db.batch.create({
      data: {
        title: b.title,
        slug: b.slug,
        examSlug: b.examSlug,
        description: b.description,
        price: b.price,
        discountedPrice: b.discountedPrice,
        mode: b.mode,
        startDate: b.startDate,
        status: b.status,
        tags: JSON.stringify(b.tags),
        features: JSON.stringify(b.features),
        creatorId: b.creatorId,
        rating: 4.7,
        reviewCount: 1200,
        enrolledCount: 0,
      },
    })

    await db.batchFaculty.create({ data: { batchId: batch.id, facultyId: b.facultyId } })

    const lectureData = [
      { title: "Introduction to Mechanics", duration: "45:00", subject: "Physics", isFree: true, sortOrder: 0 },
      { title: "Newton's Laws of Motion", duration: "1:12:00", subject: "Physics", isFree: false, sortOrder: 1 },
      { title: "Work, Energy & Power", duration: "58:00", subject: "Physics", isFree: false, sortOrder: 2 },
      { title: "Chemical Bonding", duration: "1:05:00", subject: "Chemistry", isFree: true, sortOrder: 3 },
    ]

    for (const l of lectureData) {
      await db.lecture.create({ data: { batchId: batch.id, ...l } })
    }
  }

  const allBatches = await db.batch.findMany()
  const neetBatch = allBatches.find((b) => b.slug === "neet-arjuna-2026")!
  const jeeBatch = allBatches.find((b) => b.slug === "jee-lakshya-2026")!

  await db.enrollment.createMany({
    data: [
      { userId: student.id, batchId: neetBatch.id, progress: 35 },
      { userId: student.id, batchId: jeeBatch.id, progress: 20 },
    ],
  })

  await db.batch.update({ where: { id: neetBatch.id }, data: { enrolledCount: 1 } })
  await db.batch.update({ where: { id: jeeBatch.id }, data: { enrolledCount: 1 } })

  await db.note.createMany({
    data: [
      { title: "NEET Physics Complete Notes", examSlug: "neet", subject: "Physics", type: "notes", pages: 320, price: 499, isFree: false },
      { title: "Organic Chemistry Formula Sheet", examSlug: "neet", subject: "Chemistry", type: "formula", pages: 45, price: 0, isFree: true },
      { title: "JEE Mathematics DPP", examSlug: "jee", subject: "Mathematics", type: "dpp", pages: 180, price: 399, isFree: false },
      { title: "Biology NCERT Summary", examSlug: "neet", subject: "Biology", type: "notes", pages: 250, price: 0, isFree: true },
      { title: "NEET Previous Year Papers", examSlug: "neet", subject: "All Subjects", type: "pyq", pages: 500, price: 699, isFree: false },
      { title: "GATE CS Data Structures Notes", examSlug: "gate", subject: "Computer Science", type: "notes", pages: 200, price: 349, isFree: false },
    ],
  })

  const jeeTest = await db.testSeries.create({
    data: {
      title: "JEE Mains Chapter-wise Tests",
      examSlug: "jee",
      totalQuestions: 75,
      duration: 180,
      totalMarks: 300,
      mode: "practice",
      price: 1999,
      attemptsCount: 8900,
      averageScore: 165,
    },
  })

  const neetTest = await db.testSeries.create({
    data: {
      title: "NEET Full Mock Test Series 2026",
      examSlug: "neet",
      totalQuestions: 5,
      duration: 200,
      totalMarks: 720,
      mode: "scheduled",
      scheduledDate: new Date("2025-08-15"),
      price: 2999,
      attemptsCount: 12500,
      averageScore: 420,
    },
  })

  await db.testSeries.create({
    data: {
      title: "NEET Biology Practice Set",
      examSlug: "neet",
      totalQuestions: 50,
      duration: 60,
      totalMarks: 200,
      mode: "practice",
      price: 0,
      isFree: true,
      attemptsCount: 25000,
      averageScore: 130,
    },
  })

  const questions = [
    { type: "mcq", stem: "A body of mass 5 kg is acted upon by two perpendicular forces 8 N and 6 N. The magnitude of acceleration is:", options: JSON.stringify([{ id: "a", text: "2 m/s²" }, { id: "b", text: "4 m/s²" }, { id: "c", text: "6 m/s²" }, { id: "d", text: "10 m/s²" }]), correctAnswer: "a", section: "Physics", marks: 4, negativeMarks: 1, sortOrder: 0 },
    { type: "mcq", stem: "Which of the following is the strongest acid?", options: JSON.stringify([{ id: "a", text: "HF" }, { id: "b", text: "HCl" }, { id: "c", text: "HBr" }, { id: "d", text: "HI" }]), correctAnswer: "d", section: "Chemistry", marks: 4, negativeMarks: 1, sortOrder: 1 },
    { type: "mcq", stem: "The powerhouse of the cell is:", options: JSON.stringify([{ id: "a", text: "Nucleus" }, { id: "b", text: "Mitochondria" }, { id: "c", text: "Ribosome" }, { id: "d", text: "Golgi body" }]), correctAnswer: "b", section: "Biology", marks: 4, negativeMarks: 1, sortOrder: 2 },
    { type: "numerical", stem: "If f(x) = x³ - 3x + 2, find f'(1).", options: "[]", correctAnswer: "0", section: "Mathematics", marks: 4, negativeMarks: 0, sortOrder: 3 },
    { type: "mcq", stem: "The SI unit of electric current is:", options: JSON.stringify([{ id: "a", text: "Volt" }, { id: "b", text: "Ampere" }, { id: "c", text: "Ohm" }, { id: "d", text: "Watt" }]), correctAnswer: "b", section: "Physics", marks: 4, negativeMarks: 1, sortOrder: 4 },
  ]

  const biologyQuestions = [
    { type: "mcq", stem: "Which of the following is known as the powerhouse of the cell?", options: JSON.stringify([{ id: "a", text: "Nucleus" }, { id: "b", text: "Mitochondria" }, { id: "c", text: "Endoplasmic Reticulum" }, { id: "d", text: "Lysosome" }]), correctAnswer: "b", section: "Biology", marks: 4, negativeMarks: 1, sortOrder: 0 },
    { type: "mcq", stem: "Double fertilization is a characteristic feature of:", options: JSON.stringify([{ id: "a", text: "Gymnosperms" }, { id: "b", text: "Angiosperms" }, { id: "c", text: "Pteridophytes" }, { id: "d", text: "Bryophytes" }]), correctAnswer: "b", section: "Biology", marks: 4, negativeMarks: 1, sortOrder: 1 },
    { type: "mcq", stem: "The term 'systematics' refers to:", options: JSON.stringify([{ id: "a", text: "Identification and study of organ systems" }, { id: "b", text: "Diversity of kinds of organisms and their relationship" }, { id: "c", text: "Taxonomy and nomenclature of plants" }, { id: "d", text: "None of the above" }]), correctAnswer: "b", section: "Biology", marks: 4, negativeMarks: 1, sortOrder: 2 },
  ]

  const chemistryQuestions = [
    { type: "mcq", stem: "The most electronegative element in the periodic table is:", options: JSON.stringify([{ id: "a", text: "Fluorine" }, { id: "b", text: "Chlorine" }, { id: "c", text: "Oxygen" }, { id: "d", text: "Nitrogen" }]), correctAnswer: "a", section: "Chemistry", marks: 4, negativeMarks: 1, sortOrder: 0 },
    { type: "mcq", stem: "The oxidation state of Oxygen in OF2 is:", options: JSON.stringify([{ id: "a", text: "-2" }, { id: "b", text: "+2" }, { id: "c", text: "-1" }, { id: "d", text: "+1" }]), correctAnswer: "b", section: "Chemistry", marks: 4, negativeMarks: 1, sortOrder: 1 },
  ]

  // Seed questions for all test series
  for (const q of questions) {
    await db.question.create({ data: { testSeriesId: neetTest.id, ...q } })
  }
  for (const q of biologyQuestions) {
    await db.question.create({ data: { testSeriesId: neetTest.id, ...q } })
  }
  
  // Also seed some for the Biology Practice Set
  const biologyPracticeTest = await db.testSeries.findFirst({ where: { title: "NEET Biology Practice Set" } })
  if (biologyPracticeTest) {
    for (const q of biologyQuestions) {
      await db.question.create({ data: { testSeriesId: biologyPracticeTest.id, ...q } })
    }
  }

  // Also seed some for JEE Tests
  const jeePracticeTest = await db.testSeries.findFirst({ where: { title: "JEE Mains Chapter-wise Tests" } })
  if (jeePracticeTest) {
    for (const q of chemistryQuestions) {
      await db.question.create({ data: { testSeriesId: jeePracticeTest.id, ...q } })
    }
  }

  await db.testResultRecord.createMany({
    data: [
      { userId: student.id, testId: neetTest.id, testName: "NEET Mock 1", score: 542, totalMarks: 720, rank: 234, percentile: 98.1 },
      { userId: student.id, testId: jeeTest.id, testName: "JEE Mock 1", score: 198, totalMarks: 300, rank: 156, percentile: 95.2 },
    ],
  })

  await db.liveClass.createMany({
    data: [
      { title: "Thermodynamics - Laws & Applications", subject: "Physics", facultyName: "Dr. Rajesh Kumar", batchName: "NEET Arjuna", startTime: new Date("2025-07-01T09:00:00"), endTime: new Date("2025-07-01T11:00:00"), status: "live" },
      { title: "Organic Chemistry - Reaction Mechanisms", subject: "Chemistry", facultyName: "Dr. Priya Sharma", batchName: "NEET Arjuna", startTime: new Date("2025-07-01T11:30:00"), endTime: new Date("2025-07-01T13:30:00"), status: "upcoming" },
      { title: "Calculus - Integration Techniques", subject: "Mathematics", facultyName: "Prof. Amit Singh", batchName: "JEE Lakshya", startTime: new Date("2025-07-01T14:00:00"), endTime: new Date("2025-07-01T16:00:00"), status: "upcoming" },
      { title: "Cell Biology - Structure & Function", subject: "Biology", facultyName: "Dr. Neha Gupta", batchName: "NEET Arjuna", startTime: new Date("2025-06-30T09:00:00"), endTime: new Date("2025-06-30T11:00:00"), status: "ended", recordingUrl: "#" },
    ],
  })

  await db.book.createMany({
    data: [
      { title: "NEET Physics Masterclass", author: "Dr. Rajesh Kumar", price: 799, discountedPrice: 599, description: "Comprehensive physics guide", pages: 650, inStock: true, rating: 4.6 },
      { title: "Organic Chemistry Simplified", author: "Dr. Priya Sharma", price: 699, discountedPrice: 499, description: "Master organic chemistry", pages: 480, inStock: true, rating: 4.8 },
      { title: "Mathematics Problem Book", author: "Prof. Amit Singh", price: 899, description: "5000+ practice problems", pages: 720, inStock: false, rating: 4.7 },
    ],
  })

  await db.blogPost.createMany({
    data: [
      { slug: "neet-2026-preparation-strategy", title: "NEET 2026: Complete Preparation Strategy", excerpt: "A detailed roadmap for NEET aspirants.", thumbnail: "/placeholder.svg?height=200&width=400", author: "Dr. Priya Sharma", date: new Date("2025-06-01"), readTime: "8 min" },
      { slug: "jee-mains-vs-advanced", title: "JEE Mains vs Advanced: Key Differences", excerpt: "Understanding exam patterns and strategies.", thumbnail: "/placeholder.svg?height=200&width=400", author: "Prof. Amit Singh", date: new Date("2025-05-28"), readTime: "6 min" },
      { slug: "time-management-competitive-exams", title: "Time Management Tips for Competitive Exams", excerpt: "Proven strategies for exam day.", thumbnail: "/placeholder.svg?height=200&width=400", author: "TrueEducator Team", date: new Date("2025-05-20"), readTime: "5 min" },
    ],
  })

  await db.topper.createMany({
    data: [
      { name: "Aarav Patel", rank: 1, exam: "NEET 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "TrueEducator's structured approach helped me achieve AIR 1" },
      { name: "Sneha Reddy", rank: 3, exam: "JEE Advanced 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "The test series were exactly like the real exam" },
      { name: "Rohan Mehta", rank: 5, exam: "NEET 2025", year: 2025, avatar: "/placeholder.svg?height=200&width=200", quote: "AI doubt resolution saved me hours of waiting" },
    ],
  })

  await db.testimonial.createMany({
    data: [
      { name: "Vikash Singh", rating: 5, quote: "The best online coaching platform I've used.", exam: "NEET", avatar: "/placeholder.svg?height=100&width=100" },
      { name: "Ananya Kumari", rating: 5, quote: "Affordable pricing with premium quality content.", exam: "JEE Mains", avatar: "/placeholder.svg?height=100&width=100" },
      { name: "Kavya Sharma", rating: 5, quote: "From scoring 400 in mocks to 680 in actual NEET!", exam: "NEET", avatar: "/placeholder.svg?height=100&width=100" },
    ],
  })

  const notes = await db.note.findMany()
  if (notes[0]) {
    await db.purchase.create({ data: { userId: student.id, itemType: "note", itemId: notes[0].id } })
  }

  await db.doubt.createMany({
    data: [
      { userId: student.id, subject: "Physics", topic: "Thermodynamics", question: "Why does entropy always increase in an isolated system?", status: "ai-answered", aiResponse: "According to the second law of thermodynamics...", aiConfidence: 0.92, createdAt: new Date("2025-06-28T10:30:00") },
      { userId: student.id, subject: "Chemistry", topic: "Organic Chemistry", question: "Explain the mechanism of SN2 reaction.", status: "resolved", aiResponse: "SN2 is a bimolecular nucleophilic substitution...", aiConfidence: 0.78, facultyResponse: "Great question! The SN2 mechanism involves a single concerted step...", createdAt: new Date("2025-06-27T14:00:00") },
      { userId: student.id, subject: "Biology", topic: "Genetics", question: "What is the difference between codominance and incomplete dominance?", status: "pending-human", createdAt: new Date("2025-06-29T09:15:00") },
    ],
  })

  await db.notification.createMany({
    data: [
      { userId: student.id, title: "Live Class Starting", message: "Thermodynamics class starts in 30 minutes", type: "info", read: false, createdAt: new Date("2025-07-01T08:30:00") },
      { userId: student.id, title: "Test Result Published", message: "Your NEET Mock Test 1 results are out", type: "success", read: false, createdAt: new Date("2025-06-30T18:00:00") },
      { userId: student.id, title: "New Notes Available", message: "Physics Chapter 5 notes have been uploaded", type: "info", read: true, createdAt: new Date("2025-06-29T12:00:00") },
    ],
  })

  console.log("Seed complete!")
  console.log("\nDemo accounts (password: password123):")
  console.log("  Student:  rahul@example.com")
  console.log("  Faculty:  rajesh@trueeducator.in")
  console.log("  Admin:    admin@trueeducator.in")
  console.log(`\nAdmin ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
