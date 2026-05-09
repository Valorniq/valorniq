# Valorniq Backend - FastAPI Python Architecture

## Overview

Valorniq backend is built with **FastAPI**, a modern Python web framework for building APIs. It provides:

- **Authentication** - Email/password registration, OAuth stubs (Google, GitHub, Microsoft, Apple)
- **Business Modules** - CRM (Leads), Inventory (Products), Sales Orders, Customers
- **App Organization** - Custom folders, module reordering, sidebar customization
- **ARIS AI** - Intelligent business analysis and chat interface
- **Plan Management** - Subscription tiers with module-level access control

## Architecture

```
backend/
├── app/
│   ├── core/              # Configuration, database, security
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic validation schemas
│   ├── services/          # Business logic services
│   ├── routers/           # API endpoint definitions
│   └── main.py            # FastAPI application
├── run.py                 # Entry point
├── requirements.txt       # Python dependencies
└── .env.example          # Environment template
```

## Installation & Setup

### 1. Create Python Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Initialize Database

The database is automatically initialized on server startup.

### 5. Run Server

```bash
python run.py
```

Server will start at `http://localhost:8000`

## API Documentation

- **Interactive Docs** - `http://localhost:8000/docs` (Swagger UI)
- **ReDoc** - `http://localhost:8000/redoc` (ReDoc)
- **Health Check** - `http://localhost:8000/health`

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register with email/password
- `POST /login` - Login with email/password
- `POST /oauth/init/{provider}` - Initialize OAuth flow
- `POST /oauth/callback` - Process OAuth callback
- `GET /user/{user_id}` - Get user profile

### Business Modules (`/api/v1`)
- `GET /leads` - List leads
- `POST /leads` - Create lead
- `PUT /leads/{id}` - Update lead
- `DELETE /leads/{id}` - Delete lead
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /sales-orders` - List sales orders
- `POST /sales-orders` - Create sales order

### App Organization (`/api/v1/organization`)
- `GET /` - Get user's app organization
- `PUT /` - Update organization
- `POST /folders` - Create custom folder
- `PUT /folders/{id}/rename` - Rename folder
- `DELETE /folders/{id}` - Delete folder
- `POST /modules/move` - Move module to folder
- `POST /modules/reorder` - Reorder modules
- `POST /modules/{id}/pin` - Pin module
- `POST /modules/{id}/unpin` - Unpin module
- `POST /categories/{cat}/toggle` - Toggle category visibility

### Plans & Billing (`/api/v1/plans`)
- `GET /available` - List all plans
- `GET /modules` - List all modules
- `GET /current` - Get user's current plan
- `POST /upgrade` - Upgrade plan

### ARIS AI (`/api/v1/aris`)
- `POST /analyze` - Get business analysis
- `POST /chat` - Chat with ARIS

## Key Features

### 1. Custom App Organization

Users can:
- Create custom folders to organize modules
- Rename and delete folders
- Move modules between folders
- Reorder modules freely
- Pin frequently-used modules to top
- Toggle category visibility
- Customize sidebar structure

### 2. Real Authentication

- Email/password registration and login
- OAuth provider stubs (extend with real integration)
- JWT token-based authentication
- Password hashing with bcrypt

### 3. ARIS AI Integration

- Stub implementation of Gemini API integration
- Business state analysis and summarization
- Chat interface with business context
- Ready for real Gemini API connection

### 4. Plan-Based Access Control

Three plans with different module access:
- **Free** - Dashboard, CRM, Invoicing, Archives
- **Business** - Free + Inventory, Sales, Finance, ERP
- **Enterprise** - Full access to all modules

### 5. Scalable Database Design

- SQLAlchemy ORM for database abstraction
- SQLite for development (easily switch to PostgreSQL)
- Automatic timestamp tracking
- Foreign key relationships and cascading

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | random-key-change-this |
| `DATABASE_URL` | Database connection string | sqlite:///./valorniq.db |
| `GEMINI_API_KEY` | Google Gemini API key | (empty - stub mode) |
| `BACKEND_HOST` | Server host | 0.0.0.0 |
| `BACKEND_PORT` | Server port | 8000 |
| `BACKEND_CORS_ORIGINS` | CORS allowed origins | localhost:3000,localhost:5173 |

## Integration with Frontend

The React frontend integrates with this backend via API calls. Key integration points:

1. **Authentication** - Token-based with JWT
2. **Data Fetching** - REST API calls to `/api/v1/*` endpoints
3. **Real-time Updates** - Currently poll-based (can add WebSocket)
4. **App Organization** - Frontend queries and updates organization via API

## Next Steps

1. **Real OAuth Integration** - Implement actual Google, GitHub, Microsoft, Apple OAuth
2. **WebSocket Support** - For real-time data updates and notifications
3. **Database Upgrade** - Migrate from SQLite to PostgreSQL for production
4. **Gemini API Integration** - Connect real Gemini API for ARIS AI
5. **Testing** - Add pytest test suite
6. **Deployment** - Docker containerization, cloud deployment

## Troubleshooting

### Database Locked Error
```
Database is locked - another process has it open
```
Solution: Remove the `.db` file and restart the server.

### CORS Errors
Ensure `BACKEND_CORS_ORIGINS` includes your frontend URL.

### Port Already in Use
```bash
# Use different port
python run.py  # Default 8000
# Or set environment variable
export BACKEND_PORT=8001
```

## Testing

```bash
# Run pytest tests
pytest

# With coverage
pytest --cov=app
```

## Support

For issues or questions, check the API documentation at `/docs` or review the code in the `app/` directory.
