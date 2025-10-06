# CuratorKit Next.js

A comprehensive library management system built with Next.js, TypeScript, and Prisma. CuratorKit provides tools for managing events, room reservations, computer sign-ins, reference counting, and more for library operations.

## 🚀 Features

- **Event Calendar Management**: Create, manage, and track library events with registration forms
- **Room Reservations**: Allow patrons to reserve study rooms and meeting spaces
- **Computer Sign-ins**: Track computer usage and manage patron access
- **Reference Count**: Monitor and analyze reference desk interactions
- **In-House Checkout**: Manage internal item checkouts
- **Custom Theming**: Personalize the interface with custom colors and branding
- **Analytics Dashboard**: Comprehensive reporting and data visualization
- **Multi-tenant Architecture**: Support for multiple library locations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Chakra UI
- **Database**: Prisma ORM
- **Authentication**: JWT with secure cookie handling
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: Moment.js with timezone support
- **Email**: Nodemailer for notifications
- **Form Validation**: Custom validation with password-validator

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (fe)/            # Main application pages
│   ├── (publicfe)/      # Public-facing pages
│   ├── actions/         # Server actions
│   ├── components/      # Reusable components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── middleware.ts        # Auth middleware
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd curatorkit-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your database connection and other environment variables in `.env.local`

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database browser

### Code Quality

This project uses:
- **ESLint** with TypeScript rules for code quality
- **TypeScript** for type safety
- **Prettier** for code formatting (recommended)
- Strict linting rules to maintain code standards

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
