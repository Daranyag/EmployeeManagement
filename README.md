# Full-Stack Employee Management System (Admin + Employee)

A secure, responsive full-stack Employee Management System with JWT and role-based access control (RBAC).

## Technologies Used
- **Frontend**: React (Vite) + Custom Premium Glassmorphic Theme CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT tokens for protected routes, bcrypt password hashing

---

## Getting Started

### 1. Backend Server Setup
From the root project directory:
```bash
cd backend
npm install
npm start
```
*Note: A default admin account is automatically seeded if it does not exist:*
- **Email**: `admin@company.com`
- **Password**: `adminpassword`

### 2. Frontend Setup
From the root project directory in a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## Key Features & Business Rules
1. **Role-Based Access Control**:
   - **Admin** has access to: Dashboard Stats, Employee CRUD directory, Leave request processing, Complaints management desk, and Employee Messaging.
   - **Employee** has access to: Profile management (updates address, emergency contact, phone, photo - *Salary, ID, and Department are locked*), Leave applications, raising Complaints, and messaging the Administrator.
2. **Internal Messaging**:
   - Simple, real-time message log between employees and the administrator.
