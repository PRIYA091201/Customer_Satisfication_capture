# Supabase PostgreSQL Database Integration

This guide will help you set up and connect your application to a Supabase PostgreSQL database with advanced features including real-time subscriptions, WebSocket integration, migrations, and batch operations.

## Prerequisites

1. Create a [Supabase](https://supabase.com/) account
2. Create a new Supabase project
3. Get your Supabase URL and API key from the project settings

## Step 1: Environment Setup

1. Update the `.env` file with your Supabase credentials:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

## Step 2: Database Schema Setup

1. Go to your Supabase project dashboard
2. Click on the "SQL Editor" tab
3. Create a new query and paste the contents of `src/db/setup-schema.sql`
4. Run the query to create the necessary tables and sample data

## Step 3: Database Setup and Migration

1. Run the initial schema setup script
   ```
   npx ts-node src/scripts/run-migrations.ts
   ```
   This will create the necessary tables, stored procedures, and indexes

2. Import sample data (optional)
   ```
   npx ts-node src/scripts/import-sample-data.ts
   ```

## Step 4: Testing the Connection

1. Start your application with `npm run dev`
2. Navigate to `http://localhost:3000/health` to check if the database connection is working
   - You should see a response with `{"status":"OK","database":"Connected","timestamp":"..."}`
3. You can also test the WebSocket connection with a WebSocket client
   - Connect to `ws://localhost:3000` 
   - You should receive a welcome message

## Using the Database in Code

### Basic Usage

```typescript
import db from '../utils/db';

// Example: Query data
const { data, error } = await db.getSupabaseClient()
  .from('customer_feedback')
  .select('*');

// Example: Insert data
const { data, error } = await db.getSupabaseClient()
  .from('customer_feedback')
  .insert({ 
    customer_name: 'Customer Name', 
    rating: 5,
    comments: 'Great service!' 
  });
```

### Using the Helper Functions

```typescript
import dbOps from '../utils/db-operations';

// Example: Query with pagination
const { data, error } = await dbOps.executeQuery(
  'customer_feedback',
  'select',
  null,
  (query) => query.order('created_at', { ascending: false }).limit(10)
);

// Example: Insert data
const { data, error } = await dbOps.executeQuery(
  'customer_feedback',
  'insert',
  { 
    customer_name: 'Customer Name', 
    rating: 5,
    comments: 'Great service!' 
  }
);
```

## API Endpoints

The following API endpoints are available for the customer feedback functionality:

- `GET /api/feedback` - Get all feedback entries with pagination
  - Query parameters: `page`, `pageSize`, `orderBy`, `orderDirection`
- `GET /api/feedback/stats` - Get feedback statistics
- `GET /api/feedback/:id` - Get a specific feedback entry
- `POST /api/feedback` - Create a new feedback entry
- `PUT /api/feedback/:id` - Update a feedback entry
- `DELETE /api/feedback/:id` - Delete a feedback entry

## WebSocket Events

The application supports real-time updates via WebSockets:

- Connect to `ws://localhost:3000` to receive real-time updates
- Event types:
  - `connection`: Sent when a client connects
  - `db_change`: Sent when feedback data changes in the database
  - `pong`: Response to ping messages

## Advanced Features

### Real-time Subscriptions

```typescript
import db from './utils/db';

// Subscribe to all changes on the feedback table
const channel = db.createSubscription(
  'customer_feedback', 
  '*',  // Event type: 'INSERT', 'UPDATE', 'DELETE', or '*' for all
  (payload) => {
    console.log('Data changed:', payload);
  }
);

// Unsubscribe when done
db.removeSubscription(channel);
```

### Database Migrations

Creating a new migration:

```typescript
import migration from './db/migration';

// Generate a new migration file
const filePath = migration.generateMigrationFile('add_user_preferences');
```

Running migrations:

```typescript
import migration from './db/migration';

// Run all pending migrations
await migration.runMigrations();
```

### Batch Operations

```typescript
import batchOps from './utils/batch-operations';
import { Tables } from './types/database.types';

// Batch insert records
const result = await batchOps.batchInsert(
  Tables.CUSTOMER_FEEDBACK,
  records,  // Array of records
  100       // Batch size
);

// Export table to CSV
await batchOps.exportTableToCsv(
  Tables.CUSTOMER_FEEDBACK,
  './export.csv'
);

// Import from CSV
await batchOps.importFromCsv(
  Tables.CUSTOMER_FEEDBACK,
  './import.csv',
  {
    transform: (record) => ({
      // Transform record before import
    })
  }
);
```

## Troubleshooting

1. If you see `"database":"Disconnected"` in the health check:
   - Verify your Supabase credentials in the `.env` file
   - Make sure your Supabase project is running
   - Check that you've created the `health_check` table in your database

2. If you get CORS errors:
   - Configure CORS in your Supabase project settings to allow your application's domain

3. For Row Level Security issues:
   - Review the RLS policies in the SQL setup script
   - Adjust them based on your application's security requirements