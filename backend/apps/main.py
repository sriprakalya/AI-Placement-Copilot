

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apps.models import Student
from apps.database import db
import mysql.connector

app = FastAPI(
    title="AI Placement Copilot API",
    description="Backend API for the AI Placement Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "AI Placement Copilot backend is running"
    }
@app.get("/api/status")
def get_status():
    return {
        "project": "AI Placement Copilot",
        "backend": "FastAPI",
        "status": "ready"
    }




@app.post("/api/students")
def create_student(student: Student):

    cursor = db.cursor()

    query = """
        INSERT INTO students (name, email, target_role)
        VALUES (%s, %s, %s)
    """

    values = (
        student.name,
        student.email,
        student.target_role
    )

    try:
        cursor.execute(query, values)
        db.commit()
    except mysql.connector.IntegrityError:
        raise HTTPException(
            status_code=409,
        detail="This email is already registered."
    )

    student_id = cursor.lastrowid
    cursor.close()
    db.commit()

    return {
        "message": "Student saved successfully!",
        "student_id": student_id
    }

    return {
        "message": "Student saved successfully!",
        "student_id": student_id
    }



@app.get("/api/db-test")
def database_test():
    cursor = db.cursor()
    cursor.execute("SELECT 1")
    result = cursor.fetchone()
    cursor.close()

    return {
        "message": "FastAPI connected to MySQL successfully!",
        "result": result[0]
    }

@app.get("/api/students")
def get_students():
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, email, target_role, created_at FROM students"
    )

    students = cursor.fetchall()
    cursor.close()

    return {
        "count": len(students),
        "students": students
    }