# AI Agent Marketplace

A modern Next.js 14 application for discovering, deploying, and monetizing AI agents.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **Zustand** for state management
- **React Query** for data fetching
- **React Hook Form** with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AIagentshichang
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

- **Database**: PostgreSQL connection string
- **Authentication**: NextAuth.js configuration
- **AI Services**: API keys for OpenAI, Anthropic, etc.
- **Payment**: Stripe configuration
- **Storage**: AWS S3 configuration
- **Email**: Resend API configuration

## Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── styles/            # CSS files
├── contexts/          # React contexts
└── utils/             # Helper utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Development**: ESLint, Prettier, TypeScript

## License

This project is licensed under the MIT License.