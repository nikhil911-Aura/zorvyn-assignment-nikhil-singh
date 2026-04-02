import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: "ADMIN",
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@example.com",
      password,
      role: "ANALYST",
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@example.com",
      password,
      role: "VIEWER",
      isActive: true,
    },
  });

  console.log("Users created:", { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  // Create financial records
  const categories = {
    income: ["Salary", "Freelance", "Investment", "Bonus"],
    expense: ["Rent", "Groceries", "Utilities", "Transport", "Entertainment", "Healthcare"],
  };

  const records = [];

  // Generate 12 months of sample data
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);

    // Income entries
    records.push({
      amount: 5000 + Math.random() * 2000,
      type: "INCOME",
      category: "Salary",
      date: new Date(date.getFullYear(), date.getMonth(), 1),
      note: `Monthly salary - ${date.toLocaleString("default", { month: "long" })}`,
      createdBy: admin.id,
    });

    if (Math.random() > 0.5) {
      records.push({
        amount: 500 + Math.random() * 1500,
        type: "INCOME",
        category: categories.income[Math.floor(Math.random() * categories.income.length)],
        date: new Date(date.getFullYear(), date.getMonth(), 15),
        note: "Additional income",
        createdBy: admin.id,
      });
    }

    // Expense entries (3-5 per month)
    const expenseCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < expenseCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const category = categories.expense[Math.floor(Math.random() * categories.expense.length)];
      let amount;
      switch (category) {
        case "Rent": amount = 1500; break;
        case "Groceries": amount = 200 + Math.random() * 300; break;
        case "Utilities": amount = 100 + Math.random() * 200; break;
        case "Transport": amount = 50 + Math.random() * 150; break;
        case "Entertainment": amount = 30 + Math.random() * 170; break;
        case "Healthcare": amount = 50 + Math.random() * 450; break;
        default: amount = 100 + Math.random() * 400;
      }
      records.push({
        amount: Math.round(amount * 100) / 100,
        type: "EXPENSE",
        category,
        date: new Date(date.getFullYear(), date.getMonth(), day),
        note: `${category} payment`,
        createdBy: admin.id,
      });
    }
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log(`Created ${records.length} financial records`);

  console.log("\nSeed complete! Login credentials:");
  console.log("  admin@example.com    / password123  (ADMIN)");
  console.log("  analyst@example.com  / password123  (ANALYST)");
  console.log("  viewer@example.com   / password123  (VIEWER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
