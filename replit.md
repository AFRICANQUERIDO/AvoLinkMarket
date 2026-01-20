# AvoLink Global - B2B Avocado Oil Marketplace

## Overview

AvoLink Global is a B2B marketplace platform connecting European avocado oil buyers with African processors. The application provides product listings, market intelligence, enquiry management, and a partner portal (CRM) for tracking leads and analytics.

Key features:
- Product catalog with crude, virgin, and refined avocado oil offerings
- Market intelligence page with industry news and trends
- Enquiry submission system for B2B lead generation
- Admin dashboard with analytics and CRM functionality
- Real-time price ticker and page visit tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with tsx for development
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Build**: esbuild bundles server to CommonJS for production

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver
- **ORM**: Drizzle ORM with drizzle-zod for validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, enquiries, pageVisits

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/           # Express backend
│   ├── index.ts      # Entry point
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Database operations
│   └── vite.ts       # Dev server integration
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle schema definitions
└── drizzle/          # Database connection
```

### Key Design Decisions
1. **Monorepo Structure**: Client and server share TypeScript types through the `shared/` directory
2. **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared directory
3. **Component Library**: shadcn/ui (new-york style) provides consistent, accessible UI components
4. **Form Handling**: react-hook-form with zod validation for type-safe forms

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres accessed via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable

### UI Framework
- **shadcn/ui**: Pre-built Radix UI components with Tailwind styling
- **Radix Primitives**: Accessible component foundations (dialogs, dropdowns, etc.)
- **Lucide Icons**: Icon library for UI elements

### Development Tools
- **Drizzle Kit**: Database migrations via `npm run db:push`
- **Vite Plugins**: Replit-specific plugins for dev banner and error overlay

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `ADMIN_EMAIL`: Email address for enquiry notifications (optional, logged to console)