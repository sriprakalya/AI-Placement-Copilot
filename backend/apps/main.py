
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from apps.models import Student
from apps.database import db
import mysql.connector
import io
from pypdf import PdfReader
from docx import Document


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




@app.post("/api/resume/analyze")
async def analyze_resume(
    name: str = Form(...),
    target_role: str = Form(...),
    resume: UploadFile = File(...)
):

    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )

    if not target_role.strip():
        raise HTTPException(
            status_code=400,
            detail="Target role is required."
        )

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required."
        )

    file_bytes = await resume.read()

    filename = resume.filename.lower()

    try:

        if filename.endswith(".pdf"):

            reader = PdfReader(io.BytesIO(file_bytes))

            resume_text = ""

            for page in reader.pages:
                resume_text += page.extract_text() or ""

        elif filename.endswith(".docx"):

            document = Document(io.BytesIO(file_bytes))

            resume_text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are currently supported."
            )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the resume file."
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the resume."
        )

    text = resume_text.lower()

    skills = [
        "python",
        "java",
        "c",
        "c++",
        "javascript",
        "html",
        "css",
        "mysql",
        "sql",
        "mongodb",
        "git",
        "github",
        "fastapi",
        "react",
        "machine learning",
        "artificial intelligence"
    ]

    detected_skills = [
        skill for skill in skills
        if skill in text
    ]

    return {
        "message": "Resume analyzed successfully!",
        "name": name,
        "target_role": target_role,
        "filename": resume.filename,
        "resume_length": len(resume_text),
        "detected_skills": detected_skills
    }