# Simple Parking Management System

A basic parking management system built with Node.js, Express, PostgreSQL, and React. This simplified project demonstrates a student-made application that manages parking slots and bookings.

## Features

- User authentication (Login/Register)
- Basic vehicle management for users
- Parking slot requests and bookings
- Admin management of users, slots, and bookings
- Simple dashboard for both users and admins

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- JWT Authentication

### Frontend
- React with Material UI
- Redux for state management
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository
2. Configure your database connection in `/backend/.env`
3. Run the start script:

```bash
chmod +x start.sh
./start.sh
```

This will start both backend and frontend servers.

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

## Default Users

The system has two default users:

### Admin
- Email: admin@example.com
- Password: admin123

### Regular User
- Email: user@example.com  
- Password: user123

## Project Structure

```
RESTFULL/
├── backend/                # Node.js + Express backend
│   ├── src/
│   │   ├── app/            # Express application setup
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, validation, error handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── vehicle-parking-frontend/ # React frontend
│   ├── src/
│   │   ├── app/            # App setup and store
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
│   └── package.json
│
└── start.sh                # Start script
``` 