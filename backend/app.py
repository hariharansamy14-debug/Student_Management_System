"""
Student Management System - Backend
CRUD REST API built with Flask + SQLAlchemy + SQLite
"""
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)  # allow frontend (different origin) to call this API
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'students.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------
class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    course = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "course": self.course,
            "age": self.age,
        }


with app.app_context():
    db.create_all()


# ---------------------------------------------------------------------------
# Validation helper
# ---------------------------------------------------------------------------
def validate_student(data, partial=False):
    """Returns a list of error strings; empty list means valid."""
    errors = []

    def required(field):
        return field not in data or str(data.get(field)).strip() == ""

    if not partial or "name" in data:
        if required("name"):
            errors.append("Name is required.")
        elif len(str(data["name"]).strip()) < 2:
            errors.append("Name must be at least 2 characters.")

    if not partial or "email" in data:
        if required("email"):
            errors.append("Email is required.")
        elif not EMAIL_REGEX.match(str(data["email"]).strip()):
            errors.append("Email format is invalid.")

    if not partial or "course" in data:
        if required("course"):
            errors.append("Course is required.")

    if not partial or "age" in data:
        if required("age"):
            errors.append("Age is required.")
        else:
            try:
                age_val = int(data["age"])
                if age_val < 16 or age_val > 100:
                    errors.append("Age must be between 16 and 100.")
            except (ValueError, TypeError):
                errors.append("Age must be a number.")

    return errors


# ---------------------------------------------------------------------------
# Routes - CRUD REST API
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/students/", methods=["POST"])
def create_student():
    data = request.get_json(silent=True) or {}
    errors = validate_student(data)
    if errors:
        return jsonify({"errors": errors}), 400

    if Student.query.filter_by(email=data["email"].strip()).first():
        return jsonify({"errors": ["A student with this email already exists."]}), 409

    student = Student(
        name=data["name"].strip(),
        email=data["email"].strip(),
        course=data["course"].strip(),
        age=int(data["age"]),
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201


@app.route("/api/students/", methods=["GET"])
def list_students():
    search = request.args.get("search", "").strip()
    query = Student.query
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(Student.name.ilike(like), Student.course.ilike(like), Student.email.ilike(like))
        )
    students = query.order_by(Student.id.asc()).all()
    return jsonify([s.to_dict() for s in students]), 200


@app.route("/api/students/<int:student_id>/", methods=["GET"])
def get_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"errors": ["Student not found."]}), 404
    return jsonify(student.to_dict()), 200


@app.route("/api/students/<int:student_id>/", methods=["PUT", "PATCH"])
def update_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"errors": ["Student not found."]}), 404

    data = request.get_json(silent=True) or {}
    partial = request.method == "PATCH"
    errors = validate_student(data, partial=partial)
    if errors:
        return jsonify({"errors": errors}), 400

    if "email" in data:
        existing = Student.query.filter(Student.email == data["email"].strip(), Student.id != student_id).first()
        if existing:
            return jsonify({"errors": ["A student with this email already exists."]}), 409
        student.email = data["email"].strip()

    if "name" in data:
        student.name = data["name"].strip()
    if "course" in data:
        student.course = data["course"].strip()
    if "age" in data:
        student.age = int(data["age"])

    db.session.commit()
    return jsonify(student.to_dict()), 200


@app.route("/api/students/<int:student_id>/", methods=["DELETE"])
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"errors": ["Student not found."]}), 404
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted successfully."}), 200


@app.errorhandler(404)
def not_found(e):
    return jsonify({"errors": ["Resource not found."]}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"errors": ["Internal server error."]}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
