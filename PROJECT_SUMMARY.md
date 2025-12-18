# Bilfen Blog - Project Summary

## Overview

Bilfen Blog is a web blog application developed as an academic sample project. The codebase is organized as a monorepo containing a Node.js Express backend API and a Nuxt 2 frontend application. The project is currently in a scaffolded state with placeholder implementations demonstrating the intended architecture and user interface, but without database integration or complete CRUD functionality.

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js 4.18.2
- **Language**: TypeScript 5.3.3 (strict mode enabled)
- **Development**: tsx 4.7.0 for hot-reload development
- **Security Middleware**: Helmet 7.1.0, CORS 2.8.5, express-rate-limit 7.1.0
- **Configuration**: dotenv 16.3.1 for environment variables
- **Build**: TypeScript compiler output to `dist/` directory

### Frontend
- **Framework**: Nuxt 2.17.3 (not Nuxt 3)
- **Language**: TypeScript with nuxt-property-decorator 2.9.1 (class-based components)
- **Styling**: TailwindCSS via @nuxtjs/tailwindcss 6.8.4
- **Build**: Nuxt build system with TypeScript support via @nuxt/typescript-build

### Infrastructure
- **Package Management**: npm workspaces (root-level orchestration)
- **Code Formatting**: Prettier 3.0.0 (root-level configuration)
- **Monorepo Structure**: Three workspaces (backend, web, mobile)

## Architecture

The project follows a clear separation between backend and frontend:

**Backend API** (`backend/`)
- RESTful API server running on port 4000 (configurable via `PORT` environment variable)
- Modular route structure with dedicated router for articles (`src/routes/articles.ts`)
- Production-ready middleware stack: security headers (Helmet), cross-origin resource sharing (CORS), and rate limiting applied to `/api/*` routes
- Environment-based configuration with sensible defaults

**Frontend Application** (`web/`)
- Server-side rendered Nuxt 2 application (default port 3000)
- File-based routing via `pages/` directory structure
- API client module (`utils/api.ts`) with TypeScript interfaces for type safety
- Environment variable support (`NUXT_PUBLIC_API_BASE`) for API endpoint configuration

**Communication**
- Frontend API client uses fetch API to communicate with backend
- Default backend URL: `http://localhost:4000`
- JSON-based request/response format

## Implemented Features

### Backend
- Health check endpoint (`GET /health`) returning `{ ok: true }`
- Article list endpoint (`GET /api/articles`) returning stub response `{ items: [], total: 0 }`
- Article detail endpoint (`GET /api/articles/:id`) returning stub article object with fields: `id`, `title`, `summary`, `content`, `publishedAt`
- Production middleware configuration (Helmet, CORS, rate limiting)
- Environment variable support for configuration
- TypeScript compilation and build scripts

### Frontend
- Homepage (`/`) with:
  - Header with application title
  - Search input field (non-functional placeholder)
  - Article list placeholder area
  - Functional API client integration that fetches and displays backend response in debug section
- Article detail page (`/articles/:id`) with:
  - Styled layout using TailwindCSS
  - Placeholder article content display
  - Edit and Delete buttons (display alerts, non-functional)
- Create article page (`/articles/new`) with:
  - Form fields for title, summary, and content
  - Form validation structure in place
  - Submit handler that displays alert (non-functional)
- Edit article page (`/articles/:id/edit`) with:
  - Pre-populated form fields with stub data
  - Save and Cancel buttons (Save displays alert, non-functional)
- Reading list page (`/reading-list`) with placeholder content
- Default layout component
- API client module with TypeScript interfaces and error handling
- Responsive design using TailwindCSS utility classes

## Current Limitations / Scaffolding

### Backend
- No database integration (all endpoints return hardcoded stub data)
- Missing CRUD operations: POST, PUT, PATCH, DELETE endpoints not implemented
- No data validation or sanitization
- No authentication or authorization
- No error handling beyond default Express behavior
- Environment configuration file (`.env.example`) exists but `.env` is gitignored

### Frontend
- All forms are non-functional (submit handlers display alerts)
- Article list displays placeholder text, does not render actual articles
- No client-side routing integration with API (detail/edit pages use hardcoded data)
- No error handling UI
- No loading states
- Search functionality not implemented
- Reading list feature not implemented
- API response displayed in debug format on homepage (development artifact)

## Excluded Components

**Mobile Application** (`mobile/`)
- React Native application scaffold exists in the codebase (Expo, TypeScript, React Navigation)
- Intentionally excluded from active development per project guidelines (`.cursorrules`)
- Mobile app will only be developed when explicitly requested
- Currently contains placeholder screens and API client configuration

## Technical Decisions

1. **Nuxt 2 vs Nuxt 3**: Project uses Nuxt 2.17.3 despite Nuxt 2 reaching end-of-life, indicating compatibility requirements or existing codebase constraints.

2. **TypeScript Strict Mode**: Both backend and frontend use strict TypeScript configuration for type safety.

3. **Class-Based Vue Components**: Frontend uses `nuxt-property-decorator` for class-style component syntax instead of Composition API.

4. **Production-Ready Middleware**: Backend includes security middleware (Helmet, rate limiting) from the start, indicating production-readiness as a goal.

5. **Monorepo with npm Workspaces**: Single repository structure allows shared tooling (Prettier) and coordinated development scripts.

6. **TailwindCSS Integration**: Utility-first CSS framework integrated via Nuxt module rather than custom CSS.

## Development Workflow

- Root-level scripts orchestrate workspace commands: `npm run dev:backend`, `npm run dev:web`
- Each workspace has independent build and start scripts
- Code formatting enforced via Prettier at root level
- TypeScript compilation verified in both workspaces

## Next Steps (Not Implemented)

- Database integration and data persistence
- Complete CRUD API endpoints (POST, PUT, DELETE)
- Form submission handlers connecting frontend to backend
- Data validation (backend and frontend)
- Error handling and user feedback
- Authentication and authorization
- Search functionality implementation
- Reading list feature implementation
- Remove debug API response display from production build

