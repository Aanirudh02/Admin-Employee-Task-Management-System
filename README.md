# TaskFlow — Employee Task Management System

## Project Overview

TaskFlow is a full-stack employee task management system built to handle employee onboarding, approvals, and task assignment in a structured way.
The goal of this project is to demonstrate real-world backend development concepts like authentication, file handling, and role-based access control.

---

## Authentication (JWT Based)

This project uses JWT instead of session-based authentication.

* On login, the server creates a token with user id, role, email, and name
* The token is stored in localStorage on the frontend
* Every request sends the token in the Authorization header
* Token expires in 1 day
* Logout is handled by removing the token from localStorage

This makes the system stateless and scalable.

---

## Employee Registration Flow

* Employee fills the registration form

* Frontend validates required fields and password match

* Aadhaar image upload is required

* Request is sent to:
  POST /api/auth/register

* Files are handled using multer in memory

* Images are uploaded to MongoDB GridFS

* Employee is saved with status "pending"

* Admin approval is required before login

---

## File Storage using GridFS

Images are stored using MongoDB GridFS instead of local storage.

* Files are split into chunks and stored in:
  uploads.files (metadata)
  uploads.chunks (binary data)

Upload flow:
File → buffer → GridFS → ObjectId stored in database

Access files:
GET /api/files/:id

* Files are streamed directly from database
* Proper content type is returned
* Long cache is used for faster loading

---

## Admin Functionalities

Employee management:

* View all employees
* Approve or reject employees
* Update salary and holidays
* Delete employees

Task management:

* Assign tasks to employees
* View all tasks

---

## Employee Functionalities

Task actions:

* View assigned tasks
* Update task status

Profile management:

* View profile
* Update phone, address, and department

---

## Email System

Email notifications are implemented using Nodemailer with SMTP.

Emails are sent when:

* Admin approves employee
* Admin rejects employee
* Admin assigns a task
* Employee updates task status

---

## Middleware and Security

* protect middleware verifies JWT and attaches user to request
* adminOnly allows only admin access
* employeeOnly allows only employee access

Employees can only access their own tasks using filtering based on their user id.

---

## Key Highlights

* JWT based authentication
* GridFS file storage
* Role-based access control
* Email notifications
* Clean and scalable backend structure

---

## Conclusion

TaskFlow is a complete backend-focused project that simulates how a company manages employees and tasks.
I used real time updates whenever admin approves/rejects employee for each task
assingment employee is mailed.

I am looking for opportunities where I can contribute and grow as a backend or full-stack developer.
