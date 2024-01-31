import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("ad@123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      name: "AnPhat Admin",
      password,
      emailVerified: new Date()
    }
  });
  console.log({ user });

  const team = await prisma.team.upsert({
    where: { domain: "anphat.com" },
    update: {},
    create: {
      name: "An Phát",
      slug: "anphat",
      domain: "anphat.com"
    }
  });
  console.log({ team });

  const teamMemberId = "ef471441-2947-48f6-8c6e-058580bec271";
  const teamMember = await prisma.teamMember.upsert({
    where: { id: teamMemberId },
    update: {},
    create: {
      id: teamMemberId,
      userId: user.id,
      teamId: team.id,
      role: "OWNER"
    }
  });
  console.log({ teamMember });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
