# Unified Governance API Documentation

Base URL: `http://localhost:5000/api`

## Authentication
All protected routes require a Bearer token in the `Authorization` header:
`Authorization: Bearer <access_token>`

### 1. Register User
- **POST** `/auth/register`
- **Auth:** None
- **Request Body:**
  ```json
  {
    "email": "user@gov.com",
    "password": "password123",
    "name": "John Doe",
    "role": "Citizen"
  }
Response (201):

JSON
{
  "message": "User registered successfully",
  "userId": "uuid"
}
2. Login
POST /auth/login

Auth: None

Request Body:

JSON
{
  "email": "user@gov.com",
  "password": "password123"
}
Response (200):

JSON
{
  "accessToken": "jwt_token_here",
  "user": { "id": "uuid", "email": "user@gov.com", "role": "Citizen" }
}
Grievances
1. Create Grievance
POST /grievances

Auth: YES

Role: Citizen

Request Body:

JSON
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic slowdown.",
  "category": "Roads",
  "departmentId": "uuid",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Main Street, Block A"
}
Response (201):

JSON
{
  "message": "Grievance created successfully",
  "grievance": { "id": "uuid", "title": "Pothole on Main Street", "status": "SUBMITTED" }
}
2. Get All Grievances
GET /grievances

Auth: YES

Role: Citizen, Department Officer, Department Admin, Super Admin

Response (200):

JSON
{
  "grievances": [
    { "id": "uuid", "title": "Pothole on Main Street", "status": "SUBMITTED" }
  ]
}
3. Update Grievance Status
PATCH /grievances/:id/status

Auth: YES

Role: Department Officer, Department Admin, Super Admin

Request Body:

JSON
{
  "status": "IN_PROGRESS"
}
Response (200):

JSON
{
  "message": "Grievance status updated successfully",
  "grievance": { "id": "uuid", "status": "IN_PROGRESS" }
}
4. Escalate Grievance
POST /grievances/:id/escalate

Auth: YES

Role: Citizen, Department Admin, Super Admin

Response (200):

JSON
{
  "message": "Grievance escalated successfully",
  "grievance": { "id": "uuid", "priority": "CRITICAL" }
}
5. Submit Feedback
POST /grievances/:id/feedback

Auth: YES

Role: Citizen

Request Body:

JSON
{
  "rating": 5,
  "feedback": "Quick and efficient resolution!"
}
Response (200):

JSON
{
  "message": "Feedback submitted successfully",
  "grievance": { "id": "uuid", "rating": 5 }
}