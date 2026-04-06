# TaskFlow — Employee Task Management System

## Project Overview

TaskFlow is a full-stack Employee Task Management System designed to manage employee onboarding, approval workflows, and task assignment in a structured and scalable manner.

This project demonstrates practical implementation of backend and full-stack development concepts such as authentication, role-based access control, file handling, and cloud-based storage.

---

## Tech Stack

Frontend: React (Vite)
Backend: Node.js, Express.js
Database: MongoDB Atlas (Cloud)
Authentication: JSON Web Token (JWT)
File Storage: MongoDB GridFS
Email Service: Nodemailer (SMTP)

---

## Authentication

The application uses JWT-based authentication instead of session-based authentication.

* A token is generated during login containing user id, role, email, and name
* The token is stored in localStorage on the client side
* Each request includes the token in the Authorization header
* Token expiration is set to 1 day
* Logout is handled by removing the token from localStorage

This approach ensures a stateless and scalable authentication mechanism.

---

## Session Handling

Session-based authentication is not used in this project.
JWT-based authentication is implemented to follow modern scalable architecture practices.

---

## Employee Registration Flow

* Employee submits the registration form
* Frontend performs validation including required fields and password confirmation
* Aadhaar image upload is mandatory
* Request is sent to the API endpoint:
  POST /api/auth/register
* File uploads are handled using multer with memory storage
* Images are stored in MongoDB using GridFS
* Employee record is created with status set to "pending"
* Admin approval is required before login

---

## File Storage using GridFS

The application uses MongoDB GridFS for storing files instead of local storage.

* Files are split into chunks and stored in:
  uploads.files (metadata)
  uploads.chunks (binary data)

Upload flow:
File → Buffer → GridFS → ObjectId stored in database

File access:
GET /api/files/:id

* Files are streamed directly from the database
* Proper content type is maintained
* Caching is applied for performance optimization

---

## MongoDB Atlas Integration

MongoDB Atlas is used as a cloud database service.

* Enables remote access and scalability
* Supports GridFS for file storage
* Simplifies deployment without local database dependency

---

## Admin Functionalities

Employee Management:

* View all employees
* Approve or reject employee registrations
* Update salary and holidays
* Delete employees

Task Management:

* Assign tasks to employees
* View all tasks

---

## Employee Functionalities

Task Management:

* View assigned tasks
* Update task status

Profile Management:

* View profile details
* Update phone number, address, and department

---

## Email Notification System

Email notifications are implemented using Nodemailer with SMTP.

Emails are triggered when:

* Admin approves an employee
* Admin rejects an employee
* Admin assigns a task
* Employee updates task status

---

## Middleware and Security

* protect middleware verifies JWT and attaches user information to the request
* adminOnly restricts access to admin users
* employeeOnly restricts access to employee users

Employees can only access their own tasks through filtering based on user id.

---

## Real-Time Updates

The system supports near real-time updates for key actions:

* Employee approval or rejection
* Task assignment
* Task status updates

Notifications are delivered via email to ensure timely communication.

---

## Screenshots

Refer to the assets/screenshots folder for application screenshots demonstrating key features and workflows.

---

## Key Highlights

* JWT-based authentication
* Role-based access control
* MongoDB Atlas cloud integration
* GridFS file storage
* Email notification system
* Modular and scalable backend architecture

---

## Conclusion

TaskFlow is a backend-focused project that simulates real-world employee and task management workflows. It demonstrates the ability to design and develop scalable applications using the MERN stack with modern best practices.

This project reflects readiness for a MERN Stack Developer role, with strong understanding of backend systems, API design, authentication, and cloud integration.

---
