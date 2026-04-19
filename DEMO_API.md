# Supabase PostgreSQL Demo API

This document provides examples of how to use the demo API endpoints to interact with Supabase PostgreSQL.

## Getting Started

1. Ensure you've set up your Supabase credentials in the `.env` file
2. Start the server:
   ```
   npm run dev
   ```
3. Access the demo API at `http://localhost:3000/api/demo`

## Available Endpoints

### 1. List All Demo Endpoints
- **URL**: `/api/demo`
- **Method**: `GET`
- **Description**: Returns a list of all available demo endpoints with descriptions

### 2. Simple Query
- **URL**: `/api/demo/simple`
- **Method**: `GET`
- **Description**: Executes a simple query to retrieve the first 5 feedback records
- **Example Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "rating": 5,
        "comments": "Excellent service!",
        "created_at": "2026-04-19T12:00:00.000Z",
        "updated_at": "2026-04-19T12:00:00.000Z"
      },
      ...
    ],
    "message": "Simple query executed successfully",
    "endpoint": "simpleQuery"
  }
  ```

### 3. Filtered Query
- **URL**: `/api/demo/filtered?minRating=4`
- **Method**: `GET`
- **Parameters**: 
  - `minRating` (optional) - Minimum rating value (default: 3)
- **Description**: Returns feedback with ratings greater than or equal to the specified value
- **Example Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "rating": 5,
        "comments": "Excellent service!",
        "created_at": "2026-04-19T12:00:00.000Z",
        "updated_at": "2026-04-19T12:00:00.000Z"
      },
      ...
    ],
    "message": "Filtered query for ratings >= 4 executed successfully",
    "filter": {
      "minRating": 4
    },
    "endpoint": "filteredQuery"
  }
  ```

### 4. Create Record
- **URL**: `/api/demo/create`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Demo User",
    "rating": 5,
    "comments": "Great experience!"
  }
  ```
- **Description**: Creates a new feedback record
- **Example Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 10,
      "customer_name": "Demo User",
      "rating": 5,
      "comments": "Great experience!",
      "source": "api_demo",
      "created_at": "2026-04-19T12:00:00.000Z",
      "updated_at": "2026-04-19T12:00:00.000Z"
    },
    "message": "Record created successfully",
    "endpoint": "createRecord"
  }
  ```

### 5. Batch Operation
- **URL**: `/api/demo/batch`
- **Method**: `POST`
- **Description**: Creates 5 random feedback records in a single batch operation
- **Example Response**:
  ```json
  {
    "success": true,
    "inserted": 5,
    "errors": 0,
    "message": "Batch operation executed successfully",
    "endpoint": "batchDemo"
  }
  ```

### 6. Aggregation Query
- **URL**: `/api/demo/aggregation`
- **Method**: `GET`
- **Description**: Calculates statistics about feedback ratings
- **Example Response**:
  ```json
  {
    "success": true,
    "data": {
      "averageRating": 4.25,
      "totalCount": 8,
      "ratingCounts": {
        "3": 1,
        "4": 3,
        "5": 4
      }
    },
    "message": "Aggregation query executed successfully",
    "endpoint": "aggregationDemo"
  }
  ```

### 7. Transaction Demo
- **URL**: `/api/demo/transaction`
- **Method**: `POST`
- **Description**: Demonstrates a transaction by deleting and creating multiple records
- **Example Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 11,
        "customer_name": "Transaction User 1",
        "rating": 5,
        "comments": "First record in transaction",
        "source": "transaction_demo",
        "created_at": "2026-04-19T12:00:00.000Z",
        "updated_at": "2026-04-19T12:00:00.000Z"
      },
      {
        "id": 12,
        "customer_name": "Transaction User 2",
        "rating": 4,
        "comments": "Second record in transaction",
        "source": "transaction_demo",
        "created_at": "2026-04-19T12:00:00.000Z",
        "updated_at": "2026-04-19T12:00:00.000Z"
      }
    ],
    "message": "Transaction demo executed successfully",
    "endpoint": "transactionDemo"
  }
  ```

## Testing with cURL

### Simple Query
```bash
curl http://localhost:3000/api/demo/simple
```

### Filtered Query
```bash
curl http://localhost:3000/api/demo/filtered?minRating=4
```

### Create Record
```bash
curl -X POST http://localhost:3000/api/demo/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","rating":5,"comments":"Great experience!"}'
```

### Batch Operation
```bash
curl -X POST http://localhost:3000/api/demo/batch
```

### Aggregation Query
```bash
curl http://localhost:3000/api/demo/aggregation
```

### Transaction Demo
```bash
curl -X POST http://localhost:3000/api/demo/transaction
```

## Testing with JavaScript/Fetch

```javascript
// Simple query example
fetch('http://localhost:3000/api/demo/simple')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Create record example
fetch('http://localhost:3000/api/demo/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Demo User',
    rating: 5,
    comments: 'Great experience!'
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Notes

- These demo endpoints are designed to showcase how to interact with Supabase PostgreSQL
- All endpoints include error handling and return consistent response formats
- Use these examples as a starting point for your own API development