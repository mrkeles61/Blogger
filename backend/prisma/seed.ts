import { PrismaClient } from "@prisma/client";
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
      role: "Admin",
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
      role: "Viewer",
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
      role: "Viewer",
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

  // Create articles (20 total)
  const articleTitles = [
    "Getting Started with TypeScript",
    "Building RESTful APIs with Express",
    "Modern Frontend Development with Nuxt",
    "Understanding Prisma ORM",
    "Introduction to Vue.js 3 Composition API",
    "CSS Grid vs Flexbox: When to Use Which",
    "JavaScript Async/Await Best Practices",
    "Docker for Beginners: Containerization Made Easy",
    "GraphQL vs REST: Choosing the Right API",
    "Web Security Essentials: OWASP Top 10",
    "Progressive Web Apps: The Future of Web",
    "State Management in React: Redux vs Context",
    "Microservices Architecture Patterns",
    "CI/CD Pipeline Setup with GitHub Actions",
    "Database Design Principles and Normalization",
    "Node.js Performance Optimization Tips",
    "Responsive Design with Tailwind CSS",
    "API Rate Limiting Strategies",
    "Testing Strategies for Full-Stack Applications",
    "Deploying Applications to Cloud Platforms",
  ];

  const articleSummaries = [
    "A comprehensive guide to TypeScript for developers new to typed JavaScript.",
    "Learn how to create production-ready REST APIs using Express.js.",
    "Discover how Nuxt.js simplifies Vue.js development with SSR and routing.",
    "A deep dive into Prisma, the next-generation ORM for Node.js.",
    "Explore the powerful Composition API in Vue.js 3 for better code organization.",
    "Understanding when to use CSS Grid and when Flexbox is the better choice.",
    "Master async/await patterns and avoid common pitfalls in JavaScript.",
    "Learn containerization basics and how Docker simplifies deployment.",
    "Compare GraphQL and REST APIs to make informed architectural decisions.",
    "Essential security practices every web developer should know.",
    "Build fast, reliable web apps that work offline with PWA technologies.",
    "Compare Redux and Context API for managing application state.",
    "Explore patterns for building scalable microservices architectures.",
    "Automate your development workflow with GitHub Actions.",
    "Learn database design fundamentals and normalization techniques.",
    "Optimize Node.js applications for better performance and scalability.",
    "Create beautiful responsive layouts quickly with Tailwind CSS utilities.",
    "Implement effective rate limiting to protect your APIs from abuse.",
    "Comprehensive testing strategies for both frontend and backend code.",
    "Deploy applications to AWS, Azure, or Google Cloud with confidence.",
  ];

  const articleContents = [
    "TypeScript is a powerful superset of JavaScript that adds static type definitions. This article will walk you through the fundamentals, including setting up your development environment, understanding basic types, and exploring advanced features like generics and decorators.\n\nWhether you're coming from JavaScript or another typed language, TypeScript offers a smooth learning curve while providing the safety and tooling benefits of static typing.",
    "Express.js is one of the most popular web frameworks for Node.js, making it easy to build robust RESTful APIs. In this guide, we'll explore how to structure your API, implement proper error handling, use middleware effectively, and follow REST principles.\n\nWe'll also cover security considerations, validation, and how to test your API endpoints to ensure reliability and maintainability.",
    "Nuxt.js takes the complexity out of building Vue.js applications by providing conventions and structure out of the box. This article explores the core features of Nuxt, including server-side rendering (SSR), static site generation (SSG), and the powerful module ecosystem.\n\nYou'll learn how to set up a new Nuxt project, organize your code, work with pages and layouts, and deploy your application to various hosting platforms.",
    "Prisma is a modern database toolkit that makes database access easy with type safety and auto-completion. In this article, we'll explore Prisma's key features, including its schema definition language, migration system, and query API.\n\nWe'll also discuss best practices for using Prisma in production applications and how it compares to other ORMs.",
    "Vue 3's Composition API provides a more flexible way to organize component logic. Learn how to use setup(), ref(), reactive(), and composables to write cleaner, more maintainable code.\n\nWe'll cover real-world examples and migration strategies from Options API to Composition API.",
    "Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes. Grid excels at two-dimensional layouts, while Flexbox is perfect for one-dimensional alignment.\n\nThis article will help you understand when to use each and how to combine them effectively.",
    "Async/await makes asynchronous code more readable, but there are common mistakes to avoid. Learn about error handling, parallel execution, and performance considerations.\n\nWe'll cover Promise.all(), Promise.race(), and best practices for handling multiple async operations.",
    "Docker containers package applications with their dependencies, making deployment consistent across environments. Learn Docker basics, Dockerfile creation, and container orchestration.\n\nWe'll also cover Docker Compose for multi-container applications and best practices for production use.",
    "GraphQL provides a flexible query language for APIs, while REST follows a more structured approach. Compare their strengths, weaknesses, and use cases.\n\nLearn when GraphQL's flexibility is worth the added complexity and when REST might be the better choice.",
    "The OWASP Top 10 lists the most critical web application security risks. Learn how to prevent injection attacks, broken authentication, sensitive data exposure, and more.\n\nWe'll provide practical examples and mitigation strategies for each vulnerability.",
    "PWAs combine the best of web and mobile apps. Learn about service workers, web app manifests, and offline functionality.\n\nDiscover how to make your web app installable, work offline, and provide a native-like experience.",
    "State management is crucial for complex React applications. Compare Redux's centralized store with Context API's simplicity.\n\nLearn when to use each approach and how to implement them effectively in your projects.",
    "Microservices break applications into small, independent services. Explore patterns like API Gateway, Service Mesh, and Event-Driven Architecture.\n\nLearn about the benefits, challenges, and when microservices make sense for your project.",
    "GitHub Actions automates workflows directly in your repository. Learn how to set up CI/CD pipelines for testing, building, and deploying.\n\nWe'll cover workflow syntax, secrets management, and best practices for automation.",
    "Good database design is crucial for application performance. Learn about normalization, indexing, relationships, and query optimization.\n\nWe'll cover common design patterns and anti-patterns to avoid.",
    "Node.js performance depends on many factors. Learn about event loop optimization, memory management, clustering, and caching strategies.\n\nDiscover tools for profiling and monitoring Node.js applications in production.",
    "Tailwind CSS provides utility classes for rapid UI development. Learn how to use its responsive design features, custom configuration, and component patterns.\n\nWe'll cover best practices for maintaining large Tailwind projects.",
    "Rate limiting protects APIs from abuse and ensures fair resource usage. Learn about different rate limiting algorithms and implementation strategies.\n\nWe'll cover token bucket, sliding window, and distributed rate limiting approaches.",
    "Testing ensures code quality and prevents regressions. Learn about unit tests, integration tests, E2E tests, and testing best practices.\n\nWe'll cover testing frameworks, mocking strategies, and how to write maintainable test suites.",
    "Cloud deployment can be complex. Learn about different cloud providers, deployment strategies, and infrastructure as code.\n\nWe'll cover container orchestration, serverless options, and cost optimization strategies.",
  ];

  const authors = [admin, user1, user2];
  const statuses: ("Draft" | "Published" | "Scheduled")[] = ["Draft", "Published", "Scheduled"];
  const articles = [];

  for (let i = 0; i < 20; i++) {
    const author = authors[i % authors.length];
    const status = statuses[i % statuses.length];
    const publishedAt = status === "Published" ? new Date(2024, 0, 15 + i) : null;
    const scheduledFor = status === "Scheduled" ? new Date(2024, 11, 15 + i) : null;

    const article = await prisma.article.create({
      data: {
        title: articleTitles[i],
        summary: articleSummaries[i],
        content: articleContents[i],
        status: status,
        publishedAt: publishedAt,
        scheduledFor: scheduledFor,
        authorId: author.id,
        views: Math.floor(Math.random() * 1000),
        isFeatured: i < 3, // First 3 articles are featured
      },
    });
    articles.push(article);
  }

  console.log(`Created ${articles.length} articles`);

  // Create likes for articles
  const likesData = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    // Each article gets 2-5 random likes
    const numLikes = Math.floor(Math.random() * 4) + 2;
    const likers = [admin, user1, user2].sort(() => Math.random() - 0.5).slice(0, numLikes);
    for (const liker of likers) {
      likesData.push({ userId: liker.id, articleId: article.id });
    }
  }
  await prisma.like.createMany({ data: likesData });

  console.log("Created likes");

  // Create comments for articles
  const commentsData = [];
  const commentTemplates = [
    "Great article! This really helped me understand the topic better.",
    "Thanks for sharing. I've been meaning to learn about this.",
    "Excellent guide. Very comprehensive and well-written!",
    "This is exactly what I needed. Keep up the good work!",
    "I have a question about one of the points mentioned. Can you clarify?",
    "Really insightful content. Looking forward to more articles like this.",
    "I've tried this approach and it works great. Thanks for the tip!",
    "This article cleared up a lot of confusion I had. Much appreciated!",
  ];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    // Each article gets 1-3 random comments
    const numComments = Math.floor(Math.random() * 3) + 1;
    const commenters = [admin, user1, user2].sort(() => Math.random() - 0.5).slice(0, numComments);
    for (const commenter of commenters) {
      commentsData.push({
        userId: commenter.id,
        articleId: article.id,
        content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
      });
    }
  }
  await prisma.comment.createMany({ data: commentsData });

  console.log("Created comments");

  // Create bookmarks for articles
  const bookmarksData = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    // Random users bookmark random articles
    if (Math.random() > 0.5) {
      const bookmarker = [admin, user1, user2][Math.floor(Math.random() * 3)];
      bookmarksData.push({ userId: bookmarker.id, articleId: article.id });
    }
  }
  await prisma.bookmark.createMany({ data: bookmarksData });

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

  // Update user stats based on actual data
  const adminArticles = articles.filter((a) => a.authorId === admin.id).length;
  const user1Articles = articles.filter((a) => a.authorId === user1.id).length;
  const user2Articles = articles.filter((a) => a.authorId === user2.id).length;

  await Promise.all([
    prisma.user.update({
      where: { id: admin.id },
      data: {
        articlesCount: adminArticles,
        followersCount: 2,
        followingCount: 0,
      },
    }),
    prisma.user.update({
      where: { id: user1.id },
      data: {
        articlesCount: user1Articles,
        followersCount: 1,
        followingCount: 2,
      },
    }),
    prisma.user.update({
      where: { id: user2.id },
      data: {
        articlesCount: user2Articles,
        followersCount: 1,
        followingCount: 2,
      },
    }),
  ]);

  console.log("Updated user stats");

  // Create activity logs for all articles and interactions
  const activityLogsData = [];
  for (const article of articles) {
    activityLogsData.push({
      userId: article.authorId,
      type: "article_created",
      entityId: article.id,
    });
  }
  // Add some likes and comments activities
  for (let i = 0; i < Math.min(10, likesData.length); i++) {
    const like = likesData[i];
    activityLogsData.push({
      userId: like.userId,
      type: "article_liked",
      entityId: like.articleId,
    });
  }
  for (let i = 0; i < Math.min(10, commentsData.length); i++) {
    const comment = commentsData[i];
    activityLogsData.push({
      userId: comment.userId,
      type: "comment_added",
      entityId: comment.articleId,
    });
  }
  await prisma.activityLog.createMany({ data: activityLogsData });

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
