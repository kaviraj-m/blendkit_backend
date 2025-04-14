# Gate Pass Management System

This module implements a complete gate pass management system with a multi-level approval workflow.

## Overview

The Gate Pass system allows students to request permission to leave the college campus. The request follows an approval workflow:

1. Student submits gate pass request
2. Staff of the student's department reviews and approves/rejects
3. If approved, HOD (Head of Department) reviews and approves/rejects
4. If approved and student is a **hosteller**, Hostel Warden reviews and approves/rejects
   (Day scholars skip this step)
5. If approved, Academic Director (Principal) reviews and gives final approval/rejection
6. If approved, Security can view and verify the gate pass when student leaves campus

## Roles and Permissions

- **Student**: Can create gate pass requests and view their own requests
- **Staff**: Can view and approve/reject gate pass requests from students in their department
- **HOD**: Can view and approve/reject gate pass requests that have been approved by staff in their department
- **Hostel Warden**: Can view and approve/reject gate pass requests for hosteller students that have been approved by their HOD
- **Academic Director (Principal)**: Can view and give final approval/rejection for gate pass requests from all departments that have been approved by their respective HODs (for day scholars) or Hostel Wardens (for hostellers)
- **Security**: Can view approved gate passes and mark them as used when students leave campus
- **Admin**: Can view all gate passes in the system

## College Structure

The system follows a hierarchical structure:
- The college is headed by the Academic Director (Principal)
- Each department has a Head of Department (HOD)
- Each department has staff members
- Students belong to specific departments
- Students are classified as either day scholars or hostellers
- Hostellers are under the supervision of Hostel Wardens

## Gate Pass Status Flow

A gate pass request goes through the following statuses:

1. `PENDING_STAFF` - Initial status when student creates the request
2. `APPROVED_BY_STAFF` / `REJECTED_BY_STAFF` - After staff review
3. `PENDING_HOD` - If approved by staff
4. `APPROVED_BY_HOD` / `REJECTED_BY_HOD` - After HOD review
5. `PENDING_HOSTEL_WARDEN` - If approved by HOD (hostellers only)
6. `APPROVED_BY_HOSTEL_WARDEN` / `REJECTED_BY_HOSTEL_WARDEN` - After Hostel Warden review (hostellers only)
7. `PENDING_ACADEMIC_DIRECTOR` - If approved by HOD (day scholars) or Hostel Warden (hostellers)
8. `APPROVED` / `REJECTED_BY_ACADEMIC_DIRECTOR` - After Academic Director review
9. `USED` - When Security marks the gate pass as used
10. `EXPIRED` - When the end date has passed

## API Endpoints

### Student Endpoints

- `POST /api/gate-passes` - Create a new gate pass request
  - Body: `{ type, reason, description, start_date, end_date }`
- `GET /api/gate-passes/my-requests` - View all of the student's gate pass requests

### Staff Endpoints

- `GET /api/gate-passes/pending-staff-approval` - View gate passes pending staff approval in their department
- `PATCH /api/gate-passes/:id/staff-approval` - Approve or reject a gate pass
  - Body: `{ status: 'approved_by_staff' | 'rejected_by_staff', staff_comment }`

### HOD Endpoints

- `GET /api/gate-passes/pending-hod-approval` - View gate passes pending HOD approval in their department
- `PATCH /api/gate-passes/:id/hod-approval` - Approve or reject a gate pass
  - Body: `{ status: 'approved_by_hod' | 'rejected_by_hod', hod_comment }`

### Hostel Warden Endpoints

- `GET /api/gate-passes/pending-hostel-warden-approval` - View gate passes pending Hostel Warden approval
- `PATCH /api/gate-passes/:id/hostel-warden-approval` - Approve or reject a gate pass
  - Body: `{ status: 'approved_by_hostel_warden' | 'rejected_by_hostel_warden', hostel_warden_comment }`

### Academic Director (Principal) Endpoints

- `GET /api/gate-passes/pending-academic-director-approval` - View gate passes pending Academic Director approval from all departments
- `PATCH /api/gate-passes/:id/academic-director-approval` - Approve or reject a gate pass
  - Body: `{ status: 'approved' | 'rejected_by_academic_director', academic_director_comment }`

### Security Endpoints

- `GET /api/gate-passes/for-security-verification` - View approved gate passes valid for the current day
- `PATCH /api/gate-passes/:id/security-verification` - Mark a gate pass as used
  - Body: `{ status: 'used', security_comment }`

### Common Endpoints

- `GET /api/gate-passes/:id` - View details of a specific gate pass (access restricted by role)
- `GET /api/gate-passes` - Admin only: View all gate passes with filtering options
  - Query parameters: `status`, `student_id`, `department_id`, `start_date`, `end_date`

## Security API Endpoints

### Get Gate Passes for Security Verification
```
GET /api/gate-passes/for-security-verification
```
Returns gate passes that are approved and need verification by security personnel.

**Role Required:** `security`

**Success Response:**
- Status: 200 OK
- Content: Array of `GatePass` objects with relations to student, department and other entities

### Get Pending Gate Passes for Security
```
GET /api/gate-passes/security-pending
```
Returns all gate passes that have a status starting with 'pending' (case insensitive). This includes statuses like PENDING_STAFF, PENDING_HOD, PENDING_ACADEMIC_DIRECTOR, and PENDING_HOSTEL_WARDEN.

**Role Required:** `security`

**Success Response:**
- Status: 200 OK
- Content: Array of `GatePass` objects with status starting with "pending"

### Get Used Gate Passes for Security
```
GET /api/gate-passes/security-used
```
Returns all gate passes that have been used (verified by security) within the last 7 days.

**Role Required:** `security`

**Success Response:**
- Status: 200 OK
- Content: Array of `GatePass` objects with status "USED" and updated within the last 7 days

## Usage Examples

### Creating a Gate Pass (Student)

```typescript
// Student creating a gate pass request
const createGatePassDto = {
  type: 'home_visit',
  reason: 'Family function',
  description: 'Need to attend my sister\'s wedding',
  start_date: '2023-05-10T08:00:00.000Z',
  end_date: '2023-05-15T18:00:00.000Z'
};

// POST /api/gate-passes
const response = await axios.post('/api/gate-passes', createGatePassDto, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Staff Approval

```typescript
// Staff approving a gate pass
const updateDto = {
  status: 'approved_by_staff',
  staff_comment: 'Approved. Please make sure to catch up on missed classes.'
};

// PATCH /api/gate-passes/123/staff-approval
const response = await axios.patch('/api/gate-passes/123/staff-approval', updateDto, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Security Verification

```typescript
// Security marking a gate pass as used
const updateDto = {
  status: 'used',
  security_comment: 'Student left campus at 9:15 AM'
};

// PATCH /api/gate-passes/123/security-verification
const response = await axios.patch('/api/gate-passes/123/security-verification', updateDto, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Data Model

The `GatePass` entity includes:

- Basic information (type, reason, description)
- Date information (start_date, end_date, created_at, updated_at)
- Status tracking
- Related entities (student, department, staff, HOD, academic director, security)
- Comments from each approver
- Checkout/checkin times

## Error Handling

The API includes comprehensive error handling:

- Role validation to ensure only authorized users can access endpoints
- Status validation to ensure gate passes follow the correct workflow
- Department validation to ensure staff/HOD can only access gate passes from their department
- Date validation to ensure gate passes have valid date ranges

## Future Enhancements

Potential enhancements for future versions:

- Email notifications to students and approvers when status changes
- QR code generation for approved gate passes for easier verification
- Analytics and reporting on gate pass usage
- Integration with attendance system
- Mobile app for Security to scan and verify gate passes 