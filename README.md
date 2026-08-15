# Backend API

This is the NestJS backend for the pharmacy and supplier management platform. It powers authentication-aware business logic, file handling, notifications, analytics, and role-based APIs for admins, suppliers, pharmacists, and customers.

## Overview

The backend provides:
- REST API endpoints under the `/api` prefix
- Firebase integration for authentication and database access
- Static file serving for uploaded content from the `uploads` folder
- Notification and email workflows
- AI/analytics-related endpoints for forecasting and recommendations

## Tech Stack

- NestJS (TypeScript)
- Firebase Admin SDK
- Firebase Firestore / Auth / Storage integration
- Multer for file uploads
- Nodemailer for email delivery
- Schedule support for background jobs
- ESLint and Jest for code quality and testing

## Project Structure

```text
src/
├── admin/            # Admin-specific modules and controllers
├── auth/             # Authentication guards and decorators
├── customer/         # Customer-facing APIs
├── pharmacist/       # Pharmacist workflows and AI features
├── shared/           # Common services, Firebase helpers, mail, search, counters
├── supplier/         # Supplier dashboards and purchase workflows
├── app.module.ts     # Root application module
└── main.ts           # Application bootstrap and CORS config
```

## Prerequisites

Before running the backend, make sure you have:
- Node.js 18+
- npm
- A configured Firebase project
- Required environment variables for API keys and email settings

## Environment Setup

Create a `.env` file in the backend folder with the values needed by your application, such as:

```env
PORT=5000

# Firebase / Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# External services
GROQ_API_KEY=
OPENAI_API_KEY=

# Email configuration
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
```

> The server is configured to run on port `5000` and exposes APIs under the `/api` route prefix.

## Installation

```bash
npm install
```

## Available Scripts

```bash
npm run start        # run the server once
npm run start:dev    # run in watch mode
npm run start:debug  # run with debugging enabled
npm run start:prod   # run built production server
npm run build        # build the project
npm run test         # run unit tests
npm run test:e2e     # run end-to-end tests
npm run test:cov     # run test coverage
npm run lint         # lint the codebase
```

## Running the Server

1. Install dependencies
2. Configure your `.env` file
3. Start the API:

```bash
npm run start:dev
```

4. The backend will be available at:

- `http://localhost:5000`
- API endpoints will be served under `http://localhost:5000/api`

## API Notes

- The app uses a global API prefix of `/api`
- Uploaded assets are served from `/uploads`
- CORS is enabled for local frontend development requests
- Role-based authorization is applied to protected modules

## Development Notes

- Business logic is organized by domain (`admin`, `customer`, `supplier`, `pharmacist`)
- Shared infrastructure services are kept in the `shared` folder
- Firebase access is centralized to avoid repeated setup logic across modules

## Contributor Guidelines

- Keep controllers thin and move logic into services
- Follow NestJS module organization for new features
- Use environment variables for secrets and provider configuration
- Prefer reusable shared services for notifications, Firebase access, and uploads
