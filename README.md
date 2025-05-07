# SensAI

A modern web application leveraging AI capabilities with a rich user interface built on Next.js 15.

## Features

- **AI Integration**: Powered by OpenAI for intelligent interactions
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Database Management**: Prisma ORM with SQLite for data persistence
- **Authentication**: Secure user authentication and authorization
- **Responsive Design**: Mobile-friendly interface with modern components
- **Interactive UI**: Rich components including accordions, dialogs, and more
- **Mathematical Rendering**: Support for mathematical expressions using KaTeX
- **Markdown Support**: Rich text editing with React Markdown
- **State Management**: Efficient state management with Zustand and Immer
- **Form Handling**: Comprehensive form management with React Hook Form and Zod validation

## Tech Stack

- **Frontend**: React 19, Next.js 15
- **Styling**: Tailwind CSS, tailwind-merge, tailwindcss-animate
- **Components**: Radix UI, Shadcn UI principles
- **Database**: Prisma with POSTGRESQL
- **State Management**: Zustand Query
- **AI**: OpenAI API integration
- **Authentication**: JWT, bcrypt
- **Form Handling**: React Hook Form, Zod
- **Data Visualization**: Recharts
- **UI Enhancement**: Framer Motion, Sonner, Embla Carousel

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- pnpm package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/himanshuraimau/sensai.git
   cd sensai-v0-archive
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="your-openai-api-key"
   JWT_SECRET="your-jwt-secret"
   ```

4. Set up the database:
   ```
   pnpm prisma migrate dev
   pnpm seed
   ```

### Development

Run the development server:
```
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to find and fix problems
- `pnpm seed` - Seed the database with initial data
- `pnpm rebuild-sqlite` - Rebuild the SQLite binary if needed

## Project Structure

```
sensai-v0-archive/
├── app/               # Next.js application routes and pages
├── components/        # React components
├── lib/               # Utility functions and shared code
├── prisma/            # Prisma schema and migrations
├── public/            # Static assets
├── scripts/           # Utility scripts including database seeding
└── styles/            # Global styles
```

## License

[MIT](LICENSE)
