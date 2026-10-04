# Audience Activation Service

This project is an Audience Activation Service that receives Audiences from Twilio Segment and activates them by sending SMS messages (Mocked) to customers within the audience. 

## Assumptions and Design Decisions

1. **Tech Stack**: 
   - Backend: NestJS, Prisma ORM, PostgreSQL.
   - Frontend: React (Next.js 14, TailwindCSS).
2. **Database Structure**: 
   - `Audience` table stores unique audiences.
   - `Customer` table stores customers, uniquely identified by `segmentId`.
   - `Message` table stores SMS content created for specific audiences.
   - `Activation` table tracks the status of SMS activations (PENDING, PROCESSING, SUCCESS, FAILED).
3. **Twilio Segment Webhook**: 
   - The backend exposes a simple `/api/segment/webhook` endpoint. We assume Segment sends an `identify` event containing `traits.name`, `traits.phone`, and `traits.audience`.
   - When a webhook is received, it automatically creates/updates the Audience and Customer records.
4. **Mock SMS API**:
   - Implemented as a service in the backend that uses `setTimeout` to simulate network latency, returning a randomized success rate (90% success) for demonstration purposes.
5. **No Local Node Environment during scaffold**:
   - The codebase was entirely generated. Before running it, ensure you run `npm install` on both backend and frontend.

## Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker (for PostgreSQL)

## Database Setup

1. Start the PostgreSQL database using Docker:
   ```bash
   cd requiement
   docker-compose up -d
   ```
2. The database will be available at `localhost:5432` with username `admin` and password `password`.

## Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd requiement/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the Prisma database schema (creates tables):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run the backend server:
   ```bash
   npm run start:dev
   ```
   The backend will run on `http://localhost:3001`.

## Frontend Setup & Run

1. Navigate to the frontend directory:
   ```bash
   cd requiement/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

## Testing the Segment Webhook

You can simulate a webhook payload from Segment by sending a cURL request to the backend:

```bash
curl -X POST http://localhost:3001/api/segment/webhook \
-H "Content-Type: application/json" \
-d '{
  "type": "identify",
  "userId": "user_123",
  "traits": {
    "name": "John Doe",
    "phone": "+66123456789",
    "audience": "VIP Customers"
  }
}'
```

Refresh the frontend to see the "VIP Customers" audience and trigger an SMS activation!
