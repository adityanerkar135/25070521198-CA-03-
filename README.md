# CineBook - Movie Ticket Booking System (Full-Stack)

A full-stack web app where users browse movies, pick a date, showtime and seats, and book tickets.
All data (users, movies, bookings) is stored in **MongoDB**.

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React.js (Vite), React Router, HTML, CSS, JS |
| Backend   | Node.js + Express.js (REST API)              |
| Database  | MongoDB (view with MongoDB Compass)          |
| Auth      | JWT + bcrypt password hashing                |

## Features
- Register / Login (JWT authentication)
- Browse movies, search by title, filter by genre (queried from MongoDB)
- Movie details with date + showtime selection
- Interactive seat map (8 rows x 10 seats); already booked seats are blocked
- Double-booking protection on the server
- My Bookings page with cancel option (cancelled seats become available again)
- Admin API to add / edit / delete movies

## Project structure
```
cinebook/
├── backend/
│   ├── config/db.js          MongoDB connection
│   ├── models/               User, Movie, Booking (Mongoose schemas)
│   ├── middleware/auth.js    JWT protect + adminOnly
│   ├── routes/               auth, movies, bookings
│   ├── seed.js               sample movies + admin user
│   ├── server.js             Express entry point
│   └── .env                  PORT, MONGO_URI, JWT_SECRET
└── frontend/
    ├── index.html
    ├── vite.config.js        dev proxy: /api -> http://localhost:5000
    └── src/
        ├── api.js            fetch wrapper
        ├── context/AuthContext.jsx
        ├── components/       Navbar, MovieCard, ProtectedRoute
        └── pages/            Home, MovieDetails, Login, Register, MyBookings
```

## Prerequisites
1. **Node.js** (v18 or newer) - https://nodejs.org  (check: `node -v`, `npm -v`)
2. **MongoDB Community Server** - https://www.mongodb.com/try/download/community
   (install it with "Run as a Service" ticked) and **MongoDB Compass** (installed along with it)
3. **VS Code** - https://code.visualstudio.com

## How to run
1. Open VS Code -> **File > Open Folder...** -> select the `cinebook` folder.
2. Open the terminal: **Terminal > New Terminal** (shortcut Ctrl + `).
3. Make sure MongoDB is running (Windows: it runs as a service; or open Compass and connect to `mongodb://localhost:27017`).

### Backend (terminal 1)
```bash
cd backend
npm install
npm run seed      # adds sample movies + admin user (run once)
npm run dev       # starts API on http://localhost:5000
```
You should see: `MongoDB connected` and `CineBook API running on http://localhost:5000`.

### Frontend (terminal 2 - click the "+" in the terminal panel)
```bash
cd frontend
npm install
npm run dev       # starts React on http://localhost:5173
```
Open **http://localhost:5173** in your browser.

### See the data in MongoDB Compass
Connect to `mongodb://localhost:27017` -> database **cinebook** -> collections `movies`, `users`, `bookings`.

## Demo accounts
- Admin: `admin@cinebook.com` / `admin123` (created by the seed script)
- Normal user: register on the Sign up page.

## API reference
| Method | Endpoint                 | Access  | Description                          |
|--------|--------------------------|---------|--------------------------------------|
| POST   | /api/auth/register       | Public  | Create account                       |
| POST   | /api/auth/login          | Public  | Login, returns JWT                   |
| GET    | /api/auth/me             | User    | Current user                         |
| GET    | /api/movies              | Public  | List movies (`?search=&genre=`)      |
| GET    | /api/movies/:id          | Public  | Movie details                        |
| POST   | /api/movies              | Admin   | Add movie                            |
| PUT    | /api/movies/:id          | Admin   | Update movie                         |
| DELETE | /api/movies/:id          | Admin   | Delete movie                         |
| GET    | /api/bookings/seats      | Public  | Booked seats (`movieId,date,showtime`)|
| POST   | /api/bookings            | User    | Book seats                           |
| GET    | /api/bookings/my         | User    | My bookings                          |
| DELETE | /api/bookings/:id        | User    | Cancel booking                       |

Admin requests need the header `Authorization: Bearer <token>`.

## Troubleshooting
- **`MongoDB connection failed`** - MongoDB is not running. Start the "MongoDB Server" service (Windows: Services app) or run `mongod`.
- **Movies don't show / "Is the backend running?"** - start the backend first and make sure you ran `npm run seed`.
- **Port 5000 already in use** - change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
- **MongoDB Atlas instead of local** - paste your Atlas connection string into `MONGO_URI` in `backend/.env`.
- **PowerShell "running scripts is disabled"** - run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` or use the Command Prompt terminal.

## Converting from your frontend-only version
Where the old site used hard-coded movie arrays or `localStorage` for bookings, this version fetches from the API
(`src/api.js`) instead. To reuse your old design, copy your CSS into `frontend/src/index.css` and your markup into the matching page components.
