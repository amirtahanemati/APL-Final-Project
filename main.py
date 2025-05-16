from typing import Annotated, Dict
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, or_, select
from pydantic import validator
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500",
                   "http://127.0.0.1:5500", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Student(SQLModel, table=True):
    STID: str = Field(primary_key=True, unique=True)
    FName: str = Field(index=True)
    LName: str = Field(index=True)
    Father: str
    Birth: str
    IDS: str
    BornCity: str
    Address: str | None = Field(default=None)
    PostalCode: str | None = Field(default=None)
    Cphone: str | None = Field(default=None)
    Hphone: str | None = Field(default=None)
    Department: str
    Major: str
    Married: str
    ID: str = Field(unique=True)

    class Config:
        validate_assignment = True
        extra = "forbid"
        strict = True

    @validator("STID")
    def STID_check(cls, v):
        if not re.fullmatch(r'(4\d{2}|0\d{2})114150\d{2}', v):
            raise ValueError(
                "شماره دانشجویی باید با فرمت صحیح (مثل 40111415001) وارد شود")
        return v

    @validator("FName", "LName", "Father")
    def name_check(cls, v):
        if re.match(r'^[\u0600-\u06FF\s]+$', v):
            return v
        raise ValueError("اسامی باید فقط حروف فارسی داشته باشند")

    @validator("Birth")
    def Birth_check(cls, v):
        try:
            year, month, day = map(int, v.split('/'))
            if not (1300 <= year <= 1400 and 1 <= month <= 12 and 1 <= day <= 31):
                raise ValueError("تاریخ تولد باید بین ۱۳۰۰ تا ۱۴۰۰ باشد")
        except:
            raise ValueError("فرمت تاریخ باید به صورت yyyy/mm/dd باشد")
        return v

    @validator("IDS")
    def IDS_check(cls, v):
        if re.match(r'^\d{6}$', v):
            return v
        raise ValueError("سریال شناسنامه باید 6 رقم باشد")

    @validator("BornCity")
    def city_check(cls, v):
        if v in [
            "تهران", "کرج", "مشهد", "تبریز", "اصفهان", "اهواز", "شیراز", "قم", "کرمانشاه",
            "ارومیه", "رشت", "زاهدان", "کرمان", "ساری", "اراک", "همدان", "بندر عباس", "یاسوج",
            "بوشهر", "سنندج", "خرم آباد", "زنجان", "قزوین", "بجنورد", "گرگان", "اردبیل",
                "ایلام", "شهر کرد", "بیرجند", "یزد", "ماهشهر"]:
            return v
        raise ValueError("شهر تولد معتبر نیست")

    @validator("Address")
    def address_check(cls, v):
        if v and (len(v) > 100 or not re.match(r'^[\u0600-\u06FF\s]*$', v)):
            raise ValueError(
                "آدرس باید حداکثر 100 کاراکتر و فقط حروف فارسی باشد")
        return v

    @validator("PostalCode")
    def PostalCode_check(cls, v):
        if v and not re.match(r'^\d{10}$', v):
            raise ValueError("کد پستی باید 10 رقم باشد")
        return v

    @validator("Cphone")
    def Cphone_check(cls, v):
        if v and not re.match(r'^09\d{9}$', v):
            raise ValueError("تلفن همراه باید با 09 شروع شود و 11 رقم باشد")
        return v

    @validator("Hphone")
    def Hphone_check(cls, v):
        if v and not re.match(r'^0\d{10}$', v):
            raise ValueError("تلفن ثابت باید 11 رقم و با 0 شروع شود")
        return v

    @validator("Department")
    def Department_check(cls, v):
        if v in ["فنی مهندسی", "علوم پایه", "اقتصاد", "دامپزشکی"]:
            return v
        raise ValueError("دانشکده معتبر نیست")

    @validator("Major")
    def Major_check(cls, v):
        if v in ["مهندسی کامپیوتر", "مهندسی مکانیک", "مهندسی برق"]:
            return v
        raise ValueError("رشته تحصیلی معتبر نیست")

    @validator("Married")
    def Married_check(cls, v):
        if v in ["مجرد", "متاهل"]:
            return v
        raise ValueError("وضعیت تاهل معتبر نیست")

    @validator("ID")
    def ID_check(cls, v):
        if re.match(r'^\d{10}$', v):
            return v
        raise ValueError("کد ملی باید 10 رقم باشد")


class Lecturer(SQLModel, table=True):
    LID: str = Field(primary_key=True, unique=True)
    FName: str = Field(index=True)
    LName: str = Field(index=True)
    ID: str = Field(unique=True)
    Department: str
    Major: str
    Birth: str
    BornCity: str
    Address: str | None = Field(default=None)
    PostalCode: str | None = Field(default=None)
    Cphone: str | None = Field(default=None)
    Hphone: str | None = Field(default=None)

    class Config:
        validate_assignment = True
        extra = "forbid"
        strict = True

    @validator("LID")
    def LID_check(cls, v):
        if not re.match(r'^\d{6}$', v):
            raise ValueError("کد استادی باید 6 رقم باشد")
        return v

    @validator("FName", "LName")
    def name_check(cls, v):
        if re.match(r'^[\u0600-\u06FF\s]+$', v):
            return v
        raise ValueError("اسامی باید فقط حروف فارسی داشته باشند")

    @validator("ID")
    def ID_check(cls, v):
        if re.match(r'^\d{10}$', v):
            return v
        raise ValueError("کد ملی باید 10 رقم باشد")

    @validator("Department")
    def Department_check(cls, v):
        if v in ["فنی مهندسی", "علوم پایه", "اقتصاد", "دامپزشکی"]:
            return v
        raise ValueError("دانشکده معتبر نیست")

    @validator("Major")
    def Major_check(cls, v):
        if v in ["مهندسی کامپیوتر", "مهندسی مکانیک", "مهندسی برق"]:
            return v
        raise ValueError("رشته تحصیلی معتبر نیست")

    @validator("Birth")
    def Birth_check(cls, v):
        try:
            year, month, day = map(int, v.split('/'))
            if not (1300 <= year <= 1400 and 1 <= month <= 12 and 1 <= day <= 31):
                raise ValueError("تاریخ تولد باید بین ۱۳۰۰ تا ۱۴۰۰ باشد")
        except:
            raise ValueError("فرمت تاریخ باید به صورت yyyy/mm/dd باشد")
        return v

    @validator("BornCity")
    def city_check(cls, v):
        if v in [
            "تهران", "کرج", "مشهد", "تبریز", "اصفهان", "اهواز", "شیراز", "قم", "کرمانشاه",
            "ارومیه", "رشت", "زاهدان", "کرمان", "ساری", "اراک", "همدان", "بندر عباس", "یاسوج",
            "بوشهر", "سنندج", "خرم آباد", "زنجان", "قزوین", "بجنورد", "گرگان", "اردبیل",
                "ایلام", "شهر کرد", "بیرجند", "یزد", "ماهشهر"]:
            return v
        raise ValueError("شهر تولد معتبر نیست")

    @validator("Address")
    def address_check(cls, v):
        if v and (len(v) > 100 or not re.match(r'^[\u0600-\u06FF\s]*$', v)):
            raise ValueError(
                "آدرس باید حداکثر 100 کاراکتر و فقط حروف فارسی باشد")
        return v

    @validator("PostalCode")
    def PostalCode_check(cls, v):
        if v and not re.match(r'^\d{10}$', v):
            raise ValueError("کد پستی باید 10 رقم باشد")
        return v

    @validator("Cphone")
    def Cphone_check(cls, v):
        if v and not re.match(r'^09\d{9}$', v):
            raise ValueError("تلفن همراه باید با 09 شروع شود و 11 رقم باشد")
        return v

    @validator("Hphone")
    def Hphone_check(cls, v):
        if v and not re.match(r'^0\d{10}$', v):
            raise ValueError("تلفن ثابت باید 11 رقم و با 0 شروع شود")
        return v


class Course(SQLModel, table=True):
    CID: str = Field(primary_key=True)
    Cname: str = Field(index=True)
    Department: str
    Credit: str

    class Config:
        validate_assignment = True
        extra = "forbid"
        strict = True

    @validator("CID")
    def CID_check(cls, v):
        if re.match(r'^\d{5}$', v):
            return v
        raise ValueError("کد درس باید 5 رقم باشد")

    @validator("Cname")
    def Cname_check(cls, v):
        if re.match(r'^[\u0600-\u06FF\s]{1,25}$', v):
            return v
        raise ValueError(
            "نام درس باید بین 1 تا 25 کاراکتر و فقط حروف فارسی باشد")

    @validator("Department")
    def Department_check(cls, v):
        if v in ["فنی مهندسی", "علوم پایه", "اقتصاد", "دامپزشکی"]:
            return v
        raise ValueError("دانشکده معتبر نیست")

    @validator("Credit")
    def Credit_check(cls, v):
        if v in ["1", "2", "3", "4"]:
            return v
        raise ValueError("تعداد واحد باید بین 1 تا 4 باشد")


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def broader_search(search: str, fields: list, query):
    if search:
        search = f"%{search}%"
        conditions = [field.ilike(search) for field in fields]
        query = query.filter(or_(*conditions))
    return query


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Endpointهای اصلاح‌شده


@app.post("/students/")
def create_student(student: Student, session: SessionDep) -> Student:
    try:
        session.add(student)
        session.commit()
        session.refresh(student)
        return student
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/students/")
def read_students(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
    search: str = None
) -> Dict:
    query = select(Student)
    if search:
        query = query.filter(
            (Student.FName.ilike(f"%{search}%")) |
            (Student.LName.ilike(f"%{search}%")) |
            (Student.STID.ilike(f"%{search}%")) |
            (Student.ID.ilike(f"%{search}%"))
        )
    result = session.exec(query.offset(offset).limit(limit))
    students = result.all()
    total = session.exec(query).all()
    return {"students": students, "total": len(total)}


@app.get("/students/{student_id}")
def read_student(student_id: str, session: SessionDep) -> Student:
    student = session.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="دانشجو پیدا نشد")
    return student


@app.put("/students/{student_id}")
def update_student(student_id: str, student: Student, session: SessionDep) -> Student:
    db_student = session.get(Student, student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="دانشجو پیدا نشد")
    student_data = student.dict()
    for key, value in student_data.items():
        setattr(db_student, key, value)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student


@app.delete("/students/{student_id}")
def delete_student(student_id: str, session: SessionDep):
    student = session.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="دانشجو پیدا نشد")
    session.delete(student)
    session.commit()
    return {"ok": True}


@app.post("/lecturers/")
def create_lecturer(lecturer: Lecturer, session: SessionDep) -> Lecturer:
    try:
        session.add(lecturer)
        session.commit()
        session.refresh(lecturer)
        return lecturer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/lecturers/")
def read_lecturers(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
    search: str = None
) -> Dict:
    query = select(Lecturer)
    if search:
        query = query.filter(
            (Lecturer.FName.ilike(f"%{search}%")) |
            (Lecturer.LName.ilike(f"%{search}%")) |
            (Lecturer.LID.ilike(f"%{search}%")) |
            (Lecturer.ID.ilike(f"%{search}%"))
        )
    result = session.exec(query.offset(offset).limit(limit))
    lecturers = result.all()
    total = session.exec(query).all()
    return {"lecturers": lecturers, "total": len(total)}


@app.get("/lecturers/{lecturer_id}")
def read_lecturer(lecturer_id: str, session: SessionDep) -> Lecturer:
    lecturer = session.get(Lecturer, lecturer_id)
    if lecturer is None:
        raise HTTPException(status_code=404, detail="استاد پیدا نشد")
    return lecturer


@app.put("/lecturers/{lecturer_id}")
def update_lecturer(lecturer_id: str, lecturer: Lecturer, session: SessionDep) -> Lecturer:
    db_lecturer = session.get(Lecturer, lecturer_id)
    if db_lecturer is None:
        raise HTTPException(status_code=404, detail="استاد پیدا نشد")
    lecturer_data = lecturer.dict()
    for key, value in lecturer_data.items():
        setattr(db_lecturer, key, value)
    session.add(db_lecturer)
    session.commit()
    session.refresh(db_lecturer)
    return db_lecturer


@app.delete("/lecturers/{lecturer_id}")
def delete_lecturer(lecturer_id: str, session: SessionDep):
    lecturer = session.get(Lecturer, lecturer_id)
    if lecturer is None:
        raise HTTPException(status_code=404, detail="استاد پیدا نشد")
    session.delete(lecturer)
    session.commit()
    return {"ok": True}


@app.post("/courses/")
def create_course(course: Course, session: SessionDep) -> Course:
    existing = session.get(Course, course.CID)
    if existing:
        raise HTTPException(
            status_code=400, detail="درسی با این کد قبلاً ثبت شده است")
    try:
        session.add(course)
        session.commit()
        session.refresh(course)
        return course
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/courses/")
def read_courses(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
    search: str = None
) -> Dict:
    query = select(Course)
    if search:
        query = query.filter(
            (Course.Cname.ilike(f"%{search}%")) |
            (Course.CID.ilike(f"%{search}%"))
        )
    result = session.exec(query.offset(offset).limit(limit))
    courses = result.all()
    total = session.exec(query).all()
    return {"courses": courses, "total": len(total)}


@app.get("/courses/{course_id}")
def read_course(course_id: str, session: SessionDep) -> Course:
    course = session.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="درس پیدا نشد")
    return course


@app.put("/courses/{course_id}")
def update_course(course_id: str, course: Course, session: SessionDep) -> Course:
    db_course = session.get(Course, course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="درس پیدا نشد")
    course_data = course.dict()
    for key, value in course_data.items():
        setattr(db_course, key, value)
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course


@app.delete("/courses/{course_id}")
def delete_course(course_id: str, session: SessionDep):
    course = session.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="درس پیدا نشد")
    session.delete(course)
    session.commit()
    return {"ok": True}
