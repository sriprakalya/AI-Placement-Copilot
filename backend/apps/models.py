from pydantic import BaseModel


class Student(BaseModel):
    name: str
    email: str
    target_role: str