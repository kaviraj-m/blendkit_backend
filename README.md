# Gym Management System Backend

A NestJS-based backend application for college gym management.

## Features

- Student and Gym Staff user roles
- Equipment management (add, update, delete gym equipment)
- Attendance tracking (check-in/out history)
- Body type-based fitness posts
- Gym schedule management (opening/closing times)

## Technologies

- NestJS framework
- TypeORM for database management
- PostgreSQL database
- JWT authentication
- Role-based access control

## Entity Structure

The system uses a unified entity model with all entities in the `src/entities/` directory:
- User-related entities (User, Role, College, Department, etc.)
- Gym-specific entities (Equipment, Attendance, GymPost, GymSchedule, etc.)

## Installation

```bash
# Install dependencies
npm install
```

## Database Setup

1. Set up PostgreSQL database according to .env configuration
2. The application uses TypeORM with synchronize set to true for development (will create tables automatically)

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Seeding the Database

```bash
# Seed the gym management data (roles, etc.)
npm run seed:gym
```

## API Endpoints

### Authentication

- POST /api/auth/login - Log in a user
- POST /api/auth/register - Register a new user

### Equipment Management (Gym Staff Only)

- POST /api/equipment - Create new equipment
- GET /api/equipment - Get all equipment
- GET /api/equipment/:id - Get specific equipment
- PATCH /api/equipment/:id - Update equipment
- DELETE /api/equipment/:id - Delete equipment

### Attendance Tracking

- POST /api/attendance - Create attendance record (Gym Staff only)
- GET /api/attendance - Get all attendance records (Gym Staff & Student)
- GET /api/attendance/:id - Get specific attendance record (Gym Staff & Student)
- PATCH /api/attendance/:id - Update attendance record (check-out) (Gym Staff only)
- DELETE /api/attendance/:id - Delete attendance record (Gym Staff only)
- GET /api/attendance/user/:userId - Get attendance for specific user (Gym Staff & Student)

### Gym Posts

- POST /api/gym-posts - Create a new gym post (Gym Staff only)
- GET /api/gym-posts - Get all gym posts (public)
- GET /api/gym-posts/:id - Get specific gym post (public)
- PATCH /api/gym-posts/:id - Update gym post (Gym Staff only)
- DELETE /api/gym-posts/:id - Delete gym post (Gym Staff only)
- GET /api/gym-posts/body-type/:type - Get posts for specific body type (public)

### Gym Schedule

- POST /api/gym-schedule - Create gym schedule (Gym Staff only)
- GET /api/gym-schedule - Get all gym schedules (public)
- GET /api/gym-schedule/active - Get active gym schedules (public)
- GET /api/gym-schedule/:id - Get specific gym schedule (public)
- PATCH /api/gym-schedule/:id - Update gym schedule (Gym Staff only)
- DELETE /api/gym-schedule/:id - Delete gym schedule (Gym Staff only)
