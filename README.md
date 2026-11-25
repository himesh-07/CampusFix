# CampusFix

A serverless campus maintenance complaint system built on the **AWS Free Tier**. Students report campus problems, maintenance staff manage and resolve them, and students can track progress until the issue is fixed.

The project starts as a simple version you can test yourself, then grows to include authentication, photo uploads, and advanced features.

---
Link : -https://campusfix-tawny.vercel.app/
## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Roadmap](#roadmap)
- [Free Tier Notes](#free-tier-notes)
- [Cleanup](#cleanup)

---

## Features

### Student Dashboard
- Submit a complaint with **building, room, category, and description**
- Receive a unique **complaint ID** and see its current status
- Track whether the complaint has been resolved

### Maintenance Dashboard
- View all complaints in one place
- Update complaint status (e.g. `Open` → `In Progress` → `Resolved`)
- Add resolution notes

### Coming Later
- Student and staff login (Amazon Cognito)
- Complaint photo uploads (Amazon S3)
- Advanced features (notifications, filtering, analytics)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Website frontend |
| Python | Backend logic |
| AWS Lambda | Runs backend functions |
| Amazon API Gateway | Connects frontend to backend |
| Amazon DynamoDB | Stores complaints |
| Amazon Cognito | Student and staff login *(added later)* |
| Amazon S3 | Stores complaint photos *(added later)* |

The initial setup uses the **AWS Management Console**, so no Docker or Linux server is required.

---

## Architecture

```
┌──────────────┐     HTTPS     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ React (Vite) │ ────────────► │ API Gateway     │ ──► │ Lambda       │ ──► │ DynamoDB     │
│ Frontend     │ ◄──────────── │ (REST/HTTP API) │ ◄── │ (Python)     │ ◄── │ Complaints   │
└──────────────┘               └─────────────────┘     └──────────────┘     └──────────────┘
                                                              │
                                              (later)         ├──► Cognito (auth)
                                                              └──► S3 (photos)
```

---

## Project Structure

```
campusfix/
├── backend/
│   ├── create_complaint/
│   │   └── lambda_function.py
│   ├── get_complaints/
│   │   └── lambda_function.py
│   ├── get_complaint/
│   │   └── lambda_function.py
│   └── update_complaint/
│       └── lambda_function.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── MaintenanceDashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

- An [AWS account](https://aws.amazon.com/free/) (Free Tier eligible)
- [Node.js](https://nodejs.org/) 18 or later and npm
- Python 3.12 (the Lambda runtime used in this project)
- A code editor such as VS Code

---

## Getting Started

### 1. Create the DynamoDB table

1. Open the **DynamoDB** console and choose **Create table**.
2. Table name: `CampusFixComplaints`
3. Partition key: `complaintId` (String)
4. Capacity mode: **On-demand** (or provisioned within Free Tier limits)
5. Create the table.

### 2. Create the Lambda functions

Create one Python Lambda function per operation in the AWS Lambda console:

| Function | Purpose |
|---|---|
| `campusfix-create-complaint` | Saves a new complaint |
| `campusfix-get-complaints` | Returns all complaints |
| `campusfix-get-complaint` | Returns a single complaint by ID |
| `campusfix-update-complaint` | Updates status and resolution notes |

For each function:
- Runtime: **Python 3.12**
- Attach an IAM role that allows DynamoDB access (`PutItem`, `GetItem`, `Scan`, `UpdateItem`) on the `CampusFixComplaints` table, plus basic CloudWatch Logs permissions.
- Add the environment variable `TABLE_NAME=CampusFixComplaints`.

### 3. Create the API in API Gateway

1. Create an **HTTP API** (cheaper and simpler than a REST API).
2. Add the routes listed in the [API Reference](#api-reference) and integrate each with its Lambda function.
3. Enable **CORS** so your frontend can call the API (allow your frontend origin, the `Content-Type` header, and the needed methods).
4. Deploy and copy the **Invoke URL**.

### 4. Run the frontend locally

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=https://your-api-id.execute-api.your-region.amazonaws.com
```

Start the dev server:

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 5. Test the flow

1. Open the Student dashboard and submit a complaint.
2. Note the complaint ID returned.
3. Open the Maintenance dashboard, find the complaint, and update its status with a resolution note.
4. Return to the Student dashboard and check that the status has changed.

---

## API Reference

| Method | Route | Description |
|---|---|---|
| `POST` | `/complaints` | Create a new complaint |
| `GET` | `/complaints` | List all complaints |
| `GET` | `/complaints/{id}` | Get one complaint |
| `PUT` | `/complaints/{id}` | Update status / resolution notes |

### Example: create a complaint

**Request**

```http
POST /complaints
Content-Type: application/json

{
  "building": "Science Block",
  "room": "204",
  "category": "Electrical",
  "description": "Ceiling fan is not working."
}
```

**Response**

```json
{
  "complaintId": "a1b2c3d4",
  "status": "Open",
  "message": "Complaint submitted successfully."
}
```

---

## Data Model

**Table:** `CampusFixComplaints`

| Attribute | Type | Description |
|---|---|---|
| `complaintId` | String (partition key) | Unique complaint ID |
| `building` | String | Building name |
| `room` | String | Room number |
| `category` | String | e.g. Electrical, Plumbing, Furniture, Cleaning |
| `description` | String | Details of the problem |
| `status` | String | `Open`, `In Progress`, or `Resolved` |
| `resolutionNotes` | String | Notes added by maintenance staff |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |

---

## Roadmap

- [x] Phase 1: Core complaint submission and tracking
- [x] Phase 1: Maintenance dashboard with status updates and notes
- [ ] Phase 2: Authentication with Amazon Cognito (separate student and staff roles)
- [ ] Phase 3: Photo uploads to Amazon S3 (pre-signed URLs)
- [ ] Phase 4: Advanced features (email notifications, filters, search, analytics)
- [ ] Phase 5: Deploy the frontend (S3 static hosting or AWS Amplify)

---

## Free Tier Notes

AWS Free Tier eligibility and limits depend on your account type and the specific service. To stay safe:

- Use a small serverless architecture (Lambda, API Gateway, DynamoDB) and avoid always-on resources such as EC2 or RDS.
- Set up **AWS Budgets** with a low alert threshold (e.g. $1).
- Check the **Billing and Cost Management** and **Free Tier usage** pages regularly.
- Review current limits on the [AWS Free Tier page](https://aws.amazon.com/free/).

---

## Cleanup

When you are finished experimenting, delete the resources to avoid unexpected charges:

1. Delete the API Gateway API.
2. Delete the Lambda functions and their IAM roles.
3. Delete the DynamoDB table.
4. Delete any S3 buckets and Cognito user pools created in later phases.
5. Delete CloudWatch log groups.

---

## License

This project is for learning purposes. Add a license of your choice (e.g. MIT) before sharing publicly.
