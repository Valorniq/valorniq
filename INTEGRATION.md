# Valorniq Frontend-Backend Integration Guide

## Quick Start

### 1. Start the Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 2. Start the React Frontend

```bash
cd . (root directory)
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (TypeScript)              │
│                  - UI Components (Sidebar, Dashboard)       │
│                  - State Management                         │
│                  - Firebase Auth (transitioning to JWT)     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Routers:                                               ││
│  │ • /api/v1/auth - Authentication & OAuth               ││
│  │ • /api/v1/leads - CRM Leads Management                ││
│  │ • /api/v1/products - Inventory Control                ││
│  │ • /api/v1/customers - Customer Management             ││
│  │ • /api/v1/sales-orders - Sales Orders                 ││
│  │ • /api/v1/organization - App Organization & Folders   ││
│  │ • /api/v1/plans - Plan Management                     ││
│  │ • /api/v1/aris - AI Assistant                         ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ Services:                                              ││
│  │ • AuthService - User management & OAuth               ││
│  │ • AppOrganizationService - Folder & module ordering   ││
│  │ • ARISService - AI analysis & chat                    ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ Models (SQLAlchemy):                                  ││
│  │ • User - User profiles & OAuth links                  ││
│  │ • Lead, Customer, Product, SalesOrder - Business data ││
│  │ • AppOrganization - Custom app structure              ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ Database: SQLite (development) / PostgreSQL (prod)    ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Integration Points

### 1. Authentication Flow

**Current (Temporary):**
- Firebase OAuth for immediate sign-in
- Backend validates user via JWT after registration

**Transition Path:**
1. Register via email/password → Backend creates user with hash
2. OAuth (Google, GitHub, Microsoft, Apple) → Backend creates/links user
3. Receive JWT token → Store in localStorage
4. Include `Authorization: Bearer <token>` in API requests

### 2. Data Synchronization

**Before:** Firebase Firestore → Real-time updates
**After:** Python Backend → REST API → React State

**Example: Fetch Leads**
```typescript
// Frontend (React)
useEffect(() => {
  fetch(`http://localhost:8000/api/v1/leads?user_id=${userId}`)
    .then(res => res.json())
    .then(data => setLeads(data))
}, [userId]);
```

### 3. App Organization

**New Endpoint Stack:**
```
POST   /api/v1/organization/folders        - Create folder
PUT    /api/v1/organization/folders/{id}/rename - Rename folder
DELETE /api/v1/organization/folders/{id}   - Delete folder
POST   /api/v1/organization/modules/move   - Move module to folder
POST   /api/v1/organization/modules/reorder - Reorder modules
POST   /api/v1/organization/modules/{id}/pin - Pin module
```

**Frontend Usage:**
```typescript
// Create a folder
const createFolder = async (name: string) => {
  const res = await fetch('/api/v1/organization/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, icon: 'folder' })
  });
  return res.json();
};

// Move module to folder
const moveModule = async (moduleId: string, folderId: string) => {
  const res = await fetch('/api/v1/organization/modules/move', {
    method: 'POST',
    body: JSON.stringify({
      module_id: moduleId,
      target_folder_id: folderId
    })
  });
  return res.json();
};
```

### 4. ARIS AI Chat

**Frontend sends:**
```typescript
const chatWithARIS = async (message: string) => {
  const response = await fetch('/api/v1/aris/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      include_context: true
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};
```

**Backend analyzes:** Leads, Products, Sales context + your message

## Component Routing

| Route | Component | Backend API | Status |
|-------|-----------|------------|--------|
| `/` (dashboard) | Dashboard | `/api/v1/leads`, `/api/v1/products`, `/api/v1/sales-orders` | ✓ Ready |
| `/crm` | LeadsView | `/api/v1/leads` CRUD | ✓ Ready |
| `/inventory` | InventoryView | `/api/v1/products` CRUD | ✓ Ready |
| `/sales` | SalesView | `/api/v1/sales-orders` CRUD | ✓ Ready |
| `/appstore` | AppStoreView | `/api/v1/plans` | ✓ Ready |
| `/erp` | ERPView | `/api/v1/sales-orders`, `/api/v1/products` | ✓ Ready |
| `/archives` | ArchivesView | `/api/v1/data/export` | ⏳ TODO |
| `/*` (generic) | GenericModuleView | `/api/v1/modules/{id}` | ⏳ TODO |

## Environment Setup

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./valorniq.db
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (vite.config.ts)
```typescript
// Add API base URL
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8000'
  : 'https://api.valorniq.app'
```

## Data Migration Path

### Phase 1: Dual Write (Current)
- Firebase writes still occur
- New backend accepts REST calls
- Both systems synchronized

### Phase 2: Backend Primary (Next)
- Backend is primary data source
- Firebase kept for session/analytics
- Frontend primarily uses REST API

### Phase 3: Firebase Removal (Later)
- Firebase completely removed
- Python backend handles all data
- Optional: Add PostgreSQL for production

## Testing the Integration

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@valorniq.dev","password":"test123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@valorniq.dev","password":"test123"}'
```

### 2. Test Business Data
```bash
# Create lead
curl -X POST "http://localhost:8000/api/v1/leads?user_id=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","status":"new"}'

# List leads
curl "http://localhost:8000/api/v1/leads?user_id=USER_ID"
```

### 3. Test App Organization
```bash
# Get organization
curl "http://localhost:8000/api/v1/organization/?user_id=USER_ID"

# Create folder
curl -X POST "http://localhost:8000/api/v1/organization/folders?user_id=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sales Ops"}'
```

## Known Limitations & TODOs

1. **OAuth Integration**
   - Current: Stub implementation
   - TODO: Implement real Google, GitHub, Microsoft, Apple OAuth
   - Need: OAuth app credentials for each provider

2. **WebSocket Support**
   - Current: REST API polling
   - TODO: Add WebSocket for real-time updates
   - Benefit: Instant data sync across sessions

3. **File Upload**
   - Current: Not implemented
   - TODO: Add file upload endpoints for documents, images

4. **Notifications**
   - Current: None
   - TODO: Add notification system (email, push, in-app)

5. **Analytics**
   - Current: Basic logging
   - TODO: Add comprehensive analytics tracking

6. **API Documentation**
   - Access at: `http://localhost:8000/docs`
   - Automatically generated from FastAPI code

## Production Deployment

### Backend (Python)
```bash
# Install gunicorn for production
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Database Migration
```bash
# From SQLite to PostgreSQL
# 1. Install PostgreSQL
# 2. Create database: createdb valorniq
# 3. Update .env: DATABASE_URL=postgresql://user:pass@localhost/valorniq
# 4. Alembic migrations (TODO: implement)
```

### Frontend (React)
```bash
# Build
npm run build

# Output in dist/
# Deploy to Vercel, Netlify, or your server
```

## Support & Troubleshooting

**Backend won't start:**
- Check port 8000 is available
- Ensure Python 3.9+
- Run `pip install -r requirements.txt`

**API CORS errors:**
- Update `BACKEND_CORS_ORIGINS` in .env
- Include your frontend URL

**Database locked:**
- Remove `.db` file and restart
- Or use different database URL

**UI not updating after API call:**
- Check browser console for errors
- Verify JWT token in localStorage
- Check network tab in DevTools

For more help, check backend README at `backend/README.md`
