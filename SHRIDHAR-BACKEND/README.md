# Shridhar Backend API 🛠️

A robust backend for the Shridhar On-Demand Service Application. Built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory (see Environment Variables).
4.  Start the development server:
    ```bash
    npm run dev
    ```

### Environment Variables
Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shridhar
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
ENABLE_PAYMENTS=false # Set true to enforce real gateway
RECAPTCHA_SECRET_KEY=mock-secret # Optional for dev
```

---

## 📚 API Reference

All API routes are prefixed with `/api/v1`.

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user (`role`: 'USER' or 'WORKER') | Public |
| `POST` | `/login` | Login and receive JWT token | Public |
| `POST` | `/logout` | Logout (Clear cookie) | Public |
| `GET` | `/me` | Get current logged-in user details | **Private** |

### 👤 User Management (`/users`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | Get current profile | **Private** |
| `PATCH` | `/update-me` | Update profile (Name, Email, Phone, Location) | **Private** |
| `DELETE` | `/delete-me` | Deactivate account | **Private** |

### 👷 Worker Management (`/workers`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List workers (Filter by skills, rating, online) | Public |
| `GET` | `/:id` | Get worker public profile | Public |
| `POST` | `/profile` | Create worker profile (with photo) | **Worker** |
| `PATCH` | `/profile` | Update worker profile (Skills, Bio, Rates) | **Worker** |
| `POST` | `/documents` | Upload verification docs (Aadhar, PAN) | **Worker** |

### 🛠 Services (`/services`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all services (Search, Filter) | Public |
| `GET` | `/:id` | Get service details | Public |
| `POST` | `/` | Create a new service | **Worker** |
| `PATCH` | `/:id` | Update a service | **Worker** |
| `DELETE` | `/:id` | Delete a service | **Worker/Admin** |

### 📅 Bookings (`/bookings`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a booking | **User** |
| `GET` | `/` | List my bookings (Filter by status) | **Private** |
| `GET` | `/:id` | Get booking details | **Private** |
| `PATCH` | `/:id/status` | Update status (Accept/Reject/InProgress/Complete) | **Worker/User** |
| `GET` | `/stats` | Get Worker Earnings Stats | **Worker** |

### ⭐ Reviews (`/bookings/:id/reviews`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create review for a completed booking | **User** |
| `GET` | `/` | Get reviews for a worker | Public |

### 💳 Payments (`/payments`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/process` | Process payment for a booking | **User** |

### 🔔 Notifications (`/notifications`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get list of notifications | **Private** |
| `PATCH` | `/:id/read` | Mark notification as read | **Private** |

### 🛡 Admin (`/admin`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard-stats` | Get overview stats | **Admin** |
| `GET` | `/users` | List all users | **Admin** |
| `PATCH` | `/users/:id/status` | Enable/Disable user | **Admin** |
| `GET` | `/workers` | List all workers | **Admin** |
| `PATCH` | `/workers/:id/approve` | Approve worker verification | **Admin** |
| `GET` | `/services` | List all services | **Admin** |
| `GET` | `/bookings` | List all bookings globally | **Admin** |
| `PATCH` | `/bookings/:id/cancel` | Force cancel a booking | **Admin** |

## 🧪 Testing
Run verification scripts:
```bash
node test-scripts/test-payment-sim.js
node test-scripts/test-admin-dashboard.js
```
