# POS Backend (Express + MongoDB Atlas)

This backend powers the billing page with active orders and menu APIs.

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster connection string

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` with your MongoDB Atlas cluster URI
3. Install packages:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

Server runs on `http://localhost:8000` by default.

## API Endpoints

- `GET /api/health`
- `GET /api/pos/dashboard`
- `GET /api/pos/menu`
- `POST /api/pos/menu`
- `GET /api/pos/orders`
- `GET /api/pos/orders/active`
- `POST /api/pos/orders`
- `PATCH /api/pos/orders/:id`
- `PATCH /api/pos/orders/:id/settle`
- `GET /api/pos/tables`
- `POST /api/pos/tables`
- `PATCH /api/pos/tables/:id/status`
- `PATCH /api/pos/tables/:id/assign`
- `PATCH /api/pos/tables/:id/release`

Compatibility aliases (same handlers):

- `/api/menu`
- `/api/orders`
- `/menu`
- `/orders`

## Notes

- Menu auto-seeds with starter items if collection is empty.
- Order totals and item counts are computed server-side.
