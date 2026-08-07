# HoneyNetX Backend

Enterprise-grade cybersecurity honeypot monitoring platform — backend API.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm test` | Run tests |

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Centralized configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Express middleware (error, 404)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic & integrations
│   ├── utils/           # Helpers & utilities
│   ├── logs/            # Application logs
│   ├── app.js           # Express application setup
│   └── server.js        # Entry point
├── .env.example         # Environment variable template
├── package.json
└── README.md
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/honeynetx` | MongoDB connection string |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `LOG_LEVEL` | `dev` | Morgan log format |

## Health Check

```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

## License

ISC
