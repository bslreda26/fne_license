# License API - Testing Guide

This guide will help you test the License API endpoints using Postman.

## Setup Instructions

### 1. Import Postman Collection
1. Open Postman
2. Click "Import" button
3. Select the `License_API_Postman_Collection.json` file
4. The collection will be imported with all endpoints ready to test

### 2. Configure Environment Variables
The collection uses a variable `{{base_url}}` which is set to `http://localhost:3333` by default.
- If your server runs on a different port, update this variable
- You can also create a Postman environment to manage different base URLs

### 3. Start Your AdonisJS Server
```bash
cd license
npm run dev
# or
node ace serve --watch
```

## API Endpoints

### 1. **GET** `/api/licenses` - Get All Licenses
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status (`active`, `expired`, `revoked`)
  - `client_id`: Filter by client ID

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": "client123",
      "licenseKey": "ABCD-1234-EFGH-5678",
      "status": "active",
      "validUntil": "2025-12-31T23:59:59.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

### 2. **GET** `/api/licenses/:id` - Get License by ID
- **Path Parameter:** `id` - License ID

**Example Response:**
```json
{
  "id": 1,
  "clientId": "client123",
  "licenseKey": "ABCD-1234-EFGH-5678",
  "status": "active",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### 3. **POST** `/api/licenses` - Create New License
**Request Body:**
```json
{
  "clientId": "client123",
  "licenseKey": "ABCD-1234-EFGH-5678",
  "status": "active",
  "validUntil": "2025-12-31T23:59:59.000Z"
}
```

**Note:** If you don't provide `licenseKey`, the service will generate one automatically.

**Example Response:**
```json
{
  "id": 1,
  "clientId": "client123",
  "licenseKey": "ABCD-1234-EFGH-5678",
  "status": "active",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### 4. **PUT** `/api/licenses/:id` - Update License
**Request Body:**
```json
{
  "clientId": "client123_updated",
  "status": "active",
  "validUntil": "2026-01-31T23:59:59.000Z"
}
```

### 5. **POST** `/api/licenses/:id/revoke` - Revoke License
- Changes license status to `revoked`
- No request body needed

### 6. **POST** `/api/licenses/validate` - Validate License
**Request Body:**
```json
{
  "licenseKey": "ABCD-1234-EFGH-5678",
  "clientId": "client123"
}
```

**Example Response (Valid):**
```json
{
  "valid": true,
  "license": {
    "id": 1,
    "clientId": "client123",
    "status": "active",
    "validUntil": "2025-12-31T23:59:59.000Z"
  }
}
```

**Example Response (Invalid):**
```json
{
  "valid": false,
  "reason": "License not found"
}
```

### 7. **DELETE** `/api/licenses/:id` - Delete License
- Permanently removes the license
- Returns 204 No Content on success

## Testing Flow

### Recommended Testing Order:
1. **Create License** - Create a new license
2. **Get All Licenses** - Verify it appears in the list
3. **Get License by ID** - Fetch the specific license
4. **Validate License** - Test license validation
5. **Update License** - Modify license details
6. **Revoke License** - Test revocation
7. **Validate License** - Verify it's now invalid
8. **Delete License** - Remove the license
9. **Get All Licenses** - Verify it's removed

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (Delete success)
- `400` - Bad Request (Validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Database Migration

Before testing, make sure to run the database migration:
```bash
cd license
node ace migration:run
```

## Troubleshooting

### Common Issues:
1. **Server not running** - Make sure your AdonisJS server is started
2. **Database connection** - Check your database configuration
3. **Migration not run** - Ensure the licenses table exists
4. **Port conflicts** - Verify the server is running on port 3333

### Validation Errors:
- `clientId` must be at least 3 characters
- `licenseKey` must be at least 10 characters
- `validUntil` must be a valid ISO date string
- `status` must be one of: `active`, `expired`, `revoked`

## Additional Features

The License Service includes:
- **Auto-expiration**: Licenses automatically expire when `validUntil` date passes
- **License key generation**: Automatic unique license key generation
- **Duplicate prevention**: Prevents duplicate license keys
- **Status management**: Easy status transitions (active → expired → revoked)
