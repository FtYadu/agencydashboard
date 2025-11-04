# 🚀 Agency Dashboard

A comprehensive, production-ready agency management system built with Next.js 14, TypeScript, and modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## ✨ Key Features

- 💼 **Client Management** - Complete CRM with contact management and history tracking
- 📊 **Project Management** - Track projects, milestones, budgets, and team assignments
- ✅ **Task Management** - Kanban board with drag-and-drop, priorities, and assignments
- ⏰ **Time Tracking** - Log billable hours with detailed reporting
- 💰 **Invoicing** - Generate professional invoices with Stripe payment integration
- 💸 **Expense Tracking** - Manage expenses with receipt uploads and categorization
- 📈 **Analytics & Reporting** - Real-time dashboards and custom reports
- 🔒 **Security** - Role-based access control, JWT authentication, and OAuth support
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- 📱 **Mobile Ready** - PWA support with offline capabilities

## 🛠️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query
**Backend:** Next.js API Routes, Prisma ORM, PostgreSQL (Neon), NextAuth.js
**Services:** Stripe, Resend, Vercel
**DevOps:** Docker, GitHub Actions, Vitest, Playwright

## 📋 Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- PostgreSQL database (Neon recommended)
- Stripe account (for payments)
- Resend account (for emails)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-org/agencydashboard.git
cd agencydashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database and API credentials.

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your first account!

## 📚 Documentation

- [Full Implementation Guide](./IMPLEMENTATION.md) - Complete feature documentation
- Database schema, API endpoints, security, testing, and deployment details

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with Next.js, Tailwind CSS, Prisma, and shadcn/ui

---

**See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for complete documentation of all features, architecture, and deployment instructions.**

