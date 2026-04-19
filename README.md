# Open Spec Code - Supabase PostgreSQL Integration

A TypeScript Node.js application with Supabase PostgreSQL database integration and demo API.

## Features

- 🚀 **Express.js REST API** with TypeScript
- 📊 **Supabase PostgreSQL** integration with advanced features
- 🔄 **Real-time data** with WebSocket support
- 🚦 **Type-safe** database operations
- 🛠️ **Migration system** for database schema management
- 📝 **Demo API** for testing Supabase operations

## Quick Start

1. Clone this repository
2. Run the setup script:
   ```bash
   npm run setup
   ```
3. Follow the interactive prompts to configure your Supabase credentials
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000/api/demo to access the demo API

## API Documentation

- **Main API**: [DB_SETUP.md](./DB_SETUP.md) - Comprehensive documentation for the database integration
- **Demo API**: [DEMO_API.md](./DEMO_API.md) - Examples of how to use the demo API endpoints

## Key Endpoints

- **API Root**: `http://localhost:3000/api` - General API information
- **Demo API**: `http://localhost:3000/api/demo` - Demo endpoints for testing Supabase operations
- **Feedback API**: `http://localhost:3000/api/feedback` - Feedback CRUD operations
- **Health Check**: `http://localhost:3000/health` - Server and database health status

## Database Features

- **Real-time Subscriptions** - Subscribe to database changes
- **WebSocket Integration** - Push updates to connected clients
- **Migrations** - Manage database schema changes
- **Batch Operations** - Efficiently handle multiple records
- **Type Safety** - Strong TypeScript typing for database operations
- **Error Handling** - Comprehensive error handling system

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Run the production build
- `npm run db:migrate` - Run database migrations
- `npm run db:setup` - Set up database schema
- `npm run db:sample` - Import sample data
- `npm run db:export` - Export data to CSV
- `npm run setup` - Run interactive setup

## Project Structure

```
├── src/
│   ├── config/         # Application configuration
│   ├── controllers/    # API controllers
│   ├── db/             # Database migrations and scripts
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── ws/             # WebSocket server
│   └── index.ts        # Application entry point
├── customer_feedback/  # Frontend client
├── .env                # Environment variables
├── package.json        # Project dependencies
├── README.md           # Main documentation
├── DB_SETUP.md         # Database setup documentation
└── DEMO_API.md         # Demo API documentation
```

## License

This project is licensed under the ISC License.