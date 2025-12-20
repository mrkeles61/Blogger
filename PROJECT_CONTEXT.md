# Bilfen Blog - Project Context

## Overview

Bilfen Blog is a full-stack blog platform built as a monorepo with three applications:
- **Backend**: Node.js API (Express + TypeScript + Prisma + SQLite)
- **Web**: Nuxt 2 web application (Nuxt 2 + TypeScript + TailwindCSS)
- **Mobile**: React Native app (Expo + TypeScript) - **Not actively developed unless explicitly requested**

The project is feature-complete with authentication, full CRUD operations, social features (likes, comments, bookmarks, follows), analytics, collaboration, moderation, and scheduled publishing.

## Tech Stack

### Backend (`backend/`)
- **Runtime**: Node.js 18+ with Express.js 4.18.2
- **Language**: TypeScript 5.3.3 (strict mode)
- **ORM**: Prisma 5.7.1 with SQLite (easily switchable to PostgreSQL)
- **Database**: SQLite (`backend/prisma/dev.db`) by default
- **Validation**: Zod 3.22.4
- **Auth**: JWT (jsonwebtoken) with httpOnly cookies
- **Security**: Helmet, CORS, express-rate-limit
- **Password**: bcryptjs for hashing
- **Dev Tool**: tsx for hot-reload

### Frontend (`web/`)
- **Framework**: Nuxt 2.17.3 (NOT Nuxt 3)
- **Language**: TypeScript with standard Options API (Vue.extend style)
- **Styling**: TailwindCSS via @nuxtjs/tailwindcss
- **State Management**: Vuex (standard Nuxt module format, NOT vuex-module-decorators)
- **HTTP Client**: Fetch API with custom wrapper (`utils/api.ts`)

### Package Management
- npm workspaces (root-level orchestration)
- Prettier for code formatting (root-level config)

## Backend Features

### Authentication & Authorization
- JWT-based authentication with httpOnly cookies
- Role-based access control (Admin, Editor, Viewer)
- Cookie configuration supports both localhost and 127.0.0.1 in development
- **Routes**: `backend/src/routes/auth.ts`
- **Middleware**: `backend/src/middleware/auth.ts` (authenticate, requireRole)

### Articles CRUD
- Full CRUD operations for articles
- Status workflow: Draft, Published, Scheduled
- Scheduled publishing via background job (setInterval-based, needs job queue for production)
- Article views tracking (excluding owner views)
- Preview mode for drafts (`?preview=true`)
- Advanced filtering (search, author, status, tags, date range, sort)
- **Routes**: `backend/src/routes/articles.ts`
- **Service**: `backend/src/services/articlesService.ts`

### Social Features
- **Likes**: Like/unlike articles, check liked status
- **Comments**: Nested/threaded comments with @mentions support
- **Bookmarks**: Save articles for later reading
- **Follow**: Follow/unfollow users
- **Routes**: `backend/src/routes/social.ts`
- **Service**: `backend/src/services/socialService.ts`

### Users & Profiles
- User profiles with bio, avatar, location, website, headline
- User search and pagination
- Follower/following counts
- User article lists (with draft visibility control)
- **Routes**: `backend/src/routes/users.ts`
- **Service**: `backend/src/services/usersService.ts`

### Collaboration
- Article collaborators (CoAuthor, Reviewer roles)
- Invite/remove collaborators
- Co-authors can edit, reviewers can comment
- **Routes**: `backend/src/routes/collaboration.ts`
- **Service**: `backend/src/services/collaborationService.ts`

### Analytics
- Top articles by views/likes/comments
- User analytics (views, likes, followers, article counts)
- Activity summaries (daily article/comments/likes)
- **Routes**: `backend/src/routes/analytics.ts`
- **Service**: `backend/src/services/analyticsService.ts`

### Moderation & Reporting
- Report articles or comments with reasons
- Report status workflow: Open → InReview → Resolved
- Moderation audit trail
- Admin-only moderation panel
- **Routes**: `backend/src/routes/moderation.ts`
- **Service**: `backend/src/services/moderationService.ts`

### Feed & Notifications
- Activity feed from followed users
- Notifications for likes, comments, follows, mentions, collaborator invites
- Mark notifications as read (single or all)
- **Routes**: `backend/src/routes/feed.ts`
- **Service**: `backend/src/services/activityService.ts`

### Search
- Full-text search across titles, summaries, content
- Search suggestions endpoint (articles and authors)
- **Routes**: `backend/src/routes/search.ts`

### Scheduled Publishing
- Background scheduler checks for due articles every 5 minutes (configurable)
- Automatically publishes scheduled articles when `scheduledFor` date arrives
- **Service**: `backend/src/services/publishScheduler.ts`
- **Note**: Uses `setInterval` (needs proper job queue for production)

### Database Schema
- **Models**: User, Article, Like, Comment, Bookmark, Follow, Notification, ActivityLog, ArticleCollaborator, ArticleView, Report, ModerationAction
- **Schema**: `backend/prisma/schema.prisma`
- **Migrations**: `backend/prisma/migrations/`
- **Seeding**: `backend/prisma/seed.ts` (creates admin user + 20 diverse articles)

## Frontend Features

### Pages (`web/pages/`)
- `/` - Home page with article list, search, hero carousel
- `/login` - Login page with password show/hide toggle
- `/articles/:id` - Article detail with likes, comments, bookmarks, edit/delete
- `/articles/:id/edit` - Edit article form (status, scheduled date)
- `/articles/new` - Create article form
- `/search` - Advanced search with filters
- `/feed` - Activity feed from followed users
- `/bookmarks` - User's saved articles
- `/notifications` - User notifications
- `/users/:id` - User profile with articles and stats
- `/users/:id/edit` - Edit profile form
- `/dashboard` - Author analytics dashboard
- `/dashboard/articles` - Article management (Drafts, Scheduled, Published tabs)
- `/dashboard/moderation` - Admin moderation panel (Admin only)
- `/reading-list` - Placeholder page (not implemented)

### Components (`web/components/`)
- `ArticleCard` - Article preview card with likes/bookmarks
- `HeroCarousel` - Featured articles carousel
- `LikeButton`, `BookmarkButton`, `FollowButton` - Social action buttons
- `CommentList`, `CommentItem` - Nested comment display
- `NotificationPanel` - Notification dropdown
- `ActivityItem` - Activity log item
- `FloatingToolbar` - Rich text editor toolbar
- `ShimmerPlaceholder` - Loading skeleton
- `SectionHeading`, `AuthorBadge`, `PillButton` - UI components

### Store (`web/store/`)
- `auth.ts` - Authentication state (user, isAuthenticated, isAdmin, isEditor)
- `social.ts` - Social interactions (likes, bookmarks, follows, comments)
- `feed.ts` - Feed and notifications state

### Middleware (`web/middleware/`)
- `auth.ts` - Route protection (redirects to login if not authenticated)
- `admin.ts` - Admin-only route protection

### Plugins (`web/plugins/`)
- `auth.client.ts` - Client-side session restoration on app init
  - Calls `/api/auth/me` to restore session
  - Loads bookmarks after successful auth
  - Runs only on client-side (mode: "client")

### API Client (`web/utils/api.ts`)
- Centralized API client with TypeScript interfaces
- Automatic cookie handling (credentials: "include")
- AbortController for timeouts (browser-only, SSR-safe)
- 12-second timeout for requests
- Error handling with status codes

## Auth Flow

1. **Login**: POST `/api/auth/login` with email/password
   - Backend validates credentials, generates JWT, sets httpOnly cookie
   - Cookie: `auth_token` with httpOnly, SameSite=Lax (dev), Secure=false (dev)

2. **Session Restoration**:
   - `web/plugins/auth.client.ts` runs on app init (client-side only)
   - Calls `store.dispatch("auth/fetchCurrentUser")` which calls `/api/auth/me`
   - Backend validates JWT from cookie, returns user info
   - If 401, auth state is cleared; if success, user is stored in Vuex

3. **Protected Routes**:
   - `web/middleware/auth.ts` checks `store.getters["auth/isAuthenticated"]`
   - If not authenticated, redirects to `/login?redirect=...`
   - Waits up to 3 seconds for auth plugin to restore session
   - Skips during SSR (only client-side check)

4. **Logout**: POST `/api/auth/logout`
   - Backend clears cookie, frontend clears Vuex state

### Cookie Configuration
- **Development**: `secure: false`, `sameSite: "lax"`, no domain (works with localhost and 127.0.0.1)
- **Production**: `secure: true` (HTTPS required), `sameSite: "strict"`, domain from `COOKIE_DOMAIN` env var
- **Path**: `/` (available for all paths)
- **MaxAge**: 24 hours

## Known Issues / Bugs

### Recently Fixed
1. ✅ **Auth persistence on refresh** - Fixed by removing httpOnly cookie check, always calling `/api/auth/me`
   - **Files**: `web/plugins/auth.client.ts`, `web/store/auth.ts`, `web/middleware/auth.ts`
   - **Status**: Resolved

2. ✅ **AbortController SSR error** - Fixed by checking `typeof window !== "undefined"`
   - **File**: `web/utils/api.ts`
   - **Status**: Resolved

3. ✅ **Class-based component decorator errors** - Fixed by converting all components to Options API
   - **Files**: All `.vue` files in `web/`
   - **Status**: Resolved

### Current Issues
1. **Scheduled publishing uses setInterval** - Not production-ready
   - **File**: `backend/src/services/publishScheduler.ts`, `backend/src/index.ts`
   - **Issue**: Should use proper job queue (Bull, Agenda, etc.) for production
   - **Impact**: Low priority for dev, critical for production

2. **asyncHandler wrapper incomplete** - Type inference could be better
   - **File**: `backend/src/middleware/errorHandler.ts`
   - **Issue**: TypeScript types for asyncHandler could be more specific
   - **Impact**: Low (works but could be improved)

3. **Reading list page not implemented** - Placeholder only
   - **File**: `web/pages/reading-list.vue`
   - **Issue**: Page exists but functionality not implemented
   - **Impact**: Low (feature not actively used)

### Potential Issues
1. **Cookie domain in production** - Needs `COOKIE_DOMAIN` env var configured
   - **Files**: `backend/src/routes/auth.ts`
   - **Impact**: Medium (will need configuration for production deployment)

2. **CORS origin configuration** - Currently allows both localhost and 127.0.0.1 in dev
   - **File**: `backend/src/index.ts`
   - **Impact**: Low (dev convenience, production uses single origin)

## Environment & Setup

### Required Environment Variables

#### Backend (`backend/.env`)
```bash
JWT_SECRET=your-secret-key-here                    # REQUIRED
DATABASE_URL=file:./prisma/dev.db                 # Default SQLite
PORT=4000                                          # Default 4000
NODE_ENV=development                               # development or production
CORS_ORIGIN=http://localhost:3000                  # Frontend URL
SESSION_COOKIE_NAME=auth_token                     # Default auth_token
COOKIE_DOMAIN=                                     # Only for production
SCHEDULER_INTERVAL=300000                          # 5 minutes in ms
ADMIN_EMAIL=admin@example.com                      # Seed admin email
ADMIN_PASSWORD=Admin123!                           # Seed admin password
```

#### Web (`web/.env` or `web/.env.local`)
```bash
NUXT_PUBLIC_API_BASE=http://localhost:4000         # Backend API URL
```

### Setup Steps

1. **Install dependencies** (from root):
   ```bash
   npm install
   ```

2. **Backend setup**:
   ```bash
   cd backend
   # Create .env file (copy from .env.example if exists)
   # Set JWT_SECRET (required)
   npm run prisma:generate    # Generate Prisma client
   npm run prisma:migrate     # Run database migrations
   npm run prisma:seed        # Seed database with sample data
   ```

3. **Start development servers** (from root):
   ```bash
   npm run dev:backend        # Starts backend on http://localhost:4000
   npm run dev:web            # Starts web on http://localhost:3000
   ```

### Default Credentials (after seeding)
- **Admin**: `admin@example.com` / `Admin123!`
- **Editor**: `editor@example.com` / `bilfen123`
- **Viewer**: `alice@example.com` / `User123!`

### Database Commands
```bash
cd backend
npm run prisma:generate       # Generate Prisma client after schema changes
npm run prisma:migrate        # Create and apply new migration
npm run prisma:seed           # Reset and seed database
npx prisma studio             # Open Prisma Studio (database GUI)
```

## Next Recommended Steps

### High Priority
1. **Replace setInterval with job queue** for scheduled publishing
   - Use Bull or Agenda for production-ready job scheduling
   - Keep setInterval as fallback for development

2. **Improve error handling in frontend**
   - Better error messages for network failures
   - Retry logic for failed API calls
   - Offline state detection

3. **Add API documentation**
   - Swagger/OpenAPI documentation
   - Postman collection
   - API endpoint reference

### Medium Priority
4. **Implement reading list feature**
   - Currently just a placeholder page
   - Should integrate with bookmarks or be separate

5. **Image upload support**
   - Article images
   - User avatars
   - File storage (local or cloud)

6. **Enhanced search UI**
   - Autocomplete suggestions in search bar
   - Search result highlighting
   - Recent searches

### Low Priority
7. **SSR auth restoration**
   - Currently auth plugin only runs client-side
   - Could add `nuxtServerInit` for true SSR auth

8. **Real-time notifications**
   - WebSocket integration for live notifications
   - Browser push notifications

9. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests for critical flows

## File Structure Reference

### Backend Key Files
- `backend/src/index.ts` - Main server entry point
- `backend/src/routes/*.ts` - Route handlers
- `backend/src/services/*.ts` - Business logic
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/middleware/errorHandler.ts` - Error handling
- `backend/src/lib/jwt.ts` - JWT utilities
- `backend/src/lib/validation.ts` - Zod schemas
- `backend/src/lib/prisma.ts` - Prisma client singleton
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/seed.ts` - Database seeding

### Frontend Key Files
- `web/nuxt.config.js` - Nuxt configuration
- `web/utils/api.ts` - API client
- `web/store/auth.ts` - Auth Vuex module
- `web/store/social.ts` - Social Vuex module
- `web/store/feed.ts` - Feed Vuex module
- `web/plugins/auth.client.ts` - Auth restoration plugin
- `web/middleware/auth.ts` - Route protection
- `web/middleware/admin.ts` - Admin route protection
- `web/layouts/default.vue` - Main layout
- `web/pages/*.vue` - Page components
- `web/components/*.vue` - Reusable components

## Development Notes

- **Nuxt 2**: Uses Options API (Vue.extend), NOT Composition API or class decorators
- **Vuex**: Standard Nuxt module format (state, mutations, actions, getters exports), NOT vuex-module-decorators
- **TypeScript**: Strict mode enabled in both backend and frontend
- **Code Formatting**: Prettier configured at root level
- **Mobile**: Do NOT work on mobile app unless explicitly requested (see PROJECT_GUIDELINES.md)

