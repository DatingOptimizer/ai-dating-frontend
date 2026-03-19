# ProfileGlow ✨ AI Dating Profile Optimizer (Frontend)

**CS 5500 Group 4** | Northeastern University

Your dating profile, polished by AI: in seconds.

**Live URLs:**
- Frontend: https://dating-optimizer.netlify.app
- Backend API: https://dating-optimizer-backend.onrender.com

## Overview

ProfileGlow helps users optimize their dating profiles using AI. Paste your bio, upload your best photos, pick a vibe, and get AI-powered bio rewrites, photo rankings, and personalized conversation starters.

## Features

- **User Auth**: Sign up and log in with email/password via Supabase. Results are saved to your account.
- **Bio Rewriting**: Paste your current bio and pick a vibe (Humorous, Warm, Polite, Chill, Flirty). The AI generates 3 optimized versions (The Charmer, The Storyteller, The Bold One) with one-click copy.
- **Before/After Diff**: Visual word-level comparison of your original vs. rewritten bio: removed words are struck through, new words are highlighted in gold.
- **Photo Ranking**: Upload 1–5 photos (JPEG/PNG, max 10 MB each). The AI ranks them from most to least appealing with scores and reasoning.
- **Conversation Starters**: AI-generated personalized opening lines based on your bio and chosen vibe, each with a copy button.
- **Save & History**: Save your favourite bios and conversation starters to your account. View and delete them any time from the My Saves / History tab.
- **Collapsible Sidebar**: Navigation sidebar that collapses to emoji-only icons to give more space to content.
- **Responsive Design**: Fully functional on desktop and mobile.

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript                          |
| Auth           | Supabase Auth                       |
| UI Components  | Radix UI + shadcn/ui                |
| Styling        | Tailwind CSS 4                      |
| Forms          | React Hook Form + Zod              |
| Notifications  | Sonner                              |
| Charts         | Recharts                            |

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **pnpm** 8+
- Supabase account + project
- Backend API running: see [Dating-Backend](https://github.com/KaichenQu/Dating-Backend)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Xujing-Hui/ai-dating-frontend.git
cd ai-dating-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Backend API URL (default: http://localhost:8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

If the backend is deployed remotely, replace with the remote URL:

```env
NEXT_PUBLIC_API_URL=https://dating-optimizer-backend.onrender.com
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start development server           |
| `npm run build`      | Create production build            |
| `npm run start`      | Start production server            |
| `npm run lint`       | Run ESLint                         |
| `npm run test`       | Run tests in watch mode            |
| `npm run test:run`   | Run tests once (CI mode)           |

## Testing

Tests are written with [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/).

### Run tests

```bash
# Watch mode (re-runs on file changes)
npm run test

# Run once
npm run test:run
```

### Coverage

```bash
npx vitest run --coverage
```

Coverage results are printed in the terminal and saved to `coverage/` as an HTML report. Open `coverage/index.html` in your browser for a detailed breakdown.

### What is tested

| Area | File |
| ---- | ---- |
| `cn()` utility | `__tests__/lib/utils.test.ts` |
| API service layer (all 8 endpoints, error handling, timeouts) | `__tests__/lib/api.test.ts` |
| `useIsMobile` hook | `__tests__/hooks/use-mobile.test.ts` |
| Auth page (login, signup, errors, redirect) | `__tests__/components/auth-page.test.tsx` |
| Upload page (bio input, vibe selector, photo validation, submit) | `__tests__/components/upload-page.test.tsx` |
| History panel (fetch, delete, empty states, collapse) | `__tests__/components/history-panel.test.tsx` |

## Project Structure

```
ai-dating-frontend/
├── app/                        # Next.js App Router
│   ├── auth/
│   │   └── page.tsx            # Login / sign-up page
│   ├── globals.css
│   ├── icon.jpg                # Browser tab favicon
│   ├── layout.tsx              # Root layout + Toaster
│   └── page.tsx                # Main page (auth gate → upload → results flow)
├── components/
│   ├── icons/                  # Custom icon components
│   ├── ui/                     # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── app-sidebar.tsx         # Collapsible sidebar with tab navigation and logout
│   ├── history-panel.tsx       # Saved bios and starters panel with delete support
│   ├── upload-page.tsx         # Bio input, vibe selector, photo upload, My Saves tab
│   ├── results-page.tsx        # Optimized bios, photo ranking, starters, history tab
│   ├── background-doodles.tsx  # Decorative background elements
│   ├── coffee-stains.tsx       # Decorative stain effects
│   ├── falling-celebration.tsx # Celebration animation on results page
│   └── theme-provider.tsx      # Dark/light theme support
├── lib/
│   ├── api.ts                  # Backend API service layer (attaches Supabase JWT)
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions (cn, etc.)
├── public/                     # Static assets
├── API_DOCS.md                 # Backend API documentation
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## API Integration

The frontend connects to a Spring Boot backend via the following endpoints:

| Endpoint                            | Method | Content-Type        | Description                        |
| ----------------------------------- | ------ | ------------------- | ---------------------------------- |
| `/api/profile/rewrite-bio`          | POST   | application/json    | Rewrite bio with AI                |
| `/api/profile/rank-photos`          | POST   | multipart/form-data | Rank uploaded photos               |
| `/api/profile/generate-openers`     | POST   | application/json    | Generate conversation starters     |
| `/api/profile/history`              | GET    | —                   | Fetch saved bios and starters      |
| `/api/profile/history/bio`          | POST   | application/json    | Save a bio                         |
| `/api/profile/history/bio/:id`      | DELETE | —                   | Delete a saved bio                 |
| `/api/profile/history/starter`      | POST   | application/json    | Save a conversation starter        |
| `/api/profile/history/starter/:id`  | DELETE | —                   | Delete a saved starter             |

All API calls include a 15-second timeout, error handling via toast notifications, and automatically attach the Supabase JWT as `Authorization: Bearer <token>`. See [`API_DOCS.md`](./API_DOCS.md) for detailed request/response formats.

## Deployment

### Netlify

Deployed at: https://dating-optimizer.netlify.app

1. Connect this GitHub repository in the Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://dating-optimizer-backend.onrender.com`
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

## Related Repositories

- **Backend:** [DatingOptimizer/Dating-Backend](https://github.com/DatingOptimizer/Dating-Backend): Spring Boot + Claude API + Supabase PostgreSQL

## Team

| Name           | Role     |
| -------------- | -------- |
| Xujing Hui     | Frontend |
| Yihan Wang     | Backend  |
| Kaichen Qu     | Backend  |

## License

MIT License: CS 5500 Academic Project
