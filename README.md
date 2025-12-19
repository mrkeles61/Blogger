# Bilfen Blog - Monorepo

A production-like monorepo containing three applications:
- **Backend**: Node.js API with Express + TypeScript
- **Web**: Nuxt 2 web application with TailwindCSS
- **Mobile**: React Native app using Expo + TypeScript

## Directory Structure

```
bilfen-blog/
├── backend/                 # Node.js API (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── routes/
│   │   │   └── articles.ts # Article routes
│   │   ├── services/
│   │   │   └── articlesService.ts # Business logic
│   │   ├── lib/
│   │   │   ├── prisma.ts   # Prisma client
│   │   │   └── validation.ts # Zod schemas
│   │   └── middleware/
│   │       └── errorHandler.ts # Error handling
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── web/                     # Nuxt 2 web app
│   ├── pages/
│   │   ├── index.vue       # Home page
│   │   ├── articles/
│   │   │   ├── _id.vue     # Article detail
│   │   │   ├── _id/
│   │   │   │   └── edit.vue # Edit article
│   │   │   └── new.vue     # Create article
│   │   └── reading-list.vue
│   ├── layouts/
│   │   └── default.vue
│   ├── utils/
│   │   └── api.ts          # API client
│   ├── package.json
│   ├── nuxt.config.js
│   ├── tsconfig.json
│   └── tailwind.config.js
├── mobile/                  # React Native (Expo)
│   ├── screens/
│   │   ├── ArticleListScreen.tsx
│   │   └── ArticleDetailScreen.tsx
│   ├── services/
│   │   └── api.ts          # API client
│   ├── config/
│   │   └── api.ts          # API configuration
│   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   └── babel.config.js
├── package.json             # Root workspace config
├── .prettierrc
├── .prettierignore
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- For mobile app: Expo CLI (`npm install -g expo-cli`) or Expo Go app on your device

## Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (backend, web, mobile).

### 2. Backend Setup

```bash
cd backend

# Copy environment file template
cp .env.example .env

# Edit .env and set JWT_SECRET (required for authentication)
# Example: JWT_SECRET=your-super-secret-key-change-in-production

# Run database migrations (creates SQLite database)
npm run prisma:migrate

# Seed the database with sample articles and admin user
npm run prisma:seed

# Start the development server
npm run dev
```

The backend will start on `http://localhost:4000` (or the PORT specified in `.env`).

**Required Environment Variables:**
- `JWT_SECRET` - Secret key for signing JWTs (required)
- `DATABASE_URL` - Database connection string (default: `file:./dev.db` for SQLite)
- `PORT` - Server port (default: 4000)
- `SESSION_COOKIE_NAME` - Cookie name for auth token (default: `auth_token`)
- `ADMIN_EMAIL` - Admin email for seeding (default: `admin@example.com`)
- `ADMIN_PASSWORD` - Admin password for seeding (default: `Admin123!`)
- `PUBLISH_SCHEDULER_INTERVAL` - Interval in milliseconds for scheduled article publishing (default: 60000 = 1 minute)

**Database Configuration:**
- Default: SQLite database at `backend/prisma/dev.db`
- To use PostgreSQL: Update `DATABASE_URL` in `.env` to `postgresql://user:password@localhost:5432/bilfen_blog?schema=public`

**Available endpoints:**

Public endpoints:
- `GET /health` - Health check (returns `{ "ok": true }`)
- `GET /api/articles?query=search&authorId=id&status=Published&tags=tag1,tag2&dateFrom=date&dateTo=date&sort=recent|popular&page=1&limit=20` - Get articles with advanced filtering
- `GET /api/articles/:id?preview=true` - Get article by ID (preview mode for drafts)
- `GET /api/search/suggestions?q=query` - Get search suggestions (articles and authors)

Protected endpoints (require authentication):
- `POST /api/articles` - Create new article with status (Draft/Published/Scheduled) and scheduledFor date
- `GET /api/articles/my` - Get current user's articles (including drafts)
- `PUT /api/articles/:id` - Update article with status and scheduledFor (owner, Admin, or Editor only)
- `DELETE /api/articles/:id` - Delete article (owner or Admin only)

User endpoints:
- `GET /api/users` - List users (with search/pagination)
- `GET /api/users/:id` - Get user profile (by ID or username)
- `GET /api/users/:id/articles` - Get user's articles
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get users that this user follows
- `PUT /api/users/:id` - Update profile (self or Admin only)

Social endpoints:
- `POST /api/articles/:id/like` - Like an article
- `DELETE /api/articles/:id/like` - Unlike an article
- `GET /api/articles/:id/likes` - Get article likes
- `GET /api/articles/:id/liked` - Check if current user liked
- `POST /api/articles/:id/comments` - Add comment (supports parentId for nested replies)
- `GET /api/articles/:id/comments` - Get article comments (with nested replies)
- `GET /api/comments/:id/replies` - Get comment replies
- `PUT /api/comments/:id` - Update comment (owner only)
- `DELETE /api/comments/:id` - Delete comment (owner or Admin)
- `POST /api/articles/:id/bookmark` - Bookmark article
- `DELETE /api/articles/:id/bookmark` - Remove bookmark
- `GET /api/bookmarks` - Get current user's bookmarks
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/following-status` - Check if following

Collaboration endpoints:
- `POST /api/articles/:id/collaborators` - Add collaborator to article (owner/Admin only)
- `DELETE /api/articles/:id/collaborators/:userId` - Remove collaborator (owner/Admin only)
- `GET /api/articles/:id/collaborators` - Get article collaborators

Analytics endpoints:
- `GET /api/analytics/articles` - Get top articles by views/likes/comments (Admin only)
- `GET /api/analytics/user/:id` - Get user analytics (views, likes, followers, article counts)
- `GET /api/analytics/activity?days=30` - Get activity summary (daily article/comments/likes)

Moderation endpoints:
- `POST /api/reports` - Submit a report (Article or Comment)
- `GET /api/moderation/reports?status=Open&page=1` - Get reports (Admin only)
- `PUT /api/moderation/reports/:id` - Update report status and resolution notes (Admin only)
- `GET /api/moderation/audit` - Get moderation audit trail (Admin only)

Feed & Notifications:
- `GET /api/feed` - Get activity feed (from followed users)
- `GET /api/feed/notifications` - Get user notifications
- `PUT /api/feed/notifications/:id/read` - Mark notification as read
- `PUT /api/feed/notifications/read-all` - Mark all as read

Authentication endpoints:
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (clears session cookie)
- `GET /api/auth/me` - Get current user info

### 3. Web App Setup

```bash
cd web
npm run dev
```

The web app will start on `http://localhost:3000` (default Nuxt port).

**Available pages:**
- `/` - Home page with article list, search functionality, and "New Article" button
- `/search` - Advanced search page with filters (author, date range, sort) and autocomplete suggestions
- `/articles/:id` - Article detail page with author card, likes, comments (with nested replies), bookmarks, report button, and edit/delete actions
- `/articles/:id/edit` - Edit article form with status (Draft/Published/Scheduled) and scheduled date picker (owner, Admin, or Editor only)
- `/articles/new` - Create new article form with status dropdown and scheduled date picker (authenticated users)
- `/dashboard` - Author dashboard with analytics (total articles, views, likes, followers, activity charts)
- `/dashboard/articles` - Article management page with tabs for Drafts, Scheduled, and Published articles
- `/dashboard/moderation` - Admin moderation panel for managing reports (auth + admin middleware required)
- `/users/:id` - User profile page with articles, stats, follow button
- `/users/:id/edit` - Edit profile form (self or Admin only)
- `/feed` - Activity feed showing actions from followed users
- `/bookmarks` - User's saved articles
- `/notifications` - User notifications (includes collaborator invites, mentions, comment replies)
- `/login` - Login page

**Environment Variables:**
- `NUXT_PUBLIC_API_BASE` - Backend API base URL (default: `http://localhost:4000`)

### 4. Mobile App Setup

```bash
cd mobile
npm run dev
```

This will start the Expo development server. You can then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app on your physical device

**API Configuration:**
The mobile app's API base URL is configured in `mobile/config/api.ts`:
- Android emulator: `http://10.0.2.2:4000` (default)
- iOS simulator: `http://localhost:4000`
- Physical device: Update to your computer's IP address

**Screens:**
- `ArticleListScreen` - Default screen with search and "Load Articles" button
- `ArticleDetailScreen` - Article detail view (navigate from list)

## Scripts

### Root Level

```bash
npm run dev:backend    # Start backend in dev mode
npm run dev:web        # Start web app in dev mode
npm run dev:mobile     # Start mobile app in dev mode
npm run build:backend  # Build backend
npm run build:web      # Build web app
npm run build:mobile   # Build mobile app
```

### Individual Workspaces

Each workspace has its own scripts (see respective `package.json` files).

## Development Notes

### Current Status

**Backend:**
- ✅ Express.js API with TypeScript
- ✅ Prisma ORM with SQLite (easy to switch to PostgreSQL)
- ✅ Full CRUD operations for articles
- ✅ Article status workflow (Draft, Published, Scheduled)
- ✅ Scheduled publishing with background job
- ✅ Advanced search with filtering (query, author, status, tags, date range, sort)
- ✅ Search suggestions endpoint
- ✅ Article views tracking
- ✅ Analytics endpoints (top articles, user metrics, activity summaries)
- ✅ Collaboration features (co-authors, reviewers)
- ✅ Nested/threaded comments with @mentions
- ✅ Reporting and moderation system
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Production-ready middleware (Helmet, CORS, rate limiting)
- ✅ Database seeding with sample articles

**Frontend:**
- ✅ Nuxt 2 with TypeScript
- ✅ TailwindCSS styling
- ✅ Full CRUD interface
- ✅ Article status badges (Draft, Scheduled, Featured)
- ✅ Article creation/editing with status dropdown and scheduled date picker
- ✅ Dashboard pages (analytics, article management, moderation)
- ✅ Advanced search page with filters and autocomplete
- ✅ Nested comment threads with reply functionality
- ✅ Report buttons for articles and comments
- ✅ Route guards (auth, admin middleware)
- ✅ Error handling and validation display
- ✅ Loading and error states

### Code Formatting

The project uses Prettier for consistent code formatting. Configuration is at the root level (`.prettierrc`).

## Authentication

The application uses JWT-based authentication with HTTP-only cookies. Only authenticated admin users can create, update, or delete articles.

### Default Admin Credentials

After running the seed script, you can log in with:
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

You can override these in the `.env` file using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Login via API

```bash
# Login (returns user info and sets HTTP-only cookie)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}' \
  -c cookies.txt

# Check current user
curl http://localhost:4000/api/auth/me -b cookies.txt

# Create article (requires authentication)
curl -X POST http://localhost:4000/api/articles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Article",
    "summary": "This is a test article summary that meets the minimum length requirement.",
    "content": "This is the full content of the test article."
  }'

# Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt -c cookies.txt
```

### Login via Web Interface

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials
3. You'll be redirected to the home page
4. Create/Edit/Delete buttons will now be visible

## Testing Connectivity

### Backend

Test the health endpoint:
```bash
curl http://localhost:4000/health
# Should return: {"ok":true}
```

Test authentication:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}'
```

Test validation (should return 422):
```bash
curl -X POST http://localhost:4000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title": "Short"}'
# Should return 401 (unauthorized) or 422 (if authenticated but invalid data)
```

### Web App

The home page (`/`) automatically loads and displays all articles. You can:
- Search articles using the search box
- View article details by clicking on any article
- **Authenticated admin users can:**
  - Click "New Article" to create an article
  - Edit or delete articles from the detail page
- **Unauthenticated users:** Create/Edit/Delete buttons are hidden, and protected endpoints return 401/403 errors

### Mobile App
Press the "Load Articles" button on the `ArticleListScreen` to test API connectivity. The response will be displayed as formatted JSON.

## Architecture

The project uses a clean separation of concerns:

**Backend (`backend/`):**
- `src/index.ts` - Main Express server setup
- `src/routes/articles.ts` - Article route handlers
- `src/services/articlesService.ts` - Business logic and database operations
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/validation.ts` - Zod validation schemas
- `src/middleware/errorHandler.ts` - Error handling middleware
- `prisma/schema.prisma` - Database schema definition

**Frontend (`web/`):**
- `pages/` - Nuxt file-based routing (Vue components)
- `utils/api.ts` - API client with TypeScript types
- `layouts/default.vue` - Default page layout

## Features

### Drafts, Publishing Workflow & Scheduling

- **Article Status**: Articles can be Draft, Published, or Scheduled
- **Scheduled Publishing**: Articles can be scheduled for future publication. The backend includes a scheduler job that automatically publishes scheduled articles when their `scheduledFor` date arrives
- **Permission Controls**: Only Admin and Editor roles can publish or schedule articles directly. Regular authors can save drafts
- **Preview Mode**: Article owners and admins can preview draft/scheduled articles using `?preview=true` query parameter
- **Status Filtering**: Article lists support filtering by status. Public users only see Published articles
- **Dashboard**: `/dashboard/articles` page shows all user articles with tabs for Drafts, Scheduled, and Published

### Advanced Search & Filters

- **Full-text Search**: Search across article titles, summaries, and content
- **Advanced Filters**: Filter by author, status, tags, date range, and sort by recent/popular
- **Search Suggestions**: `/api/search/suggestions` endpoint provides autocomplete suggestions for articles and authors
- **Search Page**: Dedicated `/search` page with filter UI and active filter summary

### Analytics & Dashboards

- **Views Tracking**: Article views are automatically tracked (excluding owner views)
- **User Analytics**: `/dashboard` shows author metrics:
  - Total articles (with breakdown by status)
  - Total views
  - Total likes
  - Followers (with 30-day gain)
  - Activity charts for last 30 days
- **Admin Analytics**: Admin-only endpoints for global statistics and moderation queue
- **Activity Summary**: Daily summaries of article creation, comments, and likes

### Collaboration & Mentions

- **Article Collaborators**: Articles can have co-authors and reviewers
  - Co-authors can edit article content
  - Reviewers can comment and leave notes
- **Collaborator Management**: Invite/remove collaborators via `/api/articles/:id/collaborators` endpoints
- **Nested Comments**: Comments support threaded replies using `parentId`
- **@Mentions**: When a comment contains `@username`, notifications are automatically created for mentioned users
- **Notifications**: System tracks collaborator invites, mentions, and comment replies

### Moderation & Reporting

- **Content Reporting**: Users can report articles or comments with a reason
- **Report Types**: Reports can be for Articles or Comments
- **Report Status**: Reports flow through Open → InReview → Resolved states
- **Moderation Panel**: Admin-only `/dashboard/moderation` page for managing reports
- **Audit Trail**: All moderation actions are logged with timestamps and admin notes
- **Integration**: Reports integrate with notifications and analytics

### Scheduled Publishing

The backend includes a scheduled publishing service that runs automatically when the server is running. It checks for scheduled articles whose `scheduledFor` date has passed and publishes them.

**Running the Scheduler:**
- The scheduler runs automatically via `setInterval` when the backend server starts
- Interval is configurable via `PUBLISH_SCHEDULER_INTERVAL` environment variable (default: 60000ms = 1 minute)
- For production, consider using a proper job queue system (e.g., Bull, Agenda) instead

**Manual Publishing:**
You can also manually trigger scheduled publishing by calling the `publishDueArticles()` function from `src/services/publishScheduler.ts`.

## Next Steps

1. Implement image uploads
2. Add reading list functionality
3. Set up production deployment configurations
4. Add API documentation (Swagger/OpenAPI)
5. Enhance mention autocomplete in comment editor
6. Add collaborator invite notifications UI
7. Implement article collaboration editing UI

