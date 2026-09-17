# Student Management System (CRUD Web Application)

A complete CRUD-based mini web application built to satisfy the SOP for
"Complete CRUD-Based Web Application Development."

## 1. Project Overview
Manages student records (Create, Read, Update, Delete) through a REST API
backend and a browser-based frontend.

## 2. Problem Statement
Institutions need a simple way to add, view, search, update, and remove
student records without manual spreadsheets.

## 3. Objectives
- Implement full CRUD operations on a Student entity.
- Provide a REST API with validation and error handling.
- Provide a responsive frontend consuming the API.

## 4. Technology Stack
| Layer     | Technology                     |
|-----------|---------------------------------|
| Frontend  | HTML, CSS, JavaScript (fetch API) |
| Backend   | Python, Flask, Flask-RESTful routes |
| Database  | SQLite (via SQLAlchemy ORM)     |
| API Testing | Postman / curl                |
| Version Control | Git                      |

## 5. System Architecture
```
Browser (HTML/CSS/JS)
        |
        v
   REST API (Flask, JSON)
        |
        v
  SQLAlchemy ORM
        |
        v
   SQLite Database
```

## 6. Database Design (ER Summary)
**Table: students**
| Column | Type    | Constraints          |
|--------|---------|-----------------------|
| id     | Integer | Primary Key, Auto-increment |
| name   | String  | Not Null              |
| email  | String  | Not Null, Unique      |
| course | String  | Not Null              |
| age    | Integer | Not Null              |

## 7. Folder Structure
```
sms/
├── backend/
│   ├── app.py            # Flask app + REST API + models + validation
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docs/
│   └── API_DOCUMENTATION.md
└── README.md
```

## 8. Installation & Execution

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
The API runs at `http://127.0.0.1:5000`. The SQLite database
(`students.db`) is created automatically on first run.

### Frontend
Open `frontend/index.html` directly in a browser, or serve it:
```bash
cd frontend
python -m http.server 8080
```
Then visit `http://127.0.0.1:8080`. Ensure the backend is running first
since the page calls `http://127.0.0.1:5000/api/students/`.

## 9. CRUD Implementation Details
- **Create** — `POST /api/students/` validates and inserts a new record.
- **Read** — `GET /api/students/` lists all records (supports `?search=`);
  `GET /api/students/<id>/` fetches one record.
- **Update** — `PUT`/`PATCH /api/students/<id>/` validates and updates.
- **Delete** — `DELETE /api/students/<id>/` removes a record.

## 10. Validation Rules
- Name: required, minimum 2 characters.
- Email: required, valid format, unique.
- Course: required.
- Age: required, integer between 16 and 100.
- Server-side validation always runs, even though the frontend also
  validates client-side.

## 11. Testing
See `docs/API_DOCUMENTATION.md` for endpoint-by-endpoint test cases
(valid, missing, duplicate, and invalid data) to run in Postman.

## 12. Security Notes
- No credentials are hard-coded.
- Server-side validation is enforced independent of the frontend.
- CORS is explicitly enabled only for the API layer.
- Use environment variables for any real deployment secrets/DB URL.

## 13. Challenges & Solutions
- **CORS between frontend/backend origins** — solved using `flask-cors`.
- **Duplicate email handling** — solved with a uniqueness check before
  insert/update, returning HTTP 409 on conflict.

## 14. Future Enhancements
- Add authentication (JWT) for protected operations.
- Add pagination for large record sets.
- Add role-based access control (Admin/Student).
- Migrate to PostgreSQL/MySQL for production.

## 15. Completion Checklist
- [x] Application starts without errors.
- [x] Database connection works.
- [x] Create, Read, Update, Delete operations work.
- [x] Server-side and client-side validation implemented.
- [x] Search/filter implemented.
- [x] REST API documented and testable in Postman.
