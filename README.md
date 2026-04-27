# Sunce Solars — ERP System

A comprehensive Enterprise Resource Planning system for solar inverter service management. Built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

## 🏗️ Architecture

```
ERP System/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/     # Role-based dashboards (Admin, Sales, Service, Customer)
│   │   ├── contexts/  # Auth & Theme providers
│   │   ├── layouts/   # Role-specific layouts with sidebars
│   │   └── components/# Shared UI components
│   └── ...
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & role guards
│   │   └── utils/        # Helpers (ticket IDs, round-robin, etc.)
│   └── scripts/          # Admin setup & migration scripts
└── ...
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone & Install

```bash
git clone <repo-url>
cd ERP-System

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secrets

# Frontend (optional for local dev)
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your API runs on a different URL
```

### 3. Create Admin User

```bash
cd backend
npm run create-admin
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 4500)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

### 5. Production Build

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production
cd backend && npm start
```

## 👥 Roles & Modules

| Role | Dashboard | Key Features |
|------|-----------|-------------|
| **Customer** | `/dashboard` | View tickets, billing, raise complaints, AMC status |
| **Sales** | `/sales` | Ticket creation, warranty tool, logistics, status tracking, financial overview |
| **Engineer / Service** | `/service` | Job cards, diagnosis, repair, testing, dispatch, service reports |
| **Admin** | `/admin` | Dashboard overview, master tickets, user management, financial oversight, system logs |

## 🔑 Key Features

- **Ticket Lifecycle**: Full workflow from creation → pickup → diagnosis → repair → dispatch → delivery → completion
- **Round-Robin Assignment**: Automatic sales rep assignment for new tickets
- **AMC Contracts**: Annual Maintenance Contracts with automated preventive maintenance
- **Billing & Invoicing**: GST-compliant billing with AMC coverage handling
- **Warranty Tracking**: Warranty verification integrated into ticket workflow
- **Role-Based Access**: Strict permission boundaries between Sales, Engineering, and Admin
- **SLA Tracking**: Priority-based SLA deadlines with breach monitoring
- **Real-Time Status**: Live polling and status updates across dashboards

## 🔒 Security

- JWT-based authentication with refresh token rotation
- HTTP-only secure cookies
- Helmet.js security headers
- Rate limiting on auth endpoints
- NoSQL injection sanitization
- Role-based middleware guards

## 📝 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required configuration.

## 📄 License

ISC
