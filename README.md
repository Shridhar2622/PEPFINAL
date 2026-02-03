# ServicePro - On-Demand Service Platform

A modern, real-time platform for booking on-demand services (Plumbing, Electrical, Cleaning, etc.) with professional technician verification and distance-aware ETAs.

## 🚀 Quick Start

### 1. Prerequisite
- Node.js (v18+)
- MongoDB Atlas Account
- Google OAuth Credentials (optional for Social Login)

### 2. Backend Setup
```bash
cd SHRIDHAR-BACKEND
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd front
npm install
npm run dev
```

## 🏗️ Deployment Guidelines

### Backend (Node.js/Express)
- **Environment**: Set `NODE_ENV=production`.
- **CORS**: Update `ALLOWED_ORIGINS` in `.env` to include your production frontend URL.
- **Port**: The server uses `process.env.PORT` (defaults to 5000).

### Frontend (React/Vite)
- **Environment**: Create a `.env.production` file and set `VITE_API_URL=https://your-api.com/api/v1`.
- **Build**: Run `npm run build` to generate the production-ready `dist` folder.
- **Hosting**: Upload the contents of `dist` to any static hosting service (Netlify, Vercel, S3).

## 🛡️ Admin Dashboard
Access the admin controls at `/admin` (Must be logged in with role `ADMIN`).
- Approve/Reject Technicians
- View Verified Documents (Aadhar, PAN, Resume)
- Manage Users & Services

## 📡 Real-time Features
- WebSocket integration for live status updates.
- Distance-based ETA calculation (Requires User Location Permission).
