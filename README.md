# README - Advanced Programming Languages (APL) Project

## Introduction
In the name of God...  
Hello, my name is Amir Taha Nemati, and you’re reading the README file for my Advanced Programming Languages (APL) project. This project was created as part of my university course. It’s a simple web application I built to practice what I learned during the semester.

## Technologies Used
- **Backend**: Python with FastAPI
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Other Tools**: Docker and containers

## Project Overview
The project is a basic full-stack web application. It includes a backend API, a frontend user interface, and a database to store data. I used Docker to run the services in containers.  
My GitHub profile: [amirtaha nemati](https://github.com/amirtaha-nemati)

## Project Tasks and Report
This section outlines the steps I followed during the development and deployment of the project:

1. **Database Design**: Created three main tables (Student, Lecturer, and Course) using SQLModel in an SQLite database.
2. **CRUD Operations with FastAPI**: Implemented Create, Read, Update, and Delete operations for each table using FastAPI.
3. **Object-Oriented Design with Inheritance**: Defined a base class called `Human`, with `Student` and `Lecturer` classes inheriting from it.
4. **Error Handling**: Used Python exceptions and FastAPI error responses to manage potential errors.
5. **Dockerization**: Created `Dockerfile` and `docker-compose.yml` to containerize the backend, frontend, and database.
6. **GitHub Repository**: Pushed all project files from my IDE to a GitHub repository.
7. **Virtual Server Setup**: Rented a Linux-based VPS and installed necessary software (Docker, Git, Python, etc.).
8. **Nginx Configuration**: Configured Nginx as a reverse proxy to serve the web application.
9. **Domain Setup**: Purchased an `.ir` domain from IRNIC and linked it to the server IP using Cloudflare.
10. **Running Containers on Server**: Ran Docker containers on the VPS to make APIs publicly available.
11. **Web Interface**: Built simple HTML pages for CRUD operations.
12. **Public API Access**: Provided API documentation at `http://amirtahanemati.ir/docs`.

## 1. Database Design
- **Tables**: Created three tables (`Student`, `Lecturer`, `Course`) using SQLModel with SQLite.
- **Setup Code**: Defined the database connection and table creation logic:
  ```python
  from sqlmodel import SQLModel, create_engine, Session
  from typing import Annotated
  from fastapi import Depends

  sqlite_file_name = "database.db"
  sqlite_url = f"sqlite:///{sqlite_file_name}"
  connect_args = {"check_same_thread": False}
  engine = create_engine(sqlite_url, connect_args=connect_args)

  def create_db_and_tables():
      SQLModel.metadata.create_all(engine)

  def get_session():
      with Session(engine) as session:
          yield session

  SessionDep = Annotated[Session, Depends(get_session)]

  @app.on_event("startup")
  def on_startup():
      create_db_and_tables()
  ```
- **Details**: The code sets up an SQLite database connection. The `create_db_and_tables` function creates tables based on models, called automatically on app startup via FastAPI’s startup event.

## 2. CRUD Operations with FastAPI
- **Implementation**: Built CRUD operations for `Student`, `Lecturer`, and `Course` tables using FastAPI.
- **Sample Code** (for `Student` table):
  ```python
  from fastapi import FastAPI, Depends, HTTPException
  from sqlmodel import Session
  from typing import Annotated

  app = FastAPI()

  @app.post("/students/")
  def create_student(student: Student, session: SessionDep) -> Student:
      session.add(student)
      session.commit()
      session.refresh(student)
      return student

  @app.get("/students/{student_id}")
  def read_student(student_id: str, session: SessionDep) -> Student:
      student = session.get(Student, student_id)
      if not student:
          raise HTTPException(status_code=404, detail="Student not found")
      return student

  @app.put("/students/{student_id}")
  def update_student(student_id: str, student: Student, session: SessionDep) -> Student:
      db_student = session.get(Student, student_id)
      if not db_student:
          raise HTTPException(status_code=404, detail="Student not found")
      student_data = student.dict(exclude_unset=True)
      for key, value in student_data.items():
          setattr(db_student, key, value)
      session.add(db_student)
      session.commit()
      session.refresh(db_student)
      return db_student

  @app.delete("/students/{student_id}")
  def delete_student(student_id: str, session: SessionDep):
      student = session.get(Student, student_id)
      if not student:
          raise HTTPException(status_code=404, detail="Student not found")
      session.delete(student)
      session.commit()
      return {"message": "Student deleted successfully"}
  ```
- **Details**:
  - **Create**: Adds a new student to the database.
  - **Read**: Retrieves a student’s info by ID.
  - **Update**: Updates a student’s info.
  - **Delete**: Removes a student from the database.
  - Similar operations were implemented for `Lecturer` and `Course` tables.
  - `SessionDep` manages the SQLite database connection.

## 3. Object-Oriented Design with Inheritance
- **Structure**: Defined a `Human` base class with common attributes, inherited by `Student` and `Lecturer` classes.
- **Sample Code**:
  ```python
  from sqlmodel import SQLModel, Field
  from pydantic import validator
  import re

  class Human(SQLModel):
      FName: str = Field(index=True)
      LName: str = Field(index=True)
      ID: str = Field(unique=True)
      Birth: str
      BornCity: str
      Address: str | None = Field(default=None)
      PostalCode: str | None = Field(default=None)
      Cphone: str | None = Field(default=None)
      Hphone: str | None = Field(default=None)

      @validator("FName", "LName")
      def name_check(cls, v):
          if re.match("^[\u0600-\u06FF\s]+$", v):
              return v
          raise ValueError("First and last names must contain only Persian characters")

  class Student(Human, SQLModel, table=True):
      STID: str = Field(unique=True)

  class Lecturer(Human, SQLModel, table=True):
      LID: str = Field(unique=True)
  ```
- **Details**:
  - **Human Base Class**: Includes attributes like first name, last name, ID, birth date, city of birth, address, postal code, mobile phone, and home phone.
  - **Inheritance**: `Student` and `Lecturer` inherit from `Human`, each with unique attributes (`STID` for students, `LID` for lecturers).
  - **Validation**: Uses `@validator` to ensure names contain only Persian characters.
  - **SQLModel**: Defines database models and integrates with SQLite.

## 4. Error Handling
- **Approach**: Used Python exceptions and FastAPI error responses to keep the app stable.
- **Sample Code** (name validation):
  ```python
  from pydantic import validator
  import re

  @validator("FName", "LName")
  def name_check(cls, v):
      if re.match("^[\u0600-\u06FF\s]+$", v):
          return v
      raise ValueError("First and last names must contain only Persian characters")
  ```
- **Details**:
  - Validates that first and last names in the `Human` class contain only Persian characters, raising a `ValueError` if invalid.
  - For CRUD operations, FastAPI returns HTTP errors (e.g., 404 for "Student not found").
  - Other errors, like database issues or invalid inputs, are handled with Python exceptions for reliability.

## 5. Dockerization
- **Dockerfile**: Created for the backend using `python:3.13.0-slim`. Sets `/app` as the working directory, installs dependencies, and runs `uvicorn` on `0.0.0.0:8000`:
  ```dockerfile
  FROM python:3.13.0-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY .
  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- **docker-compose.yml**: Defines two services:
  - **backend**: Builds the backend image, maps port `8000:8000`, mounts `database.db`, and enables auto-restart.
  - **frontend**: Uses `nginx:alpine`, maps port `80:80`, mounts frontend files (`index.html`, `styles.css`, `script.js`) and Nginx config, depends on backend.
  ```yaml
  version: '3.8'
  services:
      backend:
          build: .
          ports:
              - "8000:8000"
          volumes:
              - ./database.db:/app/database.db
          restart: unless-stopped
      frontend:
          image: nginx:alpine
          ports:
              - "80:80"
          volumes:
              - ./index.html:/usr/share/nginx/html/index.html
              - ./styles.css:/usr/share/nginx/html/styles.css
              - ./script.js:/usr/share/nginx/html/script.js
              - ./nginx.conf:/etc/nginx/conf.d/default.conf
          depends_on:
              - backend
          restart: unless-stopped
  ```
- **requirements.txt**: Lists dependencies:
  ```
  fastapi
  uvicorn
  sqlmodel
  pydantic
  ```
- **Purpose**: Containerization ensures consistent execution across environments, simplifying deployment.

## 6. GitHub Repository
- **Setup**: Initialized a local repository in `APL_Final_Project` with:
  ```bash
  git init
  ```
- **Configuration**: Set line-ending handling:
  ```bash
  git config --global core.autocrlf true
  ```
- **Staging and Commit**: Staged files and committed:
  ```bash
  git add .
  git commit -m "Initial commit"
  ```
- **Push**: Pushed to GitHub’s main branch:
  ```bash
  git push -u origin main
  ```
- **Verification**: Checked remote connection:
  ```bash
  git remote -v
  ```
- **Purpose**: Uploaded all code to GitHub for backup and sharing.

## 7. Virtual Server Setup
- **Server**: Rented a Ubuntu-based VPS.
- **Access**: Connected via SSH:
  ```bash
  ssh username@51.68.183.216
  ```
- **Software Installation**: Updated repositories and installed tools:
  ```bash
  sudo apt update
  sudo apt upgrade -y
  sudo apt install -y docker.io docker-compose git python3 python3-pip
  ```
- **Docker Activation**: Started and enabled Docker:
  ```bash
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
- **Purpose**: Prepared the server to host the project publicly.

## 8. Nginx Configuration
- **Config File**: Created `nginx.conf` to listen on port 80 for `amirtahanemati.ir` and `www.amirtahanemati.ir`:
  ```nginx
  server {
      listen 80;
      server_name amirtahanemati.ir www.amirtahanemati.ir;
      location / {
          root /usr/share/nginx/html;
          try_files $uri /index.html;
      }
      location /api/ {
          proxy_pass http://backend:8000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```
- **Details**:
  - **Root Path**: Serves static files from `/usr/share/nginx/html`, redirecting to `index.html` if not found.
  - **API Path**: Proxies requests to the backend at `http://backend:8000` with proper headers.
- **Purpose**: Nginx acts as a reverse proxy to serve the web interface and APIs.

## 9. Domain Setup
- **Purchase**: Bought `amirtahanemati.ir` from IRNIC (`nic.ir`).
- **Registration**: Created an account on `nic.ir`, registered the domain, and provided ownership details.
- **Cloudflare**: Linked the domain to Cloudflare, configured DNS servers, and added the server IP (`51.**.***.***`) as an A Record.
- **DNS**: Set records to point `amirtahanemati.ir` and `www.amirtahanemati.ir` to the server IP.
- **Purpose**: Made the web app and APIs publicly accessible via the domain.

## 10. Running Containers on Server
- **File Upload**: Uploaded project files to `/var/www/amirtahanemati` using FileZilla.
- **Directory Access**: Navigated to the directory via SSH:
  ```bash
  cd /var/www/amirtahanemati
  ```
- **Repository Update**: Optionally updated code from GitHub:
  ```bash
  git pull
  ```
- **docker-compose**: Ran containers:
  ```bash
  sudo docker-compose up -d
  ```
- **Verification**: Checked containers:
  ```bash
  docker ps
  ```
- **Access**: APIs available at `http://amirtahanemati.ir/api/`, web interface at `http://amirtahanemati.ir`.
- **Purpose**: Ensured the app and APIs were deployed and accessible.

## 11. Web Interface
- **HTML**: Built simple HTML pages for CRUD operations with input forms and buttons.
- **CSS**: Used `styles.css` for a fixed header, minimal forms with smooth borders, and a blue-white color scheme.
- **JavaScript**: `script.js` handles API requests and displays results (e.g., success messages).
- **Layout**: Single-column design with prominent buttons and neat input fields.
- **Purpose**: Provides a user-friendly way to interact with APIs via a browser.

## 12. Public API Access
- **Documentation**: Available at `http://amirtahanemati.ir/docs` using Swagger UI.
- **Endpoints**: Accessible via `/api/` (e.g., `http://amirtahanemati.ir/api/students/`).
- **Access**: Users can send HTTP requests (GET, POST, PUT, DELETE) using tools like Postman.
- **Security**: Requests are proxied via Nginx, with clear error messages (e.g., 404).
- **Purpose**: APIs are publicly accessible for CRUD operations.

## Closing Note
Thanks for reading this README to the end! 😊 I hope this project gives you a good sense of my work. Best of luck! 🚀
