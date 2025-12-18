# Bilfen Blog - Development Guidelines

## Scope of Work

### Active Development
- ✅ **Backend** (Express + TypeScript)
- ✅ **Web App** (Nuxt 2 + TypeScript + TailwindCSS)

### Excluded from Default Work
- ❌ **Mobile App** (React Native/Expo) - Only work on this when explicitly requested

## Important Note About Mobile

**The mobile app should NOT be modified, implemented, or worked on unless I explicitly say we are working on mobile features.**

When I say things like:
- "implement X feature"
- "add Y functionality" 
- "fix Z issue"

These apply to **backend and web only** by default.

Only when I say:
- "now we are going to implement mobile"
- "let's work on the mobile app"
- "add this to mobile"

...should you work on the mobile app.

## Tech Stack Reference

### Backend
- Express.js
- TypeScript
- Middleware: helmet, cors, express-rate-limit
- Dev tool: tsx (for watch mode)

### Web
- Nuxt 2 (NOT Nuxt 3)
- TypeScript with nuxt-property-decorator
- TailwindCSS via @nuxtjs/tailwindcss
- API client in `utils/api.ts`

### Mobile (Reference Only)
- Expo
- React Native
- TypeScript
- React Navigation

## Project Structure

```
bilfen-blog/
├── backend/          # Work on this ✅
├── web/              # Work on this ✅
├── mobile/           # Do NOT work on this ❌ (unless explicitly asked)
└── package.json      # Root workspace config
```

## Getting Started Commands

```bash
# Install dependencies
npm install

# Start backend
npm run dev:backend

# Start web app
npm run dev:web

# Mobile (only when explicitly working on it)
npm run dev:mobile
```

