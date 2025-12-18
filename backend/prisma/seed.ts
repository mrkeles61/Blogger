import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.Admin,
      username: "admin",
      displayName: "Admin User",
      bio: "System administrator",
      headline: "Blog Administrator",
      isVerified: true,
    },
  });

  console.log(`Created admin user: ${adminEmail} (password: ${adminPassword})`);

  // Create normal users
  const user1Password = await bcrypt.hash("User123!", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash: user1Password,
      role: Role.Viewer,
      username: "alice",
      displayName: "Alice Johnson",
      bio: "Tech enthusiast and blogger. Love sharing knowledge about web development.",
      headline: "Full Stack Developer",
      location: "San Francisco, CA",
      website: "https://alice.dev",
      socialLinks: JSON.stringify({
        twitter: "@alicej",
        github: "alicej",
      }),
    },
  });

  const user2Password = await bcrypt.hash("User123!", 10);
  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash: user2Password,
      role: Role.Viewer,
      username: "bob",
      displayName: "Bob Smith",
      bio: "Passionate about TypeScript and modern web frameworks.",
      headline: "Senior Software Engineer",
      location: "New York, NY",
      isVerified: true,
    },
  });

  console.log("Created users:");
  console.log(`  - alice@example.com (password: User123!)`);
  console.log(`  - bob@example.com (password: User123!)`);

  // Create articles
  const article1 = await prisma.article.create({
    data: {
      title: "Getting Started with TypeScript",
      summary: "A comprehensive guide to TypeScript for developers new to typed JavaScript. Learn the basics of types, interfaces, and how to set up your first TypeScript project.",
      content: "TypeScript is a powerful superset of JavaScript that adds static type definitions. This article will walk you through the fundamentals, including setting up your development environment, understanding basic types, and exploring advanced features like generics and decorators.\n\nWhether you're coming from JavaScript or another typed language, TypeScript offers a smooth learning curve while providing the safety and tooling benefits of static typing.",
      publishedAt: new Date("2024-01-15"),
      authorId: admin.id,
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: "Building RESTful APIs with Express",
      summary: "Learn how to create production-ready REST APIs using Express.js. This tutorial covers routing, middleware, error handling, and best practices for API design.",
      content: "Express.js is one of the most popular web frameworks for Node.js, making it easy to build robust RESTful APIs. In this guide, we'll explore how to structure your API, implement proper error handling, use middleware effectively, and follow REST principles.\n\nWe'll also cover security considerations, validation, and how to test your API endpoints to ensure reliability and maintainability.",
      publishedAt: new Date("2024-01-20"),
      authorId: user1.id,
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: "Modern Frontend Development with Nuxt",
      summary: "Discover how Nuxt.js simplifies Vue.js development with server-side rendering, file-based routing, and automatic code splitting. Perfect for building fast, SEO-friendly web applications.",
      content: "Nuxt.js takes the complexity out of building Vue.js applications by providing conventions and structure out of the box. This article explores the core features of Nuxt, including server-side rendering (SSR), static site generation (SSG), and the powerful module ecosystem.\n\nYou'll learn how to set up a new Nuxt project, organize your code, work with pages and layouts, and deploy your application to various hosting platforms.",
      publishedAt: new Date("2024-01-25"),
      authorId: user2.id,
    },
  });

  const article4 = await prisma.article.create({
    data: {
      title: "Understanding Prisma ORM",
      summary: "A deep dive into Prisma, the next-generation ORM for Node.js and TypeScript. Learn how to model your database, write type-safe queries, and handle migrations.",
      content: "Prisma is a modern database toolkit that makes database access easy with type safety and auto-completion. In this article, we'll explore Prisma's key features, including its schema definition language, migration system, and query API.\n\nWe'll also discuss best practices for using Prisma in production applications and how it compares to other ORMs.",
      publishedAt: new Date("2024-02-01"),
      authorId: user1.id,
    },
  });

  console.log("Created 4 articles");

  // Create likes
  await prisma.like.createMany({
    data: [
      { userId: user1.id, articleId: article1.id },
      { userId: user2.id, articleId: article1.id },
      { userId: admin.id, articleId: article2.id },
      { userId: user2.id, articleId: article2.id },
      { userId: user1.id, articleId: article3.id },
      { userId: admin.id, articleId: article3.id },
    ],
  });

  console.log("Created likes");

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        userId: user1.id,
        articleId: article1.id,
        content: "Great introduction to TypeScript! This really helped me understand the basics.",
      },
      {
        userId: user2.id,
        articleId: article1.id,
        content: "Thanks for sharing. I've been meaning to learn TypeScript.",
      },
      {
        userId: admin.id,
        articleId: article2.id,
        content: "Excellent guide on Express APIs. Very comprehensive!",
      },
    ],
  });

  console.log("Created comments");

  // Create bookmarks
  await prisma.bookmark.createMany({
    data: [
      { userId: user1.id, articleId: article3.id },
      { userId: user2.id, articleId: article1.id },
      { userId: admin.id, articleId: article4.id },
    ],
  });

  console.log("Created bookmarks");

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user1.id, followingId: admin.id },
      { followerId: user2.id, followingId: admin.id },
    ],
  });

  console.log("Created follows");

  // Update user stats
  await Promise.all([
    prisma.user.update({
      where: { id: admin.id },
      data: {
        articlesCount: 1,
        followersCount: 2,
        followingCount: 0,
      },
    }),
    prisma.user.update({
      where: { id: user1.id },
      data: {
        articlesCount: 2,
        followersCount: 1,
        followingCount: 2,
      },
    }),
    prisma.user.update({
      where: { id: user2.id },
      data: {
        articlesCount: 1,
        followersCount: 1,
        followingCount: 2,
      },
    }),
  ]);

  console.log("Updated user stats");

  // Create some activity logs
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, type: "article_created", entityId: article1.id },
      { userId: user1.id, type: "article_created", entityId: article2.id },
      { userId: user1.id, type: "article_liked", entityId: article1.id },
      { userId: user1.id, type: "comment_added", entityId: article1.id },
      { userId: user1.id, type: "user_followed", entityId: user2.id },
    ],
  });

  console.log("Created activity logs");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
