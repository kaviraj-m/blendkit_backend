# Complaints API

This module implements a direct communication channel between students and the Executive Director through a complaint box system.

## Authentication

All endpoints require JWT authentication. Role-based access control is enforced for each endpoint.

## Endpoints

### Create a Complaint
- **URL**: `POST /api/complaints`
- **Access**: Students only
- **Authentication**: JWT token
- **Request Body**:
  ```json
  {
    "subject": "Complaint subject",
    "message": "Detailed complaint message"
  }
  ```
- **Response**: The created complaint

### Get Complaints
- **URL**: `GET /api/complaints`
- **Access**: 
  - Students: Can only view their own complaints (filtered by JWT token)
  - Executive Director: Can view all complaints
- **Authentication**: JWT token
- **Response**: List of complaints

### Get Complaints by Status
- **URL**: `GET /api/complaints/status/:status`
- **Access**: Executive Director only
- **Authentication**: JWT token
- **Parameters**: `status` - One of: `pending`, `in_progress`, `resolved`, `rejected`
- **Response**: List of complaints with the specified status

### Get a Specific Complaint
- **URL**: `GET /api/complaints/:id`
- **Access**: 
  - Students: Can only view their own complaints (verified by JWT token)
  - Executive Director: Can view any complaint
- **Authentication**: JWT token
- **Parameters**: `id` - Complaint ID
- **Response**: The requested complaint

### Update Complaint Status
- **URL**: `PATCH /api/complaints/:id`
- **Access**: Executive Director only
- **Authentication**: JWT token
- **Parameters**: `id` - Complaint ID
- **Request Body**:
  ```json
  {
    "status": "in_progress", // or "resolved", "rejected"
    "reply": "Response from the Executive Director"
  }
  ```
- **Response**: The updated complaint

## Complaint Status Values
- `pending`: Initial state, awaiting review
- `in_progress`: Being addressed by the Executive Director
- `resolved`: Complaint has been addressed and resolved
- `rejected`: Complaint has been rejected 