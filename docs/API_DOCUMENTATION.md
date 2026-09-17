# REST API Documentation — Student Management System

Base URL: `http://127.0.0.1:5000/api`

## Endpoints

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|--------------|
| Health check | GET | `/health` | Confirms API is running |
| Create | POST | `/students/` | Create a new student |
| Read All | GET | `/students/` | List all students (`?search=` optional) |
| Read One | GET | `/students/<id>/` | Get a single student |
| Update | PUT / PATCH | `/students/<id>/` | Update a student |
| Delete | DELETE | `/students/<id>/` | Delete a student |

## Request / Response Examples

### Create — POST /api/students/
Request body:
```json
{ "name": "Aditi Sharma", "email": "aditi@example.com", "course": "B.Tech CSE", "age": 20 }
```
Success (201):
```json
{ "id": 1, "name": "Aditi Sharma", "email": "aditi@example.com", "course": "B.Tech CSE", "age": 20 }
```
Validation error (400):
```json
{ "errors": ["Email format is invalid."] }
```
Duplicate email (409):
```json
{ "errors": ["A student with this email already exists."] }
```

### Read All — GET /api/students/
Optional query: `/api/students/?search=cse`
Returns 200 with a JSON array of student objects.

### Read One — GET /api/students/1/
Returns 200 with the student object, or 404:
```json
{ "errors": ["Student not found."] }
```

### Update — PUT /api/students/1/
Request body (all fields) or PATCH with partial fields.
Returns 200 with the updated object, 400 on validation error,
404 if not found, 409 on duplicate email.

### Delete — DELETE /api/students/1/
Returns 200:
```json
{ "message": "Student deleted successfully." }
```

## Postman Test Plan

| # | Test | Steps | Expected Result |
|---|------|-------|------------------|
| 1 | Create valid | POST with all valid fields | 201, record created |
| 2 | Create missing field | POST without `email` | 400, error listed |
| 3 | Create duplicate email | POST with existing email | 409 |
| 4 | Create invalid email | POST with `email: "abc"` | 400 |
| 5 | Read all (empty DB) | GET before any records | 200, `[]` |
| 6 | Read all (populated) | GET after creating records | 200, array of records |
| 7 | Read one valid ID | GET `/students/1/` | 200, record returned |
| 8 | Read one invalid ID | GET `/students/999/` | 404 |
| 9 | Update valid | PUT `/students/1/` with new data | 200, updated record |
| 10 | Update invalid ID | PUT `/students/999/` | 404 |
| 11 | Delete valid ID | DELETE `/students/1/` | 200, success message |
| 12 | Delete invalid ID | DELETE `/students/999/` | 404 |
| 13 | Backend unavailable | Stop server, use frontend | Frontend shows connection error |

Record actual results/screenshots here when executing tests for submission.
