import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  try {
    const userCount = await db.user.count()
    console.log("✅ DB connected! User count:", userCount)

    if (userCount > 0) {
      const users = await db.user.findMany({
        select: { email: true, role: true, name: true },
      })
      console.log("\nExisting users:")
      users.forEach((u) => console.log(` - ${u.email} (${u.role}) — ${u.name}`))
    } else {
      console.log("\n⚠️  No users found. Run: npm run db:seed")
    }
  } catch (e) {
    console.error("❌ DB error:", (e as Error).message)
  } finally {
    await db.$disconnect()
  }
}

main()
