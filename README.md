# Burger House — Restaurant Backend API

A full-featured REST API for a burger restaurant, built with NestJS and TypeScript. Covers the complete ordering experience: browsing the menu, managing a cart, placing orders, dine-in QR table sessions, and real-time order status updates via Socket.IO.

Includes a Postman collection and a k6 load test report.

## Features

- **Menu management** — Categories and items with image uploads via Cloudinary.
- **Cart system** — Add, update, and clear cart items per user session.
- **Order management** — Place and track orders with a full status lifecycle.
- **Dine-in / QR table tokens** — Each table gets a signed token (generated via `npm run gen:tt`). Customers scan a QR code to start a table session without logging in.
- **Real-time updates** — Socket.IO gateway broadcasts order status changes to connected clients.
- **Auth** — JWT authentication + Google OAuth 2.0 (`passport-google-oauth20`).
- **User reviews** — Customers can leave and view ratings and reviews.
- **Structured logging** — Production-grade request logging with Pino, including automatic redaction of sensitive fields (passwords, tokens, cookies).
- **Swagger API docs** — Auto-generated at `/api`.
- **Load tested** — k6 smoke and load test suite included, with a PDF report (`BurgerHouse_k6_Test_Report.pdf`) committed to the repo.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (Node.js) |
| Language | TypeScript 5 |
| Database | SQLite (via TypeORM) |
| Auth | JWT + Google OAuth 2.0 |
| Real-time | Socket.IO (`@nestjs/websockets`) |
| File storage | Cloudinary |
| Logging | Pino + pino-pretty (`nestjs-pino`) |
| Validation | `class-validator` + `class-transformer` |
| Config validation | Joi |
| API docs | Swagger (`@nestjs/swagger`) |
| Load testing | k6 |

## Project Structure

```
src/
├── auth/           # JWT + Google OAuth strategies and guards
├── cart/           # Cart CRUD per user
├── categories/     # Menu categories
├── config/         # Environment config with Joi validation
├── decorators/     # Custom param and role decorators
├── dinein/         # Dine-in session management with QR table tokens
├── entities/       # Shared TypeORM entity base
├── guards/         # Auth and role guards
├── interceptors/   # Response transform interceptors
├── item/           # Menu item CRUD with image upload
├── media/          # Cloudinary upload service
├── menu/           # Full menu view (categories + items)
├── middlewares/    # Request middleware
├── orders/         # Order placement and tracking
├── review/         # Customer reviews and ratings
├── strategies/     # Passport JWT + Google strategies
└── users/          # User management
k6/                          # k6 load test scripts
scripts/                     # Table token generator
burgerhouse-next-master/     # Next.js frontend
```

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional — for Google login)

### Installation

```bash
git clone https://github.com/kiarash-f/burgerhouse-nest.git
cd burgerhouse-nest
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
NODE_ENV=development
PORT=3000

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

DB_TYPE=sqlite
DB_DATABASE=burgerhouse.sqlite
DB_SYNCHRONIZE=true
```

### Running the Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

- API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api`

### Generate Table Tokens (Dine-in)

```bash
npm run gen:tt
```

### Running Tests

```bash
npm run test
npm run test:cov
```

### Load Testing

```bash
# Smoke test
npm run k6:smoke

# Full load test
npm run k6:load
```

A pre-run PDF report (`BurgerHouse_k6_Test_Report.pdf`) is included in the root of the repo.

## API Collection

A complete Postman collection (`Burger House API (NestJS).postman_collection.json`) is included in the root of the repo. Import it into Postman to explore and test all endpoints.

## License

UNLICENSED — private project.
