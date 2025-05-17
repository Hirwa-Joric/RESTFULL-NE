# Vehicle Parking Management System

A comprehensive web application for managing vehicle parking slots, users, and bookings. The system includes both a RESTful backend API and a React-based frontend.

## Project Structure

This project is organized as a monorepo containing both frontend and backend code:

```
/
  /backend             # Node.js/Express backend
  /vehicle-parking-frontend  # React/TypeScript frontend
```

## Backend

The backend is a RESTful API built with Node.js, Express, and PostgreSQL.

### Features

- User authentication and authorization (JWT)
- User management (registration, approval, etc.)
- Vehicle management
- Parking slot management
- Booking management
- Swagger API documentation

### Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT for authentication
- Swagger for API documentation

### Installation

See the [backend README.md](./backend/README.md) for detailed installation and usage instructions.

## Frontend

The frontend is a responsive web application built with React and TypeScript.

### Features

- User authentication and authorization
- User dashboard for regular users
- Admin dashboard for managing the system
- Vehicle management
- Parking slot management
- Booking management
- Responsive design

### Tech Stack

- React
- Redux Toolkit for state management
- React Router for routing
- Material-UI (MUI) for UI components
- Axios for API requests
- Formik and Yup for form handling and validation
- TypeScript for type safety

### Installation

See the [frontend README.md](./vehicle-parking-frontend/README.md) for detailed installation and usage instructions.

## Running the Full Application

### Using Docker

The easiest way to run the full application is with Docker:

1. Clone the repository
2. Navigate to the root directory
3. Run the following command:

```
cd backend && docker-compose up
```

This will start both the backend API and a PostgreSQL database in containers.

4. In a separate terminal, start the frontend:

```
cd vehicle-parking-frontend && npm run dev
```

### Without Docker

To run without Docker:

1. Set up and start the backend:
   ```
   cd backend
   npm install
   npm run dev
   ```

2. In a separate terminal, set up and start the frontend:
   ```
   cd vehicle-parking-frontend
   npm install
   npm run dev
   ```

## Default Admin User

Upon first startup, the backend will create a default admin user:

- Email: admin@parkingsystem.com
- Password: admin123

Use these credentials to log in and manage the system.

## User Roles

The application has two main user roles:

### Regular User (Vehicle Owner)
- Register and manage personal profile
- Add and manage vehicles
- Request parking slots
- View and manage bookings

### Admin
- Approve user registrations
- Manage users
- Manage parking slots
- Approve parking requests
- View system statistics 