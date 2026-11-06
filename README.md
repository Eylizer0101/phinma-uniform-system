<div align="center">

# PHINMA Uniform Request Management System

### A Web-Based Uniform Request and Tracking Platform

A platform designed to help students of PHINMA Araullo University submit and monitor uniform requests while providing administrators with tools to manage requests, users, and request status updates.

![Stack](https://img.shields.io/badge/Stack-MERN-2F4F4F?style=flat-square) ![Frontend](https://img.shields.io/badge/Frontend-React_19-087EA4?style=flat-square) ![UI](https://img.shields.io/badge/UI-Material_UI-007FFF?style=flat-square) ![Backend](https://img.shields.io/badge/Backend-Node.js-43853D?style=flat-square) ![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square) ![Project](https://img.shields.io/badge/Project-Academic-2E66A6?style=flat-square)

[Overview](#overview) · [Features](#key-features) · [Technology](#technology-stack) · [Setup](#getting-started) · [Security](#security-notes)

</div>

---

## Overview

**PHINMA Uniform Request Management System** is a MERN-stack web application for managing student uniform requests. Students can choose uniform types relevant to their course, submit requests with the required details, and check their request history and statuses. Authorized administrators can manage requests and user accounts through dedicated endpoints.

The system aims to reduce manual request handling and make uniform request information easier to organize and monitor.

## Key Features

### Student Features

- Register for an account and verify an email address using a one-time verification code (OTP).
- Sign in and manage account access.
- Explore available uniform options according to course or year-level categories supported by the system.
- Submit uniform requests with details such as course, uniform type, gender, size, and preferred date.
- Optionally upload an image for a request, subject to backend upload validation.
- View previously submitted uniform requests and their statuses.
- Open individual request details.
- Edit a request while it is still **pending**.
- Request a password-reset email if account access is lost.

### Administrator Features

- View dashboard statistics and analytics.
- View and manage submitted uniform requests.
- Review request details and update request status.
- Restore or delete requests through the administrative workflow.
- View user records, change user account status, and manage user entries.
- Access administrative endpoints protected by authentication and an admin-role check.

### Additional Capabilities

- Email verification and resend-OTP endpoints.
- Contact form email endpoint.
- Responsive frontend built using React and Material UI.
- Client-server communication using Axios.
- Charting support via Recharts.
- Socket.IO libraries included in the frontend and backend dependencies.

> **Implementation note:** The list reflects features and capabilities evident from the repository's packages and backend routes. The presence of a library does not necessarily mean every possible library feature is implemented.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Material UI, Emotion |
| Styling and interaction | Material UI, Framer Motion |
| API communication | Axios |
| Data visualization | Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Email | Nodemailer, Brevo-related packages |
| Uploads | Multer |
| Realtime dependencies | Socket.IO, Socket.IO Client |
| Local development | npm, Nodemon |

## User Roles and Basic Workflow

**Student:** Create an account → Verify email → Sign in → Select a uniform and enter request details → Submit request → Track its status.

**Administrator:** Sign in with an authorized administrator account → Review dashboard and uniform requests → Inspect request details → Update request statuses → Manage users.

Administrator access requires a server-validated `admin` role. Do not create an administrator by simply changing a role value in an untrusted client request.

## Project Structure

```text
phinma-uniform-system/
├── backend/
│   ├── controllers/        # Business logic, including admin operations
│   ├── middleware/         # Authentication middleware
│   ├── models/             # MongoDB/Mongoose models
│   ├── routes/             # HTTP API endpoints
│   ├── services/           # Supporting services
│   ├── utils/              # Email utilities and helpers
│   ├── server.js           # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/             # Public static assets
│   ├── src/                # React application source
│   └── package.json
└── .gitignore
```

*This is a simplified structure showing the main application folders and confirmed backend modules. Consult the repository for the complete current file tree.*

## Getting Started

### Prerequisites

- Node.js and npm installed
- A MongoDB database (local MongoDB or MongoDB Atlas)
- Git
- Email service credentials for email verification, reset, and contact-form functionality

### 1. Clone the Repository

```bash
git clone https://github.com/Eylizer0101/phinma-uniform-system.git
cd phinma-uniform-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `backend/.env` file for your local development environment:

```dotenv
# Local example; replace these with your own values
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/phinma_uniform
JWT_SECRET=replace_with_a_long_random_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

The variables above are referenced in `backend/server.js` or the authentication route. Additional values may be required by the email service implementation, especially when using Brevo. Check `backend/utils/emailService.js`, `backend/services/brevoEmailService.js`, and your deployment settings for the complete provider-specific configuration.

**Never commit `.env`, API keys, app passwords, or real credentials to GitHub.**

### 4. Start the Backend

For development with Nodemon:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The backend defaults to `http://localhost:5000` when `PORT` is not configured. A successful root request returns a JSON message identifying the Uniform System API.

### 5. Install and Start the Frontend

Open a **separate terminal**, from the repository root:

```bash
cd frontend
npm install
npm start
```

The React development server typically opens at `http://localhost:3000` unless the local port is already occupied or otherwise configured.

Make sure the frontend points to the correct backend URL. Inspect the frontend's API configuration or Axios calls before changing any API base URL.

### 6. Build the Frontend

```bash
cd frontend
npm run build
```

This produces a production build in the frontend's `build/` directory.

## API Overview

The backend mounts the following API route groups in `backend/server.js`:

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, and account recovery |
| `/api/uniform-requests` | Uniform catalog and student requests |
| `/api/users` | User-related operations |
| `/api/admin` | Administrative statistics, requests, and user management |
| `/api/email-verification` | Send, verify, and resend OTP |
| `/api/contact` | Contact-form submission |

Examples of endpoints visible in the routes:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/auth/forgot-password` | Request a password reset |
| `POST` | `/api/auth/reset-password` | Reset a password with a token |
| `GET` | `/api/uniform-requests/uniforms/:course` | View the course-specific uniform list |
| `POST` | `/api/uniform-requests` | Submit a uniform request |
| `GET` | `/api/uniform-requests/my-requests` | View signed-in student's requests |
| `GET` | `/api/admin/dashboard/stats` | Retrieve administrator dashboard statistics |
| `GET` | `/api/admin/analytics` | Retrieve administrative analytics |
| `GET` | `/api/admin/requests` | List uniform requests as administrator |
| `PATCH` | `/api/admin/requests/:id/status` | Change a request status |
| `GET` | `/api/admin/users` | List users as administrator |

Protected routes expect authentication. Consult the route files for complete request bodies, response formats, authorization requirements, and additional endpoints.

## Request Uploads

The request creation endpoint uses Multer to handle an image upload named `image`.

- The backend limits uploaded files to **5 MB**.
- The upload filter checks that the supplied MIME type begins with `image/`.
- Uploaded files are stored in the configured `UPLOAD_DIR` or the default backend uploads directory.

For production deployments, evaluate stronger server-side file validation, access restrictions, and persistent storage. Local upload directories on some hosting platforms may not survive redeployments or restarts.

## Security Notes

The codebase uses JWT-based authentication, password utilities based on bcryptjs, and backend authorization middleware for selected endpoints. Email verification and account-recovery routes are also provided.

Before using the system with real student records, review the implementation of:

- Role assignment during registration (ensure ordinary users cannot self-register as administrators).
- OTP generation, logging, expiry, and rate limiting.
- File type validation beyond user-provided MIME information.
- CORS restrictions and input validation.
- Account recovery, secrets, and email configuration.
- Data protection, user consent, and upload retention policies.

These items are **security review recommendations**, not claims that the current deployment has already passed a security audit.

## Testing

The frontend includes a `test` script:

```bash
cd frontend
npm test
```

Testing should cover account verification, login, uniform request submission, pending-request edits, status updates, administrator authorization, and error handling. No automated test results are claimed in this README.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| MongoDB connection failure | `MONGODB_URI`, database availability, and Atlas network access |
| Login or verification issue | JWT configuration, email credentials, OTP flow, and browser console |
| Frontend cannot reach backend | Backend process, API base URL, port, and CORS settings |
| Email not sent | Provider credentials, app password / API settings, and backend logs |
| Image upload fails | File size, MIME type, upload directory, and filesystem permissions |
| Administrative action returns `403` | The authenticated account's server-side role |

## Deployment Considerations

Deploy the backend on a Node.js-compatible service and the frontend on a static web host or Node-compatible platform. Configure production environment variables securely, point the frontend at the public backend URL, provision MongoDB, and use persistent storage for uploaded files where needed.

Do not publish production credentials or reuse development secrets. Verify that all frontend routes, email links, uploads, and authentication flows work against the deployed API.

## Developer

**Eylizer De Afria**  
Bachelor of Science in Information Technology, major in System Development  
PHINMA Araullo University

- [Portfolio](https://eylizer-portfolio.onrender.com)
- [GitHub](https://github.com/Eylizer0101)
- [LinkedIn](https://www.linkedin.com/in/eylizer-de-afria-040724430)

## License and Usage

**Copyright © 2026 Eylizer De Afria. All rights reserved, subject to the rights of any other contributors.**

This repository is shared for educational, demonstration, and portfolio-review purposes. No repository-wide open-source license is declared here. Viewing the public repository does not, by itself, grant permission to copy, modify, redistribute, or commercially reuse the original project code. For permissions beyond those GitHub's terms or applicable law already allow, contact the relevant copyright holder(s).

Third-party packages and other independently licensed materials remain governed by their own respective licenses. The `ISC` value in `backend/package.json` should not be taken as a clear repository-wide license grant without confirmation from all applicable rights holders.

---

<div align="center">

**PHINMA Uniform Request Management System**

*Project documentation for educational and portfolio presentation.*

</div>
