# Vehicle Parking Management System Frontend

This is the frontend application for the Vehicle Parking Management System, a web application for managing parking slots, users, vehicles, and bookings.

## Features

- User authentication and authorization
- User dashboard for regular users
- Admin dashboard for managing the system
- Vehicle management
- Parking slot management
- Booking management
- Responsive design

## Tech Stack

- React
- Redux Toolkit for state management
- React Router for routing
- Material-UI (MUI) for UI components
- Axios for API requests
- Formik and Yup for form handling and validation
- TypeScript for type safety

## Installation

1. Clone the repository
2. Navigate to the frontend directory: `cd vehicle-parking-frontend`
3. Install dependencies: `npm install`
4. Configure environment variables:
   - Create a `.env` file in the root directory
   - Set the API base URL: `VITE_API_BASE_URL=http://localhost:3000/api`
5. Run the application:
   - Development mode: `npm run dev`
   - Build for production: `npm run build`
   - Preview production build: `npm run preview`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development

- Run linting: `npm run lint`

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

## Project Structure

```
/vehicle-parking-frontend
  /public            # Static files
  /src
    /app             # Redux store setup
    /assets          # Images, fonts, etc.
    /components      # Reusable UI components
      /auth          # Authentication components
      /common        # Common components
      /layout        # Layout components
    /features        # Feature-specific components and Redux slices
      /admin         # Admin features
      /auth          # Authentication features
      /bookings      # Booking features
      /vehicles      # Vehicle features
    /hooks           # Custom React hooks
    /pages           # Top-level route components
    /services        # API service configurations
    /styles          # Global styles, theme
    /utils           # Helper functions
    App.tsx          # Main App component with routing
    main.tsx         # Entry point
  .env               # Environment variables
  tsconfig.json      # TypeScript configuration
  vite.config.ts     # Vite configuration
  package.json       # Project dependencies
  README.md          # Project documentation
```
