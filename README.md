# Multi-Tenant Project Management API

A backend REST API that models a real-world **multi-tenant project management system** — similar to tools like Jira or Linear — where multiple organisations each maintain their own isolated projects, tasks, and team members with strict role-based access control.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [Role-Based Access Control](#-role-based-access-control)
- [API Reference](#-api-reference)
  - [User Routes](#user-routes----apiv1users)
  - [Organisation Routes](#organisation-routes----apiv1organisations)
  - [Project Routes](#project-routes----apiv1organisationsorgidprojects)
  - [Task Routes](#task-routes----apiv1organisationsorgidprojectsprojidtasks)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [Error Handling](#-error-handling)
- [Authentication Flow](#-authentication-flow)

---

## 🌐 Overview

This API is built around a **three-tier resource hierarchy**:

```
Organisation
  └── Projects
        └── Tasks
```

Every user belongs to one or more organisations and can hold different roles at each level of this hierarchy. The system uses a dedicated **Relationship model** to track user-to-resource associations and their corresponding roles, making access control flexible and context-aware.

---

## 🛠️ Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Runtime          | Node.js (ES Modules)          |
| Framework        | Express.js v5                 |
| Database         | MongoDB                       |
| ODM              | Mongoose v9                   |
| Authentication   | JWT (Access + Refresh Tokens) |
| Password Hashing | bcrypt                        |
| Configuration    | dotenv                        |
| Dev Server       | nodemon                       |

---

## 📁 Project Structure

```
Multi-Tenant-Project-Management-API/
├── backend/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── apiHealth.controller.js
│   │   │   ├── organisation.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── user.controller.js
│   │   ├── db/
│   │   │   └── index.js            # MongoDB connection
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   └── role.middleware.js  # Role-based access control
│   │   ├── models/
│   │   │   ├── organisation.model.js
│   │   │   ├── project.model.js
│   │   │   ├── relationship.model.js
│   │   │   ├── task.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── apiHealth.route.js
│   │   │   ├── organisation.route.js
│   │   │   ├── project.route.js
│   │   │   ├── task.route.js
│   │   │   └── user.route.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── asyncHandler.js
│   │   ├── app.js                  # Express app setup
│   │   └── index.js                # Entry point
│   ├── .env
│   ├── .gitignore
│   └── package.json
└── README.md
```

---

## 🗂️ Data Models

### User

| Field          | Type   | Notes                         |
| -------------- | ------ | ----------------------------- |
| `username`     | String | Required, unique              |
| `email`        | String | Required, unique              |
| `password`     | String | Required, bcrypt hashed       |
| `refreshToken` | String | Stored for session management |

### Organisation

| Field  | Type   | Notes    |
| ------ | ------ | -------- |
| `name` | String | Required |

### Project

| Field          | Type     | Notes                       |
| -------------- | -------- | --------------------------- |
| `name`         | String   | Required                    |
| `organisation` | ObjectId | Reference to `Organisation` |

### Task

| Field      | Type     | Notes                  |
| ---------- | -------- | ---------------------- |
| `title`    | String   | Required               |
| `project`  | ObjectId | Reference to `Project` |
| `complete` | Boolean  | Defaults to `false`    |

### Relationship _(core of multi-tenancy)_

| Field          | Type     | Notes                                           |
| -------------- | -------- | ----------------------------------------------- |
| `user`         | ObjectId | Reference to `User`                             |
| `organisation` | ObjectId | Reference to `Organisation`                     |
| `project`      | ObjectId | Reference to `Project` (optional)               |
| `task`         | ObjectId | Reference to `Task` (optional)                  |
| `role`         | String   | Defaults to `"member"` (see RBAC section below) |

> The `Relationship` model is the backbone of the multi-tenant design. Rather than embedding roles on users or resources, every association is stored as its own document — making it easy to query, update, or remove a user's access without touching other models.

---

## 🔐 Role-Based Access Control

Every protected route is guarded by two middlewares applied in sequence:

1. **`verifyJWT`** — Validates the Bearer token and attaches `req.user`
2. **`verifyRole(...roles)`** — Checks the user's role in the `Relationship` collection for the relevant resource

### Available Roles

| Role                   | Scope & Permissions                                         |
| ---------------------- | ----------------------------------------------------------- |
| `owner`                | System-wide super admin; can view all org managers          |
| `organisation manager` | Can manage their organisation, its members, and projects    |
| `project manager`      | Can manage tasks within their project and assign developers |
| `developer`            | Can toggle completion status on their assigned tasks        |
| `member`               | Default role assigned when a user joins an organisation     |

---

## 📡 API Reference

### Base URL

```
http://localhost:<PORT>/api/v1
```

---

### User Routes — `/api/v1/users`

| Method   | Endpoint                  | Auth Required | Role Required          | Description                      |
| -------- | ------------------------- | ------------- | ---------------------- | -------------------------------- |
| `POST`   | `/register-user`          | ❌            | —                      | Register a new user              |
| `POST`   | `/login`                  | ❌            | —                      | Login and receive tokens         |
| `POST`   | `/logout`                 | ✅            | —                      | Logout and invalidate tokens     |
| `PATCH`  | `/update-user`            | ✅            | —                      | Update own username or email     |
| `DELETE` | `/delete-user`            | ✅            | —                      | Delete own account               |
| `POST`   | `/join-organisation`      | ✅            | —                      | Join an organisation as a member |
| `PATCH`  | `/leave-organisation`     | ✅            | —                      | Leave a joined organisation      |
| `PATCH`  | `/:userId/assign-project` | ✅            | `organisation manager` | Assign a user to a project       |
| `PATCH`  | `/:userId/assign-task`    | ✅            | `project manager`      | Assign a user to a task          |

---

### Organisation Routes — `/api/v1/organisations`

| Method   | Endpoint                              | Auth Required | Role Required          | Description                                         |
| -------- | ------------------------------------- | ------------- | ---------------------- | --------------------------------------------------- |
| `POST`   | `/create-organisation`                | ✅            | —                      | Create a new organisation (creator becomes manager) |
| `PATCH`  | `/:orgId`                             | ✅            | `organisation manager` | Update organisation details                         |
| `DELETE` | `/:orgId`                             | ✅            | `organisation manager` | Delete an organisation                              |
| `GET`    | `/get-all-organisations`              | ✅            | —                      | List all organisations the user belongs to          |
| `GET`    | `/:orgId/users`                       | ✅            | `organisation manager` | List all members of an organisation                 |
| `GET`    | `/get-all-organisation-managers`      | ✅            | `owner`                | List all organisation managers (admin only)         |
| `PATCH`  | `/:orgId/demote-organisation-manager` | ✅            | `owner`                | Demote an organisation manager to member            |

---

### Project Routes — `/api/v1/organisations/:orgId/projects`

| Method   | Endpoint                          | Auth Required | Role Required          | Description                          |
| -------- | --------------------------------- | ------------- | ---------------------- | ------------------------------------ |
| `POST`   | `/create-project`                 | ✅            | `organisation owner`   | Create a new project within an org   |
| `GET`    | `/`                               | ✅            | `organisation owner`   | List all projects in an organisation |
| `PATCH`  | `/:projId`                        | ✅            | `project owner`        | Update a project's details           |
| `DELETE` | `/:projId`                        | ✅            | `project owner`        | Delete a project                     |
| `GET`    | `/:projId/users`                  | ✅            | `project manager`      | List all users in a project          |
| `GET`    | `/get-all-project-managers`       | ✅            | `organisation manager` | List all project managers in the org |
| `PATCH`  | `/:projId/demote-project-manager` | ✅            | `organisation manager` | Demote a project manager to member   |

---

### Task Routes — `/api/v1/organisations/:orgId/projects/:projId/tasks`

| Method   | Endpoint                   | Auth Required | Role Required     | Description                               |
| -------- | -------------------------- | ------------- | ----------------- | ----------------------------------------- |
| `POST`   | `/create-task`             | ✅            | `project manager` | Create a new task within a project        |
| `PATCH`  | `/:taskId`                 | ✅            | `project manager` | Update a task's details                   |
| `DELETE` | `/:taskId`                 | ✅            | `project manager` | Delete a task                             |
| `PATCH`  | `/:taskId/toggle-complete` | ✅            | `developer`       | Mark a task as complete or incomplete     |
| `GET`    | `/get-all-tasks`           | ✅            | `project manager` | List all tasks in a project               |
| `GET`    | `/get-all-developers`      | ✅            | `project manager` | List all developers assigned to a project |
| `GET`    | `/get-all-users`           | ✅            | `project manager` | List all users available in the project   |
| `PATCH`  | `/:taskId/users/:userId`   | ✅            | `project manager` | Demote a developer from a task            |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/Multi-Tenant-Project-Management-API.git
   cd Multi-Tenant-Project-Management-API/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/project-management
NODE_ENV=development

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

### Running the Server

```bash
# Development (with nodemon hot-reload)
npm run dev
```

The server will start at `http://localhost:8000`.

You can verify the API is healthy by visiting:

```
GET http://localhost:8000/
```

---

## ⚠️ Error Handling

All errors are handled by a **centralised global error handler** in `app.js`. Every error response follows a consistent JSON structure:

```json
{
  "success": false,
  "statusCode": 400,
  "errorMessage": "Resource not found, invalid parameter",
  "errors": [],
  "stack": "..." // only in development mode
}
```

The global handler automatically detects and formats the following Mongoose/Express error types:

| Error Type              | HTTP Status | Description                            |
| ----------------------- | ----------- | -------------------------------------- |
| `CastError`             | `400`       | Invalid MongoDB ObjectId in parameters |
| Duplicate Key (`11000`) | `409`       | Unique field constraint violated       |
| `ValidationError`       | `400`       | Mongoose schema validation failure     |
| Generic errors          | `500`       | Internal server error (fallback)       |

---

## 🔑 Authentication Flow

This API uses a **dual-token authentication strategy**:

1. On **login**, the server issues:
   - A short-lived **Access Token** (e.g., `1d`) — sent in the response body and as an HTTP-only cookie
   - A long-lived **Refresh Token** (e.g., `7d`) — stored in the database and set as an HTTP-only cookie

2. Protected routes require the Access Token as a **Bearer Token** in the `Authorization` header:

   ```
   Authorization: Bearer <access_token>
   ```

3. On **logout**, both tokens are cleared from the database and cookies are invalidated.

---

## 📄 License

This project is open source and available under the [ISC License](https://opensource.org/licenses/ISC).
