# ProfileGlow ✨ AI Dating Profile Optimizer (Frontend)

**CS 5500 Group 4** | Northeastern University

Your dating profile, polished by AI: in seconds.

## Overview

ProfileGlow helps users optimize their dating profiles using AI. Paste your bio, upload your best photos, pick a vibe, and get AI-powered bio rewrites, photo rankings, and personalized conversation starters.

## Features

- **Bio Rewriting** : Paste your current bio and pick a vibe (Humorous, Warm, Polite, Chill, Flirty). The AI generates 3 optimized versions (The Charmer, The Storyteller, The Bold One) with one-click copy.
- **Before/After Diff**: Visual word-level comparison of your original vs. rewritten bio: removed words are struck through, new words are highlighted in gold.
- **Photo Ranking**: Upload 1–5 photos (JPEG/PNG, max 10 MB each). The AI ranks them from most to least appealing with scores and reasoning.
- **Conversation Starters**: AI-generated personalized opening lines based on your bio and chosen vibe, each with a copy button.
- **Responsive Design**: Fully functional on desktop and mobile.

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript                          |
| UI Components  | Radix UI + shadcn/ui                |
| Styling        | Tailwind CSS 4                      |
| Forms          | React Hook Form + Zod              |
| Notifications  | Sonner                              |
| Charts         | Recharts                            |

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **pnpm** 8+
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

Create a `.env.local` file in the project root:

```env
# Backend API URL (default: http://localhost:8080)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

If the backend is deployed remotely, replace with the remote URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start development server   |
| `npm run build` | Create production build    |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |

## Project Structure

```
ai-dating-frontend/
├── app/                        # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx              # Root layout + Toaster
│   └── page.tsx                # Main page (upload → results flow)
├── components/
│   ├── icons/                  # Custom icon components
│   ├── ui/                     # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── upload-page.tsx         # Bio input, vibe selector, photo upload
│   ├── results-page.tsx        # Optimized bios, photo ranking, conversation starters
│   ├── background-doodles.tsx  # Decorative background elements
│   ├── coffee-stains.tsx       # Decorative stain effects
│   ├── falling-celebration.tsx # Celebration animation on results page
│   └── theme-provider.tsx      # Dark/light theme support
├── hooks/
│   ├── use-mobile.ts           # Mobile viewport detection
│   └── use-toast.ts            # Toast notification hook
├── lib/
│   ├── api.ts                  # Backend API service layer
│   └── utils.ts                # Utility functions (cn, etc.)
├── public/                     # Static assets
├── styles/                     # Additional stylesheets
├── API_DOCS.md                 # Backend API documentation
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## API Integration

The frontend connects to a Spring Boot backend via three endpoints:

| Endpoint                        | Method | Content-Type        | Description                |
| ------------------------------- | ------ | ------------------- | -------------------------- |
| `/api/profile/rewrite-bio`      | POST   | application/json    | Rewrite bio with AI        |
| `/api/profile/rank-photos`      | POST   | multipart/form-data | Rank uploaded photos       |
| `/api/profile/generate-openers` | POST   | application/json    | Generate conversation starters |

All API calls include a 15-second timeout and error handling via toast notifications. See [`API_DOCS.md`](./API_DOCS.md) for detailed request/response formats.

## Deployment

### Netlify (planned)

1. Connect this GitHub repository in the Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL

## Related Repositories

- **Backend:** [KaichenQu/Dating-Backend](https://github.com/KaichenQu/Dating-Backend): Spring Boot + Claude API + MongoDB

## Team

| Name           | Role     |
| -------------- | -------- |
| Xujing Hui     | Frontend |
| Yihan Wang     | Backend  |
| Kaichen Qu     | Backend  |

## License

MIT License: CS 5500 Academic Project
