# Clarix — Clear Analytics Platform

A full-stack MERN application that allows users to create personalized dashboards by combining various widgets such as Charts, Tables, and KPI cards — all powered by real-time Customer Order data.

![Clarix Dashboard](https://img.shields.io/badge/Clarix-Dashboard%20Builder-6366f1?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## Live Demo

- Frontend: https://clarix-dashboard.vercel.app
- Backend: https://clarix-backend.onrender.com

---

## Features

### Authentication
- Register and login with JWT
- Protected routes
- Persistent sessions via localStorage

### Customer Orders
- Create, edit, delete orders
- 16-field popup form with validation
- Right-click context menu
- Real-time updates via Socket.io
- Search and filter orders
- Summary cards (Total, Completed, Revenue)

### Dashboard Builder
- 7 widget types:
  - Bar Chart, Line Chart, Area Chart
  - Pie Chart, Scatter Plot
  - Table, KPI Card
- Drag and drop layout
- Resize widgets
- Widget settings panel
- Date filter (Today, Last 7/30/90 days)
- Table filter with multiple conditions
- Responsive — Desktop, Tablet, Mobile
- Save and load configuration
- Real-time data binding

---

## Tech Stack

### Frontend
- React 18 + Vite
- Redux Toolkit
- Tailwind CSS
- Framer Motion
- Recharts
- React Grid Layout
- Socket.io Client
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT + bcryptjs

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/arshathdevo/clarix-dashboard.git
cd clarix-dashboard
```

**2. Setup server**
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/clarix_dashboard
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**3. Setup client**
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running

Start backend (from /server):
```bash
npm run dev
```

Start frontend (from /client):
```bash
npm run dev
```

Visit: http://localhost:5173

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Get all orders |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id | Update order |
| DELETE | /api/orders/:id | Delete order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Get dashboard config |
| POST | /api/dashboard | Save dashboard config |

---

## Real-time Events

| Event | Trigger | Effect |
|-------|---------|--------|
| orderCreated | New order added | Updates all widgets instantly |
| orderUpdated | Order edited | Reflects changes in dashboard |
| orderDeleted | Order removed | Removes from all widgets |

---

## Project Structure
```
clarix-dashboard/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Shared components
│   │   │   ├── layout/       # Sidebar, Layout
│   │   │   └── widgets/      # All widget components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   └── orders/       # Orders page
│   │   ├── services/         # Axios API layer
│   │   ├── store/            # Redux slices
│   │   └── utils/            # Utility functions
└── server/                   # Express backend
    ├── config/               # DB config
    ├── controllers/          # Route handlers
    ├── middleware/           # Auth middleware
    ├── models/               # Mongoose schemas
    └── routes/               # API routes
```



## Author

Built with ❤️ by Arshath for Halleyx.

## License

MIT
