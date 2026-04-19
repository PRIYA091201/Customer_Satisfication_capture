# Project Technology Stack and Architecture

This document outlines the technology stack and architecture of our customer feedback application.

## Tech Stack

### Frontend
- **React 19**: Modern UI library for building interactive user interfaces
- **TypeScript**: Type-safe JavaScript superset for improved developer experience
- **Vite**: Next-generation frontend build tool for faster development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **HTML5/CSS3**: Core web technologies for structure and styling

### Backend
- **Node.js**: JavaScript runtime for server-side execution
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Type-safe development for backend services
- **WebSocket**: Real-time communication protocol

### Database
- **Supabase**: Open source Firebase alternative providing:
  - **PostgreSQL**: Powerful relational database
  - **Real-time subscriptions**: Live data updates
  - **Authentication**: User management system
  - **Storage**: File storage solutions

### Development Tools
- **ESLint**: Static code analysis tool
- **Nodemon**: Automatic server restart during development
- **ts-node**: TypeScript execution for Node.js
- **Babel**: JavaScript compiler for modern features

## Project Structure

```
Open_spec_code/
├── .agent/                       # Agent configurations
├── customer_feedback/            # Frontend application (React)
│   ├── src/
│   │   ├── assets/               # Static assets like images, fonts
│   │   ├── lib/                  # Shared utilities
│   │   │   └── api-client.ts     # API client for backend communication
│   │   ├── App.tsx               # Main React component
│   │   ├── App.css               # Component styles
│   │   ├── main.tsx              # Application entry point
│   │   └── index.css             # Global styles (includes Tailwind)
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite configuration
│   └── eslint.config.js          # ESLint configuration
├── public/                       # Static files served by backend
│   └── demo.html                 # Demo API interface
├── src/                          # Backend application (Node.js)
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   │   ├── api.controller.ts     # Main API controller
│   │   ├── demo.controller.ts    # Demo endpoints controller
│   │   └── feedback.controller.ts # Feedback endpoints controller
│   ├── db/                       # Database related files
│   │   ├── migration.ts          # Database migration utility
│   │   ├── setup-schema.sql      # Initial schema setup
│   │   └── stored-procedures.sql # Database stored procedures
│   ├── middleware/               # Express middleware
│   │   ├── error.middleware.ts   # Error handling middleware
│   │   └── database.middleware.ts # Database connection middleware
│   ├── models/                   # Data models
│   ├── routes/                   # API route definitions
│   │   ├── api.routes.ts         # Main API routes
│   │   ├── demo.routes.ts        # Demo API routes
│   │   ├── feedback.routes.ts    # Feedback API routes
│   │   └── index.ts              # Routes index
│   ├── scripts/                  # Utility scripts
│   │   ├── run-migrations.ts     # Script to run database migrations
│   │   └── import-sample-data.ts # Script to import sample data
│   ├── services/                 # Business logic services
│   │   └── feedback.service.ts   # Feedback service layer
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.types.ts     # Database entity types
│   │   └── supabase.d.ts         # Supabase type declarations
│   ├── utils/                    # Utility functions
│   │   ├── db.ts                 # Database client
│   │   ├── db-operations.ts      # Database operations
│   │   ├── db-error-handler.ts   # Database error handling
│   │   ├── batch-operations.ts   # Batch database operations
│   │   └── logger.ts             # Logging utility
│   ├── ws/                       # WebSocket implementations
│   │   └── websocket-server.ts   # WebSocket server for real-time updates
│   └── index.ts                  # Backend entry point
├── .env                          # Environment variables
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript configuration
├── setup-db.js                   # Database setup script
├── README.md                     # Main project documentation
├── DB_SETUP.md                   # Database setup documentation
├── DEMO_API.md                   # Demo API documentation
└── AGENTS.md                     # This file - technology stack documentation
```

## Architecture Overview

### Frontend Architecture

The frontend is built using React with TypeScript, leveraging Vite for fast development and builds. It follows a component-based architecture with the following characteristics:

- **Component Structure**: Functional components with hooks
- **State Management**: React hooks for local state
- **Styling**: Tailwind CSS for utility-first styling
- **API Communication**: Custom API client for backend interaction
- **TypeScript Integration**: Strongly typed components, props, and state

### Backend Architecture

The backend follows a layered architecture pattern:

1. **Routes Layer**: Defines API endpoints and routes requests
2. **Controller Layer**: Handles request/response cycle
3. **Service Layer**: Contains business logic
4. **Data Access Layer**: Interacts with Supabase/PostgreSQL

### Database Design

The database is built on PostgreSQL (via Supabase) with the following features:

- **Tables**: Structured data storage (e.g., `customer_feedback`)
- **Stored Procedures**: Custom database functions
- **Migrations**: Version-controlled schema changes
- **Real-time Subscriptions**: Live data updates
- **Row-Level Security**: Fine-grained access control

### API Design

The API follows RESTful principles:

- **Resource-Based Routes**: Organized around resources
- **Standard HTTP Methods**: GET, POST, PUT, DELETE
- **JSON Responses**: Consistent response formats
- **Error Handling**: Standardized error responses
- **Demo API**: Interactive endpoints for demonstration

### Real-time Communication

Real-time updates are implemented using:

1. **Supabase Real-time**: Database change subscriptions
2. **WebSocket Server**: Custom implementation for client notifications

## Development Workflow

1. **Backend Development**:
   - Run `npm run dev` in project root
   - API available at `http://localhost:3000/api`
   - Demo API at `http://localhost:3000/api/demo`

2. **Frontend Development**:
   - Run `npm run dev` in `customer_feedback` directory
   - UI available at `http://localhost:5173`

3. **Database Management**:
   - Initial setup: `npm run setup`
   - Run migrations: `npm run db:migrate`
   - Import sample data: `npm run db:sample`
   - Export data: `npm run db:export`

4. **Production Deployment**:
   - Build backend: `npm run build` in project root
   - Build frontend: `npm run build` in `customer_feedback` directory
   - Start server: `npm start` in project root

## Integration Points

- **Frontend to Backend**: API client in `customer_feedback/src/lib/api-client.ts`
- **Backend to Database**: Supabase client in `src/utils/db.ts`
- **Real-time Updates**: WebSocket connection for live data