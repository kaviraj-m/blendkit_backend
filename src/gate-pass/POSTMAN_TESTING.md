# Gate Pass System - Postman Testing Guide

This guide provides step-by-step instructions for testing the Gate Pass API endpoints using Postman. It follows the complete workflow from student request through all approval stages to security verification.

## Setup

1. Import the API collection into Postman
2. Set up environment variables:
   - `baseUrl`: The API base URL (e.g., `http://localhost:3001`)
   - `studentToken`: JWT token for a student user
   - `staffToken`: JWT token for a staff user
   - `hodToken`: JWT token for a HOD user
   - `hostelWardenToken`: JWT token for a Hostel Warden user
   - `academicDirectorToken`: JWT token for the Academic Director
   - `securityToken`: JWT token for a security user

## Authentication

To get authentication tokens, use the login endpoint:

```
POST {{baseUrl}}/api/auth/login
```

With the following body for each role:

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Use different email addresses for each role and save the returned tokens as environment variables.

## Testing Workflow

Follow these steps in sequence to test the complete gate pass flow.

### 1. Student Creates Gate Pass Request

```
POST {{baseUrl}}/api/gate-passes
```

Headers:
```
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

Body:
```json
{
  "type": "home_visit",
  "reason": "Family function",
  "description": "Need to attend my sister's wedding",
  "start_date": "2025-06-10T08:00:00.000Z",
  "end_date": "2025-06-15T18:00:00.000Z"
}
```

Response should be `201 Created` with the created gate pass details. Save the `id` from the response as a `gatePassId` environment variable.

### 2. Student Views Their Gate Pass Requests

```
GET {{baseUrl}}/api/gate-passes/my-requests
```

Headers:
```
Authorization: Bearer {{studentToken}}
```

Response should be `200 OK` with an array of the student's gate pass requests.

### 3. Staff Views Pending Gate Pass Requests

```
GET {{baseUrl}}/api/gate-passes/pending-staff-approval
```

Headers:
```
Authorization: Bearer {{staffToken}}
```

Response should be `200 OK` with an array of gate passes pending staff approval.

### 4. Staff Approves a Gate Pass

```
PATCH {{baseUrl}}/api/gate-passes/{{gatePassId}}/staff-approval
```

Headers:
```
Authorization: Bearer {{staffToken}}
Content-Type: application/json
```

Body:
```json
{
  "status": "approved_by_staff",
  "staff_comment": "Approved. Please make sure to catch up on missed classes."
}
```

Response should be `200 OK` with the updated gate pass details. The status should now be `pending_hod`.

### 5. HOD Views Pending Gate Pass Requests

```
GET {{baseUrl}}/api/gate-passes/pending-hod-approval
```

Headers:
```
Authorization: Bearer {{hodToken}}
```

Response should be `200 OK` with an array of gate passes pending HOD approval.

### 6. HOD Approves a Gate Pass

```
PATCH {{baseUrl}}/api/gate-passes/{{gatePassId}}/hod-approval
```

Headers:
```
Authorization: Bearer {{hodToken}}
Content-Type: application/json
```

Body:
```json
{
  "status": "approved_by_hod",
  "hod_comment": "Approved. Permission granted for 5 days leave."
}
```

Response should be `200 OK` with the updated gate pass details. The status will be either:
- `pending_hostel_warden` (if student is a hosteller)
- `pending_academic_director` (if student is a day scholar)

### 7. Hostel Warden Views Pending Gate Pass Requests (Hostellers Only)

This step is only for hosteller students. Skip to step 9 for day scholars.

```
GET {{baseUrl}}/api/gate-passes/pending-hostel-warden-approval
```

Headers:
```
Authorization: Bearer {{hostelWardenToken}}
```

Response should be `200 OK` with an array of gate passes pending Hostel Warden approval.

### 8. Hostel Warden Approves a Gate Pass (Hostellers Only)

```
PATCH {{baseUrl}}/api/gate-passes/{{gatePassId}}/hostel-warden-approval
```

Headers:
```
Authorization: Bearer {{hostelWardenToken}}
Content-Type: application/json
```

Body:
```json
{
  "status": "approved_by_hostel_warden",
  "hostel_warden_comment": "Approved. Return to hostel by the specified date."
}
```

Response should be `200 OK` with the updated gate pass details. The status should now be `pending_academic_director`.

### 9. Academic Director Views Pending Gate Pass Requests

```
GET {{baseUrl}}/api/gate-passes/pending-academic-director-approval
```

Headers:
```
Authorization: Bearer {{academicDirectorToken}}
```

Response should be `200 OK` with an array of gate passes pending Academic Director approval from all departments.

### 10. Academic Director Approves a Gate Pass

```
PATCH {{baseUrl}}/api/gate-passes/{{gatePassId}}/academic-director-approval
```

Headers:
```
Authorization: Bearer {{academicDirectorToken}}
Content-Type: application/json
```

Body:
```json
{
  "status": "approved",
  "academic_director_comment": "Final approval granted."
}
```

Response should be `200 OK` with the updated gate pass details. The status should now be `approved`.

### 11. Security Views Approved Gate Passes

```
GET {{baseUrl}}/api/gate-passes/for-security-verification
```

Headers:
```
Authorization: Bearer {{securityToken}}
```

Response should be `200 OK` with an array of approved gate passes for the current day.

### 12. Security Marks a Gate Pass as Used

```
PATCH {{baseUrl}}/api/gate-passes/{{gatePassId}}/security-verification
```

Headers:
```
Authorization: Bearer {{securityToken}}
Content-Type: application/json
```

Body:
```json
{
  "status": "used",
  "security_comment": "Student left campus at 9:15 AM"
}
```

Response should be `200 OK` with the updated gate pass details. The status should now be `used` and `checkout_time` should be set.

### 13. View Specific Gate Pass Details

```
GET {{baseUrl}}/api/gate-passes/{{gatePassId}}
```

Headers:
```
Authorization: Bearer {{anyUserToken}}
```

Response should be `200 OK` with the details of the specified gate pass. Access is restricted based on role.

## Testing Rejection Scenarios

You can also test the rejection flow at each step:

### Staff Rejects a Gate Pass

```json
{
  "status": "rejected_by_staff",
  "staff_comment": "Request denied due to upcoming exams."
}
```

### HOD Rejects a Gate Pass

```json
{
  "status": "rejected_by_hod",
  "hod_comment": "Request denied due to department event."
}
```

### Hostel Warden Rejects a Gate Pass

```json
{
  "status": "rejected_by_hostel_warden",
  "hostel_warden_comment": "Request denied due to hostel rules violation."
}
```

### Academic Director Rejects a Gate Pass

```json
{
  "status": "rejected_by_academic_director",
  "academic_director_comment": "Request denied due to college policy."
}
```

## Testing Error Scenarios

Test the following error scenarios:

1. **Invalid Dates**: Create a gate pass with start date after end date
2. **Past Dates**: Create a gate pass with start date in the past
3. **Wrong Department**: Staff tries to approve a gate pass from a different department
4. **Wrong Role**: A student tries to approve a gate pass
5. **Wrong Workflow**: Security tries to verify a gate pass that's not approved yet
6. **Invalid Gate Pass ID**: Try to update a non-existent gate pass

## Automated Testing with Postman Collection Runner

You can automate this workflow using Postman Collection Runner:

1. Organize the requests in the correct order in a collection
2. Add tests to each request to validate the response and set environment variables
3. Run the entire collection to test the full workflow

Example test script for student creating a gate pass:

```javascript
// Check if the request was successful
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Parse the response JSON
var jsonData = pm.response.json();

// Save the gate pass ID for later use
pm.environment.set("gatePassId", jsonData.id);

// Verify the response structure
pm.test("Gate pass created with correct data", function () {
    pm.expect(jsonData.status).to.equal("pending_staff");
    pm.expect(jsonData.type).to.equal(pm.request.body.json.type);
    pm.expect(jsonData.reason).to.equal(pm.request.body.json.reason);
});
```

This guide should help you thoroughly test the Gate Pass API and verify that all the workflow steps function correctly. 