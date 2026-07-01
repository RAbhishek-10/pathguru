import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  const categories = await db.examCategory.findMany()
  console.log("Exam Categories:")
  categories.forEach((cat) => {
    console.log(` - slug: "${cat.slug}", name: "${cat.name}"`)
  })
}

main().finally(() => db.$disconnect())
