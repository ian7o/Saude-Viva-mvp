# AGENTS.md

## Project

Saude Viva - Clinic Management System (NestJS + React)

---

# Sprint Scope

## Sprint 1 — Core Clinical Management

This sprint must implement EXCLUSIVELY the functionalities below.

### US01 — Medical Calendar

As a doctor, I want to view my calendar so I can keep track of patients and daily appointments.

#### Acceptance Criteria

- Calendar organized by:

  - day;

  - week.

- Each appointment must display:

  - patient name;

  - appointment description;

  - specialty.

- The doctor must only view their own appointments.

#### Story Points

3

---

### US02 — Clinical Document Management

As a doctor, I want to add, view, and download clinical documents to streamline my daily work without depending on paper support.

#### Acceptance Criteria

- It must be possible to upload clinical documents.

- It must be possible to view supported documents directly on the platform.

- It must be possible to download documents.

- If the format does not support viewing, the system must provide download.

#### Story Points

5

---

### US03 — Clinical Document Organization

As a doctor, I want to identify documents with date, location, room, and corresponding patient to ensure better information organization.

#### Acceptance Criteria

Documents must display:

- description;

- room;

- associated patient;

- date.

#### Story Points

2

---

# Base Project Rules

The project already has an extremely basic initial codebase used only as a structural template.

## Mandatory Rules

- Maintain the existing architecture of the base project.

- Reuse the existing folder structure, organization, and patterns.

- Do not unnecessarily refactor the base project.

- Do not create a new architecture.

- Do not add unnecessary complexity.

- The focus is only to deliver Sprint 1 functionality.

---

# Backend Rules

## ORM

- Use exclusively TypeORM.

- DO NOT use Prisma.

- If Prisma exists in the base project:

  - remove dependencies;

  - remove schemas;

  - remove related services/configs;

  - completely replace with TypeORM.

## Mandatory Stack

- NestJS

- TypeORM

- PostgreSQL

- JWT only if it already exists in the base project

## Expected Structure

Create only the modules required for Sprint 1:

- auth (only if it already exists)

- doctors

- appointments

- documents

- patients

---

# Frontend Rules

- Maintain React + Vite.

- Maintain the current frontend structure.

- Do not add complex state managers.

- Use only:

  - React

  - React Router

  - Axios

## Expected Pages

Implement only:

- Login (if it already exists)

- Doctor Dashboard

- Medical Calendar

- Document List

- Document Upload

- Document Viewer

---

# Out of Scope

DO NOT implement:

- chat/messages;

- notifications;

- advanced permissions;

- multi-clinic;

- monitoring;

- advanced administrative features;

- complete user management;

- patient features;

- reports;

- analytical dashboards;

- websockets;

- microservices;

- complex e2e tests.

---

# Database Minimum Scope

## Minimum Entities

### Doctor

- id

- name

- email

### Patient

- id

- name

- birthDate

- identificationNumber

### Appointment

- id

- description

- specialty

- date

- doctor

- patient

### ClinicalDocument

- id

- filename

- description

- room

- location

- uploadDate

- patient

- doctor

- appointment

---

