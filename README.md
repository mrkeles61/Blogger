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

**Database Configuration:**
- Default: SQLite database at `backend/prisma/dev.db`
- To use PostgreSQL: Update `DATABASE_URL` in `.env` to `postgresql://user:password@localhost:5432/bilfen_blog?schema=public`

**Available endpoints:**

Public endpoints:
- `GET /health` - Health check (returns `{ "ok": true }`)
- `GET /api/articles?search=query` - Get all articles (with optional search)
- `GET /api/articles/:id` - Get article by ID

Protected endpoints (require authentication):
- `POST /api/articles` - Create new article (any authenticated user)
- `GET /api/articles/my` - Get current user's articles (including drafts)
- `PUT /api/articles/:id` - Update article (owner or Admin only)
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
- `POST /api/articles/:id/comments` - Add comment
- `GET /api/articles/:id/comments` - Get article comments
- `PUT /api/comments/:id` - Update comment (owner only)
- `DELETE /api/comments/:id` - Delete comment (owner or Admin)
- `POST /api/articles/:id/bookmark` - Bookmark article
- `DELETE /api/articles/:id/bookmark` - Remove bookmark
- `GET /api/bookmarks` - Get current user's bookmarks
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/following-status` - Check if following

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
- `/articles/:id` - Article detail page with author card, likes, comments, bookmarks, and edit/delete actions
- `/articles/:id/edit` - Edit article form (pre-filled with existing data, owner or Admin only)
- `/articles/new` - Create new article form (authenticated users)
- `/users/:id` - User profile page with articles, stats, follow button
- `/users/:id/edit` - Edit profile form (self or Admin only)
- `/feed` - Activity feed showing actions from followed users
- `/bookmarks` - User's saved articles
- `/notifications` - User notifications
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
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Production-ready middleware (Helmet, CORS, rate limiting)
- ✅ Database seeding with sample articles

**Frontend:**
- ✅ Nuxt 2 with TypeScript
- ✅ TailwindCSS styling
- ✅ Full CRUD interface
- ✅ Article list with search
- ✅ Create/Edit/Delete article forms
- ✅ Error handling and validation display
- ✅ Loading and error states

### Not Yet Implemented

- Authentication and authorization
- Image uploads
- Reading list functionality
- Advanced search/filtering
- Pagination

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

## Next Steps

1. Add authentication and authorization
2. Implement image uploads
3. Add reading list functionality
4. Implement pagination for article list
5. Add advanced search/filtering options
6. Set up production deployment configurations
7. Add API documentation (Swagger/OpenAPI)

