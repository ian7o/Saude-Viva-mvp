# Saúde Viva — Clinic Management System

Simple academic clinic app MVP for managing doctors, patients and a secretary for
appointment management and clinic operations.

> This repository focuses on **sprint organization** and the **rationale behind each
> feature**. The code is secondary — the goal is to demonstrate planning, prioritization,
> and project evolution.
>
> Detailed documentation for each sprint → [`documentation/`](./documentation)

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Backend   | NestJS, TypeORM, PostgreSQL, JWT   |
| Frontend  | React + Vite, React Router, Axios  |
| Infra     | Docker, Nginx                      |

---

## Sprints

### Sprint 1 — Clinical Management Base

**Goal:** Implement the essential features for doctors to manage appointments, clinical
documents, and patient information in a centralized way.

| ID   | User Story | Actor | MoSCoW | SP |
|------|-----------|-------|--------|----|
| US01 | As a doctor, I want to view my calendar to see my patients and daily appointments. | Doctor | Must | 3 |
| US02 | As a doctor, I want to add, view, and download clinical documents. | Doctor | Must | 5 |
| US03 | As a doctor, I want to identify documents by date, location, room, and patient. | Doctor | Must | 2 |

> 👉 Details (agents, acceptance criteria) → [`documentation/SPRINT1.AGENTS.md`](./documentation/SPRINT1.AGENTS.md)

---

### Sprint 2 — Appointments, Patients & Communication

**Goal:** Consolidate the operational core — manage appointments, patients, and
basic internal communication.

| ID     | User Story | Actor | MoSCoW | SP |
|--------|-----------|-------|--------|----|
| US-S2-01 | As a receptionist, I want to schedule appointments to organize patient care. | Receptionist | Must | 5 |
| US-S2-02 | As a doctor, I want to edit appointment information. | Doctor | Must | 3 |
| US-S2-03 | As a receptionist, I want to register basic patient information. | Receptionist | Must | 3 |
| US-S2-04 | As a doctor, I want to view message history. | Doctor | Should | 3 |
| US-S2-05 | As a doctor, I want to communicate with other professionals via private messages. | Doctor / Receptionist | Should | 5 |

> 👉 Details (agents, dependencies, criteria) → [`documentation/SPRINT2.AGENTS`](./documentation/SPRINT2.AGENTS)

---

## Quick Start

```bash
cd backend && npm install
cd ../frontend && npm install
docker-compose up --build
```

## Default Login

- Email: `admin@saudeviva.com`
- Password: `admin123`

## API

| Service  | URL                          |
|----------|------------------------------|
| Backend  | http://localhost:4000/api    |
| Swagger  | http://localhost:4000/api/docs |
| Frontend | http://localhost:3000        |

## Key Commands

```bash
# Backend
npm run check = npm run lint + npm run typecheck
npm run test


# Frontend
npm run check
```

## License

UNLICENSED — academic project.
