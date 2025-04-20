# HOD Gate Pass API Endpoints for Postman Testing

This document contains API endpoints for testing the HOD gate pass functionality using Postman.

## Authentication

All requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

You will need to log in as an HOD user to get a valid token with HOD role permissions.

## HOD Specific Endpoints

### 1. Create a new gate pass for HOD

**Endpoint**: POST http://localhost:3001/api/api/gate-passes/hod

**Headers**:
- Content-Type: application/json
- Authorization: Bearer <token>

**Request Body**:
```json
{
  "type": "LEAVE",
  "reason": "Department Meeting",
  "description": "Need to attend a department coordination meeting at main campus",
  "start_date": "2025-05-10T09:00:00.000Z",
  "end_date": "2025-05-10T17:00:00.000Z"
}
```

**Response (201 Created)**:
```json
{
  "id": 123,
  "type": "LEAVE",
  "reason": "Department Meeting",
  "description": "Need to attend a department coordination meeting at main campus",
  "start_date": "2025-05-10T09:00:00.000Z",
  "end_date": "2025-05-10T17:00:00.000Z",
  "status": "PENDING_ACADEMIC_DIRECTOR_FROM_HOD",
  "created_at": "2025-05-01T10:00:00.000Z",
  "updated_at": "2025-05-01T10:00:00.000Z",
  "requester_id": 45,
  "requester_type": "HOD",
  "department_id": 3
}
```

### 2. Get HOD's own gate passes

**Endpoint**: GET http://localhost:3001/api/api/gate-passes/hod/my-passes

**Headers**:
- Authorization: Bearer <token>

**Response (200 OK)**:
```json
[
  {
    "id": 123,
    "type": "LEAVE",
    "reason": "Department Meeting",
    "description": "Need to attend a department coordination meeting at main campus",
    "start_date": "2025-05-10T09:00:00.000Z",
    "end_date": "2025-05-10T17:00:00.000Z",
    "status": "PENDING_ACADEMIC_DIRECTOR_FROM_HOD",
    "created_at": "2025-05-01T10:00:00.000Z",
    "updated_at": "2025-05-01T10:00:00.000Z",
    "requester_id": 45,
    "requester_type": "HOD",
    "department_id": 3
  },
  {
    "id": 124,
    "type": "OFFICIAL",
    "reason": "Conference Attendance",
    "description": "Attending academic conference on innovative teaching methods",
    "start_date": "2025-05-15T08:00:00.000Z",
    "end_date": "2025-05-17T18:00:00.000Z",
    "status": "APPROVED_BY_ACADEMIC_DIRECTOR",
    "created_at": "2025-05-02T14:30:00.000Z",
    "updated_at": "2025-05-03T09:15:00.000Z",
    "requester_id": 45,
    "requester_type": "HOD",
    "department_id": 3,
    "academic_director_comment": "Approved. Please share learnings with faculty upon return."
  }
]
```

### 3. Alternative endpoint for HOD's gate passes (also works)

**Endpoint**: GET http://localhost:3001/api/api/gate-passes/my-requests

**Headers**:
- Authorization: Bearer <token>

**Response**: Same as above, but works for all user types (student, staff, HOD) based on the authenticated user's role.

### 4. Get a specific gate pass by ID

**Endpoint**: GET http://localhost:3001/api/api/gate-passes/123

**Headers**:
- Authorization: Bearer <token>

**Response (200 OK)**:
```json
{
  "id": 123,
  "type": "LEAVE",
  "reason": "Department Meeting",
  "description": "Need to attend a department coordination meeting at main campus",
  "start_date": "2025-05-10T09:00:00.000Z",
  "end_date": "2025-05-10T17:00:00.000Z",
  "status": "PENDING_ACADEMIC_DIRECTOR_FROM_HOD",
  "created_at": "2025-05-01T10:00:00.000Z",
  "updated_at": "2025-05-01T10:00:00.000Z",
  "requester_id": 45,
  "requester_type": "HOD",
  "department_id": 3
}
```

### 5. Get gate passes pending HOD approval (for approving student/staff gate passes)

**Endpoint**: GET http://localhost:3001/api/api/gate-passes/pending-hod-approval

**Headers**:
- Authorization: Bearer <token>

**Response (200 OK)**:
```json
[
  {
    "id": 456,
    "type": "LEAVE",
    "reason": "Medical Appointment",
    "description": "Need to visit doctor for routine checkup",
    "start_date": "2025-05-05T10:00:00.000Z",
    "end_date": "2025-05-05T14:00:00.000Z",
    "status": "PENDING_HOD",
    "created_at": "2025-05-01T09:00:00.000Z",
    "updated_at": "2025-05-01T09:00:00.000Z",
    "requester_id": 78,
    "requester_type": "STAFF",
    "department_id": 3,
    "requester": {
      "id": 78,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
]
```

## Approval Workflow for HOD Gate Passes

The HOD gate passes follow this workflow:

1. HOD creates a gate pass → Status: PENDING_ACADEMIC_DIRECTOR_FROM_HOD
2. Academic Director reviews → Status: APPROVED_BY_ACADEMIC_DIRECTOR or REJECTED_BY_ACADEMIC_DIRECTOR
3. If approved, Security can verify → Status: APPROVED_BY_SECURITY or REJECTED_BY_SECURITY
4. Finally, it can be marked as used → Status: USED

## Common Error Responses

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Invalid Input (400)
```json
{
  "statusCode": 400,
  "message": [
    "type must be a valid enum value",
    "reason should not be empty",
    "start_date must be a valid ISO 8601 date string",
    "end_date must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Gate pass with ID 999 not found",
  "error": "Not Found"
}
```

## Additional HOD Functions

### Update gate pass status by HOD (for approving student/staff gate passes)

**Endpoint**: PATCH http://localhost:3001/api/api/gate-passes/456/hod-approval

**Headers**:
- Content-Type: application/json
- Authorization: Bearer <token>

**Request Body**:
```json
{
  "status": "approved_by_hod",
  "hod_comment": "Approved. Please ensure you return on time."
}
```

**Response (200 OK)**:
```json
{
  "id": 456,
  "status": "APPROVED_BY_HOD",
  "hod_comment": "Approved. Please ensure you return on time.",
  "updated_at": "2025-05-02T11:30:00.000Z"
}
``` 