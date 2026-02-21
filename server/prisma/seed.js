const bcrypt = require("bcrypt")
const { prisma } = require("../src/prisma")

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12)

  const users = [
    { email: "alice@ace.com", displayName: "Alice", passwordHash },
    { email: "bob@ace.com", displayName: "Bob", passwordHash },
    { email: "carol@ace.com", displayName: "Carol", passwordHash },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
  }

  console.log("✅ Seeded: alice/bob/carol (Password123!)")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
